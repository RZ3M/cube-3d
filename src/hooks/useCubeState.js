import { useState, useCallback, useRef } from 'react'
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

  // Solve state
  const isSolvingRef = useRef(false)
  const solveMovesRef = useRef([])

  // Start a single move
  const move = useCallback((moveNotation) => {
    setIsAnimating(true)
    setCurrentAnimation(moveNotation)
  }, [])

  // Called by Cube component when animation finishes
  const onMoveComplete = useCallback((updatedCubies, completedMove) => {
    setCubies(updatedCubies)
    setCurrentAnimation(null)
    setIsAnimating(false)
    
    if (completedMove) {
      // Only track manual moves, not solve moves
      if (!isSolvingRef.current) {
        setMoveHistory(prev => [...prev, completedMove])
      }
      setMoveCount(prev => prev + 1)
    }
    
    // Check if we have more solve moves to play
    if (isSolvingRef.current && solveMovesRef.current.length > 0) {
      const nextMove = solveMovesRef.current.shift()
      setTimeout(() => {
        move(nextMove)
      }, 80)
    } else if (isSolvingRef.current) {
      // All solve moves done
      isSolvingRef.current = false
      solveMovesRef.current = []
      setMoveHistory([])
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
    isSolvingRef.current = false
    solveMovesRef.current = []
  }, [])

  // Solve - only if not already solved and has moves
  const solve = useCallback(() => {
    if (checkSolved(cubies) || moveHistory.length === 0) {
      return
    }

    isSolvingRef.current = true
    solveMovesRef.current = reverseMoves(moveHistory)
    
    // Start first move
    const firstMove = solveMovesRef.current.shift()
    if (firstMove) {
      move(firstMove)
    }
  }, [moveHistory, move, cubies])

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
