import React, { memo, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CUBIE_SIZE = 0.92
const GAP = 0.04

// Material properties for realistic plastic look
const MATERIAL_PROPS = {
  metalness: 0.15,
  roughness: 0.35
}

const AXIS_INDEX = { x: 0, y: 1, z: 2 }

export const Cubie = memo(function Cubie({ position, colors, animation, onPointerDown }) {
  const groupRef = useRef()
  const axisVecRef = useRef(new THREE.Vector3())

  // Calculate actual position with gap
  const posX = position[0] * (1 + GAP)
  const posY = position[1] * (1 + GAP)
  const posZ = position[2] * (1 + GAP)

  // Create materials for each face
  // Three.js BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
  const createMaterial = (color) => {
    const isBlack = color === '#111111'
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: isBlack ? 0.3 : MATERIAL_PROPS.metalness,
      roughness: isBlack ? 0.5 : MATERIAL_PROPS.roughness
    })
  }

  // Materials array for BoxGeometry (must be in correct order!)
  const materials = useMemo(() => ([
    createMaterial(colors.px), // +X right (index 0)
    createMaterial(colors.nx), // -X left (index 1)
    createMaterial(colors.py), // +Y top (index 2)
    createMaterial(colors.ny), // -Y bottom (index 3)
    createMaterial(colors.pz), // +Z front (index 4)
    createMaterial(colors.nz) // -Z back (index 5)
  ]), [colors.nx, colors.ny, colors.nz, colors.px, colors.py, colors.pz])

  useEffect(() => {
    return () => {
      materials.forEach(material => material.dispose())
    }
  }, [materials])

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    group.rotation.set(0, 0, 0)

    const currentAnimation = animation?.current
    if (!currentAnimation) return

    const axisIndex = AXIS_INDEX[currentAnimation.axis]
    if (position[axisIndex] !== currentAnimation.layerValue) return

    axisVecRef.current.set(
      currentAnimation.axis === 'x' ? 1 : 0,
      currentAnimation.axis === 'y' ? 1 : 0,
      currentAnimation.axis === 'z' ? 1 : 0
    )

    group.rotateOnWorldAxis(
      axisVecRef.current,
      THREE.MathUtils.degToRad(currentAnimation.currentAngle)
    )
  })

  return (
    <group ref={groupRef}>
      <group position={[posX, posY, posZ]}>
        {/* Main cubie - use standard BoxGeometry with materials array */}
        <mesh material={materials} onPointerDown={(event) => onPointerDown?.(event, position)}>
          <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
        </mesh>
      </group>
    </group>
  )
})
