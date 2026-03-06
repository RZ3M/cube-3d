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
function rotatePosition(pos, axis, clockwise) {
  const [x, y, z] = pos
  const dir = clockwise ? 1 : -1

  switch (axis) {
    case 'x':
      return [x, -z * dir, y * dir]
    case 'y':
      return [z * dir, y, -x * dir]
    case 'z':
      return [-y * dir, x * dir, z]
    default:
      return pos
  }
}

// Rotate colors when a cubie rotates
function rotateColors(colors, axis, clockwise) {
  const newColors = { ...colors }
  const dir = clockwise ? 1 : -1

  switch (axis) {
    case 'x':
      if (dir === 1) {
        newColors.py = colors.nz
        newColors.pz = colors.py
        newColors.ny = colors.pz
        newColors.nz = colors.ny
      } else {
        newColors.py = colors.pz
        newColors.nz = colors.py
        newColors.ny = colors.nz
        newColors.pz = colors.ny
      }
      break
    case 'y':
      if (dir === 1) {
        newColors.px = colors.nz
        newColors.pz = colors.px
        newColors.nx = colors.pz
        newColors.nz = colors.nx
      } else {
        newColors.px = colors.pz
        newColors.nz = colors.px
        newColors.nx = colors.nz
        newColors.pz = colors.nx
      }
      break
    case 'z':
      if (dir === 1) {
        newColors.px = colors.ny
        newColors.py = colors.px
        newColors.nx = colors.py
        newColors.ny = colors.nx
      } else {
        newColors.px = colors.py
        newColors.ny = colors.px
        newColors.nx = colors.ny
        newColors.py = colors.nx
      }
      break
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
