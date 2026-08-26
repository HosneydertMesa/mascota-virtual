# Plan: front-paw SVG paint order (Luna idle depth)

> **Status**: Open
> **Date**: 2026-08-26
> **Author**: Cloud agent (follow-up from main after PR #2)
> **Branch**: `cursor/paw-z-order-6c0a`
> **Size**: S

---

## 1. Goal

Que la pata delantera izquierda crema de Luna (y las patas frontales de
Max) se pinten **delante** del torso en el SVG vivo. Hoy se leen como un
rectángulo blanco con costura vertical dura contra el cuerpo, porque
`.pet-body` cubre el anclaje de la pata.

## 2. Contexto (hipótesis verificada en main)

En `src/assets/cat.js` y `src/assets/dog.js`, las 12 poses de producción
(idle / walk / sleep / sit / lay / stretch × Luna y Max) tienen el mismo
orden de siblings `<g>`:

```
tail (.anim-wag) → back-foot-left → back-foot-right → left-paw → right-paw → .pet-body → .pet-head
```

SVG pinta siblings posteriores encima. `.pet-body` tapa el attachment de
las patas. El path de `.left-paw` es un slab crema de lados rectos (`L`
commands) a la izquierda del silueta del torso — por eso se ve
desconectada.

Las cuatro patas ya son `<g>` siblings (contrato de PR #2); no están
anidadas en `.pet-body`. Walk1–4 / sitBlink / layBreathe son aliases de
walk / sit / lay.

No hay `z-index` ni `isolation` sobre esos grupos en `animations.css` /
`pet.css` / `dashboard.css`. El cascade de gait no se toca.

## 3. Fuera de scope

- Redibujar paths (`d=`), gradient ids, classes, `transform-origin`
- Gait CSS, Pixi, chat, AI, Pomodoro, `pet-motion.js`
- Reabrir o pushear a PR #2. No mergear.

## 4. Decisiones

| Decisión | Elección | Por qué |
|---|---|---|
| Fix | Reordenar grupos sibling únicamente | Hipótesis verificada: paint order, no arte |
| Orden destino | shadow, tail, back feet, body, left-paw, right-paw, head | Patas frontales AFTER `.pet-body` y BEFORE `.pet-head` |
| Nested legs | Prohibido. Siguen siendo 4 `<g>` siblings | Contrato de slice 1 |
| CSS | No tocar gait. Solo alinear z-index/isolation si pelea el DOM | Preferencia del usuario; hoy no pelea |
| Tests | 12 poses shipped: `left-paw`/`right-paw` after `pet-body`, `pet-head` after paws | Regresión del cascade |

## 5. Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/assets/cat.js` | Reordenar `<g>` en las 6 poses (idle, walk, sleep, sit, lay, stretch) |
| `src/assets/dog.js` | Idem, 6 poses |
| `test/pet-assets.test.js` | Assert de orden/cascade en las 12 strings shipped |
| `docs/plans/paw-paint-order-2026-08-26.md` | Este plan |
| `docs/reviews/paw-paint-order-2026-08-26.md` | Review adversarial |

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| CSS transform en `.anim-breath` crea stacking context y sigue tapando patas | Verificar que no hay z-index/isolation en grupos; si pelea, z-index mínimo **sin** tocar gait keyframes |
| Anidar patas en `.pet-body` al mover bloques | Extraer grupos depth-matched; test sibling existente debe seguir verde |
| Cambiar `d=` / origins por accidente | Diff solo de bloques `<g>` reordenados; no editar paths |

## 7. Criterios de aceptación

- [ ] Las 12 poses: primer `class` `left-paw` y `right-paw` **después** de `pet-body`
- [ ] `pet-head` **después** de ambas patas
- [ ] `left-paw` antes de `right-paw`
- [ ] Las 4 patas siguen siendo siblings, nunca nested en `.pet-body`
- [ ] Ningún cambio a `d=`, classes, transform-origins, gradient ids, gait CSS, Pixi, chat, AI
- [ ] `npm test` y `npm run check` verdes
- [ ] PR **nuevo** contra `main` (no reabrir #2). No mergear.

## 8. Plan de testing

1. RED: tests de orden fallan en main (paws before body).
2. GREEN: reorder; mismos tests pasan.
3. Suite completa: `npm test` + `npm run check`.
4. Guard existente `4 patas son sibling <g>s, nunca anidadas en .pet-body` sigue pasando.

## 9. Métricas

- 12/12 poses con cascade correcto (idle, walk, sleep, sit, lay, stretch × cat/dog).
- 0 archivos de gait / Pixi / chat / AI en el diff.

## 10. Próximos pasos concretos

1. Tests de cascade en `test/pet-assets.test.js` (TDD, verlos fallar).
2. Reordenar grupos en las 12 poses de `cat.js` / `dog.js`.
3. `npm test` + `npm run check`.
4. Review + PR nuevo vs `main`.
