const MAX_JUMPS = 6;

/**
 * Tracks available jump tokens.
 * Tokens are added by collecting GoodGems (Fase 6) and on landing.
 * Tokens are consumed on each jump.
 * UI display is implemented in Fase 5.
 */
class JumpGemBar {
  private _currentJumps: number;
  private _totalJumps = 0;

  constructor(startingJumps: number) {
    this._currentJumps = Math.min(startingJumps, MAX_JUMPS);
  }

  get jumpsAvailable() {
    return this._currentJumps;
  }

  get totalJumps() {
    return this._totalJumps;
  }

  addJump() {
    if (this._currentJumps < MAX_JUMPS) {
      this._currentJumps++;
    }
  }

  removeJump() {
    if (this._currentJumps > 0) {
      this._currentJumps--;
      this._totalJumps++;
    }
  }
}

export default JumpGemBar;
