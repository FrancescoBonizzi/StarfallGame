import { Application, Ticker } from "pixi.js";
import StarfallAssets from "./assets/StarfallAssets.ts";
import FillBackground from "./background/FillBackground.ts";
import HorizontalScrollingBackground from "./background/HorizontalScrollingBackground.ts";
import Controller from "./interaction/Controller.ts";
import Player from "./player/Player.ts";
import Numbers from "./services/Numbers.ts";
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

// Camera trails the player by this offset: player appears ~134 units from camera left edge
const CAMERA_OFFSET_X = 134;

// Frame-rate-independent lerp coefficient (≈ 0.08 per frame at 60 fps)
const CAMERA_LERP_PER_SEC = 4.8;

class Game {
  private readonly _bgLayers: HorizontalScrollingBackground[];
  private readonly _camera: Camera;
  private readonly _player: Player;
  private readonly _controller: Controller;

  constructor(
    assets: StarfallAssets,
    app: Application,
    _soundManager: SoundManager,
  ) {
    const t = assets.textures.backgrounds;

    // Layer7: static fill background — drawn behind everything
    new FillBackground(t[9]!, app);

    // Parallax layers — over fill bg, under camera world
    this._bgLayers = LAYER_DEFS.map(
      ([idx, speed]) => new HorizontalScrollingBackground(t[idx]!, speed, app),
    );

    // Camera world container added to app.stage inside Camera constructor
    this._camera = new Camera(app);

    // Player sprite added to camera world inside Player constructor
    this._player = new Player(assets, this._camera);

    this._controller = new Controller();
  }

  update(time: Ticker) {
    const dt = time.elapsedMS / 1000;

    // Jump on press
    if (this._controller.consumePress()) {
      this._player.statesManager.handleJump();
    }

    // Player physics + animation
    this._player.update(time);

    // Camera X tracks player (Y is fixed — Starfall camera follows X only)
    const targetX = this._player.position.x - CAMERA_OFFSET_X;
    this._camera.x = Numbers.lerp(
      this._camera.x,
      targetX,
      Math.min(1, CAMERA_LERP_PER_SEC * dt),
    );

    // Parallax backgrounds scroll proportional to player horizontal speed
    for (const layer of this._bgLayers) {
      layer.update(this._player.velocityX, dt);
    }
  }
}

export default Game;
