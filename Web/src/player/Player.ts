import {
  AnimatedSprite,
  Container,
  Point,
  Rectangle,
  Sprite,
  Ticker,
} from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import IHasCollisionRectangle from "../IHasCollisionRectangle.ts";
import CometParticleSystem from "../particleEmitters/CometParticleSystem.ts";
import Camera from "../world/Camera.ts";
import JumpGemBar from "./JumpGemBar.ts";
import PlayerAnimations from "./PlayerAnimations.ts";
import IPlayerStateContext from "./states/IPlayerStateContext.ts";
import StatesManager from "./states/StatesManager.ts";

// Initial horizontal speed in game units/second (from C# Player._xMoveSpeed)
const INITIAL_X_SPEED = 94;

// Speed increase per difficulty step (C# Player.IncreaseMovementSpeed)
const X_SPEED_INCREASE = 38;

// Visual gap: sprite feet sit this many units above Y=0 (absolute screen bottom).
// In camera-world coords: Y=0 = screen bottom, Y negative = up.
const GROUND_PAD = 25;

// Collision hitbox insets from sprite top-left (from C# RunningState / JumpingState)
const RUN_HITBOX = { x: 45, y: 38, w: 75, h: 80 } as const;
const JUMP_HITBOX = { x: 30, y: 38, w: 50, h: 90 } as const;

// If player falls more than this many units below ground, they die
// (safety net — normal death comes from BadGem collision in Fase 6)
const DEATH_Y_THRESHOLD = 60;

// Starting jump tokens (from C# StarfallGame: new JumpGemBar(..., startingJumps: 4))
const STARTING_JUMPS = 4;

// Max altitude range for ground glow alpha fade (from C# Player.Update groundGlowAlpha)
const GLOW_FADE_ALTITUDE = 375;

class Player implements IHasCollisionRectangle, IPlayerStateContext {
  private readonly _animations: PlayerAnimations;
  private _currentAnimation: AnimatedSprite;

  private readonly _glowOmino: Sprite;
  private readonly _glowTerraOmino: Sprite;

  // Game position: x = world X (grows as player runs right), y = game Y (0=ground, negative=up)
  private readonly _position: Point;
  // Velocity in game units/second
  private readonly _vel: Point;

  private _onGround = false;
  private _isDead = false;

  // Current collision hitbox (switches between run/jump variant)
  private _hitbox: typeof RUN_HITBOX | typeof JUMP_HITBOX = RUN_HITBOX;

  private readonly _camera: Camera;
  private readonly _cometSystem: CometParticleSystem;

  readonly statesManager: StatesManager;
  readonly jumpGemBar: JumpGemBar;

  constructor(assets: StarfallAssets, camera: Camera, hudContainer: Container) {
    this._camera = camera;

    this._animations = assets.player;
    this._animations.run.animationSpeed = 0.5;
    this._animations.jump.animationSpeed = 0.5;
    this._animations.death.animationSpeed = 0.4;
    this._animations.death.loop = false;

    // Start at ground level (game Y=0), centred near left of screen
    this._position = new Point(200, 0);
    this._vel = new Point(INITIAL_X_SPEED, 0);

    // Glow sprites — centred anchors for simpler offset maths
    this._glowOmino = new Sprite(assets.textures.glowOmino);
    this._glowOmino.anchor.set(0.5, 0.5);

    this._glowTerraOmino = new Sprite(assets.textures.glowTerraOmino);
    this._glowTerraOmino.anchor.set(0.5, 0.5);

    // Start with run animation active
    this._currentAnimation = this._animations.run;

    // Add to world in back-to-front order
    camera.addToWorld(this._glowTerraOmino);
    camera.addToWorld(this._glowOmino);
    camera.addToWorld(this._currentAnimation);
    this._currentAnimation.play();

    this.jumpGemBar = new JumpGemBar(hudContainer, assets, STARTING_JUMPS);
    this.statesManager = new StatesManager(this, this.jumpGemBar);

    this._cometSystem = new CometParticleSystem(assets, camera);

    // Mirror C# Player constructor: trigger initial jump to start airborne
    this.statesManager.handleJump();

    this.syncSpritePositions();
  }

  // ─── IPlayerStateContext ────────────────────────────────────────────────

  get animations(): PlayerAnimations {
    return this._animations;
  }

  get position(): { readonly x: number; readonly y: number } {
    return this._position;
  }

  get velocity(): { x: number; y: number } {
    return this._vel;
  }

  get onGround(): boolean {
    return this._onGround;
  }

  set onGround(v: boolean) {
    this._onGround = v;
  }

  setCurrentAnimation(anim: AnimatedSprite) {
    if (anim === this._currentAnimation) return;
    this._camera.removeFromWorld(this._currentAnimation);
    this._currentAnimation.stop();
    this._currentAnimation = anim;
    this._camera.addToWorld(this._currentAnimation);
    this._currentAnimation.play();
  }

  // ─── IHasCollisionRectangle ─────────────────────────────────────────────

  get collisionRectangle(): Rectangle {
    const hb = this._hitbox;
    // Camera world: Y=0 = screen bottom, negative = up.
    // Sprite top = position.y - spriteHeight - GROUND_PAD
    return new Rectangle(
      this._position.x + hb.x,
      this._position.y - this._currentAnimation.height - GROUND_PAD + hb.y,
      this._currentAnimation.width - hb.w,
      this._currentAnimation.height - hb.h,
    );
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  get isDead() {
    return this._isDead;
  }

  /** Horizontal speed; used by Game.ts to drive parallax layers. */
  get velocityX() {
    return this._vel.x;
  }

  get bestJumpDuration() {
    return this.statesManager.bestJumpDuration;
  }

  /** Called by Game.ts on difficulty increase. */
  increaseMovementSpeed() {
    this._vel.x += X_SPEED_INCREASE;
    // Slightly speed up run animation
    this._animations.run.animationSpeed = Math.min(
      1.0,
      this._animations.run.animationSpeed + 0.05,
    );
  }

  die() {
    if (this._isDead) return;
    this._isDead = true;
    this._camera.removeFromWorld(this._glowOmino);
    this.setCurrentAnimation(this._animations.death);
    this._animations.death.loop = false;
    this._vel.x = 0; // stop horizontal movement on death
  }

  update(time: Ticker) {
    if (!this._isDead) {
      // 1. State machine tick (may apply gravity, detect landing, trigger jump)
      this.statesManager.update(time);

      const dt = time.elapsedMS / 1000;

      // 2. Integrate position
      this._position.x += this._vel.x * dt;
      this._position.y += this._vel.y * dt;

      // 3. Ground collision: snap to ground and flag for state machine
      if (this._position.y >= 0) {
        this._position.y = 0;
        this._onGround = true;
        this._hitbox = RUN_HITBOX;
      } else {
        this._hitbox = JUMP_HITBOX;
      }

      // 4. Safety-net death (should not happen in normal play)
      if (this._position.y > DEATH_Y_THRESHOLD) {
        this.die();
        return;
      }
    }

    this.syncSpritePositions();

    // 5. Comet particle trail (alive only — emit at sprite centre in camera-world coords)
    if (!this._isDead) {
      const h = this._currentAnimation.height;
      const w = this._currentAnimation.width;
      this._cometSystem.addParticles(
        new Point(
          this._position.x + w / 2,
          this._position.y - h / 2 - GROUND_PAD,
        ),
      );
    }

    // 6. Tick particle and token animations (both alive and dead — let them finish)
    this._cometSystem.update(time);
    this.jumpGemBar.update(time);
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private syncSpritePositions() {
    const h = this._currentAnimation.height;
    const w = this._currentAnimation.width;

    // Camera world: Y=0 = screen bottom, Y negative = up.
    // Sprite feet sit at (position.y - GROUND_PAD); top is GROUND_PAD + height above that.
    const spriteY = this._position.y - h - GROUND_PAD;
    this._currentAnimation.x = this._position.x;
    this._currentAnimation.y = spriteY;

    // Body glow: centred on the player sprite
    this._glowOmino.x = this._position.x + w / 2;
    this._glowOmino.y = spriteY + h / 2;

    // Ground glow: centre just below Y=0 (screen bottom), peeks from the edge
    this._glowTerraOmino.x = this._position.x + w / 2 - 22;
    this._glowTerraOmino.y = -GROUND_PAD; // Centred at player feet level; bottom half extends off-screen

    // Fade ground glow as player climbs (fully visible at ground, invisible at max altitude)
    const altitude = -this._position.y;
    this._glowTerraOmino.alpha = Math.max(0, 1 - altitude / GLOW_FADE_ALTITUDE);
  }
}

export default Player;
