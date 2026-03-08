import { Application, Graphics, Point, Ticker } from "pixi.js";
import StarfallAssets from "./assets/StarfallAssets.ts";
import FillBackground from "./background/FillBackground.ts";
import HorizontalScrollingBackground from "./background/HorizontalScrollingBackground.ts";
import GemsManager from "./gems/GemsManager.ts";
import ScoreText from "./hud/ScoreText.ts";
import Controller from "./interaction/Controller.ts";
import Player from "./player/Player.ts";
import Numbers from "./services/Numbers.ts";
import ScoreRepository from "./services/ScoreRepository.ts";
import SoundManager from "./services/SoundManager.ts";
import Camera from "./world/Camera.ts";

// Width/height of the bottom HUD status bar (screen coords).
// Player feet are at screen_y = 480 + 0.9*(−GROUND_PAD) = 480 − 22.5 ≈ 458.
const HUD_HEIGHT = 22;
const GAME_W = 800;
const HUD_Y = 458; // ≈ player feet screen_y

// Parallax scroll speeds for TilingSprite UV-offset (TS convention).
// Formula: TS_speed = 1 + C#_speed_with_multiplier
// C# multiplier = 1.5; C# speeds: layer6=-0.6, layer5=-0.5, layer4=-0.2,
//   layer3=0.0, layer2=0.3, layer1=0.8, layer0=1.0
// [backgrounds array index, TS scrollSpeed]
const LAYER_DEFS: [number, number][] = [
  [8, 0.1], // bg6 – far mountains (barely moves)
  [7, 0.25], // bg5
  [6, 0.7], // bg4
  [5, 1.0], // bg3 – at rest in world space
  [4, 1.45], // bg2
  [1, 2.2], // bg1a – near foreground
  [0, 2.5], // bg0 – closest layer
];

// Camera trails the player by this offset: player appears ~134 units from camera left edge
const CAMERA_OFFSET_X = 134;

// Frame-rate-independent lerp coefficient (≈ 0.08 per frame at 60 fps)
const CAMERA_LERP_PER_SEC = 4.8;

// Score formula: time bonus + gem bonus
const SCORE_PER_SECOND = 10;
const SCORE_PER_GLOW = 50;

class Game {
  private readonly _bgLayers: HorizontalScrollingBackground[];
  private readonly _camera: Camera;
  private readonly _player: Player;
  private readonly _controller: Controller;
  private readonly _scoreText: ScoreText;
  private readonly _gemsManager: GemsManager;
  private readonly _onGameOver: () => void;

  private _elapsedMs = 0;
  private _gameOverTriggered = false;
  private _gameOverNavigated = false;

  // Difficulty ramp: every 20s, max 4 times (C# _aumentoDifficoltaInterval)
  private _difficultyStep = 0;
  private _difficultyElapsedMs = 0;

  constructor(
    assets: StarfallAssets,
    app: Application,
    soundManager: SoundManager,
    onGameOver: () => void,
  ) {
    this._onGameOver = onGameOver;

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

    // Score text: right-aligned at HUD vertical centre
    this._scoreText = new ScoreText(
      app.stage,
      assets,
      new Point(GAME_W - 20, 460),
    );
    this._scoreText.updateScore(0);

    // Gems system: manages GoodGem/BadGem batches, generators, collision detection
    this._gemsManager = new GemsManager(
      this._camera,
      assets,
      this._player,
      this._player.jumpGemBar,
      soundManager,
    );
  }

  update(time: Ticker) {
    const dt = time.elapsedMS / 1000;

    // Jump on press (only while alive)
    if (!this._player.isDead && this._controller.consumePress()) {
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

    // Gems: update batches + collision detection
    this._gemsManager.update(time);

    // Difficulty ramp: every 20 seconds, max 4 times (C# _aumentoDifficoltaInterval)
    if (!this._player.isDead && this._difficultyStep < 4) {
      this._difficultyElapsedMs += time.elapsedMS;
      if (this._difficultyElapsedMs >= 20_000) {
        this._difficultyElapsedMs = 0;
        this._difficultyStep++;
        this._player.increaseMovementSpeed();
        this._gemsManager.increaseDifficulty();
      }
    }

    // Score: counts elapsed seconds + collected glows while player is alive
    if (!this._player.isDead) {
      this._elapsedMs += time.elapsedMS;
      const score =
        Math.floor(this._elapsedMs / 1000) * SCORE_PER_SECOND +
        this._gemsManager.totalGlows * SCORE_PER_GLOW;
      this._scoreText.updateScore(score);
    }

    // Game-over: detect death once, save scores, fade gems
    if (this._player.isDead && !this._gameOverTriggered) {
      this._gameOverTriggered = true;
      this._gemsManager.makeAllGemsDisappear();

      const aliveTimeSec = Math.floor(this._elapsedMs / 1000);
      const glows = this._gemsManager.totalGlows;
      const bestJumpMs = Math.round(this._player.bestJumpDuration * 1000);

      ScoreRepository.setScore("aliveTime", "gameover", aliveTimeSec);
      ScoreRepository.setScore("glows", "gameover", glows);
      ScoreRepository.setScore("bestJump", "gameover", bestJumpMs);

      if (aliveTimeSec > ScoreRepository.getScore("aliveTime", "record")) {
        ScoreRepository.setScore("aliveTime", "record", aliveTimeSec);
      }
      if (glows > ScoreRepository.getScore("glows", "record")) {
        ScoreRepository.setScore("glows", "record", glows);
      }
      if (bestJumpMs > ScoreRepository.getScore("bestJump", "record")) {
        ScoreRepository.setScore("bestJump", "record", bestJumpMs);
      }
    }

    // Navigate to gameover after death animation fade-out completes
    if (this._player.deathFadeComplete && !this._gameOverNavigated) {
      this._gameOverNavigated = true;
      this._onGameOver();
    }
  }
}

export default Game;
