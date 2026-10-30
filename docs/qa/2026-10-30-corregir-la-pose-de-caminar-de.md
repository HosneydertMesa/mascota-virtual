---
id: 2026-10-30-corregir-la-pose-de-caminar-de
branch: harness/20261030-082827-corregir-la-pose-de-caminar-de
plan: docs/plans/2026-10-30-dog-walk-pose-fix.md
review: docs/reviews/2026-10-30-corregir-la-pose-de-caminar-de.md
status: APPROVED
evidence:
  tests: "npm test - 932/932 verdes (0 fail, 0 skipped); node --test test/pet-assets.test.js - 67/67 verdes (5 guards nuevos de la pose de caminar de Max); npm run check - exit 0; npm run smoke - exit 0 ('[smoke-test] OK - no se detectaron errores criticos en 10s'). Medicion geometrica independiente (docs/qa/evidence/verify-dog-walk-geometry.js): 0 fallas. Contraste con el arte viejo (mismo script en modo --old): 7 fallas -> los guards nuevos muerden. PNG de docs/pet-screenshots/dog-walk.png regenerado desde el SVG de produccion: byte a byte identico al commiteado (sha256 9e03a845effee959744004b5730058e2f1ffb63168b8e66f8251b19b6b7c7150)."
  smoke: "npm run smoke - exit 0: '[smoke-test] OK - no se detectaron errores criticos en 10s' (Electron levanta y se cierra sin errores criticos)"
  manual: "Revision visual de la pose de caminar de Max renderizada desde el SVG DE PRODUCCION (src/assets/dog.js) con Playwright/Chromium headless, sobre fondo claro y fondo oscuro: docs/qa/evidence/max-walk-pose-completa-claro.png, max-walk-pose-completa-oscuro.png y 4 zooms (cola/grupa, torso lomo-vientre, pata delantera lejana, cabeza/identidad) + max-walk-comparacion-antes-despues.png. Verificacion de que docs/pet-screenshots/dog-walk.png sale del SVG de produccion: se regenero con 'python test/preview/pet-poses-capture.py --only dog-walk' y el binario quedo identico (sha256 9e03a845...)."
signed_by: "qa (minimax/MiniMax-M3.1-Flash)"
checked_at: 2026-10-30
---

# QA — corregir la pose de caminar de Max (torso y cola)

**Plan**: `docs/plans/2026-10-30-dog-walk-pose-fix.md` (13 criterios de aceptación, `visual: true`)
**Review**: `docs/reviews/2026-10-30-corregir-la-pose-de-caminar-de.md` (APPROVED, 0 critical / 0 major / 4 minor)
**Ronda**: 1 (post-fix del MAJOR-1 del review)
**Veredicto**: **OK** (APPROVED)

---

## 1. Qué se verificó y cómo

| Área | Método | Resultado |
|---|---|---|
| Suite completa | `npm test` | **932/932** verdes, 0 fail, 0 skipped, 0 todo |
| Contrato de arte | `node --test test/pet-assets.test.js` | **67/67** verdes (62 previos + 5 nuevos) |
| Sintaxis | `npm run check` | exit 0 (33 archivos) |
| Arranque de la app | `npm run smoke` | exit 0 — Electron 10 s sin errores críticos |
| Geometría (independiente) | `docs/qa/evidence/verify-dog-walk-geometry.js` | **0 fallas** |
| Guard nuevos muerden | mismo script en modo `--old` (arte de `fc664cc`) | **7 fallas** contra el arte viejo ⇒ los guards no son decorativos |
| Frescura del PNG de evidencia | `python test/preview/pet-poses-capture.py --only dog-walk` | binario **byte a byte idéntico** al commiteado |
| Revisión visual | Playwright/Chromium sobre el SVG de producción | 6 capturas + 1 comparativa en `docs/qa/evidence/` |

### Comandos realmente ejecutados

```
$ npm test
ℹ tests 932   ℹ pass 932   ℹ fail 0   ℹ skipped 0   ℹ duration_ms 44384.1

$ node --test test/pet-assets.test.js
✔ dog walk: la cola nace de la grupa y se curva hacia arriba sin apoyarse en el lomo
✔ dog walk: el torso de Max al caminar tiene linea de lomo y de vientre de perro en marcha (no un bloque)
✔ dog walk: la pata delantera lejana queda pegada al vientre (sin cuna de fondo)
✔ dog walk: el cambio esta acotado a la pose de caminar de Max
✔ README de capturas: la fila de dog-walk documenta los criterios visuales de la pose de caminar de Max
ℹ tests 67   ℹ pass 67   ℹ fail 0   ℹ skipped 0

$ npm run check
(sin salida; exit 0)

$ npm run smoke
[smoke-test] Electron salio con codigo null
[smoke-test] OK — no se detectaron errores criticos en 10s

$ python test/preview/pet-poses-capture.py --only dog-walk
  dog-walk -> docs/pet-screenshots/dog-walk.png
$ sha256sum docs/pet-screenshots/dog-walk.png
9e03a845effee959744004b5730058e2f1ffb63168b8e66f8251b19b6b7c7150 *docs/pet-screenshots/dog-walk.png
$ cmp docs/pet-screenshots/dog-walk.png <backup del commit>   # -> IDENTICAL

$ node docs/qa/evidence/verify-dog-walk-geometry.js
=== RESULTADO: TODO OK ===
$ node docs/qa/evidence/verify-dog-walk-geometry.js --old
=== RESULTADO: 7 FALLAS ===
```

---

## 2. Criterio por criterio

### C1 — La cola nace de la grupa y se curva hacia arriba (gancho de shiba) · **OK**

Medido (`verify-dog-walk-geometry.js`, geometría real del `d`, no literales):

| Magnitud | Criterio | Medido |
|---|---|---|
| Raíz de la cola dentro del torso | sí | 46 puntos de la cola dentro del torso |
| Raíz en el tercio trasero (`x ≥ minX + 0.62·ancho`) | `x ≥ 121.3` | `x_min = 145.0` (enlace x 145.0–161.7) |
| Punta de la cola sobre el torso | ≥ 10 px | **27.77 px** |
| Aire entre el rizo y la línea del lomo (banda `x ∈ [87, 152]`) | ≥ 5 px | **20.79 px** (mínimo en x=151.7) |

Visual (`max-walk-zoom-cola-grupa.png`, `max-walk-comparacion-antes-despues.png`): el rizo viejo era una masa apoyada sobre la grupa; el nuevo es un **gancho esbelto** que sale de la grupa, sube por encima del lomo y deja **aire visible** entre el gancho y la espalda, tanto sobre fondo claro como oscuro. La tinta del gancho se continua con la de la grupa: no se lee como una pieza pegada encima.

### C2 — Torso de perro en marcha (lomo y vientre, no un bloque) · **OK**

| Magnitud | Criterio | Medido |
|---|---|---|
| Profundidad del pecho vs. cintura | ≥ 8 px | **21.82 px** (pecho 57.0 / cintura 35.2) |
| El vientre sube del pecho a la cintura | ≥ 8 px | **12.64 px** (y 142.0 → y 129.4) |
| Descenso del lomo hombro → plinga | ≥ 4 px | **7.71 px** (y 85.0 → y 92.7) |
| El lomo vuelve a subir en la grupa | sí | grupa y **87.5** ≤ plinga − 2 |

Visual (`max-walk-zoom-torso-lomo-vientre.png`): el pecho queda claramente más hondo que la cintura, se ve la **curva de la cintura** subiendo hacia la grupa y el lomo describe hombro → plinga → grupa. En el comparativo antes/después la diferencia con el bloque rectangular viejo es evidente.

### C3 — Silueta continua (fondo claro y oscuro) · **OK**

`max-walk-pose-completa-claro.png` y `max-walk-pose-completa-oscuro.png`: la cola, el torso, las patas y la cabeza se leen como **una sola silueta**; ningún elemento flota ni se lee superpuesto. El guard de silueta de un componente y el de sombra contenida están verdes en la suite.

### C4 — Cel-shading intacto · **OK**

- Tinta: 20 usos, **una sola** (`#3B2416`).
- Sin degradados: `url(#...)` = 0, `linearGradient`/`radialGradient` = 0.
- Paleta de la especie verificada: `#160C06 #28140B #3A2A22 #3B2416 #6B3A12 #8A4A12 #C97E22 #E9CFA8 #F7B851 #FFF8EC #FFFFFF` (idéntica a la de las otras poses).
- Sombras planas de dos tonos sobre `#F7B851` (`#C97E22`), crema `#FFF8EC` / `#E9CFA8`, sin salirse del contorno (guard `cel: ningun plano de sombra cruza el contorno` verde).

### C5 — Identidad shiba y cabeza sin cambios · **OK**

- El bloque `<g class="pet-head">` de `dogWalkSVG` es **byte a byte idéntico** al de antes del plan (el diff de `src/assets/dog.js` solo toca `.anim-wag` y `.pet-body`): hocico, ojo, máscara crema y orejas no cambian.
- Ancla de pupila de perfil `(48, 66)` presente (guard `dog walk SVG: anchor en (48, 66)` verde).
- Orejas triangulares erguidas y sin rayas en el lomo: verificado en `max-walk-zoom-cabeza-identidad.png`.

### C6 — Cambio acotado a la pose de caminar de Max · **OK**

Recalculé los sha256 de las **11 poses restantes** (6 de Luna + idle/sleep/sit/lay/stretch de Max) y comparé con los congelados en `test/pet-assets.test.js`: **11/11 coinciden**. Además, `git diff fc664cc HEAD -- test/` no tiene **ninguna línea eliminada** (370 líneas, todas aditivas): no se relajó, saltó ni borró ningún test existente.

### C7 — Raíz enterrada, punta alta y aire sobre el lomo · **OK**

| Magnitud | Criterio | Medido |
|---|---|---|
| Profundidad de la raíz bajo la grupa | ≥ 6 px | **14.87 px** |
| Envergadura del enlace cola↔torso | ≥ 5 px | **11.40 px** (`overlapWidth`, misma métrica del guard del repo) |
| Punta sobre el torso | ≥ 10 px | **27.77 px** |
| Aire sobre el lomo en la banda | ≥ 5 px | **20.79 px** |

### C8 — Pecho ≥ 8 px más hondo que la cintura, lomo no plano · **OK**

Ver C2: 21.82 px de diferencia de fondo y 7.71 px de descenso del lomo con ascenso final en la grupa.

### C9 — Pivotes de animación sincronizados CSS ↔ SVG · **OK**

| Masa | Inline en `dogWalkSVG` | Regla CSS que gana la cascada | ¿Iguales? |
|---|---|---|---|
| `.anim-wag` | `152px 106px` | `.walking-bob.dog-walk .anim-wag-fast` → `152px 106px !important` | ✅ |
| `.pet-body` | `108px 113px` | `.dog-walk .pet-body` → `108px 113px` | ✅ |
| `.pet-head` / `.left-paw` / `.right-paw` | `60px 94px` / `74px 140px` / `100px 140px` | idem | ✅ |

El guard de deriva CSS↔SVG (52 comprobaciones) está verde.

### C10 — Guards de arte preexistentes verdes · **OK**

Los 62 tests de `test/pet-assets.test.js` previos a este plan siguen verdes: silueta de un solo componente, plano de sombra dentro de su masa, cabeza superpuesta al cuerpo (≥ 8 px), patas delanteras sin doble línea contra el contorno del cuerpo, orden de pintado intacto (sombra → cola → patas traseras → torso → patas delanteras → cabeza), una sola tinta, paleta fija, base de la cola enterrada, deriva de pivotes, alias `walk1-4`/`walkFrames` y superficie de exports.

### C11 — Pata delantera lejana pegada al vientre · **OK**

Tramo plano del canto superior de `.right-paw`: `x 85.7 → 106.0` (82 muestras). Peor holgura vientre↔canto de la pata: **+0.58 px** (el torso tapa el canto de la pata en todo el tramo; no hay cuna de fondo ni extremo de tinta abierto al aire). Visible en `max-walk-zoom-pata-delantera.png`.

Además verifiqué que el guard **muerde**: contra el arte intermedio de `d5fc36e` (el que el review marcó como MAJOR-1) la holgura es de **−5.48 px** en x=106 ⇒ el guard habría fallado y con el fix pasa.

### C12 — `npm test` y `npm run check` verdes, sin regresiones · **OK**

932/932 y exit 0 en `check`. El diff de tests es 100 % aditivo (0 líneas eliminadas, 0 asserts cambiados, 0 tests saltados).

### C13 — PNG regenerada desde el SVG de producción + README documentando qué mirar · **OK**

- `docs/pet-screenshots/dog-walk.png` **regenerado** con `python test/preview/pet-poses-capture.py --only dog-walk` y el resultado es **byte a byte idéntico** al binario commiteado (sha256 `9e03a845…`), lo que prueba que la PNG sale del SVG de producción actual y no de un copia pegada.
- La fila `dog-walk` de `docs/pet-screenshots/README.md` documenta los cuatro puntos a mirar (cola que nace de la grupa y se enrosca sin apoyarse en el lomo, pecho más hondo que la cintura, pata delantera lejana pegada al vientre, silueta única) y el test `README de capturas: la fila de dog-walk documenta los criterios visuales de la pose de caminar de Max` verifica que esa fila siga documentándolos (verde).

---

## 3. Los guards nuevos muerden (no son decorativos)

`node docs/qa/evidence/verify-dog-walk-geometry.js --old` corre la **misma** medición contra el arte del commit `fc664cc` (antes del plan) y falla 7 veces:

```
MODO --old: guards contra el arte del commit fc664cc (antes del plan)
  FALLA aire minimo entre el rizo y la linea del lomo: 0.84 px (min 5 px)
  FALLA profundidad del pecho vs cintura: 5.30 px (min 8 px)
  FALLA el vientre sube del pecho a la cintura: 2.85 px (min 8 px)
  FALLA descenso del lomo hombro->plinga: 1.81 px (min 4 px)
  FALLA el lomo vuelve a subir en la grupa: grupa 92.0 vs plinga 86.8
  FALLA pivote .anim-wag inline == CSS: inline 140px 108px / CSS 152px 106px
  FALLA pivote .pet-body inline == CSS: inline 106px 112px / CSS 108px 113px
=== RESULTADO: 7 FALLAS ===
```

Es decir: los criterios visuales del plan **no se cumplen** con el arte viejo, exactamente como describe el diagnóstico del plan (§2).

---

## 4. Evidencia visual (`docs/qa/evidence/`)

Conjunto canónico (una captura por vista/estado, mismo nombre en cada ronda):

| Archivo | Qué muestra |
|---|---|
| `max-walk-pose-completa-claro.png` | Pose de caminar de Max completa, renderizada desde `src/assets/dog.js`, fondo claro |
| `max-walk-pose-completa-oscuro.png` | La misma pose sobre fondo oscuro (legibilidad de la silueta) |
| `max-walk-zoom-cola-grupa.png` | Zoom de la cola enroscada y la grupa: gancho esbelto, aire entre el rizo y el lomo, raíz enterrada en la grupa |
| `max-walk-zoom-torso-lomo-vientre.png` | Zoom del torso: hombro → plinga → grupa en el lomo, pecho hondo y cintura que sube |
| `max-walk-zoom-pata-delantera.png` | Zoom del encuentro vientre / pata delantera lejana: sin cuna de fondo, sin extremo de tinta abierto |
| `max-walk-zoom-cabeza-identidad.png` | Zoom de la cabeza: orejas triangulares erguidas, máscara crema, hocico y ojo de perfil (ancla 48,66) |

Extra (no canónico, no reemplaza a los anteriores):

| Archivo | Qué muestra |
|---|---|
| `max-walk-comparacion-antes-despues.png` | Arte viejo (`fc664cc`) vs. arte actual, lado a lado: la cola deja de ser una masa apoyada en el lomo y el torso deja de ser un bloque |

Scripts reproducibles:

| Archivo | Qué hace |
|---|---|
| `verify-dog-walk-geometry.js` | Recalcula, con código propio (no con los asserts del repo), todas las magnitudes numéricas de la acceptance. Sin argumentos: verifica el arte actual. Con `--old`: los mismos guards contra el arte anterior. |
| `capture-dog-walk-evidence.py` | Regenera el conjunto canónico de 6 capturas desde el SVG de producción (Playwright/Chromium headless). |
| `capture-dog-walk-compare.py` | Regenera la comparativa antes/después desde el SVG viejo (`git show fc664cc`) y el actual. |

---

## 5. Observaciones (no bloquean)

1. **La cola perdió los dos trazos de detalle interiores** (`stroke-width 1.8`) que tenía el rizo viejo. No lo pedía ni lo prohibía el plan, y el gancho nuevo se lee más limpio; queda como tweak de 1 línea si el revisor visual quiere algo de "pelo" en la punta. (Es el MINOR-1 del review, ya anotado ahí.)
2. **La cola es un gancho abierto**, no un rizo cerrado: la punta se curva hacia adentro y queda sobre el lomo, con aire debajo. Es la lectura de "cola enroscada de shiba" del plan y así se ve en las capturas; lo dejo dicho para que el revisor visual confirme que es la lectura buscada y no "cola en gancho".
3. **Holgura del encuentro cuello/lomo**: la tinta de la cabeza arranca en `(107, 86.4)` y el lomo nuevo pasa ~1.5 px por debajo ahí. El guard (≤ 2 px) sigue verde (mínimo real ~0.55 px en x≈91–96), pero la holgura se redujo respecto al arte viejo. Es el MINOR-2 del review.
4. El muestreo del guard de cola es por vértices (24 por curva): una inmersión de 1–2 px *entre* vértices pasaría el filtro. No aplica hoy (la cola está 20+ px por encima del lomo en toda la banda). Es el MINOR-4 del review.

Ninguna de estas cuatro afecta a un criterio de aceptación.

---

## 6. Conclusión

Los **13 criterios de aceptación** del plan `docs/plans/2026-10-30-dog-walk-pose-fix.md` (incluido el addendum §6 del review) se cumplen:

- Los 11 criterios numéricos/estructurales están verificados con **medición independiente** (`verify-dog-walk-geometry.js`), no solo con los asserts del repo, y los guards correspondientes **muerden** contra el arte anterior.
- Los 2 criterios puramente visuales (lectura de la cola, lectura del torso, silueta continua sobre fondo claro y oscuro) están respaldados por capturas del **SVG de producción** renderizadas con Playwright, que quedan en `docs/qa/evidence/` para el juicio del revisor visual.
- `npm test` (932/932), `npm run check` y `npm run smoke` verdes, sin regresiones.
- **Ningún test fue debilitado**: el diff de `test/pet-assets.test.js` es 100 % aditivo (0 líneas eliminadas, 0 asserts relajados, 0 tests saltados) y las 11 poses fuera de alcance siguen byte a byte idénticas (sha256 verificados).
- La PNG de evidencia de `docs/pet-screenshots/` es reproducible desde el SVG de producción (regeneración byte a byte idéntica) y el README documenta qué mirar.

**Veredicto: OK / APPROVED.**
