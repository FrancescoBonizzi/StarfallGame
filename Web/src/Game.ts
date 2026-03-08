import { Application, Graphics, Point, Ticker } from "pixi.js";
import StarfallAssets from "./assets/StarfallAssets.ts";
import FillBackground from "./background/FillBackground.ts";
import HorizontalScrollingBackground from "./background/HorizontalScrollingBackground.ts";
import ScoreText from "./hud/ScoreText.ts";
import Controller from "./interaction/Controller.ts";
import Player from "./player/Player.ts";
import Numbers from "./services/Numbers.ts";
import SoundManager from "./services/SoundManager.ts";
import Camera from "./world/Camera.ts";

// Width/height of the bottom HUD status bar (screen coords).
// Player feet are at screen_y = GAME_H + (-GROUND_PAD) * zoom = 480 + (-25)*0.9 ≈ 458.
// Bar starts right at/below feet so it does not overlap the gameplay area.
const HUD_HEIGHT = 22;
const GAME_W = 800;
const HUD_Y = 458; // ≈ player feet screen_y

// Parallax scroll speeds for TilingSprite UV-offset (TS convention).
// Formula: TS_speed = 1 + C#_speed_with_multiplier
// C# multiplier = 1.5; C# speeds: layer6=-0.6, layer5=-0.5, layer4=-0.2,
//   layer3=0.0, layer2=0.3, layer1=0.8, layer0=1.0
// [backgrounds array index, TS scrollSpeed]
const LAYER_DEFS: [number, number][] = [
  [8, 0.1],  // bg6 – far mountains (barely moves)
  [7, 0.25], // bg5
  [6, 0.7],  // bg4
  [5, 1.0],  // bg3 – at rest in world space
  [4, 1.45], // bg2
  [1, 2.2],  // bg1a – near foreground
  [0, 2.5],  // bg0 – closest layer
];

// Camera trails the player by this offset: player appears ~134 units from camera left edge
const CAMERA_OFFSET_X = 134;

// Frame-rate-independent lerp coefficient (≈ 0.08 per frame at 60 fps)
const CAMERA_LERP_PER_SEC = 4.8;

// Score formula: elapsed seconds × this multiplier (gems will add more in Fase 7)
const SCORE_PER_SECOND = 10;

class Game {
  private readonly _bgLayers: HorizontalScrollingBackground[];
  private readonly _camera: Camera;
  private readonly _player: Player;
  private readonly _controller: Controller;
  private readonly _scoreText: ScoreText;

  private _elapsedMs = 0;

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

    // HUD bar: must be added before Player so JumpGemBar tokens (also on app.stage) layer on top
    const hudBar = new Graphics();
    hudBar.rect(0, 0, GAME_W, HUD_HEIGHT);
    hudBar.fill({ color: 0x000000 });
    hudBar.y = HUD_Y;
    app.stage.addChild(hudBar);

    // Player sprite added to camera world; JumpGemBar tokens added to app.stage (above hudBar)
    this._player = new Player(assets, this._camera, app.stage);

    this._controller = new Controller();

    // Score text: right-aligned at HUD vertical centre (above hudBar)
    this._scoreText = new ScoreText(
      app.stage,
      assets,
      new Point(GAME_W - 20, 460),
    );
    this._scoreText.updateScore(0);
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

    // Score: counts elapsed seconds while player is alive
    if (!this._player.isDead) {
      this._elapsedMs += time.elapsedMS;
      const score = Math.floor(this._elapsedMs / 1000) * SCORE_PER_SECOND;
      this._scoreText.updateScore(score);
    }
  }
}

export default Game;
