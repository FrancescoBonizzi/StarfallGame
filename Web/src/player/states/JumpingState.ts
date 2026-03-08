import { Ticker } from "pixi.js";
import JumpGemBar from "../JumpGemBar.ts";
import IPlayerState from "./IPlayerState.ts";
import IPlayerStateContext from "./IPlayerStateContext.ts";

// Jump impulse in game units/s (negative = upward, game Y: 0=ground, negative=up)
const JUMP_IMPULSE = -410;

// Gravity acceleration in game units/s² (positive = downward toward ground)
const GRAVITY = 780; // 13 per frame * 60 fps

// Guard: can't jump if more than 300 units above ground
const MAX_JUMP_GAME_Y = -300;

class JumpingState implements IPlayerState {
  constructor(
    private readonly _player: IPlayerStateContext,
    private readonly _jumpGemBar: JumpGemBar,
    private readonly _getRunningState: () => IPlayerState,
  ) {}

  enter() {
    this._player.onGround = false;
    this._player.setCurrentAnimation(this._player.animations.jump);
    this.handleJump(); // apply first jump impulse immediately on state entry
  }

  handleJump() {
    if (
      this._jumpGemBar.jumpsAvailable > 0 &&
      this._player.position.y >= MAX_JUMP_GAME_Y
    ) {
      this._player.velocity.y = JUMP_IMPULSE;
      this._jumpGemBar.removeJump();
    }
  }

  update(time: Ticker): IPlayerState {
    const dt = time.elapsedMS / 1000;
    this._player.velocity.y += GRAVITY * dt;

    if (this._player.onGround) {
      this._player.velocity.y = 0;
      this._jumpGemBar.addJump(); // gift one jump token on landing
      return this._getRunningState();
    }
    return this;
  }
}

export default JumpingState;
