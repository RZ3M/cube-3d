# 🧊 3D Rubik's Cube

An interactive 3D Rubik's Cube web application built with React, Three.js, and @react-three/fiber.

![Rubik's Cube](https://via.placeholder.com/800x400?text=3D+Rubik's+Cube)

## ✨ Features

- **Fully Interactive 3D Cube** — Rotate the camera around the cube with mouse drag
- **Realistic Rendering** — Rounded edges, colored stickers on black plastic body
- **Smooth Animations** — 90° face rotations with easing
- **Keyboard Controls** — Use R, L, U, D, F, B keys (hold Shift for inverse)
- **Mouse Controls** — Click and drag on cube faces to rotate layers
- **Scramble** — Instantly scramble the cube with 20 random moves
- **Solve** — Auto-solve by reversing your moves
- **Reset** — Return to solved state instantly
- **Move Counter** — Track your progress

## 🛠 Tech Stack

- **React** — UI framework
- **Three.js** — 3D rendering
- **@react-three/fiber** — React renderer for Three.js
- **@react-three/drei** — Useful helpers for R3F
- **Vite** — Build tool

## 🚀 Installation

```bash
# Clone the repository
git clone https://github.com/RZ3M/cube-3d.git
cd cube-3d

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🎮 How to Play

### Keyboard Controls

| Key | Move |
|-----|------|
| R | Right face clockwise |
| R + Shift | Right face counter-clockwise |
| L | Left face clockwise |
| L + Shift | Left face counter-clockwise |
| U | Up face clockwise |
| U + Shift | Up face counter-clockwise |
| D | Down face clockwise |
| D + Shift | Down face counter-clockwise |
| F | Front face clockwise |
| F + Shift | Front face counter-clockwise |
| B | Back face clockwise |
| B + Shift | Back face counter-clockwise |

### Mouse Controls

- **Orbit** — Click and drag on empty space to rotate camera
- **Rotate Face** — Click and drag on a cube face to rotate that layer

### UI Buttons

- **Scramble** — Randomize the cube with 20 moves
- **Solve** — Reverse your moves to solve the cube
- **Reset** — Instantly return to solved state

## 📁 Project Structure

```
cube-3d/
├── src/
│   ├── components/
│   │   ├── Cube.jsx      # Main 3D cube component
│   │   ├── Cubie.jsx     # Individual cubie rendering
│   │   └── Controls.jsx  # UI control panel
│   ├── hooks/
│   │   └── useCubeState.js  # Cube state management
│   ├── utils/
│   │   └── cubeLogic.js  # Cube rotation & solve logic
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

## 🔧 Development

```bash
# Run tests (if any)
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📝 License

MIT

---

Built with ❤️ using React and Three.js
