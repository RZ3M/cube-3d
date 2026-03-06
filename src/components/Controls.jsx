import React from 'react'

export function Controls({ onScramble, onSolve, onReset, moveCount, isSolved, isAnimating }) {
  return (
    <div className="controls">
      <div className="controls-row">
        <button
          onClick={onScramble}
          disabled={isAnimating}
          className="btn btn-scramble"
        >
          Scramble
        </button>
        <button
          onClick={onSolve}
          disabled={isAnimating || isSolved}
          className="btn btn-solve"
        >
          Solve
        </button>
        <button
          onClick={onReset}
          disabled={isAnimating}
          className="btn btn-reset"
        >
          Reset
        </button>
      </div>
      <div className="stats">
        <span className="move-counter">Moves: {moveCount}</span>
        {isSolved && moveCount > 0 && (
          <span className="solved-text">Solved!</span>
        )}
      </div>
      <div className="instructions">
        <p>Click and drag on a face to rotate</p>
        <p>Or use keyboard: R, L, U, D, F, B (Shift for counter-clockwise)</p>
      </div>
    </div>
  )
}
