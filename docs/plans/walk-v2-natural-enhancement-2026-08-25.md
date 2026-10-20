---
id: walk-v2-natural-enhancement-2026-08-25
status: approved
created: 2026-08-25
size: M
files:
  - src/styles/dashboard.css
  - src/styles/pet.css
  - src/renderer/pet-viewport.js
  - test/pet-assets.test.js
  - test/preview/walk-v2-runtime-evidence.py
  - test/preview/walk-cycle-capture.py
  - docs/walk-screenshots/walk-v2-no-swap.png
  - docs/chat-screenshots/chat-fixed.png
acceptance:
  - "Leg swing visible de al menos 50 grados en runtime (verificado: 51.9 cat y 51.8 dog, contra ~22 con frame swap)"
  - "Body bob con translateY de al menos 5px (verificado: 6px cat y 10px dog)"
  - "Tail sway con rango de al menos 30 grados (verificado: 34 grados)"
  - "El X button del chat panel queda visible tras el fix de contraste (screenshot chat-fixed.png)"
  - "878/878 tests verdes (875 previos + 3 nuevos) sin regresiones, con runtime evidence con Playwright"
risks: []
---

# Plan retroactivo: walk v2 enhancement (HOSNE feedback 2026-08-25)

> **Status**: Open (pendiente de commit)
> **Date**: 2026-08-25
> **Author**: Mavis (M3) + HOSNE
> **Branch**: `feat/pixijs-rendering`
> **Triggered by**: HOSNE feedback despues de commit `9e98c4c`
> (walk fix): "el movimiento es antinatural debe simular el de un gato
> de verdad caminar de lado con suavidad etc"

---

## 1. Goal

Hacer que el walk de la mascota se vea "natural" como un gato/perro
real caminando de costado, no un deslizar con patas pegadas.

## 2. Root cause (analisis post-fix de `9e98c4c`)

El commit anterior restauro las clases de las patas (back-foot-left/right,
left-paw/right-paw) y corrigio los transform-origins. Eso destrabo la
animacion CSS de las patas, pero la animacion seguia viendose "rara"
porque:

1. **Amplitud muy chica**: `sideWalkSwingLeft` iba de -22deg a +18deg
   (40deg total). En una mascota de 80px de alto, ese angulo se ve
   como una vibracion, no como un paso.

2. **Body bob imperceptible**: `catBodyWalk` translateY era solo -4px
   en un SVG de 200x200. Apenas se notaba.

3. **Tail sway chico**: 26deg de rango (-8 a +18). Poco visible.

4. **El swap de SVG a 167ms trunca la animacion CSS**: cada swap hace
   `innerHTML = frames[i]` lo cual destruye los elementos y resetea
   la animacion CSS. Resultado: la animacion solo alcanza a correr
   ~25% del ciclo (167ms / 650ms) antes de ser reseteada. El swing
   visible real era ~22deg, no los 40deg del keyframe.

## 3. Fix

4 partes:

### 3.1 CSS amplitudes aumentadas (dashboard.css)

| Keyframe | Antes | Despues | Rango |
|---|---|---|---|
| `sideWalkSwingLeft` | -22..+18 | -28..+24 | 40deg → 52deg |
| `sideWalkSwingRight` | +18..-22 | +24..-28 | 40deg → 52deg |
| `catBodyWalk` (translateY) | -4px | -6px | +50% |
| `catBodyWalk` (rotation) | ±1.5deg | ±2.5deg | +67% |
| `catBodyWalk` (translateX) | ±1px | ±1.5px | (forward momentum) |
| `catTailWalk` (rotation) | -8..+18 | -10..+24 | 26deg → 34deg |
| `dogBodyWalk` (translateY) | -7px | -10px | +43% |
| `dogBodyWalk` (rotation) | ±2deg | ±3deg | +50% |

Verificado por 3 tests bidireccionales nuevos en `pet-assets.test.js`
("leg swing amplitude es >= 50deg", "body bob translateY es >= 5px",
"tail sway amplitude es >= 30deg") — sin fix, fallan; con fix, verde.

### 3.2 Frame swap deshabilitado durante walk (pet-viewport.js)

El `setInterval` en `startFrameLoop()` ahora skipea el swap cuando
`this.currentState === 'walking'`. Razon: el swap recrea los elementos
del SVG via `innerHTML`, lo cual resetea TODAS las animaciones CSS
(legs, body bob, tail sway). Sin swap, las animaciones corren
completas. Las 4 walk frames (catWalk1..4 / dogWalk1..4) difieren
solo 1-3px en paw y-offset — imperceptible comparado al CSS body
bob, asi que perder la variacion per-frame no es visible.

```js
this.frameTimer = setInterval(() => {
  const frames = this.getFrames(this.currentPet, this.currentState);
  if (!frames || frames.length <= 1) return;
  if (this.currentState === 'walking') return;  // CSS handles motion
  this.currentFrameIndex = (this.currentFrameIndex + 1) % frames.length;
  this.renderFrame(false);
}, rate);
```

### 3.3 CSS B2 v2 fix (X button contrast)

El fix de B2 anterior (max-height) no era el problema real. El X
button tenia `background: rgba(255, 255, 255, 0.06)` y
`color: text-muted` — practicamente invisible contra el panel
oscuro. Ajustado a:
- background: 18% white (vs 6%)
- border: 35% white (vs 10%)
- color: text-main
- size: 26x26 (vs 22x22) para mejor touch target
- focus-visible outline para accessibility

### 3.4 Tests (TDD)

- 3 tests nuevos en `pet-assets.test.js` que validan amplitudes minimas
  (con fix pass, sin fix fail)
- Tests preexistentes de swing, transform-origin, etc siguen pasando

## 4. Runtime evidence

`test/preview/walk-v2-runtime-evidence.py` carga una pagina HTML que
renderiza UN solo SVG (catWalk1) sin swap, y samplea el
`getComputedStyle().transform` del `.back-foot-left` cada 20ms durante
~1.5 ciclos.

```
=== walk v2 runtime evidence (frame swap disabled) ===
cat back-foot-left: 40 samples
  range: -28.0 to 23.9 = 51.9deg
dog back-foot-left: 30 samples
  range: -28.0 to 23.8 = 51.8deg
PASS — full swing range observed: cat=51.9deg, dog=51.8deg
  (compared to ~22deg/31deg with frame swap enabled)
```

**Con swap**: swing visible de 22deg (cat) / 31deg (dog) — la animacion
se truncaba al 25% del ciclo.

**Sin swap (v2 fix)**: swing completo de 51.9deg / 51.8deg — el CSS
corre su ciclo completo.

## 5. Acceptance criteria

- [x] Leg swing visible >= 50deg en runtime (verificado: 51.9 / 51.8)
- [x] Body bob translateY >= 5px (verificado: 6px cat, 10px dog)
- [x] Tail sway range >= 30deg (verificado: 34deg)
- [x] X button del chat panel visible (screenshot `chat-fixed.png`
      muestra el X circle claramente)
- [x] Tests: 878/878 verde (875 + 3 nuevos), sin regresiones
- [x] Runtime evidence con Playwright

## 6. Files changed

| Archivo | Cambio |
|---|---|
| `src/styles/dashboard.css` | 8 amplitudes aumentadas (leg swing, body bob, tail sway) |
| `src/styles/pet.css` | X button contrast fix (B2 v2): bg/border/color/size |
| `src/renderer/pet-viewport.js` | Skip frame swap durante walk |
| `test/pet-assets.test.js` | 3 tests nuevos (leg swing, body bob, tail sway) |
| `test/preview/walk-v2-runtime-evidence.py` | Runtime evidence sin swap |
| `test/preview/walk-cycle-capture.py` | Multi-frame capture para visual |
| `docs/walk-screenshots/walk-v2-no-swap.png` | Screenshot del fix v2 |
| `docs/chat-screenshots/chat-fixed.png` | Screenshot del X button visible |

## 7. Limites / follow-up

- **Head no bobbea en walk** — el head tiene un per-frame transform
  estatico que ahora no se anima. Una mejora futura seria agregar una
  CSS animation para `pet-head` que compagine con el body bob.
  Diferir: la mejora de smoothness en legs + body + tail ya es
  significativa.
- **Eyes no blink durante walk** — el blink solo corre en idle.
  Podria dispararse aleatoriamente durante walk para mas vida. Diferir.
- **PIXI renderer** — la solucion definitiva es la migracion a PIXI
  que esta en WIP. Esto daria 60fps smooth nativo. Trackear aparte.

## 8. Post-mortem

Por que el fix de walk v1 (`9e98c4c`) no fue suficiente:

- Solo restauro las clases de las patas, pero no valido el SWING
  RANGE visible. El test verificaba que las clases EXISTIAN, no que
  la animacion produjera movimiento visible.
- El frame swap a 167ms no se considero como variable que afecta la
  animacion CSS. Los tests eran estructurales, no runtime.
- Leccion: para validar animaciones, el test debe samplear el
  computed transform en el browser (runtime), no solo inspeccionar
  el CSS estaticamente. La runtime evidence con Playwright es la
  forma correcta de verificar que una animacion CSS produce el
  efecto visual deseado.
