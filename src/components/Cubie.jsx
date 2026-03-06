import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { COLORS } from '../utils/cubeLogic'

const CUBIE_SIZE = 0.95
const GAP = 0.02

export function Cubie({ position, colors }) {
  const meshRef = useRef()

  // Materials for each face
  const materials = [
    // +X (right) - index 0
    <meshStandardMaterial key="px" color={colors.px} />,
    // -X (left) - index 1
    <meshStandardMaterial key="nx" color={colors.nx} />,
    // +Y (top) - index 2
    <meshStandardMaterial key="py" color={colors.py} />,
    // -Y (bottom) - index 3
    <meshStandardMaterial key="ny" color={colors.ny} />,
    // +Z (front) - index 4
    <meshStandardMaterial key="pz" color={colors.pz} />,
    // -Z (back) - index 5
    <meshStandardMaterial key="nz" color={colors.nz} />
  ]

  return (
    <mesh
      ref={meshRef}
      position={[position[0] * (1 + GAP), position[1] * (1 + GAP), position[2] * (1 + GAP)]}
    >
      <boxGeometry args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} />
      {materials}
    </mesh>
  )
}
