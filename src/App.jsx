import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { Cube } from './components/Cube'
import { Controls } from './components/Controls'
import { useCubeState } from './hooks/useCubeState'

function App() {
  const {
    cubies,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved,
    move,
    onMoveComplete,
    checkDuringSolve,
    scramble,
    reset,
    solve
  } = useCubeState()

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          {/* Gradient background */}
          <color attach="background" args={['#0a0a0f']} />
          <fog attach="fog" args={['#0a0a0f', 10, 30]} />

          {/* Ambient light for soft fill */}
          <ambientLight intensity={0.3} />

          {/* Key light - main directional light */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
          />

          {/* Fill light from opposite side */}
          <directionalLight position={[-5, 2, -5]} intensity={0.5} color="#b4c6e7" />

          {/* Rim light from behind */}
          <directionalLight position={[0, -5, -5]} intensity={0.3} color="#ffd4a3" />

          {/* Top highlight */}
          <pointLight position={[0, 10, 0]} intensity={0.3} color="#ffffff" />

          {/* Environment for realistic reflections */}
          <Environment preset="city" />

          {/* Contact shadows for grounding */}
          <ContactShadows
            position={[0, -2.5, 0]}
            opacity={0.4}
            scale={15}
            blur={2.5}
            far={5}
          />

          <Cube
            cubies={cubies}
            onMove={move}
            onMoveComplete={onMoveComplete}
            checkDuringSolve={checkDuringSolve}
            currentAnimation={currentAnimation}
            isAnimating={isAnimating}
          />

          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={15}
            enableDamping
            dampingFactor={0.05}
          />

          {/* Post-processing */}
          <EffectComposer>
            <Bloom
              intensity={0.15}
              luminanceThreshold={0.8}
              luminanceSmoothing={0.9}
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
      />
    </div>
  )
}

export default App
