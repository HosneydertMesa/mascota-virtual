# QA Sign-off: cmdStrict date-filter (MINOR-4)

> Sign-off del commit `00a4a8a feat(sdlc): date-filter review/qa
> in cmdStrict (close MINOR-4)`. Cierra el MINOR-4 del review
> retroactivo.

**Fecha**: 2026-07-21
**Branch**: main
**Tag base**: v1.2.0
**Review companion**: `docs/reviews/close-minor4-2026-07-21.md`

## Checklist (validación estática + automatizada)

### Tests automatizados
- [x] `npm run check` — sintaxis OK
- [x] `npm test` — **70/70 tests pasando** (7 nuevos)
- [x] `npm run sdlc:status` — gates se muestran correctamente
- [x] `npm run sdlc:strict` — falla limpio (working tree dirty antes
      del commit, ahora clean)

### Análisis del código

- [x] `tagDate(tag)` retorna `null` para tag inexistente, ms para existente
- [x] `gateReview({ since })` filtra por mtime sin romper el caso sin opts
- [x] `gateQa({ since })` igual
- [x] `cmdStrict` pasa `since = tagDate(lastTag)` a ambos gates
- [x] `cmdStatus` mantiene firma vieja (sin opts) → no rompe vista general
- [x] Cuando no hay tag, `tagDate` retorna null, gates se llaman sin opts
      → comportamiento legacy

### Edge cases cubiertos por tests

- [x] Review con mtime < cutoff → bloqueado
- [x] Review con mtime >= cutoff → pasa
- [x] Review sin opts.since → pasa (legacy)
- [x] QA con mtime < cutoff → bloqueado
- [x] Tag existente → timestamp en ms
- [x] Tag inexistente → null
- [x] Tag null/undefined/'' → null

### Comportamiento end-to-end

Verifiqué manualmente que después del commit:
```
$ npm run sdlc:strict
Tag base:         v1.2.0
Commits nuevos:   1
  Detalle:
    00a4a8a ﻿feat(sdlc): date-filter review/qa in cmdStrict (close MINOR-4)

Gate check:
  ✓ PLAN     3 plan(es)
  -- REVIEW   (skipped porque no hay review/qa firmados aún)
  -- QA       (skipped idem)
  ✓ RELEASE  tag v1.2.0 coincide
```

Una vez que firme este review + este qa, `cmdStrict` debería pasar
porque los mtimes van a ser >= tagDate(v1.2.0).

## Bugs encontrados durante QA

**0 bugs.**

## Decisión

**APROBADO** para release v1.2.1 (patch).

## Notas para el próximo ciclo

- El próximo feature va a tener que firmar review/qa para que
  `cmdStrict` pase, pero el filtro de fecha va a impedir "reusar" los
  de este batch. Esa es exactamente la mejora buscada.
- MINOR-2 (filtrar PLAN por fecha) queda para v1.3.0. Es más
  controversial (¿qué hace válido un plan viejo?) y necesita diseño.
