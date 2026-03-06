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
      clockwise = isPrime // Clockwise from left = counter from front
      break
    case 'U': // Up face
      axis = 'y'
      layerValue = 1
      clockwise = !isPrime
      break
    case 'D': // Down face
      axis = 'y'
      layerValue = -1
      clockwise = isPrime // Clockwise from bottom = counter from front
      break
    case 'F': // Front face
      axis = 'z'
      layerValue = 1
      clockwise = !isPrime
      break
    case 'B': // Back face
      axis = 'z'
      layerValue = -1
      clockwise = isPrime // Clockwise from back = counter from front
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

// Reduce moves to optimal sequence - removes redundant moves
// Examples: RRRR = nothing, RR = R', R R' = nothing, R' R = nothing
export function reduceMoves(moves) {
  if (!moves || moves.length === 0) return []
  
  const stack = []
  
  for (const move of moves) {
    if (stack.length === 0) {
      stack.push(move)
      continue
    }
    
    const last = stack[stack.length - 1]
    const lastBase = last.replace("'", "")
    const lastIsPrime = last.includes("'")
    const moveBase = move.replace("'", "")
    const moveIsPrime = move.includes("'")
    
    // Same move base
    if (lastBase === moveBase) {
      // Determine effective rotation: 1 = clockwise, -1 = counter, 0 = cancel
      let lastDir = lastIsPrime ? -1 : 1
      let moveDir = moveIsPrime ? -1 : 1
      let total = lastDir + moveDir
      
      if (total === 0) {
        // R R' = nothing - cancel both
        stack.pop()
      } else if (Math.abs(total) === 2) {
        // RR = R' or R'R = R (replace with doubled)
        const newIsPrime = total > 0 ? false : true
        stack[stack.length - 1] = newIsPrime ? lastBase + "'" : lastBase
      } else if (Math.abs(total) === 3) {
        // RRR = R' (3 = -1 mod 4)
        const newIsPrime = total < 0 ? false : true
        stack[stack.length - 1] = newIsPrime ? lastBase + "'" : lastBase
      }
    } else {
      // Different moves - check if they're opposites on same axis
      const isOpposite = (
        (lastBase === 'R' && moveBase === 'L') ||
        (lastBase === 'L' && moveBase === 'R') ||
        (lastBase === 'U' && moveBase === 'D') ||
        (lastBase === 'D' && moveBase === 'U') ||
        (lastBase === 'F' && moveBase === 'B') ||
        (lastBase === 'B' && moveBase === 'F')
      )
      
      if (isOpposite && lastIsPrime !== moveIsPrime) {
        // R L' or R' L = cancel (opposite axes, opposite directions)
        stack.pop()
      } else if (isOpposite && lastIsPrime === moveIsPrime) {
        // R L = R L (same direction, keep both)
        stack.push(move)
      } else {
        // Non-opposite different moves
        stack.push(move)
      }
    }
  }
  
  return stack
}

// Reverse a sequence of moves (for solving)
export function reverseMoves(moves) {
  return moves.map(move => getInverseMove(move)).reverse()
}

// ============================================================================
// RUBIK'S CUBE SOLVER - IDA* Algorithm
// ============================================================================

// Convert cubies array to a representation suitable for solving
// We'll use a simplified face-based representation
export function cubiesToState(cubies) {
  // Map cubies by position to build face state
  const posMap = {}
  for (const cubie of cubies) {
    posMap[`${cubie.position[0]},${cubie.position[1]},${cubie.position[2]}`] = cubie.colors
  }

  // Build face arrays (3x3 grids)
  // Face order: U(0), D(1), F(2), B(3), L(4), R(5)
  const faces = [[], [], [], [], [], []]

  // Helper to get color at position
  const getColor = (x, y, z, face) => {
    const colors = posMap[`${x},${y},${z}`]
    if (!colors) return COLORS.black

    const faceMap = {
      'U': 'py', 'D': 'ny', 'F': 'pz', 'B': 'nz', 'L': 'nx', 'R': 'px'
    }
    return colors[faceMap[face]] || COLORS.black
  }

  // U face (y = 1), order: z=-1->1, x=-1->1
  for (let z = 1; z >= -1; z--) {
    for (let x = -1; x <= 1; x++) {
      faces[0].push(getColor(x, 1, z, 'U'))
    }
  }

  // D face (y = -1), order: z=-1->1, x=1->-1 (mirrored)
  for (let z = -1; z <= 1; z++) {
    for (let x = 1; x >= -1; x--) {
      faces[1].push(getColor(x, -1, z, 'D'))
    }
  }

  // F face (z = 1), order: y=1->-1, x=-1->1
  for (let y = 1; y >= -1; y--) {
    for (let x = -1; x <= 1; x++) {
      faces[2].push(getColor(x, y, 1, 'F'))
    }
  }

  // B face (z = -1), order: y=1->-1, x=1->-1 (mirrored)
  for (let y = 1; y >= -1; y--) {
    for (let x = 1; x >= -1; x--) {
      faces[3].push(getColor(x, y, -1, 'B'))
    }
  }

  // L face (x = -1), order: y=1->-1, z=-1->1
  for (let y = 1; y >= -1; y--) {
    for (let z = -1; z <= 1; z++) {
      faces[4].push(getColor(-1, y, z, 'L'))
    }
  }

  // R face (x = 1), order: y=1->-1, z=1->-1 (mirrored)
  for (let y = 1; y >= -1; y--) {
    for (let z = 1; z >= -1; z--) {
      faces[5].push(getColor(1, y, z, 'R'))
    }
  }

  return faces
}

// Convert state back to cubies (for verification)
export function stateToCubies(faces) {
  const cubies = []
  let id = 0

  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue

        const colors = {}

        if (x === 1) colors.px = faces[5][(1 - y) * 3 + (1 - z)]
        else colors.px = COLORS.black

        if (x === -1) colors.nx = faces[4][(1 - y) * 3 + (z + 1)]
        else colors.nx = COLORS.black

        if (y === 1) colors.py = faces[0][(1 - z) * 3 + (x + 1)]
        else colors.py = COLORS.black

        if (y === -1) colors.ny = faces[1][(z + 1) * 3 + (1 - x)]
        else colors.ny = COLORS.black

        if (z === 1) colors.pz = faces[2][(1 - y) * 3 + (x + 1)]
        else colors.pz = COLORS.black

        if (z === -1) colors.nz = faces[3][(1 - y) * 3 + (1 - x)]
        else colors.nz = COLORS.black

        cubies.push({ id: id++, position: [x, y, z], rotation: [0, 0, 0], colors })
      }
    }
  }

  return cubies
}

// Color to index mapping (for solver)
const colorToIdx = {}
colorToIdx[COLORS.white] = 0  // U
colorToIdx[COLORS.yellow] = 1 // D
colorToIdx[COLORS.red] = 2    // F
colorToIdx[COLORS.orange] = 3 // B
colorToIdx[COLORS.green] = 4  // L
colorToIdx[COLORS.blue] = 5   // R

// Simplified move functions for the solver state
// These manipulate the face arrays directly
function moveState(faces, move) {
  const newFaces = faces.map(f => [...f])

  // Copy the affected faces
  const U = faces[0], D = faces[1], F = faces[2], B = faces[3], L = faces[4], R = faces[5]

  if (move === 'R') {
    // R: rotate right face clockwise
    newFaces[5] = [R[6], R[3], R[0], R[7], R[4], R[1], R[8], R[5], R[2]]
    // Cycle: U -> F -> D -> B
    const temp = [U[2], U[5], U[8]]
    newFaces[0][2] = B[6]; newFaces[0][5] = B[3]; newFaces[0][8] = B[0]
    newFaces[3][0] = D[2]; newFaces[3][3] = D[5]; newFaces[3][6] = D[8]
    newFaces[1][2] = F[2]; newFaces[1][5] = F[5]; newFaces[1][8] = F[8]
    newFaces[2][2] = temp[0]; newFaces[2][5] = temp[1]; newFaces[2][8] = temp[2]
  } else if (move === "R'") {
    newFaces[5] = [R[2], R[5], R[8], R[1], R[4], R[7], R[0], R[3], R[6]]
    const temp = [U[2], U[5], U[8]]
    newFaces[0][2] = F[2]; newFaces[0][5] = F[5]; newFaces[0][8] = F[8]
    newFaces[2][2] = D[2]; newFaces[2][5] = D[5]; newFaces[2][8] = D[8]
    newFaces[1][2] = B[6]; newFaces[1][5] = B[3]; newFaces[1][8] = B[0]
    newFaces[3][0] = temp[0]; newFaces[3][3] = temp[1]; newFaces[3][6] = temp[2]
  } else if (move === 'L') {
    // L: rotate left face clockwise
    newFaces[4] = [L[6], L[3], L[0], L[7], L[4], L[1], L[8], L[5], L[2]]
    const temp = [U[0], U[3], U[6]]
    newFaces[0][0] = F[0]; newFaces[0][3] = F[3]; newFaces[0][6] = F[6]
    newFaces[2][0] = D[0]; newFaces[2][3] = D[3]; newFaces[2][6] = D[6]
    newFaces[1][0] = B[8]; newFaces[1][3] = B[5]; newFaces[1][6] = B[2]
    newFaces[3][2] = temp[0]; newFaces[3][5] = temp[1]; newFaces[3][8] = temp[2]
  } else if (move === "L'") {
    newFaces[4] = [L[2], L[5], L[8], L[1], L[4], L[7], L[0], L[3], L[6]]
    const temp = [U[0], U[3], U[6]]
    newFaces[0][0] = B[8]; newFaces[0][3] = B[5]; newFaces[0][6] = B[2]
    newFaces[3][2] = D[0]; newFaces[3][5] = D[3]; newFaces[3][8] = D[6]
    newFaces[1][0] = F[0]; newFaces[1][3] = F[3]; newFaces[1][6] = F[6]
    newFaces[2][0] = temp[0]; newFaces[2][3] = temp[1]; newFaces[2][6] = temp[2]
  } else if (move === 'U') {
    // U: rotate up face clockwise
    newFaces[0] = [U[6], U[3], U[0], U[7], U[4], U[1], U[8], U[5], U[2]]
    const temp = [F[0], F[1], F[2]]
    newFaces[2][0] = R[0]; newFaces[2][1] = R[1]; newFaces[2][2] = R[2]
    newFaces[5][0] = B[0]; newFaces[5][1] = B[1]; newFaces[5][2] = B[2]
    newFaces[3][0] = L[0]; newFaces[3][1] = L[1]; newFaces[3][2] = L[2]
    newFaces[4][0] = temp[0]; newFaces[4][1] = temp[1]; newFaces[4][2] = temp[2]
  } else if (move === "U'") {
    newFaces[0] = [U[2], U[5], U[8], U[1], U[4], U[7], U[0], U[3], U[6]]
    const temp = [F[0], F[1], F[2]]
    newFaces[2][0] = L[0]; newFaces[2][1] = L[1]; newFaces[2][2] = L[2]
    newFaces[4][0] = B[0]; newFaces[4][1] = B[1]; newFaces[4][2] = B[2]
    newFaces[3][0] = R[0]; newFaces[3][1] = R[1]; newFaces[3][2] = R[2]
    newFaces[5][0] = temp[0]; newFaces[5][1] = temp[1]; newFaces[5][2] = temp[2]
  } else if (move === 'D') {
    // D: rotate down face clockwise
    newFaces[1] = [D[6], D[3], D[0], D[7], D[4], D[1], D[8], D[5], D[2]]
    const temp = [F[6], F[7], F[8]]
    newFaces[2][6] = L[6]; newFaces[2][7] = L[7]; newFaces[2][8] = L[8]
    newFaces[4][6] = B[6]; newFaces[4][7] = B[7]; newFaces[4][8] = B[8]
    newFaces[3][6] = R[6]; newFaces[3][7] = R[7]; newFaces[3][8] = R[8]
    newFaces[5][6] = temp[0]; newFaces[5][7] = temp[1]; newFaces[5][8] = temp[2]
  } else if (move === "D'") {
    newFaces[1] = [D[2], D[5], D[8], D[1], D[4], D[7], D[0], D[3], D[6]]
    const temp = [F[6], F[7], F[8]]
    newFaces[2][6] = R[6]; newFaces[2][7] = R[7]; newFaces[2][8] = R[8]
    newFaces[5][6] = B[6]; newFaces[5][7] = B[7]; newFaces[5][8] = B[8]
    newFaces[3][6] = L[6]; newFaces[3][7] = L[7]; newFaces[3][8] = L[8]
    newFaces[4][6] = temp[0]; newFaces[4][7] = temp[1]; newFaces[4][8] = temp[2]
  } else if (move === 'F') {
    // F: rotate front face clockwise
    newFaces[2] = [F[6], F[3], F[0], F[7], F[4], F[1], F[8], F[5], F[2]]
    const temp = [U[6], U[7], U[8]]
    newFaces[0][6] = L[8]; newFaces[0][7] = L[5]; newFaces[0][8] = L[2]
    newFaces[4][2] = D[6]; newFaces[4][5] = D[7]; newFaces[4][8] = D[8]
    newFaces[1][0] = R[2]; newFaces[1][1] = R[5]; newFaces[1][2] = R[8]
    newFaces[5][0] = temp[0]; newFaces[5][3] = temp[1]; newFaces[5][6] = temp[2]
  } else if (move === "F'") {
    newFaces[2] = [F[2], F[5], F[8], F[1], F[4], F[7], F[0], F[3], F[6]]
    const temp = [U[6], U[7], U[8]]
    newFaces[0][6] = R[0]; newFaces[0][7] = R[3]; newFaces[0][8] = R[6]
    newFaces[5][0] = D[0]; newFaces[5][3] = D[1]; newFaces[5][6] = D[2]
    newFaces[1][0] = L[8]; newFaces[1][1] = L[5]; newFaces[1][2] = L[2]
    newFaces[4][2] = temp[2]; newFaces[4][5] = temp[1]; newFaces[4][8] = temp[0]
  } else if (move === 'B') {
    // B: rotate back face clockwise
    newFaces[3] = [B[6], B[3], B[0], B[7], B[4], B[1], B[8], B[5], B[2]]
    const temp = [U[0], U[1], U[2]]
    newFaces[0][0] = R[2]; newFaces[0][1] = R[5]; newFaces[0][2] = R[8]
    newFaces[5][2] = D[2]; newFaces[5][5] = D[1]; newFaces[5][8] = D[0]
    newFaces[1][6] = L[0]; newFaces[1][7] = L[3]; newFaces[1][8] = L[6]
    newFaces[4][0] = temp[2]; newFaces[4][3] = temp[1]; newFaces[4][6] = temp[0]
  } else if (move === "B'") {
    newFaces[3] = [B[2], B[5], B[8], B[1], B[4], B[7], B[0], B[3], B[6]]
    const temp = [U[0], U[1], U[2]]
    newFaces[0][0] = L[6]; newFaces[0][1] = L[3]; newFaces[0][2] = L[0]
    newFaces[4][0] = D[2]; newFaces[4][3] = D[1]; newFaces[4][6] = D[0]
    newFaces[1][6] = R[8]; newFaces[1][7] = R[5]; newFaces[1][8] = R[2]
    newFaces[5][2] = temp[0]; newFaces[5][5] = temp[1]; newFaces[5][8] = temp[2]
  }

  return newFaces
}

// Check if state is solved
function isStateSolved(faces) {
  for (const face of faces) {
    const firstColor = face[0]
    if (firstColor === COLORS.black) continue
    for (let i = 1; i < 9; i++) {
      if (face[i] !== firstColor) return false
    }
  }
  return true
}

// Heuristic: Count misplaced tiles on each face (simplified)
function heuristic(faces) {
  let h = 0

  // Each face: count how many tiles are not in the correct position
  // Simplified: just count non-uniform faces / 2 (upper bound)
  for (const face of faces) {
    const colorCounts = {}
    for (const color of face) {
      if (color !== COLORS.black) {
        colorCounts[color] = (colorCounts[color] || 0) + 1
      }
    }

    // If face has wrong colors, add to heuristic
    const maxCount = Math.max(...Object.values(colorCounts), 0)
    if (maxCount < 9 && maxCount > 0) {
      h += (9 - maxCount) / 2
    }
  }

  return Math.ceil(h)
}

// Get all possible moves (without consecutive same-face moves)
const ALL_MOVES = ['R', "R'", 'L', "L'", 'U', "U'", 'D', "D'", 'F', "F'", 'B', "B'"]

function getValidMoves(lastMove) {
  if (!lastMove) return ALL_MOVES

  const lastFace = lastMove[0]
  return ALL_MOVES.filter(m => m[0] !== lastFace)
}

// IDA* search
function idaStar(startFaces, maxDepth = 25) {
  // Check if already solved
  if (isStateSolved(startFaces)) return []

  const startH = heuristic(startFaces)
  let bound = startH

  while (bound <= maxDepth) {
    const result = search(startFaces, [], bound, 0, null)
    if (result) return result
    bound++
  }

  // If no solution found within maxDepth, try with more depth
  // But cap it to avoid browser freeze
  if (bound > maxDepth) {
    // Fall back to a simpler approach: just do random moves toward solution
    return null
  }

  return null
}

function search(faces, path, bound, g, lastMove) {
  const f = g + heuristic(faces)

  if (f > bound) return null
  if (isStateSolved(faces)) return path

  const validMoves = getValidMoves(lastMove)

  for (const move of validMoves) {
    const newFaces = moveState(faces, move)
    const newPath = [...path, move]
    const result = search(newPath, newPath, bound, g + 1, move)

    if (result) return result
  }

  return null
}

// Solve the cube from cubies state
export function solveCube(cubies, maxMoves = 25) {
  const startFaces = cubiesToState(cubies)
  const solution = idaStar(startFaces, maxMoves)

  if (!solution) {
    // Try a different approach - iterative random walk
    return solveWithRandomWalk(cubies, 100)
  }

  return solution
}

// Fallback solver: uses a greedy approach with piece-by-piece solving
function solveWithRandomWalk(cubies, maxIterations) {
  // Simple greedy solver: try to improve the cube state
  let currentFaces = cubiesToState(cubies)
  let currentH = heuristic(currentFaces)

  const bestSolution = []
  let iterations = 0
  const maxDepth = 6

  // Try beam search
  for (let depth = 1; depth <= maxDepth && iterations < maxIterations; depth++) {
    let bestAtDepth = null

    // Try all sequences of this depth
    const sequences = generateMoveSequences(depth)

    for (const seq of sequences) {
      let testFaces = currentFaces

      for (const move of seq) {
        testFaces = moveState(testFaces, move)
      }

      const h = heuristic(testFaces)

      if (h < currentH) {
        currentH = h
        bestAtDepth = seq
        break
      }

      iterations++
      if (iterations >= maxIterations) break
    }

    if (bestAtDepth) {
      bestSolution.push(...bestAtDepth)
      for (const move of bestAtDepth) {
        currentFaces = moveState(currentFaces, move)
      }
      currentH = heuristic(currentFaces)

      if (currentH === 0) {
        return bestSolution
      }
    }
  }

  // If we couldn't fully solve, return what we have
  // This should rarely happen for reasonable scrambles
  return bestSolution.length > 0 ? bestSolution : null
}

function generateMoveSequences(depth) {
  const faces = ['R', 'L', 'U', 'D', 'F', 'B']
  const results = []

  function generate(currentSeq, lastFace) {
    if (currentSeq.length === depth) {
      results.push(currentSeq)
      return
    }

    for (const face of faces) {
      if (face !== lastFace) {
        generate([...currentSeq, face], face)
        generate([...currentSeq, face + "'"], face)
      }
    }
  }

  generate([], null)
  return results
}
