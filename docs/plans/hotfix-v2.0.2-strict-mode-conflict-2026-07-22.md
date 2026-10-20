---
id: hotfix-v2.0.2-strict-mode-conflict-2026-07-22
status: approved
created: 2026-07-22
size: M
files:
  - src/core/context-awareness.js
  - test/context-awareness.test.js
  - test/scope-conflict-regression.test.js
  - dashboard-renderer.js
  - package.json
  - docs/deliverables/v2.0.2-changelog-2026-07-22.md
acceptance:
  - "El cuerpo de src/core/context-awareness.js queda envuelto en una IIFE: window.ContextAwareness sigue exponiendo la API y no hay colision de identificadores con el destructuring de dashboard-renderer.js"
  - "El conflicto se reproduce y deja de ocurrir: new Function(contextAwareness + dashboardRenderer) ya no lanza SyntaxError y hay un test de regresion bidireccional con y sin IIFE"
  - "824/824 tests verdes tras aplicar el fix y version bumpeada a 2.0.2 en package.json con changelog v2.0.2"
risks:
  - "Bajo: el IIFE no cambia la API publica ni module.exports, solo deja de exponer las funciones como globales del window"
  - "El bug era latente desde v1.6.0 y los tests node --test puros no detectan colisiones de scope del browser: se agrega test/scope-conflict-regression.test.js"
---

# v2.0.2 — Hotfix: strict mode conflict en context-awareness.js

**Fecha**: 2026-07-22
**Tipo**: hotfix crítico (bloquea app completa)
**Reportado por**: HOSNE
**Versión afectada**: v1.6.0+, v2.0.0, v2.0.1
**Versión arreglada**: v2.0.2

## Síntoma

- App inicia, dashboard HTML se renderiza (Pomodoro tab visible)
- NINGÚN botón responde, ni el X de cerrar
- Pet se ve en la esquina del dashboard (window order issue, secundario)
- DevTools console muestra: `Uncaught SyntaxError: Identifier 'shouldEnterDoNotDisturb' has already been declared (at dashboard-renderer.js:1)`
- Se reproduce en `npm start` Y en `MascotaVirtual-Setup-2.0.1.exe` (no es bug de empaquetado)

## Root cause

`src/core/context-awareness.js` define `function shouldEnterDoNotDisturb(...)` a nivel top-level (línea 90).
`src/dashboard-renderer.js` hace `const { shouldEnterDoNotDisturb, ... } = window.ContextAwareness;` a nivel top-level (línea 799).

Ambos corren en el mismo `<script>` chain del `src/dashboard.html`. En **strict mode** (`'use strict'`), tener un `function` y un `const` con el mismo identificador en el mismo scope es un `SyntaxError`. La regla de strict mode "lexical declaration collision" (Annex B) rechaza el solapamiento.

### Por qué NO se detectó antes

- Bug latente desde v1.6.0 (cuando se agregó `context-awareness.js` en batch 2)
- v2.0.0/v2.0.1 reorganizó archivos y movió líneas, lo que probablemente cambió el orden de parsing y expuso el conflicto
- 821/821 tests verde (los tests son `node --test` puros, no testean la cadena de scripts del browser)
- Smoke test (`npm run smoke`) abre la app 10s pero solo valida stdout/stderr (no DevTools console)

### Reproducción en Node (vm sandbox)

```js
new Function(contextAwareness + '\n' + dashboardRenderer)();
// → SyntaxError: Identifier 'shouldEnterDoNotDisturb' has already been declared
```

## Fix

**Wrappear `src/core/context-awareness.js` en IIFE** para que las funciones queden en scope privado y NO contaminen el scope global. La API se sigue exponiendo via `window.ContextAwareness = ...` para que `dashboard-renderer.js` pueda destructurar sin conflicto.

### Por qué este fix y no otro

- **Opción A**: wrappear `dashboard-renderer.js` en IIFE — más invasivo, requiere revisar todos los event listeners y globals
- **Opción B**: wrappear `context-awareness.js` en IIFE — localizado, el archivo ya tiene el patrón UMD-lite al final, solo hay que envolver el cuerpo
- **Opción C**: cambiar el destructure de `const { x } = ...` a `const x = window.ContextAwareness.x` — funciona pero pierde el estilo consistente con el resto del codebase
- **Opción D**: borrar `function shouldEnterDoNotDisturb` y solo usar el objeto — pierde testabilidad directa (los tests hacen `require('./context-awareness').shouldEnterDoNotDisturb`)

→ **Opción B** es la correcta: mínima, semánticamente limpia, preserva la API pública, preserva los tests.

## Cambios

| Archivo | Cambio | LOC |
|---|---|---|
| `src/core/context-awareness.js` | Envolver cuerpo en `(function() { ... })()` + UMD-lite existente se mantiene | +2 / -2 |
| `test/context-awareness.test.js` | Verificar que `window.ContextAwareness` se setea en browser y `module.exports` en Node | +0 |
| `test/scope-conflict-regression.test.js` (nuevo) | Bidireccional: con/sin IIFE | +60 |
| `dashboard-renderer.js` (root, huérfano) | DELETE | -1194 |
| `package.json` | bump 2.0.1 → 2.0.2 | +1 / -1 |
| `docs/deliverables/v2.0.2-changelog-2026-07-22.md` (nuevo) | Changelog | +30 |

## SDLC gates

1. **PLAN** ← este doc
2. **DEV**: apply fix → `npm run check` → `npm test` → 824/824 verde
3. **REVIEW**: código simple, IIFE wrap es un patrón conocido
4. **QA**: smoke test + reproducir el bug fix con `node -e "new Function(...)"`
5. **RELEASE**: bump 2.0.2, `npm run build`, `gh release create v2.0.2`, push
6. **DOCS**: changelog + post-mortem del regression gap

## Risk

- **Bajo**. El IIFE no cambia la API pública. `window.ContextAwareness` sigue siendo el mismo objeto. Los tests siguen pasando porque `module.exports` sigue igual.
- Único cambio observable: las funciones dejan de ser globales (ya no podés hacer `window.shouldEnterDoNotDisturb` directamente, hay que ir por `window.ContextAwareness.shouldEnterDoNotDisturb`). Nadie lo hacía antes.

## Out of scope (para v2.0.3+)

- Behavioral test del renderer completo con vm sandbox (diferido desde v2.0.1)
- `autoUpdater.logger` que reuse nuestro logger
- CSP `connect-src 'self' https://api.github.com` para "Check for updates" button
- Integration tests para electron-updater wire con mocks
