# Plan: strict-mode by date (MINOR-4 del review)

> Endurecer `cmdStrict` para que NO acepte reviews/qa de features
> anteriores como evidencia del batch actual.

## Contexto

`MINOR-4` del review retroactivo (`docs/reviews/retroactivo-m3-parser-2026-07-21.md`)
detectó que `cmdStrict` acepta cualquier review con `APPROVED` y cualquier
sign-off QA, aunque sean de features anteriores. Un feature nuevo podría
"heredar" el verde de uno viejo sin haber pasado por las gates.

**Hoy**: si commiteás un `feat:` nuevo y corrés `npm run sdlc:strict`,
el comando puede pasar verde porque el review APPROVED es de v1.1.0 y
el sign-off QA también. **Bug.**

**Esperado**: `cmdStrict` solo debe aceptar review/qa fechados **después
del último tag** (o sea, que correspondan al batch actual).

## Decisión de diseño

**Filtro por mtime del archivo**, no por fecha embebida en el contenido.
Razón: es lo único verificable sin parsear markdown. Si alguien quiere
hacer trampa tocando el archivo, está haciendo trampa a un nivel que
ya no es problema de tooling.

**Comportamiento esperado de `cmdStrict`**:

```
Tag base:         v1.2.0
Commits nuevos:   1 (feat: x)

Gate check:
  ✓ PLAN     ...
  X REVIEW   0 review(s) recientes (mtime >= 2026-07-21); 2 review(s) totales pero son de antes
  X QA       0 sign-off(s) recientes; 2 sign-off(s) totales pero son de antes
```

Para `cmdStatus` (vista general), el comportamiento NO cambia: sigue
mostrando "passed" si hay cualquier review APPROVED, sin importar fecha.
Razón: `status` es informativo, no bloqueante. `strict` es el gate.

## Cambios concretos

### 1. Helper `tagDate(tag)`

```js
function tagDate(tag) {
  if (!tag) return null;
  return parseInt(shOut('git', ['log', '-1', '--format=%ct', tag], { allowFail: true }), 10) * 1000;
}
```

Retorna timestamp en ms (o `null` si no hay tag).

### 2. `gateReview(opts)` y `gateQa(opts)` aceptan `opts.since`

```js
function gateReview(opts = {}) {
  // ... existing logic ...
  const files = listDir('docs', 'reviews').filter(f => f.endsWith('.md'));
  let approved = files.filter(f => /* APPROVED && !CHANGES_REQUESTED */);
  if (opts.since) {
    const cutoff = opts.since;
    approved = approved.filter(f => {
      const stat = fs.statSync(path.join(getRoot(), 'docs', 'reviews', f));
      return stat.mtimeMs >= cutoff;
    });
  }
  return { passed: approved.length > 0, evidence: ... };
}
```

Idem `gateQa`. Si `opts.since` no se pasa, comportamiento actual
(acepta todos).

### 3. `cmdStrict` pasa `since = tagDate(lastTag)`

```js
const since = lastTag ? tagDate(lastTag) : null;
const review = gateReview({ since });
const qa = gateQa({ since });
```

Y muestra evidencia con la fecha de corte cuando filtra:
```
"0 review(s) con APPROVED desde 2026-07-21 (2 totales)"
```

### 4. `cmdStatus` NO cambia

Mantiene la firma vieja (sin opts) y comportamiento viejo.

## Archivos a tocar

- `scripts/sdlc.js` — `tagDate`, `gateReview`, `gateQa`, `cmdStrict`
- `test/sdlc.test.js` — 3-4 tests nuevos
- `docs/deliverables/retroactivo-m3-parser-2026-07-21.md` — sección
  "Trabajo futuro" marcar el MINOR-4 como done en v1.2.1

## Criterios de aceptación

- [ ] `cmdStrict` filtra review/qa por mtime del archivo
- [ ] `cmdStatus` mantiene comportamiento actual (sin filtro)
- [ ] Sin tag: `cmdStrict` no filtra (mismo comportamiento que antes)
- [ ] Review APPROVED creado HOY pero con mtime viejo → no cuenta
- [ ] Tests pasan (66-67/66-67)

## Riesgos

- **Bajo**: en Windows, `fs.statSync().mtimeMs` puede tener
  resolución de 2s (FAT) o 100ns (NTFS). No es problema porque
  filtramos por segundos.
- **Bajo**: si commiteás un review nuevo y corrés `cmdStrict` muy
  rápido (< 1s), el mtime puede ser < lastTag mtime. Mitigación:
  aceptar +- 2s de tolerancia. Si no, warning no bloqueante.

## Trabajo futuro

- Cuando se sume CI (GitHub Actions), `cmdStrict` corre ahí
  también, así que la fecha es del runner (no del dev).
- Considerar también filtrar `docs/plans/*.md` por fecha (un plan
  muy viejo no debería contar para un feat nuevo).
