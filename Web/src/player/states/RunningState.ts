import { Ticker } from "pixi.js";
import IPlayerState from "./IPlayerState.ts";
import IPlayerStateContext from "./IPlayerStateContext.ts";

class RunningState implements IPlayerState {
  private _wantToJump = false;

  constructor(
    private readonly _player: IPlayerStateContext,
    private readonly _getJumpingState: () => IPlayerState,
  ) {}

  enter() {
    this._wantToJump = false;
    this._player.onGround = true;
    this._player.setCurrentAnimation(this._player.animations.run);
  }

  handleJump() {
    this._wantToJump = true;
  }

  update(_time: Ticker): IPlayerState {
    if (this._wantToJump) return this._getJumpingState();
    return this;
  }
}

export default RunningState;
