import { AnimatedSprite, Point } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import IHasCollisionRectangle from "../IHasCollisionRectangle.ts";
import Camera from "../world/Camera.ts";
import BadGem from "./BadGem.ts";
import GoodGem from "./GoodGem.ts";

// Default floating speed (matches C# GoodGemFactory/BadGemFactory defaults)
const DEFAULT_FLOATING_SPEED = 2;

/**
 * Creates a new GoodGem at the given world position.
 * Each call creates a fresh AnimatedSprite so each gem has independent animation state.
 */
export function createGoodGem(
  camera: Camera,
  assets: StarfallAssets,
  position: Point,
  player: IHasCollisionRectangle,
  floatingSpeed: number = DEFAULT_FLOATING_SPEED,
  velocityX: number = 0,
): GoodGem {
  const anim = new AnimatedSprite(assets.textures.gems.goodGlowFrames);
  return new GoodGem(
    camera,
    anim,
    assets.textures.glowBianco,
    position,
    player,
    floatingSpeed,
    velocityX,
  );
}

/**
 * Creates a new BadGem at the given world position.
 * Each call creates a fresh AnimatedSprite so each gem has independent animation state.
 */
export function createBadGem(
  camera: Camera,
  assets: StarfallAssets,
  position: Point,
  floatingSpeed: number = DEFAULT_FLOATING_SPEED,
  velocityX: number = 0,
): BadGem {
  const anim = new AnimatedSprite(assets.textures.gems.badGlowFrames);
  return new BadGem(
    camera,
    anim,
    assets.textures.glowRosso,
    position,
    floatingSpeed,
    velocityX,
  );
}
