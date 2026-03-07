# ARCHITECTURE MAP: MonoGame (C#) → PixiJS (TypeScript)

## Struttura directory

```
CSharp/Starfall/                         Web/src/
├── StarfallBootstrap.cs                 ├── main.ts
├── StarfallGame.cs                      ├── Game.ts
├── GameOrchestrator.cs                  ├── pages/router.ts + gamebootstrap.ts
├── GameHUD.cs                           ├── hud/Hud.ts (da creare)
├── PlayerGemsInteractor.cs              ├── (da creare, integrato in Game.ts)
├── Assets/
│   ├── AssetsLoader.cs                  ├── assets/AssetsLoader.ts
│   ├── GameScores.cs                    ├── services/ScoreRepository.ts
│   └── GameStringsLoader.cs             ├── (stringhe inline nelle pages)
├── Backgrounds/
│   ├── HorizontalScrollingBackground.cs ├── background/ParallaxBackground.ts (da creare)
│   └── FillViewportBackground.cs        ├── background/FillBackground.ts (da creare)
├── Gems/
│   ├── Gem.cs                           ├── gems/Gem.ts (da creare)
│   ├── GoodGem.cs                       ├── gems/GoodGem.ts (da creare)
│   ├── BadGem.cs                        ├── gems/BadGem.ts (da creare)
│   ├── GemsManager.cs                   ├── gems/GemsManager.ts (da creare)
│   └── GemsGenerators/...               ├── gems/generators/... (da creare)
├── Menu/
│   ├── MainMenuPage.cs                  ├── pages/menu.ts
│   ├── GameOverPage.cs                  ├── pages/gameover.ts
│   ├── ScorePage.cs                     ├── pages/score.ts
│   ├── IncipitPage.cs                   ├── pages/incipit.ts (da creare)
│   └── ProtipsShower.cs                 ├── pages/protips.ts (da creare)
├── Players/
│   ├── Player.cs                        ├── player/Player.ts (da creare)
│   ├── JumpGemBar.cs                    ├── player/JumpGemBar.ts (da creare)
│   ├── CometParticleSystem.cs           ├── particleEmitters/CometParticleSystem.ts (da creare)
│   └── States/
│       ├── IPlayerState.cs              ├── player/states/IPlayerState.ts (da creare)
│       ├── RunningState.cs              ├── player/states/RunningState.ts (da creare)
│       ├── JumpingState.cs              ├── player/states/JumpingState.ts (da creare)
│       └── StatesManager.cs             ├── player/states/StatesManager.ts (da creare)
└── (copiati dal riferimento)
    └── Camera, CollisionSolver,         ├── world/Camera.ts (COPIA DIRETTA)
        ScoreRepository, Numbers,        ├── services/CollisionSolver.ts (COPIA DIRETTA)
        ParticleSystem...                ├── services/ScoreRepository.ts (ADATTARE chiavi)
                                         ├── services/Numbers.ts (COPIA DIRETTA)
                                         ├── particleEmitters/ParticleSystem.ts (COPIA DIRETTA)
                                         ├── interaction/Controller.ts (COPIA DIRETTA)
                                         ├── pages/router.ts (ADATTARE routes)
                                         ├── pages/gamebootstrap.ts (ADATTARE)
                                         ├── services/SoundManager.ts (ADATTARE suoni)
                                         ├── services/SoundInstance.ts (COPIA DIRETTA)
                                         ├── services/AudioUnlocker.ts (COPIA DIRETTA)
                                         └── uiKit/LoadingThing.ts (COPIA DIRETTA)
```

---

## Lifecycle del gioco

### MonoGame
```
StarfallBootstrap (extends Game)
  └── Initialize() / LoadContent()
        └── SplashScreenLoader → LoadGameAssets()
              └── GameOrchestrator.Start() → GameStates.Menu
  └── Update(GameTime) → orchestrator.Update()
  └── Draw(GameTime) → orchestrator.Draw()

GameOrchestrator
  └── GameStates: Menu | Incipit | Playing | GameOver | Score | Protip
  └── Transizioni con FadeObject (fade in/out)
  └── Factory pattern: Func<StarfallGame>, Func<MainMenuPage>, ecc.
```

### PixiJS (riferimento + adattamento Starfall)
```
main.ts
  └── initializeRouter()
  └── wireAudioUnlockOnce()

router.ts (Navigo)
  └── / → renderMenuPage()
  └── /game → initGame() [con destroyGame() su leave]
  └── /scores → renderScorePage()
  └── /gameover → renderGameOverPage()
  └── /incipit → renderIncipitPage() [NUOVO per Starfall]
  └── /protips → renderProtipsPage() [NUOVO per Starfall]

gamebootstrap.ts
  └── initGame() → new Application() → loadAssets() → new Game() → ticker.add()
  └── destroyGame() → app.destroy()

Game.ts
  └── costruttore: crea tutti i sistemi
  └── update(Ticker): game loop
  └── isDead → setTimeout → router.navigate('/gameover')
```

---

## Camera

### MonoGame: Camera2D
- `_camera.Position = new Vector2(x, y)` — posizione world-space
- `_camera.BoundingRectangle` — rettangolo visibile
- `spriteBatch.Begin(transformMatrix: _camera.GetViewMatrix())`
- Solo scrolling orizzontale (Y fisso), centrata sul player X

### PixiJS: Camera (copia diretta dal riferimento)
- `camera.x = value`, `camera.y = value`
- `camera.addToWorld(sprite)` per aggiungere oggetti alla scena
- `camera.isOutOfCameraLeft(sprite)` per culling
- Coordinate con Y invertita (0 in basso, negativo verso l'alto)
- **ADATTAMENTO Starfall**: la camera segue solo X (come nel C#), Y rimane fisso o quasi fisso

### Differenza chiave
In MonoGame le coordinate hanno Y crescente verso il basso. In PixiJS con la Camera del riferimento, Y=0 è a terra (bottom), Y negativo è verso l'alto. Questo cambia il segno di tutti i calcoli verticali.

---

## Rendering / Draw

### MonoGame
- Tutto in `Draw(SpriteBatch spriteBatch)`
- `spriteBatch.Begin()` / `spriteBatch.End()`
- Layer via ordine di chiamata Begin/End + matrix
- Background senza camera: `spriteBatch.Begin()` poi `spriteBatch.Draw(layer7)`
- World con camera: `spriteBatch.Begin(transformMatrix: camera.GetViewMatrix())` poi draw
- HUD senza camera: `spriteBatch.Begin()` poi draw

### PixiJS
- Nessun Draw() esplicito — i `Container` / `Sprite` vengono aggiunti all'`Application.stage` o al `Camera._world`
- Rendering automatico ad ogni frame
- Background fuori camera → `app.stage.addChild(sprite)`
- Oggetti world → `camera.addToWorld(sprite)`
- HUD → `app.stage.addChild(sprite)` (sopra tutto)
- Ordine di rendering = ordine di `addChild`

---

## Sistemi di coordinate

| Sistema | X | Y | Riferimento |
|---------|---|---|-------------|
| MonoGame | → destra | ↓ basso | top-left |
| PixiJS standard | → destra | ↓ basso | top-left |
| Camera riferimento | → destra | ↑ alto (Y negativo = sopra) | bottom-left |

**Regola pratica**: nel C# `position.Y = 62` è alto sullo schermo. Con la Camera del riferimento, `position.y = -62` (negativo = sopra il ground). Il ground è y=0.

---

## Game States → Router

| C# GameStates | Web route |
|---------------|-----------|
| `Menu` | `/` o `/menu` |
| `Playing` | `/game` |
| `GameOver` | `/gameover` |
| `Score` | `/scores` |
| `Incipit` | `/incipit` |
| `Protip` | `/protips` |

La transizione FadeObject del C# → non necessaria nel Web (le pagine HTML si sostituiscono direttamente; eventuale CSS transition).

---

## Assets

### MonoGame
- Spritesheets `.png` + `.txt` (formato custom: `nome|x|y|w|h`)
- Font: `.xnb` (SpriteFont compilato)
- Suoni: `.xnb` (compilati da MP3/WAV)
- AnimatedSprites: liste di Sprite dal .txt

### PixiJS
- Spritesheets `.png` + `.json` (formato PixiJS/TexturePacker)
- Font: `.ttf` caricato via `Assets.addBundle` + CSS
- Suoni: `.mp3` caricati con Howler
- AnimatedSprites: `new AnimatedSprite(spriteSheet.animations.nomeAnimazione)`

### Spritesheet Starfall (già convertite e pronte)

File in `Web/public/assets/images/spriteSheets/`:

| JSON | PNG | Contenuto | Animazioni |
|------|-----|-----------|------------|
| `others.json` | `others.png` | player, gems, UI, glow sprites | `playerRun`, `playerJump`, `playerDeath`, `goodGlow`, `badGlow` |
| `backgrounds.json` | `backgrounds.png` | parallax layers | nessuna |
| `protips.json` | `protips.png` | immagini tip | nessuna |

Nomi frame backgrounds: `bg0`, `bg1a`, `bg1b`, `bg1c`, `bg2`, `bg3`, `bg4`, `bg5`, `bg6`, `bg7`.

Caricamento in AssetsLoader:
```typescript
const othersSpriteSheet = await Assets.load('.../others.json') as Spritesheet;
const bgSpriteSheet = await Assets.load('.../backgrounds.json') as Spritesheet;
const protipsSpriteSheet = await Assets.load('.../protips.json') as Spritesheet;
// Animazioni:
new AnimatedSprite(othersSpriteSheet.animations.playerRun!)
```

---

## Suoni

| C# SoundsNames | File MP3 | Web SoundManager key |
|---------------|----------|---------------------|
| `running` | `Running.mp3` | `musicGame` |
| `menu` | `menu.mp3` | `musicMenu` |
| `slideshow` | `Slideshow.mp3` | `musicIncipit` |
| `takegem` | `TakeGem.mp3` | `takeGem` |
| `die` | `Die.mp3` | `die` |

---

## Score / Persistenza

### MonoGame: ISettingsRepository
- `settingsRepository.GetOrSetTimeSpan(key, default)` → `localStorage`
- `settingsRepository.SetTimeSpan(key, value)` → `localStorage`
- `settingsRepository.GetOrSetInt(key, default)` → `localStorage`

### PixiJS: ScoreRepository (adattare dal riferimento)
- Score types Starfall: `'aliveTime' | 'glows' | 'bestJump'`
- Score source: `'gameover' | 'record'`
- Prefix chiave: `'starfall-score'`

---

## Gems System

### MonoGame
- `Gem` (abstract) → `GoodGem`, `BadGem`
- Animazioni: `SpriteAnimation` (lista di frame con timer)
- `GemAnimation.CurrentFrame` → sprite corrente
- `GoodGem`: attrazione magnetica verso il player quando distanza < 100
- `BadGem`: nessuna attrazione, uccide il player al contatto
- Generators: batch generators ciclici (round-robin)
- `IsActive(cameraBoundingRectangle)` → culling

### PixiJS
- `Gem` (abstract) → `GoodGem`, `BadGem`
- Animazioni: `AnimatedSprite` di PixiJS (autoplay)
- Sprite aggiunto/rimosso dalla camera world
- Stessa logica attrazione magnetica GoodGem
- `camera.isOutOfCameraLeft(sprite)` → culling

---

## Player States

Il pattern State Machine è identico nei due sistemi:

```
StatesManager
  ├── RunningState: player corre, velocity.y = 0, aspetta Jump
  └── JumpingState: applica gravità (fallSpeed), torna a Running quando tocca terra
```

- `IPlayerState.Enter()` → configurazione stato
- `IPlayerState.HandleJump()` → evento jump
- `IPlayerState.Update(elapsed) → IPlayerState` → ritorna prossimo stato

---

## Parallax Background (HorizontalScrollingBackground)

### MonoGame
- 7 layer (0-6) con scrolling speed relativa al player velocity X
- Layer 7 = fill viewport senza scrolling
- Ogni layer è un array di Sprite tiled orizzontalmente
- Velocità relativa: `layer6=-0.6*mult`, `layer5=-0.5*mult`, ecc.

### PixiJS
- Texture da `backgroundsSpriteSheet.textures['bg0']`, `['bg1a']`, ecc.
- Layer 7 (fill viewport, `bg7`): `app.stage.addChild` senza camera, fisso
- Layer 0-6: gestione manuale di tile orizzontale (come C#), aggiunto allo stage in un container fisso (non nella camera world, per evitare doppio scroll)
- Ogni layer ha la sua velocità di scroll relativa al player velocity X

---

## Particle System

### MonoGame: ParticleGenerator (FbonizziMonoGame)
- `CometParticleSystem` estende `ParticleGenerator`
- Parametri: density, minNum/maxNum, speed, acceleration, rotation, lifetime, scale, angle

### PixiJS: ParticleSystem (COPIA DIRETTA dal riferimento)
- `CometParticleSystem` estende `ParticleSystem`
- Stessi parametri, stessa struttura
- Particles aggiunti a `camera.addToWorld(particle.sprite)`
