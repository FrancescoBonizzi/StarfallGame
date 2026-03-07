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

- [ ] Fase 0: Scaffold base (package.json, tsconfig, vite.config, index.html)
- [ ] Fase 1: Copia primitivi dal riferimento
- [x] Fase 2: Assets — spritesheet JSON generati + PNG e MP3 copiati in Web/public/
- [ ] Fase 3: Infrastruttura (router, pages, SoundManager)
- [ ] Fase 4: Game core (backgrounds, camera, game loop)
- [ ] Fase 5: Player + States + JumpGemBar + CometParticles
- [ ] Fase 6: Gems (Good/Bad) + Generators + GemsManager
- [ ] Fase 7: HUD + collisioni + score + difficoltà

## Checkpoint obbligatori (aspettare approvazione)

- Dopo Fase 0: verifica package.json e tsconfig
- Dopo Fase 2: verifica struttura JSON spritesheets
- Dopo Fase 3: verifica che il routing e la navigazione funzionino
- Dopo Fase 4: verifica game loop gira a vuoto nel browser

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
