# Code Review: cmdStrict date-filter (MINOR-4)

> Self-review del commit `00a4a8a feat(sdlc): date-filter review/qa
> in cmdStrict (close MINOR-4)`. Cierra el MINOR-4 del review
> retroactivo anterior.

**Fecha**: 2026-07-21
**Branch**: main
**Tag base**: v1.2.0
**Commit revisado**: `00a4a8a`
**Diff stats**: 3 files, +288 -13

## Metodología

Review adversarial manual. Severidades: CRITICAL | MAJOR | MINOR | INFO.

---

## CRITICAL (0)

Ninguno.

## MAJOR (0)

Ninguno.

## MINOR (2)

### MINOR-1: clock skew en CI

- **Detalle**: cuando se sume CI (GitHub Actions) en el futuro, el
  `mtime` del archivo de review se setea en el runner, que puede tener
  un clock distinto al del dev. Si el dev corre `cmdStrict` localmente
  con un clock adelantado 5 min, puede filtrar reviews correctos.
- **Mitigación actual**: el `tagDate` viene del commit del tag (que se
  fija una vez), así que el cutoff es estable. El sesgo está en el
  `mtime` del file de review, no en el cutoff.
- **Recomendación**: si se ve en producción, agregar tolerancia de
  ±60s. Por ahora no urge.

### MINOR-2: no se filtra PLAN por fecha

- **Detalle**: igual que con review/qa, `cmdStrict` acepta cualquier
  plan en `docs/plans/*.md` aunque sea de un feature viejo. Un
  feature nuevo podría "reusar" un plan de hace 6 meses.
- **Recomendación**: en próximo ciclo, agregar `gatePlan({ since })`
  también. Lo dejo para v1.3.0 — es un cambio pequeño pero requiere
  decidir si la política es "plan vigente debe ser del batch actual"
  o "plan vigente debe ser < 90 días" o "plan vigente debe mencionar
  el branch". Cualquier opción necesita discusión.

## INFO (2)

### INFO-1: tests cubren los 3 escenarios clave

7 tests nuevos (70/70 verde):
- `gateReview` filtra con `since` cuando mtime < cutoff
- `gateReview` acepta con `since` cuando mtime >= cutoff
- `gateReview` legacy (sin since) NO filtra
- `gateQa` filtra con `since`
- `tagDate` retorna ms para tag existente
- `tagDate` retorna null para tag inexistente
- `tagDate` retorna null para input falsy

### INFO-2: la salida del strict mode es más informativa

Antes: "0 review(s) con APPROVED"
Ahora: "0 review(s) con APPROVED desde 2026-07-21 (2 total pero son de antes)"

Eso evita confusión cuando alguien tiene reviews viejos y se pregunta
por qué falla el strict.

---

## Verdict

**APPROVED** — el cambio cierra correctamente el MINOR-4. Los 2 MINOR
nuevos quedan como trabajo futuro documentado.

## Trabajo futuro (carry-over)

- [ ] MINOR-1: tolerancia de clock skew para CI (±60s)
- [ ] MINOR-2: `gatePlan({ since })` también
- [ ] Cuando se agregue CI, smoke test del filtro en runner
