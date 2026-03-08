# Fase 5 Implementation Plan: JumpGemBar UI + CometParticleSystem

## Goal

Add visual polish to the existing Player implementation:

1. **`CometParticleSystem`** — particle trail emitted every frame around the player sprite while alive.
2. **`JumpGemBar` visual layer** — six token sprites on the HUD with fade-in/fade-out animations driven by `addJump()` / `removeJump()`.
3. **`Player` wiring** — connect both of the above systems.
4. **`Game` wiring** — pass `app.stage` as `hudContainer` to `Player`.
5. **`MEMORY.md` update** — mark Fase 5 complete and record key decisions.

---

## File dependency order

```
1. Web/src/particleEmitters/CometParticleSystem.ts   (no new deps)
2. Web/src/player/JumpGemBar.ts                      (depends on StarfallAssets, existing)
3. Web/src/player/Player.ts                          (depends on both above)
4. Web/src/Game.ts                                   (depends on Player signature change)
5. memory/MEMORY.md                                  (bookkeeping, no code dep)
```

---

## 1. CREATE `Web/src/particleEmitters/CometParticleSystem.ts`

### Purpose

A concrete subclass of `ParticleSystem` (already in the project at
`Web/src/particleEmitters/ParticleSystem.ts`) that emits the comet-trail
particles behind the player sprite. Directly translated from
`CSharp/Starfall/Players/CometParticleSystem.cs`.

### C# source reference

```csharp
// CSharp/Starfall/Players/CometParticleSystem.cs
public class CometParticleSystem : ParticleGenerator
{
    public CometParticleSystem(Sprite particleSprite)
        : base(
            particleSprite: particleSprite,
            density: 5,
            minNumParticles: 5,  maxNumParticles: 8,
            minInitialSpeed: 80f, maxInitialSpeed: 100f,
            minAcceleration: 30f, maxAcceleration: 50f,
            minRotationSpeed: -MathHelper.Pi, maxRotationSpeed: MathHelper.Pi,
            minLifetime: TimeSpan.FromMilliseconds(600f),
            maxLifetime: TimeSpan.FromMilliseconds(900f),
            minScale: 0.1f, maxScale: 0.7f,
            minSpawnAngle: -45f, maxSpawnAngle: 235f)
    { }
}
```

### Reference pattern

Follow `ScoreggiaParticleSystem` from the reference project at
`progetto-riferimento/InfartGame/Web/src/particleEmitters/ScoreggiaParticleSystem.ts`:
it extends `ParticleSystem` and passes all parameters directly to `super()`.

### TypeScript implementation

```typescript
import ParticleSystem from "./ParticleSystem.ts";
import StarfallAssets from "../assets/StarfallAssets.ts";
import Camera from "../world/Camera.ts";

class CometParticleSystem extends ParticleSystem {
  constructor(assets: StarfallAssets, camera: Camera) {
    super(
      assets.textures.particles.cometParticle,
      camera,
      5, // density
      { min: 5, max: 8 }, // numParticles
      { min: 80, max: 100 }, // speed (units/s)
      { min: 30, max: 50 }, // acceleration (units/s²)
      { min: -Math.PI, max: Math.PI }, // rotationSpeed (rad/s)
      { min: 0.6, max: 0.9 }, // lifetimeSeconds
      { min: 0.1, max: 0.7 }, // scale
      { min: -45, max: 235 }, // spawnAngleDegrees
      "add", // textureBlendMode
      false, // randomizedSpawnAngle
      null, // perspectiveEffect
    );
  }
}

export default CometParticleSystem;
```

### Parameter notes

| Parameter            | C# source                         | TS value                                  |
| -------------------- | --------------------------------- | ----------------------------------------- |
| texture              | `assets.Sprites["cometParticle"]` | `assets.textures.particles.cometParticle` |
| density              | 5                                 | 5                                         |
| numParticles         | min=5, max=8                      | `{ min: 5, max: 8 }`                      |
| speed                | 80–100                            | `{ min: 80, max: 100 }`                   |
| acceleration         | 30–50                             | `{ min: 30, max: 50 }`                    |
| rotationSpeed        | ±π rad/s                          | `{ min: -Math.PI, max: Math.PI }`         |
| lifetimeSeconds      | 600–900 ms                        | `{ min: 0.6, max: 0.9 }`                  |
| scale                | 0.1–0.7                           | `{ min: 0.1, max: 0.7 }`                  |
| spawnAngleDegrees    | −45°..235°                        | `{ min: -45, max: 235 }`                  |
| textureBlendMode     | additive                          | `'add'`                                   |
| randomizedSpawnAngle | false                             | `false`                                   |
| perspectiveEffect    | none                              | `null`                                    |

The C# `ParticleGenerator` base class did not have a `perspectiveEffect` concept;
passing `null` is correct and disables the perspective path in `ParticleSystem.ts`.

---

## 2. MODIFY `Web/src/player/JumpGemBar.ts`

### Current state

`/Users/fbonizzi/Source/StarfallGame/Web/src/player/JumpGemBar.ts`
currently contains pure logic only (no PixiJS imports, no sprites).
Constructor: `constructor(startingJumps: number)`.

### C# source reference

```csharp
// CSharp/Starfall/Players/JumpGemBar.cs  (abbreviated)
public JumpGemBar(Sprite tokenSprite, IScreenTransformationMatrixProvider matrixScaleProvider, int startingJumps)
{
    _tokenSprite = tokenSprite;
    _yPos = matrixScaleProvider.VirtualHeight - 34;  // = 480 - 34 = 446 from top
    for (int j = 0; j < startingJumps; ++j) AddJump();
}

public void AddJump()
{
    var tokenToAdd = new JumpGemBarToken() {
        FadeObject = new FadeObject(TimeSpan.FromSeconds(1), Color.White),
        DrawingInfos = new DrawingInfos() {
            Position = new Vector2(
                160f + _currentJumps.Count * (_tokenSprite.Width + 6),
                _yPos),
            Scale = 0.5f
        }
    };
    tokenToAdd.FadeObject.FadeIn();
    _currentJumps.Add(tokenToAdd);
}
```

### Design decisions vs C#

The C# design tracks only currently-active tokens in `_currentJumps` (tokens are
added/removed from the list). The TypeScript version instead maintains a fixed
array of `MAX_JUMPS=6` sprites and toggles their alpha, matching the visual
metaphor of a bar with 6 slots where inactive slots are dimmed.

Key differences from C#:

- Always create 6 sprites in constructor, never create/destroy them at runtime
- Active token: `alpha=1.0`; inactive token: `alpha=0.3`
- `addJump()` starts a fade-in animation on the newly activated slot (alpha 0.3→1.0, 300ms)
- `removeJump()` starts a fade-out animation on the deactivated slot (alpha 1.0→0.3, 150ms)

### HUD coordinate system

`hudContainer` is `app.stage` (screen-space, origin top-left, Y grows down,
dimensions GAME_W=800 × GAME_H=480 pixels).

The sub-container for the token row is placed at `y = GAME_H = 480`, the
bottom edge of the screen. Token sprite positions are then expressed with
negative Y so that Y=−34 maps to 34px above the bottom edge (446px from the
top). This mirrors the camera-world convention (Y=0 = ground, negative = up)
and matches the C# `_yPos = VirtualHeight − 34`.

```
app.stage  (0,0 = top-left, y grows down)
└── _tokenContainer  position: (0, GAME_H=480)
    └── token[0]  position: (TOKEN_START_X,          TOKEN_Y=-34)
    └── token[1]  position: (TOKEN_START_X + stride,  TOKEN_Y=-34)
    ...
```

### Layout constants

```typescript
const MAX_JUMPS = 6;
const TOKEN_START_X = 160; // x of first token, from C# (same offset)
const TOKEN_GAP = 6; // gap between tokens, from C#
const TOKEN_SCALE = 0.5; // sprite scale, from C#
const TOKEN_Y = -34; // y in sub-container space: 34px above screen bottom
// mirrors C# `VirtualHeight - 34`

const ALPHA_ACTIVE = 1.0;
const ALPHA_INACTIVE = 0.3;

const FADE_IN_MS = 300; // addJump animation duration
const FADE_OUT_MS = 150; // removeJump animation duration
```

Token x position formula (derived from C#):

```typescript
// tokenWidth = displayed width with scale applied
const tokenWidth = assets.textures.glowBianco.width * TOKEN_SCALE;
const stride = tokenWidth + TOKEN_GAP;
tokens[i].x = TOKEN_START_X + i * stride;
```

### Per-token animation state

```typescript
interface TokenAnimation {
  elapsedMs: number;
  fromAlpha: number;
  toAlpha: number;
  durationMs: number;
}
```

One `TokenAnimation | null` per slot. `null` means no animation is in progress
(static alpha). Easing function: `Numbers.easeOutCubic` (already in
`services/Numbers.ts`).

### New constructor signature

```typescript
constructor(container: Container, assets: StarfallAssets, startingJumps: number)
```

Body (outline):

```typescript
// 1. Create sub-container anchored at screen bottom
this._tokenContainer = new Container();
this._tokenContainer.y = GAME_H; // will be a local import constant or parameter
container.addChild(this._tokenContainer);

// 2. Allocate all 6 token sprites; active ones alpha=1, rest alpha=ALPHA_INACTIVE
const tokenWidth = assets.textures.glowBianco.width * TOKEN_SCALE;
const stride = tokenWidth + TOKEN_GAP;
this._tokens = [];
this._animations = [];
for (let i = 0; i < MAX_JUMPS; i++) {
  const sprite = new Sprite(assets.textures.glowBianco);
  sprite.anchor.set(0.5, 0.5);
  sprite.scale.set(TOKEN_SCALE);
  sprite.x = TOKEN_START_X + i * stride;
  sprite.y = TOKEN_Y;
  sprite.alpha = i < startingJumps ? ALPHA_ACTIVE : ALPHA_INACTIVE;
  this._tokenContainer.addChild(sprite);
  this._tokens.push(sprite);
  this._animations.push(null);
}

// 3. Delegate to existing logic to set initial state
// (no change to _currentJumps / _totalJumps counters)
```

### Modified `addJump()`

After incrementing `_currentJumps` (same as before), start a fade-in animation
on the newly activated slot:

```typescript
addJump() {
  if (this._currentJumps < MAX_JUMPS) {
    const idx = this._currentJumps;  // index of the slot that becomes active
    this._currentJumps++;
    this._animations[idx] = {
      elapsedMs: 0,
      fromAlpha: ALPHA_INACTIVE,
      toAlpha: ALPHA_ACTIVE,
      durationMs: FADE_IN_MS,
    };
  }
}
```

### Modified `removeJump()`

After decrementing `_currentJumps` (same as before), start a fade-out animation
on the slot that just became inactive:

```typescript
removeJump() {
  if (this._currentJumps > 0) {
    this._currentJumps--;
    this._totalJumps++;
    const idx = this._currentJumps;  // index of slot that just went inactive
    this._animations[idx] = {
      elapsedMs: 0,
      fromAlpha: ALPHA_ACTIVE,
      toAlpha: ALPHA_INACTIVE,
      durationMs: FADE_OUT_MS,
    };
  }
}
```

### New `update(time: Ticker)` method

Drives all in-flight animations:

```typescript
update(time: Ticker) {
  for (let i = 0; i < MAX_JUMPS; i++) {
    const anim = this._animations[i];
    if (anim === null) continue;
    const token = this._tokens[i];  // tokens[i] is always defined (array length = MAX_JUMPS)

    anim.elapsedMs = Math.min(anim.elapsedMs + time.deltaMS, anim.durationMs);
    const t = Numbers.easeOutCubic(anim.elapsedMs / anim.durationMs);
    token!.alpha = Numbers.lerp(anim.fromAlpha, anim.toAlpha, t);

    if (anim.elapsedMs >= anim.durationMs) {
      token!.alpha = anim.toAlpha;
      this._animations[i] = null;
    }
  }
}
```

Note: the `!` non-null assertion on `token` and `this._tokens[i]` is safe here
because the loop runs from 0 to `MAX_JUMPS-1` and the `_tokens` array is
allocated with exactly `MAX_JUMPS` entries in the constructor.
`noUncheckedIndexedAccess` requires the assertion.

### Imports required

```typescript
import { Container, Sprite, Ticker } from "pixi.js";
import StarfallAssets from "../assets/StarfallAssets.ts";
import Numbers from "../services/Numbers.ts";
```

`GAME_H` (=480) should be imported from a shared constants module if one exists,
or defined as a local `const GAME_H = 480` inside the file. At Fase 5 there is
no shared constants file; define it locally. In Fase 7 when `Hud.ts` is built,
the `JumpGemBar` container will be passed a Hud sub-container instead of
`app.stage`, eliminating the need for `GAME_H` here.

### Fields to add to the class

```typescript
private readonly _tokenContainer: Container;
private readonly _tokens: Sprite[];
private readonly _animations: Array<TokenAnimation | null>;
```

### Unchanged members

- `_currentJumps: number`
- `_totalJumps: number`
- `jumpsAvailable` getter
- `totalJumps` getter

---

## 3. MODIFY `Web/src/player/Player.ts`

Current file: `/Users/fbonizzi/Source/StarfallGame/Web/src/player/Player.ts`

### Constructor signature change

```typescript
// Before
constructor(assets: StarfallAssets, camera: Camera)

// After
constructor(assets: StarfallAssets, camera: Camera, hudContainer: Container)
```

`hudContainer` will be `app.stage` when called from `Game.ts`. In Fase 7 it
will be replaced by a dedicated `Hud` container.

### New field

```typescript
private readonly _cometSystem: CometParticleSystem;
```

### Constructor body changes

Replace the existing `JumpGemBar` instantiation:

```typescript
// Before
this.jumpGemBar = new JumpGemBar(STARTING_JUMPS);

// After
this.jumpGemBar = new JumpGemBar(hudContainer, assets, STARTING_JUMPS);
```

Add comet system instantiation (after camera-related setup, before
`statesManager` instantiation):

```typescript
this._cometSystem = new CometParticleSystem(assets, camera);
```

### `update()` method changes

The C# `Player.Update()` calls:

```csharp
_cometParticleSystem.Update(elapsed);          // always (even when dead)
if (!IsDead)
    _cometParticleSystem.AddParticles(center);  // only when alive
```

Translated to TypeScript (Regola 4 coordinate mapping — camera world: Y=0 =
ground, negative = up):

```typescript
update(time: Ticker) {
  if (!this._isDead) {
    // ... existing state machine + physics ...

    // Emit comet particles at player sprite centre
    const h = this._currentAnimation.height;
    const w = this._currentAnimation.width;
    this._cometSystem.addParticles(new Point(
      this._position.x + w / 2,
      this._position.y - h / 2 - GROUND_PAD,
    ));

    this.syncSpritePositions();
  }

  // Always tick comet system and token animations (fade may still be running
  // after death — let them complete naturally)
  this._cometSystem.update(time);
  this.jumpGemBar.update(time);
}
```

The comet spawn point `(x + w/2, y - h/2 - GROUND_PAD)` maps to the sprite
centre in camera-world coordinates:

- `x + w/2` = horizontal centre of sprite
- `y` = game Y (0=ground), `- h` = sprite top (feet are at y - GROUND_PAD),
  so sprite centre = `y - h/2 - GROUND_PAD`

This matches the C# `DrawingInfos.Center(CurrentAnimation.CurrentFrameWidth,
CurrentAnimation.CurrentFrameHeight)`.

Move `this.syncSpritePositions()` inside the `!this._isDead` block (it should
only run while alive, as the death animation positions are set once in `die()`).
Confirm current behaviour in `Player.ts` line 201 before changing.

### Imports to add

```typescript
import { Container, Point, ... } from "pixi.js";    // add Container to existing import
import CometParticleSystem from "../particleEmitters/CometParticleSystem.ts";
```

`Point` is already imported in the current file.

---

## 4. MODIFY `Web/src/Game.ts`

Current file: `/Users/fbonizzi/Source/StarfallGame/Web/src/Game.ts`

Single change — pass `app.stage` as `hudContainer`:

```typescript
// Before (line 57)
this._player = new Player(assets, this._camera);

// After
this._player = new Player(assets, this._camera, app.stage);
```

No other changes are required. `Game.update()` already calls
`this._player.update(time)`, which now drives both the comet system and the
token animations.

---

## 5. UPDATE `memory/MEMORY.md`

Current file: `/Users/fbonizzi/Source/StarfallGame/memory/MEMORY.md`

### Change 1 — mark Fase 5 complete in status list

```markdown
- [x] Fase 5: JumpGemBar (questa parte mi raccomando prendila ad esempio...
```

(Change `[ ]` to `[x]` on the Fase 5 line.)

### Change 2 — add a Fase 5 section

Add a new section below `## Prossimo passo: Fase 5` (which should be retitled
or replaced):

```markdown
## Fase 5 — File modificati/creati in Web/src/

- `particleEmitters/CometParticleSystem.ts` — estende ParticleSystem
  - texture: assets.textures.particles.cometParticle
  - density=5, numParticles={min:5,max:8}, speed={min:80,max:100}
  - acceleration={min:30,max:50}, rotationSpeed={min:-π,max:π}
  - lifetimeSeconds={min:0.6,max:0.9}, scale={min:0.1,max:0.7}
  - spawnAngleDegrees={min:-45,max:235}, blendMode='add'
  - randomizedSpawnAngle=false, perspectiveEffect=null
  - Emesso ogni frame al centro dello sprite player (finché alive)

- `player/JumpGemBar.ts` — aggiunto display visivo token
  - Nuovo constructor: (container: Container, assets: StarfallAssets, startingJumps: number)
  - Sub-container posizionato a y=GAME_H=480 (bottom screen) su container
  - MAX_JUMPS=6 sprite (assets.textures.glowBianco), scale=0.5, anchor=(0.5,0.5)
  - TOKEN_START_X=160, TOKEN_GAP=6, TOKEN_Y=-34 (34px sopra bottom screen)
  - stride = tokenWidth + TOKEN_GAP, tokenWidth = glowBianco.width \* 0.5
  - Active alpha=1.0; inactive alpha=0.3
  - addJump(): fade-in (alpha 0.3→1.0, 300ms, easeOutCubic)
  - removeJump(): fade-out (alpha 1.0→0.3, 150ms, easeOutCubic)
  - Aggiunto update(time: Ticker) per animazioni

- `player/Player.ts` — aggiunto CometParticleSystem + wiring JumpGemBar UI
  - Constructor: nuovo 3° param hudContainer: Container (= app.stage da Game.ts)
  - \_cometSystem: CometParticleSystem istanziato nel constructor
  - update(): addParticles + update comet, sempre; jumpGemBar.update() sempre
  - Spawn point cometa: Point(x + w/2, y - h/2 - GROUND_PAD)

- `Game.ts` — new Player(assets, this.\_camera, app.stage)
  - In Fase 7 app.stage verrà sostituito dal container HUD dedicato

## Prossimo passo: Fase 6 — Gems + Generators + GemsManager
```

---

## Build validation

After all changes are implemented, run:

```bash
tsc --noEmit
```

Expected: 0 errors under strict mode (`noUnusedLocals`, `noUnusedParameters`,
`noUncheckedIndexedAccess`).

Common strict-mode pitfalls to check:

1. `this._tokens[i]` — use `!` assertion inside the `for (let i = 0; i < MAX_JUMPS; i++)` loop
   since the array is constructed with exactly `MAX_JUMPS` entries.
2. `this._animations[i]` — same pattern.
3. `Container` must be added to the pixi.js import in `Player.ts`.
4. `GAME_H` constant in `JumpGemBar.ts` — define locally if no shared constants file exists;
   no unused-variable warning since it is used in `_tokenContainer.y = GAME_H`.
5. The `TokenAnimation` interface may be defined in the same file as `JumpGemBar.ts`
   (not exported); it is a file-private type.

---

## Summary table

| File                                      | Action | Key change                                                                |
| ----------------------------------------- | ------ | ------------------------------------------------------------------------- |
| `particleEmitters/CometParticleSystem.ts` | CREATE | Subclass of ParticleSystem, 12 params from C#                             |
| `player/JumpGemBar.ts`                    | MODIFY | Add Container/Sprite/Ticker imports + visual token display + update()     |
| `player/Player.ts`                        | MODIFY | Add `hudContainer` param, add `_cometSystem` field, wire both in update() |
| `Web/src/Game.ts`                         | MODIFY | Pass `app.stage` as 3rd arg to `Player` constructor                       |
| `memory/MEMORY.md`                        | UPDATE | Mark Fase 5 [x], add section with decisions                               |
