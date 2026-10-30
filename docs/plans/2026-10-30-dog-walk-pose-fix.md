---
id: 2026-10-30-dog-walk-pose-fix
status: approved
created: 2026-10-30
size: M
visual: true
files:
  - src/assets/dog.js
  - src/styles/animations.css
  - test/pet-assets.test.js
  - docs/pet-screenshots/README.md
  - docs/pet-screenshots/dog-walk.png
acceptance:
  - "Visual — de perfil, la cola de Max al caminar nace de la grupa y se curva hacia arriba como la cola enroscada de un shiba: se lee como un gancho esbelto que sube por encima del lomo y ya no cae como una masa apoyada sobre la espalda; entre el rizo y el lomo queda aire (no se tocan)"
  - "Visual — el torso de Max al caminar tiene la línea de lomo y de vientre de un perro que camina y deja de verse como un bloque: el pecho es más hondo que la cintura, el lomo describe hombro → descenso hacia la plinga → grupa, y el vientre sube hacia la grupa dejando visible la curva de la cintura"
  - "Visual — la pose de caminar de Max se lee como una sola silueta continua: ni la cola, ni el torso, ni las patas se leen como piezas pegadas encima del cuerpo, sobre fondo claro y sobre fondo oscuro"
  - "El estilo cel-shading se mantiene: una sola tinta (#3B2416) en todos los trazos, sombras planas de dos tonos (#C97E22 sobre #F7B851, crema #FFF8EC / #E9CFA8), sin degradados ni url(#...) y con la paleta fija de la especie"
  - "La identidad shiba se mantiene: orejas triangulares erguidas, máscara crema, sin rayas en el lomo; la cabeza, el hocico y el ojo de perfil (ancla de pupila 48,66) no cambian"
  - "El cambio queda acotado a la pose de caminar de Max: las otras 5 poses de Max y las 6 de Luna quedan byte a byte idénticas (hash sha256 congelado en test/pet-assets.test.js)"
  - "La raíz de la cola sigue enterrada en la grupa (>= 6 px de profundidad y >= 5 px de envergadura), la cola sube >= 10 px por encima del punto más alto del torso y deja >= 5 px de aire entre el rizo y la línea del lomo en toda la banda del lomo"
  - "El torso tiene el pecho >= 8 px más hondo que la cintura y su línea de lomo no es plana (descenso >= 4 px entre el hombro y la plinga y ascenso final en la grupa)"
  - "Los pivotes de animación quedan sincronizados con la geometría nueva: el transform-origin inline de .anim-wag y de .pet-body en dogWalkSVG coincide con el de las reglas .walking-bob.dog-walk .anim-wag-fast y .dog-walk .pet-body de src/styles/animations.css"
  - "Los guards de arte existentes siguen verdes: silueta de un solo componente, plano de sombra dentro de su masa, cabeza superpuesta al cuerpo >= 8 px, patas delanteras sin doble línea contra el contorno del cuerpo, orden de pintado intacto"
  - "npm test y npm run check verdes, sin regresiones en la suite existente"
  - "docs/pet-screenshots/dog-walk.png está regenerada desde el SVG de producción (test/preview/pet-poses-capture.py) y docs/pet-screenshots/README.md documenta qué mirar en esta pose"
risks:
  - "Mover la geometria descuadra los pivotes de las animaciones CSS (transform-origin) y el guard de deriva CSS<->SVG lo detecta; mitigacion: actualizar en el mismo paso el valor inline del SVG y la regla que gana la cascada en el estado walk"
  - "El torso nuevo puede despegarse de las patas o de la cabeza (silueta partida, pata flotante, corte de contorno en el cuello); mitigacion: conservar las bases de las patas y el encuentro con la cabeza tal como están y dejar que los guards existentes (componentes de silueta, profundidad de encaje de la cabeza, doble línea de las patas) corten el intento"
  - "El plano de sombra es un polígono derivado del contorno viejo: al redibujar la forma, la sombra puede cruzar el contorno nuevo; mitigacion: recalcular la sombra dentro de la silueta nueva y dejar que el guard de sombra contenida lo cobre"
  - "La captura PNG depende de Playwright/Chromium en la maquina; mitigacion: es un paso aparte, aislado, y si el entorno no lo permite se deja la evidencia del paso 1 y se reporta el bloqueo en QA en vez de tocar el arte"
steps:
  - "Paso 1 — Redibujar la pose de caminar de Max (torso de perro en marcha + cola enroscada de shiba) y fijar la geometria con guards derivados, en src/assets/dog.js, src/styles/animations.css y test/pet-assets.test.js. (a) Escribir PRIMERO los tests nuevos en test/pet-assets.test.js (el paso arranca en rojo) reusando el helper test/helpers/cel-geometry.js (collectMasses, shapePolygons, transformPolys, pointInPolygon, polygonBBox, distanceToPolygonEdge): (i) 'dog walk: la cola nace de la grupa y se curva hacia arriba sin apoyarse en el lomo' — los puntos de la cola que caen dentro del torso están en el tercio trasero del torso (x >= minX + 0.62 * ancho), el punto más alto de la cola está >= 10 px por encima del punto más alto del torso, y en la banda del lomo (x entre minX + 0.30 * ancho y maxX - 10) todo punto de la cola visible (fuera del polígono del torso) queda >= 5 px por encima de la línea del lomo (topLine(x)); (ii) 'dog walk: el torso de Max al caminar tiene línea de lomo y de vientre de perro en marcha (no un bloque)' — profundidad del pecho (x en el tercio delantero) >= profundidad de la cintura (x en el tercio trasero-medio) + 8 px, el lomo desciende >= 4 px entre el hombro y la plinga y vuelve a subir en la grupa, y el vientre sube >= 8 px del pecho a la cintura; (iii) 'dog walk: el cambio está acotado a la pose de caminar de Max' — sha256 de las otras 11 poses de producción (las 6 de Luna + idle/sleep/sit/lay/stretch de Max) congelado, con comentario de que solo se actualiza cuando otro plan redibuje esa pose. Registrar la evidencia de rojo. (b) Redibujar en src/assets/dog.js, SOLO dentro del bloque 'const dogWalkSVG = ...': (i) torso .pet-body — perfil de perro en marcha, con la línea de lomo (hombro en x≈88-100 con y≈84-87, descenso a la plinga en x≈120-130 con y≈92-96, grupa de nuevo arriba en x≈146-158 con y≈86-92) y la línea de vientre (pecho en x≈60-75 con y≈138-142, vientre casi recto hasta x≈105, cintura que sube en x≈120-135 a y≈126-132, muslo que baja un poco en x≈148-156); el encuentro con la cabeza se conserva (la tinta de la cabeza debe quedar a <= 2 px del contorno del torso) y la grupa sigue cubriendo la raíz de la cola; (ii) cola .anim-wag — gancho enroscado de shiba que nace en la grupa (raíz en x≈148-158, y≈100-112, enterrada en el torso) y se curva hacia arriba con la punta por encima del lomo (punto más alto >= 10 px por encima del torso) y aire entre el rizo y la espalda; (iii) recalcular el cel-shadow del torso, el parche crema del pecho (#FFF8EC, sin contorno propio) y el cel-shadow de la cola para que sigan el contorno nuevo (planos planos, sin trazo, dentro de la silueta, luz desde arriba-izquierda); (iv) actualizar el transform-origin inline de los grupos .anim-wag (raíz de la cola) y .pet-body (centro del torso nuevo) y, en src/styles/animations.css, las reglas '.walking-bob.dog-walk .anim-wag-fast' y '.dog-walk .pet-body' con los mismos valores. No tocar la cabeza, las patas, la sombra de piso, el orden de pintado ni el resto del archivo; no tocar cat.js ni las demás poses de Max. (c) Registrar la evidencia de verde con npm test y npm run check"
  - "Paso 2 — Evidencia visual de la pose nueva de Max al caminar: regenerar docs/pet-screenshots/dog-walk.png desde los SVG de producción con 'python test/preview/pet-poses-capture.py --only dog-walk' (si falta Playwright: 'python -m pip install playwright' y 'python -m playwright install chromium'), actualizar la fila de dog-walk de la tabla de docs/pet-screenshots/README.md para que diga qué mirar (cola que nace de la grupa y se enrosca hacia arriba sin apoyarse en el lomo, pecho más hondo que la cintura, silueta única) y extender en test/pet-assets.test.js el test del README de capturas para que verifique que esa fila documenta los criterios visuales de la pose de caminar de Max. Comprobar que el PNG cambió (diff binario) y que muestra la cola y el torso nuevos sobre fondo claro y sobre fondo oscuro"
---

# Plan: corregir la pose de caminar de Max (torso y cola)

> **Status**: Approved
> **Fecha**: 2026-10-30
> **Size**: M
> **Visual**: sí (el juicio final es del revisor visual sobre `docs/pet-screenshots/dog-walk.png`)

---

## 1. Goal

Que la pose de caminar de Max (`dogWalkSVG` en `src/assets/dog.js`) deje de leerse
como un bloque con una masa de pelo encima:

1. **La cola** nace de la grupa y se curva hacia arriba como la cola enroscada de
   un shiba, sin apoyarse ni pegarse sobre el lomo.
2. **El torso** tiene la línea de lomo y de vientre de un perro que camina
   (pecho más hondo, cintura más fina hacia la grupa), no un rectángulo.

Se mantiene: el estilo cel-shading actual (contorno de tinta único, sombras
planas de dos tonos), la identidad shiba (orejas triangulares erguidas, máscara
crema, sin rayas en el lomo), las otras 5 poses de Max, las 6 poses de Luna y
la superficie de exports de `src/assets/dog.js`.

---

## 2. Diagnóstico (qué está roto hoy)

`src/assets/dog.js`, bloque `const dogWalkSVG` (líneas ~112-216):

| Masa | `d` actual | Problema |
|---|---|---|
| Cola `.anim-wag` | `M 138,116 C 154,109 167,95 165,80 C 163,66 151,57 139,61 C 129,64 127,76 138,80 C 145,83 149,90 146,98 C 143,106 139,112 137,116 Z` | El rizo (x 127-167, y 57-116) cae en la zona de la grupa: se lee como una masa apoyada sobre el lomo en vez de una cola que sube. |
| Torso `.pet-body` | `M 56,110 C 53,95 66,85 86,85 C 108,85 133,87 147,94 C 159,100 161,114 153,124 C 144,135 128,140 110,142 C 98,143 90,143 84,142 C 76,140 66,139 60,133 C 56,127 56,118 56,110 Z` | Lomo plano de `x=86` a `x=133` (y≈85-87) y vientre más hondo en el medio (y=142 en x 84-110) que en el pecho (y=133 en x=60): el bloque es un rectángulo y el pecho no es más hondo que la cintura. |

Pivotes actuales que hay que re-sincronizar al mover la geometría:

- `src/assets/dog.js`: `.anim-wag` inline `transform-origin: 140px 108px`,
  `.pet-body` inline `transform-origin: 106px 112px`.
- `src/styles/animations.css`: `.walking-bob.dog-walk .anim-wag-fast` (140px 108px
  `!important`) y `.dog-walk .pet-body` (106px 112px). Son las reglas que ganan
  la cascada en el estado walk, y el guard de deriva CSS↔SVG las compara con
  los valores inline del SVG.

---

## 3. Geometría objetivo (anclas aproximadas, el implementador ajusta)

**Torso** (perfil, cabeza a la izquierda):

- Encuentro con la cabeza: el borde superior arranca pegado a la tinta de la
  cabeza (≤ 2 px) — el guard "la cabeza se superpone al cuerpo" exige ≤ 2 px.
- Línea de lomo: hombro en `x≈88-100, y≈84-87` → descenso a la plinga en
  `x≈120-130, y≈92-96` → grupa de nuevo arriba en `x≈146-158, y≈86-92` → la grupa
  baja hasta la base de la cola (`x≈150-160, y≈100-112`).
- Línea de vientre: pecho (lo más bajo del cuerpo) en `x≈60-75, y≈138-142` →
  vientre casi recto hasta `x≈105` → cintura que **sube** en `x≈120-135` a
  `y≈126-132` → muslo que baja un poco en `x≈148-156, y≈128-136`.
- La grupa debe seguir cubriendo la raíz de la cola (guard existente: ≥ 6 px de
  profundidad y ≥ 5 px de envergadura del enlace cola↔torso).

**Cola** (gancho enroscado de shiba):

- Raíz en la grupa: `x≈148-158, y≈100-112`, enterrada en el torso.
- Sube hacia atrás y arriba; el punto más alto de la cola queda ≥ 10 px por
  encima del punto más alto del torso.
- En la banda del lomo (desde el 30 % del ancho del torso hasta `maxX - 10`),
  todo punto de la cola que se ve queda ≥ 5 px por encima de la línea del lomo:
  queda aire entre el rizo y la espalda.
- No toca la cabeza ni las orejas (x ≥ 140) ni sale del `viewBox` 0..200.

---

## 4. Contratos que no se pueden romper

| Contrato | Test que lo cubre |
|---|---|
| Una sola tinta `#3B2416`; paleta fija de la especie; sin degradados | `cel: ...` en `test/pet-assets.test.js` |
| 1 `cel-outline` + ≥ 1 `cel-shadow` por masa; sombra dentro del contorno | `cel: cada masa tiene su cel-outline...`, `cel: ningun plano de sombra cruza...` |
| Silueta de la pose = 1 componente (nada flotando) | `cel: cada pose se lee como una sola silueta` |
| Base de la cola enterrada en la grupa (≥ 6 px / ≥ 5 px) | `cel: la base de la cola se esconde bajo la grupa` |
| Cabeza superpuesta al cuerpo ≥ 8 px y sin corte de contorno | `cel: la cabeza se superpone al cuerpo` |
| Patas delanteras sin doble línea contra el torso | `cel: las patas delanteras no repiten el contorno del cuerpo` |
| Orden de pintado sombra → cola → patas traseras → torso → patas delanteras → cabeza | `guard de deriva: la sombra de piso...` |
| Ancla de pupila de perfil (48, 66) | `dog walk SVG: anchor en (48, 66)` |
| Alias walk1-4 = walk, walkFrames = [walk]; superficie de exports | `assets: la superficie de exports...` |
| transform-origin CSS == inline del SVG (12 poses) | `guard de deriva: el pivote que gana el CSS...` |

Fuera de alcance: `src/assets/cat.js`, las poses idle/sleep/sit/lay/stretch de
Max, el CSS de la marcha de Luna, la cámara PixiJS y los estados de ánimo.

---

## 5. Evidencia

- `npm test` y `npm run check` verdes tras cada paso.
- En el paso 1 se registra la evidencia de **rojo** (los tests nuevos fallan
  contra el arte actual) y de **verde** (pasan con el arte nuevo) en el mismo
  paso: test e implementación van juntos.
- El paso 2 deja `docs/pet-screenshots/dog-walk.png` regenerada desde el SVG
  de producción, que es lo que mira el revisor visual contra los criterios
  visuales de la acceptance.
