import React, { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { Cube } from './components/Cube'
import { Controls } from './components/Controls'
import { useCubeState } from './hooks/useCubeState'

function App() {
  const [isDragging, setIsDragging] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const {
    cubies,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved,
    move,
    completeMove,
    scramble,
    reset,
    solve
  } = useCubeState()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updateDeviceState = () => setIsTouchDevice(mediaQuery.matches || window.innerWidth <= 768)

    updateDeviceState()
    mediaQuery.addEventListener('change', updateDeviceState)
    window.addEventListener('resize', updateDeviceState)

    return () => {
      mediaQuery.removeEventListener('change', updateDeviceState)
      window.removeEventListener('resize', updateDeviceState)
    }
  }, [])

  const cameraConfig = isTouchDevice
    ? { position: [7.4, 6.5, 8.3], fov: 42 }
    : { position: [6.3, 5.45, 7.1], fov: 35 }

  return (
    <div className="app">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="canvas-container">
        <Canvas
          camera={cameraConfig}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#edf1f6']} />
          <fog attach="fog" args={['#edf1f6', 10, 24]} />

          <ambientLight intensity={0.62} />

          <directionalLight
            position={[6, 9, 7]}
            intensity={1.45}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.45} color="#d6e0ef" />
          <directionalLight position={[1, 5, -8]} intensity={0.28} color="#ffd9be" />
          <pointLight position={[0, 7, 2]} intensity={0.24} color="#ffffff" />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.36}
            scale={12}
            blur={1.3}
            far={5.5}
          />

          <Cube
            cubies={cubies}
            onMove={move}
            onAnimationComplete={completeMove}
            onDragStateChange={setIsDragging}
            currentAnimation={currentAnimation}
            isAnimating={isAnimating}
          />

          <OrbitControls
            enabled={!isDragging && !isAnimating}
            enablePan={false}
            minDistance={isTouchDevice ? 6.4 : 5.4}
            maxDistance={isTouchDevice ? 13 : 11}
            minPolarAngle={0.65}
            maxPolarAngle={2.15}
            enableDamping
            dampingFactor={0.08}
          />

          <EffectComposer enableNormalPass>
            <Bloom
              intensity={0.09}
              luminanceThreshold={0.78}
              luminanceSmoothing={0.98}
            />
            <SSAO
              samples={16}
              radius={0.055}
              intensity={7}
              luminanceInfluence={0.35}
            />
          </EffectComposer>
        </Canvas>
      </div>
      <Controls
        onScramble={scramble}
        onSolve={solve}
        onReset={reset}
        moveCount={moveCount}
        isSolved={isSolved}
        isAnimating={isAnimating}
        isTouchDevice={isTouchDevice}
      />
    </div>
  )
}

export default App
