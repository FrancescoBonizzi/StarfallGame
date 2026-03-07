# CLAUDE.md — Regole di migrazione Starfall: MonoGame → PixiJS

## Contesto

Stiamo migrando il videogioco **Starfall** da MonoGame (C#) a PixiJS (TypeScript).

- **Sorgente C#**: `CSharp/Starfall/` (e sottoprogetti, ignorare Android/UWP/WindowsDesktop)
- **Destinazione Web**: `Web/` (scaffold da fare — public/assets già popolato)
- **Riferimento migrato**: `progetto-riferimento/InfartGame/Web/` (progetto già funzionante da copiare/adattare)
- **Docs di migrazione**: `migration-specs/ARCHITECTURE_MAP.md` e `migration-specs/PATTERN_COOKBOOK.md`
- **Memory** `memory/MEMORY.md`

---

## Stack tecnologico (identico al riferimento)

```json
{
  "dependencies": {
    "howler": "^2.2.4",
    "navigo": "^8.11.1",
    "pixi.js": "^8.6.2"
  },
  "devDependencies": {
    "@types/howler": "^2.2.12",
    "typescript": "^5.7.2",
    "vite": "^7.1.11"
  }
}
```

Build: `tsc && vite` / `tsc && vite build`. Risoluzione moduli: `bundler`. Target: `ES2020`.

---

## Struttura Web/

```
Web/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── assets/
│       ├── fonts/
│       ├── images/
│       │   └── spriteSheets/       ← JSON + PNG spritesheet PixiJS
│       └── sounds/
│           ├── music/
│           └── effects/
└── src/
    ├── main.ts
    ├── Game.ts
    ├── IHasCollisionRectangle.ts
    ├── assets/
    │   ├── StarfallAssets.ts        ← interface assets
    │   └── AssetsLoader.ts          ← loadAssets() async
    ├── background/
    ├── gems/
    │   └── generators/
    ├── hud/
    ├── interaction/
    ├── pages/
    ├── particleEmitters/
    ├── player/
    │   └── states/
    ├── primitives/
    ├── services/
    ├── uiKit/
    └── world/
```

---

## Regola 1: Copia diretta dal riferimento (senza modifiche)

I seguenti file vanno **copiati identici** dal riferimento (`progetto-riferimento/InfartGame/Web/src/`):

- `world/Camera.ts`
- `services/CollisionSolver.ts`
- `services/Numbers.ts`
- `services/StringHelper.ts`
- `services/AudioUnlocker.ts`
- `services/SoundInstance.ts`
- `interaction/Controller.ts`
- `particleEmitters/ParticleSystem.ts`
- `particleEmitters/Particle.ts`
- `primitives/Interval.ts`
- `uiKit/LoadingThing.ts`
- `IHasCollisionRectangle.ts`

---

## Regola 2: Adattare dal riferimento (stessa struttura, contenuto Starfall)

| File                          | Cosa cambia                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------ |
| `services/ScoreRepository.ts` | Prefix `'starfall-score'`, types: `'aliveTime' \| 'glows' \| 'bestJump'`             |
| `services/SoundManager.ts`    | Suoni Starfall: `running.mp3`, `menu.mp3`, `slideshow.mp3`, `takegem.mp3`, `die.mp3` |
| `pages/router.ts`             | Routes: `/`, `/game`, `/scores`, `/gameover`, `/incipit`, `/protips`                 |
| `pages/gamebootstrap.ts`      | GAME_W=800, GAME_H=480, usa `StarfallAssets` e `Game` Starfall                       |
| `pages/menu.ts`               | HTML Starfall: titolo "Starfall", bottoni GIOCA/STORIA/PUNTEGGIO                     |
| `pages/gameover.ts`           | Stats Starfall: aliveTime, glows, bestJump                                           |
| `pages/score.ts`              | Stats record Starfall                                                                |
| `assets/AssetsLoader.ts`      | Carica spritesheet Starfall                                                          |
| `assets/StarfallAssets.ts`    | Interface assets Starfall (non InfartAssets)                                         |

---

## Regola 3: Creare ex-novo (da C# → TS seguendo PATTERN_COOKBOOK.md)

- `Game.ts` (corrisponde a `StarfallGame.cs`)
- `player/Player.ts`
- `player/PlayerAnimations.ts`
- `player/JumpGemBar.ts`
- `player/states/IPlayerState.ts`
- `player/states/RunningState.ts`
- `player/states/JumpingState.ts`
- `player/states/StatesManager.ts`
- `particleEmitters/CometParticleSystem.ts`
- `gems/Gem.ts`
- `gems/GoodGem.ts`
- `gems/BadGem.ts`
- `gems/GemFactory.ts`
- `gems/GemsManager.ts`
- `gems/generators/IBadGemBatchGenerator.ts`
- `gems/generators/IGoodGemBatchGenerator.ts`
- `gems/generators/BadGemPlayerStraightLineGenerator.ts`
- `gems/generators/BadGemScreenBorderStraightLineGenerator.ts`
- `gems/generators/BadGemPlayerStraightLineSequenceGenerator.ts`
- `gems/generators/GoodGemStaticYGridGenerator.ts`
- `gems/generators/GoodGemScaleGenerator.ts`
- `background/HorizontalScrollingBackground.ts`
- `background/FillBackground.ts`
- `hud/Hud.ts`
- `pages/incipit.ts`
- `pages/protips.ts`

---

## Regola 4: Sistema di coordinate

- In MonoGame Y cresce verso il **basso** (Y=0 = top)
- Con la Camera del riferimento, Y=0 = **ground**, Y negativo = **in alto**
- Il player corre al livello del suolo: `player.y ≈ 0` (o leggermente negativo per stare sopra)
- Tutti i calcoli di velocità verticale e gravity cambiano segno rispetto al C#
- La camera segue solo X (come nel C#): `camera.x = lerp(camera.x, player.x - offset, 0.08)`

---

## Regola 5: Rendering (nessun Draw esplicito)

- **Non scrivere mai metodi `draw()`** che chiamano `spriteBatch.Draw()`
- Aggiungere sprite al grafo di scena: `camera.addToWorld(sprite)` o `app.stage.addChild(sprite)`
- Ordine di rendering = ordine di `addChild`
- Per rimuovere: `camera.removeFromWorld(sprite)` o `sprite.destroy()`
- HUD = `app.stage.addChild(sprite)` (sempre sopra la camera world)

---

## Regola 6: Gestione dei frame (Ticker)

```typescript
update(time: Ticker) {
    const dt = time.elapsedMS / 1000; // secondi dall'ultimo frame
}
```

- **NON usare** `time.deltaTime` raw come se fosse secondi (è moltiplicatore di frame)
- `time.elapsedMS / 1000` = secondi reali trascorsi dall'ultimo frame

---

## Regola 7: Spritesheet (già pronte)

Le spritesheets sono **già convertite e presenti** in `Web/public/assets/images/spriteSheets/`:

| File JSON          | File PNG          | Contenuto                                                                                          |
| ------------------ | ----------------- | -------------------------------------------------------------------------------------------------- |
| `others.json`      | `others.png`      | Animazioni player (run/jump/death), goodGlow, badGlow, cometParticle, glow sprites, UI backgrounds |
| `backgrounds.json` | `backgrounds.png` | Layer parallax bg0, bg1a, bg1b, bg1c, bg2..bg7                                                     |
| `protips.json`     | `protips.png`     | TIP_1..4, TIPS_glow, TIPS_life, TIPS_timejump                                                      |

Animazioni disponibili nel JSON (sezione `animations`):

- `others.json`: `playerRun`, `playerJump`, `playerDeath`, `goodGlow`, `badGlow`
- `backgrounds.json`: nessuna (solo frame statici)
- `protips.json`: nessuna (solo frame statici)

Sprite statici notevoli in `others.json`: `glow-omino`, `glow-terra-omino`, `glow-bianco`, `glow-rosso`, `cometParticle`, `menuBackground`, `gameover`, `scorebg`, `incipitbg`.

---

## Regola 8: Suoni (già copiati)

I file MP3 sono **già presenti** in `Web/public/assets/sounds/`:

| Percorso web                 | SoundManager key |
| ---------------------------- | ---------------- |
| `sounds/music/running.mp3`   | `musicGame`      |
| `sounds/music/menu.mp3`      | `musicMenu`      |
| `sounds/music/slideshow.mp3` | `musicIncipit`   |
| `sounds/effects/takegem.mp3` | `takeGem`        |
| `sounds/effects/die.mp3`     | `die`            |

`SoundManager` è singleton (vedi `SoundInstance.ts` dal riferimento da copiare).

---

## Regola 9: TypeScript strict

Il `tsconfig.json` usa strict mode con:

- `noUnusedLocals: true` — eliminare ogni variabile inutilizzata
- `noUnusedParameters: true` — eliminare ogni parametro inutilizzato
- `strictNullChecks` (implied by `strict: true`)
- `noUncheckedIndexedAccess: true` — accesso array/dict restituisce `T | undefined`

Quindi: usare `!` solo quando certi, oppure gestire `undefined`.

---

## Regola 10: Flusso di navigazione

```
/ (menu)
  ├── /game       ← PixiJS canvas, destroyGame() su leave
  ├── /incipit    ← HTML page (slideshow testi)
  ├── /scores     ← HTML page
  └── /gameover   ← HTML page (dopo /game)
        └── /protips ← HTML page (tip immagine, poi torna a /)
```

- Il Game.ts detecta `player.isDead` e naviga a `/gameover` con `setTimeout(5000)`
- `ScoreRepository.setScore(...)` va chiamato prima del navigate, dentro `Game.update()`
- Su `/gameover` il SoundManager switcha a menu soundtrack

---

## Regola 11: Ordine di sviluppo consigliato

1. **Scaffold**: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`
2. **Copia primitivi**: Camera, CollisionSolver, Numbers, Controller, ParticleSystem, ecc.
3. **Assets**: (PNG/MP3/JSON già pronti in `Web/public/`) → scrivere AssetsLoader + StarfallAssets
4. **Infrastruttura**: main.ts, router.ts, gamebootstrap.ts, SoundManager, ScoreRepository
5. **Pages HTML**: menu, score, gameover, incipit, protips
6. **Game core**: Game.ts con parallax backgrounds + camera
7. **Player**: Player + States (Running/Jumping) + JumpGemBar + CometParticleSystem
8. **Gems**: Gem base → GoodGem + BadGem → Generators → GemsManager
9. **HUD**: JumpGemBar display + timer display
10. **Polish**: collisioni, difficulty increase, score tracking, record notification

---

## Regola 12: Non reinventare

Prima di scrivere qualsiasi codice, controllare se:

1. Esiste già nel progetto riferimento (copia diretta o adattamento)
2. Esiste già in `migration-specs/PATTERN_COOKBOOK.md`
3. Può essere traduzione diretta dal C# corrispondente

Solo se nessuna delle tre si applica, scrivere da zero.

---

## Note specifiche su Starfall vs Infart

| Aspetto         | Infart (riferimento)           | Starfall (da migrare)                             |
| --------------- | ------------------------------ | ------------------------------------------------- |
| Player movement | Corre + salta (Y axis gravity) | Uguale                                            |
| Gems            | PowerUp (verdure) + Hamburger  | GoodGlow (attrae) + BadGlow (uccide)              |
| Score           | Distanza percorsa (metri)      | Tempo in vita + N glow + miglior salto            |
| Background      | Cityscape parallax (edifici)   | Spazio parallax (layer 0-7)                       |
| Camera          | Segue X e Y (con zoom)         | Segue solo X                                      |
| Pages extra     | /                              | Incipit (slideshow testuale) + Protips (immagini) |
| Difficoltà      | Aumenta velocità ogni 30 score | Aumenta ogni 20 secondi (max 4 volte)             |
| JumpGemBar      | Non presente                   | Barra salti: max 6, token animati                 |
