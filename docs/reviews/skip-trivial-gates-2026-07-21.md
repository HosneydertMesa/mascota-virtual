# Code Review: skip review/qa for trivial-only batches (v1.2.2)

> Self-review del commit `da69536 fix(sdlc): skip review/qa gates
> when all commits since tag are trivial`. Cierra el edge case
> descubierto en v1.2.1 (un commit `docs:` no debería requerir
> review/qa).

**Fecha**: 2026-07-21
**Tag base**: v1.2.1
**Commit revisado**: `da69536`

## Verdict

**APPROVED**. Cambio chico, lógica correcta, tests cubren los 2 casos
(only-trivial → skipea, mix → exige).

## MINOR carry-over (sin cambios)

- MINOR-1 del review de v1.2.1: clock skew en CI
- MINOR-2 del review de v1.2.1: `gatePlan({ since })`

## Notas

- El cambio es backward-compatible: batches con commits no-triviales
  siguen exigiendo review/qa (test "mix de feat + docs → sigue
  exigiendo review/qa").
- El test "solo commits docs/chore desde el tag → skipea review/qa"
  cierra el loop infinito donde un commit de CHANGELOG requería su
  propio review/qa firmado.
