# Plan: mood body offset — cascade de @keyframes breathing / wag

> **Status**: Open
> **Date**: 2026-08-26
> **Author**: Cloud agent (follow-up AFTER PR #2 merge, commit f090489c)
> **Base**: `main` @ `f090489` — NEW PR, no reabrir PR #2
> **Size**: S
> **Tipo**: bugfix (review finding)

---

## 1. Goal

Que el offset de mood (`--mood-dy` / `--mood-rot` / `--mood-tail`)
aplique de verdad en el renderer vivo (Electron + SVG + PetViewport).
Hoy `mood-calm` (y el resto) se ve como el default porque el cascade
tira las keyframes canónicas.

## 2. Root cause (verificado en disco, no asumido)

1. Slice 1 (PR #2) compuso mood en breath/wag en
   `src/styles/animations.css`:
   - `@keyframes breathing` usa `var(--mood-dy)` y `var(--mood-rot)`
   - `@keyframes wag` usa `var(--mood-tail)`
   - `.pet-body` ya no lleva `transform: !important`
2. `src/styles.css` importa en este orden:
   `variables.css` → `animations.css` → `pet.css` → `dashboard.css`
3. `src/styles/dashboard.css` ~555-573 redefine `@keyframes breathing`
   y `@keyframes wag` **sin** esas vars. Como llega después, gana.
4. El test de slice 1 solo greppea `animations.css`
   (`test/pet-assets.test.js` "mood-* mueve cola…"). Un test que no
   mira el cascade no puede pillar este bug.
5. La misma clase de bug ya se arregló para walk: se borraron
   duplicados de gait en `dashboard.css` y hay un test
   `dashboard.css no redefine walk gait`.

Confirmado abriendo archivos en `main` @ `f090489`:
- `animations.css:10-24` — breathing/wag con mood vars
- `dashboard.css:555-569` — breathing/wag sin mood vars
- `src/styles.css:5-8` — dashboard importa al final

## 3. Fix preferido

**Borrar** los bloques `@keyframes breathing` y `@keyframes wag` de
`dashboard.css`. Dejar las reglas de clase (`.anim-breath`, `.anim-wag`,
`.anim-wag-fast`) — no pelean el nombre de la animación.

Dejar un comentario al estilo del gait (sin escribir el token
`@keyframes breathing` en el comentario, para no romper tests de
`includes`).

**Alternativa rechazada**: reescribir los duplicados con las mismas
vars. Son duplicados verdaderos; un solo source (animations.css).

## 4. Fuera de scope

- No migrar a Pixi. Pixi está en el árbol y no corre.
- No tocar arte SVG (`cat.js` / `dog.js`), gait CSS, chat, AI
  (`src/services/ai.js`, `src/renderer/chat-response.js`), Pomodoro,
  `PET_PROFILES` / `src/core/pet-motion.js`, drag/fall/bar/cursor en
  `main.js`, `src/core/pet-mood.js`.
- Oreja mood `transform` vs `ear-twitching`: skip. Componer
  `--mood-ear-rot` en `earTwitch*` es un rewrite, no un delete.

## 5. Archivos a tocar

| Archivo | Cambio |
|---|---|
| `src/styles/dashboard.css` | Borrar `@keyframes breathing` y `@keyframes wag`. Comentario canonical. |
| `test/pet-assets.test.js` | Tests de CASCADE: flatten de `src/styles.css` (resuelve `@import` en orden) y última definición gana. |
| `docs/plans/mood-breath-wag-cascade-2026-08-26.md` | Este plan |

No tocar `animations.css` salvo que un test lo exija (no debería).

## 6. Tests (el punto del bug)

Un test que solo lee `animations.css` **no cuenta**. Tiene que:

1. Flatten `src/styles.css` resolviendo `@import` en orden (el mismo
   cascade que Electron).
2. Extraer la **última** definición de `@keyframes breathing` y
   `@keyframes wag` (no `indexOf` del primero — eso es lo que ya
   pasa el test de slice 1 con el bug vivo).
3. Assert: winning `breathing` incluye `var(--mood-dy)` y
   `var(--mood-rot)`.
4. Assert: winning `wag` incluye `var(--mood-tail)` (es la var de
   mood en wag; `--mood-dy`/`--mood-rot` son del body).
5. Si `dashboard.css` redefine `breathing`/`wag`, esas copias
   **también** deben incluir las mood vars. Así el test falla si
   alguien reintroduce duplicados pelados.

RED esperado en `main` actual: winning body de dashboard no tiene
`--mood-dy`. GREEN después del delete.

## 7. Criterios de aceptación

- [ ] `dashboard.css` no redefine `@keyframes breathing` ni `@keyframes wag`, o si lo hace, con las mismas mood vars
- [ ] Tras flatten de `styles.css`, la definición ganadora de `breathing` incluye `--mood-dy` y `--mood-rot`
- [ ] Tras flatten, la ganadora de `wag` incluye `--mood-tail`
- [ ] El test de cascade falla si se reintroduce el bloque viejo de dashboard
- [ ] `npm test` y `npm run check` verdes
- [ ] PR nuevo contra `main`. No reabrir / no pushear a PR #2. No merge.

## 8. Riesgos

- **Bajo.** Mismo patrón que el fix de walk gait.
- Preview `test/preview/cat-walk-preview.html` carga animations.css
  y después dashboard.css: sin el delete, el preview también pierde
  mood. El flatten de `styles.css` cubre producción (`index.html` y
  `dashboard.html` usan `styles.css`).
- Dejar `.anim-breath` / `.anim-wag` en dashboard no cambia el
  `@keyframes` ganador.

## 9. Próximos pasos

1. Tests de cascade (TDD, ver fallar en main).
2. Borrar duplicados en `dashboard.css`.
3. `npm test` + `npm run check`.
4. Review adversarial + PR nuevo.
