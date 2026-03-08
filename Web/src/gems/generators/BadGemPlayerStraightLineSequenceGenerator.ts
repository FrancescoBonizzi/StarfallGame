import { Point } from "pixi.js";
import StarfallAssets from "../../assets/StarfallAssets.ts";
import Camera from "../../world/Camera.ts";
import BadGem from "../BadGem.ts";
import { createBadGem } from "../GemFactory.ts";
import IBadGemBatchGenerator from "./IBadGemBatchGenerator.ts";

// Game height for C# → TS Y conversion (tsWorldY = csharpY - GAME_H)
const GAME_H = 480;

class BadGemPlayerStraightLineSequenceGenerator implements IBadGemBatchGenerator {
  private readonly _camera: Camera;
  private readonly _assets: StarfallAssets;

  constructor(camera: Camera, assets: StarfallAssets) {
    this._camera = camera;
    this._assets = assets;
  }

  generateGems(gemVelocityX: number): BadGem[] {
    const startX = this._camera.x + this._camera.width + 31;

    return [
      createBadGem(
        this._camera,
        this._assets,
        new Point(startX + 100, 250 - GAME_H), // y = -230
        2,
        gemVelocityX,
      ),
      createBadGem(
        this._camera,
        this._assets,
        new Point(startX + 500, 380 - GAME_H), // y = -100
        2,
        gemVelocityX,
      ),
    ];
  }
}

export default BadGemPlayerStraightLineSequenceGenerator;
