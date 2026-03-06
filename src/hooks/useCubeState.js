import { useState, useCallback, useRef } from 'react'
import {
  createSolvedCube,
  applyMove,
  generateScramble,
  isSolved as checkSolved,
  getInverseMove
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
      if (!isSolvingRef.current) {
        setMoveHistory(prev => [...prev, completedMove])
      }
      setMoveCount(prev => prev + 1)
    }
    
    // Check if solved BEFORE queueing next move
    if (isSolvingRef.current && checkSolved(updatedCubies)) {
      console.log('Solved! Stopping.')
      isSolvingRef.current = false
      solveMovesRef.current = []
      setMoveHistory([])
      return
    }
    
    // Check if we have more solve moves to play
    if (isSolvingRef.current && solveMovesRef.current.length > 0) {
      const nextMove = solveMovesRef.current.shift()
      setTimeout(() => {
        move(nextMove)
      }, 80)
    } else if (isSolvingRef.current) {
      isSolvingRef.current = false
      solveMovesRef.current = []
      setMoveHistory([])
    }
  }, [move])

  // Scramble - instant, no animation, doesn't count toward move count
  const scramble = useCallback(() => {
    const moves = generateScramble(20)
    let newCubies = createSolvedCube()
    for (const m of moves) {
      newCubies = applyMove(newCubies, m)
    }
    setCubies(newCubies)
    setMoveHistory(moves)
    // Don't count scramble moves - reset to 0
    setMoveCount(0)
  }, [])

  // Reset - fully reset to solved state
  const reset = useCallback(() => {
    // Kill any pending animations
    setIsAnimating(false)
    setCurrentAnimation(null)
    
    // Clear solve queue
    isSolvingRef.current = false
    solveMovesRef.current = []
    
    // Reset to solved cube
    setCubies(createSolvedCube())
    setMoveHistory([])
    setMoveCount(0)
  }, [])

  // Solve - simple reverse of move history
  const solve = useCallback(() => {
    // Don't solve if already solved
    if (checkSolved(cubies)) {
      return
    }
    
    // Don't solve if no moves to reverse
    if (!moveHistory || moveHistory.length === 0) {
      return
    }

    // Reverse each move to its inverse
    const solution = [...moveHistory].reverse().map(m => getInverseMove(m))
    
    if (!solution || solution.length === 0) {
      return
    }

    isSolvingRef.current = true
    solveMovesRef.current = solution
    
    const firstMove = solveMovesRef.current.shift()
    if (firstMove) {
      move(firstMove)
    }
  }, [move, cubies, moveHistory])

  // Check if solved during solve sequence
  const checkDuringSolve = useCallback((currentCubies) => {
    const solved = checkSolved(currentCubies)
    console.log('checkDuringSolve called, isSolved:', solved, 'isSolving:', isSolvingRef.current, 'queue:', solveMovesRef.current.length)
    if (isSolvingRef.current && solved) {
      console.log('SOLVED! Stopping solve sequence')
      isSolvingRef.current = false
      solveMovesRef.current = []
      setMoveHistory([])
    }
  }, [])

  return {
    cubies,
    moveHistory,
    moveCount,
    isAnimating,
    currentAnimation,
    isSolved: checkSolved(cubies),
    move,
    onMoveComplete,
    checkDuringSolve,
    scramble,
    reset,
    solve
  }
}
