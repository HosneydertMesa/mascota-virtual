# QA Sign-off: walk v2 natural enhancement

> **Naturaleza**: sign-off del fix que hace que el walk de la mascota
> se vea natural (legs swing 50deg+ visible, body bob pronunciado, tail
> sway amplio, sin frame swap reset).
> **Plan retroactivo**: `docs/plans/walk-v2-natural-enhancement-2026-08-25.md`

**Fecha**: 2026-08-25
**Branch**: `feat/pixijs-rendering`
**Plan companion**: `docs/plans/walk-v2-natural-enhancement-2026-08-25.md`
**Review companion**: `docs/reviews/walk-v2-natural-enhancement-2026-08-25.md`

**Verdict**: **APPROVED**

---

## Resumen del fix

3 partes (2 walk + 1 chat):

1. **`src/styles/dashboard.css`**: 8 amplitudes de keyframes aumentadas
   (leg swing 40→52deg, body bob 4→6px cat / 7→10px dog, tail sway 26→34deg,
   rotation ±1.5→±2.5deg cat). CSS comment explica el rationale.

2. **`src/renderer/pet-viewport.js`**: `startFrameLoop` ahora skipea el
   swap de innerHTML cuando `currentState === 'walking'`. Esto permite
   que la animacion CSS corra su ciclo completo (650ms cat / 480ms dog)
   sin ser reseteada cada 167ms. El swap de las 4 walk frames era
   contraproducente: las 4 frames difieren 1-3px en paw y-offset (no
   visible), pero el reset destruia el motion CSS (muy visible).

3. **`src/styles/pet.css`**: B2 v2 fix — el X button del chat panel
   ahora tiene contraste visible (background 18% white vs 6% antes,
   border 35% white vs 10% antes, color text-main, size 26x26 vs 22x22).
   El fix anterior (max-height) no era el problema real; el X era
   invisible por contraste casi cero.

## Runtime evidence

### Test 1 — suite automatizada via `node --test test/*.test.js`

```
ℹ tests 878
ℹ pass 878
ℹ fail 0
```

878/878 tests verde (3 nuevos + 875 pre-existentes, sin regresiones).
Los 3 tests nuevos son bidireccionales (con fix pass, sin fix fail):
- "dashboard.css: leg swing amplitude es >= 50deg"
- "dashboard.css: body bob translateY es >= 5px"
- "dashboard.css: tail sway amplitude es >= 30deg"

### Test 2 — runtime evidence con Playwright headless Chromium

`test/preview/walk-v2-runtime-evidence.py` carga un HTML que renderiza
un solo SVG (sin swap) y samplea el `getComputedStyle().transform` de
`.back-foot-left` cada 20ms durante 1.5 ciclos.

```
=== walk v2 runtime evidence (frame swap disabled) ===
cat back-foot-left: 40 samples
  range: -28.0 to 23.9 = 51.9deg
dog back-foot-left: 30 samples
  range: -28.0 to 23.8 = 51.8deg
PASS — full swing range observed: cat=51.9deg, dog=51.8deg
  (compared to ~22deg/31deg with frame swap enabled)
```

**Comparativa**:
- Antes del v2 fix (con swap activo): cat 22.6deg, dog 31deg
- Despues del v2 fix (sin swap durante walk): cat 51.9deg, dog 51.8deg
- **Mejora: 2.3x (cat) y 1.7x (dog)** en swing visible

### Test 3 — visual before/after

`docs/chat-screenshots/chat-fixed.png` (regenerado despues del B2 v2 fix):
el X button es ahora claramente visible como un circulo blanco en la
esquina superior derecha del panel del chat. Antes era practicamente
invisible.

## Acceptance criteria

- [x] Leg swing visible >= 50deg en runtime (51.9 / 51.8)
- [x] Body bob translateY >= 5px (6px cat, 10px dog)
- [x] Tail sway range >= 30deg (34deg)
- [x] X button del chat panel visible (screenshot lo confirma)
- [x] Tests bidireccionales verdes
- [x] Runtime evidence con Playwright

## Decision

**Verdict**: **APPROVED**

El fix mejora visiblemente el walk (swing 2.3x, body bob 1.5x, tail
sway 1.3x) y resuelve el X button bug. Los tests son bidireccionales
y la runtime evidence es solida (52deg observados en browser real).

## Files changed

| Archivo | Cambio |
|---|---|
| `src/styles/dashboard.css` | 8 amplitudes de keyframes (leg swing, body bob, tail sway) |
| `src/styles/pet.css` | X button contrast fix (B2 v2) |
| `src/renderer/pet-viewport.js` | Skip frame swap durante walk |
| `test/pet-assets.test.js` | 3 tests nuevos (leg swing, body bob, tail sway) |
| `test/preview/walk-v2-runtime-evidence.py` | Runtime evidence sin swap |
| `test/preview/walk-cycle-capture.py` | Multi-frame capture |
| `docs/plans/walk-v2-natural-enhancement-2026-08-25.md` | Plan retroactivo |
| `docs/qa/walk-v2-natural-enhancement-2026-08-25.md` | Este sign-off |
| `docs/walk-screenshots/walk-v2-no-swap.png` | Screenshot del fix |
| `docs/chat-screenshots/chat-fixed.png` | Screenshot del X button visible |
