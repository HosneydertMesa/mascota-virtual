---
id: 2026-10-27-cel-shading-mascot-redesign
status: approved
created: 2026-10-27
size: L
visual: true
files:
  - src/assets/cat.js
  - src/assets/dog.js
  - src/styles/animations.css
  - test/pet-assets.test.js
  - test/preview/pet-poses-preview.html
  - test/preview/pet-poses-capture.py
  - docs/pet-screenshots/README.md
acceptance:
  - "Ninguna de las 12 poses de produccion usa linearGradient, radialGradient, <stop> ni url(#...): el sombreado es plano, no degradado"
  - "Cada pose usa una sola tinta de contorno por especie, con peso de linea de silueta >= 3px (contorno marcado) y detalle interior entre 1.5 y 2.1px"
  - "Cada masa (cola, 4 patas, cuerpo, cabeza) tiene exactamente una silueta cel-outline y al menos una sombra plana cel-shadow sin trazo, con colores tomados de la paleta fija de la especie"
  - "De frente, Luna y Max se leen como un gato y un perro: cabeza grande tipo anime (~55% del alto), ojos grandes con doble brillo, orejas y cola expresivas"
  - "De perfil (poses de caminar), el contorno exterior se lee como una sola silueta continua: ninguna pata, la cola ni la cabeza se leen como piezas pegadas encima del cuerpo"
  - "La sombra plana de cada masa cae abajo-derecha (luz desde arriba-izquierda) y no cruza el contorno de la masa"
  - "No hay costuras rectas: el borde superior de cada pata delantera continua la curva del vientre, y la base de la cola y de la cabeza se esconden bajo el cuerpo"
  - "getCatPartsForState y getDogPartsForState siguen devolviendo, para los 6 estados, un arreglo de objetos con las 7 ranuras de partes (head, body, tail, backLegLeft, backLegRight, frontLegLeft, frontLegRight) y body con viewBox 0 0 200 200"
  - "La superficie de exports de src/assets/cat.js y src/assets/dog.js no cambia (idle/walk/walk1-4/walkFrames/sleep/sit/sitBlink/lay/layBreathe/stretch/catSVG/getCatPartsForState)"
  - "Cada pose conserva su conteo de pupilas (2 de frente, 1 de perfil, 0 dormida) y cada ancla cae dentro del iris de su ojo"
  - "El orden de pintado se mantiene: sombra -> cola -> patas traseras -> cuerpo -> patas delanteras -> cabeza, con las 4 patas como <g> hermanos"
  - "El transform-origin de cada regla de animations.css coincide con el transform-origin inline del grupo SVG correspondiente en las 12 poses (cola, cuerpo y cabeza en los 6 estados; patas en walk y sit)"
  - "npm test y npm run check verdes, sin regresiones en las ~900 pruebas existentes"
  - "Existe una pagina de preview con las 12 poses y capturas PNG en docs/pet-screenshots/ para la revision visual"
risks:
  - "El arte a mano es el punto de falla: un redibujo puede romper el encaje de las patas y devolver el efecto 'piezas pegadas'. Mitigacion: reglas de encaje explicitas + revision visual con capturas en QA"
  - "Mover la geometria descuadra los pivotes de las animaciones CSS (transform-origin). Mitigacion: guard derivado CSS<->SVG en el paso 4 y reglas por estado"
  - "Un SVG con <defs>/gradientes es un contrato de test fragil si se reescribe a medias. Mitigacion: los tests de contrato cel se activan pose por pose, nunca todos de golpe"
steps:
  - "Paso 1 — Vocabulario cel-shading + poses idle de referencia (Luna y Max): reescribir catIdleSVG y dogIdleSVG en src/assets/cat.js y src/assets/dog.js con contorno marcado (cel-outline 3.2-3.6px), sombras planas de dos tonos (cel-shadow), paleta fija por especie y encaje organico de patas/cabeza/cola; actualizar en src/styles/animations.css los transform-origin de las reglas idle de gato y perro a la geometria nueva; en test/pet-assets.test.js actualizar los anchors idle y anadir los tests de superficie de exports, contrato de partes Pixi (7 ranuras) y contrato cel aplicado a las 2 poses idle, registrando evidencia de rojo y de verde en el mismo paso"
  - "Paso 2 — Gato: reescribir en src/assets/cat.js las poses walk, sleep, sit, lay y stretch de Luna aplicando el mismo vocabulario (el perfil de walk es la prueba dura del encaje: una sola silueta continua); actualizar en src/styles/animations.css los pivotes de walk y sit del gato y anadir las reglas por estado sleeping/laying/stretching de cola, cuerpo y cabeza; en test/pet-assets.test.js actualizar los anchors del gato y extender el contrato cel a las 6 poses del gato, con evidencia de rojo y de verde"
  - "Paso 3 — Perro: reescribir en src/assets/dog.js las poses walk, sleep, sit, lay y stretch de Max con el mismo vocabulario pero geometria propia de shiba (orejas caidas, hocico, cola en sable); actualizar en src/styles/animations.css los pivotes de walk, sit y por estado del perro; en test/pet-assets.test.js actualizar los anchors del perro y extender el contrato cel a las 6 poses del perro, con evidencia de rojo y de verde"
  - "Paso 4 — Guard de deriva pivote CSS <-> geometria SVG (12 poses): en test/pet-assets.test.js reemplazar las aserciones literales de transform-origin por un test derivado que compara el transform-origin de cada regla de animations.css con el transform-origin inline del grupo SVG equivalente en las 12 poses (cola, cuerpo y cabeza en los 6 estados; patas en walk y sit), y verificar que la sombra de piso sigue siendo el primer elemento y que el orden de pintado no se movio"
  - "Paso 5 — Preview de las 12 poses + capturas para la revision visual: crear test/preview/pet-poses-preview.html con un grid de las 12 poses de produccion sobre fondo claro y oscuro con etiquetas, test/preview/pet-poses-capture.py que guarde un PNG por pose en docs/pet-screenshots/ siguiendo el patron de walk-cycle-capture.py, y docs/pet-screenshots/README.md con el indice de capturas y el comando para regenerarlas"
---

# Plan: rediseño cel-shading de las mascotas (Luna y Max)

> **Status**: Approved
> **Fecha**: 2026-10-27
> **Size**: L
> **Stack**: JavaScript puro + SVG inline + PixiJS v8 (dormido) + Electron

---

## 1. Goal

Rediseñar el aspecto visual de las dos mascotas (`src/assets/cat.js`,
`src/assets/dog.js`) con estilo de **ilustración de videojuego cel-shading**:

- **contorno marcado** (línea de tinta gruesa y consistente sobre la silueta),
- **sombras planas de dos tonos** (un solo tono de sombra por masa, sin degradados),
- **proporciones expresivas tipo arte oficial/anime** (cabeza grande, ojos grandes),
- y que se lean como **animales enteros**, no como un ensamblaje de piezas pegadas.

Se mantiene intacto: la arquitectura por partes de PixiJS, las animaciones
CSS, los estados de ánimo y el contrato con el resto de la app.

---

## 2. Estado actual (diagnóstico)

### 2.1 Lo que hay hoy

`src/assets/cat.js` y `src/assets/dog.js` exportan 6 poses de producción por
especie (idle, walk, sleep, sit, lay, stretch) más alias (walk1–4, sitBlink,
layBreathe). Cada pose es un `<svg viewBox="0 0 200 200">` completo con 7
masas como `<g>` hermanos:

```
pet-shadow → .anim-wag (cola) → .back-foot-left → .back-foot-right
           → .pet-body → .left-paw → .right-paw → .pet-head
```

El runtime activo es el **path DOM** (`PetViewport` inyecta el SVG con
`innerHTML` en `#pet-svg-wrapper`) y el movimiento lo manejan las keyframes de
`src/styles/animations.css`. El renderer PixiJS (`src/pet-renderer-pixi.js`)
existe pero **no está cargado en `src/index.html`**; su API de partes
(`getCatPartsForState` / `getDogPartsForState`) es el contrato "por partes" que
hay que mantener.

### 2.2 Por qué hoy se leen como piezas pegadas

1. **Degradados en vez de dos tonos.** Cada masa usa `linearGradient` (pelo,
   crema, interior de oreja, iris). Eso produce un sombreado suave continuo,
   que es exactamente lo contrario al cel-shading: el juego pide *dos* planos
   de color con un salto de tono nítido.
2. **Contorno débil y gris.** `stroke-width="2.2"` con `stroke="#34180C"` /
   `"#3B1E12"`. A 200×200 el contorno no se lee como "línea de tinta", se lee
   como un borde fino. Y conviven con líneas de detalle de 1.3–1.6 px del
   mismo color, así que no hay jerarquía de grosores.
3. **Geometría de ensamble, no de animal.** La pata delantera izquierda de
   Luna es un *slab* de lados rectos (`L` commands) pegado al torso; su
   contorno recto cruza el cuerpo y produce la costura vertical dura que
   documentó el plan `docs/plans/paw-paint-order-2026-08-26.md`. Los
   parches `<!-- seam-hip -->` y `<!-- seam-ruff -->` son parches de relleno
   para tapar esas costuras, no diseño.
4. **Proporciones chibi planas.** La cabeza ocupa ~40% del alto en idle y el
   cuerpo es un óvalo con patas; no hay gesto ni expresión de anime.

### 2.3 Contratos que NO se pueden romper

| Contrato | Dónde vive | Test que lo cubre |
|---|---|---|
| `viewBox="0 0 200 200"` en cada pose | los 12 SVG | `pet-assets.test.js` |
| `class="pet-pupil"` con `data-anchor-x`/`data-anchor-y` | cabeza de cada pose | `pet-assets.test.js` |
| Conteos de pupilas: 2 de frente, 1 de perfil, 0 dormida | 12 poses | `pet-assets.test.js` |
| Clases de pata exactas `class="back-foot-left"` etc. | 12 poses | `pet-assets.test.js` |
| Las 4 patas son `<g>` hermanos, nunca dentro de `.pet-body` | 12 poses | `pet-assets.test.js` |
| Orden de pintado sombra→cola→patas→cuerpo→patas→cabeza | 12 poses | `pet-assets.test.js` |
| Sin `z-index`/`isolation` en los grupos | CSS | `pet-assets.test.js` |
| `getXPartsForState` devuelve las 7 ranuras de partes | `cat.js` / `dog.js` | **nuevo (paso 1)** |
| Nombres de exports | `cat.js` / `dog.js` | **nuevo (paso 1)** |
| Alias: `walk1–4 = walk`, `sitBlink = sit`, `layBreathe = lay`, `walkFrames = [walk]` | `cat.js` / `dog.js` | `pet-assets.test.js` |
| `transform-origin` de CSS == inline del SVG | `animations.css` | **nuevo (paso 4)** |
| Superficie de exports usada por el dashboard (`window.catSVG`, `window.dogSVG`) | `cat.js` / `dog.js` | `dashboard-renderer.js:455` |

---

## 3. Fuera de alcance

- Mascotas nuevas, más de dos especies, más de seis estados.
- Cambios de comportamiento: no se tocan `pet-motion.js`, `pet-behavior.js`,
  `pet-mood.js`, el state machine de `PetViewport` ni los timings de las
  keyframes.
- Cambios de motor gráfico: **no** se activa PixiJS, **no** se parte el SVG en
  sprites reales, **no** se cambia `src/pet-renderer-pixi.js`. La API de partes
  se mantiene tal cual (mismo shape, mismo `body` con el SVG completo) — partir
  el arte en 7 texturas es una migración de motor, no un rediseño.
- No se toca `src/styles/dashboard.css` (ya está prohibido redefinir el gait
  ahí) ni `src/styles/pet.css`.
- No se agregan estados de ánimo ni etiquetas de mood.

---

## 4. Sistema de diseño cel-shading (norma de construcción)

Esta sección es la **norma** que deben seguir las 12 poses. El implementador
la aplica tal cual; no improvisa paletas nuevas.

### 4.1 Paletas fijas (2 tonos de sombra, ni uno más)

**LUNA (gato tabby naranja)**

| Rol | Hex | Uso |
|---|---|---|
| `fur-light` | `#F2A85E` | base del pelaje en zona de luz |
| `fur-shadow` | `#C4783A` | **único** tono de sombra plana del pelaje |
| `fur-deep` | `#8A4A1E` | rayas, borde de oreja, detalle profundo (no es un 3º tono de masa) |
| `cream-light` | `#FFF4E4` | base de pecho, hocico y patas |
| `cream-shadow` | `#E4C4A0` | sombra plana del crema |
| `ear-inner` | `#F09A96` | interior de oreja |
| `nose` | `#E2707A` | nariz y lengua |
| `blush` | `#F08C8C` | rubor de mejilla (plano, sin `opacity`) |
| `eye-iris` | `#8C5A2B` | base del iris |
| `eye-pupil` | `#1E0F08` | pupila |
| `highlight` | `#FFFFFF` | brillos del ojo |
| `ink` | `#3A1E12` | **única** tinta de contorno |
| `ground` | `#28140B` | sombra en el piso (solo `class="pet-shadow"`, con `opacity`) |

**MAX (perro shiba)**

| Rol | Hex | Uso |
|---|---|---|
| `fur-light` | `#F7B851` | base del pelaje en zona de luz |
| `fur-shadow` | `#C97E22` | **único** tono de sombra plana del pelaje |
| `fur-deep` | `#8A4A12` | orejas, punta de cola, detalle profundo |
| `cream-light` | `#FFF8EC` | base de pecho, hocico y patas |
| `cream-shadow` | `#E9CFA8` | sombra plana del crema |
| `ear-inner` | `#F09A96` | interior de oreja |
| `nose` | `#3A2A22` | nariz |
| `blush` | `#F0927F` | rubor de mejilla (plano, sin `opacity`) |
| `eye-iris` | `#6B3A12` | base del iris |
| `eye-pupil` | `#160C06` | pupila |
| `highlight` | `#FFFFFF` | brillos del ojo |
| `ink` | `#3B2416` | **única** tinta de contorno |
| `ground` | `#28140B` | sombra en el piso (solo `class="pet-shadow"`, con `opacity`) |

**Reglas de paleta**
- Todo `fill="#RRGGBB"` de una pose pertenece a la paleta de su especie.
  `fill="none"` y `fill="url(#...)"` quedan prohibidos.
- Todo `stroke="#RRGGBB"` de una pose es **exactamente** la `ink` de la especie
  (un solo valor distinto por pose).
- `ground` solo puede aparecer en el elemento `class="pet-shadow"`.
- El rubor y las sombras son **planos**: nunca llevan `opacity` (la única
  excepción es la sombra de piso).

### 4.2 Luz y peso de línea

- **Luz desde arriba-izquierda.** La sombra plana de cada masa va **abajo-derecha**.
  Consistente en las 12 poses y en las 2 especies.
- **Contorno de silueta** (`cel-outline`): `stroke-width` entre **3.2 y 3.6**,
  `stroke-linejoin="round"`, `stroke-linecap="round"`.
- **Detalle interior** (líneas de pelo, boca, cejas, dedos, separación de
  dedos): `stroke-width` entre **1.5 y 2.1**, mismo `ink`.
- Ningún trazo por debajo de 1.5. Ningún trazo por encima de 3.8.

### 4.3 Construcción por masa (receta obligatoria)

Cada una de las 7 masas (cola, pata trasera izq/der, cuerpo, pata delantera
izq/der, cabeza) se construye así:

```xml
<!-- dentro del <g> de la masa, en este orden -->
<path class="cel-outline" d="…" fill="<base>" stroke="<ink>"
      stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round"/>
<path class="cel-shadow" d="…" fill="<shadow"/>          <!-- plano, SIN stroke -->
<!-- detalle opcional -->
<path d="…" fill="none" stroke="<ink>" stroke-width="1.8" stroke-linecap="round"/>
```

- `cel-outline` = **la silueta**, rellena con el color base y con el contorno
  de tinta pesado. Exactamente uno por masa.
- `cel-shadow` = **un plano** de sombra que va dentro de la silueta, del color
  `fur-shadow` (o `cream-shadow` si la masa es crema). Al menos uno por masa.
  Sin `stroke`, sin `opacity`, sin degradado.
- Las orejas (2) y el iris son sub-masas del grupo `.pet-head` y llevan su
  propio `cel-outline`; el iris lleva un plano de sombra en la parte baja.
- El `.pet-head` lleva **≥ 3 `cel-outline`** (cabeza + 2 orejas).
- Se eliminan los parches `<!-- seam-hip -->` y `<!-- seam-ruff -->`: su
  función la cumplen ahora el encaje real y el plano de sombra del cuello.

### 4.4 Reglas de encaje (esto es lo que quita el efecto "piezas pegadas")

Estas reglas son el corazón del rediseño y son lo que el revisor visual va a
juzgar:

1. **Pata delantera ↔ vientre.** El borde superior de `.left-paw` /
   `.right-paw` **continúa la curva del vientre** del `.pet-body`. Prohibido
   un corte recto vertical. La pata se solapa con el cuerpo **≥ 6 px** en
   vertical.
2. **Pata trasera ↔ grupa.** La parte superior de `.back-foot-left` /
   `.back-foot-right` se pierde bajo el cuerpo **≥ 5 px**.
3. **Cabeza ↔ cuello.** La cabeza se superpone al cuerpo **≥ 8 px**. El
   encuentro cuello/cabeza no se marca con una línea recta: se resuelve con el
   plano de sombra del cuello y 2–3 líneas finas de quiebre de pelo.
4. **Cola ↔ grupa.** La base de la cola queda oculta bajo la grupa **≥ 6 px**.
   En la raíz no hay costura visible.
5. **Silueta continua.** Mirada la pose completa, el contorno exterior se lee
   como **una sola línea continua**. Ninguna masa flota, ninguna deja un hueco
   de fondo contra el cuerpo, ninguna sobresale como un rectángulo.
6. **Sombras contenidas.** El plano `cel-shadow` de una masa nunca cruza el
   contorno de esa masa.

### 4.5 Proporciones (arte oficial / anime)

- **Cabeza grande**: en idle y sit la cabeza ocupa **~55% del alto total** de
  la mascota; el cuerpo ~45%.
- **Ojos grandes**: en frontal, cada ojo tiene ~1/5 del ancho de la cabeza,
  iris plano con sombra inferior y **dos brillos** (uno grande arriba-izquierda,
  uno pequeño abajo-derecha) — se mantiene el patrón actual.
- **Hocico corto y redondo**, con plano de sombra bajo el hocico.
- **Orejas grandes** en triángulo redondeado con interior propio.
- **Cola larga y expresiva**, con al menos 2 líneas finas de quiebre.
- El personaje se lee por **gesto y silueta**, no por detalle anatomico.

### 4.6 Por estado

| Estado | Lectura | Nota |
|---|---|---|
| idle | 3/4 de frente, cuerpo entero, cola en curva alta | pose de referencia |
| walk | **perfil** (mirando a la izquierda), 1 ojo visible, patas en contacto | la silueta de perfil es la prueba dura del "no piezas pegadas" |
| sleep | acostada, ojos cerrados (sin `pet-pupil`), cola enrollada | sombra de piso más baja |
| sit | sentado, pecho erguido, cola en curva baja al costado | |
| lay | acostada panza abajo, patas estiradas | |
| stretch | estirada, grupa alta, cola alzada | |

---

## 5. Pivotes: `animations.css` ↔ geometría del SVG

El `transform-origin` de cada grupo del SVG está en el `style` inline, y el
CSS lo sobreescribe. Hoy **coinciden** solo para `walk`, `sit` e `idle`; en
`sleep`, `lay` y `stretch` el CSS aplica el pivote de idle a un grupo cuya
geometría es otra (la cola de `lay` rota alrededor de un punto que no es su
base). Al rediseñar la geometría eso empeora.

**Decisión**: las reglas de pivote se expresan **por estado y por especie**,
de modo que el `transform-origin` del CSS sea siempre igual al inline del SVG
de esa pose.

Reglas a mantener/crear en `src/styles/animations.css`:

```css
/* ya existen, se conservan */
.cat-walk .back-foot-left        /* …y .left-paw, .back-foot-right, .right-paw */
.dog-walk .back-foot-left        /* …idem */
.walking-bob.cat-walk .anim-wag
.walking-bob.dog-walk .anim-wag-fast
body[data-pet="cat"] #pet-container.sitting .anim-wag   /* + 4 patas + body + head */
body[data-pet="dog"] #pet-container.sitting .anim-wag   /* + 4 patas + body + head */
body[data-pet="cat"] #pet-container:not(.cat-walk):not(.sitting) …   /* idle */
body[data-pet="dog"] #pet-container:not(.cat-walk):not(.sitting) …   /* idle */

/* nuevas: cola + cuerpo + cabeza por estado (sueling / laying / stretching) */
body[data-pet="cat"] #pet-container.sleeping .anim-wag { transform-origin: … !important; }
body[data-pet="cat"] #pet-container.laying   .anim-wag { transform-origin: … !important; }
body[data-pet="cat"] #pet-container.stretching .anim-wag { transform-origin: … !important; }
/* …y lo mismo para .pet-body / .pet-head y para el perro */
```

Las reglas nuevas usan `!important` porque la regla `idle`
(`body[data-pet="cat"] #pet-container:not(.cat-walk):not(.sitting) …`) tiene
especificidad mayor que `body[data-pet="cat"] #pet-container.sleeping …`.

**Cobertura del guard derivado (paso 4):**

| Grupo | Estados con pivote verificado |
|---|---|
| `.anim-wag` | idle, walk, sleep, sit, lay, stretch (los 6) |
| `.pet-body`, `.pet-head` | los 6 |
| `.back-foot-left/right`, `.left-paw`, `.right-paw` | walk y sit (los únicos donde las patas rotan) |

En `sleep`/`lay`/`stretch` las patas no rotan, así que su pivote es inerte y no
se exige igualdad con el inline.

---

## 6. Plan de testing

Todos los tests nuevos van en `test/pet-assets.test.js` (Node puro, sin
dependencias nuevas). Se activan **pose por pose**, nunca los 12 de golpe, para
que un fallo apunte a un solo redibujo.

### 6.1 Tests nuevos (paso 1)

1. **Superficie de exports** — `src/assets/cat.js` y `src/assets/dog.js`
   exportan exactamente los mismos nombres que hoy (strings, array y función),
   con los mismos tipos.
2. **Contrato de partes (PixiJS)** — para los 6 estados
   (`idle, walking, sleeping, sitting, laying, stretching`),
   `getCatPartsForState(state)` / `getDogPartsForState(state)` devuelven un
   arreglo no vacío y cada elemento tiene **exactamente** las 7 claves
   `{head, body, tail, backLegLeft, backLegRight, frontLegLeft, frontLegRight}`;
   todo valor no nulo es un string SVG con `viewBox="0 0 200 200"`.
3. **Contrato cel (parametrizado por pose)**:
   - sin `linearGradient` / `radialGradient` / `<stop` / `url(#`;
   - todo `fill="#..."` pertenece a la paleta de la especie (`ground` solo en
     `class="pet-shadow"`);
   - todo `stroke="#..."` es la `ink` de la especie (un solo valor distinto);
   - cada una de las 7 masas contiene exactamente 1 `cel-outline` con
     `stroke-width` en [3.2, 3.6] y ≥ 1 `cel-shadow` sin `stroke` ni
     `opacity`;
   - `.pet-head` contiene ≥ 3 `cel-outline` (cabeza + 2 orejas).
4. **Ancla dentro del iris** — cada `pet-pupil` tiene su `cx`/`cy` igual al
   `data-anchor-*`, y existe un `<ellipse>` (el iris) con el mismo centro y
   `rx`/`ry` ≥ el radio de la pupila.

### 6.2 Tests a actualizar (en cada paso)

- Las aserciones **literales** de coordenadas de pupila
  (`(74,74)`, `(110,74)`, `(82,72)`, …) se actualizan a la geometría nueva de
  cada pose.
- Las aserciones **literales** de `transform-origin` en
  `animations.css` se actualizan junto con la geometría; en el paso 4 se
  reemplazan por el guard derivado (§5), que es más fuerte.
- El guard `doesNotMatch(catBfl, /58px\s+132px/)` (el pivote frontal viejo en
  la pose de perfil) **se conserva**: el walk sigue siendo perfil.

### 6.3 Gates

`npm run check` y `npm test` deben quedar verdes al final de **cada** paso.
En cada paso el implementador registra la evidencia de **rojo** (test nuevo
fallando contra el SVG viejo) y de **verde** (test nuevo pasando con el SVG
nuevo) dentro del mismo paso.

---

## 7. Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/assets/cat.js` | 6 poses de Luna reescritas en cel-shading (§4) |
| `src/assets/dog.js` | 6 poses de Max reescritas en cel-shading (§4) |
| `src/styles/animations.css` | `transform-origin` por estado/especie alineados a la geometría nueva (§5) |
| `test/pet-assets.test.js` | tests de contrato cel, contrato de partes, superficie de exports, guard derivado de pivotes; actualización de literales |
| `test/preview/pet-poses-preview.html` | **nuevo** — grid con las 12 poses, fondo claro y oscuro, etiquetas |
| `test/preview/pet-poses-capture.py` | **nuevo** — capturas PNG a `docs/pet-screenshots/` |
| `docs/pet-screenshots/README.md` | **nuevo** — qué es cada PNG y cómo regenerarlo |

---

## 8. Pasos

### Paso 1 — Vocabulario cel + poses idle de referencia (Luna y Max)

Reescribir `catIdleSVG` y `dogIdleSVG` aplicando §4 completo (paletas, peso
de línea, construcción por masa, encaje, proporciones). Actualizar en
`src/styles/animations.css` los `transform-origin` de las reglas idle de gato
y perro a la geometría nueva. En `test/pet-assets.test.js`: actualizar los
anchors idle, y **añadir** los tests de superficie de exports, contrato de
partes (Pixi) y contrato cel aplicado a las 2 poses idle. Registrar evidencia
de rojo y de verde. **Las 2 idle son la referencia normativa: las otras 10 poses
deben seguir esta misma construcción al pie de la letra.**

### Paso 2 — Gato: walk, sleep, sit, lay y stretch

Reescribir en `src/assets/cat.js` las 5 poses restantes de Luna aplicando §4
(el perfil de `walk` es la prueba dura del encaje: cola → grupa → patas →
cuerpo → cabeza como una sola silueta). En `src/styles/animations.css`
actualizar los pivotes de `walk` y `sit` del gato y **añadir** las reglas por
estado de §5 para `sleeping` / `laying` / `stretching` (cola, cuerpo, cabeza).
En `test/pet-assets.test.js` actualizar los anchors del gato y extender el
contrato cel a las 6 poses del gato. Registrar evidencia de rojo y de verde.

### Paso 3 — Perro: walk, sleep, sit, lay y stretch

Idem del paso 2 sobre `src/assets/dog.js` (5 poses de Max), los pivotes de
`walk` / `sit` / por estado del perro en `animations.css`, y los anchors +
contrato cel del perro en `test/pet-assets.test.js`. Max es una especie
distinta (orejas caídas, cola en sable, hocico de shiba): **no** clonar la
geometría de Luna, sí el vocabulario. Registrar evidencia de rojo y de verde.

### Paso 4 — Guard de deriva pivote CSS ↔ geometría SVG (12 poses)

En `test/pet-assets.test.js`: reemplazar las aserciones literales de
`transform-origin` por un test **derivado** que, para cada especie y cada
estado, extrae el `transform-origin` de la regla CSS correspondiente y lo
compara con el `transform-origin` inline del `<g>` equivalente del SVG de esa
pose (cola/cuerpo/cabeza en los 6 estados; patas en `walk` y `sit`), según la
tabla de cobertura de §5. El test también verifica que la sombra de piso
sigue siendo el primer elemento y que el orden de pintado no se movió. Con
esto, cualquier cambio futuro de geometría que olvide actualizar el CSS
falla en verde en vez de romper la animación en pantalla.

### Paso 5 — Preview de las 12 poses + capturas para la revisión visual

Crear `test/preview/pet-poses-preview.html`: grid con las 12 poses de
producción (idle, walk, sleep, sit, lay, stretch × Luna y Max), cada una en
una tarjeta con su etiqueta, renderizadas sobre fondo claro **y** fondo
oscuro (la app es una ventana transparente sobre el escritorio). Crear
`test/preview/pet-poses-capture.py` (Playwright, siguiendo el patrón de
`test/preview/walk-cycle-capture.py`) que guarde un PNG por pose en
`docs/pet-screenshots/`, y `docs/pet-screenshots/README.md` con el índice de
las capturas y el comando para regenerarlas. La página debe funcionar
abriéndola en cualquier navegador (sin Playwright) — el script Python es
opcional y best-effort.

---

## 9. Riesgos

| Riesgo | Mitigación |
|---|---|
| El redibujo a mano rompe el encaje y devuelve el efecto "piezas pegadas" | Reglas de encaje explícitas (§4.4) + revisión visual con capturas de las 12 poses en QA. El revisor visual juzga la silueta, no los hex. |
| Mover la geometría descuadra los pivotes de las animaciones CSS | Cada paso actualiza el CSS junto con el arte; el paso 4 instala un guard derivado que falla si CSS y SVG divergen (§5) |
| Un solo paso reescribe los 12 SVG y un error se propaga a todo | Los pasos activan los tests pose por pose (1 → 2 → 3), así que un fallo localize una pose |
| El redibujo cambia las coordenadas de pupila y rompe el eye-tracker | Se actualizan los anchors en el mismo paso + test de "ancla dentro del iris" (§6.1.4) |
| Los tests con literales quedan inservibles tras el rediseño | El paso 4 los reemplaza por invariantes derivadas (pivote, iris, paleta, partes), que no dependen de coordenadas concretas |
| Que el arte "quepa" pero se vea chato | Los criterios visuales de §10 son el judge; las métricas (paleta, pesos de línea) solo apoyan |

---

## 10. Criterios de aceptación visual (los juzga una persona mirando el resultado)

Estos son los criterios que el revisor visual de QA compara contra las capturas
de `docs/pet-screenshots/`. Las métricas de §4.1–4.3 son apoyo, no
sustituto.

1. **Contorno marcado.** Mirando a Luna o a Max de frente, se ve una línea de
   tinta oscura y gruesa que rodea toda la silueta, claramente más gruesa que
   las líneas de detalle de dentro. No se ve un borde fino ni un degradado.
2. **Sombras planas de dos tonos.** En cada parte del cuerpo se distinguen
   exactamente dos planos de color (luz y sombra) con un salto de tono nítido,
   no una transición suave. La sombra cae abajo-derecha en todas las piezas.
3. **Una sola silueta, no piezas pegadas.** Mirando a la mascota de perfil
   (caminando), el contorno exterior se lee como **una sola silueta continua**
   del hocico a la punta de la cola. No se ve ninguna pata como un rectángulo
   pegado al cuerpo, ni la cabeza como un disco montado encima, ni la cola
   como un accesorio. Si alguien tapara los colores y se quedara solo con el
   contorno, debería seguir reconociéndose un gato (o un perro).
4. **Proporciones expresivas.** De frente, la cabeza se ve grande en relación al
   cuerpo, con ojos grandes que tienen brillo, y una expresión de mascota
   *cute* que invite a tocarla. No se ve un muñeco plano.
5. **Es una mascota, no un objeto.** Luna se reconoce como gato (orejas
   triangulares, bigotes, cola larga) y Max como perro shiba (orejas caídas,
   hocico de shiba, cola en sable, cejas claras). Las dos se distinguen entre
   sí de un vistazo.
6. **Los estados siguen leyéndose.** Al dormir, al sentarse, al acostarse y al
   estirarse, la pose se reconoce como la misma mascota en otra actitud, no
   como otro dibujo.
7. **Se lee sobre fondo claro y oscuro.** La silueta y el contorno se distinguen
   contra un escritorio claro y contra uno oscuro; la sombra de piso no se
   convierte en una mancha.
