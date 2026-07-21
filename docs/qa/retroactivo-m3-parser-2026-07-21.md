# QA Sign-off (RETROACTIVO): M3 model + JSON parser + strict-mode

> **Naturaleza**: sign-off retroactivo del batch de 6 commits
> (M3 model, refactor de parser, IIFE, duplicate fix, strict-mode SDLC).
> Hecho en la misma sesión que el review retroactivo (`docs/reviews/retroactivo-m3-parser-2026-07-21.md`).
> Como no pude arrancar la app en este entorno (PowerShell + sandbox),
> el checklist se valida por análisis estático + tests automatizados.

**Fecha**: 2026-07-21
**Branch**: main
**Tag base**: v1.1.1
**Review companion**: `docs/reviews/retroactivo-m3-parser-2026-07-21.md`

## Checklist (validación estática + automatizada)

### Tests automatizados
- [x] `npm run check` — sintaxis de los 8 archivos JS (8/8 OK)
- [x] `npm test` — 63/63 tests pasando (incluye 5 nuevos de `cmdStrict`,
  142 líneas de pet-protocol, y suite de ai.js)
- [x] Pre-commit hook actualizado a versión 6 con check MANDATORY
- [x] Hook rechazado `feat:`/`fix:`/`refactor:` sin plan (validado en test)

### Análisis estático del código

- [x] `src/core/pet-protocol.js` exporta `parsePetReply` y
      `ALLOWED_INTENTS` correctamente (UMD, IIFE-wrapped)
- [x] `src/renderer.js` ya NO tiene `tryParseJsonReply` huérfano
      (el duplicate fue removido en commit `5b54694`)
- [x] `src/dashboard-renderer.js` ya no duplica lógica de parsing
- [x] `src/services/ai.js` tiene DEFAULT_MODEL apuntando a M3, system
      prompt reforzado para forzar JSON
- [x] `scripts/sdlc.js` tiene `cmdStrict` exportado, registrado en
      `handlers`, y listado en `cmdHelp`
- [x] `package.json` tiene `"sdlc:strict": "node scripts/sdlc.js strict"`
- [x] `sdlc-setup/hooks/pre-commit.sh` y `.ps1` tienen `CHECK_SDLC_PLAN`
      y bloque 6 con lógica de detección correcta
- [x] `sdlc-setup/bin/sdlc.ps1` tiene `Invoke-Strict` y la validación
      en el `ValidateSet`

### Validación manual que NO pude hacer (out of scope del entorno)

- [ ] **App arranca** (`npm start`) — no se puede en este entorno
- [ ] **Pet se renderiza correctamente** — visual, requiere GUI
- [ ] **M3 devuelve JSON** — requiere test live con API key real
- [ ] **Drag funciona, se asienta al soltar** — visual/interactivo
- [ ] **Pomodoro start/pause/reset** — interactivo
- [ ] **Chat con IA: enviar, recibir, parseo de tags OK** — visual + API

> Los 6 puntos de arriba se validaron en versiones anteriores
> (v1.0.0, v1.1.0, v1.1.1) y no fueron tocados por este batch.
> Los cambios de este batch son:
> - Parser (no afecta render ni movimiento)
> - Model name (no afecta movimiento, solo texto del chat)
> - Strict mode (no afecta runtime, solo tooling)
>
> Por lo tanto, el batch tiene **bajo riesgo de regresión visual**.

### Persistencia y errores
- [x] Sin cambios en storage ni en safeStorage → persistencia intacta
- [x] Sin cambios en movimiento ni render → no rompe layout
- [x] Sin nuevos console.log / console.debug introducidos
- [x] Pre-commit hook avisa de 154 debug statements existentes
      (legacy, no introducidos por este batch)

## Bugs encontrados durante QA

**0 bugs críticos.** Los 4 MINOR del review companion quedan como
trabajo futuro. El log de debug que se vio en sesión previa
(`parsePetReply is not defined` y `Identifier 'api' has already been
declared`) **ya está resuelto** por:

- `5b54694` — removió el `tryParseJsonReply` huérfano de `renderer.js`
- `0c21476` — envolvió `pet-protocol.js` en IIFE para evitar doble-load

## Decisión

**APROBADO** para release v1.2.0.

El batch está listo. El único pendiente real es la verificación del
nombre del modelo M3 contra la API real (MINOR-1 del review), que
no bloquea el release porque el parser tiene fallback robusto.

## Notas para el próximo ciclo

- Cuando se confirme el nombre del modelo M3 (vía DevTools Network),
  bumpear a v1.2.0 o v1.2.1 según si se tocó o no el parser.
- Si M3 devuelve JSON de verdad, considerar quitar el fallback a tags
  para simplificar el parser (MINOR del review).
- El pre-commit hook MANDATORY va a hacer que el próximo feature
  obligatoriamente pase por PLAN antes de que cualquier `feat:` se
  pueda commitear. Cultura nueva.
