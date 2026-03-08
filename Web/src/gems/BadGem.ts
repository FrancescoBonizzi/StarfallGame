import { AnimatedSprite, Point } from "pixi.js";
import Camera from "../world/Camera.ts";
import Gem from "./Gem.ts";

class BadGem extends Gem {
  constructor(
    camera: Camera,
    animatedSprite: AnimatedSprite,
    groundGlowRossoTexture: import("pixi.js").Texture,
    position: Point,
    floatingSpeed: number,
    velocityX: number = 0,
  ) {
    super(
      camera,
      animatedSprite,
      groundGlowRossoTexture,
      position,
      floatingSpeed,
      velocityX,
    );
  }

  protected override get minScale(): number {
    return 1.0;
  }
  protected override get maxScale(): number {
    return 2.0;
  }
}

export default BadGem;
