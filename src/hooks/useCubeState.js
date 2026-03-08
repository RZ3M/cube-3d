import { useState, useCallback, useEffect, useRef } from 'react'
import {
  createSolvedCube,
  applyMove,
  generateScramble,
  isSolved,
  reverseMoves,
  normalizeMoves
} from '../utils/cubeLogic'

export function useCubeState() {
  const [cubies, setCubies] = useState(createSolvedCube)
  const [moveHistory, setMoveHistory] = useState([])
  const [moveCount, setMoveCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentAnimation, setCurrentAnimation] = useState(null)
  const cubiesRef = useRef(cubies)
  const isAnimatingRef = useRef(false)
  const solveQueueRef = useRef([])
  const animationTokenRef = useRef(0)
  const stateMovesRef = useRef([])

  useEffect(() => {
    cubiesRef.current = cubies
  }, [cubies])

  const startMove = useCallback((moveNotation) => {
    if (!moveNotation || isAnimatingRef.current) return false

    isAnimatingRef.current = true
    setIsAnimating(true)
    animationTokenRef.current += 1
    setCurrentAnimation({
      move: moveNotation,
      token: animationTokenRef.current
    })

    return true
  }, [])

  // Apply a single move with animation
  const move = useCallback((moveNotation) => {
    return startMove(moveNotation)
  }, [startMove])

  const completeMove = useCallback((moveNotation) => {
    if (!moveNotation) return

    const nextCubies = applyMove(cubiesRef.current, moveNotation)
    const nextMoves = normalizeMoves([...stateMovesRef.current, moveNotation])
    const solved = isSolved(nextCubies)

    cubiesRef.current = nextCubies
    setCubies(nextCubies)
    setMoveHistory(prev => [...prev, moveNotation])
    setMoveCount(prev => prev + 1)
    stateMovesRef.current = solved ? [] : nextMoves
    if (solved) {
      solveQueueRef.current = []
    }
    isAnimatingRef.current = false
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Scramble the cube
  const scramble = useCallback(() => {
    const moves = generateScramble(20)
    solveQueueRef.current = []
    isAnimatingRef.current = false

    // Apply all scramble moves instantly
    let newCubies = createSolvedCube()
    for (const m of moves) {
      newCubies = applyMove(newCubies, m)
    }

    setCubies(newCubies)
    cubiesRef.current = newCubies
    setMoveHistory([])
    setMoveCount(0)
    stateMovesRef.current = normalizeMoves(moves)
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  // Reset to solved state
  const reset = useCallback(() => {
    solveQueueRef.current = []
    isAnimatingRef.current = false
    const solvedCubies = createSolvedCube()
    setCubies(solvedCubies)
    cubiesRef.current = solvedCubies
    setMoveHistory([])
    setMoveCount(0)
    stateMovesRef.current = []
    setIsAnimating(false)
    setCurrentAnimation(null)
  }, [])

  const solve = useCallback(() => {
    if (isAnimatingRef.current || isSolved(cubies)) return

    const solveMoves = reverseMoves(stateMovesRef.current)
    const [firstMove, ...remainingMoves] = solveMoves

    if (!firstMove) return

    setMoveHistory([])
    setMoveCount(0)

    solveQueueRef.current = remainingMoves

    startMove(firstMove)
  }, [cubies, startMove])

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
