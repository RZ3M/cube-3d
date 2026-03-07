import { useState, useCallback, useEffect, useRef } from 'react'
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
  const isAnimatingRef = useRef(false)
  const solveQueueRef = useRef([])

  const startMove = useCallback((moveNotation) => {
    if (!moveNotation || isAnimatingRef.current) return false

    isAnimatingRef.current = true
    setIsAnimating(true)
    setCurrentAnimation(moveNotation)

    return true
  }, [])

  // Apply a single move with animation
  const move = useCallback((moveNotation) => {
    return startMove(moveNotation)
  }, [startMove])

  const completeMove = useCallback((moveNotation) => {
    if (!moveNotation) return

    setCubies(prev => applyMove(prev, moveNotation))
    setMoveHistory(prev => [...prev, moveNotation])
    setMoveCount(prev => prev + 1)
    isAnimatingRef.current = false
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Scramble the cube
  const scramble = useCallback(() => {
    const moves = generateScramble(20)
    solveQueueRef.current = []
    isAnimatingRef.current = false
    setScrambleMoves(moves)

    // Apply all scramble moves instantly
    let newCubies = createSolvedCube()
    for (const m of moves) {
      newCubies = applyMove(newCubies, m)
    }

    setCubies(newCubies)
    setMoveHistory(moves)
    setMoveCount(moves.length)
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Reset to solved state
  const reset = useCallback(() => {
    solveQueueRef.current = []
    isAnimatingRef.current = false
    setCubies(createSolvedCube())
    setMoveHistory([])
    setMoveCount(0)
    setScrambleMoves([])
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Auto-solve by reversing scramble moves
  const solve = useCallback(() => {
    if (scrambleMoves.length === 0 || isAnimatingRef.current) return

    const solveMoves = reverseMoves(scrambleMoves)
    const [firstMove, ...remainingMoves] = solveMoves

    solveQueueRef.current = remainingMoves
    setScrambleMoves([])

    if (firstMove) {
      startMove(firstMove)
    }
  }, [scrambleMoves, startMove])

  useEffect(() => {
    if (isAnimating || currentAnimation !== null || solveQueueRef.current.length === 0) return

    const nextMove = solveQueueRef.current.shift()
    if (nextMove) {
      startMove(nextMove)
    }
  }, [isAnimating, currentAnimation, startMove])

  return {
    cubies,
    moveHistory,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved: isSolved(cubies),
    move,
    completeMove,
    scramble,
    reset,
    solve
  }
}
