import React, { memo, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const CUBIE_SIZE = 0.98
const GAP = 0.0
const BODY_RADIUS = 0.1
const BODY_SMOOTHNESS = 6
const STICKER_SIZE = 0.8
const STICKER_INSET = CUBIE_SIZE / 2 + 0.001
const STICKER_RADIUS = 0.085

// Material properties for realistic plastic look
const MATERIAL_PROPS = {
  metalness: 0.02,
  roughness: 0.26,
  clearcoat: 0.18,
  clearcoatRoughness: 0.2
}

const AXIS_INDEX = { x: 0, y: 1, z: 2 }
const STICKER_FACES = [
  { key: 'px', position: [STICKER_INSET, 0, 0], rotation: [0, Math.PI / 2, 0] },
  { key: 'nx', position: [-STICKER_INSET, 0, 0], rotation: [0, -Math.PI / 2, 0] },
  { key: 'py', position: [0, STICKER_INSET, 0], rotation: [-Math.PI / 2, 0, 0] },
  { key: 'ny', position: [0, -STICKER_INSET, 0], rotation: [Math.PI / 2, 0, 0] },
  { key: 'pz', position: [0, 0, STICKER_INSET], rotation: [0, 0, 0] },
  { key: 'nz', position: [0, 0, -STICKER_INSET], rotation: [0, Math.PI, 0] }
]

function createRoundedStickerShape(size, radius) {
  const half = size / 2
  const r = Math.min(radius, half)
  const shape = new THREE.Shape()

  shape.moveTo(-half + r, -half)
  shape.lineTo(half - r, -half)
  shape.quadraticCurveTo(half, -half, half, -half + r)
  shape.lineTo(half, half - r)
  shape.quadraticCurveTo(half, half, half - r, half)
  shape.lineTo(-half + r, half)
  shape.quadraticCurveTo(-half, half, -half, half - r)
  shape.lineTo(-half, -half + r)
  shape.quadraticCurveTo(-half, -half, -half + r, -half)

  return shape
}

const SHARED_STICKER_GEOMETRY = new THREE.ShapeGeometry(
  createRoundedStickerShape(STICKER_SIZE, STICKER_RADIUS)
)

const SHARED_BODY_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: '#a6b2c3',
  metalness: 0.02,
  roughness: 0.48,
  transmission: 0.54,
  transparent: true,
  opacity: 0.82,
  thickness: 1.25,
  ior: 1.36,
  reflectivity: 0.16,
  attenuationDistance: 0.28,
  attenuationColor: '#93a1b7',
  clearcoat: 0.4,
  clearcoatRoughness: 0.28,
  envMapIntensity: 0.28
})

const stickerMaterialCache = new Map()

function getStickerMaterial(color) {
  if (!stickerMaterialCache.has(color)) {
    stickerMaterialCache.set(color, new THREE.MeshPhysicalMaterial({
      color,
      metalness: MATERIAL_PROPS.metalness,
      roughness: MATERIAL_PROPS.roughness,
      clearcoat: MATERIAL_PROPS.clearcoat,
      clearcoatRoughness: MATERIAL_PROPS.clearcoatRoughness,
      side: THREE.DoubleSide,
      envMapIntensity: 0.12,
      transmission: 0,
      transparent: false,
      opacity: 1
    }))
  }

  return stickerMaterialCache.get(color)
}

export const Cubie = memo(function Cubie({ position, colors, animation, onPointerDown }) {
  const groupRef = useRef()
  const axisVecRef = useRef(new THREE.Vector3())

  // Calculate actual position with gap
  const posX = position[0] * (1 + GAP)
  const posY = position[1] * (1 + GAP)
  const posZ = position[2] * (1 + GAP)

  const stickerMaterials = useMemo(() => {
    return {
      px: getStickerMaterial(colors.px),
      nx: getStickerMaterial(colors.nx),
      py: getStickerMaterial(colors.py),
      ny: getStickerMaterial(colors.ny),
      pz: getStickerMaterial(colors.pz),
      nz: getStickerMaterial(colors.nz)
    }
  }, [colors.nx, colors.ny, colors.nz, colors.px, colors.py, colors.pz])

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
        <RoundedBox
          args={[CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE]}
          radius={BODY_RADIUS}
          smoothness={BODY_SMOOTHNESS}
          material={SHARED_BODY_MATERIAL}
          onPointerDown={(event) => onPointerDown?.(event, position)}
        />
        {STICKER_FACES.map((face) => {
          if (colors[face.key] === '#111111') return null

          return (
            <mesh
              key={face.key}
              position={face.position}
              rotation={face.rotation}
              material={stickerMaterials[face.key]}
              onPointerDown={(event) => onPointerDown?.(event, position)}
              geometry={SHARED_STICKER_GEOMETRY}
            />
          )
        })}
      </group>
    </group>
  )
})
