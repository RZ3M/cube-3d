import React from 'react'

export function Controls({
  onScramble,
  onSolve,
  onReset,
  moveCount,
  isSolved,
  isAnimating,
  isTouchDevice
}) {
  const hintText = isTouchDevice
    ? 'Touch and drag a cubie to turn the cube.'
    : "Drag a cubie to turn. Keys: `R L U D F B M E S`, hold `Shift` for inverse."

  return (
    <div className="hud">
      <section className="hero-card glass-panel">
        <div className="hero-copy">
          <span className="eyebrow">Interactive 3D Cube</span>
          <h1>Cube, refined.</h1>
          <p>Drag layers directly. Scramble instantly. Solve cleanly.</p>
        </div>
        <div className="hero-meta">
          <div className="metric">
            <span className="metric-label">Moves</span>
            <strong>{moveCount}</strong>
          </div>
          <div className={`metric ${isSolved && moveCount > 0 ? 'is-solved' : ''}`}>
            <span className="metric-label">State</span>
            <strong>{isSolved && moveCount > 0 ? 'Solved' : isAnimating ? 'Turning' : 'Ready'}</strong>
          </div>
        </div>
      </section>

      <section className="control-dock glass-panel">
        <div className="controls-row">
          <button
            onClick={onScramble}
            disabled={isAnimating}
            className="btn btn-secondary"
          >
            Scramble
          </button>
          <button
            onClick={onSolve}
            disabled={isAnimating || isSolved}
            className="btn btn-primary"
          >
            Solve
          </button>
          <button
            onClick={onReset}
            disabled={isAnimating}
            className="btn btn-tertiary"
          >
            Reset
          </button>
        </div>
        <p className="interaction-hint">{hintText}</p>
      </section>
    </div>
  )
}
