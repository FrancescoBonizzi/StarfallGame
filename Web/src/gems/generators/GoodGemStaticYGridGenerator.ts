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

class GoodGemStaticYGridGenerator implements IGoodGemBatchGenerator {
  private readonly _camera: Camera;
  private readonly _assets: StarfallAssets;
  private readonly _player: IHasCollisionRectangle;
  private readonly _yStartingLineCSharp: number;
  private readonly _nRows: number;
  private readonly _nColumns: number;

  constructor(
    camera: Camera,
    assets: StarfallAssets,
    player: IHasCollisionRectangle,
    yStartingLineCSharp: number,
    nRows: number,
    nColumns: number,
  ) {
    this._camera = camera;
    this._assets = assets;
    this._player = player;
    this._yStartingLineCSharp = yStartingLineCSharp;
    this._nRows = nRows;
    this._nColumns = nColumns;
  }

  generateGems(gemVelocityX: number): GoodGem[] {
    const startX = this._camera.x + this._camera.width + 31;
    const yStart = this._yStartingLineCSharp - GAME_H;
    const gems: GoodGem[] = [];

    for (let row = 0; row < this._nRows; row++) {
      let x = startX;
      const y = yStart + row * 100;
      for (let col = 0; col < this._nColumns; col++) {
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
        x += 200;
      }
    }

    return gems;
  }
}

export default GoodGemStaticYGridGenerator;
