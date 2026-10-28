---
id: 2026-10-28-redisenar-el-aspecto-visual-de
branch: harness/20261027-154115-redisenar-el-aspecto-visual-de
plan: docs/plans/2026-10-27-cel-shading-mascot-redesign.md
review: docs/reviews/2026-10-27-redisenar-el-aspecto-visual-de.md
status: APPROVED
evidence:
  tests: "npm test - 927/927 verdes (0 fail, 0 skipped); node --test test/pet-assets.test.js - 62/62 verdes (contrato cel, guard de deriva de pivotes, guard de silueta unica, guard de encaje cabeza/cuerpo y cola, preview y capturas); npm run check - exit 0; npm run smoke - exit 0 (Electron levanta 10s sin errores criticos)"
  smoke: "npm run smoke - exit 0: '[smoke-test] OK - no se detectaron errores criticos en 10s' (logs en docs/qa/evidence/npm-run-smoke.txt)"
  manual: "Revision visual de las 12 poses de produccion renderizadas con Playwright headless Chromium desde test/preview/pet-poses-preview.html (arte real de src/assets/*.js), fondo claro y fondo oscuro: docs/qa/evidence/captures/<pose>.png (12) + 7 recortes ampliados en docs/qa/evidence/zooms/. Medicion objetiva de la geometria con docs/qa/evidence/measure-poses.js: 0 degradados, 1 tinta por pose, encaje cabeza<->cuerpo >= 13.1 px y hueco de tinta <= 1.54 px en las 12 poses, base de cola >= 6.9 px de profundidad y >= 7.8 px de envergadura, 1 componente de silueta por pose, pupilas 2/1/0, y fur-deep (#8A4A12) de Max solo en cola e iris (nunca en el lomo). Frescura de docs/pet-screenshots/: RMS 2.5-2.8 entre los PNG del repo y la captura fresca (docs/qa/evidence/check-screenshots-fresh.txt)."
signed_by: "qa (minimax/MiniMax-M3.1-Flash)"
checked_at: 2026-10-28
---

# QA — rediseno cel-shading de Luna y Max (ronda 3)

**Plan**: `docs/plans/2026-10-27-cel-shading-mascot-redesign.md` (14 criterios de aceptacion, `visual: true`)
**Alcance de esta ronda**: Max (perro) — hallazgos de la revision visual de las rondas 2 y 3.
**Veredicto**: **OK** (APPROVED)

---

## 1. Que se verifico

| Area | Metodo | Resultado |
|---|---|---|
| Suite completa | `npm test` | **927/927** verdes, 0 fail, 0 skipped |
| Contrato de arte | `node --test test/pet-assets.test.js` | **62/62** verdes |
| Sintaxis | `npm run check` | exit 0 |
| Arranque de la app | `npm run smoke` | exit 0, Electron 10 s sin errores criticos |
| Geometria del arte | `node docs/qa/evidence/measure-poses.js` | ver tabla §3 |
| Revision visual | Playwright headless sobre `test/preview/pet-poses-preview.html` | 12 capturas + 7 recortes |
| Frescura de capturas | `python docs/qa/evidence/check-screenshots-fresh.py` | RMS 2.5-2.8 vs `docs/pet-screenshots/` (mismo arte) |

Evidencia cruda: `docs/qa/evidence/` (salidas `.txt`, capturas `captures/`, recortes `zooms/`).
Todo lo que esta en `docs/qa/evidence/` queda **fuera del repo** (untracked; el harness lo guarda con la corrida).

---

## 2. Los 14 criterios de aceptacion del plan

| # | Criterio | Veredicto | Evidencia |
|---|---|---|---|
| 1 | Sin `linearGradient`/`radialGradient`/`<stop>`/`url(#...)` en las 12 poses | OK | `measure-poses.txt`: `grads = 0` en las 12. Test `cel: sin degradados ni url(#...)` |
| 2 | Una sola tinta por especie; contorno >= 3 px; detalle interior 1.5-2.1 px | OK | `measure-poses.txt`: `tintas = 1` en las 12. Test `cel: un solo color de tinta` + `cel: pesos de linea` |
| 3 | Cada masa: 1 `cel-outline` + >= 1 `cel-shadow` plano, con la paleta fija | OK | Test `cel: cada masa tiene su cel-outline (1 por masa, >= 3 en la cabeza) y >= 1 cel-shadow plano` + `cel: todo fill pertenece a la paleta fija de la especie` |
| 4 | De frente se leen como gato y perro: cabeza grande, ojos grandes con doble brillo, orejas y cola expresivas | OK | `captures/cat-idle.png`, `captures/dog-idle.png`, `captures/dog-sit.png`, `zooms/max-frente-cabeza.png`, `zooms/max-sit-frente.png`: Luna con orejas triangulares y bigotes, Max con orejas triangulares en punta, crema en cejas/mejillas/hocico, nariz negra; pupilas 2 con doble brillo en ambas |
| 5 | De perfil (walk): una sola silueta continua, nada pegado encima | OK | `measure-poses.txt`: `sil = 1` componente en las 12; `headGap = 0.01 px` (dog-walk), `headDepth = 14.1 px`, `tailDepth = 18.2 px`. Capturas `dog-walk.png` + `zooms/max-walk-cabeza-hocico.png`, `zooms/max-walk-cola.png` |
| 6 | Sombra plana abajo-derecha y contenida en su masa | OK | Test `cel: ningun plano de sombra cruza el contorno de la masa que sombrea` (tolerancia 0.7 px, direccion de luz) |
| 7 | Sin costuras rectas: pata delantera continua el vientre, base de cola y cabeza bajo el cuerpo | OK | Tests `cel: las patas delanteras no repiten el contorno del cuerpo` (<= 10 pts compartidos), `cel: la base de la cola se esconde bajo la grupa (>= 6 px y con envergadura)`, `cel: la cabeza se superpone al cuerpo (>= 8 px) y su tinta llega al contorno del cuerpo` (<= 2 px de hueco) — medidas en `measure-poses.txt` |
| 8 | `getXPartsForState`: 7 ranuras en los 6 estados, `body` con `viewBox 0 0 200 200` | OK | Test `assets: getXPartsForState devuelve las 7 ranuras de partes en los 6 estados` |
| 9 | Superficie de exports de `cat.js`/`dog.js` sin cambios | OK | Test `assets: la superficie de exports de cat.js y dog.js no cambia (mismos nombres y tipos)` + alias (`walk1-4`, `sitBlink`, `layBreathe`, `walkFrames`) |
| 10 | Conteos de pupilas (2 frente / 1 perfil / 0 dormida) y ancla dentro del iris | OK | `measure-poses.txt`: pupilas 2/1/0 en las 12. Test `cel: cada pupila conserva su ancla y cae dentro de su iris` |
| 11 | Orden de pintado sombra -> cola -> patas traseras -> cuerpo -> patas delanteras -> cabeza | OK | Test `guard de deriva: la sombra de piso sigue siendo el primer elemento y el orden de pintado no se movio` (12/12) |
| 12 | `transform-origin` del CSS == inline del SVG en las 12 poses | OK | Test `guard de deriva: el pivote que gana el CSS coincide con el transform-origin inline del SVG (12 poses)` — **52 comprobaciones** contra la cascada real del bundle `styles.css` |
| 13 | `npm test` y `npm run check` verdes, sin regresiones | OK | 927/927 y exit 0 (logs en `docs/qa/evidence/npm-test.txt`, `npm-run-check.txt`) |
| 14 | Preview de las 12 poses + PNG en `docs/pet-screenshots/` | OK | Tests de preview (4) + `check-screenshots-fresh.txt`: los 12 PNG del repo coinciden con el arte actual (RMS 2.5-2.8, solo reescalado) |

**Ningun test fue debilitado.** El diff de `test/pet-assets.test.js` contra la base (`4e0ebef`) borra **solo** literales de coordenadas de pupila y de pivote — lo que el propio plan §6.2 autoriza — y los reemplaza por guardas derivadas mas fuertes (pivote derivado de la cascada real, iris, paleta, partes, encaje, silueta). No hay tolerances ampliadas, ni asserts quitados, ni tests saltados: `skipped 0` en las dos corridas.

---

## 3. Indicaciones del usuario sobre Max (rondas 2 y 3)

| Indicacion | Veredicto | Evidencia |
|---|---|---|
| Max debe leerse como **shiba inu** en las 6 poses: orejas triangulares en punta y erguidas, hocico que sobresale del craneo con nariz negra en la punta, mascara crema en mejillas y hocico; de frente ya no puede parecer mono u oso | OK | `captures/dog-idle.png`, `dog-sit.png` (frente), `dog-walk.png`, `dog-lay.png`, `dog-sleep.png`, `dog-stretch.png`; recortes `zooms/max-frente-cabeza.png`, `max-sit-frente.png`, `max-walk-cabeza-hocico.png`. Las 6 poses tienen **2 orejas triangulares en punta** (`ears = 2` en `measure-poses.txt`), hocico saliente con nariz `#3A2A22` en la punta y crema `#FFF8EC` en mejillas/hocico. De frente la lectura es de shiba (no de mono/oso) |
| **Quitar las rayas oscuras del lomo** en todas las poses: lomo naranja liso, vientre y pecho crema | OK | `measure-poses.txt`, seccion *fur-deep*: en las 6 poses de Max el `#8A4A12` aparece **solo** dentro de `.anim-wag` (punta/curva de la cola) y de `.anim-blink` (sombra del iris). **Ningun** `#8A4A12` cae en la masa del cuerpo ni en el lomo. En Luna el `#8A4A1E` si aparece en el cuerpo, que es correcto (tabby rayado) |
| En walk, lay y stretch la cabeza se une al cuerpo con **cuello continuo** (sin hueco ni disco encima); la cabeza de perfil es alargada por el hocico, no un circulo | OK | `measure-poses.txt`: `headDepth` (encaje) 14.1 / 19.8 / 13.1 px y `headGap` (hueco de tinta) 0.01 / 0.03 / 0.01 px en dog-walk / dog-lay / dog-stretch. El commit `8a446d0` sustituyo la cabeza de `lay` (que era un disco circular, `M 64,87 C 85.1,87 96,99 96,114.5 ...`) por una cabeza de perfil con hocico. Recortes `zooms/max-lay-cabeza-cuello.png`, `max-stretch-cabeza-cuello.png`, `max-walk-cabeza-hocico.png` |
| Ronda 3: **cola de Max al caminar** y **cabeza montada sobre el cuerpo en lay, sleep y stretch** | OK | `zooms/max-walk-cola.png`: la cola se enraiza en la grupa (18.2 px de profundidad, 12.5 px de envergadura) y se lee como cola, no como accesorio. `zooms/max-lay-cabeza-cuello.png`, `max-sleep-cabeza-cuello.png`, `max-stretch-cabeza-cuello.png`: en las tres la nuca se funde con el lomo, sin corte de contorno y sin disco montado |
| No rehacer el trabajo de `cb23252` (criterios 6 y 7) | OK | `cb23252` esta en la historia; los guards de arte (`cel: ningun plano de sombra cruza...`, `cel: la base de la cola...`, `cel: la cabeza se superpone...`) siguen en pie y verdes |
| `package.json` restaurado a la base: no tocarlo | OK | `git diff 4e0ebef HEAD -- package.json package-lock.json` -> **vacio** |
| Quitar del repo los archivos de `docs/qa/evidence/` | OK | `git ls-files docs/qa/evidence` -> **vacio** (no hay evidencia trackeada en el repo) |
| Borrar los `.scratch-*` de la raiz y no dejar archivos de prueba | OK | `git ls-files | grep -i scratch` y `ls -a | grep -i scratch` -> **vacio**. El arbol de trabajo solo tiene como untracked la evidencia de esta QA |

---

## 4. Capturas entregadas al revisor visual

`docs/qa/evidence/captures/` — una por pose y estado, mismo set en cada ronda (12):

`cat-idle.png`, `cat-walk.png`, `cat-sleep.png`, `cat-sit.png`, `cat-lay.png`, `cat-stretch.png`,
`dog-idle.png`, `dog-walk.png`, `dog-sleep.png`, `dog-sit.png`, `dog-lay.png`, `dog-stretch.png`

Cada tarjeta muestra la pose sobre **fondo claro y fondo oscuro**, renderizada desde el SVG de produccion
(`test/preview/pet-poses-preview.html` carga `src/assets/*.js`, asi que no puede quedar vieja).

`docs/qa/evidence/zooms/` — recortes ampliados (no reemplazan las capturas de arriba):

`max-frente-cabeza.png`, `max-sit-frente.png`, `max-walk-cabeza-hocico.png`, `max-walk-cola.png`,
`max-lay-cabeza-cuello.png`, `max-sleep-cabeza-cuello.png`, `max-stretch-cabeza-cuello.png`

Scripts de verificacion reutilizables (no forman parte del producto):

- `docs/qa/evidence/capture-poses.py` — genera capturas y recortes desde el preview real.
- `docs/qa/evidence/measure-poses.js` — mide encajes, siluetas, paleta y posiciones de `fur-deep`.
- `docs/qa/evidence/check-screenshots-fresh.py` — comprueba que `docs/pet-screenshots/` esta al dia.

---

## 5. Observaciones (no bloquean)

1. En `dog-sleep` y `dog-lay` el parche crema del pecho (`#FFF8EC`) queda como una media luna fina sobre
   el flanco y se lee un poco como un rayon blanco; en `dog-stretch` es una franja crema mas ancha.
   No viola ningun criterio (el crema es la base prevista del pecho, plan §4.1) y no altera la lectura del
   animal, pero el revisor visual puede quererlo mas integrado en la ronda siguiente.
2. `docs/pet-screenshots/` esta sincronizado con el arte actual (verificado por RMS), pero el README de ese
   directorio no lista las 12 capturas una por una con su comando de regeneracion por pose; el indice
   generico cumple el criterio 14.

---

## 6. Estado de la app

Se arranco la app con `npm run smoke` (Electron headless, 10 s) y se cerro al terminar: no quedan
procesos de Electron ni servidores abiertos. Playwright se uso con `browser.close()` al final de cada script.
