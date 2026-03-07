# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

An interactive 3D Rubik's Cube web application built with React, Three.js, and @react-three/fiber. Features include keyboard/mouse controls, scramble/solve functionality, and smooth 90-degree face animations.

## Commands

```bash
npm run dev      # Start development server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## Architecture

### State Management

- **useCubeState hook** (`src/hooks/useCubeState.js`): Central state management for the cube. Manages cubies array, move history, animation state, and solve sequence. Uses refs (`isSolvingRef`, `solveMovesRef`) to track solve state across renders.

### Cube Logic

- **cubeLogic** (`src/utils/cubeLogic.js`): Pure logic functions for cube manipulation:
  - `createSolvedCube()`: Generates 26 cubies (skipping center) with initial colors
  - `applyMove(cubies, move)`: Applies a move notation (R, L', U, etc.) to the cube state
  - `rotatePosition()`, `rotateColors()`: Helper functions for position/color transformation
  - `generateScramble(moveCount)`: Generates random scramble sequences
  - `isSolved(cubies)`: Checks if cube is solved by verifying each face has uniform colors
  - `solveCube()`: IDA* algorithm solver with fallback greedy solver
  - State conversion functions (`cubiesToState`, `stateToCubies`) for solver compatibility

### 3D Components

- **Cube.jsx**: Main 3D component handling:
  - Animation via `useFrame` hook (250ms duration with ease-out cubic easing)
  - Split cubies into rotating layer vs static during animations
  - Mouse drag detection for face rotations
  - Keyboard controls (R/L/U/D/F/B keys, Shift for inverse)
- **Cubie.jsx**: Individual cubie rendering with black body + colored sticker planes. Uses memoization and material caching for performance.

### Rendering Pipeline

- **App.jsx**: Sets up Canvas with lighting (ambient, directional, point), Environment (city preset), ContactShadows, and post-processing (Bloom)
- Uses `@react-three/drei` for OrbitControls, RoundedBox, Environment
- Uses `@react-three/postprocessing` for Bloom effect

### Color Mapping

Face colors use standard Rubik's cube notation:
- +X (right): blue
- -X (left): green
- +Y (up): white
- -Y (down): yellow
- +Z (front): red
- -Z (back): orange
