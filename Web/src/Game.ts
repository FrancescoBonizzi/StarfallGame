import { Application, Ticker } from "pixi.js";
import StarfallAssets from "./assets/StarfallAssets.ts";
import FillBackground from "./background/FillBackground.ts";
import HorizontalScrollingBackground from "./background/HorizontalScrollingBackground.ts";
import SoundManager from "./services/SoundManager.ts";
import Camera from "./world/Camera.ts";

// Scroll speed multiplier (matches C# StarfallGame.cs)
const PARALLAX_MULTIPLIER = 1.5;

// [backgrounds array index, parallax scroll speed]
// Drawn from back to front: layer6 (slowest) → layer0 (fastest)
const LAYER_DEFS: [number, number][] = [
  [8, -0.6 * PARALLAX_MULTIPLIER], // layer6 / bg6
  [7, -0.5 * PARALLAX_MULTIPLIER], // layer5 / bg5
  [6, -0.2 * PARALLAX_MULTIPLIER], // layer4 / bg4
  [5, 0.0 * PARALLAX_MULTIPLIER], // layer3 / bg3 (static)
  [4, 0.3 * PARALLAX_MULTIPLIER], // layer2 / bg2
  [1, 0.8 * PARALLAX_MULTIPLIER], // layer1 / bg1a
  [0, 1.0 * PARALLAX_MULTIPLIER], // layer0 / bg0
];

// Typical player horizontal speed (pixels/second)
const TEST_SPEED = 400;

class Game {
  private readonly _bgLayers: HorizontalScrollingBackground[];

  // TEMP Phase 3: keyboard velocity for parallax testing — remove in Phase 4
  private _testVX = 0;
  private readonly _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") this._testVX = TEST_SPEED;
    if (e.key === "ArrowLeft") this._testVX = -TEST_SPEED;
  };
  private readonly _onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") this._testVX = 0;
  };

  constructor(
    assets: StarfallAssets,
    app: Application,
    _soundManager: SoundManager,
  ) {
    const t = assets.textures.backgrounds;

    // Layer7: static fill background — must be first on stage (drawn behind everything)
    new FillBackground(t[9]!, app);

    // Parallax layers — drawn over fill bg, under camera world
    this._bgLayers = LAYER_DEFS.map(
      ([idx, speed]) => new HorizontalScrollingBackground(t[idx]!, speed, app),
    );

    // Camera: constructor adds its world container to app.stage.
    // Reference stored in Phase 4 when player + gems need camera.addToWorld().
    new Camera(app);

    // TEMP Phase 3: register keyboard for parallax testing
    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
  }

  update(time: Ticker) {
    const dt = time.elapsedMS / 1000;
    // TEMP Phase 3: replace with player.velocity.x in Phase 4
    const playerVelocityX = this._testVX;

    for (const layer of this._bgLayers) {
      layer.update(playerVelocityX, dt);
    }
  }
}

export default Game;
