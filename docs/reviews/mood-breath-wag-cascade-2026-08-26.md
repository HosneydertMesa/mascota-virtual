---
id: mood-breath-wag-cascade-2026-08-26
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 1
  info: 4
---

# Review: mood body offset — cascade de breathing / wag

**Fecha**: 2026-08-26
**Reviewer**: Cloud agent (adversarial pass on `origin/main..HEAD`)
**Branch**: `cursor/mood-keyframe-cascade-7597`
**PR**: #3 (NEW, no reabre PR #2)
**Plan**: `docs/plans/mood-breath-wag-cascade-2026-08-26.md`
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 1 MINOR (test hardening, aplicado), 4 INFO

---

## Resumen ejecutivo

El slice 1 (PR #2) compuso mood en `animations.css` (`--mood-dy` /
`--mood-rot` en `breathing`, `--mood-tail` en `wag`). `dashboard.css`
seguía redefiniendo esas `@keyframes` **sin** las vars. `styles.css`
importa dashboard **después**, así que el cascade tiraba el offset:
calm se veía como el default.

Fix preferido: **borrar** los duplicados. Mismo patrón que el gait
(`dashboard.css no redefine walk gait`). Tests nuevos flatten
`src/styles.css` y miran la **última** definición, no solo
`animations.css` (el test de slice 1 habría seguido verde con el bug).

Diff vs `origin/main` (`f090489`):
- `src/styles/dashboard.css`
- `test/pet-assets.test.js`
- `docs/plans/mood-breath-wag-cascade-2026-08-26.md`

No se tocó Pixi, arte SVG, gait, chat, AI, Pomodoro, `pet-motion.js`,
drag/fall/bar/cursor, `pet-mood.js`.

---

## Hallazgos

### [MINOR] [Tests] Token `@keyframes breathing` no toleraba whitespace extra

**File**: `test/pet-assets.test.js` (`extractKeyframeBodies`)
**Issue**: Un `@keyframes  breathing` (dos espacios) o newline es CSS
válido y el scanner original no lo veía.
**Impact**: Bajo. El bug real copia `@keyframes breathing {`. Un
reintroducción ofuscada evadiría el guard.
**Fix**: aplicado en este PR — regex `@keyframes\s+name` con
negative lookahead de identificador.

### [INFO] [Tests] `extractKeyframeBody` sigue siendo first-match

Los tests de gait usan first-match. El test de cascade usa
`lastKeyframeBody`. Correcto: first-match en el bundle envenenado
seguiría viendo las vars de `animations.css` y false-passearía.

### [INFO] [CSS] `.anim-breath` / `.anim-wag` siguen duplicados en dashboard

A propósito. No redefinen el nombre de la animación. El `@keyframes`
ganador sigue siendo el de `animations.css`.

### [INFO] [CSS] `blink` / `earTwitch*` siguen duplicados

Misma clase de bug, otro nombre. Oreja mood vs twitch es rewrite;
fuera de scope.

### [INFO] [Tests] El guard de dashboard es vacuamente verde si no hay bodies

Intencional: "si redefine, debe incluir mood vars". La prueba del
cascade vivo es flatten + last-match, que no es vacua.

---

## Verificación

| Check | Resultado |
|---|---|
| `npm test` | 896 pass, 0 fail |
| `npm run check` | verde |
| RED: reinyectar bloques viejos en dashboard.css | ambos tests de cascade fallan (`--mood-dy` ausente) |
| GREEN: delete restaurado | ambos pasan |
| Archivos prohibidos | no tocados |

## Veredicto

**APPROVED**. No mergear desde este agente.
