---
id: slice-1-motion-species-gait-2026-08-26
status: approved
size: M
acceptance:
  - "Tests + npm run check verdes"
  - "Walk CSS-distinct: Luna ~0.65s contenido, Max ~0.48s enérgico, pairing diagonal, sin swap 167ms"
  - "Idle variety: sit 15-25s, sleep ~45s, stretch en wake/landing"
  - "sit/sleep/lay/stretch no son aliases de binding; renderer setea esos estados"
  - "#pet-container recibe mood-* desde api.getMood()"
  - "Drag, fall, bar, cursor physics sin cambios"
  - "Chat / AI / Pomodoro / PET_PROFILES / pet-mood.js sin cambios"
files:
  - test/pet-assets.test.js
  - test/idle-motion.test.js
  - src/assets/cat.js
  - src/assets/dog.js
  - src/styles/animations.css
  - src/styles/dashboard.css
  - src/renderer.js
  - src/renderer/pet-viewport.js
  - test/preview/cat-walk-preview.html
risks:
  - "Quitar el walk duplicado de dashboard.css rompe el preview: cat-walk-preview.html también importa animations.css"
  - "Un timeout de stretch pisa el walk: los timers de idle se cancelan al walk"
  - "Sit a los 20s bloquea el sleep a los 45s: scheduleSleep acepta sitting/laying"
---

# Plan: slice 1 MOTION — species gait, idle variety, mood body

> **Status**: Open
> **Date**: 2026-08-26
> **Author**: Cloud agent (slice 1 MOTION)
> **Branch**: `cursor/slice-1-motion-e5f8`
> **Size**: M

---

## 1. Goal

Hacer que Luna (gato) y Max (perro) se lean como especies distintas en
movimiento, disparar sit / lay / stretch / sleep desde el renderer SVG
vivo, y pintar el mood en el cuerpo — **sin** arte nuevo y **sin**
migrar a Pixi.

## 2. Contexto (hechos del stack vivo)

- Render vivo: SVG + `PetViewport`. PixiJS 8 está en el árbol y **no corre**.
- Ventana: `src/index.html`. Scripts: `assets/cat.js`, `assets/dog.js`,
  `renderer/pet-viewport.js`, `renderer.js`.
- `#pet-canvas` tiene `display:none`. El dibujo vivo es `#pet-svg-wrapper`
  + `innerHTML` de un SVG completo.
- Estados de PetViewport: `idle | walking | sleeping | sitting | laying | stretching`.
- En main, sit/lay/stretch son **aliases** (`catSitSVG = catIdleSVG`, etc.)
  y `renderer.js` nunca llama `setState('sitting'|'laying'|'stretching')`.
- Walk ya es diagonal en CSS. El swap a 167ms en walking está desactivado
  a propósito (`pet-viewport.js` early-return) — no reactivar.
- Gait hoy: mismos keyframes `sideWalkSwing*` (±52°). Solo cambia el
  periodo (cat 0.65s, dog 0.48s) + body bob. Por eso no se leen como
  especies.
- `src/styles.css` importa `animations.css` y después `dashboard.css`.
  `catBodyWalk` / `dogBodyWalk` están **duplicados**; dashboard.css gana
  por cascade.
- Mood existe (`deriveState` → happy/calm/sleepy/sad/bored) y
  `api.getMood()` ya está en preload. El body no muestra mood.
- Física de ventana (`src/core/pet-motion.js` `PET_PROFILES`) no se toca.
- Luna/Max switch ya existe: `onSettingsUpdated` → `viewport.setPetType`.

## 3. Fuera de scope (espera arte / slices posteriores)

- Redibujar SVGs. Sit/lay/stretch reusan markup actual con `data-pose`
  para exports distintos.
- Pixi, `src/services/ai.js`, `src/renderer/chat-response.js`, Pomodoro,
  Spotify, memories, briefing, quick capture, `pet-motion.js`, drag /
  gravity / bar-mode / `--pet-x` / cursor-follow, chat UI, prompts
  (`buildMoodContext`).
- Dashboard settings (API key / name / toggles). Solo fallback de preview
  si `window.dogSVG` falta.

## 4. Decisiones

| Decisión | Elección | Por qué |
|---|---|---|
| Renderer | Seguir en SVG + PetViewport | Pixi no corre; no hay tercer renderer |
| Gait canonical | `src/styles/animations.css` | Un solo archivo. Quitar duplicados de `dashboard.css` para no pelear el cascade |
| Swing keyframes | `catWalkSwingLeft/Right` y `dogWalkSwingLeft/Right` | No compartir `sideWalkSwing*` |
| Sit/lay/stretch art | Copia del markup idle/sleep/walk1 + `data-pose` | Tests pueden afirmar exports distintos sin arte nuevo |
| Idle variety | Timers en `renderer.js` | No chat, no AI. Walking gana |
| Mood en body | Clase `mood-*` en `#pet-container` | `getMood()` + derive local (pet window no carga `pet-mood.js`) |
| Preview dashboard | `window.dogSVG = dogIdleSVG` (y cat) | `dashboard-renderer.js` usa `window.dogSVG`; no tocar settings UI |

### Gait numbers (Luna short/contained vs Max wide/energetic)

| | Luna `.cat-walk` | Max `.dog-walk` |
|---|---|---|
| Period | 0.65s | 0.48s |
| Swing | `catWalkSwing*` −24°..+20° (44°) | `dogWalkSwing*` −36°..+32° (68°) |
| Body bob | `catBodyWalk` translateY −5px | `dogBodyWalk` translateY −12px |
| Pairing | diagonal contralateral (igual que hoy) | idem |

Pairing (no cambiar):
- phase A: `.back-foot-left` + `.right-paw` → SwingLeft
- phase B: `.left-paw` + `.back-foot-right` → SwingRight

## 5. Archivos a tocar

| Archivo | Cambio |
|---|---|
| `test/pet-assets.test.js` | Contratos: 4 patas, exports distintos, gait Luna ≠ Max, canonical CSS, mood classes |
| `test/idle-motion.test.js` | Helpers de idle/mood exportados desde `renderer.js` (TDD) |
| `src/assets/cat.js` | De-alias sit/lay/stretch + `window.catSVG` |
| `src/assets/dog.js` | De-alias sit/lay/stretch + `window.dogSVG` |
| `src/styles/animations.css` | Gait species-specific + mood body language. Única fuente de walk |
| `src/styles/dashboard.css` | Borrar bloque walk duplicado (keyframes + reglas `.cat-walk`/`.dog-walk`) |
| `src/renderer.js` | Timers sit/sleep/stretch, mood class, exports testeables |
| `src/renderer/pet-viewport.js` | Solo si hace falta. **Mantener** early-return walking |
| `test/preview/cat-walk-preview.html` | Cargar `animations.css` para que el preview siga mostrando gait |

**No tocar**: Pixi, AI, chat-response, Pomodoro, `pet-motion.js`, `pet-mood.js`, main.js physics, `initQuickChat`.

## 6. Diseño de implementación

### 6.1 Assets (sin redibujar)

```js
const catSitSVG = catIdleSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="sit"');
const catSitBlinkSVG = catIdleSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="sit-blink"');
const catLaySVG = catSleepSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="lay"');
const catLayBreatheSVG = catSleepSVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="lay-breathe"');
const catStretchSVG = catWalk1SVG.replace('<svg id="pet-svg"', '<svg id="pet-svg" data-pose="stretch"');
```

Idem dog. `window.catSVG = catIdleSVG`, `window.dogSVG = dogIdleSVG`.

### 6.2 Idle variety (`renderer.js`)

- Idle 15–25s → `pickRestPose(mood)`: default `sitting`; sleepy → `sitting`|`laying`; bored → `stretching`.
- Sleep existente 45s (`scheduleSleep`) → `sleeping` si el estado es restable (`idle`/`sitting`/`laying`), no si `walking`.
- Wake (salir de `sleeping`) y landing (`triggerHappyBounce`) → `stretching` 1.2–2s, luego `idle`.
- `onPetMoveState` `walking`: wake + `setState('walking')`. Walking gana; no dejar un timeout de stretch que pise walk.
- No abrir paneles. No tocar `initQuickChat`.

Helpers exportados (testeables, clock inyectable):

- `moodStateFromApi(mood)` — mismos umbrales que `deriveState` (pet window no carga PetMood)
- `applyMoodClassTo(el, moodState)` — `mood-happy|calm|sleepy|sad|bored` en el elemento
- `pickRestPose(moodState, random)`
- `pickSitDelayMs(random)` → [15000, 25000]
- `pickStretchMs(random)` → [1200, 2000]
- `isRestableState(state)` — idle/sitting/laying pueden dormir; walking no

### 6.3 Mood CSS (`animations.css`)

Sobre `#pet-container.mood-*`: cola (`.anim-wag` / `.anim-wag-fast`), orejas (`.pet-ear`), `translateY` de `.pet-body`. Sin bubbles, sin chat UI.

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Quitar walk de `dashboard.css` rompe preview que solo carga ese file | `cat-walk-preview.html` también importa `animations.css` |
| Cascade: si queda `catBodyWalk` en dashboard.css, pisa animations.css | Test: dashboard.css no redefine walk keyframes/reglas de gait |
| Stretch timeout pisa walking | Cancelar timers de idle al walk; walking setState después de wake |
| Sit a 20s bloquea sleep a 45s (hoy sleep exige `idle`) | `scheduleSleep` acepta sitting/laying |
| Inline `style="transform"` en `.pet-body` gana al CSS | Mood body usa `!important` en translateY |
| Strings JS comparan por valor: copia idéntica `===` true | `data-pose` hace el string distinto |
| 167ms swap vuelve | Test estructural: early-return walking se queda |

## 8. Testing

Contratos en `test/pet-assets.test.js` (primero, TDD):

1. Walk SVGs tienen 4 grupos: `back-foot-left`, `back-foot-right`, `left-paw`, `right-paw`.
2. sit / lay / stretch **no** son el mismo string que idle / sleep / walk.
3. Gait Luna ≠ Max: periodo 0.65 vs 0.48, keyframes propios, bob distinto.
4. Canonical: esas reglas viven en `animations.css`; `dashboard.css` no las redefine.
5. Pairing contralateral intacto.
6. `pet-viewport.js` sigue haciendo early-return en walking.
7. `renderer.js` llama `setState('sitting'|'laying'|'stretching')` y `getMood`.
8. CSS define `.mood-happy|calm|sleepy|sad|bored` afectando tail/ears/body.

`test/idle-motion.test.js`: umbrales mood, pickRestPose, delays, applyMoodClassTo.

Correr: `npm test` y `npm run check`. Todo verde.

## 9. Criterios de aceptación

- [ ] Tests + `npm run check` verdes
- [ ] Walk CSS-distinct: Luna ~0.65s contenido, Max ~0.48s enérgico, pairing diagonal, sin swap 167ms
- [ ] Idle variety: sit 15–25s, sleep ~45s, stretch en wake/landing
- [ ] sit/sleep/lay/stretch no son aliases de binding; renderer setea esos estados
- [ ] `#pet-container` recibe `mood-*` desde `api.getMood()`
- [ ] Drag, fall, bar, cursor physics sin cambios
- [ ] Chat / AI / Pomodoro / PET_PROFILES / `pet-mood.js` sin cambios
- [ ] PR desde branch de feature (no main). Summary: qué se shipped vs qué espera SVGs de Designer

## 10. Métricas de éxito

- Suite `node --test test/*.test.js`: 0 fail
- `npm run check`: 0 syntax errors
- Contratos de gait: cat swing range < dog swing range; cat period 0.65s; dog period 0.48s
- No regresiones en `test/pet-motion.test.js` (physics untouched)

## 11. Próximos pasos concretos

1. Commitear este plan (`docs(plans): add plan for slice 1 MOTION`).
2. Escribir tests contrato (RED).
3. De-alias assets → gait CSS → renderer idle/mood → preview.
4. `npm test` + `npm run check` (GREEN).
5. Review + QA docs.
6. Push + abrir PR.

## 12. Espera Designer (NO este PR)

SVGs reales de sit / lay / stretch. Este PR deja exports distintos y el
pipeline de estados disparando; el arte se swap-in después.
