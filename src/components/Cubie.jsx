import React, { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const CUBIE_SIZE = 1
const ROUNDING_RADIUS = 0.08
const STICKER_INSET = 0.06
const STICKER_ELEVATION = 0.002

// Shared black material - created once
const blackMaterial = new THREE.MeshStandardMaterial({
  color: '#111111',
  metalness: 0.15,
  roughness: 0.35
})

// Shared sticker geometry - created once
const stickerGeometry = new THREE.PlaneGeometry(
  CUBIE_SIZE - (STICKER_INSET * 2),
  CUBIE_SIZE - (STICKER_INSET * 2)
)

// Material cache to prevent recreation
const materialCache = new Map()

function getStickerMaterial(color) {
  if (!materialCache.has(color)) {
    materialCache.set(color, new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.22,
      metalness: 0.02
    }))
  }
  return materialCache.get(color)
}

// Memoized Cubie component
export const Cubie = React.memo(function Cubie({ position, colors }) {
  // Memoize sticker data to prevent recalculation
  const stickerData = useMemo(() => {
    const result = []
    if (colors.px !== '#111111') {
      result.push({ color: colors.px, pos: [CUBIE_SIZE/2 + STICKER_ELEVATION, 0, 0], rot: [0, Math.PI/2, 0] })
    }
    if (colors.nx !== '#111111') {
      result.push({ color: colors.nx, pos: [-CUBIE_SIZE/2 - STICKER_ELEVATION, 0, 0], rot: [0, -Math.PI/2, 0] })
    }
    if (colors.py !== '#111111') {
      result.push({ color: colors.py, pos: [0, CUBIE_SIZE/2 + STICKER_ELEVATION, 0], rot: [-Math.PI/2, 0, 0] })
    }
    if (colors.ny !== '#111111') {
      result.push({ color: colors.ny, pos: [0, -CUBIE_SIZE/2 - STICKER_ELEVATION, 0], rot: [Math.PI/2, 0, 0] })
    }
    if (colors.pz !== '#111111') {
      result.push({ color: colors.pz, pos: [0, 0, CUBIE_SIZE/2 + STICKER_ELEVATION], rot: [0, 0, 0] })
    }
    if (colors.nz !== '#111111') {
      result.push({ color: colors.nz, pos: [0, 0, -CUBIE_SIZE/2 - STICKER_ELEVATION], rot: [0, Math.PI, 0] })
    }
    return result
  }, [colors.px, colors.nx, colors.py, colors.ny, colors.pz, colors.nz])

  return (
    <group position={position}>
      {/* Black rounded box body */}
      <RoundedBox 
        args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]} 
        radius={ROUNDING_RADIUS} 
        smoothness={4}
      >
        <primitive object={blackMaterial} attach="material" />
      </RoundedBox>
      
      {/* Colored stickers */}
      {stickerData.map((sticker, i) => (
        <mesh 
          key={i} 
          position={sticker.pos} 
          rotation={sticker.rot}
          geometry={stickerGeometry}
        >
          <primitive object={getStickerMaterial(sticker.color)} attach="material" />
        </mesh>
      ))}
    </group>
  )
})
