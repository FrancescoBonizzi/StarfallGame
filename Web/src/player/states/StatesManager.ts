import { Ticker } from "pixi.js";
import JumpGemBar from "../JumpGemBar.ts";
import IPlayerState from "./IPlayerState.ts";
import IPlayerStateContext from "./IPlayerStateContext.ts";
import JumpingState from "./JumpingState.ts";
import RunningState from "./RunningState.ts";

class StatesManager {
  private _currentState: IPlayerState;
  readonly runningState: RunningState;
  readonly jumpingState: JumpingState;

  // tracks how long the player stays airborne per jump
  private _isJumpTimerRunning = false;
  private _currentJumpDuration = 0;
  private _bestJumpDuration = 0;

  constructor(player: IPlayerStateContext, jumpGemBar: JumpGemBar) {
    this.runningState = new RunningState(player, () => this.jumpingState);
    this.jumpingState = new JumpingState(
      player,
      jumpGemBar,
      () => this.runningState,
    );

    this._currentState = this.runningState;
    this._currentState.enter();
  }

  handleJump() {
    this._currentState.handleJump();
  }

  update(time: Ticker) {
    if (this._isJumpTimerRunning) {
      this._currentJumpDuration += time.elapsedMS / 1000;
      if (this._currentJumpDuration > this._bestJumpDuration) {
        this._bestJumpDuration = this._currentJumpDuration;
      }
    }

    const newState = this._currentState.update(time);
    if (newState !== this._currentState) {
      if (newState === this.jumpingState) {
        this._isJumpTimerRunning = true;
        this._currentJumpDuration = 0;
      } else {
        this._isJumpTimerRunning = false;
      }
      this._currentState = newState;
      this._currentState.enter();
    }
  }

  get bestJumpDuration() {
    return this._bestJumpDuration;
  }
}

export default StatesManager;
