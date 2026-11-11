---
id: 2026-10-30-pose-caminar-luna
status: approved
created: 2026-10-30
size: M
visual: true
files:
  - src/assets/cat.js
  - src/styles/animations.css
  - test/pet-assets.test.js
  - docs/pet-screenshots/cat-walk.png
acceptance:
  - "En catWalkSVG (src/assets/cat.js) las dos patas delanteras se dibujan separadas en zancuda: por debajo de la linea del vientre, el borde derecho de .left-paw queda a la izquierda del borde izquierdo de .right-paw (aire >= 2 px) y el area de solape entre las dos patas es <= 8% del area de la pata mas chica"
  - "Los contornos de tinta de .left-paw y .right-paw no se cruzan entre si (0 intersecciones de segmentos entre los dos trazos), asi que no se lee una X en las patas"
  - "Cada pata delantera tiene forma de pata y nace del pecho: el hombro queda enterrado >= 6 px dentro de la silueta del torso, el eje de la pata se desvía >= 3 px de la recta hombro-mano (se ve el codo) y la mano es >= 1.25x mas ancha que el antebrazo"
  - "El torso de catWalkSVG no se lee como un bloque rectangular: el lomo no tiene ningun tramo horizontal de mas de 20 px dentro de una banda vertical de 3 px, y el vientre no tiene ningun tramo horizontal de mas de 24 px (hoy el lomo tiene ~34 px de meseta y el vientre ~48 px)"
  - "La pose catWalkSVG sigue cumpliendo los guards cel existentes: 1 cel-outline y >= 1 cel-shadow por masa, paleta fija de Luna, una sola tinta, contorno 3.2-3.6 y detalle 1.5-2.1, plano de sombra contenido (<= 0.7 px), silueta de 1 solo componente, cabeza superpuesta >= 8 px con su tinta a <= 2 px del contorno del torso, parches crema sin contorno propio"
  - "El transform-origin inline de .left-paw y .right-paw en catWalkSVG coincide con el de las reglas .cat-walk .left-paw y .cat-walk .right-paw de src/styles/animations.css (guard de deriva existente); el pivote cae en el hombro de cada pata"
  - "No cambia la cabeza, la cola ni las patas traseras de la pose walk, ni ninguna otra pose: catIdleSVG, catSleepSVG, catSitSVG, catLaySVG, catStretchSVG y las 6 poses de src/assets/dog.js quedan identicas, y la superficie de exports de src/assets/cat.js no cambia"
  - "npm test y npm run check quedan verdes"
  - "De perfil, Luna se lee como una gata caminando: las patas delanteras se ven separadas en zancuda (una adelantada y otra atrasada) y cada una se ve como una pata con hombro, codo y mano que nace del pecho; no se ven dos palos rectos cruzados en X ni un triangulo crema entre ellos"
  - "El torso se lee como el cuerpo de un gato y no como un bloque: lomo y vientre son curvas continuas, con grupa y pecho marcados, sin mesetas rectas ni esquinas"
  - "De perfil, la silueta exterior se lee como una sola pieza continua del hocico a la punta de la cola: las patas se pierden bajo el pecho sin costura visible y el encuentro cuello/torso no tiene corte de contorno"
  - "La pose se sigue leyendo igual sobre fondo claro y sobre fondo oscuro, y Luna sigue reconociendose como gato (orejas triangulares, bigotes, cola larga)"
  - "docs/pet-screenshots/cat-walk.png queda regenerado con la pose nueva (si el script de captura no corre en el entorno, lo regenera QA antes de la revision visual; el PNG viejo no sirve como evidencia)"
steps:
  - "Paso 1 - Patas delanteras de Luna en zancuda: en test/pet-assets.test.js anadir primero los tests derivados de geometria de la pose walk (patas separadas en zancuda sin cruzarse, hombro enterrado >= 6 px en el pecho, codo visible con desviacion >= 3 px del eje, mano mas ancha que el antebrazo), verlos fallar contra el SVG actual y registrar la evidencia de rojo; luego en src/assets/cat.js redibujar los grupos .left-paw y .right-paw de catWalkSVG con silueta de pata (hombro angosto, codo con quiebre, mano ancha con 2 lineas de dedos) naciendo del pecho, la adelantada extendiendose hacia adelante y la atrasada quedandose atras, sin que sus contornos se crucen, con el borde superior de cada pata escondido bajo el torso (trazo de tinta abierto arriba, sin costura sobre el vientre) y el plano de sombra contenido; mover el transform-origin inline de ambos grupos al hombro nuevo y actualizar en src/styles/animations.css las reglas .cat-walk .left-paw y .cat-walk .right-paw con el mismo valor; registrar la evidencia de verde"
  - "Paso 2 - Torso de Luna con lomo y vientre curvos: en test/pet-assets.test.js anadir primero el test derivado que mide el tramo horizontal maximo del lomo y del vientre de la silueta de .pet-body en catWalkSVG (verlos fallar contra el bloque actual y registrar la evidencia de rojo); luego en src/assets/cat.js redibujar el cel-outline de .pet-body de catWalkSVG con lomo arqueado continuo (sube del cuello al riñón y baja redondeado hacia la grupa) y vientre curvo (pecho profundo, cintura recogida, muslo), sin mesetas rectas ni esquinas, manteniendo 1 cel-outline y >= 1 cel-shadow contenido, recolocando las rayas de pelo y el plano de sombra dentro de la nueva silueta y conservando el encuentro con la cabeza sin corte de contorno; ajustar el transform-origin inline de .pet-body y la regla .cat-walk .pet-body de src/styles/animations.css si se mueve el pivote; refrescar docs/pet-screenshots/cat-walk.png con el script de preview si el entorno lo permite y registrar la evidencia de verde"
---

# Plan: corregir la pose de caminar de Luna (catWalkSVG)

> **Status**: Approved
> **Fecha**: 2026-10-30
> **Size**: M
> **Visual**: true (el criterio lo juzga una persona mirando la captura)

---

## 1. Goal

Que la pose de caminar de Luna (`catWalkSVG`, `src/assets/cat.js`) se lea como
**una gata caminando**, y no como el ensamblaje que hay hoy:

- **Patas delanteras**: hoy son dos cuñas/palos rectos que se cruzan en X bajo
  el pecho y dejan un triángulo crema entre ellos. Deben verse **separadas en
  zancuda** (una adelantada, otra atrasada) y cada una con **forma de pata**
  (hombro, codo y mano) que **nace del pecho**.
- **Torso**: hoy es un bloque con mesetas rectas arriba y abajo y esquinas
  redondeadas de rectángulo. Debe tener **lomo y vientre curvos y continuos**.

**Fuera de alcance (explícito):** la cabeza, la cola, las patas traseras de la
pose walk y cualquier otra pose (las 5 restantes de Luna y las 6 de Max) no se
tocan. Tampoco se tocan los keyframes del gait: solo los `transform-origin` de
los grupos afectados, para que sigan coincidiendo con el CSS.

---

## 2. Diagnóstico (estado actual, verificado)

### 2.1 Lo que se ve

`docs/pet-screenshots/cat-walk.png` muestra a Luna de perfil: el torso es una
"barra" naranja de lomo y vientre rectos, y bajo el pecho hay dos líneas
blancas finas que se cruzan en X con un relleno crema en medio.

### 2.2 Por qué en el código

Coordenadas actuales (`src/assets/cat.js`, `catWalkSVG`):

| Masa | Geometría actual | Problema |
|---|---|---|
| `.left-paw` | cuña con lados rectos: arista de (64.3,135.9) a (86.3,139.6) y de (86.3,139.6) a (92,163) | el hombro está **1 px fuera** del vientre (no nace del pecho) y la arista frontal cruza la pata vecina |
| `.right-paw` | cuña con arista de (86.3,139) a (112.1,138.5) y de (87.7,139.8) a (110,163) | idem, y las dos aristas se cortan en ~(89,149): de ahí la **X** y el triángulo crema |
| `.pet-body` | `M 58,112 C 55,97 66,88 84,88 C 106,87 130,89 143,94 C 155,98 158,110 151,119 C 143,128 128,135 112,137 C 100,139 92,139 86,138 C 78,137 70,137 64,135 C 60,133 58,124 58,112 Z` | lomo casi horizontal de x=84 a x=143 (meseta de ~34 px dentro de una banda de 3 px) y vientre casi horizontal de x=64 a x=112 (~48 px): bloque con esquinas |

Los dos casos son el mismo error: **el contorno de la pata se dibuja como una
línea recta de lado a lado del torso**, en vez de una pata que entra al pecho
y baja con codo.

### 2.3 Contratos que NO se pueden romper (ya los cubre `test/pet-assets.test.js`)

| Contrato | Test que lo cubre |
|---|---|
| 1 `cel-outline` + >= 1 `cel-shadow` por masa, paleta de Luna, una sola tinta, grosores 3.2-3.6 / 1.5-2.1 | `cel: ...` (cel) |
| el plano de sombra no cruza el contorno de su masa (<= 0.7 px) | `cel: ningun plano de sombra cruza el contorno de la masa que sombrea` |
| la silueta de la pose es **1 sola pieza** (nada flotando) | `cel: cada pose se lee como una sola silueta` |
| la pata delantera no comparte tramo con el contorno del torso (max 10 puntos a <= 1.2 px) | `cel: las patas delanteras no repiten el contorno del cuerpo` |
| la cabeza entra >= 8 px en el torso y su tinta queda a <= 2 px del contorno del torso | `cel: la cabeza se superpone al cuerpo` |
| los parches crema no llevan contorno propio | `cel: los parches crema (hocico, pecho) no llevan contorno propio` |
| `transform-origin` del CSS == inline del SVG (52 comprobaciones, 12 poses) | `guard de deriva: el pivote que gana el CSS coincide con el transform-origin inline del SVG` |
| orden de pintado sombra→cola→patas→cuerpo→patas→cabeza | `guard de deriva: la sombra de piso sigue siendo el primer elemento...` |
| superficie de exports y alias de `src/assets/cat.js` | `assets: la superficie de exports ... no cambia` |
| 12 poses en el preview + una PNG por pose | `preview de las 12 poses ...` / `capturas: existe un PNG por pose` |

**Los tests nuevos se escriben sobre `test/helpers/cel-geometry.js`**, que ya
expone `collectMasses`, `collectFilledShapes`, `shapePolygons`,
`transformPolys`, `polygonBBox`, `polygonCentroid`, `pointInPolygon`,
`distanceToPolygonEdge`, `overlapArea`, `silhouetteComponents`, etc. El archivo
de tests ya tiene los helpers `massOutlinePolys(svg, cls)` y
`massFilledPolys(svg, cls)` (líneas ~1473-1496): reusarlos.

---

## 3. Decisiones de diseño (geometría objetivo)

Coordenadas en el `viewBox="0 0 200 200"`. Luna mira a la **izquierda**, así
que "adelantada" = hacia la izquierda. El piso está en `y ≈ 166-172`
(`pet-shadow` con `cy=172`).

### 3.1 Torso (`.pet-body`) — paso 2

- **Lomo**: curva continua desde el cuello (x≈60, y≈112) que **sube** hasta el
  punto más alto sobre el riñón (x≈118-128, y≈86-89) y **baja** en curva
  redondeada hacia la grupa (x≈150, y≈104) y el final trasero (x≈158, y≈116).
  Ningún tramo horizontal de más de 20 px dentro de una banda vertical de 3 px.
- **Vientre**: curva continua con **pecho profundo** al frente (x≈66-74,
  y≈136-138), **cintura recogida** (x≈105-120, y≈128-131) y vuelta al muslo
  (x≈140, y≈134-137). Ningún tramo horizontal de más de 24 px.
- **Pecho**: el borde delantero es una curva suave, no una esquina de
  rectángulo redondeado.
- **Encaje con la cabeza** (que no se toca): el pecho tiene que seguir
  embolsando el cuello donde la cabeza entra (superposición >= 8 px y tinta de
  la cabeza a <= 2 px del contorno del torso). Si el nuevo pecho se separa de
  la cabeza, se rompe ese guard.
- **Dentro del grupo**: 1 `cel-outline` + 1 `cel-shadow` (plano, contenido) +
  las rayas `fur-deep` (`#8A4A1E`) recolocadas sobre el lomo nuevo + el
  detalle de pelo que ya existe.
- El `transform-origin` de `.pet-body` (hoy `104px 116px` inline y en
  `.cat-walk .pet-body`) se mantiene si sigue siendo el centro de masa del
  torso; si se mueve, se actualizan **los dos** a la vez.

### 3.2 Patas delanteras — paso 1

| | `.left-paw` (adelantada) | `.right-paw` (atrasada) |
|---|---|---|
| Hombro (anclaje en el pecho) | ≈ (72, 122) | ≈ (90, 122) |
| Codo | ≈ (80, 143) (abajo y atrás) | ≈ (96, 142) |
| Muñeca | ≈ (66, 160) | ≈ (88, 158) |
| Mano | ≈ (56-68, 160-170), apoyada en el piso, apuntando al frente | ≈ (84-98, 158-168), apenas levantada o recién soltándose, apuntando atrás |
| Pintura | crema `#FFF4E4` | crema `#FFF4E4` |

Reglas de construcción (mismo patrón que las poses idle/sit del repo):

1. **Silueta de pata**: hombro angosto → codo con quiebre visible → mano más
   ancha que el antebrazo (>= 1.25x) con 2 líneas de dedos (stroke 1.5).
   Nada de lados rectos de punta a punta: hoy las patas son cuñas con
   aristas de lado a lado.
2. **El hombro se pierde bajo el pecho**: el punto de anclaje queda **>= 6 px
   (mejor 8-10 px) dentro** de la silueta del torso, y el **trazo de tinta de
   la pata va abierto arriba** (como en `catIdleSVG`: el `cel-outline` de la
   pata empieza en la parte baja y termina en la parte alta, sin cerrar el
   trazo sobre el torso). Así no aparece una costura de tinta sobre el
   vientre ni un corte de contorno.
   **Importante**: el `cel-base` (relleno crema) de la pata tiene que cubrir
   **también** la parte que se esconde bajo el torso (el hombro completo, no
   solo el tramo visible): si el relleno se corta justo en la línea del
   vientre, el hombro no queda "enterrado" y se ve la pata pegada al cuerpo.
3. **Sin X**: por debajo de la línea del vientre, el borde derecho de
   `.left-paw` queda **a la izquierda** del borde izquierdo de `.right-paw`
   (aire >= 2 px), los contornos de tinta de las dos patas **no se cruzan** y
   el área de solape es <= 8% del área de la pata más chica.
4. **El codo se ve**: el eje de la pata (hombro → mano) se desvía **>= 3 px**
   de la recta que une esos dos puntos (con el codo atrás y la mano adelante,
   el eje es una "Z", no una línea recta).
5. Cada pata conserva: 1 `cel-outline` (contorno 3.4, tinta `#3A1E12`), 1
   `cel-base` (relleno crema, opcional), 1 `cel-shadow` plano `#E4C4A0`
   **contenido dentro de la silueta** (el guard mide el desborde: <= 0.7 px) y
   2 líneas de dedos de 1.5 px.
6. Los **pivotes** (inline y CSS) van al **hombro**: el `transform-origin` de
   `.left-paw` ≈ (72, 122) y el de `.right-paw` ≈ (90, 122). Recordar: el
   `transform-origin` inline del `<g>` y la regla CSS
   `.cat-walk .left-paw` / `.cat-walk .right-paw` de
   `src/styles/animations.css` (líneas 141-151) tienen que decir **lo mismo**
   o el guard de deriva falla en rojo.
7. **No tocar** el emparejamiento contralateral del gait (`.left-paw` con
   `.back-foot-right`, `.right-paw` con `.back-foot-left`), ni los keyframes
   `catWalkSwingLeft` / `catWalkSwingRight`.

---

## 4. Plan de testing (tests nuevos, en `test/pet-assets.test.js`)

Bloque nuevo al final del archivo (reusando `celGeo`, `massOutlinePolys`,
`massFilledPolys`). Cada test deriva de la geometría real del SVG: si un
redibujo vuelve a romper el encaje, falla en rojo.

### Paso 1 — patas delanteras

**T1. `pose walk de Luna: las patas delanteras van separadas en zancuda`**
- `left = massFilledPolys(catWalkSVG, 'left-paw')`,
  `right = massFilledPolys(catWalkSVG, 'right-paw')`.
- `yVientre` = `maxY` del bbox del torso (`.pet-body`).
- Con los puntos de cada pata con `y >= yVientre`:
  `maxX(left) <= minX(right) + 2` (aire entre las dos patas por debajo del
  cuerpo).
- `overlapArea(left, right, 0.25) <= 0.08 * min(area(left), area(right))`.
- **Hoy falla**: la arista frontal de `.left-paw` llega a x=92 y el borde
  trasero de `.right-paw` arranca en x=86.3.

**T2. `pose walk de Luna: las patas delanteras no se cruzan (no hay X)`**
- Polilíneas de los contornos de tinta: `massOutlinePolys(catWalkSVG, cls)`.
- Contar intersecciones de segmentos entre las dos polilíneas (test de
  orientación, tolerando el contacto en un punto suelto: se cuentan solo los
  cruces *propios*).
- **Hoy falla**: la arista (66.2,137.2)→(92,163) de `.left-paw` cruza el borde
  (86.3,139)→(89.5,156.5) de `.right-paw` en ~(89,149).

**T3. `pose walk de Luna: cada pata delantera nace del pecho (hombro enterrado)`**
- Profundidad = para los puntos de la pata (los rellenos: `cel-base` +
  `cel-outline` + `cel-shadow`) que están dentro del torso, `max` de la
  distancia al borde del torso; se exige **>= 6 px**.
- Ojo: se mide sobre los **rellenos**, no solo sobre el trazo de tinta. Por eso
  el `cel-base` de la pata tiene que tapar el hombro bajo el torso (§3.2,
  regla 2); con el relleno recortado en el vientre, la profundidad da ~0 px y
  la pata se lee pegada al cuerpo.
- **Hoy falla**: el vértice superior de `.left-paw` (64.3,135.9) está ~1 px
  fuera del vientre y el de `.right-paw` (86.3,139) ~1 px fuera.

**T4. `pose walk de Luna: cada pata tiene codo y mano (no es un palo recto)`**
- Eje de la pata = centroide de las franjas horizontales (slabs de 2 px) del
  polígono relleno, de la franja del hombro a la de la mano.
- Desvío = distancia perpendicular máxima del eje a la recta hombro→mano:
  se exige **>= 3 px** (el codo se ve).
- Ancho: ancho horizontal de la franja de la mano (abajo) vs. el de la franja
  del antebrazo (medio): se exige **mano >= 1.25x antebrazo**.
- **Hoy falla en el codo**: el eje de ambas patas es una recta.

### Paso 2 — torso

**T5. `pose walk de Luna: el torso no es un bloque (lomo y vientre curvos)`**
- Polígono de la silueta de `.pet-body`.
- Perfil superior (lomo) e inferior (vientre) como función de x, muestreado
  cada 1 px.
- "Tramo horizontal" = arco contiguo del perfil que permanece dentro de una
  banda vertical de **3 px**; se mide su span horizontal.
- Se exige: lomo <= **20 px**, vientre <= **24 px**.
- **Hoy falla**: lomo ~34 px (meseta de x=84 a x=122), vientre ~48 px
  (x=64 a x=112).

**T6. `pose walk de Luna: el torso mantiene el encaje con la cabeza`** (el
guard de "cabeza superpuesta >= 8 px / tinta a <= 2 px" ya existe y aplica; en
el paso 2 solo se verifica que sigue verde tras redibujar el pecho).

### Evidencia

En cada paso: primero el test nuevo en rojo contra el SVG viejo (con el
mensaje de error de la métrica), después el SVG nuevo y el test en verde, todo
dentro del mismo paso. Al final, `npm test` y `npm run check` verdes.

---

## 5. Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/assets/cat.js` | `catWalkSVG`: `.left-paw` y `.right-paw` (paso 1), `.pet-body` (paso 2). Nada más del archivo |
| `src/styles/animations.css` | `transform-origin` de `.cat-walk .left-paw`, `.cat-walk .right-paw` (paso 1) y de `.cat-walk .pet-body` (paso 2, solo si se mueve el pivote). Ni keyframes ni reglas del gait |
| `test/pet-assets.test.js` | tests T1-T4 (paso 1) y T5 (paso 2) |
| `docs/pet-screenshots/cat-walk.png` | captura regenerada (best-effort en el entorno; si el script de Playwright no corre, la regenera QA antes de la revisión visual) |

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| El redibujo rompe el guard "la pata no repite el contorno del torso" (max 10 puntos compartidos) | El hombro se entierra 8-10 px y el trazo de tinta de la pata va abierto arriba: el trazo no vuelve sobre el vientre |
| El nuevo pecho se separa de la cabeza y rompe el guard de cabeza (>= 8 px, <= 2 px) | La cabeza no se toca: el pecho nuevo tiene que seguir embolsando el cuello (x≈58-66, y≈108-118) |
| La pata adelantada extendida hacia la izquierda choca con la cabeza o con las patas traseras | La mano adelantada vive en x≈56-68, y≈160-170: por debajo de la cabeza (y<115) y a la izquierda de las patas traseras (x>=114) |
| El `transform-origin` inline y el CSS se desalinean | Se actualizan los dos en el mismo paso; el guard de deriva existente (52 comprobaciones) lo detecta en rojo |
| La sombra plana de la pata nueva se sale de la silueta | El `cel-shadow` se dibuja siguiendo el borde interior de la pata (el guard mide el desborde: <= 0.7 px) |
| Umbrales de las métricas T1-T5 demasiado estrictos para un dibujo a mano | Los umbrales salen de la medición del defecto actual (34 px y 48 px de meseta, 1 px de hombro fuera, cruce en (89,149)) con margen; si un umbral muerde, se ajusta el **dibujo**, no el test, y se justifica en el review |
| La captura PNG no se regenera en el entorno | El preview `test/preview/pet-poses-preview.html` se puede abrir en cualquier navegador; la PNG la regenera QA si hace falta |

---

## 7. Criterios de aceptación visual (los juzga una persona mirando el resultado)

Estos son los criterios que el revisor visual de QA compara contra
`docs/pet-screenshots/cat-walk.png` (fondo claro y fondo oscuro). Las métricas
de §4 son apoyo, no sustituto.

1. **Se lee como una gata caminando.** Mirando a Luna de perfil, se entiende
   que está caminando: el cuerpo está en marcha, no de pie.
2. **Patas delanteras en zancuda.** Se ven **dos patas delanteras separadas**:
   una adelantada y otra atrasada. No se ven dos palos rectos cruzados en X,
   ni un triángulo crema entre ellos, ni una cuña con lados rectos.
3. **Cada pata tiene forma de pata.** Se leen hombro, codo y mano: el codo se
   nota como un quiebre, la mano es una patita con dedos apoyada en el piso.
   Las patas **nacen del pecho**: no hay un corte ni una costura donde se
   juntan con el torso.
4. **El torso es un cuerpo de gato, no un bloque.** El lomo se arquea de forma
   visible (sube de los hombros a la grupa y vuelve a bajar) y el vientre es
   una curva (pecho profundo, cintura recogida). No hay mesetas rectas ni
   esquinas de rectángulo redondeado.
5. **Una sola silueta.** De perfil, el contorno exterior se lee como una sola
   línea continua del hocico a la punta de la cola: las patas se pierden bajo
   el pecho sin costuras y el cuello no tiene un corte de contorno.
6. **Sigue siendo Luna.** Orejas triangulares, bigotes, cola larga, Rayas de
   tabby: el redibujo no la convierte en otra cosa, y se lee igual sobre
   fondo claro y sobre fondo oscuro.
