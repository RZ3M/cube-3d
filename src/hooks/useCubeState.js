import { useState, useCallback } from 'react'
import {
  createSolvedCube,
  applyMove,
  generateScramble,
  isSolved,
  reverseMoves
} from '../utils/cubeLogic'

export function useCubeState() {
  const [cubies, setCubies] = useState(createSolvedCube)
  const [moveHistory, setMoveHistory] = useState([])
  const [moveCount, setMoveCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState(null)
  const [scrambleMoves, setScrambleMoves] = useState([])

  // Apply a single move with animation
  const move = useCallback((moveNotation) => {
    if (isAnimating) return false

    setIsAnimating(true)
    setCurrentAnimation(moveNotation)

    // After animation completes, update state
    setTimeout(() => {
      setCubies(prev => applyMove(prev, moveNotation))
      setMoveHistory(prev => [...prev, moveNotation])
      setMoveCount(prev => prev + 1)
      setIsAnimating(false)
      setCurrentAnimation(null)
    }, 300)

    return true
  }, [isAnimating])

  // Scramble the cube
  const scramble = useCallback(() => {
    const moves = generateScramble(20)
    setScrambleMoves(moves)

    // Apply all scramble moves instantly
    let newCubies = createSolvedCube()
    for (const m of moves) {
      newCubies = applyMove(newCubies, m)
    }

    setCubies(newCubies)
    setMoveHistory(moves)
    setMoveCount(moves.length)
  }, [])

  // Reset to solved state
  const reset = useCallback(() => {
    setCubies(createSolvedCube())
    setMoveHistory([])
    setMoveCount(0)
    setScrambleMoves([])
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Auto-solve by reversing scramble moves
  const solve = useCallback(() => {
    if (scrambleMoves.length === 0) return

    const solveMoves = reverseMoves(scrambleMoves)
    setScrambleMoves([])

    // Animate each solve move sequentially
    let delay = 0
    for (const m of solveMoves) {
      setTimeout(() => {
        move(m)
      }, delay)
      delay += 350
    }
  }, [scrambleMoves, move])

  return {
    cubies,
    moveHistory,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved: isSolved(cubies),
    move,
    scramble,
    reset,
    solve
  }
}
