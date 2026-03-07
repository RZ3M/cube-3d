import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Cubie } from './Cubie'
import { MOVES } from '../utils/cubeLogic'
import * as THREE from 'three'

const ANIMATION_DURATION = 250 // ms

export function Cube({ cubies, onMove, currentAnimation, isAnimating }) {
  const groupRef = useRef()
  const rotatingGroupRef = useRef()
  const [animState, setAnimState] = useState(null) // { axis, layerValue, targetAngle, startTime }

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

    // Animation complete - DON'T reset rotation, let state update handle final position
    if (progress >= 1) {
      setAnimState(null)
    }
  })

  // Start animation when currentAnimation changes
  useEffect(() => {
    if (!currentAnimation) return

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

    setAnimState({
      axis,
      layerValue,
      targetAngle,
      startTime: performance.now()
    })
  }, [currentAnimation])

  // Reset rotating group when animation completes (currentAnimation becomes null)
  useEffect(() => {
    if (currentAnimation === null && rotatingGroupRef.current) {
      rotatingGroupRef.current.rotation.set(0, 0, 0)
    }
  }, [currentAnimation])

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

  // Get cubies in the rotating layer
  const getLayerCubies = () => {
    if (!animState) return { rotating: [], static: cubies }

    const axisIndex = { x: 0, y: 1, z: 2 }[animState.axis]
    const rotating = cubies.filter(c => c.position[axisIndex] === animState.layerValue)
    const staticCubies = cubies.filter(c => c.position[axisIndex] !== animState.layerValue)

    return { rotating, static: staticCubies }
  }

  const { rotating, static: staticCubies } = getLayerCubies()

  // Render cubies
  const renderCubies = () => {
    return (
      <>
        {/* Static cubies */}
        {staticCubies.map(cubie => (
          <Cubie
            key={cubie.id}
            position={cubie.position}
            colors={cubie.colors}
          />
        ))}
        {/* Rotating cubies in animated group */}
        <group ref={rotatingGroupRef}>
          {rotating.map(cubie => (
            <Cubie
              key={cubie.id}
              position={cubie.position}
              colors={cubie.colors}
            />
          ))}
        </group>
      </>
    )
  }

  return (
    <group ref={groupRef}>
      {renderCubies()}
    </group>
  )
}
