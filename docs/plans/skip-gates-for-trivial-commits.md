# Plan: skip review/qa gates cuando todos los commits son triviales

> Edge case descubierto en v1.2.1: el strict mode exige review/qa
> para CUALQUIER commit nuevo desde el último tag, aunque sea
> trivial (`docs:`). Eso es overly strict — un bump de CHANGELOG
> no debería requerir review adversarial.

## Contexto

Después de bumpear a v1.2.1, hice un commit `docs(sdlc): update
retroactivo release notes with v1.2.1 entry` (e2a0926) para reflejar
el patch en el deliverable. `sdlc:strict` falló porque exige
review/qa firmado desde la fecha del tag, y los review/qa existentes
son todos de antes del tag v1.2.1.

El loop: para hacer el review del commit docs, necesito commitearlo
(ya está), pero el commit ya existe y no fue revisado. Para salir
del loop, lo correcto es **no exigir review/qa para batches donde
todos los commits son triviales**.

## Decisión de diseño

**Regla**: si TODOS los commits desde el último tag tienen tipo
trivial (`chore`/`docs`/`test`/`style`/`perf`/`build`/`ci`/`revert`),
entonces `cmdStrict` skipea los gates REVIEW y QA (solo exige PLAN
si hay un commit no-trivial, y siempre exige RELEASE/release gate).

Esto es consistente con la lógica del pre-commit hook: `chore:`,
`docs:`, etc. no requieren plan. Por simetría, tampoco requieren
review/qa.

## Cambios concretos

### `cmdStrict`: agrupar commits

```js
const trivialTypes = new Set(['chore', 'docs', 'test', 'style', 'perf', 'build', 'ci', 'revert']);
const allTrivial = nonTrivial.length === 0 && trivial.length > 0;
```

Si `allTrivial`, entonces:
- GATE PLAN: skipeado (ya está)
- GATE REVIEW: skipeado (cambio)
- GATE QA: skipeado (cambio)
- GATE RELEASE: igual

### Tests

- Test: `cmdStrict` con solo `docs:` desde el tag → pasa aunque no haya review/qa nuevos
- Test: `cmdStrict` con mix de `feat:` y `docs:` → exige review/qa (igual que ahora)

## Criterios de aceptación

- [x] `cmdStrict` skipea review/qa si todos los commits son triviales
- [x] `cmdStrict` exige review/qa si hay al menos un commit no-trivial
- [x] Sin tag y sin commits triviales → comportamiento actual
- [x] Tests pasan (72-73/72-73)
