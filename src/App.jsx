import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
    scramble,
    reset,
    solve
  } = useCubeState()

  return (
    <div className="app">
      <div className="canvas-container">
        <Canvas
          camera={{ position: [5, 5, 5], fov: 50 }}
          style={{ background: '#1a1a2e' }}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <Cube
            cubies={cubies}
            onMove={move}
            currentAnimation={currentAnimation}
            isAnimating={isAnimating}
          />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={15}
          />
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
