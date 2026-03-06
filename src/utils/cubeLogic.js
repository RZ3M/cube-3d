// Cube colors: white, yellow, red, orange, blue, green
export const COLORS = {
  white: '#ffffff',
  yellow: '#ffd500',
  red: '#b90000',
  orange: '#ff5900',
  blue: '#0045ad',
  green: '#009b48',
  black: '#111111'
}

// Face to color mapping (user's standard Rubik's cube colors)
// +X = right = blue, -X = left = green
// +Y = up = white, -Y = down = yellow  
// +Z = front = red, -Z = back = orange
export const FACE_COLORS = {
  px: COLORS.blue,   // +X right
  nx: COLORS.green,  // -X left
  py: COLORS.white,  // +Y up
  ny: COLORS.yellow, // -Y down
  pz: COLORS.red,    // +Z front
  nz: COLORS.orange  // -Z back
}

// Move notation
export const MOVES = ['R', 'L', 'U', 'D', 'F', 'B']
export const MOVE_INVERSES = { R: "R'", L: "L'", U: "U'", D: "D'", F: "F'", B: "B'" }
export const MOVE_KEYS = { "R'": 'R', "L'": 'L', "U'": 'U', "D'": 'D', "F'": 'F', "B'": 'B' }

// Create initial solved cube state (27 cubies)
export function createSolvedCube() {
  const cubies = []
  let id = 0

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        // Skip center cubie (not visible)
        if (x === 0 && y === 0 && z === 0) continue

        cubies.push({
          id: id++,
          position: [x, y, z],
          rotation: [0, 0, 0],
          // Track which color is on each face
          colors: {
            px: x === 1 ? FACE_COLORS.px : COLORS.black,
            nx: x === -1 ? FACE_COLORS.nx : COLORS.black,
            py: y === 1 ? FACE_COLORS.py : COLORS.black,
            ny: y === -1 ? FACE_COLORS.ny : COLORS.black,
            pz: z === 1 ? FACE_COLORS.pz : COLORS.black,
            nz: z === -1 ? FACE_COLORS.nz : COLORS.black
          }
        })
      }
    }
  }

  return cubies
}

// Rotate a position 90 degrees around an axis
// Using right-hand rule: thumb axis direction =, fingers curl = counterclockwise
// But we want clockwise when viewed from outside the cube
function rotatePosition(pos, axis, clockwise) {
  const [x, y, z] = pos
  const dir = clockwise ? 1 : -1

  switch (axis) {
    case 'x':
      // Rotate around X axis: Y -> Z -> -Y -> -Z -> Y (clockwise when viewed from +X)
      // Clockwise (dir=1): y' = z, z' = -y
      return [x, z * dir, -y * dir]
    case 'y':
      // Rotate around Y axis: Z -> X -> -Z -> -X -> Z (clockwise when viewed from +Y)
      // Clockwise (dir=1): z' = -x, x' = z
      return [-z * dir, y, x * dir]
    case 'z':
      // Rotate around Z axis: X -> Y -> -X -> -Y -> X (clockwise when viewed from +Z)
      // Clockwise (dir=1): x' = -y, y' = x
      return [y * dir, -x * dir, z]
    default:
      return pos
  }
}

// Rotate colors when a cubie rotates
// The cubie's physical colored faces rotate with it
// FIXED: Colors rotate in opposite direction to position (stickers stay with cubie)
function rotateColors(colors, axis, clockwise) {
  const newColors = { ...colors }
  const dir = clockwise ? 1 : -1
  const invDir = -dir // Colors rotate opposite to position

  // Each rotation cycles 4 faces
  if (axis === 'x') {
    // Rotate around X: py -> pz -> ny -> nz -> py
    if (dir === 1) {
      // Clockwise: old pz→py, old ny→pz, old nz→ny, old py→nz
      const oldPx = colors.px
      const oldPy = colors.py
      const oldNy = colors.ny
      const oldPz = colors.pz
      const oldNz = colors.nz
      
      newColors.px = oldPx
      newColors.py = oldPz  // pz becomes py
      newColors.pz = oldNy  // ny becomes pz  
      newColors.ny = oldNz  // nz becomes ny
      newColors.nz = oldPy  // py becomes nz
    } else {
      // Counterclockwise
      const oldPx = colors.px
      const oldPy = colors.py
      const oldNy = colors.ny
      const oldPz = colors.pz
      const oldNz = colors.nz
      
      newColors.px = oldPx
      newColors.py = oldNz  // nz becomes py
      newColors.pz = oldPy  // py becomes pz
      newColors.ny = oldPz  // pz becomes ny
      newColors.nz = oldNy  // ny becomes nz
    }
  } else if (axis === 'y') {
    // Rotate around Y: pz -> px -> nz -> nx -> pz (clockwise when dir=1)
    if (dir === 1) {
      const oldPx = colors.px
      const oldNx = colors.nx
      const oldPz = colors.pz
      const oldNz = colors.nz

      newColors.py = colors.py
      newColors.pz = oldPx  // px becomes pz
      newColors.px = oldNz  // nz becomes px
      newColors.nz = oldNx  // nx becomes nz
      newColors.nx = oldPz  // pz becomes nx
    } else {
      const oldPx = colors.px
      const oldNx = colors.nx
      const oldPz = colors.pz
      const oldNz = colors.nz

      newColors.py = colors.py
      newColors.pz = oldNx  // nx becomes pz
      newColors.px = oldPz  // pz becomes px
      newColors.nz = oldPx  // px becomes nz
      newColors.nx = oldNz  // nz becomes nx
    }
  } else if (axis === 'z') {
    // Rotate around Z: px -> py -> nx -> ny -> px (clockwise when dir=1)
    if (dir === 1) {
      const oldPx = colors.px
      const oldNx = colors.nx
      const oldPy = colors.py
      const oldNy = colors.ny

      newColors.nz = colors.nz
      newColors.px = oldPy  // py becomes px
      newColors.py = oldNx  // nx becomes py
      newColors.nx = oldNy  // ny becomes nx
      newColors.ny = oldPx  // px becomes ny
    } else {
      const oldPx = colors.px
      const oldNx = colors.nx
      const oldPy = colors.py
      const oldNy = colors.ny

      newColors.nz = colors.nz
      newColors.px = oldNy  // ny becomes px
      newColors.py = oldPx  // px becomes py
      newColors.nx = oldPy  // py becomes nx
      newColors.ny = oldNx  // nx becomes ny
    }
  }

  return newColors
}

// Apply a move to the cube state
export function applyMove(cubies, move) {
  // Parse move (e.g., "R" or "R'")
  const isPrime = move.includes("'")
  const baseMove = move.replace("'", "")

  // Determine axis and layer
  let axis, layerValue, clockwise

  switch (baseMove) {
    case 'R': // Right face
      axis = 'x'
      layerValue = 1
      clockwise = !isPrime
      break
    case 'L': // Left face
      axis = 'x'
      layerValue = -1
      clockwise = isPrime
      break
    case 'U': // Up face
      axis = 'y'
      layerValue = 1
      clockwise = !isPrime
      break
    case 'D': // Down face
      axis = 'y'
      layerValue = -1
      clockwise = isPrime
      break
    case 'F': // Front face
      axis = 'z'
      layerValue = 1
      clockwise = !isPrime
      break
    case 'B': // Back face
      axis = 'z'
      layerValue = -1
      clockwise = isPrime
      break
    default:
      return cubies
  }

  // Find axis index
  const axisIndex = { x: 0, y: 1, z: 2 }[axis]

  // Rotate each cubie in the layer
  return cubies.map(cubie => {
    if (cubie.position[axisIndex] === layerValue) {
      const newPosition = rotatePosition(cubie.position, axis, clockwise)
      const newColors = rotateColors(cubie.colors, axis, clockwise)

      // Round positions to handle floating point
      return {
        ...cubie,
        position: newPosition.map(v => Math.round(v)),
        colors: newColors
      }
    }
    return cubie
  })
}

// Generate scramble moves
export function generateScramble(moveCount = 20) {
  const scramble = []
  let lastMove = null
  let secondLastMove = null

  for (let i = 0; i < moveCount; i++) {
    let move
    do {
      const baseMove = MOVES[Math.floor(Math.random() * MOVES.length)]
      const isPrime = Math.random() > 0.5
      move = isPrime ? baseMove + "'" : baseMove
    } while (
      move === lastMove ||
      (move[0] === lastMove?.[0] && move[0] === secondLastMove?.[0])
    )

    scramble.push(move)
    secondLastMove = lastMove
    lastMove = move
  }

  return scramble
}

// Check if cube is solved
export function isSolved(cubies) {
  // A cube is solved if each visible face has uniform colors
  const faces = {
    px: new Set(),
    nx: new Set(),
    py: new Set(),
    ny: new Set(),
    pz: new Set(),
    nz: new Set()
  }

  for (const cubie of cubies) {
    if (!cubie.colors) continue
    for (const face in faces) {
      if (cubie.colors[face] !== COLORS.black) {
        faces[face].add(cubie.colors[face])
      }
    }
  }

  // Each face should have exactly one color (excluding black)
  for (const face in faces) {
    if (faces[face].size > 1) return false
  }

  return true
}

// Get inverse of a move
export function getInverseMove(move) {
  if (move.includes("'")) {
    return move.replace("'", "")
  }
  return move + "'"
}

// Reverse a sequence of moves (for solving)
export function reverseMoves(moves) {
  return moves.map(move => getInverseMove(move)).reverse()
}
