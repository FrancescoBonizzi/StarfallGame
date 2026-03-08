import { ColorSource, Point, Text, Ticker } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import Camera from "../world/Camera.ts";

// C# PopupObject: rises 130px/s, parabolic alpha fade (4t(1-t)), fixed scale 0.5
const RISE_SPEED = 130; // px/s upward (camera world: negative Y = up)
const TEXT_SCALE = 0.5;

class PopupText {
  private readonly _text: Text;
  private readonly _camera: Camera;
  private readonly _durationMs: number;

  private _elapsedMs = 0;
  private _done = false;

  constructor(
    camera: Camera,
    assets: StarfallAssets,
    position: Point,
    message: string,
    color: ColorSource,
    durationMs: number,
  ) {
    this._camera = camera;
    this._durationMs = durationMs;

    this._text = new Text({
      text: message,
      style: {
        fontFamily: assets.fontName,
        fontSize: 48,
        fill: { color },
        stroke: { color: "#000000", width: 3 },
        align: "center",
      },
    });

    this._text.anchor.set(0.5, 0.5);
    this._text.scale.set(TEXT_SCALE);
    this._text.x = position.x;
    this._text.y = position.y;

    this._camera.addToWorld(this._text);
  }

  get isDone(): boolean {
    return this._done;
  }

  update(ticker: Ticker): void {
    if (this._done) return;

    const dt = ticker.elapsedMS / 1000;
    this._elapsedMs += ticker.elapsedMS;

    const t = Math.min(1, this._elapsedMs / this._durationMs);

    if (t >= 1) {
      this._done = true;
      return;
    }

    // Rise upward in camera-world coords (Y negative = up)
    this._text.y -= RISE_SPEED * dt;

    // Parabolic alpha: fades in then out, peaks at t=0.5 (C# formula: 4t(1-t))
    this._text.alpha = 4 * t * (1 - t);
  }

  destroy(): void {
    this._camera.removeFromWorld(this._text);
    this._text.destroy();
  }
}

export default PopupText;
