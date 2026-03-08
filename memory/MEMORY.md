# Starfall Migration Project Memory

## Progetto

Migrazione di StarfallGame da MonoGame (C#) a PixiJS (TypeScript).

## Percorsi chiave

- C# sorgente: `CSharp/Starfall/` (ignorare Android/UWP/WindowsDesktop)
- Web destinazione: `Web/` (da creare)
- Riferimento migrato: `progetto-riferimento/InfartGame/Web/`
- Docs migrazione: `migration-specs/ARCHITECTURE_MAP.md`, `migration-specs/PATTERN_COOKBOOK.md`
- Regole sessione: `CLAUDE.md` (radice repo)

## Stack Web

- pixi.js ^8.6.2, howler ^2.2.4, navigo ^8.11.1
- typescript ^5.7.2, vite ^7.1.11
- Build: `tsc && vite`

## Stato migrazione

- [x] Fase 0: Scaffold base (package.json, tsconfig, vite.config, index.html) — COMPLETO
- [x] Fase 1: Primitivi + infrastruttura + menu funzionante — COMPLETO
- [x] Fase 2: Assets — spritesheet JSON generati + PNG e MP3 copiati in Web/public/
- [x] Fase 3: Game core (backgrounds, camera, game loop) — COMPLETO
- [x] Fase 4: Player + States — COMPLETO
- [x] Fase 5: JumpGemBar UI token display + CometParticleSystem — COMPLETO
- [ ] Fase 6: Gems (Good/Bad), mi raccomando, analizza come fatto nel progetto-riferimento, perché anche lì c'era lo stesso ragionamento, l'ho chiamato /gemme. + Generators + GemsManager
- [ ] Fase 7: HUD + collisioni + score + difficoltà

### Fase 0+1 — File creati in Web/src/

- Scaffold: `vite-env.d.ts`, `main.ts`, `ui/styles.css`
- Assets: `assets/StarfallAssets.ts`, `assets/AssetsLoader.ts`
- Services: `services/CollisionSolver.ts`, `Numbers.ts`, `StringHelper.ts`, `AudioUnlocker.ts`, `SoundInstance.ts`, `SoundManager.ts`, `ScoreRepository.ts`
- Interaction: `interaction/Controller.ts`
- Particles: `particleEmitters/ParticleSystem.ts`, `Particle.ts`
- Primitives: `primitives/Interval.ts`
- uiKit: `uiKit/LoadingThing.ts`
- World: `world/Camera.ts`, `IHasCollisionRectangle.ts`
- Pages: `pages/router.ts`, `gamebootstrap.ts`, `menu.ts`, `gameover.ts`, `score.ts`, `incipit.ts`, `protips.ts`
- `Game.ts` (stub vuoto → implementato in Fase 3)
- Font: `public/assets/fonts/PatrickHandSC-Regular.ttf`

### Build (Fase 3)

`tsc --noEmit` → 0 errori. `vite build` → successo (warning dynamic import in router.ts era già presente).

## UI/CSS — stato attuale (styles.css)

Lavoro fatto su `Web/src/ui/styles.css` e `Web/src/pages/incipit.ts`:

- Sprite background su tutte le pagine HTML tramite `services/SpriteBackground.ts`
- `.menu-panel` a sinistra con gradiente fade verso destra (desktop), 200px su mobile
- `.title` con `letter-spacing: 0.06em` (LL di "Starfall" leggibile)
- `.score-value` colore `var(--sf-gold)` (non più cyan `--accent`)
- `.incipit-texts` con `position: relative`, `.incipit-text` con `position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%)` — testi sovrapposti, nessun overflow laterale
- Incipit JS: cross-fade tra due testi (fade-in nuovo → 2500ms entrambi visibili → fade-out vecchio → 1500ms → prossimo)
- Media query mobile (≤600px): menu panel 200px fisso, titolo 36px left-aligned
- Media query landscape short (≤450px height): layout orizzontale menu+score

## Fase 3 — File creati in Web/src/

- `background/FillBackground.ts` — TilingSprite statico, aggiunto a app.stage (layer7/bg7)
- `background/HorizontalScrollingBackground.ts` — TilingSprite parallax, update(playerVelocityX, dt)
- `Game.ts` — loop con 7 layer parallax + Camera; playerVelocityX da tastiera (TEMP) per Fase 4

Ordine addChild su app.stage: FillBackground → HScrollLayers(6→0) → Camera world → (HUD in Fase 7)
Velocità parallax corrette (TS UV-offset formula: 1 + C#_speed×1.5): bg6=0.1, bg5=0.25, bg4=0.7, bg3=1.0, bg2=1.45, bg1a=2.2, bg0=2.5

**TEMP Phase 3 rimosso in Fase 4:** `Game.ts` ora usa `player.velocityX` per il parallax.

## Fase 4 — File creati in Web/src/

- `player/PlayerAnimations.ts` — interfaccia (run/jump/death AnimatedSprite)
- `player/states/IPlayerState.ts` — interfaccia stato (handleJump, update, enter)
- `player/states/IPlayerStateContext.ts` — interfaccia minima esposta dal Player agli stati (evita circular deps)
- `player/states/RunningState.ts` — sta a terra, aspetta input salto
- `player/states/JumpingState.ts` — gestisce gravità (780 units/s²), impulso salto (-410), consumo token
- `player/states/StatesManager.ts` — macchina a stati, traccia bestJumpDuration
- `player/JumpGemBar.ts` — token di salto (logica, UI in Fase 5): max 6, startingJumps=4
- `player/Player.ts` — corre a velocityX=94px/s, sistema di coordinate gameY (0=ground, negative=up)
  - `_groundWorldY = camera.worldHeight - 25` (camera world Y dove i piedi del player toccano terra)
  - sprite.y = `_groundWorldY + gameY - spriteHeight`
  - glow-omino + glow-terra-omino (alpha fade con altitudine)
  - Hitbox: RunningState x=45,y=38,w=75,h=80 / JumpingState x=30,y=38,w=50,h=90
  - Constructor chiama `statesManager.handleJump()` (come C#: inizia in aria)
- `Game.ts` aggiornato: Controller + Player + camera X tracking (`lerp(x, player.x-134, min(1,4.8*dt))`)
- `assets/StarfallAssets.ts` aggiornato: PlayerAnimations importato da `player/PlayerAnimations.ts`

## Fix post-Fase 5 (bug visivi)

- `player/JumpGemBar.ts`: `TOKEN_Y` 446 → 469 (HUD bar a Y=458–480, center=469; bar sotto i piedi del player)
- `player/Player.ts`: `_glowTerraOmino.y` 30 → `-GROUND_PAD` (-25 in camera world → screen_y≈458, visibile ai piedi)
- `Game.ts`:
  - **Parallax fix**: rimosso `PARALLAX_MULTIPLIER`. Formula corretta TS: `TS_speed = 1 + C#speed_×1.5`
    Nuovi valori: bg6=0.1, bg5=0.25, bg4=0.7, bg3=1.0, bg2=1.45, bg1a=2.2, bg0=2.5
  - **Score display**: aggiunto `_elapsedMs`, `_scoreText: ScoreText` (si aggiorna solo se player vivo)
  - **HUD bar**: `Graphics` semitrasparente nero (800×22, y=458, alpha=0.6) su `app.stage`
    Bar Y calcolata: `GAME_H + (-GROUND_PAD) * zoom = 480 + (-25)*0.9 ≈ 458` (subito sotto i piedi del player)
  - Score formula: `Math.floor(elapsedMs/1000) * 10` (da aggiornare con gem count in Fase 7)
- `hud/HudText.ts` (NUOVO): adattato da reference, usa StarfallAssets
- `hud/ScoreText.ts` (NUOVO): adattato da reference, `updateScore(n: number)` → "Punteggio: N"

## Prossimo passo: Fase 6 — Gems

Analizzare `/gemme` del progetto-riferimento, poi implementare:

- `gems/Gem.ts`, `GoodGem.ts`, `BadGem.ts`, `GemFactory.ts`, `GemsManager.ts`
- `gems/generators/` (5 generator files)

## Fase 5 — File modificati/creati in Web/src/

- `particleEmitters/CometParticleSystem.ts` (NUOVO) — estende ParticleSystem
  - density=5, numParticles={5,8}, speed={80,100}, acceleration={30,50}
  - rotationSpeed={-π,+π}, lifetimeSeconds={0.6,0.9}, scale={0.1,0.7}
  - spawnAngleDegrees={-45,235}, blendMode='add'
  - Valori 1:1 dal C# (timespan ms → secondi, tutto il resto identico)
- `player/JumpGemBar.ts` (MODIFICATO) — aggiunta UI display token
  - Constructor: `(container: Container, assets: StarfallAssets, startingJumps: number)`
  - 6 sprite fissi `goodGlowFrames[0]` (74×74px, frame 0 dell'animazione goodGlow), scale=0.5, anchor=center
  - TOKEN_START_X=160, TOKEN_GAP=6, TOKEN_Y=469 (= HUD_Y + HUD_HEIGHT/2 = 458 + 11)
  - Spacing dinamico: `i * (tex.width * 0.5 + TOKEN_GAP)`
  - Active: alpha=1.0, inactive: alpha=0.3, fade-in 300ms, fade-out 150ms (easeOutCubic)
  - update(time: Ticker) guida le animazioni fade
- `player/Player.ts` (MODIFICATO)
  - Constructor: aggiunto `hudContainer: Container` come 3° parametro
  - JumpGemBar riceve hudContainer + assets (crea i propri sprite lì dentro)
  - CometParticleSystem istanziato nel costruttore; addParticles() ogni frame se vivo
  - Emit position: `(position.x + w/2, position.y - h/2 - GROUND_PAD)` = centro sprite
  - jumpGemBar.update() e cometSystem.update() chiamati ogni frame (anche dopo morte)
- `Game.ts` (MODIFICATO)
  - `new Player(assets, this._camera, app.stage)` — app.stage è hudContainer temporaneo
  - Sarà sostituito dal container di Hud in Fase 7

## File da copiare IDENTICI dal riferimento

Camera.ts, CollisionSolver.ts, Numbers.ts, StringHelper.ts, AudioUnlocker.ts,
SoundInstance.ts, Controller.ts, ParticleSystem.ts, Particle.ts, Interval.ts,
LoadingThing.ts, IHasCollisionRectangle.ts

## Differenze chiave Starfall vs Infart (riferimento)

- Camera: solo X tracking (no Y/zoom), ground a y=0
- Gems: GoodGlow (magnetico) + BadGlow (uccide), non verdure/hamburger
- Score: aliveTime + glows + bestJump (non distanza/scoregge/verdure)
- JumpGemBar: max 6 token, raccolti da GoodGem, usati per saltare
- Pages extra: /incipit (slideshow testi) + /protips (immagini tip)
- Difficoltà: ogni 20s x4 volte (non basata su distanza)
- Spritesheet: già convertite in JSON PixiJS (Web/public/assets/images/spriteSheets/)
- Suoni: già copiati in Web/public/assets/sounds/

## Spritesheets Starfall (già pronte)

- `others.json/.png` — animazioni: playerRun, playerJump, playerDeath, goodGlow, badGlow (20 frame ciascuna)
  sprite statici: glow-omino, glow-terra-omino, glow-bianco, glow-rosso, cometParticle,
  menuBackground, gameover, scorebg, incipitbg
- `backgrounds.json/.png` — frame statici: bg0, bg1a, bg1b, bg1c, bg2..bg7
- `protips.json/.png` — frame statici: TIP_1..4, TIPS_glow, TIPS_life, TIPS_timejump

## Suoni Starfall (già pronti)

sounds/music/running.mp3 → musicGame
sounds/music/menu.mp3 → musicMenu
sounds/music/slideshow.mp3 → musicIncipit
sounds/effects/takegem.mp3 → takeGem
sounds/effects/die.mp3 → die
