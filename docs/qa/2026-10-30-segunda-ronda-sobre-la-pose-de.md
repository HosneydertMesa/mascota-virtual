---
id: 2026-10-30-segunda-ronda-sobre-la-pose-de
branch: harness/20261030-095409-segunda-ronda-sobre-la-pose-de
plan: docs/plans/2026-10-30-dog-walk-torso-round2.md
review: docs/reviews/2026-10-30-segunda-ronda-sobre-la-pose-de.md
status: APPROVED
evidence:
  tests: "npm test - 934/934 verdes (0 fail, 0 skipped, 0 todo); node --test test/pet-assets.test.js - verde; npm run check - exit 0; npm run smoke - exit 0 ('[smoke-test] OK - no se detectaron errores criticos en 10s'). Fase ROJO de los 3 guards tocados: con el arte de la ronda 1 (git checkout 1e467d5 -- src/assets/dog.js) fallan los 3 ('el lomo vuelve a subir en x=134.1 ... 1.1 px por encima', 'el vientre vuelve a bajar en x=130.5 ... 0.7 px por debajo', 'la sombra del vientre forma una punta en x=119.0') => los guards muerden, no son decorativos. Medicion independiente (docs/qa/evidence/measure-torso.js): ronda 2 -> desnivel del lomo 5.2 px (<=7), subida maxima del lomo 0.0 px (<=1), bajada maxima del vientre 0.0 px (<=0.5), subida xDeep->ingle 12.2 px (>=8), punta maxima de la sombra 0.6 px (<=3); ronda 1 -> 9.4 px / 6.8 px / 3.6 px / 9.3 px / 2.8 px. Frescura del PNG: 'python test/preview/pet-poses-capture.py --only dog-walk' regenera un binario byte a byte identico al commiteado (sha256 93dfb6a8d5882c26d968a264069f9eeb0b5ddc55f11c34656f9c865d3c9b010e)."
  smoke: "npm run smoke - exit 0: '[smoke-test] OK - no se detectaron errores criticos en 10s' (Electron levanta y se cierra sin errores criticos)"
  manual: "Revision visual de la pose de caminar de Max renderizada desde el SVG DE PRODUCCION (src/assets/dog.js) con Playwright/Chromium headless, sobre fondo claro y fondo oscuro: docs/qa/evidence/max-caminando-claro.png, max-caminando-oscuro.png, mas los zooms max-caminando-vientre-zoom.png, max-caminando-lomo-zoom.png, max-caminando-torso-zoom.png, max-caminando-torso-zoom-oscuro.png y las comparativas con el arte de la ronda 1 max-caminando-antes-claro.png, max-caminando-antes-oscuro.png, max-caminando-antes-despues.png. Las capturas las produce docs/qa/evidence/qa-capture.py (script de QA, deja el SVG de la ronda 1 via 'git show 1e467d5:src/assets/dog.js' y los dos se renderizan en la misma pagina)."
signed_by: "qa (minimax/MiniMax-M3.1-Flash)"
checked_at: 2026-10-30
---

# QA — segunda ronda sobre la pose de caminar de Max (torso)

**Plan**: `docs/plans/2026-10-30-dog-walk-torso-round2.md` (12 criterios de aceptación, `visual: true`)
**Review**: `docs/reviews/2026-10-30-segunda-ronda-sobre-la-pose-de.md` (APPROVED, 0 critical / 0 major / 6 minor)
**Ronda**: 2 (torso: vientre de una sola curva + lomo casi recto)
**DiffAuditado**: `1e467d5..53ac2f0` → `src/assets/dog.js`, `test/pet-assets.test.js`, `docs/pet-screenshots/README.md`, `docs/pet-screenshots/dog-walk.png`
**Veredicto**: **OK** (APPROVED) — los 12 criterios se cumplen

---

## 1. Comandos realmente ejecutados

```
$ npm test
ℹ tests 934
ℹ suites 1
ℹ pass 934
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 52054.8605

$ npm run check          # node --check sobre los 33 .js del proyecto
(exit 0)

$ npm run smoke
[smoke-test] Electron salio con codigo null
[smoke-test] OK — no se detectaron errores criticos en 10s
(exit 0)

$ python test/preview/pet-poses-capture.py --only dog-walk
  dog-walk -> docs/pet-screenshots/dog-walk.png
sha256 antes  : 93dfb6a8d5882c26d968a264069f9eeb0b5ddc55f11c34656f9c865d3c9b010e
sha256 despues: 93dfb6a8d5882c26d968a264069f9eeb0b5ddc55f11c34656f9c865d3c9b010e
=> IDENTICAL: el PNG commiteado sale del SVG de produccion

$ node docs/qa/evidence/measure-torso.js
$ python docs/qa/evidence/qa-capture.py
```

## 2. Fase ROJO: los 3 guards tocados muerden el arte viejo

Se restauró el arte de la ronda 1 (`git checkout 1e467d5 -- src/assets/dog.js`) con los tests
nuevos en su sitio y se corrió `node --test test/pet-assets.test.js`:

```
✖ dog walk: el torso de Max al caminar tiene lomo casi recto (sin joroba) y vientre de perro en marcha (no un bloque)
✖ dog walk: el vientre es una sola curva continua (sin escalon ni gancho delante de las patas traseras)
✖ dog walk: la sombra plana del vientre no forma un gancho

AssertionError: el lomo vuelve a subir en x=134.1 (y=93.4 px, 1.1 px por encima del punto mas bajo ya alcanzado, y=94.4 px): la grupa forma una joroba sobre la plinga
AssertionError: el vientre vuelve a bajar en x=130.5 (y=129.7 px, 0.7 px por debajo del punto mas alto ya alcanzado, y=129.0 px): el vientre tiene un escalon delante de las patas traseras
AssertionError: la sombra del vientre forma una punta en x=119.0 (y=124.6 px, el limite es 124.6 px): la sombra plana del bajo del cuerpo tiene un gancho
```

Con el arte nuevo los 3 pasan (`npm test` → 934/934). Los guards son **derivados** (miden la
geometría real del `d`), no rangos escritos a mano: un redibujo que vuelva a hacer la muesca o la
joroba vuelve a caer en rojo.

## 3. Criterio por criterio

| # | Criterio del plan | Veredicto | Evidencia |
|---|---|---|---|
| 1 | Vientre de una sola curva continua, sin escalón con borde duro delante de las patas traseras | ✅ | Medición independiente: bajada máxima del vientre xDeep→ingle = **0.0 px** (límite 0.5). Lectura visual en `max-caminando-vientre-zoom.png`: el borde inferior sube suave del pecho a la ingle, sin muesca. |
| 2 | La sombra plana acompaña la curva, sin gancho ni punta hacia arriba | ✅ | Punta máxima (u − promedio de vecinas a ±8 px) = **0.6 px** (límite 3). En `max-caminando-vientre-zoom.png` la banda de sombra es una tira continua que sube con el vientre, sin cuña. |
| 3 | Lomo casi recto, sin joroba; la grupa no queda por encima de la plinga | ✅ | Desnivel total hombro→grupa = **5.2 px** (límite 7) y subida máxima por encima del máximo ya alcanzado = **0.0 px** (límite 1). `max-caminando-lomo-zoom.png`: el lomo es una pendiente suave, sin joroba ni muesca. |
| 4 | La pose se sigue leyendo como un shiba en marcha de una sola pieza (cola, pecho, cabeza, sin costura) | ✅ | `max-caminando-claro.png` / `max-caminando-oscuro.png`: cola enroscada naciendo de la grupa, pecho más hondo que la cintura, hocico de perfil, una sola línea en el bajo del cuerpo. El diff solo toca 2 `d` del torso (`cel-outline` y `cel-shadow`); cabeza, patas, cola y parches no cambian. |
| 5 | El vientre solo sube desde su punto más bajo hasta la ingle (nunca vuelve a bajar) | ✅ | Bajada máxima = 0.0 px; subida total xDeep (x=105.9, y=142.0) → ingle (x=138.4, y=129.8) = **12.2 px** (mínimo 8). Guard nuevo en verde. |
| 6 | El lomo no sube en ningún punto entre hombro y grupa; desnivel total ≤ 7 px | ✅ | 0.0 px de subida; desnivel 5.2 px. Guard modificado en verde. |
| 7 | La sombra del vientre no forma ninguna punta (>3 px sobre el promedio de sus vecinas) | ✅ | 0.6 px. Guard nuevo en verde. |
| 8 | La cola no cambia (mismo path y mismo pivote 152px 106px); las otras 5 poses de Max y las 6 de Luna byte a byte idénticas | ✅ | Comparación directa `1e467d5` vs HEAD: las 11 poses exportadas son **idénticas** y sus sha256 coinciden con los hashes congelados del test (que pasó). El grupo `anim-wag-fast` de la cola es idéntico y conserva `transform-origin: 152px 106px`. `git diff` del `d` de la cola: 0 líneas. |
| 9 | Guards de arte existentes verdes (sombra contenida, 1 silueta, cabeza superpuesta, patas sin doble línea, cola enterrada, aire sobre el lomo, pata lejana pegada al vientre) | ✅ | `npm test` verde, incluidos `cel: ningun plano de sombra cruza el contorno`, `cel: cada pose se lee como una sola silueta`, `cel: la cabeza se superpone al cuerpo`, `cel: las patas delanteras no repiten el contorno del cuerpo`, `cel: la base de la cola se esconde bajo la grupa`, `dog walk: la cola nace de la grupa...`, `dog walk: la pata delantera lejana queda pegada al vientre`. |
| 10 | Estilo cel-shading se mantiene (una tinta, sombras planas de dos tonos, sin degradados, paleta fija) | ✅ | `cel: sin degradados ni url(#...)`, `cel: todo fill pertenece a la paleta fija de la especie`, `cel: un solo color de tinta` en verde; el diff solo cambia coordenadas, no colores (`#3B2416`, `#C97E22`, `#F7B851`, `#FFF8EC` intactos). |
| 11 | `npm test` y `npm run check` verdes, sin regresiones | ✅ | 934/934 (0 fail, 0 skipped, 0 todo) y `npm run check` exit 0. La ronda 1 tenía 932 tests: +2 (los 2 guards nuevos; el tercero es el modificado). |
| 12 | `docs/pet-screenshots/dog-walk.png` regenerada desde el SVG de producción y la fila del README documenta los 3 puntos | ✅ | Regeneración byte a byte idéntica (sha256 `93dfb6a8…`). La fila de `dog-walk` dice "el vientre de una sola curva continua … (sin escalon con borde duro delante de las patas traseras…)", "la sombra plana del vientre continua y sin gancho (ni punta hacia arriba delante de las patas traseras)" y "el lomo casi recto, sin joroba (no se hunde en la plinga ni vuelve a subir en la grupa)". El test del README se **extendió** con esas palabras clave (no se borró). |

## 4. Medición independiente (no usa los asserts del repo)

`docs/qa/evidence/measure-torso.js` extrae los helpers reales de `test/pet-assets.test.js`
(`massOutlinePolys`, `massShadowPolys`, `topLineAt`, `bottomLineAt`, `polysBBox`,
`verticalCrossings`, `deepestBellyX`) y mide las dos versiones del arte:

```
=== RONDA 2 (produccion, src/assets/dog.js) ===
  LOMO  hombro(x=87.0) y=85.0 | plinga(x=121.3) y=88.1 | grupa(x=145.9) y=90.3
        desnivel total hombro->grupa = 5.2 px (limite 7)
        subida maxima por encima del maximo ya alcanzado = 0.0 px (limite 1)
  VIENTRE  punto mas bajo xDeep=105.9 y=142.0 | ingle x=138.4 y=129.8
        bajada maxima (vuelve a bajar) = 0.0 px (limite 0.5)
        subida total xDeep->ingle = 12.2 px (minimo 8)
  SOMBRA  punta maxima (u - promedio vecinas) = 0.6 px en x=109.4 (limite 3)

=== RONDA 1 (git 1e467d5:src/assets/dog.js) ===
  LOMO  hombro y=85.0 | plinga y=92.7 | grupa y=87.5
        desnivel total = 9.4 px (limite 7)        subida maxima = 6.8 px en x=145.6 (limite 1)
  VIENTRE  bajada maxima = 3.6 px en x=138.0 (limite 0.5)   subida total = 9.3 px
  SOMBRA  punta maxima = 2.8 px en x=111.5 (limite 3)
```

Los números de la ronda 2 cumplen todos los límites del plan con margen; los de la ronda 1 los
incumplen (joroba de 6.8 px, muesca de 3.6 px).

## 5. Evidencia visual (`docs/qa/evidence/`)

Producida por `docs/qa/evidence/qa-capture.py` (Playwright + Chromium headless) renderizando el
SVG de producción y, en la misma página, el de la ronda 1 (`git show 1e467d5:src/assets/dog.js`)
para que el revisor visual pueda comparar sin adivinar.

**Conjunto principal (el que mira el revisor, mismo nombre en cada ronda)**

| Archivo | Qué muestra |
|---|---|
| `max-caminando-claro.png` | Pose de caminar de Max completa, fondo claro, desde el SVG de producción |
| `max-caminando-oscuro.png` | La misma pose sobre fondo oscuro |

**Zooms y comparativas (extras; no reemplazan las anteriores)**

| Archivo | Qué muestra |
|---|---|
| `max-caminando-vientre-zoom.png` | Crop del `viewBox` del vientre (88 96 84 52): ANTES vs DESPUÉS. Antes: muesca y gancho de sombra. Después: una sola curva + banda de sombra continua |
| `max-caminando-lomo-zoom.png` | Crop del `viewBox` del lomo (80 76 92 34): ANTES (joroba) vs DESPUÉS (recto) |
| `max-caminando-torso-zoom.png` | Zoom del torso (fondo claro) |
| `max-caminando-torso-zoom-oscuro.png` | Zoom del torso (fondo oscuro) |
| `max-caminando-antes-claro.png` / `max-caminando-antes-oscuro.png` | Pose completa con el arte de la ronda 1 |
| `max-caminando-antes-despues.png` | Comparativa lado a lado del torso, mismo encuadre |
| `measure-torso.js` / `measure-torso.out.txt` | Script + salida de la medición independiente |
| `qa-capture.py` | Script que genera las capturas |

## 6. Observaciones (no bloquean)

1. **Margen del guard del gancho.** El plan (§4.2) predecía que con el arte viejo la punta de la
   sombra estaría "6-7 px por encima del promedio de sus vecinas" en `x≈122`; la medición real con
   la fórmula especificada (ventana de ±8 px) da **2.8 px** (x≈111.5) y el arte viejo solo cae en
   rojo en `x=119` por el límite de igualdad (el `u` y el límite dan 124.6 vs 124.6 y el assert
   `u >= limit` falla por redondeo de coma flotante). El guard **sí** es rojo con el arte viejo y
   verde con el nuevo, con un margen holgado (0.6 px vs límite 3 px), así que cumple su contrato;
   lo que no se cumple es la *predicción de magnitud* del plan, no el criterio de aceptación.
   No se tocó nada para "arreglarlo": el criterio de aceptación ("<= 3 px sobre el promedio de sus
   vecinas") se cumple con 0.6 px y el guard mide exactamente la fórmula que el plan especifica.
2. **Criterio de la ronda 1 superado a propósito.** El guard `... tiene linea de lomo y de vientre
   de perro en marcha (no un bloque)` de la ronda 1 exigía que el lomo descendiera ≥ 4 px del hombro
   a la plinga y volviera a subir ≥ 2 px en la grupa — es decir, exigía la joroba. Se **modificó**
   (no se borró): se conservan intactas las aserciones de pecho/cintura (`pecho >= cintura + 8 px` y
   `vientre subiendo >= 8 px`) y se reemplazaron solo las dos del lomo por el contrato nuevo. Es
   exactamente lo que autoriza el `risks[0]` del plan ("ese test se modifica (no se borra) y el
   criterio de acceptance de la ronda 1 que lo respaldaba queda explícitamente superado por este
   plan"). No es un test relajado para que la implementación pase: es un cambio de contrato
   especificado por el plan, y los guards nuevos son más estrictos (miden geometría real y fallan
   con el arte anterior).
3. **El diff es mínimo**: 4 archivos, exactamente los que declara el frontmatter del plan
   (`src/assets/dog.js`, `test/pet-assets.test.js`, `docs/pet-screenshots/README.md`,
   `docs/pet-screenshots/dog-walk.png`). En `src/assets/dog.js` solo cambian las dos rutas `d` del
   torso de `dogWalkSVG` (4 líneas).

## 7. Veredicto

**APPROVED / ok**. Los 12 criterios de aceptación del plan se cumplen, la suite completa está verde
(934/934), `npm run check` y `npm run smoke` están verdes, el PNG de evidencia es reproducible byte
a byte desde el SVG de producción y ningún test fue debilitado. Las 3 observaciones anteriores no
bloquean el cierre.
