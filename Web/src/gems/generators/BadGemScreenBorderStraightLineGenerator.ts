import { Point } from "pixi.js";
import StarfallAssets from "../../assets/StarfallAssets.ts";
import Camera from "../../world/Camera.ts";
import BadGem from "../BadGem.ts";
import { createBadGem } from "../GemFactory.ts";
import IBadGemBatchGenerator from "./IBadGemBatchGenerator.ts";

// Game height for C# → TS Y conversion (tsWorldY = csharpY - GAME_H)
const GAME_H = 480;

// C# positions: y=50 (near top) and y=VirtualHeight-80=400 (near bottom)
const CS_Y_TOP = 50;
const CS_Y_BOTTOM = 400;

class BadGemScreenBorderStraightLineGenerator implements IBadGemBatchGenerator {
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
        new Point(startX + 100, CS_Y_TOP - GAME_H), // y = -430
        2,
        gemVelocityX,
      ),
      createBadGem(
        this._camera,
        this._assets,
        new Point(startX + 100, CS_Y_BOTTOM - GAME_H), // y = -80
        2,
        gemVelocityX,
      ),
    ];
  }
}

export default BadGemScreenBorderStraightLineGenerator;
