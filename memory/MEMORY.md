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
- [ ] Fase 2: Assets (spritesheet JSON, suoni)
- [ ] Fase 3: Infrastruttura (router, pages, SoundManager)
- [ ] Fase 4: Game core (backgrounds, camera, game loop)
- [ ] Fase 5: Player + States + JumpGemBar + CometParticles
- [ ] Fase 6: Gems (Good/Bad) + Generators + GemsManager
- [ ] Fase 7: HUD + collisioni + score + difficoltà

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
- Spritesheet: others.png/backgrounds.png/protips.png (da convertire in JSON PixiJS)

## Spritesheets Starfall
- `others.txt` → animazioni run/jump/death (20 frame ciascuna), good_glow/bad_glow (20 frame),
  cometParticle, gameover, glow-omino, glow-bianco, glow-rosso, glow-terra-omino,
  menuBackground, scorebg, incipitbg, jump_*, run_*
- `backgrounds.txt` → layer 0-7 (parallax backgrounds)
- `protips.txt` → TIP_1..4, TIPS_glow, TIPS_life, TIPS_timejump

## Suoni Starfall
Running.mp3 → musicGame, menu.mp3 → musicMenu, Slideshow.mp3 → musicIncipit,
TakeGem.mp3 → takeGem, Die.mp3 → die
