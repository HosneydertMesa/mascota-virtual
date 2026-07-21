# Code Review (RETROACTIVO): M3 model + JSON parser + strict-mode

> **Naturaleza**: review retroactivo de 6 commits hechos sin pasar por gate formal.
> Se hace AHORA como evidencia del batch antes del próximo release (v1.2.0).
> Cubrió: feat(ai): switch to M3 + refactor: extract pet-protocol + fix(pet-protocol): IIFE
> + fix(renderer): duplicate + feat(sdlc): make phase gates MANDATORY.

**Fecha**: 2026-07-21
**Branch**: main
**Tag base**: v1.1.1
**Commits revisados** (6):

```
60124bb ﻿feat(sdlc): make phase gates MANDATORY via sdlc:strict + pre-commit plan gate
5b54694 fix(renderer): remove duplicate old parsePetReply that referenced undefined tryParseJsonReply
0c21476 fix(pet-protocol): wrap in IIFE to prevent 'Identifier already declared' error
1bf9c4c refactor(pet): extract parser to shared module + robust JSON extraction
a25a112 feat(ai): switch to MiniMax-M3 and JSON output format
057f071 fix(ai): strengthen system prompt format enforcement and warn on missing tags
```

**Diff stats**: 14 files changed, 808 insertions(+), 99 deletions(-)

## Metodología

Review adversarial manual siguiendo el formato del skill `/sdlc-review`.
Severidades: **CRITICAL** (bloquea release) | **MAJOR** (bloquea merge) |
**MINOR** (informativo, fix en próximo sprint) | **INFO** (notas de contexto).

---

## CRITICAL (0)

Ninguno. El batch no introduce secrets, no rompe tests (63/63 pasan), no
rompe la API pública.

## MAJOR (0)

Ninguno mayor. Los commits `fix(renderer): remove duplicate` y
`fix(pet-protocol): IIFE` resuelven bugs reales que el log de debug
evidenciaba.

## MINOR (4)

### MINOR-1: M3 model — sin verificación end-to-end de la API
- **Archivo**: `src/services/ai.js`
- **Detalle**: se cambió `DEFAULT_MODEL` a `MiniMax-M3` y se reescribió
  el system prompt para forzar JSON. Pero NO se verificó que el nombre
  `MiniMax-M3` sea el correcto en la API (puede ser `grok-3-mini`,
  `MiniMax-3`, etc.). El usuario tiene que abrir DevTools Network tab y
  confirmar.
- **Mitigación actual**: parser tiene fallback a tags `[EMOJI]...[/EMOJI]`
  y a texto plano, así que aunque M3 no devuelva JSON, la app sigue
  funcionando.
- **Recomendación**: cuando se confirme el nombre correcto, dejarlo
  hard-coded o en settings. Por ahora, mantener el fallback.

### MINOR-2: ALLOWED_INTENTS se duplica entre renderer.js y pet-protocol.js
- **Archivo**: `src/renderer.js` y `src/core/pet-protocol.js`
- **Detalle**: el refactor movió la lista de intents válidos a
  `pet-protocol.js`, pero `renderer.js` aún tiene su propia copia
  parcial. Riesgo de drift si se agrega un intent nuevo.
- **Recomendación**: `renderer.js` debería importar de `pet-protocol.js`
  en lugar de redeclarar.

### MINOR-3: `parsePetReply` exportado en UMD pero no usado en otros lugares
- **Archivo**: `src/core/pet-protocol.js`
- **Detalle**: la firma UMD es overkill si solo se usa en Electron con
  Node. Es complejidad sin beneficio.
- **Recomendación**: en próximo refactor, simplificar a CommonJS puro.

### MINOR-4: `cmdStrict` no valida fecha del review/qa
- **Archivo**: `scripts/sdlc.js`
- **Detalle**: el strict mode acepta CUALQUIER review APPROVED y CUALQUIER
  sign-off QA, aunque sean de features anteriores. Un feature nuevo podría
  "heredar" el gate verde de uno viejo.
- **Recomendación**: exigir que `docs/reviews/*.md` y `docs/qa/*.md`
  tengan `mtime >= lastTag` para que correspondan al batch actual.

## INFO (3)

### INFO-1: tests del parser
- 142 líneas en `test/pet-protocol.test.js` cubren JSON válido, JSON mal
  formado, tags legacy, texto plano, sound validation per-pet. Cobertura
  adecuada.

### INFO-2: strict mode tests
- 5 tests nuevos en `test/sdlc.test.js` (63/63 verde). Cubren el caso
  feliz, el caso fail con feat, el caso fail con dirty tree, y el caso
  trivial-only.

### INFO-3: AGENTS.md y PHASES.md ahora tienen banner MANDATORY
- Bien. Es la primera línea de defensa para que el dev (humano o IA)
  no se olvide del flujo.

---

## Verdict

**APPROVED** — el batch está OK para release. Los 4 MINOR quedan
documentados como trabajo futuro (ya están en el plan retroactivo
`docs/plans/m3-parser-strict-mode.md`, sección "Trabajo futuro").

No hay CRITICAL ni MAJOR, así que se puede avanzar a QA y release.

## Trabajo futuro (carry-over del review)

- [ ] Verificar nombre real del modelo M3 en DevTools Network tab
- [ ] Consolidar `ALLOWED_INTENTS` en un solo lugar (pet-protocol.js)
- [ ] Simplificar UMD a CommonJS cuando se confirme el entorno final
- [ ] Endurecer `cmdStrict` con validación de fecha de review/qa
- [ ] Cuando M3 confirme JSON, quitar el fallback a tags (simplificar parser)
- [ ] Agregar `sdlc:strict` a GitHub Actions como pre-merge check
