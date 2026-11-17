---
id: 2026-10-30-corregir-la-pose-de-caminar-de
plan: docs/plans/2026-10-30-pose-caminar-luna.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 4
  info: 2
reviewed_at: 2026-10-30
---

**Verdict**: APPROVED

# Review: corregir la pose de caminar de Luna (`catWalkSVG`)

**Fecha**: 2026-10-30
**Plan**: `docs/plans/2026-10-30-pose-caminar-luna.md` (size M, visual: true)
**Diff revisado**: `src/assets/cat.js` (solo `catWalkSVG`), `src/styles/animations.css`
(2 `transform-origin`), `test/pet-assets.test.js` (bloque nuevo de tests),
`docs/pet-screenshots/cat-walk.png` (regenerado) + el propio plan.

---

## 1. Resumen ejecutivo

El diff implementa los dos pasos del plan y nada más:

- **Paso 1 (patas delanteras)**: `.left-paw` y `.right-paw` de `catWalkSVG` se
  redibujan como patas con hombro (enterrado bajo el pecho), codo con quiebre y
  mano con dedos; los dos pivotes se mueven al hombro nuevo
  (`73px 126px` / `89px 124px`) en el `<g>` inline **y** en las reglas CSS, que
  siguen diciendo exactamente lo mismo (guard de deriva OK).
- **Paso 2 (torso)**: el `cel-outline` de `.pet-body` se rehace con lomo arqueado
  y vientre curvo (pecho profundo, cintura recogida, grupa), con las rayas de
  pelo recolocadas y el plano de sombra redefinido dentro de la silueta nueva.
- **Tests**: se añaden T1-T5 al final de `test/pet-assets.test.js`, derivados de
  la geometría real del SVG, **con exactamente los umbrales del plan**
  (aire >= 2 px, solape <= 8 %, 0 cruces, hombro >= 6 px, desvío de codo >= 3 px,
  mano >= 1.25x antebrazo, lomo <= 20 px, vientre <= 24 px con banda de 3 px).
  No hay ningún test debilitado, saltado ni borrado, ni ningún umbral
  relajado respecto del plan.
- **Captura**: `docs/pet-screenshots/cat-walk.png` está regenerada con la pose
  nueva (fondo claro y fondo oscuro). La miro: la pose ya no se lee como una
  barra con dos palos cruzados.

No encontré ningún criterio de aceptación incumplido. Lo que queda son
observaciones de mantenimiento (márgenes estrechos en dos métricas, una
desviación de color del `cel-base` que hay que enmendar en el plan y dos nits)
y una comprobación que corresponde al gate de QA.

---

## 2. Criterios de aceptación del plan (veredicto por criterio)

| # | Criterio (frontmatter `acceptance`) | Veredicto | Cómo se comprobó |
|---|---|---|---|
| 1 | Patas separadas en zancuda: aire >= 2 px bajo el vientre y solape <= 8 % | OK | Geometría del SVG: `.left-paw` llega a x=80.4 (el codo) y `.right-paw` arranca en x=85.0 -> aire ~4.6 px; las siluetas no se solapan en X -> solape 0 % |
| 2 | 0 cruces de tinta entre las dos patas (no se lee una X) | OK | `countCrossings` sobre los `cel-outline`: el x max de la izquierda (80.4) es menor que el x min de la derecha (85.0) -> 0 cruces |
| 3 | Hombro enterrado >= 6 px, codo visible (>= 3 px) y mano >= 1.25x antebrazo | OK | `.left-paw`: hombro ~13 px dentro del pecho, desvío del eje ~10.7 px, mano 14.6 px vs antebrazo 8.6 px. `.right-paw`: hombro ~6.5 px, desvío ~5 px, mano 16.2 px vs antebrazo 9.2 px |
| 4 | Torso no rectangular: lomo <= 20 px y vientre <= 24 px (banda 3 px) | OK | Perfil vertical de `.pet-body`: lomo ~18.4 px (x ~110.6..129.0), vientre ~19.9 px (x ~88..108). Antes: ~34 px y ~48 px |
| 5 | Guards cel existentes siguen verdes | OK (revisión estática) | 1 `cel-outline` + 1 `cel-shadow` por masa; fills en la paleta de Luna (`#F2A85E`, `#FFF4E4`, `#E4C4A0`, `#C4783A`, `#8A4A1E`); una sola tinta `#3A1E12`; grosores 3.4 / 1.5; planos de sombra contenidos; las patas no repiten el contorno del torso (0-1 puntos a <= 1.2 px, tope 10); cabeza con encaje ~12 px (tope 8) y su tinta a <= 1 px del contorno del torso (tope 2); parches crema sin contorno propio |
| 6 | `transform-origin` inline == CSS y el pivote cae en el hombro | OK | `.left-paw` 73px 126px y `.right-paw` 89px 124px, idénticos en el `<g>` y en `.cat-walk .left-paw` / `.cat-walk .right-paw`; los dos puntos caen dentro de la región del hombro de su pata |
| 7 | No cambia cabeza, cola, patas traseras ni otras poses; exports intactos | OK | El diff de `src/assets/cat.js` toca solo los tres paths de `catWalkSVG`; `catIdleSVG`, `catSleepSVG`, `catSitSVG`, `catLaySVG`, `catStretchSVG`, `src/assets/dog.js` y la superficie de exports no se tocaron |
| 8 | `npm test` y `npm run check` verdes | **Pendiente de QA** | No puedo ejecutar comandos en la revisión; ver §4 (márgenes) |
| 9 | Se lee como una gata caminando, patas separadas, con hombro/codo/mano, sin X ni triángulo crema | OK (captura) | `docs/pet-screenshots/cat-walk.png` regenerado: las dos patas delanteras están separadas, una adelantada y otra atrasada, con codo y patita con dedos apoyadas en el piso; no hay X ni triángulo crema entre ellas |
| 10 | El torso se lee como cuerpo de gato, no como bloque | OK (captura) | Lomo arqueado de los hombros a la grupa y vientre curvo, sin mesetas ni esquinas |
| 11 | Silueta exterior continua, patas perdidas bajo el pecho, sin corte de contorno | OK (captura) | El encuentro cuello/torso no tiene corte; las patas emergen del pecho sin costura visible (mismo color) |
| 12 | Se lee igual en fondo claro y oscuro y Luna sigue siendo Luna | OK (captura) | Las dos tarjetas de la captura; orejas triangulares, bigotes y cola larga intactos |
| 13 | PNG regenerado con la pose nueva | OK | El binario cambió y muestra la pose nueva |

---

## 3. Hallazgos (ninguno bloqueante)

### MINOR 1 — El `cel-base` de las patas es naranja del cuerpo, no crema (§3.2, regla 5)
El plan dice que la pata conserva "1 `cel-base` (relleno crema, opcional)". La
implementación lo pinta de `#F2A85E` (el naranja del torso) y deja el crema en
el `cel-outline`, que es el que se ve.

**El código está bien; lo que hay que corregir es el plan.** El `cel-base` es
justamente lo que tiene que cubrir el hombro escondido bajo el pecho (§3.2,
regla 2): si fuera crema, asomaría una cuña crema en el pecho. Con el base
naranja el hombro se pierde en el torso y la pata visible sigue siendo crema
(lo aporta el `cel-outline`). **Acción**: enmendar `docs/plans/2026-10-30-pose-caminar-luna.md`
§3.2 regla 5 para decir "cel-base del color del cuerpo (el crema lo lleva el
cel-outline)".

### MINOR 2 — Márgenes muy estrechos en dos de las métricas nuevas
Con la geometría actual:
- lomo: ~18.4 px contra el tope de 20 px (margen ~1.5 px);
- hombro de `.right-paw`: ~6.4-6.9 px contra el mínimo de 6 px (margen ~0.5 px).

Los dos tests están bien escritos y con los umbrales del plan, así que **no es
un test debilitado**, pero cualquier retoque del arte los pone en rojo.
Recordar el criterio del propio plan (§6): si un umbral muerde, se ajusta el
**dibujo**, no el test.

### MINOR 3 — `maxFlatSpan` puede sub-reportar el arco plano más largo
La ventana se **reinicia** cuando el rango se pasa de la banda (`from = p.x`)
en vez de avanzar el puntero izquierdo. Consecuencia: una ventana válida que
empieza antes (p.ej. x=86..107.5, ~21.5 px sobre el vientre) no se reporta; el
algoritmo devuelve ~19.9 px. Es **conservador** para el defecto que se quiere
cazar (el bloque viejo medía ~34/~48 px) y no relaja ningún umbral, pero la
métrica no es exactamente "el arco contiguo más largo dentro de la banda" que
dice §4 T5. **Acción**: documentarlo en el test (o ajustar el algoritmo a la
ventana deslizante clásica) para que la descripción y la métrica coincidan.

### MINOR 4 — El `cel-base` naranja tapa la tinta del vientre del torso
El hombro de `.left-paw` se solapa con el vientre entre x≈68 y x≈79.5 (viewBox),
y como las patas se pintan despues del cuerpo, ese tramo del contorno del
vientre queda tapado por el base sin tinta. Se ve bien (mismo color, sin costura)
y la captura lo confirma, pero es el punto donde el ojo puede pedir un extra de
contraste: **que lo mire la revision visual de QA sobre la captura** (fondo
claro y oscuro) y, si molesta, la correccion es del dibujo.

### INFO 1 — `d` en varias lineas, contra el estilo del resto del SVG
Los paths nuevos de las patas (y el torso) se escriben multi-linea; el resto del
archo los tiene en una sola linea. Es cosmetico, pero rompe la uniformidad del
arte; el parser del repo (`parsePathData`, `svgTags`, `groupInner`) lo tolera
sin problema (los `[^"]*` y `[^>]*` matching newlines) -- lo verifique.

### INFO 2 — La evidencia de rojo/verde de los pasos 1 y 2 no quedo en la rama
El plan pide "verlos fallar contra el SVG actual y registrar la evidencia de
rojo" y "registrar la evidencia de verde" en cada paso. No hay ningun doc en la
rama que la recoja (el gate de QA es el que la tiene que producir). **Accion**:
QA corre `npm test` y `npm run check` con la suite nueva y adjunta el resultado
(especialmente el margen de T3 sobre `.right-paw`, ver MINOR 2).

---

## 4. Lo que se reviso en detalle (sin ejecutar comandos)

- **Pintado y masa**: el orden `pet-shadow -> cola -> patas traseras -> cuerpo ->
  patas delanteras -> cabeza` no se movio; los `cel-outline`/`cel-shadow` por
  masa siguen en 1 y >= 1; los planos de sombra nuevos quedan dentro de la
  silueta que sombrean (la sombra de la pata delantera queda dentro del
  `cel-outline` crema, la del torso dentro del contorno nuevo).
- **Deriva de pivotes**: los 4 valores (2 inline + 2 CSS) son identicos; las
  reglas de otros estados (`.sitting`, `.sleeping`, `:not(.cat-walk)`) no
  aplican a la pose walk y no se tocaron.
- **Paleta y grosores**: todos los fills nuevos/alterados estan en
  `CAT_PALETTE`; la unica tinta sigue siendo `#3A1E12`; contorno 3.4 y detalle
  1.5.
- **Parsers**: `parseElements`, `parsePathData`, `svgTags`, `groupInner` y
  `tagsWithClass` toleran los `d` multi-linea (verificados con lectura del
  codigo); `celGeo` exporta todo lo que usan los tests nuevos
  (`polygonArea`, `sampleBoundary`, `sampleInterior`, `overlapArea`,
  `polygonBBox`, `pointInPolygon`, `distanceToPolygonEdge`).
- **Alcance**: el diff no toca nada fuera de los 4 archivos del frontmatter
  `files` del plan mas el propio plan. Ninguna otra pose, ni el CSV de
  exports, ni los keyframes del gait.

---

## 5. Conclusion

El diff cumple el plan: arte redibujado segun §3, tests nuevos con los
umbrales del plan (nada debilitado ni saltado), pivotes sincronizados entre el
SVG y el CSS, captura regenerada y el resto de poses intactas. No hay
hallazgos bloqueantes.

**APROBADO.** Antes de cerrar la feature, el gate de QA tiene que confirmar
`npm test` + `npm run check` en verde con la suite nueva (atencion al margen de
T3 sobre `.right-paw`, MINOR 2) y hacer la revision visual de la captura
regenerada (MINOR 4). Y enmendar el plan en §3.2 regla 5 para reflejar el
color real del `cel-base` (MINOR 1).
