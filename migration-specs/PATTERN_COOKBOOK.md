# PATTERN COOKBOOK: C# → TypeScript/PixiJS

Ogni sezione mostra un pattern C# ricorrente con il suo equivalente TS estratto o derivato dal progetto riferimento.

---

## 1. Entry Point e Game Loop

### C# (StarfallBootstrap)

```csharp
protected override void Update(GameTime gameTime) {
    TimeSpan elapsed = gameTime.ElapsedGameTime;
    _orchestrator.Update(elapsed);
}
protected override void Draw(GameTime gameTime) {
    _orchestrator.Draw(_spriteBatch, GraphicsDevice);
}
```

### TS (gamebootstrap.ts)

```typescript
app.ticker.add((time: Ticker) => {
  game.update(time);
});
// Nessun Draw() esplicito: PixiJS renderizza automaticamente
```

**Regola**: `TimeSpan elapsed` → `Ticker time`. Per ottenere i secondi: `time.deltaTime / 60` oppure `time.elapsedMS / 1000`.

---

## 2. Tempo trascorso (elapsed)

### C#

```csharp
void Update(TimeSpan elapsed) {
    _elapsedTotal += elapsed;
    float seconds = (float)elapsed.TotalSeconds;
    float totalSec = (float)_elapsedTotal.TotalSeconds;
}
```

### TS

```typescript
update(time: Ticker) {
    const dt = time.elapsedMS / 1000;   // secondi dall'ultimo frame
    this._elapsedTotal += dt;
}
```

---

## 3. Sprite singolo (Texture)

### C#

```csharp
Sprite _sprite = assets.Sprites["glow-omino"];
spriteBatch.Draw(_sprite, drawingInfos);
```

### TS

```typescript
import { Sprite, Texture } from "pixi.js";
const sprite = new Sprite(assets.textures.glowOmino);
sprite.anchor.set(0.5);
camera.addToWorld(sprite);
// Posizione:
sprite.x = position.x;
sprite.y = position.y;
```

---

## 4. Sprite animato (AnimatedSprite)

### C#

```csharp
// Definizione in AssetsLoader:
Animations[AnimationsNames.PlayerRun] = new SpriteAnimation(frames, TimeSpan.FromMilliseconds(20));
// Uso:
AnimationsManager.PlayAnimation("PlayerRun");
AnimationsManager.Update(elapsed);
AnimationsManager.Draw(spriteBatch, drawingInfos);
```

### TS

```typescript
// Definizione in AssetsLoader.ts:
const playerRun = new AnimatedSprite(spriteSheet.animations.playerRun!);
playerRun.animationSpeed = 0.5; // 0.5 = ~30fps / 60fps ticker
playerRun.loop = true;
playerRun.play();
camera.addToWorld(playerRun);

// Update: automatico (PixiJS aggiorna AnimatedSprite internamente)
// Cambio animazione: nascondere il precedente, mostrare il nuovo
currentAnimation.visible = false;
nextAnimation.visible = true;
nextAnimation.gotoAndPlay(0);
```

**Nota**: AnimatedSprite di PixiJS si aggiorna autonomamente. Non serve chiamare `.update()` manualmente.

---

## 5. Posizione e DrawingInfos

### C#

```csharp
DrawingInfos drawingInfos = new DrawingInfos() {
    Position = new Vector2(200f, 62f),
    Scale = 1.0f,
    Origin = new Vector2(width/2, height/2), // centro
    OverlayColor = Color.White
};
drawingInfos.Position += velocity * (float)elapsed.TotalSeconds;
```

### TS

```typescript
sprite.x = 200;
sprite.y = 62; // Attenzione: Y invertita rispetto al C# con Camera del riferimento
sprite.scale.set(1.0);
sprite.anchor.set(0.5, 0.5); // equivalente di Origin = center
sprite.tint = 0xffffff; // equivalente di OverlayColor = White
// Movimento:
sprite.x += velocity.x * dt;
sprite.y += velocity.y * dt;
```

---

## 6. Vector2 → Point/oggetto letterale

### C#

```csharp
Vector2 velocity = new Vector2(94f, 0f);
Vector2 result = Vector2.Lerp(a, b, 0.08f);
float dist = Vector2.Distance(a, b);
float distSq = Vector2.DistanceSquared(a, b);
```

### TS

```typescript
import { Point } from "pixi.js";
const velocity = new Point(94, 0);
// Lerp (da Numbers.ts):
import Numbers from "./services/Numbers";
const result = {
  x: Numbers.lerp(a.x, b.x, 0.08),
  y: Numbers.lerp(a.y, b.y, 0.08),
};
// Distanza:
const dx = a.x - b.x,
  dy = a.y - b.y;
const distSq = dx * dx + dy * dy;
const dist = Math.sqrt(distSq);
```

---

## 7. MathHelper → Numbers.ts

### C#

```csharp
MathHelper.Lerp(a, b, t)
MathHelper.Clamp(value, min, max)
Numbers.RandomBetween(min, max)
Numbers.MapValueFromIntervalToInterval(v, fromMin, fromMax, toMin, toMax)
Numbers.GenerateDeltaOverTimeSin(t, min, max)  // oscillazione sinusoidale
```

### TS (Numbers.ts - copia dal riferimento)

```typescript
Numbers.lerp(a, b, t);
Numbers.clamp(value, min, max);
Numbers.clamp01(value);
Numbers.randomBetween(min, max); // o randomBetweenInterval(interval)
// MapValueFromInterval: implementare se serve
const mapped = ((v - fromMin) / (fromMax - fromMin)) * (toMax - toMin) + toMin;
// Sin oscillation:
const sinValue = min + (max - min) * (Math.sin(t) * 0.5 + 0.5);
```

---

## 8. Collision Detection

### C#

```csharp
// HitBox con tolerance:
Rectangle hitbox = drawingInfos.HitBox(width, height);  // position - origin + tolerance
hitbox.Intersects(otherHitbox)  // bool
// Con oggetti:
bool colliding = playerHitbox.Intersects(gemHitbox);
```

### TS (CollisionSolver.ts - copia dal riferimento)

```typescript
import CollisionSolver from "./services/CollisionSolver";
import { Rectangle } from "pixi.js";

// Creare i rettangoli di collisione manualmente:
const playerRect = new Rectangle(
  player.x - player.width / 2 + tolerance.x,
  player.y - player.height / 2 + tolerance.y,
  tolerance.w,
  tolerance.h,
);
const gemRect = new Rectangle(gemSprite.x - w / 2, gemSprite.y - h / 2, w, h);

const hit = CollisionSolver.checkCollisions(playerRect, [gemRect]);
```

---

## 9. FadeObject → alpha animation

### C#

```csharp
FadeObject fade = new FadeObject(TimeSpan.FromMilliseconds(200), Color.White);
fade.FadeOut();
fade.Update(elapsed);
drawingInfos.OverlayColor = fade.OverlayColor;
bool isDone = fade.IsCompleted;
```

### TS (implementazione inline o helper)

```typescript
class FadeAnimation {
  private _alpha = 1;
  private _target = 0;
  private _durationMs: number;
  private _elapsed = 0;

  constructor(durationMs: number) {
    this._durationMs = durationMs;
  }

  fadeOut() {
    this._target = 0;
    this._elapsed = 0;
  }
  fadeIn() {
    this._target = 1;
    this._elapsed = 0;
  }

  update(dt: number) {
    this._elapsed += dt * 1000;
    const t = Math.min(this._elapsed / this._durationMs, 1);
    this._alpha = this._target === 0 ? 1 - t : t;
  }

  get alpha() {
    return this._alpha;
  }
  get isCompleted() {
    return this._elapsed >= this._durationMs;
  }
}
// Uso:
sprite.alpha = fade.alpha;
```

---

## 10. ScalingObject → oscillazione scale

### C#

```csharp
ScalingObject scaling = new ScalingObject(minScale: 0.5f, maxScale: 0.7f, speed: 1f);
scaling.Update(elapsed);
drawingInfos.Scale = scaling.Scale;
```

### TS

```typescript
// Oscillazione sinusoidale manuale:
this._elapsed += dt;
sprite.scale.set(
  minScale +
    (maxScale - minScale) * (Math.sin(this._elapsed * speed) * 0.5 + 0.5),
);
```

---

## 11. Pages (HTML puro, non PixiJS)

### C# (MainMenuPage)

```csharp
// Costruisce con sprite e font XNA
// HandleInput(Vector2 touchPoint, GameOrchestrator) → hitbox test
// Draw(SpriteBatch) → spriteBatch.DrawString(...)
```

### TS (menu.ts - pattern dal riferimento)

```typescript
export function renderMenuPage(container: HTMLElement) {
  container.innerHTML = `
        <main>
            <h1 class="title">Starfall</h1>
            <nav class="menu-actions">
                <a href="/game" class="button primary" data-navigo>GIOCA</a>
                <a href="/incipit" class="button" data-navigo>INCIPIT</a>
                <a href="/scores" class="button" data-navigo>PUNTEGGIO</a>
            </nav>
        </main>
    `;
  router.updatePageLinks();
  SoundManagerInstance.playMenuSoundTrack();
}
```

**Regola**: Menu/Score/GameOver/Incipit = HTML puro. Solo il `/game` usa PixiJS.

---

## 12. GameOver con stats

### C# (GameOverPage)

```csharp
// Riceve thisGameBestJump, thisGameAliveTime, thisGameNumberOfGlows
// Confronta con record in ISettingsRepository
// Mostra "Record!" se superato
```

### TS (gameover.ts)

```typescript
export function renderGameOverPage(container: HTMLElement) {
  const aliveTime = ScoreRepository.getScore("aliveTime", "gameover");
  const glows = ScoreRepository.getScore("glows", "gameover");
  const bestJump = ScoreRepository.getScore("bestJump", "gameover");

  container.innerHTML = `
        <main>
            <h1>Game Over</h1>
            <div class="score-table">
                <div class="score-row">
                    <span>Tempo in vita:</span>
                    <span>${formatTime(aliveTime)}</span>
                </div>
                <div class="score-row">
                    <span>Glow raccolti:</span>
                    <span>${glows}</span>
                </div>
                <div class="score-row">
                    <span>Miglior salto:</span>
                    <span>${formatTime(bestJump)}</span>
                </div>
            </div>
            <a href="/" class="button" data-navigo>MENU</a>
        </main>
    `;
  router.updatePageLinks();
  SoundManagerInstance.playMenuSoundTrack();
}
```

---

## 13. ScoreRepository (adattato per Starfall)

### C# (ISettingsRepository)

```csharp
settingsRepository.GetOrSetTimeSpan(GameScores.BestJumpScoreKey, default)
settingsRepository.SetTimeSpan(GameScores.BestJumpScoreKey, value)
settingsRepository.GetOrSetInt(GameScores.MaxGlowsTakenScoreKey, default)
```

### TS (ScoreRepository.ts - adattare dal riferimento)

```typescript
const ScorePrefix = "starfall-score";
export type ScoreType = "aliveTime" | "glows" | "bestJump";
export type ScoreSource = "gameover" | "record";

// In Game.ts al game over:
ScoreRepository.setScore("aliveTime", "gameover", elapsedSeconds);
ScoreRepository.setScore("glows", "gameover", gemsCount);
ScoreRepository.setScore("bestJump", "gameover", bestJumpSeconds);
// Record (solo se supera):
if (elapsedSeconds > ScoreRepository.getScore("aliveTime", "record"))
  ScoreRepository.setScore("aliveTime", "record", elapsedSeconds);
```

---

## 14. Horizontal Scrolling Background

### C#

```csharp
_layer1 = new HorizontalScrollingBackground(
    matrixScaleProvider,
    new List<Sprite>() { assets.Sprites["1a"], assets.Sprites["1b"], assets.Sprites["1c"] },
    0.8f * multiplier);
// Update:
_layer1.Update(elapsed, _player.Velocity.X, cameraBoundingRectangleX);
```

### TS

```typescript
// Usando TilingSprite di PixiJS:
import { TilingSprite } from "pixi.js";

class ParallaxLayer {
  private _sprite: TilingSprite;
  private _scrollSpeed: number;

  constructor(
    texture: Texture,
    width: number,
    height: number,
    scrollSpeed: number,
  ) {
    this._sprite = new TilingSprite({ texture, width, height });
    this._scrollSpeed = scrollSpeed;
    // Posizionare nello stage o container dedicato
  }

  update(playerVelocityX: number, dt: number) {
    this._sprite.tilePosition.x -= playerVelocityX * dt * this._scrollSpeed;
  }
}
```

**Alternativa**: gestione manuale tile array come nel C# (più fedele all'originale, supporta sprite multipli per lo stesso layer).

---

## 15. Parallax layer a sprite multipli (come C#)

Quando un layer usa sprite diversi (1a, 1b, 1c) va gestito come il C#:

```typescript
class HorizontalScrollingBackground {
    private _tiles: { sprite: Sprite; x: number }[];
    private _scrollSpeed: number;
    private _tileWidth: number;

    constructor(textures: Texture[], scrollSpeed: number, camera: Camera) {
        this._scrollSpeed = scrollSpeed;
        this._tileWidth = /* larghezza texture */;
        // Crea abbastanza tile per coprire lo schermo + 1 buffer
        this._tiles = textures.map((tex, i) => {
            const spr = new Sprite(tex);
            spr.x = i * this._tileWidth;
            camera.addToWorld(spr); // o stage, dipende dal layer
            return { sprite: spr, x: spr.x };
        });
    }

    update(playerVelocityX: number, cameraX: number, dt: number) {
        const scroll = playerVelocityX * dt * this._scrollSpeed;
        for (const tile of this._tiles) {
            tile.x -= scroll;
            tile.sprite.x = tile.x;
            // Ricicla tile usciti a sinistra
            if (tile.x + this._tileWidth < cameraX) {
                tile.x += this._tiles.length * this._tileWidth;
            }
        }
    }
}
```

---

## 16. Player State Machine

### C#

```csharp
public interface IPlayerState {
    void Enter();
    void HandleJump();
    IPlayerState Update(TimeSpan elapsed);
}
```

### TS

```typescript
interface IPlayerState {
  enter(): void;
  handleJump(): void;
  update(dt: number): IPlayerState;
}

class StatesManager {
  private _currentState: IPlayerState;

  constructor(player: Player, jumpGemBar: JumpGemBar) {
    this.runningState = new RunningState(player, this);
    this.jumpingState = new JumpingState(player, jumpGemBar, this);
    this._currentState = this.runningState;
    this._currentState.enter();
  }

  update(dt: number) {
    const next = this._currentState.update(dt);
    if (next !== this._currentState) {
      this._currentState = next;
      this._currentState.enter();
    }
  }

  handleJump() {
    this._currentState.handleJump();
  }
}
```

---

## 17. Gem con GoodGem attrazione magnetica

### C# (GoodGem)

```csharp
if (Vector2.DistanceSquared(mineCenter, playerCenter) <= 100 * 100 || _isInAttraction) {
    _isInAttraction = true;
    GemDrawingInfos.Position = new Vector2(
        MathHelper.Lerp(pos.X, playerCenter.X, 0.1f),
        MathHelper.Lerp(pos.Y, playerCenter.Y, 0.1f));
}
```

### TS

```typescript
const dx = this._sprite.x - player.x;
const dy = this._sprite.y - player.y;
if (dx * dx + dy * dy <= 100 * 100 || this._isInAttraction) {
  this._isInAttraction = true;
  this._sprite.x = Numbers.lerp(this._sprite.x, player.x, 0.1);
  this._sprite.y = Numbers.lerp(this._sprite.y, player.y, 0.1);
}
```

---

## 18. CometParticleSystem

### C# (CometParticleSystem)

```csharp
public CometParticleSystem(Sprite particleSprite)
    : base(density: 5, minNumParticles: 5, maxNumParticles: 8,
           minInitialSpeed: 80f, maxInitialSpeed: 100f,
           minAcceleration: 30f, maxAcceleration: 50f,
           minRotationSpeed: -MathHelper.Pi, maxRotationSpeed: MathHelper.Pi,
           minLifetime: TimeSpan.FromMilliseconds(600), maxLifetime: TimeSpan.FromMilliseconds(900),
           minScale: 0.1f, maxScale: 0.7f,
           minSpawnAngle: -45f, maxSpawnAngle: 235f) {}
```

### TS (CometParticleSystem.ts - da creare)

```typescript
import ParticleSystem from "./ParticleSystem";
import Interval from "../primitives/Interval";

class CometParticleSystem extends ParticleSystem {
  constructor(texture: Texture, camera: Camera) {
    super(
      texture,
      camera,
      /* density */ 5,
      /* numParticles */ new Interval(5, 8),
      /* speed */ new Interval(80, 100),
      /* acceleration */ new Interval(30, 50),
      /* rotationSpeed */ new Interval(-Math.PI, Math.PI),
      /* lifetimeSeconds */ new Interval(0.6, 0.9),
      /* scale */ new Interval(0.1, 0.7),
      /* spawnAngleDegrees */ new Interval(-45, 235),
    );
  }
}
```

---

## 19. SoundManager (adattato per Starfall)

### C# (AssetsLoader + StarfallGame)

```csharp
Sounds.Add(SoundsNames.running, contentManager.Load<SoundEffect>("Music/Running"));
_backgroundMusic = assets.Sounds[AssetsLoader.SoundsNames.running].CreateInstance();
_backgroundMusic.IsLooped = true;
_backgroundMusic.Play();
```

### TS (SoundManager.ts - adattare dal riferimento)

```typescript
class SoundManager {
  private sounds: Record<string, Howl> = {};

  constructor() {
    this.sounds["musicMenu"] = new Howl({
      src: [`${AssetsRoot}/sounds/menu.mp3`],
      loop: true,
      volume: 0.4,
    });
    this.sounds["musicGame"] = new Howl({
      src: [`${AssetsRoot}/sounds/running.mp3`],
      loop: true,
      volume: 0.4,
    });
    this.sounds["musicIncipit"] = new Howl({
      src: [`${AssetsRoot}/sounds/slideshow.mp3`],
      loop: true,
      volume: 0.4,
    });
    this.sounds["takeGem"] = new Howl({
      src: [`${AssetsRoot}/sounds/takegem.mp3`],
    });
    this.sounds["die"] = new Howl({ src: [`${AssetsRoot}/sounds/die.mp3`] });
  }

  playGameSoundTrack() {
    this.stopAllMusic();
    this.sounds["musicGame"]!.play();
  }
  playMenuSoundTrack() {
    if (!this.sounds["musicMenu"]!.playing()) {
      this.stopAllMusic();
      this.sounds["musicMenu"]!.play();
    }
  }
  playIncipitSoundTrack() {
    this.stopAllMusic();
    this.sounds["musicIncipit"]!.play();
  }
  playTakeGem() {
    this.sounds["takeGem"]!.play();
  }
  playDie() {
    this.sounds["die"]!.play();
  }
  private stopAllMusic() {
    Object.values(this.sounds).forEach((s) => s.stop());
  }
}
```

---

## 20. Assets interface (StarfallAssets)

```typescript
// Web/src/assets/StarfallAssets.ts
import { Texture } from "pixi.js";
import PlayerAnimations from "../player/PlayerAnimations";

interface StarfallAssets {
  fontName: string;
  textures: {
    // Backgrounds (layer 0-7)
    background: {
      layer0: Texture; // ground
      layer1: Texture[]; // 1a, 1b, 1c
      layer2: Texture;
      layer3: Texture;
      layer4: Texture;
      layer5: Texture;
      layer6: Texture;
      layer7: Texture; // fill viewport
    };
    // Gemme
    goodGlow: Texture[]; // good_glow_000..019 come animazione
    badGlow: Texture[]; // bad_glow_000..019 come animazione
    glowBianco: Texture; // alone bianco sotto goodGem
    glowRosso: Texture; // alone rosso sotto badGem
    glowOmino: Texture; // glow attorno al player
    glowTerraOmino: Texture; // alone player a terra
    // UI
    menuBackground: Texture;
    gameoverBackground: Texture;
    incipitBackground: Texture;
    scoreBackground: Texture;
    // Particles
    cometParticle: Texture;
    // Tips
    tip1: Texture;
    tip2: Texture;
    tip3: Texture;
    tip4: Texture;
    tipsGlow: Texture;
    tipsLife: Texture;
    tipsTimejump: Texture;
  };
  player: PlayerAnimations;
}

// PlayerAnimations.ts
interface PlayerAnimations {
  run: AnimatedSprite; // run_000..019
  jump: AnimatedSprite; // jump_000..019
  death: AnimatedSprite; // death_000..019
}
```

---

## 21. Culling (isActive check)

### C#

```csharp
public bool IsActive(Rectangle cameraBoundingRectangle) {
    return gemDrawingInfos.HitBox(width, height).Right > cameraBoundingRectangle.X
        && (_fadeObject == null || _fadeObject.IsFading);
}
```

### TS

```typescript
isActive(camera: Camera): boolean {
    const right = this._sprite.x + this._sprite.width / 2;
    return !camera.isOutOfCameraLeft({ x: this._sprite.x, width: this._sprite.width })
        && (this._fadeAnim === null || !this._fadeAnim.isCompleted);
}
```

---

## 22. JumpGemBar

### C#: lista di token sprite con FadeIn quando aggiunti, rimossi a stack (LIFO).

### TS

```typescript
class JumpGemBar {
  private _tokens: Sprite[] = [];
  private readonly _maxJumps = 6;
  private readonly _texture: Texture;
  totalJumps = 0;

  get jumpsAvailable() {
    return this._tokens.length;
  }

  addJump() {
    if (this._tokens.length >= this._maxJumps) return;
    const spr = new Sprite(this._texture);
    spr.scale.set(0.5);
    spr.x = 160 + this._tokens.length * (spr.width + 6);
    spr.y = SCREEN_H - 34;
    spr.alpha = 0;
    // fade in: incrementa alpha in update o usa tween
    app.stage.addChild(spr); // HUD layer
    this._tokens.push(spr);
  }

  removeJump() {
    const spr = this._tokens.pop();
    if (spr) {
      app.stage.removeChild(spr);
      this.totalJumps++;
    }
  }
}
```

---

## 23. Tempo formattato (MM:SS)

### C# (extension method)

```csharp
timeSpan.ToMinuteSecondsFormat() // "01:23"
```

### TS (helper)

```typescript
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}
```
