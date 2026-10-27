# Evidencia de QA — rediseño cel-shading (2026-10-27)

Scripts de verificacion del fix pedido por la QA del 2026-10-27
(`changes-requested`): los criterios 6 y 7 del frontmatter de
`docs/plans/2026-10-27-cel-shading-mascot-redesign.md` no se cumplian.

## Correr todo

```bash
bash docs/qa/evidence/run-evidence.sh
```

Deja la transcripcion en `docs/qa/evidence/qa-evidence-log.txt` y sale con
codigo 1 si algo queda en rojo.

## Que mide cada script

| Script | Que mide | Exit |
|---|---|---|
| `verify-cel-geometry.js` | criterio 6: ¿el plano `cel-shadow` se sale del `cel-outline` de su masa? y ¿la sombra cae abajo-derecha? (luz desde arriba-izquierda) | 1 si incumple |
| `verify-fit-rules.js` | criterio 7: ¿la base de la cola queda escondida bajo la grupa? (profundidad >= 6 px) | 1 si incumple |
| `silhouette-components.py` | criterio 7: ¿la silueta union de la pose es una sola pieza conectada? | 1 si incumple |
| `silhouette-components.js` | lo mismo, en JS (util desde node) | 1 si incumple |
| `tail-fit.js` | informe del encaje cola<->grupa: area solapada, base escondida y envergadura de la raiz | 0 (informe) |
| `root-thickness.js` | profundidad y envergadura de la raiz de la cola, pose por pose | 0 (informe) |
| `runtime-pivot-check.py` | el `transform-origin` **computado por Chromium** con el bundle real de CSS vs el inline del SVG (52 comprobaciones) | 1 si no cuadra |
| `verify-screenshots-fresh.py` | ¿las 12 PNG de `docs/pet-screenshots/` son identicas a un render actual? | 1 si alguna esta vieja |
| `dump-poses.js` | vuelca en JSON las 12 poses y el `transform-origin` inline de cada grupo | 0 |
| `render-poses.js` | genera una pagina HTML autocontenida con las 12 poses (para render y comparar) | 0 |
| `shoot.py` | captura un PNG por pose de esa pagina (Playwright) | 0 |
| `contact-sheet.py` | hoja de contacto de los 12 renders (rejilla) | 0 |
| `zoom.py` | recorta y amplia una region de un PNG | 0 |
| `compare.py` | hoja de contacto "antes" vs "despues" | 0 |

La geometria (rasterizado, point-in-polygon, componentes conexos) la hace
`test/helpers/cel-geometry.js`, que es codigo de producto y esta cubierto por
la suite (`npm test`).

## Reglas de los guards (por que muerden)

Los tres guards de arte que se anadieron a `test/pet-assets.test.js` fallan
contra el arte viejo (commit `c196be5`) y pasan contra el nuevo:

| Guard | Arte viejo | Arte nuevo |
|---|---|---|
| `cel: ningun plano de sombra cruza el contorno de la masa que sombrea` | FALLA (5 poses) | pasa (max. 0.17 px) |
| `cel: la base de la cola se esconde bajo la grupa` | FALLA (dog sit / dog lay / dog stretch) | pasa (envergadura minima 7.4 px) |
| `cel: cada pose se lee como una sola silueta` | pasa | pasa (invariante) |

El segundo guard mide dos cosas: la profundidad de la base escondida (>= 6 px,
literal del plan §4.4.4) y la **envergadura** de la raiz (>= 5 px). Sin la
envergadura el criterio no muerde: una hoja flotante puede tener 8 px de
profundidad y solo rozar la grupa con una punta.
