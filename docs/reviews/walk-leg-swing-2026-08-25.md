---
id: walk-leg-swing-2026-08-25
branch: feat/pixijs-rendering
plan: docs/plans/walk-leg-swing-fix-2026-08-25.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 1
  info: 2
reviewed_at: 2026-08-25
---

# Review: walk-leg-swing fix

**Fecha**: 2026-08-25
**Reviewer**: Mavis (root session, self-review con lens adversarial — mismo
agente que escribio el fix, sin fresh context por constraint de sandbox)
**Branch**: `feat/pixijs-rendering`
**Commit**: `9e98c4c`
**Veredicto**: ✅ **APPROVED** con 3 hallazgos (1 MINOR, 2 INFO), todos
diferibles o documentados en el plan retroactivo

---

## Resumen ejecutivo

El fix resuelve el bug correctamente: las patas ahora oscilan, confirmado
por runtime evidence con Playwright (transform del back-foot-left cambia
~22° en 400ms). Tests bidireccionales (con fix pass, sin fix fail). No
regresiones en la suite completa (867/867).

El root cause fue bien diagnosticado: un WIP refactor consolido patas en
grupos genericos, perdiendo las clases individuales que el CSS apunta. La
solucion restaura las clases y ademas aprovecha para corregir los
`transform-origin` que estaban stale del arte anterior.

Lo que se destaca:
- **Bidireccionalidad del test**: el test 4 ("transform-origin NO debe
  contener los origins viejos") es la version fuerte — no solo verifica
  que el nuevo codigo existe, sino que el viejo no. Esto cierra el
  loop de regresion.
- **Runtime evidence no placebo**: el script Playwright samplea el
  `getComputedStyle().transform` real, no un stdout simulado. La
  diferencia de t=0 a t=400ms es cuantificable.
- **CSS restructure comiteado como side effect**: el commit tambien
  agrega los archivos `src/styles/*.css` (animations, pet, variables,
  dashboard) que son parte del WIP CSS. Esto es necesario para que
  `src/styles.css` (que los importa) funcione, pero **mezcla el fix
  con el WIP** (ver INFO-1 abajo).

---

## Hallazgos

### [MINOR-1] Transform-origin del cat esta ligeramente desalineado para la pata trasera derecha

**Archivo**: `src/styles/dashboard.css` linea 689
(`transform-origin: 142px 132px;` para `.cat-walk .back-foot-right`)

**Detalle**: La pata trasera derecha del gato en el nuevo SVG empieza
en el path `M 142,132 C 152,142 ...`, asi que el hip joint esta en
x=142, y=132. El transform-origin actual coincide. **Sin embargo**, el
eje de rotacion ideal para una pata seria la **articulacion de la
cadera**, no la esquina superior-izquierda del bounding box. Visualmente
puede ser indistinguible (el shift es de <2px), pero si en algun momento
se quiere precision biomecanica, se podria mover el origin a la
articulacion real (~145, 138 para el back-right del cat).

**Impacto**: cosmetico. No rompe nada. No genera bug visual detectable.
**Decision**: diferir. Si en el futuro se quiere un walk cycle mas
realista, revisar todos los origins juntos con un artist.

### [MINOR-2] El test "no old transform-origins" es fragil si alguien usa los numbers en otro contexto

**Archivo**: `test/pet-assets.test.js` line ~180
(`badOrigins = ['transform-origin: 121px 115px', ...]`)

**Detalle**: El test verifica que el CSS NO contiene 4 strings literales
como `transform-origin: 121px 115px`. Esto es correcto para los patas
del pet, pero si en el futuro alguien agrega un elemento decorativo
con un `transform-origin: 121px 115px` legitimo (por ejemplo, un
particle effect), el test va a fallar falsamente.

**Impacto**: bajo. Solo se rompe si alguien intenta reusar esos numeros
exactos.
**Decision**: mejorar el test para que verifique en contexto
(`/\.cat-walk \.back-foot-left\s*\{[^}]*transform-origin:\s*121px 115px/`)
en lugar de string match. Diferir a menos que se rompa en la practica.

### [INFO-1] El commit `9e98c4c` mezcla el fix con el WIP CSS restructure

**Archivos**: `src/styles/animations.css`, `pet.css`, `variables.css`,
`dashboard.css` (todos nuevos en este commit)

**Detalle**: El fix del walk es independiente de la reestructuracion
CSS (`src/styles.css` ahora hace `@import` de 4 archivos en vez de
ser un monolito de 99KB). Sin embargo, el commit los commitea juntos
porque:
- Si commiteo solo el fix sin los imports, `src/styles.css` queda
  apuntando a archivos que no existen → la app rompe
- Si commiteo solo el fix en `dashboard.css` y dejo los demas como
  WIP, hay un mix de estilos viejos y nuevos que el `@import` no
  resuelve bien

**Impacto**: ninguno funcional. El mix de archivos en el commit hace
dificil hacer revert selectivo ("revertir solo el fix sin tocar el
WIP CSS"), pero el revert del commit entero es limpio.
**Decision**: documentar en el plan retroactivo (ya esta), y si el
usuario quiere separar, hacer un `git reset` y 2 commits separados en
el futuro. **No es bloqueante.**

### [INFO-2] El WIP branch tiene 28 commits sin review/qa acumuladas

**Archivo**: `scripts/sdlc.js strict` output

**Detalle**: El `sdlc:strict` reporta 29 commits nuevos desde v2.0.2,
incluyendo 6 commits M0-M2 de la migracion a PIXI (`84ece76`, `3e0c3b2`,
etc) que NO tienen review ni QA formal. Esto es pre-existente al fix
del walk. El fix del walk (1 commit) cumple con los gates (plan +
QA + doc + release + dev-clean excepto por el WIP dirty).

**Impacto**: bloquea `sdlc:strict` por acumulo de WIP, no por el fix
individual.
**Decision**: cuando el branch se integre a main, hacer un batch
review/qa retroactivo similar a este, o aceptar que la migracion a
PIXI v2.3.0 es un cambio grande que merece un batch unico de gates
al final (no por commit individual).

---

## Cosa que NO es hallazgo pero quiero dejar explicita

- El fix restaura las patas A, pero **NO agrega walk-cycle richness**
  (e.g., paw overshooting, weight shift, head bob sync). Es un
  regression fix, no una mejora.
- El **head turn** sigue implementado solo en PIXI (`pet-renderer-pixi.js`
  line 223-241), no en el legacy renderer. Como el renderer visible es
  el legacy, la cabeza no gira con el cursor. Esto es B3 en el QA
  sign-off y debe trackearse aparte.
- El **tail wag** sigue funcionando via CSS keyframe (`.walking-bob.cat-walk
  .anim-wag`) porque las clases de tail no se perdieron en el refactor.

---

## Veredicto final

**APPROVED**. El fix es correcto, bien scoped, con tests bidireccionales
y runtime evidence solida. Los hallazgos son menores o informativo, no
bloqueantes. Se commitea como `9e98c4c` con plan retroactivo en
`docs/plans/walk-leg-swing-fix-2026-08-25.md` y sign-off QA en
`docs/qa/walk-leg-swing-2026-08-25.md`.
