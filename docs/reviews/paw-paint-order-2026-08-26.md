# Review: front-paw SVG paint order

**Fecha**: 2026-08-26
**Reviewer**: Cloud agent (adversarial pass on `origin/main..HEAD`)
**Branch**: `cursor/paw-z-order-6c0a`
**Plan**: `docs/plans/paw-paint-order-2026-08-26.md`
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 0 MINOR, 1 INFO

---

## Resumen ejecutivo

Fix acotado al bug visual de Luna idle: la pata crema delantera se leía
como un rectángulo plano porque `.pet-body` pintaba encima del anclaje.

El diff **solo** reordena sibling `<g>` en las 12 poses de producción
(`cat.js` / `dog.js`) a:

```
tail → back feet → .pet-body → left-paw → right-paw → .pet-head
```

No hay cambios a `d=`, classes, `transform-origin`, gradient ids, gait
CSS, Pixi, chat ni AI. Tests nuevos clavan el cascade en las 12 strings
shipped y guardan que CSS no ponga `z-index`/`isolation` sobre esos
grupos.

---

## Hallazgos

### [INFO] [Correctness] `.anim-breath` aplica `transform` al body

**File**: `src/styles/animations.css` (sin cambios en este PR)
**Issue**: `@keyframes breathing` pone `transform` en `.pet-body`. En
algunos engines un transform crea stacking context. Si eso tapara las
patas posteriores en DOM, reordenar no alcanzaría.
**Impact**: La hipótesis verificada en Electron vivo es paint order de
siblings, no z-index. No hay `z-index`/`isolation` en los grupos (test
nuevo). Si en algún build el body siguiera tapando, el siguiente paso
sería z-index mínimo **sin** tocar gait.
**Fix**: diferir. No tocar CSS en este PR (preferencia explícita).

---

## Checks

- [x] 12 poses: paws after body, head after paws (tests)
- [x] 4 patas siguen siendo siblings, nunca nested en `.pet-body`
- [x] Diff de assets es reorder de bloques (154/154 cat, 120/120 dog)
- [x] Gait / Pixi / chat / AI no aparecen en el diff
- [x] Plan en `docs/plans/`
- [x] `npm test` 897/897 + `npm run check` green (GATE 1)

## Veredicto

**APPROVED** — listo para QA visual en Electron (Luna idle, pata
delantera izquierda delante del torso). No mergear desde este agente.
