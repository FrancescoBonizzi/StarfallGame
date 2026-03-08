import { Point } from "pixi.js";
import StarfallAssets from "../../assets/StarfallAssets.ts";
import IHasCollisionRectangle from "../../IHasCollisionRectangle.ts";
import Numbers from "../../services/Numbers.ts";
import Camera from "../../world/Camera.ts";
import { createGoodGem } from "../GemFactory.ts";
import GoodGem from "../GoodGem.ts";
import IGoodGemBatchGenerator from "./IGoodGemBatchGenerator.ts";

// Game height used for C# → TS Y conversion (tsWorldY = csharpY - GAME_H)
const GAME_H = 480;

// C# starting Y for the diagonal (C# y=70)
const CS_Y_START = 70;

// Number of gems in the staircase (matches C# for loop i < 8)
const GEM_COUNT = 8;

class GoodGemScaleGenerator implements IGoodGemBatchGenerator {
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

  generateGems(gemVelocityX: number): GoodGem[] {
    const baseX = this._camera.x + this._camera.width + 31;
    let x = baseX;
    let y = CS_Y_START - GAME_H; // -410

    const gems: GoodGem[] = [];

    for (let i = 0; i < GEM_COUNT; i++) {
      x += 200;
      // Per-gem random xSpeed (C#: Numbers.RandomBetween(0.5f, 1f) per frame → 30-60/sec at 60fps)
      const perGemXSpeed = gemVelocityX - Numbers.randomBetween(30, 60);
      gems.push(
        createGoodGem(
          this._camera,
          this._assets,
          new Point(x, y),
          this._player,
          Numbers.randomBetween(2, 4),
          perGemXSpeed,
        ),
      );
      y += 30; // step toward ground (same sign as C# since Y increases toward ground)
    }

    return gems;
  }
}

export default GoodGemScaleGenerator;
