---
id: slice-1-motion-species-gait-2026-08-26
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 2
  info: 2
---

# Review: slice 1 MOTION — species gait, idle variety, mood body

**Fecha**: 2026-08-26
**Reviewer**: Cloud agent (adversarial pass on `main..HEAD`)
**Branch**: `cursor/slice-1-motion-e5f8`
**Plan**: `docs/plans/slice-1-motion-species-gait-2026-08-26.md`
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 2 MINOR, 2 INFO

---

## Resumen ejecutivo

El slice hace lo que el plan pide sobre el renderer **vivo** (SVG +
`PetViewport`, no Pixi):

1. Gait de especie en **un** archivo (`animations.css`). Luna
   `catWalkSwing*` 0.65s / 44°; Max `dogWalkSwing*` 0.48s / 68°. Pairing
   contralateral intacto. `dashboard.css` ya no redefine walk keyframes.
2. Sit / lay / stretch dejan de ser aliases (`data-pose` en exports
   distintos). `renderer.js` llama `setState('sitting'|'laying'|'stretching')`.
3. Mood se lee con `api.getMood()` y se pinta `mood-*` en `#pet-container`.
4. El early-return de walking (no swap 167ms) se mantiene.

No se tocaron Pixi, AI, chat, Pomodoro, `pet-motion.js`, `PET_PROFILES`,
ni `pet-mood.js`.

---

## Hallazgos

### [MINOR] [Maintainability] `moodStateFromApi` duplica umbrales de `deriveState`

**File**: `src/renderer.js:23-33`
**Issue**: La ventana de la mascota no carga `src/core/pet-mood.js`, así
que el renderer copia sleepy/sad/bored/happy/calm. Si alguien cambia
umbrales en `pet-mood.js`, el body class se desincroniza.
**Impact**: Bajo hoy (mismos números, tests los clavan). Riesgo de drift
en un slice futuro.
**Fix**: Cargar `pet-mood.js` en `src/index.html` y usar
`window.PetMood.deriveState` (el fallback ya existe). Fuera de los
archivos permitidos de este PR.

### [MINOR] [Correctness] `triggerHappyBounce` ahora dispara stretch

**File**: `src/renderer.js:168-179`
**Issue**: Landing → stretch es el requisito. El mismo helper corre en
boot (1.5s) y en un 5% de `playing`. Esos paths también van a stretch.
**Impact**: Un stretch extra al arrancar (deseable como “landing”) y
stretch ocasional al jugar. No pisa walking (hay guard).
**Fix**: Si el 5% playing se siente ruidoso, extraer `landWithStretch()`
y dejar el bounce de playing sin pose change. No bloquea.

### [INFO] [Scope] Sit/lay/stretch se ven como idle/sleep/walk

**Issue**: A propósito. Markup reusado + `data-pose` para exports
distintos. El pipeline de estados ya dispara; el arte es un PR de Designer.
**Impact**: En runtime, sitting no se lee como “sentado” hasta el arte
nuevo. El motor sí cambia de estado (clases CSS `sitting` / `laying` /
`stretching` en `#pet-container`).

### [INFO] [Tooling] `npm run sdlc:review` falla con branches `cursor/...`

**Issue**: Escribe `docs/reviews/_pending/${branch}.diff` sin crear el
directorio padre cuando el nombre de branch tiene `/`.
**Impact**: El gate se rompe; el diff se capturó a mano. No es del slice.

---

## Checks de alcance

| Restricción | Resultado |
|---|---|
| No Pixi / no tercer renderer | PASS |
| No `pet-motion.js` / PET_PROFILES / drag / gravity / bar | PASS |
| No AI / chat-response / Pomodoro / `pet-mood.js` | PASS |
| No `initQuickChat` | PASS |
| Walking early-return intacto | PASS |
| `setPetType` intacto | PASS |
| Tests contrato gait + idle-motion | PASS (33/33 en esos files) |

## Veredicto

**APPROVED**. Los MINOR no bloquean merge. El follow-up de arte es
explícito y no debe colarse en este PR.
