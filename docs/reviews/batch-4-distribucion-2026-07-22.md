# Review adversarial: batch-4-distribucion

**Fecha**: 2026-07-22
**Reviewer**: Mavis (sesión root, modo orquestador)
**Versión bajo review**: v2.0.0-pre (commits `373407c` → `b90ca04`)
**Scope**: 3 tracks mergeados en main
- Track A: T7 electron-builder + T6 electron-updater + CSP fix
- Track B: W1 silent companion + W2 calendar .ics
- Track C: T5 60fps performance pass (orquestador)

**Verdict**: **APPROVED** con 0 MUST-FIX, 3 SHOULD-FIX, 5 NIT

---

## Cambios scope

```
27 files changed, 8100 insertions(+), 126 deletions(-)
```

### Track A (T7 + T6) — 14 files, ~5430 insertions
- `package.json` (deps: `electron-builder@^26.0.0`, `electron-updater@^6.6.2`, build config, publish config)
- `main.js` (autoUpdater wire, app.isPackaged guard, setInterval 6h, event listeners)
- `preload.js` (+`onUpdateStatus`)
- `src/core/auto-updater.js` (UMD-lite pure, 177 LOC, 41 tests)
- `src/renderer.js` (+update toast handler)
- `src/dashboard.html` (CSP meta tag — audit MEDIUM-1 fix)
- `src/index.html` (script src auto-updater)
- `assets/icon.ico` + `assets/icon.png` (256x256)
- `scripts/generate-icon.ps1` (regenera icon si hace falta)
- `.github/workflows/release.yml` (GH Actions build + publish)
- `README.md` (instalación, code signing note, build instructions)
- `test/auto-updater.test.js` (286 LOC, 41 tests)
- `package-lock.json` (regenerated)

### Track B (W1 + W2) — 16 files, ~2320 insertions
- `src/core/silent-mode.js` (UMD-lite pure, 136 LOC, 26 tests)
- `src/services/calendar-service.js` (272 LOC, 51 tests, `node-ical` primary + `parseIcsMinimal` fallback)
- `src/services/pet-config-store.js` (123 LOC, 23 tests, atomic write con FILE_VERSION)
- `test/silent-mode.test.js` (258 LOC)
- `test/calendar-service.test.js` (591 LOC, Outlook + Apple .ics fixtures)
- `test/pet-config-store.test.js` (233 LOC)
- `main.js` (+6 IPC handlers, retreat scheduler 30s, calendar watcher)
- `preload.js` (+8 APIs: silent mode, calendar, retreat events)
- `src/renderer.js` (+silent/retreat visuals, `applyPetSilentVisuals`, `applyPetRetreatVisuals`)
- `src/dashboard.html` (+toggle silent, +input .ics path, +Settings UI)
- `src/dashboard-renderer.js` (handlers)
- `src/styles.css` (+`.pet--silent` y `.pet--retreat` con transform/opacity)
- `src/core/global-shortcuts.js` (+`Cmd/Ctrl+Shift+M` para silent mode)
- `test/global-shortcut.test.js` (modificado para incluir el nuevo binding)
- `package.json` (deps: `node-ical@^0.27.1`)

### Track C (T5 perf) — 2 files, ~289 insertions
- `src/renderer.js` (cache de `catTailEl`, `dogTailEl`, `earLeftEl`, `earRightEl`, `pupilEls`
  vía `cachePetElements()` — antes `getElementById` por frame y `querySelectorAll` por mousemove)
- `test/performance-budget.test.js` (128 LOC, 9 tests con budget 50ms)
- `docs/perf/baseline-2026-07-22.md` (baseline medido + optimizaciones)

### Track A + B conflictos de merge resueltos (4)
- `main.js` (1 conflicto en imports — resuelto manteniendo ambos bloques)
- `package.json` (scripts.check combinados, devDeps+deps unificados, build config Track A)
- `package-lock.json` (regenerado vía `npm install` después de unir deps)
- `preload.js` (1 conflicto en APIs expuestas — resuelto manteniendo ambos bloques)

### Dependencias
- `npm audit --omit=dev` → **0 vulnerabilities** ✅
- `npm audit` (full) → 9 vulnerabilities, **todas en devDeps de build**
  (`electron-builder@26.0.0` transitivo: `tar`, `node-gyp`, `@electron/rebuild`)
- **Estas 9 vulns NO se bundle en el .exe del usuario** — son del tool de build

### Tests
**818/818 verde** (768 baseline de batch 3 + 50 nuevos: 41 auto-updater, 9 perf-budget;
los 100 del merge de Track B ya estaban contados en batch 3 → batch 4 baseline)

---

## Strengths (lo que está bien)

1. **electron-updater correctamente gated por `app.isPackaged`** — no se
   intenta actualizar en `npm start` (dev). Patrón standard de la doc oficial.

2. **`autoUpdater.allowDowngrade = false` explícito** — el default es false
   pero ser explícito previene foot-guns si alguien cambia el default.

3. **CSP reforzado vs el sugerido**: el worker mantuvo el CSP existente
   (con `connect-src 'none'` que es más estricto que el `'self' https:`
   que sugerí en el audit). Todas las llamadas externas van por IPC al
   main, así que `connect-src 'none'` no rompe nada y bloquea exfil.

4. **Track B path traversal check** (`if (filePath.includes('..'))`)
   en `config:set-calendar-path` y `calendar:test-path` — buena
   defensa sin librería extra.

5. **Calendar parser con fallback**: `node-ical` como primary,
   `parseIcsMinimal` (regex propio) como fallback si la dep falla
   al cargar. 3 formatos de fecha iCal cubiertos.

6. **pet-config-store con `FILE_VERSION` y atomic write** — sigue
   el patrón de `memories-store.js`, `daily-briefing-store.js`,
   `quick-capture-store.js`. Consistencia.

7. **Retreat scheduler con `.unref()`** — no bloquea el quit de la app.

8. **Cmd/Ctrl+Shift+M** en vez de Shift+S — el worker detectó el
   conflicto con `pet-sleep` (Shift+S ya wireado en batch 0) y
   eligió un shortcut semánticamente coherente (M = "Mute"). Buena
   decisión de UX.

9. **Track C optimizations bien aisladas**: cache de refs DOM, no
   cambió la API pública de las funciones. Los 818 tests siguen
   pasando sin cambios.

10. **Performance budget test como red de seguridad** — detecta
    regresiones 10x en funciones puras. Budget generoso (50ms) para
    evitar flakiness.

11. **npm install con `electron-builder@26.0.0`** — yo lo upgradeé
    desde `25.x` durante el merge porque 25.x tenía transitive
    vulns (`tar` etc). 26.x es la línea soportada actualmente.

---

## SHOULD-FIX (no bloquean release, recomentados para v2.0.1)

### S1 — `connect-src 'none'` puede romper auto-updater

**Severidad**: SHOULD
**Archivo**: `src/dashboard.html` (CSP)
**Issue**: el CSP actual tiene `connect-src 'none'`. El renderer del
dashboard puede querer hacer `fetch` a GitHub para mostrar info de
update (versión actual, latest release). Si la implementación actual
no hace eso, no rompe — pero limita flexibilidad futura.

**Recomendación**: cambiar a `connect-src 'self' https://api.github.com`
para permitir checks de update status desde el renderer si en v2.1.0
se quiere un "Check for updates" button en el dashboard.

**Workaround actual**: el renderer recibe updates via IPC push (main
forward con `safeSend`). No necesita `connect-src` abierto.

### S2 — `electron-updater` log a `null`

**Severidad**: SHOULD
**Archivo**: `main.js` (auto-updater wire)
**Issue**: `autoUpdater.logger = null` silencia los logs del
updater. Si algo falla, no se ve en `mascota-debug.log`. Sería
mejor reusar el `logger` de `src/services/logger.js`.

**Recomendación**: `autoUpdater.logger = logger` después de
importar el logger, o crear un adapter.

### S3 — Tests no cubren path de electron-updater

**Severidad**: SHOULD
**Archivo**: `test/auto-updater.test.js`
**Issue**: los 41 tests cubren las funciones puras (`shouldCheckForUpdate`,
`formatUpdateMessage`, `isNewerVersion`) pero no el wire real
(`checkForUpdates`, `update-available` event). El wire requiere
Electron + red, así que solo se puede testear manualmente.

**Recomendación**: agregar un test de integración (mockeando
`electron-updater` con un fake) que verifique que `app.isPackaged`
gate funciona, y que el forward a renderer se llama con el shape
correcto. Diferir a v2.0.1 si requiere más infra de mocks.

---

## NIT (cosméticos, no bloquean)

### N1 — `loadMascotSVG` se llama 2 veces al startup

**Severidad**: NIT
**Archivo**: `src/renderer.js`
**Issue**: al init, `initMicroPresence` no llama a `loadMascotSVG`
directamente, pero `setVisualState('idle', null, true)` (en
`setupInteraction` o `applyPetTheme`) sí. Después, `cachePetElements`
se llama desde `DOMContentLoaded` Y desde `loadMascotSVG`. Si la
secuencia es `applyPetTheme → loadMascotSVG → cachePetElements`,
se cachea 2 veces al startup (innecesario pero no roto).

**Recomendación**: remover el `cachePetElements()` del `DOMContentLoaded`
listener (dejarlo solo en `loadMascotSVG`). Es trivial.

### N2 — `pet-config.json` no documentado en README

**Severidad**: NIT
**Archivo**: `README.md`
**Issue**: el nuevo `pet-config.json` (en userData) no está
mencionado en la sección "User data" del README (si existe). Si
un usuario quiere debuggear, no sabe dónde está.

**Recomendación**: agregar una nota en README sobre la ubicación
de los stores.

### N3 — Falta cleanup del setInterval de retreat en `before-quit`

**Severidad**: NIT (✅ verificado en review)
**Archivo**: `main.js:1796-1798`
**Issue**: el `setInterval(evaluateRetreatState, 30_000).unref()`
tiene `.unref()` así que no bloquea quit. Y `calendarWatcherHandle.close()`
SÍ se llama en `before-quit` (verificado).

**Status**: ✅ RESUELTO. No requiere acción.

### N4 — `package.json` no tiene `engines` field

**Severidad**: NIT
**Archivo**: `package.json`
**Issue**: no declara `engines.node` (e.g. `"engines": { "node": ">=18" }`).
El proyecto usa `node:test` (built-in desde 18) y `AbortController`
(built-in desde 16). Si alguien instala con Node 16, falla.

**Recomendación**: agregar `engines` con Node 18+ (lo que usa el dev).

### N5 — `MEMORY` notes del worker sobre winCodeSign

**Severidad**: NIT (informativo)
**Archivo**: agent memory
**Issue**: el worker de Track A guardó una memory note sobre el
electron-builder 25.x symlink bug. Útil para futuros proyectos,
no afecta este.

---

## Verificación de acceptance criteria (todos los tracks)

### Track A
- [x] `npm install` succeeds
- [x] `node --check` en archivos nuevos
- [x] `npm run sdlc:dev` verde
- [x] `npm run build:dir` produce .exe (con workaround)
- [x] CSP meta tag presente
- [x] 0 `eval`/`new Function`/`child_process` en código nuevo
- [x] Sender validation en IPC (N/A — no hay handlers nuevos en Track A)
- [x] Commits limpios, pre-commit hook OK

### Track B
- [x] `npm install` succeeds con `node-ical@0.27.1`
- [x] `node --check` en archivos nuevos
- [x] 100 tests nuevos (26+51+23) → 768/768
- [x] `sdlc:dev` verde
- [x] 6 IPC handlers nuevos con sender validation
- [x] Path traversal check presente
- [x] 0 `eval`/`new Function` en código nuevo
- [x] `parseIcsMinimal` testado con fixtures sintéticos

### Track C
- [x] `node --check src/renderer.js` no errors
- [x] 9 perf budget tests verdes (todos < 1ms)
- [x] 818/818 tests verde (no regresión)
- [x] Cache invalidation correcta (re-cachea en `loadMascotSVG`)
- [x] Sin cambios en API pública
- [x] `docs/perf/baseline-2026-07-22.md` escrito

---

## Decisiones a documentar en el changelog

1. **electron-builder upgrade 25.x → 26.x durante merge** (yo) —
   25.x tenía transitive vulns en `tar`/`node-gyp`. 26.x es la línea
   soportada.
2. **Self-signed installer** (decisión del user) — SmartScreen
   warning es aceptable. Cert EV diferido a v2.1.0.
3. **Cmd/Ctrl+Shift+M** para silent mode (worker) — evita
   conflicto con `pet-sleep` (Shift+S, batch 0).
4. **node-ical@0.27.1 + parser propio como fallback** — robustez
   ante vulnerabilidad futura de la dep.
5. **`pet-config.json`** es nuevo (no existía). Patrón
   `FILE_VERSION` + atomic write.
6. **CSP `connect-src 'none'`** — más estricto que el sugerido
   en el audit, no rompe nada porque todas las llamadas externas
   van por IPC.

---

## Riesgos residuales

1. **electron-builder 26.x es relativamente nuevo** (released
   2025). Si tiene bugs no descubiertos, el build puede fallar.
   Mitigación: `build:dir` ya se probó en Track A; el release
   workflow corre en `windows-latest` (ambiente limpio).

2. **No se probó el install real** del .exe (no se puede
   sandboxear). QA manual es requerido: instalar el .exe en
   una VM Windows, abrir, verificar que la mascota aparece,
   silent mode toggle, calendar .ics load.

3. **Auto-update channel es GitHub Releases** — si el repo se
   hace privado en el futuro, el update channel deja de
   funcionar. Documentar.

4. **`app.isPackaged` puede ser `false` en builds con
   `--config.compression=store` o en某些 electron-builder
   quirks**. Si el auto-updater no funciona en el .exe instalado,
   este es el primer lugar a debuggear.

---

## Conclusión

**APPROVED** para release v2.0.0.

- 0 CRITICAL
- 0 MAJOR
- 3 SHOULD-FIX (no bloquean — diferir a v2.0.1)
- 5 NIT (cosméticos)
- 818/818 tests verde
- 0 nuevos security issues
- Production deps: 0 vulnerabilities

El batch 4 cumple los criterios del plan:
- ✅ T7 electron-builder (.exe distribuible)
- ✅ T6 auto-updater (GitHub Releases)
- ✅ Security audit (pre + post)
- ✅ W1 silent companion (visual only, cmd-shift-m)
- ✅ W2 calendar .ics (node-ical + fallback, path traversal check)
- ✅ T5 60fps performance pass (DOM cache, perf budget tests)

Próximos pasos:
1. QA smoke test (manual sign-off)
2. `npm run build` (full NSIS installer) → `dist/MascotaVirtual-Setup-2.0.0.exe`
3. `gh release create v2.0.0 dist/MascotaVirtual-Setup-2.0.0.exe`
4. Bump version 1.7.0 → 2.0.0 (en el release)
5. Tag v2.0.0 + push
6. Changelog v2.0.0

---

**Reviewer**: Mavis (orquestador)
**Status**: APPROVED
