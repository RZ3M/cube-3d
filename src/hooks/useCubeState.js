import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createSolvedCube,
  applyMove,
  generateScramble,
  isSolved as checkSolved,
  reverseMoves
} from '../utils/cubeLogic'

export function useCubeState() {
  const [cubies, setCubies] = useState(createSolvedCube)
  const [moveHistory, setMoveHistory] = useState([])
  const [moveCount, setMoveCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState(null)

  // Solve state - simple counter approach
  const solveIndexRef = useRef(0)
  const solveMovesRef = useRef([])

  // Start a single move
  const move = useCallback((moveNotation) => {
    setIsAnimating(true)
    setCurrentAnimation(moveNotation)
  }, [])

  // Called by Cube component when animation finishes
  const onMoveComplete = useCallback((updatedCubies, completedMove) => {
    // Update cubies
    setCubies(updatedCubies)
    setCurrentAnimation(null)
    setIsAnimating(false)
    
    // Track move
    if (completedMove) {
      setMoveHistory(prev => [...prev, completedMove])
      setMoveCount(prev => prev + 1)
    }
    
    // Check if we have more solve moves to play
    const remainingMoves = solveMovesRef.current.slice(solveIndexRef.current + 1)
    if (remainingMoves.length > 0) {
      // Schedule next move after a small delay
      solveIndexRef.current += 1
      setTimeout(() => {
        move(remainingMoves[0])
      }, 80)
    } else {
      // Done solving
      solveIndexRef.current = 0
      solveMovesRef.current = []
    }
  }, [move])

  // Scramble - instant, no animation
  const scramble = useCallback(() => {
    const moves = generateScramble(20)
    let newCubies = createSolvedCube()
    for (const m of moves) {
      newCubies = applyMove(newCubies, m)
    }
    setCubies(newCubies)
    setMoveHistory(moves)
    setMoveCount(moves.length)
  }, [])

  // Reset
  const reset = useCallback(() => {
    setCubies(createSolvedCube())
    setMoveHistory([])
    setMoveCount(0)
    setIsAnimating(false)
    setCurrentAnimation(null)
    solveIndexRef.current = 0
    solveMovesRef.current = []
  }, [])

  // Solve - queue all moves and start playing
  const solve = useCallback(() => {
    if (moveHistory.length === 0) {
      // Already solved - nothing to do
      return
    }

    const moves = reverseMoves(moveHistory)
    solveMovesRef.current = moves
    solveIndexRef.current = 0

    // Start first move
    move(moves[0])
  }, [moveHistory, move])

  return {
    cubies,
    moveHistory,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved: checkSolved(cubies),
    move,
    onMoveComplete,
    scramble,
    reset,
    solve
  }
}
