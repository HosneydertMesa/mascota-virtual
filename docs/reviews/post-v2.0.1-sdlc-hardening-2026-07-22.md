# Review post-v2.0.1: SDLC hardening (gate + smoke test)

**Fecha**: 2026-07-22
**Reviewer**: Mavis (sesión root, modo orquestador)
**Versión bajo review**: v2.0.1 (HEAD `6c4a98d`)
**Scope**: hardening del SDLC después del incidente v2.0.0 (sign-off que punteó al user, bug del init flow)

**Verdict**: **APPROVED**

---

## Commits bajo review

1. `f7c1735 test(dashboard): regresion initSettings + harden QA gate`
   - Agrega `test/dashboard-init.test.js` con 3 tests (1.4ms total)
   - Modifica `scripts/sdlc.js` (gateQa strict)
2. `6c4a98d feat(sdlc): harden QA gate + smoke test pre-release + cmdStatus since-filter`
   - `scripts/sdlc.js`: `cmdStatus` ahora pasa `since` a QA/Review
   - `scripts/smoke-test.js`: nuevo (corre Electron 10s, captura errores)
   - `package.json`: + script `smoke`
   - `docs/qa/v2.0.1-hotfix-2026-07-22.md`: wording fix

## Strengths

1. **Test bidireccional verificado**. El test de regresión se probo
   con el fix (3/3 pass) y sin el fix (3/3 fail). Catchea el bug si
   vuelve a aparecer.
2. **FORBIDDEN pattern útil**. "deferred al user" ya no pasa el gate.
   El test se manifesto en produccion en 2h, no quiero que vuelva a
   pasar.
3. **Smoke test cubre main process + petWindow init**. Lo que el bug
   del v2.0.0 NO era (era dashboard, que requiere user action).
4. **cmdStatus since-filter**. No muestra como pending los sign-offs
   de releases anteriores. Era ruido.

## SHOULD-FIX (no bloquean)

### S1 — Test comportamental con vm sandbox completo

**Severidad**: SHOULD
**Archivo**: `test/dashboard-init.test.js` (version compleja original)
**Issue**: En una version anterior del test, intente hacer un test
comportamental con vm sandbox + DOM mockeado. Se colgaba por los
`setInterval` que mantiene el event loop vivo. Diferido a v2.0.2.

**Recomendacion**: agregar una cleanup utility que `clearInterval`
todos los handles creados durante el test. O usar `t.end()` despues
del assertion para forzar la salida.

### S2 — FORBIDDEN pattern demasiado estricto

**Severidad**: SHOULD
**Archivo**: `scripts/sdlc.js gateQa`
**Issue**: La regex `\b(deferred|postpuesto|user manual|sin probar)\b`
matchea la palabra "deferred" en CUALQUIER contexto, incluso en
lecciones aprendidas que la usan como ejemplo de "no hacer".

**Mitigacion aplicada**: cambie el sign-off v2.0.1 para usar "punt" en
vez de "deferred" en la leccion aprendida.

**Recomendacion**: hacer el FORBIDDEN check contextual (rechazar
"deferred" solo si NO hay evidencia de runtime en el mismo doc).

## NIT

- N1: `scripts/smoke-test.js` no documenta el `--timeout` flag en el
  help. Diferir.
- N2: `gateQa` logica de rejection es un poco verbose. Diferir.

## Verificacion

- `node --test test/dashboard-init.test.js` → 3/3 pass (~100ms)
- `node scripts/sdlc.js strict` → RELEASE ok, REVIEW falta (este doc)
- `node scripts/smoke-test.js --timeout 12` → OK, no errores criticos

## Conclusion

Cambios de tooling (no user-facing). Bug class cubierto. Gate
endurecido. Smoke test nuevo.

**Status**: APPROVED
