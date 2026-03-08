import {
  AnimatedSprite,
  Point,
  Rectangle,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import IHasCollisionRectangle from "../IHasCollisionRectangle.ts";
import Numbers from "../services/Numbers.ts";
import Camera from "../world/Camera.ts";

// Oscillation speed for scale breathing (matches C# _scalingSpeed = 2.5)
const SCALE_SPEED = 2.5;

// Y below ground for ground-glow sprite (matches Player GROUND_PAD)
const GROUND_PAD = 25;

// Game height for alpha fade calculation
const GAME_H = 480;

// Fade duration after takeMe() in milliseconds (C# FadeObject 200ms)
const FADE_DURATION_MS = 200;

abstract class Gem implements IHasCollisionRectangle {
  private readonly _sprite: AnimatedSprite;
  private readonly _groundGlow: Sprite;

  // World position (Y=0=ground, negative=up) — same coordinate system as Player
  protected _worldX: number;
  protected _worldY: number;
  private readonly _startingWorldY: number;
  private readonly _floatingSpeed: number;
  private readonly _amplitude: number;
  protected readonly _velocityX: number;

  protected _elapsedMs = 0;
  private _isTaken = false;
  private _fadeElapsedMs = 0;

  protected abstract get minScale(): number;
  protected abstract get maxScale(): number;

  constructor(
    camera: Camera,
    animatedSprite: AnimatedSprite,
    groundGlowTexture: Texture,
    position: Point,
    floatingSpeed: number,
    velocityX: number = 0,
  ) {
    this._worldX = position.x;
    this._worldY = position.y;
    this._startingWorldY = position.y;
    this._floatingSpeed = floatingSpeed;
    this._velocityX = velocityX;
    this._amplitude = Numbers.randomBetween(1, 12);

    this._sprite = animatedSprite;
    this._sprite.anchor.set(0.5, 0.5);
    this._sprite.x = this._worldX;
    this._sprite.y = this._worldY;
    this._sprite.animationSpeed = 0.4;
    this._sprite.play();
    camera.addToWorld(this._sprite);

    this._groundGlow = new Sprite(groundGlowTexture);
    this._groundGlow.anchor.set(0.5, 0.5);
    this._groundGlow.x = this._worldX - 62;
    this._groundGlow.y = -GROUND_PAD;
    camera.addToWorld(this._groundGlow);
  }

  // ─── IHasCollisionRectangle ─────────────────────────────────────────────

  get collisionRectangle(): Rectangle {
    if (this._isTaken) return new Rectangle(0, 0, 0, 0);
    const w = this._sprite.width;
    const h = this._sprite.height;
    return new Rectangle(this._worldX - w / 2, this._worldY - h / 2, w, h);
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  get isTaken(): boolean {
    return this._isTaken;
  }

  /** World X (center). Used by isOutOfCameraLeft check. */
  get x(): number {
    return this._worldX;
  }

  /** Width of the gem sprite. */
  get width(): number {
    return this._sprite.width;
  }

  /** Mark gem as collected — starts 200ms fade-out. */
  takeMe(): void {
    this._isTaken = true;
  }

  /**
   * Returns true while the gem should still be updated and kept alive.
   * False when scrolled off the left edge OR fully faded after collection.
   */
  isActive(camera: Camera): boolean {
    if (this._isTaken && this._fadeElapsedMs >= FADE_DURATION_MS) return false;
    // isOutOfCameraLeft expects left-edge x; our sprite is centered so adjust
    return !camera.isOutOfCameraLeft({
      x: this._worldX - this._sprite.width / 2,
      width: this._sprite.width,
    });
  }

  update(time: Ticker): void {
    this._elapsedMs += time.elapsedMS;
    const dt = time.elapsedMS / 1000;

    if (this._isTaken) {
      this._fadeElapsedMs += time.elapsedMS;
      const alpha = Math.max(0, 1 - this._fadeElapsedMs / FADE_DURATION_MS);
      this._sprite.alpha = alpha;
      this._groundGlow.alpha = 0;
      return;
    }

    this._sprite.update(time);

    this.updatePosition(dt);

    // Scale oscillation (matches C# Numbers.GenerateDeltaOverTimeSin)
    const scaleT = (this._elapsedMs / 1000) * SCALE_SPEED;
    const s = Numbers.generateDeltaOverTimeSin(
      scaleT,
      this.minScale,
      this.maxScale,
    );
    this._sprite.scale.set(s);

    // Sync sprite position
    this._sprite.x = this._worldX;
    this._sprite.y = this._worldY;

    // Ground glow: fixed Y at ground level, X tracks gem with -62 offset
    this._groundGlow.x = this._worldX - 62;
    // Alpha fades as gem rises: 1 at ground (Y=0), 0 at top (Y=-GAME_H)
    this._groundGlow.alpha = Numbers.clamp01(1 + this._worldY / GAME_H);
  }

  destroy(camera: Camera): void {
    camera.removeFromWorld(this._sprite);
    camera.removeFromWorld(this._groundGlow);
    this._sprite.destroy();
    this._groundGlow.destroy();
  }

  // ─── Protected ──────────────────────────────────────────────────────────

  /** Subclasses override for custom movement (e.g. GoodGem magnetic pull). */
  protected updatePosition(dt: number): void {
    // Horizontal: drift in world space — creates visual movement relative to camera
    this._worldX += this._velocityX * dt;
    // Vertical: floating oscillation (matches C# deltaYFunctionOverTime = sin)
    this._worldY =
      this._startingWorldY +
      Math.sin((this._elapsedMs / 1000) * this._floatingSpeed) *
        this._amplitude;
  }
}

export default Gem;
