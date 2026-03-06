import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cubie } from './Cubie'
import { MOVES, applyMove } from '../utils/cubeLogic'
import * as THREE from 'three'

const ANIMATION_DURATION = 250 // ms

export function Cube({ cubies, onMove, onMoveComplete, checkDuringSolve, currentAnimation, isAnimating }) {
  const groupRef = useRef()
  const rotatingGroupRef = useRef()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [dragFace, setDragFace] = useState(null)
  const [dragCubie, setDragCubie] = useState(null)
  const [animState, setAnimState] = useState(null) // { axis, layerValue, targetAngle, startTime }
  const animStateRef = useRef(null) // Track animation state without causing re-renders
  const { camera, gl } = useThree()

  // Handle animation frame
  useFrame(() => {
    if (!animState || !rotatingGroupRef.current) return

    const elapsed = performance.now() - animState.startTime
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

    // Easing function (ease-out cubic)
    const eased = 1 - Math.pow(1 - progress, 3)

    const currentAngle = animState.targetAngle * eased

    // Apply rotation to the group
    const axisVec = new THREE.Vector3(
      animState.axis === 'x' ? 1 : 0,
      animState.axis === 'y' ? 1 : 0,
      animState.axis === 'z' ? 1 : 0
    )
    rotatingGroupRef.current.rotation.set(0, 0, 0)
    rotatingGroupRef.current.rotateOnWorldAxis(axisVec, THREE.MathUtils.degToRad(currentAngle))

    // Animation complete
    if (progress >= 1) {
      const move = animStateRef.current.move
      // Apply the move to cubies data
      const updatedCubies = applyMove(cubies, move)
      // Clear animation state
      rotatingGroupRef.current.rotation.set(0, 0, 0)
      setAnimState(null)
      animStateRef.current = null
      // Notify parent to update state (pass the move that was just completed)
      if (onMoveComplete) {
        onMoveComplete(updatedCubies, move)
        // Check if solved during solve sequence - stop if we reach solved state
        if (checkDuringSolve) {
          checkDuringSolve(updatedCubies)
        }
      }
    }
  })

  // Start animation when currentAnimation changes
  useEffect(() => {
    if (!currentAnimation || animStateRef.current) return

    // Parse the move
    const isPrime = currentAnimation.includes("'")
    const baseMove = currentAnimation.replace("'", "")

    let axis, layerValue, clockwise
    switch (baseMove) {
      case 'R':
        axis = 'x'; layerValue = 1; clockwise = !isPrime; break
      case 'L':
        axis = 'x'; layerValue = -1; clockwise = isPrime; break
      case 'U':
        axis = 'y'; layerValue = 1; clockwise = !isPrime; break
      case 'D':
        axis = 'y'; layerValue = -1; clockwise = isPrime; break
      case 'F':
        axis = 'z'; layerValue = 1; clockwise = !isPrime; break
      case 'B':
        axis = 'z'; layerValue = -1; clockwise = isPrime; break
      default:
        return
    }

    const targetAngle = clockwise ? -90 : 90 // Negative for clockwise in Three.js

    const newAnimState = {
      axis,
      layerValue,
      targetAngle,
      startTime: performance.now(),
      move: currentAnimation
    }
    setAnimState(newAnimState)
    animStateRef.current = newAnimState
  }, [currentAnimation])

  // Get cubies in a specific layer
  const getCubiesInLayer = useCallback((axis, layerValue) => {
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    return cubies.filter(c => c.position[axisIndex] === layerValue)
  }, [cubies])

  // Determine move from drag
  const getMoveFromDrag = useCallback((startPoint, endPoint, faceNormal, cubiePosition) => {
    const dragVector = new THREE.Vector3().subVectors(endPoint, startPoint)
    const dragLength = dragVector.length()

    if (dragLength < 0.2) return null // Not enough drag

    dragVector.normalize()

    // Determine rotation axis (perpendicular to both face normal and drag direction)
    const cross = new THREE.Vector3().crossVectors(faceNormal, dragVector)
    const absX = Math.abs(cross.x)
    const absY = Math.abs(cross.y)
    const absZ = Math.abs(cross.z)

    let axis, layerValue, clockwise

    if (absX >= absY && absX >= absZ) {
      axis = 'x'
      layerValue = Math.round(cubiePosition[0])
      clockwise = cross.x > 0
    } else if (absY >= absX && absY >= absZ) {
      axis = 'y'
      layerValue = Math.round(cubiePosition[1])
      clockwise = cross.y > 0
    } else {
      axis = 'z'
      layerValue = Math.round(cubiePosition[2])
      clockwise = cross.z > 0
    }

    // Map axis + layer + direction to move notation
    let move
    if (axis === 'x') {
      if (layerValue === 1) move = clockwise ? 'R' : "R'"
      else if (layerValue === -1) move = clockwise ? "L'" : 'L'
      else return null
    } else if (axis === 'y') {
      if (layerValue === 1) move = clockwise ? 'U' : "U'"
      else if (layerValue === -1) move = clockwise ? "D'" : 'D'
      else return null
    } else if (axis === 'z') {
      if (layerValue === 1) move = clockwise ? 'F' : "F'"
      else if (layerValue === -1) move = clockwise ? "B'" : 'B'
      else return null
    }

    return move
  }, [])

  // Handle pointer down
  const handlePointerDown = useCallback((event) => {
    if (isAnimating) return

    event.stopPropagation()

    const intersects = event.intersections
    if (intersects.length === 0) return

    const intersection = intersects[0]
    const point = intersection.point.clone()
    const faceNormal = intersection.face.normal.clone()
    faceNormal.transformDirection(intersection.object.matrixWorld)

    setIsDragging(true)
    setDragStart(point)
    setDragFace(faceNormal)
    setDragCubie(intersection.object.position.clone().toArray())

    // Capture pointer
    gl.domElement.setPointerCapture(event.pointerId)
  }, [isAnimating, gl])

  // Handle pointer move
  const handlePointerMove = useCallback((event) => {
    if (!isDragging || isAnimating || !dragStart) return

    // Get 3D point from mouse
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    )
    raycaster.setFromCamera(mouse, camera)

    // Project onto a plane at the drag start point
    const plane = new THREE.Plane()
    plane.setFromNormalAndCoplanarPoint(
      camera.getWorldDirection(new THREE.Vector3()).negate(),
      dragStart
    )

    const endPoint = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, endPoint)

    if (endPoint) {
      const move = getMoveFromDrag(dragStart, endPoint, dragFace, dragCubie)
      if (move) {
        onMove(move)
        setIsDragging(false)
        setDragStart(null)
        setDragFace(null)
        setDragCubie(null)
        gl.domElement.releasePointerCapture(event.pointerId)
      }
    }
  }, [isDragging, isAnimating, dragStart, dragFace, dragCubie, camera, getMoveFromDrag, onMove, gl])

  // Handle pointer up
  const handlePointerUp = useCallback((event) => {
    setIsDragging(false)
    setDragStart(null)
    setDragFace(null)
    setDragCubie(null)
    if (gl.domElement) {
      gl.domElement.releasePointerCapture(event.pointerId)
    }
  }, [gl])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAnimating) return

      const key = event.key.toUpperCase()
      if (MOVES.includes(key)) {
        onMove(event.shiftKey ? key + "'" : key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onMove, isAnimating])

  // Memoize layer cubies to prevent flickering during animation
  const { rotating, static: staticCubies } = useMemo(() => {
    if (!animState) return { rotating: [], static: cubies }

    const axisIndex = { x: 0, y: 1, z: 2 }[animState.axis]
    const rotating = cubies.filter(c => c.position[axisIndex] === animState.layerValue)
    const staticCubies = cubies.filter(c => c.position[axisIndex] !== animState.layerValue)

    return { rotating, static: staticCubies }
  }, [cubies, animState])

  // Memoize static cubies render list
  const staticCubiesElements = useMemo(() => (
    staticCubies.map(cubie => (
      <Cubie
        key={cubie.id}
        position={cubie.position}
        colors={cubie.colors}
      />
    ))
  ), [staticCubies])

  // Memoize rotating cubies render list
  const rotatingCubiesElements = useMemo(() => (
    rotating.map(cubie => (
      <Cubie
        key={cubie.id}
        position={cubie.position}
        colors={cubie.colors}
      />
    ))
  ), [rotating])

  return (
    <group
      ref={groupRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Static cubies */}
      {staticCubiesElements}
      {/* Rotating cubies in animated group */}
      <group ref={rotatingGroupRef}>
        {rotatingCubiesElements}
      </group>
    </group>
  )
}
