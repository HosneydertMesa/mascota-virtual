---
id: paw-paint-order-2026-08-26
branch: cursor/paw-z-order-6c0a
plan: docs/plans/paw-paint-order-2026-08-26.md
review: docs/reviews/paw-paint-order-2026-08-26.md
status: APPROVED
evidence:
  tests: "node --test test/pet-assets.test.js — 35/35 pasan, 0 fallos. Los 3 tests nuevos del PR clavan el cascade de pintado en las 12 poses de produccion: (1) front paws despues de .pet-body y antes de .pet-head, (2) cascade completo shadow -> tail -> back feet -> body -> front paws -> head, (3) sin z-index/isolation en los grupos paw/body/head. npm test completo — 900/900 pasan. npm run check — OK."
  manual: "La evidencia visual original la produjo el agente que abrio el PR, con Electron vivo: Luna idle mostraba la pata delantera izquierda crema como un rectangulo plano con costura vertical dura contra el cuerpo. Ese fix ya esta en main (PR #4 mergeado) y en el release v2.2.0."
signed_by: Mavis
checked_at: 2026-10-26
---

# QA Sign-off: front-paw SVG paint order

**Fecha**: 2026-08-26 (implementacion) / 2026-10-26 (sign-off)
**Rama / PR**: `cursor/paw-z-order-6c0a` (PR #4)
**Plan**: `docs/plans/paw-paint-order-2026-08-26.md`
**Review**: `docs/reviews/paw-paint-order-2026-08-26.md`

## Contexto del sign-off

Este PR lo abrio un agente en agosto y quedo abierto 2 meses. El codigo y el
review eran solidos; lo que faltaba era el **formato**: el repo migro al gate
generico con `frontmatter.mode = require` el 2026-10-20, y los docs de este PR
venian en formato legacy (sin frontmatter, con `**Veredicto**:` en el cuerpo).

El 2026-10-26 se le agrego el frontmatter tipado a los 3 docs (plan, review y
este QA) y se mergeo (PR #4). Los valores salen de los cuerpos, no de
heuristicas: el plan ya declaraba sus criterios de aceptacion y el review ya
declaraba su severidad (0 CRITICAL / 0 MAJOR / 0 MINOR / 1 INFO).

## Resultado automatico

- Tests: **900 passed, 0 failed** (`npm test`)
- Tests del area: **35 passed, 0 failed** (`node --test test/pet-assets.test.js`)
- Syntax check: **OK** (`npm run check`)

## Verificaciones

| # | Verificacion | Resultado |
|---|---|---|
| 1 | En las 12 poses, las patas frontales se pintan despues de `.pet-body` | **Si** — test "12 production poses: front paws paint after .pet-body and before .pet-head" |
| 2 | El cascade completo es shadow -> tail -> back feet -> body -> front paws -> head | **Si** — test del cascade completo |
| 3 | `.pet-head` va despues de las patas | **Si** — cubierto por los 2 tests anteriores |
| 4 | Las 4 patas siguen siendo siblings, nunca nested en `.pet-body` | **Si** — test "sibling-not-nested" preexistente |
| 5 | CSS no mete `z-index`/`isolation` en los grupos paw/body/head | **Si** — test explicito; el document order del SVG gana |
| 6 | El diff no toca `d=`, classes, `transform-origin` ni gradient ids | **Si** — verificado en el review adversarial; el diff es reorder de bloques (154/154 cat, 120/120 dog) |
| 7 | gait / Pixi / chat / AI no aparecen en el diff | **Si** — verificado |
| 8 | Mergea limpio sobre `main` con el trabajo de v2.2.0 | **Si** — `git merge` sin conflictos; 900/900 |

## Limitaciones conocidas

- **El fix no se verificó visualmente en este sign-off.** La evidencia visual
  original (Electron vivo con Luna) la produjo el agente que abrio el PR en
  agosto. En este sign-off se verificó la propiedad estructural (orden de los
  siblings en las 12 poses) que es lo que determina el resultado en pantalla.
  Si la pata se ve rara en la maquina de HOSNE, es un reporte visual a abrir,
  no un fallo de este sign-off.
- **El hallazgo [INFO] del review sigue diferido**: un `transform` en
  `.pet-body` podria crear stacking context en algunos engines. Se verifico
  que en Electron vivo no pasa (el orden de siblings gana) y que no hay
  `z-index`/`isolation`. Si algun build distinto lo muestra, el siguiente paso
  es un `z-index` minimo **sin** tocar el gait.

Sign-off: Mavis 2026-10-26
