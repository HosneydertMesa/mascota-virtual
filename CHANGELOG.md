# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2026-10-26

Primera release publicada del proyecto. La v2.1.0 quedo tagueada pero **nunca se
publico** (el workflow de release fallaba en el build por el publish implicito
de electron-builder sin `GH_TOKEN`); la ultima release accesible era v2.0.2.

### Fixed

- **fix(renderer): restaurar el contrato IPC con preload** — el commit
  `e4c8fcf` (2026-08-25) fue un revert silencioso que bajo `src/renderer.js` de
  944 a 199 lineas. Anadio llamadas a `window.api.onPomodoroState()` y
  `window.api.onPetSpeech()`, APIs que `preload.js` nunca expos: el `TypeError`
  abortaba `setupIPCListeners()` y `onSettingsUpdated` nunca se registraba, asi
  que **cambiar de mascota (Luna/Max) desde el dashboard no actualizaba la
  pantalla**. Ademas elimino 7 suscripciones que si funcionaban y que `main.js`
  sigue emitiendo: `onPetAction`, `onTriggerAutonomousTip`, `onSystemEvent`,
  `onMorningBriefing`, `onEveningSummary`, `onUpdateStatus` y `onAppChanged`
  (la feature v2.2.0 "app-aware" no aplicaba mood por app). Las 14
  suscripciones van ahora por `subscribeIpc()`, que aisla cada handler para que
  uno roto no aborte los demas.
- **fix(renderer): el badge de Pomodoro ahora cuenta** — `PomodoroUI.update()`
  leia `state.formattedTime`, pero `main.js` emite `remainingSec`. El badge
  quedaba clavado en el `25:00` hardcodeado del HTML. Ahora calcula `MM:SS`
  desde `remainingSec` y acepta los 3 valores reales de `mode`
  (`focus`/`break`/`long_break`) en vez de comparar contra `longBreak`.
- **fix(ci): el release se publica de punta a punta** — `release.yml` corria
  `npm run build` sin `--publish never`, asi que electron-builder disparaba el
  publish implicito por tag **sin `GH_TOKEN`** y el build fallaba antes del
  upload: el tag se publicaba pero la release no. **Los 4 releases anteriores
  fallaron igual.** Ahora el build no publica, el upload sube `.exe` +
  `latest.yml` + `.blockmap` (faltaba `latest.yml`, que es lo que lee
  electron-updater para detectar updates) y usa `--verify-tag` en vez de
  `--target latest`.
- **fix(renderer): no pisar el estado del break en `pomodoro:completed`** —
  `main.js` emite `pomodoro:tick` antes que `pomodoro:completed`, ambos con el
  mismo payload. Un handler de `completed` que reescribiera el estado mostraba
  `00:00` en vez del countdown del break.

### Tests

- **test: contrato IPC renderer <-> preload** — 9 tests que parsean el fuente y
  assertan que el renderer no llama APIs inexistentes, que las 7 suscripciones
  perdidas estan cableadas y que cada una va protegida. Bidireccionales:
  reintroducir el bug los hace fallar.
- **test: badge de Pomodoro** — 12 tests sobre `formatClock()` y `PomodoroUI.update()`
  con los payloads reales de `main.js`.
- **test: workflow de release** — 13 tests que parsean el YAML y assertan
  `--publish never`, la subida de `latest.yml`, `--verify-tag` y que el token
  vive en el step de upload.

### Documentation

- docs(plans): plan de restauracion del contrato IPC + fix del release + gate strict
- docs(reviews): review adversarial del fix (APPROVED, critical 0 / major 0)
- docs(qa): QA sign-off con evidencia de runtime real (Electron + preload real)

## [2.1.0] - 2026-10-20

### Features
- feat(motion): species gait, idle variety, and mood body class (662442c)
- feat(pomodoro): motor unificado en main y dashboard (a7ccbbf)
- feat(ai): fallback local con Transformers.js y SmolLM (29e42d1)
- feat(renderer): listen app-changed + apply mood + wag targets (M4 v2.2.0) (d7601a7)
- feat(main+preload): wire app-detector con IPC app-changed (M3 v2.2.0) (b0f39d0)
- feat(services): app-detector — PowerShell polling del foreground (M2 v2.2.0) (4173ee9)
- feat(core): app-categories — map process name → category (M1 v2.2.0) (3ba88ad)
- feat(ai): prompt incluye acciones sit/lay/stretch + intents rest_* (96dc606)
- feat(renderer): mood affecting motion gradual (lerp en tail wag) (M4) (ac63efb)
- feat(renderer): look-at-cursor con cabeza rotando (M3) (767f4a0)
- feat(renderer): multi-frame state machine (M2) (ef62a2c)
- feat(protocol): extender allow-lists con sit/lay/stretch (M1-D) (3af1bfa)
- feat(pet-assets): dog walk + sit/lay/stretch (M1-C) (ef32a07)
- feat(pet-assets): cat sit/lay/stretch states (M1-B) (cd531de)
- feat(pet-assets): cat walk cycle con bone rotation (skeletal 2D) (9c545ec)
- feat(pet-assets): cat walk cycle multi-frame (M1-A) (b7f6d07)

### Bug Fixes
- fix(deps): actualizar dependencias con vulnerabilidades conocidas y habilitar install scripts (237daea)
- fix(test): fechas relativas al reloj en los tests de pomodoro-store (4cf33f2)
- fix(styles): drop duplicate breathing/wag keyframes so mood offset wins (80746fa)
- fix(motion): embed production pose SVGs and keep mood from killing breath (5acb4b3)
- fix(logger): close file handle before finish so Windows CI can rm temp logs (374ecbc)
- fix(test): run suite on Windows CI and mock win32 for app-detector (55a18f8)
- fix(renderer): walk v2 — natural cat/dog stride + visible X button (e4151b4)
- fix(renderer): strip <think> + JSON envelope from chat LLM response (e4c8fcf)
- fix(renderer): restore leg swing animation in pet walk cycle (9e98c4c)

### Other
- docs(gate): frontmatter en los 5 docs que trajo el merge de origin/main (e80f250)
- Merge remote-tracking branch 'origin/main' (7d5c672)
- Merge pull request #2 from HosneydertMesa/feat/gate-frontmatter-migration (b697426)
- ci(gate): el workflow de CI no falla por falta del secret GATE_SDLC_TOKEN (5334684)
- docs(qa): cifras verificadas del sign-off de la migracion a frontmatter (dd547db)
- docs(gate): review y QA sign-off de la migracion al gate generico (bd6f31f)
- chore(sdlc): retirar los tests del gate bespoke que se reemplaza (db5925c)
- docs(gate): frontmatter con valores reales en los planes (7c49d8c)
- docs(gate): frontmatter con valores reales en los reviews (464770e)
- docs(gate): frontmatter con valores reales en los reviews (e5db807)
- docs(gate): frontmatter con valores reales en los planes (4479f5f)
- docs(gate): frontmatter con valores reales en los registros de QA (e10092e)
- refactor(sdlc): migrar al gate generico y retirar el gate bespoke (e8d2444)
- docs(gate): frontmatter con valores reales en los registros de QA (339a788)
- docs(plans): plan de la migracion al gate generico con frontmatter (6baf4c6)
- Merge pull request #3 from HosneydertMesa/cursor/mood-keyframe-cascade-7597 (7d8da47)
- docs(reviews): approve mood breath/wag cascade fix (a0f1bff)
- test: match @keyframes even with extra whitespace (0ed2e52)
- docs(plans): add plan for mood breath/wag cascade fix (a5edd6d)
- Merge pull request #2 from HosneydertMesa/cursor/slice-1-motion-e5f8 (f090489)
- docs(qa): record 891/891 after CI test fixes (f80293f)
- docs(sdlc): review and QA for slice 1 MOTION (cb04959)
- docs(plans): add plan for slice 1 MOTION (e2e9eca)
- Merge pull request #1 from HosneydertMesa/feat/pixijs-rendering (1d3a1b5)
- refactor(renderer): extraer eye-tracker, speech, interaction y pomodoro-ui (a6587b2)
- refactor(styles): entry CSS importa los módulos ya existentes (e35327a)
- docs(sdlc): plan retroactivo para chat bugs (B1+B2 leak + close) (6dd751e)
- docs(sdlc): retroactive traceability for walk-leg-swing fix (commit 9e98c4c) (f8c02d7)
- test: gh auth end-to-end via Hermes (3aa58f5)
- M2 fix: pivot/position both at PIVOT para que la matrix sea identidad (6ba820b)
- M2: bone hierarchy + head turn + tail wag (mood affecting motion) (7c7f3dc)
- M1 layout: canvas 200x200 absolute-positioned, smoke runner captura screenshot (c84c5d0)
- M1 fix: split parts exposed to window + data URL sprite loading (231e40e)
- M1: migrate pet window to PixiJS rendering (M1b) (84ece76)
- M1 split: cat.js / dog.js → 7 parts per state (head/body/tail/4 legs) (3e0c3b2)
- M0: pixi.js v8 spike — PASS 60fps, ready for M1 (2e96a31)
- docs(changelog): v2.2.0 — App-aware mascota (7e8bc00)
- docs(plan): v2.2.0 — App-aware mascota (cc094fa)
- docs(changelog): v2.1.0 — Mascota con Vida (1a57a8d)
- docs(preview): tabs Walk  ( Sit | Lay | Stretch con cat + dog|97ce1ea)
- docs(plan): replan — regenerar era overkill, ampliar es el approach (abd96f6)
- docs(plan): mascota-con-vida — visuals + movement upgrade (v2.1.0) (a0f0de4)
- chore(gitignore): ignore smoke-debug artifacts (41e0947)
- docs(changelog): v2.0.2 — hotfix strict mode scope conflict (2095426)

