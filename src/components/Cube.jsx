import React, { useRef, useEffect, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Cubie } from './Cubie'
import { MOVES } from '../utils/cubeLogic'
import * as THREE from 'three'

const ANIMATION_DURATION = 250 // ms
const DRAG_THRESHOLD = 12
const DRAG_SENSITIVITY = 0.45
const SNAP_THRESHOLD = 45
const AXES = {
  x: {
    index: 0,
    vector: new THREE.Vector3(1, 0, 0),
    positiveMove: 'R',
    negativeMove: 'L',
    middleMove: 'M',
    noPrimeSign: { 1: -1, 0: 1, [-1]: 1 }
  },
  y: {
    index: 1,
    vector: new THREE.Vector3(0, 1, 0),
    positiveMove: 'U',
    negativeMove: 'D',
    middleMove: 'E',
    noPrimeSign: { 1: -1, 0: 1, [-1]: 1 }
  },
  z: {
    index: 2,
    vector: new THREE.Vector3(0, 0, 1),
    positiveMove: 'F',
    negativeMove: 'B',
    middleMove: 'S',
    noPrimeSign: { 1: -1, 0: -1, [-1]: 1 }
  }
}

function getMoveNotation(axis, layerValue, rotationSign) {
  const axisConfig = AXES[axis]
  const baseMove = layerValue === 0
    ? axisConfig.middleMove
    : layerValue === 1
      ? axisConfig.positiveMove
      : axisConfig.negativeMove
  const noPrimeSign = axisConfig.noPrimeSign[layerValue]

  return rotationSign === noPrimeSign ? baseMove : `${baseMove}'`
}

function parseMoveNotation(moveNotation) {
  const isPrime = moveNotation.includes("'")
  const baseMove = moveNotation.replace("'", "")

  switch (baseMove) {
    case 'R':
      return { axis: 'x', layerValue: 1, targetAngle: isPrime ? 90 : -90 }
    case 'L':
      return { axis: 'x', layerValue: -1, targetAngle: isPrime ? -90 : 90 }
    case 'U':
      return { axis: 'y', layerValue: 1, targetAngle: isPrime ? 90 : -90 }
    case 'D':
      return { axis: 'y', layerValue: -1, targetAngle: isPrime ? -90 : 90 }
    case 'F':
      return { axis: 'z', layerValue: 1, targetAngle: isPrime ? 90 : -90 }
    case 'B':
      return { axis: 'z', layerValue: -1, targetAngle: isPrime ? -90 : 90 }
    case 'M':
      return { axis: 'x', layerValue: 0, targetAngle: isPrime ? -90 : 90 }
    case 'E':
      return { axis: 'y', layerValue: 0, targetAngle: isPrime ? -90 : 90 }
    case 'S':
      return { axis: 'z', layerValue: 0, targetAngle: isPrime ? 90 : -90 }
    default:
      return null
  }
}

export function Cube({
  cubies,
  onMove,
  onAnimationComplete,
  onDragStateChange,
  currentAnimation,
  isAnimating
}) {
  const groupRef = useRef()
  const animationRef = useRef(null)
  const didCompleteRef = useRef(false)
  const dragStateRef = useRef(null)
  const { camera, size } = useThree()

  // Handle animation frame
  useFrame(() => {
    const animation = animationRef.current
    if (!animation) return

    if (animation.mode === 'interactive') {
      return
    }

    const elapsed = performance.now() - animation.startTime
    const progress = Math.min(elapsed / ANIMATION_DURATION, 1)

    // Easing function (ease-out cubic)
    const eased = 1 - Math.pow(1 - progress, 3)
    animation.currentAngle = animation.startAngle + (animation.targetAngle - animation.startAngle) * eased

    if (progress >= 1) {
      if (didCompleteRef.current) return

      didCompleteRef.current = true
      const completedMove = animation.commitMove

      animationRef.current = null
      onDragStateChange?.(false)
      if (completedMove) {
        onAnimationComplete?.(completedMove)
      }
    }
  })

  // Start animation when currentAnimation changes
  useEffect(() => {
    if (!currentAnimation) {
      if (animationRef.current?.mode === 'auto') {
        animationRef.current = null
      }
      return
    }

    const parsedMove = parseMoveNotation(currentAnimation)
    if (!parsedMove) return

    didCompleteRef.current = false
    animationRef.current = {
      mode: 'auto',
      axis: parsedMove.axis,
      layerValue: parsedMove.layerValue,
      startAngle: 0,
      targetAngle: parsedMove.targetAngle,
      currentAngle: 0,
      commitMove: currentAnimation,
      startTime: performance.now()
    }
  }, [currentAnimation])

  const projectWorldVectorToScreen = useCallback((origin, vector) => {
    const start = origin.clone().project(camera)
    const end = origin.clone().add(vector).project(camera)

    return new THREE.Vector2(
      (end.x - start.x) * size.width * 0.5,
      (start.y - end.y) * size.height * 0.5
    )
  }, [camera, size.height, size.width])

  const resolveDragMove = useCallback((dragState, dragVector, minScore = 0.5) => {
    const normalizedDrag = dragVector.clone().normalize()
    let bestCandidate = null
    let bestScore = minScore

    for (const axis of Object.keys(AXES)) {
      const { index, vector } = AXES[axis]
      const layerValue = dragState.position[index]

      for (const rotationSign of [-1, 1]) {
        const moveNotation = getMoveNotation(axis, layerValue, rotationSign)
        const motionWorld = vector.clone().cross(dragState.worldPoint).multiplyScalar(rotationSign)
        const motionScreen = projectWorldVectorToScreen(dragState.worldPoint, motionWorld)

        if (motionScreen.lengthSq() < 1e-4) continue

        const score = motionScreen.normalize().dot(normalizedDrag)
        if (score > bestScore) {
          bestCandidate = {
            axis,
            layerValue,
            moveNotation,
            direction: motionScreen.clone(),
            rotationSign
          }
          bestScore = score
        }
      }
    }

    return bestCandidate
  }, [projectWorldVectorToScreen])

  const handlePointerDown = useCallback((event, position) => {
    if (isAnimating || animationRef.current || dragStateRef.current) return

    event.stopPropagation()

    if (!event.face) return

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      position: [...position],
      worldPoint: event.point.clone()
    }
    onDragStateChange?.(true)
  }, [isAnimating, onDragStateChange])

  useEffect(() => {
    const handlePointerMove = (event) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId || isAnimating) return

      const dragVector = new THREE.Vector2(
        event.clientX - dragState.startX,
        event.clientY - dragState.startY
      )

      if (!dragState.activeMove) {
        if (dragVector.length() < DRAG_THRESHOLD) return

        const candidate = resolveDragMove(dragState, dragVector)
        if (!candidate) return

        dragState.activeMove = candidate
        didCompleteRef.current = false
        animationRef.current = {
          mode: 'interactive',
          axis: candidate.axis,
          layerValue: candidate.layerValue,
          currentAngle: 0
        }
      }

      const direction = dragState.activeMove.direction.clone().normalize()
      const projectedPixels = dragVector.dot(direction)
      const currentAngle = THREE.MathUtils.clamp(
        projectedPixels * DRAG_SENSITIVITY * dragState.activeMove.rotationSign,
        -135,
        135
      )

      if (animationRef.current?.mode === 'interactive') {
        animationRef.current.currentAngle = currentAngle
      }
    }

    const handlePointerEnd = (event) => {
      const dragState = dragStateRef.current
      if (!dragState || dragState.pointerId !== event.pointerId) return

      const activeAnimation = animationRef.current
      const activeMove = dragState.activeMove

      dragStateRef.current = null

      if (!activeMove || !activeAnimation || activeAnimation.mode !== 'interactive') {
        animationRef.current = null
        onDragStateChange?.(false)
        return
      }

      const releaseAngle = activeAnimation.currentAngle
      const shouldCommit = Math.abs(releaseAngle) >= SNAP_THRESHOLD

      if (!shouldCommit) {
        didCompleteRef.current = false
        animationRef.current = {
          ...activeAnimation,
          mode: 'settle',
          startAngle: releaseAngle,
          targetAngle: 0,
          commitMove: null,
          startTime: performance.now()
        }
        return
      }

      const rotationSign = releaseAngle >= 0 ? 1 : -1
      const moveNotation = getMoveNotation(activeMove.axis, activeMove.layerValue, rotationSign)
      const parsedMove = parseMoveNotation(moveNotation)

      didCompleteRef.current = false
      animationRef.current = {
        mode: 'settle',
        axis: activeMove.axis,
        layerValue: activeMove.layerValue,
        startAngle: releaseAngle,
        targetAngle: parsedMove.targetAngle,
        currentAngle: releaseAngle,
        commitMove: moveNotation,
        startTime: performance.now()
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [isAnimating, onDragStateChange, resolveDragMove])

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isAnimating || animationRef.current || dragStateRef.current) return

      const key = event.key.toUpperCase()
      if (MOVES.includes(key)) {
        onMove(event.shiftKey ? key + "'" : key)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAnimating, onMove])

  useEffect(() => {
    if (!isAnimating) return
    if (dragStateRef.current) {
      dragStateRef.current = null
      onDragStateChange?.(false)
    }
  }, [isAnimating, onDragStateChange])

  return (
    <group ref={groupRef}>
      {cubies.map(cubie => (
        <Cubie
          key={cubie.id}
          position={cubie.position}
          colors={cubie.colors}
          animation={animationRef}
          onPointerDown={handlePointerDown}
        />
      ))}
    </group>
  )
}
