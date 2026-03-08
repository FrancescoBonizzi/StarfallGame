import { Point, Ticker } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import PopupText from "../hud/PopupText.ts";
import JumpGemBar from "../player/JumpGemBar.ts";
import Player from "../player/Player.ts";
import ScoreRepository from "../services/ScoreRepository.ts";
import SoundManager from "../services/SoundManager.ts";
import Camera from "../world/Camera.ts";
import BadGem from "./BadGem.ts";
import GoodGem from "./GoodGem.ts";
import BadGemPlayerStraightLineGenerator from "./generators/BadGemPlayerStraightLineGenerator.ts";
import BadGemPlayerStraightLineSequenceGenerator from "./generators/BadGemPlayerStraightLineSequenceGenerator.ts";
import BadGemScreenBorderStraightLineGenerator from "./generators/BadGemScreenBorderStraightLineGenerator.ts";
import GoodGemScaleGenerator from "./generators/GoodGemScaleGenerator.ts";
import GoodGemStaticYGridGenerator from "./generators/GoodGemStaticYGridGenerator.ts";
import IBadGemBatchGenerator from "./generators/IBadGemBatchGenerator.ts";
import IGoodGemBatchGenerator from "./generators/IGoodGemBatchGenerator.ts";

// C# popup durations and colors
const GEM_POPUP_DURATION_MS = 1000;
const RECORD_POPUP_DURATION_MS = 2000;
const RECORD_COLOR = 0xffea00; // yellow (C# Color(255,234,0))

class GemsManager {
  private readonly _camera: Camera;
  private readonly _assets: StarfallAssets;
  private readonly _player: Player;
  private readonly _jumpGemBar: JumpGemBar;
  private readonly _soundManager: SoundManager;

  private _activeGoodGems: GoodGem[] = [];
  private _activeBadGems: BadGem[] = [];
  private _popupTexts: PopupText[] = [];

  private readonly _goodGenerators: IGoodGemBatchGenerator[];
  private readonly _badGenerators: IBadGemBatchGenerator[];

  private _currentGoodGenIndex = 0;
  private _currentBadGenIndex = 0;

  // Good gems spawn every 1s when the previous batch is exhausted (C# TimeSpan.FromSeconds(1))
  private _goodGenIntervalMs = 1000;
  // Bad gems spawn every 4s; decreases by 1s per difficulty step (C# TimeSpan.FromSeconds(4))
  private _badGenIntervalMs = 4000;

  private _goodGenElapsedMs = 0;
  private _badGenElapsedMs = 0;

  private _generateGems = true;
  private _totalGlows = 0;

  // Record notification: fire "Record!" once per game if player beats previous best
  private readonly _lastGlowRecord: number;
  private _recordNotified = false;

  constructor(
    camera: Camera,
    assets: StarfallAssets,
    player: Player,
    jumpGemBar: JumpGemBar,
    soundManager: SoundManager,
  ) {
    this._camera = camera;
    this._assets = assets;
    this._player = player;
    this._jumpGemBar = jumpGemBar;
    this._soundManager = soundManager;
    this._lastGlowRecord = ScoreRepository.getScore("glows", "record");

    // 7 good gem generators — cycled round-robin (matches C# GemsManager sequence)
    this._goodGenerators = [
      new GoodGemStaticYGridGenerator(camera, assets, player, 50, 4, 1),
      new GoodGemScaleGenerator(camera, assets, player),
      new GoodGemStaticYGridGenerator(camera, assets, player, 200, 1, 6),
      new GoodGemScaleGenerator(camera, assets, player),
      new GoodGemStaticYGridGenerator(camera, assets, player, 100, 1, 6),
      new GoodGemScaleGenerator(camera, assets, player),
      new GoodGemStaticYGridGenerator(camera, assets, player, 300, 1, 6),
    ];

    // 3 bad gem generators — cycled round-robin
    this._badGenerators = [
      new BadGemPlayerStraightLineGenerator(camera, assets, player),
      new BadGemScreenBorderStraightLineGenerator(camera, assets),
      new BadGemPlayerStraightLineSequenceGenerator(camera, assets),
    ];
  }

  // ─── Public API ─────────────────────────────────────────────────────────

  get totalGlows(): number {
    return this._totalGlows;
  }

  /** Called every 20 seconds, max 4 times — shrinks bad-gem spawn interval by 1s. */
  increaseDifficulty(): void {
    this._badGenIntervalMs = Math.max(1000, this._badGenIntervalMs - 1000);
  }

  /** Trigger fade-out on all alive gems and stop new generation (called on player death). */
  makeAllGemsDisappear(): void {
    if (!this._generateGems) return;
    for (const gem of this._activeGoodGems) gem.takeMe();
    for (const gem of this._activeBadGems) gem.takeMe();
    this._generateGems = false;
  }

  update(time: Ticker): void {
    this._updateGoodGems(time);
    this._updateBadGems(time);
    this._updatePopupTexts(time);
    if (!this._player.isDead) {
      this._checkCollisions();
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────

  private _checkCollisions(): void {
    const playerRect = this._player.collisionRectangle;

    // Good gems: collect → add jump token + sound + score counter + popup text
    for (const gem of this._activeGoodGems) {
      if (gem.isTaken) continue;
      if (playerRect.intersects(gem.collisionRectangle)) {
        gem.takeMe();
        this._jumpGemBar.addJump();
        this._soundManager.playTakeGem();
        this._totalGlows++;

        // Popup: show current gem count at gem centre (C# PlayerGemsInteractor)
        const gemCenter = new Point(gem.x, gem.y);
        this._popupTexts.push(
          new PopupText(
            this._camera,
            this._assets,
            gemCenter,
            this._totalGlows.toString(),
            0xffffff,
            GEM_POPUP_DURATION_MS,
          ),
        );

        // Record notification: fire once if player beats previous glow record
        if (
          !this._recordNotified &&
          this._lastGlowRecord > 0 &&
          this._totalGlows > this._lastGlowRecord
        ) {
          this._recordNotified = true;
          this._popupTexts.push(
            new PopupText(
              this._camera,
              this._assets,
              new Point(gemCenter.x, gemCenter.y - 30),
              "Record!",
              RECORD_COLOR,
              RECORD_POPUP_DURATION_MS,
            ),
          );
        }
      }
    }

    // Bad gems: first collision kills the player, stop checking further
    for (const gem of this._activeBadGems) {
      if (gem.isTaken) continue;
      if (playerRect.intersects(gem.collisionRectangle)) {
        gem.takeMe();
        this._soundManager.playDie();
        this._player.die();
        break;
      }
    }
  }

  private _updateGoodGems(time: Ticker): void {
    if (this._activeGoodGems.length === 0) {
      if (!this._generateGems) return;
      this._goodGenElapsedMs += time.elapsedMS;
      if (this._goodGenElapsedMs >= this._goodGenIntervalMs) {
        const gen = this._goodGenerators[this._currentGoodGenIndex]!;
        this._activeGoodGems = gen.generateGems(-this._player.velocityX);
        this._goodGenElapsedMs = 0;
        this._currentGoodGenIndex =
          (this._currentGoodGenIndex + 1) % this._goodGenerators.length;
      }
    } else {
      for (let i = this._activeGoodGems.length - 1; i >= 0; i--) {
        const gem = this._activeGoodGems[i]!;
        if (gem.isActive(this._camera)) {
          gem.update(time);
        } else {
          gem.destroy(this._camera);
          this._activeGoodGems.splice(i, 1);
        }
      }
    }
  }

  private _updateBadGems(time: Ticker): void {
    if (this._activeBadGems.length === 0) {
      if (!this._generateGems) return;
      this._badGenElapsedMs += time.elapsedMS;
      if (this._badGenElapsedMs >= this._badGenIntervalMs) {
        const gen = this._badGenerators[this._currentBadGenIndex]!;
        this._activeBadGems = gen.generateGems(-(this._player.velocityX + 120));
        this._badGenElapsedMs = 0;
        this._currentBadGenIndex =
          (this._currentBadGenIndex + 1) % this._badGenerators.length;
      }
    } else {
      for (let i = this._activeBadGems.length - 1; i >= 0; i--) {
        const gem = this._activeBadGems[i]!;
        if (gem.isActive(this._camera)) {
          gem.update(time);
        } else {
          gem.destroy(this._camera);
          this._activeBadGems.splice(i, 1);
        }
      }
    }
  }

  private _updatePopupTexts(time: Ticker): void {
    for (let i = this._popupTexts.length - 1; i >= 0; i--) {
      const popup = this._popupTexts[i]!;
      popup.update(time);
      if (popup.isDone) {
        popup.destroy();
        this._popupTexts.splice(i, 1);
      }
    }
  }
}

export default GemsManager;
