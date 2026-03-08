import { Point } from "pixi.js";
import StarfallAssets from "../../assets/StarfallAssets.ts";
import IHasCollisionRectangle from "../../IHasCollisionRectangle.ts";
import Camera from "../../world/Camera.ts";
import BadGem from "../BadGem.ts";
import { createBadGem } from "../GemFactory.ts";
import IBadGemBatchGenerator from "./IBadGemBatchGenerator.ts";

class BadGemPlayerStraightLineGenerator implements IBadGemBatchGenerator {
  private readonly _camera: Camera;
  private readonly _assets: StarfallAssets;
  private readonly _player: IHasCollisionRectangle;

  constructor(
    camera: Camera,
    assets: StarfallAssets,
    player: IHasCollisionRectangle,
  ) {
    this._camera = camera;
    this._assets = assets;
    this._player = player;
  }

  generateGems(gemVelocityX: number): BadGem[] {
    const startX = this._camera.x + this._camera.width + 31;

    const rect = this._player.collisionRectangle;
    const playerCenterY = rect.y + rect.height / 2;

    return [
      createBadGem(
        this._camera,
        this._assets,
        new Point(startX + 100, playerCenterY),
        2,
        gemVelocityX,
      ),
    ];
  }
}

export default BadGemPlayerStraightLineGenerator;
