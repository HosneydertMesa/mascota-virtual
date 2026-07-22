# Plan: batch-4-distribucion

**Fecha**: 2026-07-22
**Versión target**: v2.0.0 (major — primer release público distribuible)
**Sprint**: 7-8 (semanas 7-9)
**Depende de**: batch 3 (v1.7.0 con I1/I2/I7/I8/W3/W4/W5 — done)
**Habilita**: distribución pública, auto-update pipeline, próximas features v2.x

---

## 1. Objetivo

Cerrar el ciclo **"de dev personal a distribuible"**. Mascota v2.0.0 es la primera
versión que otra persona puede instalar sin tener Node.js ni clonar el repo.
Tres líneas de trabajo + un audit obligatorio:

1. **Track A — Empaquetado y auto-update**: convertir el repo en un `.exe`
   instalable (T7 electron-builder) y que se actualice solo desde GitHub Releases
   (T6 electron-updater). Sin code signing (self-signed) — SmartScreen warn es
   aceptable para early adopters.
2. **Track B — Modos de comportamiento**: W1 "compañía silenciosa" (visual only,
   no chat / no mood reactivo) y W2 auto-pause en reuniones leyendo un `.ics`
   local. Ambos son toggles que cambian el comportamiento de la mascota sin
   agregar peso permanente.
3. **Track C — Polish + audit (yo)**: security audit pre y post-build (sin
   secrets, context isolation, IPC seguro, .gitignore correcto, deps limpias),
   performance pass 60fps (rAF, throttle, cache DOM, evitar layout thrash), y
   la coordinación final del release.

Decisiones tomadas (cierre 2026-07-22):

- **Code signing**: **self-signed** (sin cert EV por ahora). Cuesta $300/yr y
  no es blocker para early adopters que pueden hacer "More info → Run anyway".
  Diferir cert a v2.1.0 si la adopción lo justifica.
- **Scope**: **6 features** (T7 + T6 + security + W1 + T5 + W2). ETA 3-4 sem.
- **W1 behavior**: **visual only** — la mascota aparece con idle normal
  (respiración, eye tracking) pero **no** inicia chat, **no** reacciona a
  mood changes, **no** muestra A3 idle tips, **no** dispara A4 DND warnings.
  Toggle explícito en Settings.
- **W2 calendar**: **local .ics file** (no OAuth de Google). El usuario pone
  la ruta al `.ics` (Outlook export o Apple Calendar export) en Settings.
  Reunión detectada en próximos 5 min → pet entra en "retreat mode" (W1
  automático + opacity reducida + no animations). Reunión termina → vuelve a
  normal. Sin permisos OS, sin OAuth, sin tracking.
- **Update server**: **GitHub Releases** (gratis, HTTPS por default, ya
  tenemos el repo en `HosneydertMesa/mascota-virtual`). No CDN, no server
  custom.
- **Orden de ejecución**:
  1. **Security audit pre-build** (gate 0.5, yo) — sin esto, no compilamos
  2. Track A (worker) + Track B (worker) en paralelo con worktrees
  3. Merge secuencial
  4. Track C (yo) — T5 perf pass
  5. **Security audit post-merge** (gate 4a)
  6. Build .exe + publish a GitHub Releases
  7. Tag v2.0.0

---

## 2. Features del batch (3 tracks + audit)

### Gate 0.5 — Security audit pre-build (orquestador) [M, 1-2 días]

**Por qué antes de los tracks**: si encontramos que la API key de M3 está
hardcodeada en algún archivo, queremos saberlo **antes** de meter electron-builder
(que empaqueta TODO el repo). El audit es read-only sobre el código actual.

**Checklist** (cada item = una fila del reporte `docs/security/audit-2026-07-22.md`):

1. **Secretos en código**: `grep -r "sk-" src/ main.js preload.js` y
   `grep -r "M3_API_KEY\|apiKey\s*[:=]\s*['\"]" src/ main.js`. Debe dar 0 hits.
2. **`.gitignore`**: cubre `node_modules`, `dist`, `build`, `*.log`,
   `.env`, `.env.local`, `*.pem`, `*.key`. Verificar que stores JSON del
   usuario (`pet-memories.json`, etc) NO estén committeados.
3. **Dependencias**: `npm audit --omit=dev` debe dar 0 vulnerabilidades
   high/critical. Si hay, parchar o justificar defer.
4. **Electron `webPreferences`**:
   - `contextIsolation: true` ✅
   - `nodeIntegration: false` ✅
   - `sandbox: true` (preferido, verificar que nada rompa)
   - `webSecurity: true`
5. **IPC handlers** (`ipcMain.handle` en `main.js`): cada uno valida input
   con un schema o sanitiza. Ningún handler expone `fs.unlink` directo o
   `child_process.exec` con input del usuario.
6. **Path traversal**: cualquier uso de `path.join(userData, userInput)` debe
   validar que `userInput` no contiene `..` ni empieza con `/`.
7. **XSS en dashboard**: `innerHTML` solo para contenido estático. Cualquier
   render de texto del usuario o de la IA usa `textContent` o `createElement`.
8. **PII redaction**: `pet-memories.js` redacta email/phone/creditCard
   cuando el toggle está ON. Verificar que aplica también a
   `quick-capture` y `daily-briefing`.
9. **`shell.openExternal`**: solo se llama con URLs hardcodeadas o validadas
   (no user input directo).
10. **Logs**: `logger.js` redacta API keys (ya implementado en v1.3.0 —
    verificar que sigue activo). No loggear payloads de chat completos.
11. **Update server URL** (será HTTPS en T6, pero pre-check): GitHub Releases
    es HTTPS por default. Verificar que no se configure HTTP en ningún lado.
12. **CSP** (Content Security Policy): si el dashboard tiene CSP, verificar
    que no permite `unsafe-inline` ni `unsafe-eval`. Si no tiene CSP, evaluar
    agregar en este batch.

**Output**:
- `docs/security/audit-2026-07-22.md` con tabla `check | status | notes`
- Si hay issues HIGH: se resuelven antes de Track A. Si hay MEDIUM: se
  resuelven en este batch. LOW: se documentan y difieren.

---

### Track A — T7 electron-builder + T6 electron-updater (Worker 1) [M, 4-5 días]

**Alcance**:

- **T7 electron-builder**:
  - Install `electron-builder` (devDep)
  - Config `build` en `package.json` con target `nsis` (Windows installer)
  - `appId`: `com.hosneydertmesa.mascotavirtual`
  - `productName`: `Mascota Virtual`
  - `artifactName`: `MascotaVirtual-Setup-${version}.${ext}`
  - `icon`: usar `assets/icon.ico` (crear uno placeholder si no existe, 256x256 PNG → ICO)
  - `asar: true` (default)
  - `files`: incluir `src/`, `main.js`, `preload.js`, `assets/`, `node_modules/`
    y **excluir** explícitamente `test/`, `docs/`, `.github/`, `*.md`
  - `nsis`: `oneClick: false` (usuario decide), `perMachine: false` (perUser),
    `allowToChangeInstallationDirectory: true`
  - `win.target`: `["nsis"]`
  - **Sin `win.certificateFile`** (self-signed)
  - Build script: `npm run build` → `electron-builder --win --x64`
  - Output: `dist/MascotaVirtual-Setup-2.0.0.exe`

- **T6 electron-updater**:
  - Install `electron-updater` (runtime dep)
  - Wire en `main.js`: después de `app.whenReady`, `autoUpdater.checkForUpdates()`
    + interval cada 6h (`setInterval` con `unref` para no bloquear quit)
  - `autoUpdater.autoDownload = true`
  - `autoUpdater.autoInstallOnAppQuit = true`
  - Eventos: `update-available`, `update-downloaded`, `error` → notificar al
    renderer via `webContents.send('app:update-status', { kind, version })`
  - Renderer: toast "Hay update v2.0.1, se instala al cerrar" + log
  - Publish target: GitHub Releases via `gh release create` con `.exe` adjunto
  - En `package.json` `build.publish`:
    ```json
    "publish": {
      "provider": "github",
      "owner": "HosneydertMesa",
      "repo": "mascota-virtual"
    }
    ```
  - GitHub Actions workflow `.github/workflows/release.yml`:
    - trigger en `tag push v*` o `manual_dispatch`
    - jobs: `build` (windows-latest), `release` (gh release create con `.exe`)
    - permissions: `contents: write`

**Archivos nuevos**:

- `src/core/auto-updater.js` (UMD-lite pure)
  - `shouldCheckForUpdate({ lastCheckTimestamp, now, intervalMs = 6h })` → bool
  - `formatUpdateMessage({ currentVersion, newVersion })` → "v2.0.1 listo"
  - `isNewerVersion('2.0.0', '2.0.1')` → bool (semver compare, sin lib)
  - Tests: interval check, format, semver compare (incluido pre-release)

- `test/auto-updater.test.js` — 15-20 tests

- `assets/icon.ico` (placeholder 256x256, ver nota abajo)
- `assets/icon.png` (256x256 para docs/electron icon source)

- `.github/workflows/release.yml` (GitHub Actions release workflow)
- `.github/workflows/ci.yml` (extender el existente si necesita correr en
  Windows también — ya está en batch 0 pero solo lint+test en Linux)

**Archivos modificados**:

- `package.json`:
  - version: 1.7.0 → 2.0.0 (bump en gate RELEASE)
  - devDependencies: `+ electron-builder`
  - dependencies: `+ electron-updater`
  - scripts: `+ "build": "electron-builder --win --x64"`,
    `+ "build:dir": "electron-builder --dir"` (para test sin instalador)
  - `build` config block (T7 + publish T6)

- `main.js`:
  - Import `electron-updater` y wire `checkForUpdates` después de `whenReady`
  - `setInterval` cada 6h con `unref()`
  - Listeners: `update-available`, `update-downloaded`, `error`
  - Forward a renderer: `webContents.send('app:update-status', ...)`
  - `app.on('before-quit')` se mantiene (no conflict con `autoInstallOnAppQuit`)

- `preload.js`:
  - Expone `onUpdateStatus(callback)` → `ipcRenderer.on('app:update-status', ...)`

- `src/renderer.js`:
  - Handler `onUpdateStatus` → muestra toast con `petSpeech.showSpeech`
  - Si `kind === 'downloaded'`: "Hay update v2.0.1 — se instala al cerrar la app"

- `src/dashboard.html` + `src/dashboard-renderer.js`:
  - Tab "Updates" con versión actual + "Buscar update" manual + log de updates

- `src/styles.css`: estilos del toast update

- `README.md` (raíz): sección "Instalación" con instrucciones
  - "Descarga `MascotaVirtual-Setup-2.0.0.exe` de GitHub Releases"
  - "Si Windows SmartScreen bloquea: 'More info → Run anyway'"
  - Link a releases

**Criterios de aceptación**:

- [ ] `npm run build` produce `dist/MascotaVirtual-Setup-2.0.0.exe` (~80-120 MB)
- [ ] El `.exe` se puede instalar en Windows 10/11 sin errores
- [ ] Después de instalar, la app abre y muestra la mascota
- [ ] `electron-updater` chequea updates al abrir y cada 6h
- [ ] Si hay update, descarga en background y notifica al cerrar
- [ ] Al hacer push de tag `v2.0.1`, el workflow `release.yml` buildea y publica
- [ ] `gh release list` muestra el release con el `.exe` adjunto
- [ ] Tests: `node --test test/auto-updater.test.js` verde
- [ ] El `.exe` corre sin Node.js instalado en la máquina target

**Notas**:

- `icon.ico`: si no hay uno, generar placeholder con `image_synthesize` o usar
  uno genérico. La mascota tiene assets en `src/assets/` (cat/dog sprites) —
  elegir uno como icono principal.
- Self-signed implica que SmartScreen muestra warning. Documentar en README.
- `electron-updater` verifica el channel (`latest.yml`) que electron-builder
  publica junto al `.exe`. Es un canal seguro (HTTPS + checksums).

---

### Track B — W1 silent companion + W2 calendar .ics (Worker 2) [M, 4-5 días]

**Alcance**:

- **W1 silent companion** (visual only):
  - Nueva setting `silentMode: bool` en `pet-config.json`, default `false`
  - Cuando `silentMode === true`:
    - **No** `ai:send-message` se dispara por el scheduler automático (solo
      responde si el usuario escribe primero)
    - **No** `pet-mood` cambia (mood decay/effects desactivados, pero el
      valor persiste — al volver a `silentMode: false` sigue donde quedó)
    - **No** A3 idle tips se muestran
    - **No** A4 DND warnings se disparan
    - **No** daily briefing/summary se muestra (I7/I8)
    - **Sí** idle animation (respiración, eye tracking, pupil dilation) sigue
    - **Sí** blink aleatorio sigue
    - **Sí** drag/resize sigue
  - Toggle en dashboard Settings como "Modo compañía silenciosa"
  - Atajo global opcional: `Cmd+Shift+S` / `Ctrl+Shift+S` para toggle rápido
    (reusa `global-shortcuts.js` ya wireado en batch 0)

- **W2 auto-pause en reuniones (.ics local)**:
  - Nueva setting `calendarIcsPath: string | null` en `pet-config.json`
  - Cuando hay path configurado:
    - En startup, parsear el `.ics` con `node-ical` (lib nueva, devDep)
    - Calcular "próximo evento" en los próximos 5 min
    - Si hay evento en ≤5 min Y duración > 0 → activar "retreat mode":
      - Equivalente a `silentMode = true` (visual only)
      - **Plus**: opacity del pet baja a 0.5
      - **Plus**: pet se mueve a una esquina del screen
      - **Plus**: muestra globito pequeño "🗓️ Reunión hasta las 15:30"
    - Cuando termina el evento → vuelve a `silentMode: false` (o el estado
      previo) y opacity normal
    - File watcher (`fs.watch`) en el `.ics` para re-parsear si el usuario
      lo edita o se sincroniza
  - Si no hay path configurado, W2 no hace nada (feature opt-in)
  - En dashboard Settings: input "Ruta al archivo .ics" + botón "Probar" (parsea
    y muestra próximos 3 eventos)

**Archivos nuevos**:

- `src/core/silent-mode.js` (UMD-lite pure)
  - `isSilentModeActive({ silentMode, retreatUntil, now })` → bool
  - `applySilentModeToContext({ petState, config })` → `{ allowChatInit,
    allowMoodChange, allowIdleTips, allowDndWarnings, allowBriefing,
    allowAnimations }` (todas bool, false en silent)
  - Tests: cada bool se desactiva correctamente, retreat override funciona

- `src/services/calendar-service.js` (puede usar `node-ical` o UMD-lite)
  - `parseIcsFile(path)` → `[{ start: Date, end: Date, summary: string }, ...]`
  - `getNextEvent(events, now, lookaheadMin = 5)` → event | null
  - `isEventActive(event, now)` → bool
  - `watchIcsFile(path, onChange)` → watcher handle
  - Wrapper de `node-ical` (sync parse) con fallback a parser propio si
    `node-ical` no está
  - Tests: parse ICS sintético, getNextEvent edge cases, isEventActive

- `test/silent-mode.test.js` — 15-20 tests
- `test/calendar-service.test.js` — 20-25 tests (parse, lookahead, active, file watch)

**Archivos modificados**:

- `main.js`:
  - Wire `silentMode` toggle → `pet-config-store` get/set + broadcast
    `pet:silent-mode-changed` al renderer
  - Wire `calendarIcsPath` → en startup, parsear + watch
  - `setInterval` cada 30s para chequear `isEventActive` y aplicar retreat
  - IPC handlers nuevos:
    - `config:get-silent-mode` → bool
    - `config:set-silent-mode` → ack
    - `config:get-calendar-path` → string | null
    - `config:set-calendar-path` → ack (con validación de path)
    - `calendar:get-next-events` → `[{ start, end, summary }, ...]`
    - `calendar:test-path` → ack | error

- `preload.js`:
  - Expone `configGetSilentMode`, `configSetSilentMode`, `configGetCalendarPath`,
    `configSetCalendarPath`, `calendarGetNextEvents`, `calendarTestPath`

- `src/dashboard.html` + `src/dashboard-renderer.js`:
  - Settings → "Modo compañía silenciosa" toggle
  - Settings → "Ruta al archivo .ics" input + botón "Probar" + lista de
    próximos 3 eventos
  - Estado visible: "🐾 En reunión hasta las 15:30" cuando retreat está activo

- `src/renderer.js` (pet window):
  - `applySilentMode` listener: si active, opacity 0.5, posición esquina
  - `applyRetreat` listener: igual + muestra globito
  - Si `silentMode === true` Y no hay retreat, opacity 1, posición normal
  - Chat input sigue funcionando (usuario puede escribir), pero el bot no
    inicia conversación

- `src/core/context-awareness.js`:
  - `tryInitChat()` ahora chequea `silentMode` y aborta si está activo
  - `tryIdleTip()` aborta si `silentMode`
  - `tryDndWarning()` aborta si `silentMode`

- `src/core/pet-mood.js`:
  - `applyMoodTick()` aborta si `silentMode` (no decae, no cambia)
  - El mood value persiste, no se resetea

- `src/core/daily-briefing.js`:
  - `maybeShowMorningBriefing` aborta si `silentMode`
  - `maybeShowEveningSummary` aborta si `silentMode`

- `src/services/global-shortcuts.js`:
  - Wire `Cmd/Ctrl+Shift+S` → toggle silent mode → IPC `config:set-silent-mode`

- `package.json`:
  - dependencies: `+ node-ical` (o usar parser propio — ver decisión abajo)
  - check script: añadir `src/core/silent-mode.js`, `src/services/calendar-service.js`

- `src/styles.css`:
  - `.pet--retreat { opacity: 0.5; transform: scale(0.7); }` (corner)
  - `.silent-mode-indicator` en dashboard

**Criterios de aceptación**:

- [ ] Toggle "Modo compañía silenciosa" en Settings funciona (ON/OFF)
- [ ] Con `silentMode = true`:
  - [ ] La mascota no inicia chat proactivamente
  - [ ] El mood no cambia (verificable con `pet-mood:get-state` antes/después)
  - [ ] A3 idle tips no aparecen
  - [ ] A4 DND no dispara
  - [ ] Daily briefing no aparece
  - [ ] Animaciones idle (respiración, eye tracking) SÍ funcionan
  - [ ] Drag/resize SÍ funcionan
- [ ] `Cmd/Ctrl+Shift+S` togglea silent mode
- [ ] Path a `.ics` válido → parsea y muestra próximos 3 eventos en dashboard
- [ ] Path inválido → muestra error claro
- [ ] Sin path → feature W2 inerte (no rompe nada)
- [ ] Evento en próximos 5 min → retreat mode se activa
- [ ] Durante retreat: opacity 0.5, posición esquina, globito "Reunión hasta..."
- [ ] Evento termina → vuelve a estado normal
- [ ] File watch: editar `.ics` manualmente → re-parsea
- [ ] Tests verdes: `silent-mode.test.js` (15-20) + `calendar-service.test.js` (20-25)

**Decisión técnica node-ical**:

- `node-ical` (~30KB, sync API, MIT) es la opción más simple.
- Alternativa: parser propio (regex sobre VCALENDAR/VEVENT) — más control,
  menos deps, pero reinventar la rueda.
- **Decisión**: usar `node-ical` salvo que la dep tenga vulns. Si el audit
  pre-build marca `node-ical` como vulnerable, escribir parser propio.

---

### Track C — T5 60fps performance pass (orquestador, sequential) [M, 2-3 días]

**Cuándo corre**: **después** del merge de Track A + Track B. Razón: si
optimizamos ahora, las features nuevas pueden romper el budget de FPS.

**Alcance**:

- **Profile baseline**:
  - Agregar `performance.now()` log en `pet-tick.js` cada 60 frames
  - Medir p50, p95, p99 del frame time
  - Correr 5 min con carga típica: chat, mood decay, eye tracking, idle
  - Target: p95 ≤ 16.67ms (60fps), p99 ≤ 20ms

- **Optimizaciones**:

  1. **`requestAnimationFrame` para todo lo que toca DOM**:
     - `pet-motion.js`: ya usa rAF (verificar)
     - `pet-micro-presence.js`: blink, pupil dilation, breathing → rAF
     - `pet-mood.js`: decay tick → rAF o `setTimeout(..., 1000)` (1Hz es OK)

  2. **Cache DOM lookups**:
     - Cualquier `document.querySelector` dentro de loops → cachear a module level
     - Refactor `pet-renderer` o lo que pinte sprites

  3. **Throttle ops no-críticas**:
     - Eye tracking: max 10Hz (cada 100ms)
     - Mood decay: 1Hz (cada 1s)
     - Idle tip scheduler: 5min mínimo
     - Brief check: 30s (suficiente para meetings)

  4. **Evitar layout thrash**:
     - Usar `transform` y `opacity` para animar (no `top/left/width/height`)
     - `will-change: transform` en el pet container
     - Batch reads/writes: `requestAnimationFrame(() => { read; write; })`

  5. **Memory leaks**:
     - Verificar que `setInterval` se cleanup en `before-quit`
     - Verificar que file watchers se cierran
     - Verificar que IPC listeners no se duplican en hot-reload (dev)

  6. **Renderer work**:
     - `src/dashboard.html`: si tiene listas largas (>50 items), usar
       virtual scroll o paginación
     - `pet-memories` list: cap a 50, ya está, pero verificar render

  7. **Logger overhead**:
     - `logger.js`: en producción, log level = `warn` (no `debug`)
     - Verificar que `redact` no se ejecuta si no hay keys

- **Tests**:
  - `test/performance-budget.test.js` (smoke, no stress): verifica que
    funciones puras de cálculo (pomodoro, streak, etc) corren < 10ms con
    dataset típico
  - Documentar baseline + post-opt en `docs/perf/baseline-2026-07-22.md`

**Archivos modificados** (posibles):

- `src/core/pet-motion.js`
- `src/core/pet-micro-presence.js`
- `src/core/pet-mood.js` (decay throttle)
- `src/core/context-awareness.js` (throttle ya implementado, verificar)
- `src/dashboard.html` (virtual scroll si necesario)
- `src/services/logger.js` (production level)

**Criterios de aceptación**:

- [ ] Baseline medido: p95 frame time ≤ 16.67ms con carga típica
- [ ] Después de opt: p95 ≤ 12ms, p99 ≤ 16ms (margen de 25%)
- [ ] Sin memory leaks en 10 min de soak test
- [ ] `npm start` arranca y mantiene 60fps por 10 min sin degradar
- [ ] Dashboard con 50 recuerdos + 30 capturas: scroll smooth

---

## 3. Archivos nuevos batch 4 (resumen)

```
src/
├── core/
│   ├── silent-mode.js          (W1, ~80 LOC)
│   └── auto-updater.js         (T6, ~100 LOC)
└── services/
    └── calendar-service.js     (W2, ~150 LOC)

test/
├── silent-mode.test.js         (W1, 15-20 tests)
├── calendar-service.test.js    (W2, 20-25 tests)
├── auto-updater.test.js        (T6, 15-20 tests)
└── performance-budget.test.js  (T5, 5-10 tests)

assets/
├── icon.ico                    (T7, placeholder)
└── icon.png                    (T7, 256x256 source)

.github/workflows/
└── release.yml                 (T6, GH Actions)

docs/
├── plans/
│   └── batch-4-distribucion-2026-07-22.md   (este archivo)
├── security/
│   └── audit-2026-07-22.md    (gate 0.5)
├── perf/
│   └── baseline-2026-07-22.md (T5)
├── reviews/
│   └── batch-4-distribucion-2026-07-22.md
├── qa/
│   └── batch-4-distribucion-2026-07-22.md
└── deliverables/
    └── v2.0.0-changelog-2026-07-22.md
```

## 4. Archivos modificados batch 4 (resumen)

- `package.json`: version 2.0.0, +electron-builder, +electron-updater,
  +node-ical, build config, scripts
- `main.js`: +auto-updater wire, +silent mode IPC, +calendar IPC, +retreat
  interval, +maybeShowMorningBriefing respeta silent
- `preload.js`: +6 APIs (silent mode, calendar, update status)
- `src/dashboard.html`: +toggle silent, +input .ics path, +tab Updates
- `src/dashboard-renderer.js`: handlers de los 3 settings nuevos
- `src/renderer.js`: +opacity retreat, +silent mode indicator, +update toast
- `src/index.html`: posible +icon reference
- `src/styles.css`: +retreat class, +silent indicator, +toast update
- `src/core/context-awareness.js`: aborta si silent mode
- `src/core/pet-mood.js`: aborta decay si silent mode
- `src/core/daily-briefing.js`: aborta si silent mode
- `src/services/global-shortcuts.js`: +Ctrl/Cmd+Shift+S
- `README.md`: +sección Instalación
- `scripts/sdlc.js`: posiblemente +helpers para build artifact (ver)

## 5. Plan de tests

**Pre-batch**: 668 tests pasando (v1.7.0)

**Nuevos**: ~80-100 tests
- silent-mode: 15-20
- calendar-service: 20-25
- auto-updater: 15-20
- performance-budget: 5-10
- integration (silent + calendar + retreat): 10-15 (en QA, no automatizados)

**Total esperado**: ~750-770 tests

**Manual QA** (post-merge):
- [ ] `npm run build` produce .exe, instalable, abre, funciona
- [ ] Update: bajar v2.0.0, instalar, simular update a v2.0.1, ver toast
- [ ] Silent mode: toggle ON, esperar 5 min, verificar nada se inicia solo
- [ ] Silent mode: toggle OFF, esperar idle tip normal
- [ ] Calendar: cargar .ics con reunión en 4 min, ver retreat activarse
- [ ] Calendar: reunión termina, ver pet volver a normal
- [ ] Performance: 10 min soak test con DevTools Performance tab

## 6. Plan de release

1. Track A + Track B merged a main
2. Track C (perf) merged
3. Security re-audit (post-merge)
4. `sdlc:dev` (lint + tests + pre-commit)
5. `sdlc:review` (adversarial)
6. `sdlc:qa` (manual sign-off)
7. `npm run build` → `dist/MascotaVirtual-Setup-2.0.0.exe`
8. `gh release create v2.0.0 dist/MascotaVirtual-Setup-2.0.0.exe --notes "..."`
9. `sdlc:release` (bump version, tag v2.0.0, push)
10. `sdlc:doc` (changelog v2.0.0 + release notes)
11. Anuncio en repo / social

## 7. Riesgos y mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| `node-ical` tiene vulns | Baja | Alto | Audit pre-build. Si vulns, parser propio (regex sobre VEVENT) |
| `electron-updater` channel hackeado | Muy baja | Crítico | HTTPS only + verify checksums (default de electron-updater) |
| SmartScreen bloquea install | Alta (self-signed) | Medio | README explica "More info → Run anyway". En v2.1.0 cert EV |
| `electron-builder` falla en Windows | Baja | Alto | Probar `build:dir` primero (sin instalador). Si falla, debug en act log |
| Auto-update rompe app en downgrade | Baja | Alto | `autoUpdater.allowDowngrade = false` (default) |
| Calendar parser falla con .ics de Outlook vs Apple | Media | Bajo | node-ical maneja ambos. Test con 2 .ics reales |
| Performance pass no llega a 60fps | Media | Medio | Si no llega, identificar hot spot, defer a v2.0.1 |
| .exe demasiado grande (>150MB) | Baja | Bajo | `asar` reduce 30%. Si todavía grande, excluir devDeps con `--production` |
| Workers se pisan en `main.js` | Alta | Alto | Worktrees separados (igual que batch 3) + merge secuencial yo |
| GitHub Actions no tiene permisos `contents: write` | Baja | Alto | Verificar workflow permissions + manual fallback con `gh` local |

## 8. Decisiones a cerrar durante el batch

- `node-ical` vs parser propio: decidir en security audit
- Icono: generar placeholder o usar uno existente de `src/assets/`
- `productName` exacto: "Mascota Virtual" o "MascotaVirtual" (sin espacio)
- `appId` reverse domain: `com.hosneydertmesa.mascotavirtual` o similar
- Tab Updates en dashboard: visible siempre o solo si hay update
- Toast update: dismissable o auto-hide 5s
- Retreat mode: posición esquina fija o configurable

## 9. Notas para el orquestador

- **No** hacer el merge final hasta que Track A Y Track B estén ✅ (test verde).
- **No** empezar T5 perf pass hasta que el merge esté limpio.
- **No** buildear .exe hasta que el security audit post-merge pase.
- **Siempre** leer `node scripts/sdlc.js status` antes de mergear.
- Si un worker reporta blocker, **no** inventar fix — escalar al user.

---

**Status**: borrador → aprobación del usuario → ejecutar.
**Próximo gate**: PLAN ✅ (este doc) → security audit pre-build → Track A + B paralelo
