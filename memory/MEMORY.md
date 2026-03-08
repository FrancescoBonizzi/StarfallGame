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
- [ ] Fase 4 (prossima): Player + States
- [ ] Fase 5: JumpGemBar (questa parte mi raccomando prendila ad esempio da progetto-riferimento, vedi ad esempio /hud) + CometParticles (ricordati che il ParticleSystem l'abbiamo copiato dal progetto-riferimento e riutilizziamo la classe base e noi sviluppiamo implementazioni della classe base)
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
Velocità parallax (multiplier=1.5): bg6=-0.9, bg5=-0.75, bg4=-0.3, bg3=0.0, bg2=0.45, bg1a=1.2, bg0=1.5

**TEMP Phase 3 — da rimuovere in Fase 4:** `Game.ts` ha `_testVX`, `_onKeyDown`, `_onKeyUp` e
`window.addEventListener` per ArrowLeft/ArrowRight. In Fase 4 rimuovere tutto e usare `player.velocity.x`.

## Prossimo passo: Fase 4 — Player + States

Implementare:

1. `player/states/IPlayerState.ts`
2. `player/states/RunningState.ts`
3. `player/states/JumpingState.ts`
4. `player/states/StatesManager.ts`
5. `player/PlayerAnimations.ts`
6. `player/Player.ts` — corre al livello ground (y≈0), gestisce salti, velocity.x usata dai layer
7. In `Game.ts`: rimuovere codice TEMP keyboard; aggiungere campo `_camera`, `_player`, `_controller`; camera segue X del player; passare `player.velocity.x` ai layer
8. Verifica checkpoint: player visibile che corre nel browser

## Checkpoint obbligatori (aspettare approvazione)

- [x] Dopo Fase 0+1: tsc + vite build puliti, menu navigabile nel browser
- [x] Dopo Fase 3: tsc + vite build puliti, game loop gira a vuoto
- [ ] Dopo Fase 4: player visibile che corre

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
