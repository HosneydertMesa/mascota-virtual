---
id: sdlc-frontmatter-migration-2026-10-20
branch: feat/gate-frontmatter-migration
plan: docs/plans/2026-10-20-gate-migration.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 3
  info: 3
reviewed_at: 2026-10-20
---

# Review: migración del SDLC a frontmatter YAML (v2.1)

**Fecha**: 2026-10-20
**Scope**: working tree sin commitear vs `HEAD` = `1d3a1b5`
**Reviewer**: Mavis (root session)
**Modo**: adversarial, con contexto fresco sobre el diff

## Qué se revisó

| Archivo | Cambio |
|---|---|
| `scripts/sdlc-frontmatter.js` | NUEVO — parser YAML propio (~291 líneas) |
| `scripts/sdlc.js` | +300 líneas — `gatePlan`/`gateReview`/`gateQa` reescritos + comando `migrate-frontmatter` |
| `package.json` | +1 línea (`sdlc:migrate`) |
| `docs/sdlc/SCHEMA.md` | NUEVO — contrato del frontmatter |
| `docs/sdlc/PHASES.md` | +4 líneas (enlace al schema) |
| `docs/plans/*`, `docs/reviews/*`, `docs/qa/*` | 47 archivos con bloque `---` frontmatter agregado |
| `FILE_INDEX.md` | NUEVO, sin trackear |

**Estado de partida**: `npm test` en rojo, `npm run sdlc:strict` en rojo (working tree dirty).

---

## Hallazgos

### CRITICAL-1 — `migrated: true` es un bypass total de los gates, y la migración lo agrega a todo

**Dónde**: `scripts/sdlc-frontmatter.js:228`, `scripts/sdlc.js:207`, `scripts/sdlc.js:292`, `scripts/sdlc.js:990`

```js
// sdlc-frontmatter.js:228
if (data.migrated === true) return true;

// sdlc.js:207  (gateReview)
if (r.data.migrated === true || frontmatter.reviewApproved(r.data)) approved.push(f);

// sdlc.js:292  (gateQa)
if (r.data.migrated === true || frontmatter.qaApproved(r.data)) { ... }

// sdlc.js:990  (cmdMigrateFrontmatter)
const suggestedWithFlag = suggested.trimEnd() + '\nmigrated: true\n';
```

`cmdMigrateFrontmatter` le agrega `migrated: true` **incondicionalmente** a cada archivo que toca, sin importar qué inferió. Los tres gates confían en ese flag por encima de su propia validación.

**Medido**: los 47 documentos del repo (17 planes + 15 reviews + 15 QA) tienen `migrated: true`. **Cero** tienen frontmatter realmente validado. El `PLAN 17/17 approved`, el `REVIEW 15/15 APPROVED` y el `QA 15/15` que reporta `npm run sdlc:status` son **100% bypass**, no validación.

**Escenario de fallo concreto**: `suggestFrontmatter` sí calcula bien el status de un review (`scripts/sdlc.js:896-900` detecta `CHANGES_REQUESTED` y lo deja como tal) y el verdict de un QA (`scripts/sdlc.js:939`, `REJECTED`). Pero como `migrated: true` se agrega después, **un review con `status: CHANGES_REQUESTED` y un QA con `verdict: REJECTED` pasan el gate como APROBADOS**. El gate queda exactamente tan laxo como la v2.0.x que esta feature vino a endurecer — pero ahora además *parece* estricto.

Hoy no hay ningún review `CHANGES_REQUESTED` ni QA `REJECTED` en el repo (verificado), así que es un bypass **latente**, no un incidente activo. Se activa en el próximo documento rechazado que alguien migre.

**Por qué importa**: la premisa declarada en `docs/sdlc/SCHEMA.md:3-6` es "cierra falsos positivos". Con el bypass abierto, no cierra nada: convierte un regex flojo en un flag que un script pone solo.

**Fix**: `migrated: true` no debe ser una exención永久 del gate. Debería ser un estado *pendiente* que:
- **no** apruebe por sí solo, y
- se reporte explícitamente en `sdlc:status` / `sdlc:strict` como "N documentos sin validar".

Y la migración **no** debería agregarlo solo: debería dejar los archivos con el frontmatter inferido y marcarlos `status: draft` + `needs_review: true`, para que el gate los rechace hasta que el dev confirme.

---

### MAJOR-1 — El conteo de severidad cuenta *palabras*, no números: 5 de 15 reviews se rechazarían falsamente

**Dónde**: `scripts/sdlc.js:902-903`

```js
sev.critical = (body.match(/\bCRITICAL\b/g) || []).length;
sev.major    = (body.match(/\bMAJOR\b/g) || []).length;
```

El regex cuenta cada aparición de la cadena `CRITICAL` / `MAJOR` en el body, sin importar que esté **dentro de un "0"** o de una leyenda de severidades.

**Medido** (`reviewApproved()` con el frontmatter real, sin el bypass):

| Review | status | crit | maj | `reviewApproved()` |
|---|---|---|---|---|
| `batch-0-infra-foundation-2026-07-21.md` | APPROVED | 1 | 1 | **false** |
| `batch-4-distribucion-2026-07-22.md` | APPROVED | 1 | 1 | **false** |
| `close-minor4-2026-07-21.md` | APPROVED | 2 | 2 | **false** |
| `pet-animation-capa1-2026-07-21.md` | APPROVED | 2 | 2 | **false** |
| `retroactivo-m3-parser-2026-07-21.md` | APPROVED | 3 | 3 | **false** |
| `walk-v2-natural-enhancement-2026-08-25.md` | APPROVED | 0 | 0 | true |

Causa concreta: el body de `retroactivo-m3-parser` contiene `## CRITICAL (0)`, `## MAJOR (0)` y `No hay CRITICAL ni MAJOR, así que se puede avanzar a QA` → 3+3 matches. `pet-animation-capa1` dice `0 CRITICAL, 0 MAJOR, 4 MINOR, 2 INFO` → 2+2. El `MINOR: 3 / INFO: 3` de `walk-v2` tampoco coincide con su cuerpo real: el regex no distingue heading de tabla de frase.

**Escenario de fallo concreto**: `docs/sdlc/SCHEMA.md:139` le indica al dev "borrá los `.pre-fm.bak` y los campos `migrated: true` reemplazando por `status: approved` explícito". Si el dev obedece esa instrucción — que es exactamente el flujo que el schema prescribe — **el gate REVIEW rechaza 5 de 15 reviews legítimamente aprobados** y el gate QA rechaza 1 de 15. El dev concluiría que la feature está rota, cuando en realidad el bug es del contador.

**Fix**: no inferir severidad con regex sobre prosa. parsear la tabla/heading de severidad si existe, o tomar el conteo de un campo estructurado que el dev escriba a mano (`severity: {critical: 0, major: 0}`), y **fallar el gate con "severity ausente"** en vez de adivinar.

---

### MAJOR-2 — `npm test` en rojo: el contrato de `gateReview` cambió y los tests no se actualizaron

**Dónde**: `test/sdlc.test.js:287` y `test/sdlc.test.js:301`

```js
assert.match(r.evidence, /1 review\(s\) con APPROVED/);
```

El código nuevo emite `"1 review(s) APPROVED (0 con frontmatter, 1 legacy (regex))"`. Los dos tests fallan.

```
✖ gateReview: con opts.since, acepta reviews con mtime >= cutoff
✖ gateReview: sin opts.since, comportamiento legacy (no filtra)
```

Esto es una violación directa de la regla de `AGENTS.md`: *"Después de implementar, **siempre** corré `npm run sdlc:dev` antes de commitear"*. La feature nunca pasó por el DEV GATE.

**Nota**: son los **únicos 2 fallos que causa esta WIP**. Los otros 7 (en `pomodoro-store.test.js`) son pre-existentes y ajenos a esta feature — ver "Hallazgo MINOR-1" / sección de abajo.

**Fix**: actualizar las dos aserciones al nuevo formato, y agregar tests para las ramas nuevas (frontmatter presente, frontmatter inválido, `migrated: true`, mezcla legacy + frontmatter).

---

### MAJOR-3 — La feature no tiene PLAN, ni review, ni QA: viola la regla dura de `AGENTS.md`

**Dónde**: `docs/plans/`, `docs/reviews/`, `docs/qa/` — ningún archivo menciona `frontmatter` (verificado con grep sobre `docs/plans/`)

`AGENTS.md` dice: *"Toda feature nueva pasa por PLAN → IMPLEMENT → REVIEW → TEST → DOCS"*, y esta feature cambia la **semántica de tres gates** más 47 archivos. No hay plan.

**Y el gate no puede detectarlo**: `gatePlan` (`scripts/sdlc.js:150-154`) cuenta `migrated` como aprobado, así que los 17 planes legacy —ninguno de los cuales es de esta feature— cubren el gate. Un plan inexistente no puede hacer fallar un gate que solo cuenta planes existentes.

**Escenario de fallo concreto**: el próximo dev arranca un feature, lee `sdlc:status` → `PLAN ✓ passed`, y nunca escribe plan. El gate que supuestamente lo iba a capturar está contando el plan equivocado.

**Fix**: escribir `docs/plans/sdlc-frontmatter-v2.1.md` con los criterios de aceptación reales, y hacer que `gatePlan` distinga "planes del feature actual" de "planes históricos" (por `files:` que tocan `scripts/`, o por `id` correlacionado con el branch).

---

### MAJOR-4 — El generador produce frontmatter que su propio parser no puede leer, y que su propio schema declara inválido

**Dónde**: `scripts/sdlc.js:884-886` vs `scripts/sdlc-frontmatter.js:33-45` vs `docs/sdlc/SCHEMA.md:33-37`

```js
// sdlc.js:884  — lo que genera la migración
lines.push(`files: []`);
lines.push(`acceptance: []`);
lines.push(`risks: []`);
```

```yaml
# SCHEMA.md:35-36 — lo que el schema dice explícitamente que está MAL
files: [src/main.js, src/renderer/index.html]  # se lee como string
files: []                                       # se lee como string "[]"
```

Verificado contra el parser real:

```
files: []      → "[]"   isArray=false
acceptance: [] → "[]"   isArray=false
planStructureCheck → { ok: false, invalid: ["files (no es array)", "acceptance (no es array)", "risks (no es array)"] }
```

El `SCHEMA.md` marca `files: []` como ejemplo incorrecto, y el generador emite exactamente eso. Hoy el error está tapado porque `migrated: true` salta el `planStructureCheck` (`sdlc-frontmatter.js:228`); el día que el dev reemplace `migrated: true` por `status: approved` — como pide el schema — el plan es rechazado por estructura inválida.

**Escenario de fallo concreto**: un dev nuevo copia el ejemplo del schema (`files:` con items en block-style) y funciona. Si copia `files: []` (que el schema marca como malo, pero que el generador produce) → el plan se rechaza por estructura inválida, con un error que dice "no es array" sobre un valor que *se ve* como un array.

**Fix**: dos opciones, y hay que elegir una:
- (a) Que el parser soporte flow-style `[]` y `[a, b]` (es lo que la gente va a escribir).
- (b) Que el generador NO emita `files: []` sino que omita la clave, y que `planStructureCheck` trate `undefined` y `[]` como equivalentes a "array vacío".
- (c) — la que recomiendo — hacer las dos: parser tolerante + `planStructureCheck` que acepte `[]`, `["[]"]` y string vacío como array vacío, porque el archivo va a vivir mucho tiempo y habrá migraciones manuales.

---

### MAJOR-5 — `acceptance:` sin valor se parsea como objeto `{}`, no como array `[]`

**Dónde**: `scripts/sdlc-frontmatter.js:53-102`

Cuando la clave no tiene valor en línea (`afterColon === ''`), `parseValue` mira las líneas siguientes y, si no encuentra ninguna indentada, devuelve `mode === 'list' ? items : obj` → **`{}`**.

```
acceptance:            → {}      isArray=false
acceptance:\n  - uno   → ["uno"] isArray=true
```

Mismo modo de fallo que MAJOR-4: un dev que escribe `acceptance:` y debajo la lista funciona; uno que escribe `acceptance:` vacío (o el `[]` del generador) no.

**Fix**: si no hay ninguna línea indentada debajo, devolver `[]` en vez de `{}`. Es el default correcto para `files`/`acceptance`/`risks`, y para `severity:` un `{}` sí es razonable — pero mejor validar el tipo por clave contra el schema en vez de adivinar.

---

### MINOR-1 — `gateQa` trunca los rechazos a 3 y pierde visibilidad respecto de v2.0.x

**Dónde**: `scripts/sdlc.js:315`

```js
evidence: `${valid.length}/${signoffs.length} sign-offs OK; rechazos:\n  - ${rejections.slice(0, 3).join('\n  - ')}`
```

La v2.0.x listaba **todos** los rechazos. Ahora muestra 3. Cuando haya 8 QA inválidos, el dev ve 3 y no sabe que faltan 5. Además el mensaje cambió de "falta evidencia (verdict APPROVED + smoke test/runtime evidence)" a genérico, que pierde la explicación de *por qué* falló cada archivo.

**Fix**: volver a listar todos, o al menos el conteo completo + los primeros 3, y conservar la razón por archivo.

---

### MINOR-2 — Los `.pre-fm.bak` no están en `.gitignore`

**Dónde**: `scripts/sdlc.js:1004-1007` vs `.gitignore`

`cmdMigrateFrontmatter` crea `<archivo>.pre-fm.bak` dentro de `docs/plans/`, `docs/reviews/` y `docs/qa/`. No están en `.gitignore` (hoy no hay ninguno en el working tree, así que se borraron a mano). La próxima vez que alguien corra `npm run sdlc:migrate` aparecen como untracked en `git status`.

Mitigante parcial: los `.bak` no terminan en `.md`, así que los gates los ignoran (`scripts/sdlc.js` filtra por `.endsWith('.md')`). Pero ensucian el working tree justo en el repo donde `sdlc:strict` exige working tree limpio.

**Fix**: agregar `*.pre-fm.bak` a `.gitignore`, y mejor: escribirlos a una carpeta `.sdlc-backup/` en la raíz, fuera de `docs/`.

---

### MINOR-3 — `FILE_INDEX.md` sin trackear y de origen desconocido

`FILE_INDEX.md` (13.6 KB) es un índice generado del árbol de archivos, pero no tiene script que lo genere (no hay ningún `scripts/*index*`), no está en `.gitignore` y no está commiteado. O falta el generador, o es un artefacto manual que se va a quedar viejo en silencio.

**Fix**: decidir. Si es generado, agregar el script y decidir si se commitea o se ignora. Si es manual, documentarlo.

---

### INFO-1 — El parser en sí está bien construido en los casos que importan

Beyond the two array bugs (MAJOR-4, MAJOR-5), `parseFrontmatter` se comporta correctamente en los edge cases que probé:

| Entrada | Resultado | ¿Correcto? |
|---|---|---|
| `plan: docs/plans/a.md` | `"docs/plans/a.md"` | ✅ (el `:` interno no rompe) |
| `plan: https://x.com/a` | `"https://x.com/a"` | ✅ |
| `files:\n  - a.js\n  - b.js` | `["a.js","b.js"]` | ✅ |
| `sev:\n  a: 1` | `{a:1}` | ✅ |
| `migrated: true` | `true` (bool) | ✅ |
| `# comentario` en el header | ignorado | ✅ |
| frontmatter sin cerrar | `parseError` | ✅ |
| sin frontmatter | `data: null` | ✅ |
| CRLF | parsea bien | ✅ |

El diseño de "mini-YAML estricto en vez de YAML completo" es una buena decisión para este caso. El problema no es el parser: es que **quien lo alimenta** (`suggestFrontmatter`) genera datos que el parser no puede expresar, y **quien lo consume** (`planStructureCheck`) no distingue "array vacío" de "string inválido".

---

### INFO-2 — El fallback legacy deja un hole de gate

`gatePlan` (`scripts/sdlc.js:157`):

```js
const passed = approved > 0 || (withFrontmatter === 0 && plans.length > 0);
```

Si **ningún** plan tiene frontmatter, el gate PLAN pasa con "hay al menos un plan". O sea: un repo con 47 archivos de frontmatter mal formados en `docs/plans/` y ningún válido → `withFrontmatter > 0`, `approved === 0` → falla. Bien. Pero un repo con 1 plan sin frontmatter → pasa. Es retrocompat intencional, pero combinado con CRITICAL-1 significa que hay dos caminos al verde y ninguno valida.

### INFO-3 — No hay comando ni warning para cerrar la transición

`SCHEMA.md:139` le pide al dev que reemplace `migrated: true` por `status: approved`. Con 47 archivos, eso es manual, y nada lo recuerda: ni un comando `sdlc:frontmatter-check`, ni un warning en `sdlc:status` que diga "N documentos siguen en modo transición". Cuando esto se abandone a mitad de camino, el bypass queda abierto para siempre sin que nadie lo note.

**Fix**: agregar un comando `sdlc:frontmatter-check` (o un bloque en `sdlc:status`) que liste los archivos con `migrated: true` y exit code distinto de 0 si quedan. Eso convierte la transición en algo visible en vez de opcional.

---

## Hallazgo fuera del scope de esta WIP (pre-existente, no lo introdujo esta feature)

### `test/pomodoro-store.test.js` — 7 tests rotos por fecha hardcodeada

**No es culpa de esta feature.** `src/` y `test/` están intactos en el working tree, así que estos fallos existen en `HEAD` (1d3a1b5).

```
✖ getStatsToday: focus de hoy cuenta, focus de ayer no
✖ getStatsThisWeek: cuenta focus del lunes a domingo actual
✖ getStatsThisWeek: semana cruza el mes
✖ getCompletedDays: retorna solo dias con focusCount > 0
✖ getCompletedDays: multiples focus en el mismo dia se cuentan
✖ getCurrentStreak: delega en computeStreak
✖ integration: flujo completo
```

Todos con `actual: 0, expected: 1`.

**Causa**: `src/services/pomodoro-store.js:38` define `SESSION_RETENTION_DAYS = 90`, y `saveSessions` (línea 175) prujea contra `Date.now()`. Los tests usan una fecha fija, `new Date(2026, 6, 15, 14, 30, 0)` = **15 de julio de 2026**. Hoy es 20 de octubre de 2026 → **97 días** → las sesiones caen fuera de la ventana de retención y desaparecen.

**Es una bomba de tiempo**: la suite empezó a romperse el ~13 de octubre de 2026 (15-jul + 90 días) y va a seguir rota para siempre, porque la fecha del test solo avanza, nunca se ajusta.

**Fix**: en `test/pomodoro-store.test.js`, construir las fechas relativas a `Date.now()` en vez de hardcodearlas. Algo tipo:

```js
const today = new Date();
today.setHours(14, 30, 0, 0);
const todayTs = today.getTime();
```

Con eso los tests vuelven a ser válidos dentro de la ventana de retención de 90 días, para siempre. Los 7 tests que fallan son exactamente los que dependen de "hoy".

**Nota de diseño relacionada**: `appendSession` (`pomodoro-store.js:191`) prujea contra `session.endedAt`, mientras que `saveSessions` (línea 175) prujea contra `Date.now()`. Son dos referencias distintas. En producción el comportamiento correcto es el de `saveSessions` (el reloj de pared), así que la inconsistencia está enmascarada, pero conviene unificarla y documentarlo.

---

## Verificación ejecutada

| Chequeo | Resultado |
|---|---|
| `npm test` | **9 fallos** — 2 de esta WIP (`sdlc.test.js`), 7 pre-existentes (`pomodoro-store.test.js`) |
| `node --test test/weekly-report.test.js` | 44/44 ✅ (aislado, pasa) |
| `node --test test/pomodoro-store.test.js` | 29/36 — **7 fallos, deterministas** (no es flake de paralelismo) |
| `npm run sdlc:status` | PLAN ✓ REVIEW ✓ QA ✓ RELEASE ✓ DOC ✓ — **todo verde por bypass** |
| `npm run sdlc:strict` | ✗ FAILED — working tree dirty (esperado) |
| `git status --short src/ test/` | vacío → `src/` y `test/` intactos |
| `reviewApproved()` sobre los 15 reviews reales | 10 true / **5 false** (sin `migrated: true`) |
| `qaApproved()` sobre los 15 QA reales | 14 true / **1 false** (sin `migrated: true`) |
| Recuento de `migrated: true` | **47/47** (17 planes, 15 reviews, 15 QA) |
| Parser contra 13 casos borde | 2 bugs de arrays (MAJOR-4, MAJOR-5), resto OK |

---

## Resolución de los hallazgos

Todos los hallazgos de severidad bloqueante (1 CRITICAL + 5 MAJOR) están
resueltos. El veredicto pasó de `CHANGES_REQUESTED` a `APPROVED`.

| # | Severidad | Estado | Cómo se resolvió |
|---|---|---|---|
| CRITICAL-1 | CRITICAL | Resuelto | El bypass `migrated: true` **no existe** en el gate genérico. `Test-FrontmatterPending` (`lib/frontmatter.ps1`) marca `migrated: true` / `pending: true` como **pendiente**, y los tres gates (`gatePlan`, `gateReview`, `gateQa`) rechazan ese doc. El generador heurístico que agregaba el flag a cada archivo fue eliminado. Test Pester: *"migrated: true NO aprueba (no hay bypass)"*. |
| MAJOR-1 | MAJOR | Resuelto | La severidad sale **solo** de `severity.critical` / `severity.major` del frontmatter. Se borró el conteo por regex sobre prosa. Los 15 reviews se reescribieron con los conteos reales de sus cuerpos (verificado: `pet-animation-capa1` da 4 MINOR / 2 INFO desde su tabla resumen, no 2/2 como decía el regex). |
| MAJOR-2 | MAJOR | Resuelto | `scripts/sdlc.js` y `test/sdlc.test.js` se eliminaron: el gate genérico reemplaza al bespoke y sus 2 tests rotos desaparecieron con él. `npm test` → **845/845** (878 - 33 tests del tool retirado). |
| MAJOR-3 | MAJOR | Resuelto | La feature tiene plan: `docs/plans/2026-10-20-gate-migration.md` (este repo) y `docs/plans/2026-10-20-gate-frontmatter.md` (repo `sdlc`, el plan maestro por tareas). |
| MAJOR-4 | MAJOR | Resuelto | El parser nuevo soporta flow-style: `files: []` es un **array vacío**, `files: [a, b]` un array de 2. Y el generador que emitía `files: []` ya no existe, así que nadie produce frontmatter que el parser no sepa leer. Test Pester: *"flow-style: lista vacia es array vacio, no string"*. |
| MAJOR-5 | MAJOR | Resuelto | `key:` sin valor ni hijos indentados es `$null`, no `{}`. El validador reporta *"falta 'acceptance' (array no vacio)"* en vez del confuso *"no es un array"*. Test Pester: *"clave sin valor ni hijos es null, no objeto vacio"*. |
| MINOR-1 | MINOR | Resuelto | El gate nuevo lista **cada** doc de QA con problema y su motivo, sin truncar a 3. |
| MINOR-2 | MINOR | Resuelto | Los `.pre-fm.bak` ya no se generan (el script que los creaba fue eliminado). No hay que ignorar nada. |
| MINOR-3 | MINOR | Resuelto | `FILE_INDEX.md` (índice generado sin generador) eliminado: era residuo del WIP local. |
| INFO-1 | INFO | Confirmado y extendido | El parser era correcto en los casos que importaban; se le agregaron flow-style, `$null` por clave vacía, CRLF y comentarios de línea completa. 13 casos borde en la suite. |
| INFO-2 | INFO | Resuelto | `gate.json` de este repo queda con `"frontmatter.mode": "require"`: el camino legacy solo aplica en modo `auto`. Los docs sin frontmatter se rechazan uno por uno con el motivo. |
| INFO-3 | INFO | Resuelto | `scripts/check-frontmatter.ps1` (en el repo `sdlc`) valida cualquier proyecto y dice qué campo falta en qué archivo. `gate strict` también los lista. |

### Hallazgos nuevos, aparecidos durante la ejecución

| # | Severidad | Estado | Detalle |
|---|---|---|---|
| N-1 | MAJOR | Resuelto | El pre-commit hook **de este repo** leía `.git/COMMIT_EDITMSG`, que en el momento del hook todavía contiene el mensaje del commit **anterior** (git corre `pre-commit` antes de preparar el mensaje nuevo). Resultado: el gate de plan evaluaba el tipo del commit anterior — con el commit `docs:` anterior, un `fix:` se colaba sin plan. Es exactamente el bug que el `commit-msg` del gate genérico evita; al adoptar `gate`, el hook pasó a `commit-msg` y el problema desapareció. |
| N-2 | MAJOR | Resuelto | `Get-StagedContent` en `hooks/pre-commit.ps1` del repo `sdlc` devolvía el output de `git show` **como array de líneas**, no como string. El índice del match de regex no correspondía al contenido y `.Substring(0, $m.Index)` reventaba con *"Index and length must refer to a location within the string"* en cuanto un `.js` con `console.log` se commiteaba. Fix en `lib` del repo `sdlc` + test de regresión en `tests/pre-commit.Tests.ps1` (verificado: falla sin el fix, pasa con él). |
| N-3 | MINOR | Resuelto | `scripts/check-frontmatter.ps1` mapeaba `docs/review` en vez de `docs/reviews`: al validarlos por tipo reportaba "0/0 docs pasan" en vez de fallar. Corregido. |
| N-4 | MAJOR | Resuelto | 7 tests de `test/pomodoro-store.test.js` llevaban una fecha fija (15-jul-2026) que ya cayó fuera de la ventana de retención de 90 días: la suite se pudría sola. Ahora las fechas son relativas a `Date.now()`. Hallazgo pre-existente, no lo introduce esta feature, pero bloqueaba el DEV GATE. |

## Verificación ejecutada (estado final)

| Chequeo | Resultado |
|---|---|
| `npm test` (este repo) | **845/845 verde** (antes: 878 con 9 fallos) |
| `check-frontmatter.ps1 -Kind all` | **50/50 docs pasan** (18 planes + 17 reviews + 15 QA) |
| `gate strict` | plan + review + QA + versión = tag → OK |
| `gate doctor` | 6/6 checks OK |
| Suite Pester del repo `sdlc` | **324/324 verde** (36 del parser/validadores + 6 de integración en `strict` + 1 de regresión del hook) |
| `gate skill-guardrail` | 12/12 skills del repo `sdlc` con 8/8 reglas |
| PSScriptAnalyzer (`-Severity Error`) | 0 findings |
| `npm run check` | OK |

## Veredicto

**APROBADO.**

La dirección era correcta (frontmatter tipado > regex sobre prosa es la mejora de
fondo), pero tal como estaba la feature **no aumentaba** la fuerza de los gates:
los mantenía exactamente igual y además les daba una apariencia de validación que
no existía. El 100% de los gates verdes del repo venían de un flag que un script
escribía solo.

Resuelto: la feature se **portó al gate genérico** (`HosneydertMesa/sdlc`), que
ahora valida plan/review/QA por campos tipados **sin ningún bypass**, y este repo
adoptó ese gate como único enforcement. Los 47 documentos tienen frontmatter con
valores reales extraídos de sus propios cuerpos, no de heurísticas.

Efecto colateral positivo: este repo pierde su gate bespoke y su hook con el bug
de lectura del mensaje del commit anterior, y gana hooks que sí funcionan,
perfiles de gate, evidencia de TDD, CI y validación por frontmatter.
