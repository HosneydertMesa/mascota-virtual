---
id: 2026-10-30-dog-walk-torso-round2
status: approved
created: 2026-10-30
size: M
visual: true
files:
  - src/assets/dog.js
  - test/pet-assets.test.js
  - docs/pet-screenshots/README.md
  - docs/pet-screenshots/dog-walk.png
acceptance:
  - "Visual — de perfil, el vientre de Max al caminar es una sola curva continua desde el pecho hasta la ingle: el contorno inferior baja suave desde el pecho y sube hacia las patas traseras sin ningun escalon con borde duro justo delante de las patas traseras; no se lee como una costura de pieza pegada bajo el cuerpo"
  - "Visual — la sombra plana del vientre acompana esa curva: la banda de sombra del bajo del cuerpo es continua y no termina en un gancho ni en una punta hacia arriba delante de las patas traseras"
  - "Visual — la linea del lomo de Max al caminar es casi recta o con una curva muy leve, sin joroba: la espalda no se hunde y vuelve a subir sobre la grupa y la grupa no queda por encima de la plinga"
  - "Visual — la pose de caminar de Max se sigue leyendo como un shiba en marcha de una sola pieza: la cola enroscada que nace de la grupa (sin cambios), el pecho mas hondo que la cintura, la cabeza y el hocico de perfil sin cambios, y ninguna costura ni doble linea en el bajo del cuerpo"
  - "El vientre del torso solo sube desde su punto mas bajo hasta la ingle (nunca vuelve a bajar): la muesca y el gancho delante de las patas traseras desaparecieron"
  - "La linea del lomo no sube en ningun punto entre el hombro y la grupa y su desnivel total en ese tramo es <= 7 px"
  - "La sombra plana del vientre no forma ninguna punta: su borde superior no queda mas de 3 px por encima del promedio de sus vecinas en el tramo del vientre"
  - "La cola de Max al caminar no cambia (mismo path y mismo pivote 152px 106px) y las otras 5 poses de Max y las 6 de Luna siguen byte a byte identicas (hashes sha256 congelados en test/pet-assets.test.js)"
  - "Los guards de arte existentes siguen verdes: sombra contenida en la silueta, 1 componente de silueta, cabeza superpuesta al cuerpo (>= 8 px de encaje, hueco <= 2 px), patas delanteras sin doble linea, base de la cola enterrada en la grupa (>= 6 px y >= 5 px de envergadura), cola con >= 5 px de aire sobre el lomo, y pata delantera lejana pegada al vientre (sin cuna de fondo)"
  - "El estilo cel-shading se mantiene: una sola tinta #3B2416, sombras planas de dos tonos (#C97E22 sobre #F7B851, crema #FFF8EC / #E9CFA8), sin degradados ni url(#...), paleta fija de la especie e identidad shiba"
  - "npm test y npm run check verdes, sin regresiones en la suite existente"
  - "docs/pet-screenshots/dog-walk.png esta regenerada desde el SVG de produccion (test/preview/pet-poses-capture.py) y la fila de dog-walk de docs/pet-screenshots/README.md dice que hay que mirar el vientre de una sola curva, la sombra sin gancho y el lomo casi recto sin joroba"
risks:
  - "El guard de la ronda 1 'el torso ... tiene linea de lomo y de vientre de perro en marcha' exige hoy que el lomo descienda >= 4 px del hombro a la plinga Y vuelva a subir en la grupa: eso es exactamente la joroba que esta ronda elimina; mitigacion: ese test se modifica (no se borra) y el criterio de acceptance de la ronda 1 que lo respaldaba queda Explicitamente superado por este plan"
  - "Bajar o subir el hombro abre un corte de contorno en el cuello (la tinta de la cabeza esta en y=84.6..86.4 entre x=91..107 y el guard exige un hueco <= 2 px); mitigacion: el lomo arranca en el hombro (86,85) como hoy y solo se aplana hacia atras; si el implementer baja el hombro, el guard de la cabeza lo corta"
  - "El vientre tiene que seguir tapando el canto de la pata delantera lejana (canto 139..141 entre x=88..106) mientras sube hacia la ingle: si el vientre sube antes de x=107 aparece una cuna de fondo entre la pata y el cuerpo; mitigacion: el tramo plano en y=142 hasta x~107 se conserva y el guard 'la pata delantera lejana queda pegada al vientre' lo cubre"
  - "El plano de sombra del torso es un poligono derivado del contorno viejo: al cambiar el vientre puede cruzar el contorno nuevo o dejar el gancho; mitigacion: el plano se recalcula sobre la silueta nueva y lo cubren el guard de sombra contenida y el guard nuevo del gancho"
  - "La captura PNG depende de Playwright/Chromium en la maquina; mitigacion: es un paso aparte, aislado, y si el entorno no lo permite se deja la evidencia del paso 1 y se reporta el bloqueo en QA en vez de tocar el arte"
steps:
  - "Paso 1 — Corregir el torso de la pose de caminar de Max (vientre de una sola curva + lomo casi recto sin joroba) y fijar la geometria con guards derivados, en src/assets/dog.js y test/pet-assets.test.js. (a) Escribir PRIMERO los tests (el paso arranca en rojo) en test/pet-assets.test.js, reusando los helpers que ya estan en ese archivo (massOutlinePolys, massFilledPolys, topLineAt, bottomLineAt, polysBBox, flatTopSpan) y test/helpers/cel-geometry.js: (i) MODIFICAR el test 'dog walk: el torso de Max al caminar tiene linea de lomo y de vientre de perro en marcha (no un bloque)' (que pasa a llamarse 'dog walk: el torso de Max al caminar tiene lomo casi recto (sin joroba) y vientre de perro en marcha (no un bloque)'): se conservan intactas las aserciones de pecho/cintura (pecho >= 8 px mas hondo que la cintura; vientre subiendo >= 8 px del pecho a la cintura) y se REEMPLAZAN las dos aserciones del lomo (descenso >= 4 px del hombro a la plinga y ascenso final en la grupa, que son justamente la joroba que hay que quitar) por dos nuevas: (1) el lomo NO SUBE: recorriendo con topLineAt en pasos de 0.5 px desde el hombro (minX + 0.30*ancho) hasta la grupa (minX + 0.85*ancho), la y nunca queda mas de 1 px por encima del maximo ya alcanzado hasta ese punto; (2) el desnivel total del lomo en ese tramo es <= 7 px (lomo casi recto). Con el arte actual (hombro 85 -> plinga 93 -> grupa 87.5) este test tiene que fallar por (1). (ii) test NUEVO 'dog walk: el vientre es una sola curva continua (sin escalon ni gancho delante de las patas traseras)': medir con bottomLineAt la linea del vientre en pasos de 0.5 px; el punto mas bajo es el mas a la derecha de la meseta mas baja (xDeep) y, desde xDeep hasta la ingle (minX + 0.78*ancho), la y del vientre NUNCA vuelve a subir (se tolera 0.5 px entre muestras consecutivas: el vientre solo sube), y ademas el vientre sube >= 8 px entre xDeep y la ingle. Con el arte actual falla: el vientre sube a y=129 en x=129 y vuelve a caer a ~132.5 en x=137 (el gancho). (iii) test NUEVO 'dog walk: la sombra plana del vientre no forma un gancho': medir el borde superior u(x) del plano cel-shadow del torso (el min y del plano en cada x, paso 0.5 px) en el tramo del vientre (desde xDeep - 10 hasta la ingle) y exigir que no haya ninguna punta: u(x) >= (u(x-8) + u(x+8))/2 - 3 px para todo x del tramo. Con el arte actual falla en x~122 (la punta del gancho esta 6-7 px por encima del promedio de sus vecinas). (iv) NO se tocan los demas guards ni el arte de la cola, la cabeza, las patas o el gato: se conservan tal cual 'dog walk: la cola nace de la grupa y se curva hacia arriba sin apoyarse en el lomo', 'dog walk: la pata delantera lejana queda pegada al vientre (sin cuna de fondo)', 'dog walk: el cambio esta acotado a la pose de caminar de Max' (hashes congelados de las otras 11 poses) y todos los guards globales de cel-shading. Registrar la evidencia de rojo (los tres guards nuevos/modificados fallan contra el arte actual) y, al cerrar el paso, la de verde. (b) Redibujar SOLO dentro de 'const dogWalkSVG = ...' en src/assets/dog.js y SOLO el torso .pet-body (su cel-outline y su cel-shadow), tomando como referencia la geometria objetivo del §3 de este plan: (i) contorno de arriba (lomo): desde el hombro (86,85) la linea dorsal baja MUY poco y sigue casi recta hasta la grupa (124,88.5) -> (153,91); el punto mas alto del torso sigue siendo el hombro y la grupa NO queda por encima de la plinga; (ii) borde de la grupa: (153,91) -> (162,104) -> (151,126), con el mismo ancho que antes, para no destapar la raiz de la cola (guard de raiz de cola y de aire sobre el lomo); (iii) borde de abajo (vientre): UNA sola curva continua desde el pecho hasta la ingle, sin esquinas ni reversos: pecho (57,127) -> vientre plano en y=142 entre x~97 y x~70 (este tramo plano es el que tapa el canto de la pata delantera lejana: NO subirlo antes de x=107) -> desde ahi la curva sube sin cambios de direccion hasta la ingle (133,130.5) -> bajo del muslo (151,126); la clave es que la curva del vientre sea MONOTONA desde xDeep hasta la ingle y que el empalme con el tramo plano (x~110) no tenga un cambio de direccion visible; (iv) el plano de sombra (cel-shadow) se recalcula sobre el contorno nuevo: la banda del vientre sigue al contorno nuevo (1.5-3 px por dentro), su borde superior es una linea suave que sube con el vientre (sin la punta de x~122) y el plano sigue DENTRO de la silueta (guard 'cel: ningun plano de sombra cruza el contorno'); (v) el d de la cola, de la cabeza y de las patas queda byte a byte igual, y el pivote del torso (inline 108px 113px en el SVG y .dog-walk .pet-body en src/styles/animations.css) no se mueve porque el centro del torso sigue ahi: si el implementer llegara a moverlo tiene que actualizar LAS DOS copias en el mismo commit (guard de deriva de pivotes)."
  - "Paso 2 — Evidencia visual de la ronda 2: regenerar docs/pet-screenshots/dog-walk.png desde los SVG de produccion con 'python test/preview/pet-poses-capture.py --only dog-walk' (si falta Playwright: 'python -m pip install playwright' y 'python -m playwright install chromium'), actualizar la fila de dog-walk de la tabla de docs/pet-screenshots/README.md para que diga que hay que mirar el vientre de una sola curva (sin escalon delante de las patas traseras), la sombra plana del vientre sin gancho y el lomo casi recto sin joroba (ademas de lo que ya decia de la cola, el pecho y la pata delantera lejana), y extender en test/pet-assets.test.js el test 'README de capturas: la fila de dog-walk documenta los criterios visuales de la pose de caminar de Max' con las palabras clave nuevas (vientre, una sola curva, sin escalon, sin gancho, lomo, recto, joroba). Comprobar que el PNG cambio (diff binario) y que muestra el torso nuevo sobre fondo claro y sobre fondo oscuro."
---

# Plan: segunda ronda sobre la pose de caminar de Max (torso)

> **Status**: Approved
> **Fecha**: 2026-10-30
> **Size**: M
> **Visual**: sí (el juicio final es del revisor visual sobre `docs/pet-screenshots/dog-walk.png`)

---

## 1. Goal

Que el torso de Max al caminar (`dogWalkSVG` en `src/assets/dog.js`) deje de
leerse como un bloque con un escalón pegado debajo:

1. **El vientre** es una sola curva continua desde el pecho hasta la ingle,
   subiendo suave hacia las patas traseras. Hoy hace un escalón con borde duro
   justo delante de las patas traseras y la sombra plana del vientre termina en
   un gancho: se lee como una costura de pieza pegada.
2. **El lomo** es casi recto (o con una curva muy leve), sin joroba. Hoy se
   hunde a la plinga y vuelve a subir sobre la grupa.

La cola ya está bien y **no se toca**: nace de la grupa y se enrosca hacia
arriba. Tampoco se tocan las otras 5 poses de Max, las 6 poses de Luna, la
cámara PixiJS ni el CSS de la marcha.

---

## 2. Diagnóstico (qué está roto hoy, con números)

`src/assets/dog.js`, bloque `const dogWalkSVG` (líneas ~144-154), masa
`.pet-body`:

```svg
<!-- contorno actual -->
d="M 56,108 C 54,96 66,85 86,85 C 100,85 112,89 122,93 C 130,96 134,94 140,90
   C 145,87 151,86 157,88 C 162,92 163,100 161,108 C 159,118 154,126 146,131
   C 141,135 135,132 129,129 C 125,129 121,131 117,136 C 114,140 111,142 107,142
   C 100,142 90,142 78,142 C 70,142 62,138 58,130 C 55,123 54,115 56,108 Z"

<!-- sombra plana actual -->
d="M 159,107 C 159,117 153,126 146,130 C 141,131 135,130 129,127.7 C 125,127.7
   121,129 117,134.7 C 114,138.7 111,140.7 107,140.7 C 100,140.7 90,140.7 78,140.7
   C 70,140 63,136 59,129.5 C 62,133 70,136 78,136 C 88,136 96,136 104,135.5
   C 110,135 115,130 119,124.5 C 122,120 124,121 126,122 C 133,125 140,129 146,125
   C 151,121 156,113 157,105 Z"
```

**Defecto 1 — el vientre se quiebra y la sombra se engancha.**

- El borde inferior va `(146,131) → (129,129) → (117,136) → (107,142)`: en
  `x=129` el vientre **sube** a `y=129` y enseguida **vuelve a caer** a
  `y≈132.5` (en `x=137`). Ese pico es el "escalón con borde duro" y esta justo
  delante de las patas traseras (la pata trasera delantera arranca en `x=126`).
- El borde superior de la sombra plana hace lo mismo y peor: de `(104,135.5)`
  sube hasta la punta `(122,120)` y luego baja a `(126,122) → (146,125)`. Esa
  punta es el **gancho**: una cuña de sombra de ~11 px metida en el cuerpo
  justo donde el vientre tiene su muesca. Los dos defectos juntos se leen
  como una pieza pegada bajo el lomo.

**Defecto 2 — el lomo tiene joroba.**

- El lomo va `(86,85) → (122,93) → (140,90) → (157,88)`: hunde 8 px a la
  plinga y **vuelve a subir 5.5 px** en la grupa. La grupa queda 5.5 px por
  encima de la plinga: se lee como una joroba sobre el lomo.

**Conflicto con un guard de la ronda 1 (importante).** El test
`dog walk: el torso de Max al caminar tiene linea de lomo y de vientre de
perro en marcha (no un bloque)` exige hoy que el lomo **descienda >= 4 px** del
hombro a la plinga **y vuelva a subir >= 2 px** en la grupa, y el acceptance de
`docs/plans/2026-10-30-dog-walk-pose-fix.md` (línea 21) dice lo mismo
("descenso >= 4 px entre el hombro y la plinga y ascenso final en la grupa").

Eso **es** la joroba. Esta ronda **supera** ese criterio: el lomo nuevo no
sube en ningun punto. El test se MODIFICA (no se borra): se conservan sus
aserciones de pecho/cintura y se reemplazan las dos del lomo por el contrato
nuevo (§4).

---

## 3. Geometría objetivo (anclas; el implementador ajusta hasta que los guards den)

Solo cambian el `cel-outline` y el `cel-shadow` del torso `.pet-body` de
`dogWalkSVG`. Referencia (orientativa, ±2 px):

```svg
<!-- contorno -->
M 56,108
C 54,97 66,86 86,85            # pecho -> hombro (IGUAL que hoy: el cuello no se toca)
C 101,85 113,87 124,88.5        # lomo: descenso muy leve (3.5 px en 38 px)
C 135,89.5 145,90 153,91        # lomo: casi recto hasta la grupa
C 159,92 162,97 162,104         # grupa: borde trasero (mismo ancho que hoy)
C 162,113 158,122 151,126       # grupa: baja al muslo
C 145,128.5 139,130 133,130.5   # bajo del muslo -> ingle (monotono)
C 126,132 119,137 110,140.5     # vientre subiendo (monotono, sin esquinas)
C 106,141.8 103,142 97,142      # empalme con el tramo plano (tangente ~horizontal)
C 85,142 76,142 69,140          # vientre plano
C 62,138 57.5,133 56.3,127      # pecho
C 55,120 54,113 56,108 Z

<!-- sombra plana: la banda sigue al contorno nuevo (1.5-3 px por dentro) -->
M 160,103
C 160,112 156,120 150,124
C 144,126.5 138,128 132,128.5
C 125,130 118,135 109,138.5
C 105,139.8 102,140 96,140
C 88,140 79,140 70,138
C 63,136 59,132 57.5,126
C 61,131 68,134.5 76,135.5      # borde superior: suave, SIN punta
C 88,136 98,135.5 107,134.5
C 116,133 125,129 134,125
C 142,121.5 149,118 154,112
C 157,108 159,105 160,103 Z
```

Condiciones que la referencia cumple y que el implementador debe respectar:

| Condición | Por qué |
|---|---|
| El hombro sigue en `(86,85)` y el lomo entre `x=86..107` no baja de `y=87` | La tinta del cuello de la cabeza esta en `y=84.6..86.4` entre `x=91..107`: si el lomo baja, aparece un corte de contorno en el cuello (guard `la cabeza se superpone al cuerpo`, hueco <= 2 px). |
| El punto mas alto del torso sigue siendo el hombro (`y≈85`) | El guard de la cola exige que la cola visible quede >= 5 px por encima de la linea del lomo en la banda `x∈[minX+0.30·ancho, maxX-10]`. |
| El borde de la grupa mantiene el mismo ancho (`(153,91) → (162,104) → (151,126)`) | La raiz de la cola tiene que seguir enterrada en la grupa (>= 6 px de profundidad, >= 5 px de envergadura). |
| El vientre es plano en `y=142` entre `x≈70` y `x≈107` | Es lo que hace que la pata delantera lejana (canto `139..141` entre `x=88..106`) quede tapada por el cuerpo (sin cuna de fondo). El vientre NO puede empezar a subir antes de `x≈107`. |
| Del punto mas bajo a la ingle el vientre solo sube | Es el contrato nuevo: una sola curva continua, sin muesca ni gancho. |
| La cola, la cabeza, las patas y el gato no se tocan | Fuera de alcance de esta ronda. |
| El pivote del torso no se mueve (`108px 113px` inline y en `.dog-walk .pet-body`) | El centro del torso sigue ahi; si se mueve, hay que actualizar las DOS copias (guard de deriva de pivotes). |

---

## 4. Contratos (guards)

### 4.1 Se modifican

| Guard | Cambio |
|---|---|
| `dog walk: el torso de Max al caminar tiene linea de lomo y de vientre de perro en marcha (no un bloque)` → `... tiene lomo casi recto (sin joroba) y vientre de perro en marcha (no un bloque)` | Se conservan `chestDepth >= waistDepth + 8` y `chestBelly - waistBelly >= 8`. Se **reemplazan** las dos aserciones del lomo por: (a) el lomo **no sube** entre el hombro (`minX + 0.30·ancho`) y la grupa (`minX + 0.85·ancho`): la `y` de `topLineAt` nunca queda > 1 px por encima del maximo ya alcanzado; (b) el desnivel total del lomo en ese tramo es <= 7 px. Con el arte actual falla por (a) (la grupa queda 5.5 px por encima de la plinga). |

### 4.2 Se anaden

| Guard | Que mide |
|---|---|
| `dog walk: el vientre es una sola curva continua (sin escalon ni gancho delante de las patas traseras)` | `bottomLineAt` cada 0.5 px. `xDeep` = punto mas a la derecha de la meseta mas baja. De `xDeep` hasta la ingle (`minX + 0.78·ancho`) la `y` del vientre nunca vuelve a subir (tolerancia 0.5 px entre muestras) y ademas sube >= 8 px. Con el arte actual falla (sube a 129 en `x=129` y vuelve a caer a ~132.5 en `x=137`). |
| `dog walk: la sombra plana del vientre no forma un gancho` | Borde superior `u(x)` del `cel-shadow` del torso (min `y` del plano en cada `x`, paso 0.5 px) en `[xDeep - 10, ingle]`: `u(x) >= (u(x-8) + u(x+8))/2 - 3 px` para todo `x`. Con el arte actual falla en `x≈122` (la punta esta 6-7 px por encima del promedio de sus vecinas). |

### 4.3 No se tocan (tienen que seguir verdes)

- `dog walk: la cola nace de la grupa y se curva hacia arriba sin apoyarse en el lomo`
- `dog walk: la pata delantera lejana queda pegada al vientre (sin cuna de fondo)`
- `dog walk: el cambio esta acotado a la pose de caminar de Max` (sha256 de las
  otras 11 poses)
- `cel: ningun plano de sombra cruza el contorno de la masa que sombrea`
- `cel: cada pose se lee como una sola silueta`
- `cel: las patas delanteras no repiten el contorno del cuerpo`
- `cel: la base de la cola se esconde bajo la grupa`
- `cel: la cabeza se superpone al cuerpo`
- `guard de deriva: el pivote que gana el CSS coincide con el transform-origin inline del SVG`
- `guard de deriva: la sombra de piso sigue siendo el primer elemento y el orden de pintado no se movio`
- `README de capturas: la fila de dog-walk documenta los criterios visuales de la pose de caminar de Max` (se **extiende** en el paso 2, no se borra)

---

## 5. Evidencia

- `npm test` y `npm run check` verdes tras cada paso.
- En el paso 1 se registra la evidencia de **rojo** (los tres guards
  nuevos/modificados fallan contra el arte actual) y de **verde** (pasan con
  el torso nuevo) en el mismo paso: test e implementación van juntos.
- El paso 2 deja `docs/pet-screenshots/dog-walk.png` regenerada desde el SVG
  de produccion, que es lo que mira el revisor visual contra los criterios
  visuales de la acceptance.

---

## 6. Fuera de alcance

`src/assets/cat.js`, las poses idle/sleep/sit/lay/stretch de Max, el CSS de la
marcha de Luna, la camara PixiJS, los estados de animo y la cola de Max (ya
esta bien y no se toca).
