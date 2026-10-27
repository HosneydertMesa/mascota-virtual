---
id: 2026-10-27-redisenar-el-aspecto-visual-de
branch: feat/cel-shading-mascot-redesign
plan: docs/plans/2026-10-27-cel-shading-mascot-redesign.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 7
reviewed_at: 2026-10-27
---

**Verdict**: APPROVED

# Review: rediseño cel-shading de las mascotas (Luna y Max)

**Fecha**: 2026-10-27
**Reviewer**: Agente revisor (pasada adversarial contra el plan)
**Plan**: `docs/plans/2026-10-27-cel-shading-mascot-redesign.md`
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 7 MINOR

---

## Resumen ejecutivo

El diff implementa el plan completo (5 pasos): reescribe las 12 poses de
producción con vocabulario cel-shading (contorno de tinta 3.2–3.6 px, sombras
planas por masa, paleta fija por especie), realinea los pivotes CSS con la
geometría nueva, instala el guard derivado de deriva pivote↔SVG, y agrega la
página de preview + 12 capturas PNG para la revisión visual.

Lo que verifiqué a mano (el revisor no tiene shell en este entorno, así que
todo es estático y cruzado contra el código):

- **Mecánica del contrato cel (12 poses):** 0 coincidencias de
  `linearGradient|radialGradient|<stop|url(#` en `src/assets/*.js`. Todos los
  `stroke-width` del arte están en {3.4, 3.2} (silueta) y {1.8, 1.6, 1.5, 2}
  (detalle). Cada masa tiene exactamente 1 `cel-outline` (la cabeza ≥ 3:
  cráneo + 2 orejas + 2 iris) y ≥ 1 `cel-shadow` sin `stroke` ni `opacity`.
  El único `opacity` del repo de assets es el de `.pet-shadow`, y `ground`
  (`#28140B`) solo aparece ahí.
- **Guard de pivotes (52 checks):** recalculé a mano los 52 pares
  (especie × estado × grupo) que el guard deriva. La cascada simulada por el
  test da el mismo ganador que el navegador en los 12 estados: las reglas por
  estado (`sleeping/laying/stretching`) ganan por `!important` frente a la
  regla idle `(1,4,1)` vs `(1,3,1)` — el comentario del CSS es correcto — y
  **cada** valor coincide con el `transform-origin` inline del `<g>`. El
  `!important` de `.walking-bob.cat-walk .anim-wag` / `.walking-bob.dog-walk
  .anim-wag-fast` también es el que gana. El DOM real
  (`body[data-pet] > #pet-container > #pet-svg-wrapper > svg#pet-svg > g`)
  coincide con la cadena que el test simula, y `document.body.dataset.pet` sí
  se setea en `src/renderer/pet-viewport.js:31,81`.
- **Tests: nada se debilitó.** Los contratos previos siguen vivos
  (`viewBox`, `class="pet-pupil"` + anchors, conteo de pupilas, clases exactas
  de pata, patas como `<g>` hermanos, orden de pintado, no-`z-index`, alias
  `walk1-4/sitBlink/layBreathe/walkFrames`) y el guard negativo
  `doesNotMatch(catBfl, /58px\s+132px/)` que el plan §6.2 exigía conservar
  sigue presente. Las aserciones literales de `transform-origin` se
  reemplazaron por el guard derivado, que es **más fuerte** y está explícitamente
  autorizado por el plan §6.2. No encontré asserts relajados, skips ni valores
  esperados cambiados "para que pase".
- **Arte contra la evidencia visual:** revisé las PNG de `docs/pet-screenshots/`
  (idle/walk/sit/lay/stretch de ambas especies). El resultado cumple §10:
  contorno marcado, dos tonos planos con salto nítido, silueta continua en
  perfil (la prueba dura del walk se lee como un gato y un perro completos, no
  como piezas pegadas), cabeza grande tipo anime, ojos con doble brillo, Luna
  con cola larga y bigotes y Max con orejas caídas, hocico de shiba, cejas
  claras y cola en sable, y lectura correcta sobre fondo claro y oscuro.

No encontré nada que bloquee. Los 7 MINOR son de **texto del plan** (contradic
ciones internas y métricas que no están cubiertas por test) y de **evidencia
de QA** pendiente; ninguno exige tocar el código para aprobar.

---

## Hallazgos

### [MINOR] [Plan] §4.1 prohíbe `fill="none"` pero §4.3 lo exige

`docs/plans/...md` §4.1 dice "Todo `fill="#RRGGBB"` de una pose pertenece a la
paleta de su especie. `fill="none"` y `fill="url(#...)"` quedan prohibidos",
pero la receta obligatoria de §4.3 usa
`<path d="…" fill="none" stroke="<ink>" stroke-width="1.8" …/>` para el detalle
interior. La implementación y el test
(`test/pet-assets.test.js:911-929`) siguen §4.3: permiten `fill="none"` solo
si el tag trae `stroke` y no es `cel-outline`/`cel-shadow`.

**Acción**: enmendar §4.1 para decir "ningún `fill` de color fuera de la
paleta; `fill="url(#...)"` prohibido" y dejar `fill="none"` permitido en
líneas de detalle. No bloquea: los criterios de aceptación del frontmatter
prohíben degradados, no `fill="none"`.

### [MINOR] [Plan] Las métricas px de §4.4 no se cumplen al pie de la letra

§4.4.1 pide que la pata delantera "se solape con el cuerpo **≥ 6 px** en
vertical". En la implementación el borde superior de `.left-paw`/`.right-paw`
**coincide exactamente** con la curva del vientre del `.pet-body` (p. ej.
gato idle: `M 92,143 C 78,144 64,139 60,129` es la misma curva que el cierre
inferior del cuerpo), o sea solape = 0 px. Lo mismo con "≥ 5 px" de patas
traseras, "≥ 8 px" de cabeza y "≥ 6 px" de base de cola (aunque en cabeza y
cola el solape real sí es de ~20 px y ~10 px).

El punto importante: §4.4.1 es **autocontrainticivo** — si el borde superior
"continúa la curva del vientre", el solape vertical es 0 por construcción; para
meter 6 px la pata tendría que cortar el vientre y reintroducir la costura que
el plan quiere eliminar. La implementación resolvió el conflicto a favor de la
regla primaria y del criterio de aceptación del frontmatter ("no hay costuras
rectas: el borde superior de cada pata delantera continúa la curva del
vientre"), y el resultado visual es correcto.

**Acción**: enmendar §4.4 para que la métrica sea "la pata **nunca** se separa
del vientre (coincidencia o solape) y no aparece línea recta en el
encuentro", o dejar la métrica como guía y agregar el test que la formalice.
Hoy esas métricas no están cubiertas por ningún test, así que el próximo
redibujo puede moverlas sin que nada falle.

### [MINOR] [Plan] §4.4.3 (encuentro cuello/cabeza) no tiene elemento propio

§4.4.3 pide resolver el encuentro cuello/cabeza "con el plano de sombra del
cuello y 2–3 líneas finas de quiebre de pelo". En las 12 poses no hay un
plano de sombra de cuello: el encuentro se resuelve con la propia silueta
curva de la cabeza, dibujada encima del cuerpo (orden de pintado
sombra→cola→patas→cuerpo→patas→cabeza, mandated por el plan). Visualmente
no hay costura recta, pero la receta literal de §4.4.3 no está implementada.

**Acción**: alinear el texto de §4.4.3 con lo implementado (o agregar el
plano de cuello si se quiere esa lectura). No bloquea: §10 (el judge visual)
se cumple.

### [MINOR] [Visual] Dirección de la sombra: "abajo-derecha" es "abajo" en las poses frontales

En las poses de frente (sit, sleep, lay) el `cel-shadow` de cuerpo y cabeza es
una banda inferior completa, no una cuña abajo-derecha. Globalmente se lee
como luz desde arriba-izquierda (cabeza, cola, patas y hocico sí llevan la
sombra abajo-derecha), pero no es literalmente "abajo-derecha" en cada masa.

**Acción**: el revisor visual de QA debería confirmarlo contra §10.2 con las
capturas; si no convence, la corrección es de arte, no de contrato.

### [MINOR] [Proceso] Falta la evidencia de rojo/verde que el plan pide por paso

Los `steps` del frontmatter exigen, en cada uno de los 5 pasos, "registrando
evidencia de rojo y de verde en el mismo paso". El diff no trae artefacto de
esa evidencia (no hay entrada en `docs/qa/` para esta feature ni notas de
commits en el diff).

**Acción**: el gate de QA (paso 6) debe registrar la evidencia; lo dejo
anotado para que no se pierda.

### [MINOR] [Visual] Las capturas no reflejan el tamaño real de pupila en runtime

El arte define la pupila con `r=5` (gato idle), `r=4.5` (walk), `r=4.8`
(lay), etc. Pero en runtime `src/renderer/eye-tracker.js:33,37` resetea el
radio a `2.0` (`3.2` de noche) y mueve el centro hasta `PUPIL_MAX_RADIUS =
3.8` px. Como ahora el iris es un plano marrón claro (antes era un óvalo
negro interior), la pupila real en la app se verá como un punto oscuro
pequeño, no como la de las PNG. Con `r=2` + 3.8 px de recorrido, la pupila
sigue dentro del iris (rx mínimo 11) ✓, pero la app no se verá igual que las
capturas.

**Acción**: no es regresión (comportamiento preexistente) y está fuera del
alcance del plan, pero QA debería mirarlo en la app real antes de dar el
"ok" visual.

### [MINOR] [Proceso] `npm test` / `npm run check` no ejecutados en esta revisión

El revisor no tiene shell en este entorno. Validé estáticamente cada aserción
nueva contra los assets y el CSS (incluido el cruce manual de los 52 pivotes),
pero la evidencia de "verde" de la suite (~900 tests) la tiene que producir el
gate de QA. Nota: `npm run check` no incluye `src/assets/cat.js` ni
`src/assets/dog.js` en su lista de `node --check`; la cobertura real de esos
dos archivos viene de `npm test`, que los `require`s.

---

## Verificación por criterio de aceptación (frontmatter del plan)

| # | Criterio | Veredicto | Cómo se comprobó |
|---|---|---|---|
| 1 | Sin `linearGradient`/`radialGradient`/`<stop>`/`url(#)` | ✅ | grep sobre `src/assets/*.js`: 0 coincidencias |
| 2 | Una sola tinta por especie; silueta ≥ 3 px, detalle 1.5–2.1 px | ✅ | todos los `stroke-width` en {3.4,3.2} / {1.8,1.6,1.5,2}; un solo `stroke` por pose |
| 3 | 1 `cel-outline` por masa + ≥ 1 `cel-shadow` sin trazo, paleta fija | ✅ | recorre de las 12 poses; `ground` solo en `.pet-shadow` |
| 4 | De frente se leen gato/perro, cabeza ~55 %, ojos con doble brillo | ✅ | `cat-idle.png` / `dog-idle.png` (cabeza 70 px sobre cuerpo 62 px ≈ 53 %; iris rx 13 sobre cabeza 110 px) |
| 5 | De perfil, silueta exterior continua | ✅ | `cat-walk.png` / `dog-walk.png` |
| 6 | Sombra plana abajo-derecha, contenida en la masa | ⚠️ parcial | ver MINOR de dirección de sombra; contenida sí (todo `cel-shadow` vive dentro de su silueta) |
| 7 | Sin costuras rectas; borde de pata continúa el vientre | ✅ | ver MINOR de métricas px: la regla primaria se cumple |
| 8 | `getXPartsForState` con 7 ranuras y `body` con viewBox en los 6 estados | ✅ | `test/pet-assets.test.js:760-787` + lectura de `cat.js:739` / `dog.js:698` |
| 9 | Superficie de exports sin cambios | ✅ | 15 exports por especie, idénticos a los declarados en el test (`:710-730`) |
| 10 | Conteo de pupilas por pose y ancla dentro del iris | ✅ | 2/1/0 por pose; el iris (elipse) comparte centro con la pupila y rx/ry ≥ r |
| 11 | Orden de pintado y patas como `<g>` hermanos | ✅ | test de paint order + `rootChildTags` (8 hijos raíz por pose) |
| 12 | `transform-origin` CSS == inline del SVG en las 12 poses | ✅ | cruce manual de los 52 pares; el guard derivado lo automatiza |
| 13 | `npm test` y `npm run check` verdes, sin regresiones | ⏳ | no ejecutable desde el revisor → lo produce QA (MINOR de proceso) |
| 14 | Preview de las 12 poses + PNG en `docs/pet-screenshots/` | ✅ | página sin arte embebido (carga `src/assets/*.js`), 12 PNG con la pose sobre fondo claro y oscuro, README con índice y comando de regeneración |

---

## Cobertura de los 5 pasos del plan

| Paso | Estado | Nota |
|---|---|---|
| 1 — vocabulario cel + idle de referencia | ✅ | idle de Luna y Max reescritos; tests de superficie de exports, contrato de partes y contrato cel |
| 2 — gato (walk/sleep/sit/lay/stretch) | ✅ | misma construcción; pivotes de walk/sit y reglas por estado con `!important` |
| 3 — perro (walk/sleep/sit/lay/stretch) | ✅ | geometría propia de shiba, no clonada de Luna |
| 4 — guard de deriva pivote CSS↔SVG | ✅ | guard **derivado** (parsea el bundle de `styles.css`, calcula especificidad + `!important`, matchea contra la cadena del DOM), 52 checks, más el test de orden de pintado |
| 5 — preview + capturas | ✅ | `pet-poses-preview.html`, `pet-poses-capture.py` (Playwright, best-effort) y README; la página funciona sin Playwright |

---

## Lo que hay que mirar en QA

1. Correr `npm test` y `npm run check` y adjuntar la evidencia (incluida la de
   rojo/verde por paso que pide el plan).
2. Mirar la app real, no solo las capturas: la pupila se achica a `r=2` en
   runtime (MINOR "tamaño real de pupila").
3. Confirmar la dirección de la luz en las poses frontales (MINOR de sombra).
4. Si el ojo de QA aprueba el arte, enmendar el plan (§4.1 `fill="none"`,
   §4.4 métricas px, §4.4.3 cuello) para que el contrato y la implementación
   dejen de contradecirse en la próxima iteración.

---

**Conclusión**: la implementación cumple el plan, los tests se **fortalecen**
(guard derivado en lugar de literales) y no hay evidencia de test debilitado
para que el código pase. Se aprueba; los 7 MINOR son de texto del plan,
dirección de arte y evidencia de QA, ninguno bloqueante.
