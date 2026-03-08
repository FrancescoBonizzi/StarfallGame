# Gestione Responsive per Giochi PixiJS (Vite + TypeScript)

Pattern riutilizzabile per massimizzare la resa grafica su mobile e tablet.

---

## Principi fondamentali

Un gioco PixiJS ha sempre una **risoluzione logica fissa** (es. 800×480).
Il responsive non cambia il mondo di gioco — cambia solo **quanto grande appare il canvas sullo schermo**.

Separazione dei concetti:
- **Risoluzione logica**: 800×480 — il mondo di gioco, invariato
- **Device Pixel Ratio (DPR)**: quanti pixel fisici per pixel CSS (1x desktop, 2x Retina, 3x AMOLED)
- **CSS size del canvas**: quanto spazio fisico occupa a schermo

---

## 1. Inizializzazione PixiJS

```typescript
const GAME_W = 800;
const GAME_H = 480;

await app.init({
  width: GAME_W,
  height: GAME_H,
  autoDensity: true,                              // scala automatica per DPR
  resolution: Math.min(window.devicePixelRatio || 1, 2), // cap a 2x (evita sprechi memoria su 3x/4x)
  antialias: true,
  background: "#0b1220",
});
```

**Perché cappare a 2?** Su schermi 3x o 4x (molti Android), usare la risoluzione nativa triplica la memoria della texture del canvas senza beneficio visivo apprezzabile.

---

## 2. Viewport meta (index.html)

```html
<meta name="viewport"
  content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover"/>
```

| Parametro | Perché |
|-----------|--------|
| `user-scalable=no` | Disabilita pinch-zoom — indispensabile in un gioco touch |
| `viewport-fit=cover` | Estende il viewport sotto il notch iPhone — indispensabile se usi `env(safe-area-inset-*)` nel CSS |

---

## 3. CSS container e canvas

```css
html, body {
  height: 100%;
  overflow: hidden;
  overscroll-behavior: none;        /* nessuno scroll/bounce mobile */
  background: #0b1220;              /* colore uguale al canvas per le bande nere */
}

#game-wrapper {
  position: relative;
  width: 100%;
  height: 100svh;                   /* svh = Small Viewport Height (esclude address bar) */
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

@supports (height: 100dvh) {
  #game-wrapper {
    height: min(100dvh, 100svh);    /* dvh = Dynamic VH, cambia con address bar */
  }
}

#game-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  /* NESSUNA width/height fissa qui — la gestisce il JS */
}
```

**Perché `svh` invece di `vh`?** Su mobile `100vh` include la address bar nascosta: il canvas viene tagliato. `100svh` usa l'altezza reale disponibile.

---

## 4. Funzione resize() — scale letterboxing

```typescript
function resize() {
  if (!app || !gameContainer) return;

  const containerW = gameContainer.clientWidth;
  const containerH = gameContainer.clientHeight;
  if (containerW === 0 || containerH === 0) return;

  // Scale uniforme che preserva il rapporto GAME_W:GAME_H
  const scale = Math.min(containerW / GAME_W, containerH / GAME_H);

  // Renderer rimane a 800×480 (coordinate di gioco invariate)
  app.renderer.resize(GAME_W, GAME_H);

  // Il canvas CSS viene scalato per riempire lo schermo
  app.canvas.style.width  = Math.floor(GAME_W * scale) + "px";
  app.canvas.style.height = Math.floor(GAME_H * scale) + "px";
}
```

L'idea: `scale = Math.min(W_ratio, H_ratio)` → il canvas si allarga fino a toccare il bordo più stretto del container, lasciando bande nere sugli altri lati (letterboxing).

---

## 5. ResizeObserver (preferito a window resize)

```typescript
let resizeObserver: ResizeObserver | null = null;

// In initGame():
resizeObserver = new ResizeObserver(resize);
resizeObserver.observe(gameContainer);
resize(); // chiamata iniziale

// In destroyGame():
resizeObserver?.disconnect();
resizeObserver = null;
```

**Perché non `window.addEventListener("resize")`?**
Su mobile l'apparizione/scomparsa della address bar non triggera sempre `window.resize`.
`ResizeObserver` monitora direttamente le dimensioni del container — più affidabile.

---

## 6. Forcing landscape su mobile

### Strategia a due livelli

**Livello 1 — Screen Orientation API** (Android Chrome, PWA):
```typescript
// In initGame(), dopo app.init():
try {
  await screen.orientation.lock('landscape');
} catch {
  // iOS Safari non supporta questa API → gestito dal livello 2
}

// In destroyGame():
try { screen.orientation.unlock(); } catch {}
```

**Livello 2 — Overlay "Ruota il dispositivo"** (iOS Safari e qualsiasi altro browser):

HTML (nel template del game-wrapper):
```html
<div id="orientation-overlay">
  <div class="orientation-content">
    <span class="rotate-icon">↻</span>
    <p>Ruota il dispositivo</p>
  </div>
</div>
```

CSS:
```css
#orientation-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #0b1220;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  font-size: 1.2rem;
}

#orientation-overlay.visible {
  display: flex;
}

.rotate-icon {
  font-size: 4rem;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

Aggiornare `resize()` per mostrare/nascondere l'overlay:
```typescript
if (orientationOverlay) {
  const isPortrait = containerH > containerW;
  orientationOverlay.classList.toggle('visible', isPortrait);
}
```

### Perché NON usare il CSS rotation trick

Il CSS `transform: rotate(90deg)` sul wrapper sembra una soluzione elegante ma **rompe gli eventi touch/pointer**: le coordinate X/Y ricevute dal gioco non corrispondono alla posizione visiva dei tap. Non usarlo per giochi con input interattivo.

---

## 7. Riepilogo struttura DOM e stack

```
<body>
  <div id="app">               ← router target
    <div id="game-wrapper">    ← fullscreen flex container (100svh)
      <div id="game-container"> ← centered flex, 100%
        <canvas>               ← PixiJS, dimensionato da resize()
      </div>
      <div id="orientation-overlay"> ← fullscreen, z-index alto
    </div>
  </div>
</body>
```

---

## 8. Checklist

- [ ] `autoDensity: true` + `resolution: Math.min(DPR, 2)` in `app.init()`
- [ ] Viewport meta con `user-scalable=no, viewport-fit=cover`
- [ ] CSS usa `100svh` (non `100vh`) per l'altezza del wrapper
- [ ] `env(safe-area-inset-bottom)` su body e wrapper
- [ ] `resize()` usa `Math.min(containerW/W, containerH/H)` per lo scale
- [ ] `ResizeObserver` invece di `window.resize`
- [ ] `screen.orientation.lock('landscape')` in `try/catch`
- [ ] Overlay portrait con `classList.toggle('visible', isPortrait)` in `resize()`
- [ ] Background `html/body` uguale al colore del canvas (bande nere coerenti)
- [ ] `overflow: hidden; overscroll-behavior: none` su body
