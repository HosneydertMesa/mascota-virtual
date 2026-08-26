# QA Sign-off (RETROACTIVO): walk leg swing fix

> **Naturaleza**: sign-off retroactivo del commit `9e98c4c`
> (`fix(renderer): restore leg swing animation in pet walk cycle`).
> Hecho en la misma sesion que el plan retroactivo
> (`docs/plans/walk-leg-swing-fix-2026-08-25.md`).

**Fecha**: 2026-08-25
**Branch**: `feat/pixijs-rendering`
**Commit**: `9e98c4c`
**Plan companion**: `docs/plans/walk-leg-swing-fix-2026-08-25.md`

**Verdict**: **APPROVED** con notas (ver seccion "Bugs preexistentes")

---

## Resumen del fix

El bug: la mascota caminaba con las patas pegadas al piso (solo se veia
el body/head/tail oscilando muy sutilmente). El root cause fue un WIP
refactor que consolido las patas en grupos genericos
(`<g class="pet-front-paws">` y `<g class="pet-hind-legs">`), perdiendo
los grupos individuales (`back-foot-left/right`, `left-paw/right-paw`)
que las animaciones CSS `sideWalkSwingLeft/Right` apuntaban.

El fix (3 partes):
1. SVG: wrap cada pata en su propio `<g class="...">` en los 4 walk
   frames de cat.js y dog.js
2. CSS: actualizar `transform-origin` de las 8 reglas de las patas a
   las posiciones reales de cadera del nuevo arte (cat y=132, dog y=134)
3. Tests: 4 tests nuevos en `pet-assets.test.js` (structural + regression
   guard contra restauracion de origins viejos)

## Runtime evidence

### Test 1 — suite automatizada via `npm test`

```
$ node --test test/*.test.js
tests 867
pass 867
fail 0
duration_ms 10710
```

867/867 tests verdes. Cubre los 4 tests nuevos del fix (TDD bidireccional:
con fix pass, sin fix fail) mas todas las suites preexistentes sin
regresiones.

### Test 2 — runtime evidence con Playwright headless Chromium

`test/preview/walk-screenshot.py` abre `cat-walk-preview.html` con el
walk cycle activado, samplea `getComputedStyle().transform` de
`.back-foot-left` en t=0 y t=400ms, y captura 2 screenshots.

Salida del script:

```
=== computed transform over time ===
cat back-foot-left  t=0:    matrix(0.999136, 0.0415527, -0.0415527, 0.999136, 0, 0)
cat back-foot-left  t=400:  matrix(0.939154, -0.343496, 0.343496, 0.939154, 0, 0)
dog back-foot-left  t=0:    matrix(0.927184, -0.374607, 0.374607, 0.927184, 0, 0)
cat walking-bob     t=0:    matrix(0.999791, 0.0204388, -0.0204388, 0.999791, 0.780596, -3.54556)
cat walking-bob     t=300:  matrix(0.999685, -0.0250883, 0.0250883, 0.999685, -0.958103, -0.0591469)

PASS — legs are animating.
```

El transform computado del back-foot-left del gato pasa de una rotacion
de ~+2.4° (t=0) a ~-20° (t=400ms) — un swing de ~22°, dentro del rango
del keyframe `sideWalkSwingLeft` (-22° a +18°). Las patas oscilan de
verdad en el browser.

Screenshots side-by-side en `docs/walk-screenshots/walk-t0.png` y
`walk-t400.png` (~238KB cada uno) muestran visualmente la diferencia:
la pata trasera del gato en posicion neutral vs rotada hacia adelante.

### Test 3 — analisis estatico via tests estructurales

`node --test test/pet-assets.test.js`:

```
✔ cat walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)
✔ dog walk frames: 4 patas con clase (back-foot-left/right + left-paw/right-paw)
✔ dashboard.css: reglas .cat-walk + .dog-walk para las 4 patas (animation + transform-origin)
✔ dashboard.css: transform-origin de las patas apunta a la cadera real del nuevo SVG
```

4/4 nuevos + 13/13 preexistentes = 17/17 OK. El ultimo test es el
regression guard: verifica que el CSS NO contiene los 4 origins viejos
(121/131/76/86, y=115), que serian incorrectos para el nuevo arte.

## Bugs preexistentes observados durante la investigacion

No introducidos por este fix, pero visibles durante la sesion:

- **B1**: Quick chat muestra contenido interno del LLM (tags `<think>` y
  JSON crudo) en la respuesta al usuario. Severidad: alta.
- **B2**: Quick chat no se cierra (boton X / Escape no responde).
  Severidad: alta.
- **B3**: Head turn feature solo implementado en `pet-renderer-pixi.js`,
  pero el renderer visible es el legacy. Parte del WIP de migracion a
  PIXI. Severidad: baja.

Estos 3 bugs requieren su propio plan retroactivo (siguiente accion).

## Decision

**Verdict**: **APPROVED** con notas

El fix esta bien scoped, los tests son bidireccionales, la runtime
evidence con Playwright confirma que la animacion corre en el browser.
Las notas son:

1. Los 3 bugs preexistentes (B1, B2, B3) deben trackearse por separado
   con su propio plan.
2. La validacion visual final en Electron requiere que el usuario
   corra `npm start` y observe el walk cycle con sus propios ojos.
3. El fix se commiteo en una rama WIP (`feat/pixijs-rendering`) con
   working tree dirty. El bump de version / changelog / tag se hara
   cuando el branch se integre a main.

## Files changed (resumen)

| Archivo | Cambio |
|---|---|
| `src/assets/cat.js` | Wrap 4 patas traseras + 4 frontales en 4 walk frames + 1 idle |
| `src/assets/dog.js` | Idem |
| `src/styles/dashboard.css` | 8 transform-origins actualizados (new file en este commit) |
| `src/styles/animations.css`, `pet.css`, `variables.css` | Importados por `src/styles.css` (WIP CSS restructure) |
| `test/pet-assets.test.js` | 4 tests nuevos |
| `test/preview/cat-walk-preview.html` | Aplica `.walking-bob.cat-walk`/`.dog-walk` + importa dashboard.css |
| `test/preview/walk-screenshot.py` | Runtime evidence Playwright |
| `docs/walk-screenshots/walk-t0.png`, `walk-t400.png` | Screenshots antes/despues |
| `docs/plans/walk-leg-swing-fix-2026-08-25.md` | Plan retroactivo |
| `docs/qa/walk-leg-swing-2026-08-25.md` | Este sign-off |
