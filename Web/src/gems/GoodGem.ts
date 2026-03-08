import { AnimatedSprite, Point } from "pixi.js";
import IHasCollisionRectangle from "../IHasCollisionRectangle.ts";
import Numbers from "../services/Numbers.ts";
import Camera from "../world/Camera.ts";
import Gem from "./Gem.ts";

// Squared distance threshold for attraction trigger (C# 100*100)
const ATTRACT_DIST_SQ = 100 * 100;

// Lerp rate toward player per frame (matches C# MathHelper.Lerp t=0.1)
const ATTRACT_LERP = 0.1;

class GoodGem extends Gem {
  private readonly _player: IHasCollisionRectangle;
  private _isInAttraction = false;

  constructor(
    camera: Camera,
    animatedSprite: AnimatedSprite,
    groundGlowBiancoTexture: import("pixi.js").Texture,
    position: Point,
    player: IHasCollisionRectangle,
    floatingSpeed: number,
    velocityX: number = 0,
  ) {
    super(
      camera,
      animatedSprite,
      groundGlowBiancoTexture,
      position,
      floatingSpeed,
      velocityX,
    );
    this._player = player;
  }

  protected override get minScale(): number {
    return 0.7;
  }
  protected override get maxScale(): number {
    return 1.1;
  }

  // Sinusoidal oscillation ±100px (matches C# deltaYFunctionOverTime = Numbers.GenerateDeltaOverTimeSin(x, -100, 100))
  protected override computeFloatingOffsetY(t: number): number {
    return Numbers.generateDeltaOverTimeSin(t, -100, 100);
  }

  protected override updatePosition(dt: number): void {
    const rect = this._player.collisionRectangle;
    const playerCenterX = rect.x + rect.width / 2;
    const playerCenterY = rect.y + rect.height / 2;

    const dx = playerCenterX - this._worldX;
    const dy = playerCenterY - this._worldY;
    const distSq = dx * dx + dy * dy;

    if (distSq <= ATTRACT_DIST_SQ || this._isInAttraction) {
      this._isInAttraction = true;
      this._worldX = Numbers.lerp(this._worldX, playerCenterX, ATTRACT_LERP);
      this._worldY = Numbers.lerp(this._worldY, playerCenterY, ATTRACT_LERP);
    } else {
      // Standard floating + horizontal drift
      super.updatePosition(dt);
    }
  }
}

export default GoodGem;
