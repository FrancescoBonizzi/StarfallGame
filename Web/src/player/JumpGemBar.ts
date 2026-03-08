import { Container, Sprite, Ticker } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import Numbers from "../services/Numbers.ts";

const MAX_JUMPS = 6;
const TOKEN_SCALE = 0.4;
const TOKEN_START_X = 50;
const TOKEN_GAP = 10;
// Screen Y for token centre: slightly above HUD bar centre for visual breathing room
const TOKEN_Y = 468;
const ALPHA_ACTIVE = 1.0;
const ALPHA_INACTIVE = 0.3;
const FADE_IN_MS = 300;
const FADE_OUT_MS = 150;

interface TokenAnimation {
  elapsedMs: number;
  fromAlpha: number;
  toAlpha: number;
  durationMs: number;
}

/**
 * Tracks available jump tokens and renders them as animated sprites in the HUD.
 * Logic: tokens are consumed on each jump (removeJump) and restored on landing or
 * by collecting GoodGems (addJump).
 * Display: 6 fixed sprite slots — active tokens show at full alpha, inactive at dim alpha.
 */
class JumpGemBar {
  private _currentJumps: number;
  private _totalJumps = 0;

  private readonly _tokens: Sprite[];
  private readonly _tokenAnimations: (TokenAnimation | null)[];

  constructor(
    container: Container,
    assets: StarfallAssets,
    startingJumps: number,
  ) {
    this._currentJumps = Math.min(startingJumps, MAX_JUMPS);

    const tex = assets.textures.gems.goodGlowFrames[0]!;
    const tokenDisplayW = tex.width * TOKEN_SCALE;

    this._tokens = [];
    this._tokenAnimations = [];

    for (let i = 0; i < MAX_JUMPS; i++) {
      const sprite = new Sprite(tex);
      sprite.anchor.set(0.5, 0.5);
      sprite.scale.set(TOKEN_SCALE);
      sprite.x = TOKEN_START_X + i * (tokenDisplayW + TOKEN_GAP);
      sprite.y = TOKEN_Y;
      sprite.alpha = i < this._currentJumps ? ALPHA_ACTIVE : ALPHA_INACTIVE;
      container.addChild(sprite);
      this._tokens.push(sprite);
      this._tokenAnimations.push(null);
    }
  }

  get jumpsAvailable() {
    return this._currentJumps;
  }

  get totalJumps() {
    return this._totalJumps;
  }

  addJump() {
    if (this._currentJumps < MAX_JUMPS) {
      const idx = this._currentJumps;
      this._currentJumps++;
      this._startAnimation(idx, ALPHA_INACTIVE, ALPHA_ACTIVE, FADE_IN_MS);
    }
  }

  removeJump() {
    if (this._currentJumps > 0) {
      this._currentJumps--;
      this._totalJumps++;
      const idx = this._currentJumps;
      this._startAnimation(idx, ALPHA_ACTIVE, ALPHA_INACTIVE, FADE_OUT_MS);
    }
  }

  update(time: Ticker) {
    for (let i = 0; i < MAX_JUMPS; i++) {
      const anim = this._tokenAnimations[i];
      if (anim == null) continue;

      anim.elapsedMs = Math.min(anim.elapsedMs + time.deltaMS, anim.durationMs);
      const p = anim.elapsedMs / anim.durationMs;
      const eased = Numbers.easeOutCubic(p);
      this._tokens[i]!.alpha = Numbers.lerp(
        anim.fromAlpha,
        anim.toAlpha,
        eased,
      );

      if (p >= 1) {
        this._tokenAnimations[i] = null;
      }
    }
  }

  private _startAnimation(
    idx: number,
    from: number,
    to: number,
    durationMs: number,
  ) {
    const currentAlpha = this._tokens[idx]?.alpha ?? from;
    this._tokenAnimations[idx] = {
      elapsedMs: 0,
      fromAlpha: currentAlpha,
      toAlpha: to,
      durationMs,
    };
  }
}

export default JumpGemBar;
