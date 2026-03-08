# Cube 3D

Cube 3D is an interactive 3D Rubik's Cube built with React, Three.js, and `@react-three/fiber`. It focuses on direct manipulation: you can rotate layers with drag gestures or keyboard moves, scramble instantly, and animate a solve sequence based on the moves tracked in the current session.

This README is written against the current codebase in this repository.

## Table of Contents

- [What It Does](#what-it-does)
- [Current Solve Behavior](#current-solve-behavior)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [How to Use the App](#how-to-use-the-app)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Rendering and Interaction Details](#rendering-and-interaction-details)
- [Color and Orientation Model](#color-and-orientation-model)
- [Development Notes](#development-notes)
- [Limitations](#limitations)

## What It Does

The app renders a full 3D Rubik's Cube and lets you:

- rotate the camera around the cube
- turn layers with mouse or touch dragging
- trigger moves from the keyboard
- scramble the cube instantly
- reset the cube to solved
- animate a solve sequence using the move history recorded in the current session
- track the visible move count during play and solve playback

The cube state is represented as individual cubies with per-face sticker colors. Turns are animated in the scene and then committed back into the logical state once the animation completes.

## Current Solve Behavior

The current `Solve` button is **not** a general cube solver.

It works by reversing the normalized move history that produced the current cube state in the running app session. In practice that means:

- if you scramble and then press `Solve`, the cube plays back the inverse of that scramble
- if you scramble, make manual turns, and then press `Solve`, the cube plays back the inverse of the combined tracked history
- if the current state was not produced through the tracked history in this session, the app does not derive a fresh solution from cube state alone

When `Solve` starts, the visible move counter resets to `0`, then counts only the animated solve moves.

## Tech Stack

- React 18
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- `@react-three/postprocessing`
- Vite

## Getting Started

### Prerequisites

- Node.js 18+ is recommended
- npm

### Install

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Vite serves the app on port `5173` by default.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Available Scripts

### `npm run dev`

Starts the local development server.

### `npm run build`

Builds the production bundle into `dist/`.

### `npm run preview`

Serves the production build locally for inspection.

### `npm test`

Runs the Node test runner. At the moment, the repository does not include an active automated test suite, so this command completes with zero tests.

## How to Use the App

### Camera controls

- drag on empty space to orbit the camera
- scroll or pinch to zoom

### Layer controls

- drag directly on a cubie face to turn a layer
- keyboard input supports face and slice moves

### Keyboard moves

Press the move key for a clockwise quarter turn. Hold `Shift` for the inverse turn.

Supported keys:

- `R`, `L`, `U`, `D`, `F`, `B`
- `M`, `E`, `S`

### Buttons

- `Scramble`: applies a random 20-move scramble instantly and resets the visible counter
- `Solve`: replays the inverse of the tracked move history and resets the visible counter before playback starts
- `Reset`: returns the cube to the solved state and clears all tracked state

## Architecture Overview

### Application shell

[`src/App.jsx`](/Users/jm/Documents/code/cube-3d/src/App.jsx) sets up:

- the `Canvas`
- lighting and fog
- environment and contact shadows
- post-processing
- the `Cube` scene component
- the HUD controls

### State management

[`src/hooks/useCubeState.js`](/Users/jm/Documents/code/cube-3d/src/hooks/useCubeState.js) is the central state hook. It owns:

- the current cubie array
- the visible move history
- the visible move count
- current animation state
- the hidden normalized move history used by `Solve`
- the queued moves for solve playback

Important behavior in the hook:

- manual moves are not committed until the animation finishes
- `Scramble` mutates the cube instantly but does not count those moves in the visible counter
- `Solve` resets the visible counter and replays inverse tracked moves

### Cube logic

[`src/utils/cubeLogic.js`](/Users/jm/Documents/code/cube-3d/src/utils/cubeLogic.js) contains the pure cube manipulation helpers:

- solved cube creation
- move parsing and application
- position rotation
- sticker rotation
- scramble generation
- solved-state detection
- move inversion and normalization helpers

### 3D interaction

[`src/components/Cube.jsx`](/Users/jm/Documents/code/cube-3d/src/components/Cube.jsx) handles:

- active turn animation
- drag gesture interpretation
- keyboard move dispatch
- partitioning animated state from committed cube state

[`src/components/Cubie.jsx`](/Users/jm/Documents/code/cube-3d/src/components/Cubie.jsx) renders each physical cube piece and its stickers.

### HUD and controls

[`src/components/Controls.jsx`](/Users/jm/Documents/code/cube-3d/src/components/Controls.jsx) renders:

- move count
- status text
- scramble, solve, and reset buttons
- interaction hints

## Project Structure

```text
cube-3d/
├── src/
│   ├── components/
│   │   ├── Controls.jsx
│   │   ├── Cube.jsx
│   │   ├── Cubie.jsx
│   │   └── ErrorBoundary.jsx
│   ├── hooks/
│   │   └── useCubeState.js
│   ├── utils/
│   │   └── cubeLogic.js
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Rendering and Interaction Details

### Animation model

Turns are animated over roughly 250ms. During an active turn:

- the intended move is stored as the current animation
- the scene renders the turning layer in motion
- the logical cube state is only committed after the animation completes

This keeps interactions visually smooth while preserving a clean state transition model.

### Drag-based turns

The app uses pointer movement direction and the touched cubie's position to infer which layer the user intended to rotate. Small drags are ignored until a threshold is crossed, which helps prevent accidental turns.

### Orbit controls

Camera orbiting is disabled while a layer turn is active so drag gestures do not compete with move input.

## Color and Orientation Model

The cube uses this fixed face-color mapping:

- `+X` right: blue
- `-X` left: green
- `+Y` up: white
- `-Y` down: yellow
- `+Z` front: red
- `-Z` back: orange

This mapping lives in [`src/utils/cubeLogic.js`](/Users/jm/Documents/code/cube-3d/src/utils/cubeLogic.js) and is used consistently for:

- initial solved state creation
- turn application
- solved-state checks

## Development Notes

### Move normalization

The app keeps a normalized hidden move history so adjacent turns on the same face can cancel or collapse before `Solve` reverses them. This reduces unnecessary playback steps.

### Build size

The current production build emits a large main bundle and Vite will warn about chunk size during `npm run build`. That warning is expected with the current setup.

### Testing

There is currently no meaningful automated test coverage in the repository. If you plan to extend the cube logic, adding targeted tests around `cubeLogic.js` and `useCubeState.js` would be the highest-value place to start.

## Limitations

- `Solve` is history-based, not state-based
- there is no true Rubik's Cube solving algorithm in the current code
- automated tests are not yet in place
- the production bundle is relatively large

If you want to turn this into a true state-based solver, the logical starting points are [`src/utils/cubeLogic.js`](/Users/jm/Documents/code/cube-3d/src/utils/cubeLogic.js) and [`src/hooks/useCubeState.js`](/Users/jm/Documents/code/cube-3d/src/hooks/useCubeState.js).
