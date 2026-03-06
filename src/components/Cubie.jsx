import React, { useRef } from 'react'
import * as THREE from 'three'

const CUBIE_SIZE = 0.92
const GAP = 0.04

// Material properties for realistic plastic look
const MATERIAL_PROPS = {
  metalness: 0.15,
  roughness: 0.35
}

export function Cubie({ position, colors }) {
  const meshRef = useRef()

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
  const materials = [
    createMaterial(colors.px),  // +X right (index 0)
    createMaterial(colors.nx),   // -X left (index 1)
    createMaterial(colors.py),   // +Y top (index 2)
    createMaterial(colors.ny),  // -Y bottom (index 3)
    createMaterial(colors.pz),  // +Z front (index 4)
    createMaterial(colors.nz)   // -Z back (index 5)
  ]

  return (
    <group position={[posX, posY, posZ]}>
      {/* Main cubie - use standard BoxGeometry with materials array */}
      <mesh ref={meshRef} material={materials}>
        <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
      </mesh>
    </group>
  )
}
