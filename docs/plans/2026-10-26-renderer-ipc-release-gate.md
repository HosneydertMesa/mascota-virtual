---
id: 2026-10-26-fix-renderer-ipc-release-gate
status: approved
created: 2026-10-26
size: M
files:
  - src/renderer.js
  - preload.js
  - .github/workflows/release.yml
  - test/renderer-ipc-contract.test.js
  - test/release-workflow.test.js
acceptance:
  - "npm test pasa con 863+N tests (N >= 8 nuevos) y 0 fallos"
  - "src/renderer.js no llama ninguna window.api.onX que preload.js no exponga (test de contrato, falla antes del fix)"
  - "Las 7 suscripciones IPC perdidas por el revert e4c8fcf (onPetAction, onTriggerAutonomousTip, onSystemEvent, onMorningBriefing, onEveningSummary, onUpdateStatus, onAppChanged) vuelven a estar registradas en src/renderer.js"
  - "El workflow release.yml invoca electron-builder con --publish never y publica el .exe + latest.yml con GH_TOKEN presente en el step de upload"
  - "gate strict pasa completo (artefactos + qa + security)"
risks:
  - "Restaurar 7 suscripciones IPC puede resucitar codigo que main.js ya no emite con el mismo payload; cada handler se valida contra el payload real de main.js antes de cablearlo"
  - "El test de contrato IPC depende de parsear preload.js y renderer.js por texto; si alguien renombra un metodo del preload sin tocar el renderer, el test lo detecta (eso es el objetivo)"
---

# Plan: restaurar el contrato IPC del renderer + arreglar el release + cerrar el gate

## Contexto

Tres defectos encontrados al auditar el proyecto el 2026-10-26. Son **independientes**
entre sí (archivos y capas distintas) pero se resuelven en una sola rama porque los
tres tocan el mismo flujo "la app funciona mal en producción".

### Bug 1 — `window.api.onPomodoroState is not a function` (CRITICAL)

**Causa raíz**: el commit `e4c8fcf` ("fix(renderer): strip <think> + JSON envelope
from chat LLM response", 2026-08-25) **no fue un fix**: fue un *revert silencioso*.
Bajó `src/renderer.js` de 944 a 199 líneas y, en el proceso:

1. **Añadió 2 llamadas a APIs que nunca existieron** en `preload.js`:
   - `window.api.onPomodoroState(...)` — el preload solo expone `onPomodoroTick` y
     `onPomodoroCompleted`; no existe ningún canal `pomodoro:state` en `main.js`.
   - `window.api.onPetSpeech(...)` — no existe ningún canal `pet-speech` en `main.js`.
   La primera lanza `TypeError` en cada arranque. Como `setupIPCListeners()` **no
   está en try/catch**, el throw aborta la función y **las 3 suscripciones siguientes
   nunca se registran**: `onPetSpeech` y `onSettingsUpdated`.
   → **Consecuencia real: cambiar de mascota (Luna↔Max) desde el dashboard no
   actualiza la mascota en pantalla.**

2. **Eliminó 7 suscripciones que sí funcionaban** (existían en `preload.js` y
   `main.js` las sigue emitiendo):

   | Suscripción | Canal | Quién lo emite | Efecto de la pérdida |
   |---|---|---|---|
   | `onPetAction` | `pet-action` | `main.js:816`, `main.js:1421` | La mascota no reacciona a la IA ni al botón de acción del dashboard |
   | `onTriggerAutonomousTip` | `trigger-autonomous-tip` | `main.js:477` | Los tips automáticos de la IA nunca aparecen |
   | `onSystemEvent` | `pet-system-event` | `main.js:215` | La mascota no reacciona a lock/suspend/resume del SO |
   | `onMorningBriefing` | `morning-briefing` | `main.js:1640` | El briefing matutino nunca se muestra |
   | `onEveningSummary` | `evening-summary` | `main.js:1671` | El resumen de la tarde nunca se muestra |
   | `onUpdateStatus` | `app:update-status` | `main.js` (auto-updater) | El aviso de actualización no se muestra |
   | `onAppChanged` | `app-changed` | `main.js:1803` | **La feature v2.2.0 "app-aware" no aplica mood por app** — el payload trae `mood` y `wagTargets` y el renderer los ignora |

3. **Rompió el badge de Pomodoro**: `src/renderer/pomodoro-ui.js:22` lee
   `state.formattedTime`, pero `main.js:1283` emite `remainingSec` (y `mode` con
   valores `focus`/`break`/`long_break`, no `break`/`longBreak`). El badge queda
   clavado en el `25:00` hardcodeado de `index.html:57` y nunca cuenta.

**Evidencia de runtime** (runner temporal con Electron + preload real):
```
[console] Uncaught TypeError: window.api.onPomodoroState is not a function
[state] {"apiOnPomodoroState":"undefined","apiOnPetSpeech":"undefined",
         "apiOnSettingsUpdated":"function","hasMoodClass":false}
```
`apiOnSettingsUpdated` existe pero nunca se registra por el throw anterior.
`hasMoodClass: false` confirma que el mood nunca se aplica.

### Bug 2 — el release v2.1.0 nunca se publicó (MAJOR)

**Causa raíz**: `.github/workflows/release.yml:86` corre `npm run build` →
`electron-builder --win --x64` **sin `--publish never`**. Como el repo tiene
`build.publish` en `package.json`, electron-builder detecta el tag de git y
dispara **publish implícito** (*"Implicit publishing triggered by git tag"*), pero
ese step **no tiene `GH_TOKEN`** →

```
Error: GitHub Personal Access Token is not set, neither programmatically, nor using env "GH_TOKEN"
    at artifactCreatedWithoutExplicitPublishConfig
```

El build falla en el step 6; los steps 7 y 8 (upload) quedan `skipped`. El tag
`v2.1.0` existe pero **no hay release**: `gh release view v2.1.0` → *release not
found*. La última release publicada sigue siendo **v2.0.2** (julio).

**Los 4 runs históricos de `release.yml` fallaron igual** (v2.0.0, v2.0.1, v2.0.2,
v2.1.0) — se publicaron a mano. El workflow nunca funcionó.

**Bug 2b**: el step de upload (línea 113) sube solo el `.exe`. Falta `latest.yml`,
que es **el archivo que electron-updater consume** para detectar updates
(`package.json` `build.publish` lo documenta y `README.md:28-35` lo promete).
Sin `latest.yml`, el auto-update no detecta nada aunque la release exista.

**Bug 2c**: el `--target` del step de upload evalúa a `latest` en pushes de tag:
`--target "${{ github.event_name == 'push' && 'latest' || 'commitish' }}"`.
`latest` no es una rama ni un commit — es un nombre de release. Para un push de
tag el target debe ser el propio tag.

### Bug 3 — `gate strict` falla (MAJOR)

```
X Hay commits de codigo desde v2.1.0 sin review en docs/reviews
```

`gate strict` toma el rango desde el último tag (`v2.1.0..HEAD`, 2 commits) y
exige un doc en `docs/reviews/` **por el rango de commits**, no "el último review
del repo". Los 2 commits son `docs(qa): ...` (exento) y
`fix(sdlc): ...` (**no exento** → exige review).

Además: el binario `gate` no está en el PATH — solo existe
`C:\Users\HOSNE\.minimax\workspace\sdlc-setup\bin\gate.ps1`. Hay que invocarlo
como `pwsh -NoProfile -File <ruta>\gate.ps1 <cmd>`.

## Goals

- [ ] G1: el renderer no llama ninguna API de preload inexistente; el `TypeError`
      de arranque desaparece y `onSettingsUpdated` sí registra (cambio de mascota
      funciona).
- [ ] G2: las 7 suscripciones IPC perdidas por `e4c8fcf` vuelven a estar
      cableadas, cada una validada contra el payload real que emite `main.js`.
- [ ] G3: el badge de Pomodoro de la mascota muestra el tiempo real que countdown
      desde `main.js`.
- [ ] G4: `release.yml` publica la release de punta a punta (exe + latest.yml),
      sin depender de publish implícito.
- [ ] G5: `gate strict` pasa completo.

## Non-Goals

- ❌ **No** se migra a PixiJS. `src/pet-renderer-pixi.js` + `src/vendor/pixi.min.js`
  (800KB) están en `main` pero **nadie los carga** — el commit `e4c8fcf` también
  revirtió `index.html` al camino SVG. Decidir qué hacer con el código muerto de
  Pixi es un trabajo aparte (plan `v2.3.0-pixijs-rendering.md` quedó
  `approved` pero su implementación está desconectada).
- ❌ **No** se implementa `onAppChanged` con wag targets interpolados (feature
  v2.2.0 completa). Se restaura la suscripción para que el mood por app se
  aplique; el wag dinámico queda para un plan propio.
- ❌ **No** se toca `src/core/pet-protocol.js` ni el parser de IA.
- ❌ **No** se publica la release v2.1.0 al fixing este plan. El release se
  dispara después del QA sign-off, con un tag nuevo.

## Decisiones a confirmar con el equipo

- [ ] **D1 — ¿Cómo se arregla el badge de Pomodoro?**
  - **Opción A (elegida)**: `PomodoroUI.update()` calcula el `MM:SS` desde
    `remainingSec` y acepta los 3 valores de `mode` que emite `main.js`
    (`focus`/`break`/`long_break`). Un solo consumidor, sin tocar `main.js`.
  - Opción B: `main.js` agrega `formattedTime` al payload. Toca el proceso main
    y el contrato IPC; el dashboard ya formatea su propio tiempo, así que
    sería un formatter duplicado.

- [ ] **D2 — ¿Dónde vive la restauración de los 7 handlers?**
  - **Opción A (elegida)**: en `src/renderer.js`, functions locales, como estaban
    antes del revert. Un solo archivo, diff chico y legible contra `7c7f3dc`.
  - Opción B: un módulo nuevo `src/renderer/ipc-actions.js`. Más limpio a la
    larga, pero `main.js` sigue siendo monolítico y el plan no lo cubre.

- [ ] **D3 — ¿Se publica v2.1.0 o se corta v2.2.0?**
  - El tag `v2.1.0` ya existe apuntando a `4c6d9f1` pero sin release. Con los
    fixes 1-3 el código cambia → **v2.2.0** es lo correcto (feature + fix).
  - La release de hoy publicará v2.2.0.

## Tareas

### Tarea 1 — Test de contrato IPC (rojo primero)

**Archivo**: `test/renderer-ipc-contract.test.js` (NUEVO)

- [ ] **T1.1** Test que parsea `preload.js` y extrae las claves `on*` expuestas en
      `contextBridge.exposeInMainWorld('api', {...})`.
- [ ] **T1.2** Test que parsea `src/renderer.js` y extrae todas las llamadas
      `window.api.onX(...)`.
- [ ] **T1.3** Test que asserta: toda `onX` usada por el renderer existe en el
      preload. **Falla hoy** con `onPomodoroState` y `onPetSpeech`.
- [ ] **T1.4** Test que asserta: las 7 suscripciones perdidas están presentes en
      el renderer. **Falla hoy** con las 7.
- [ ] **T1.5** Test que asserta: ninguna función `window.api.onX` se llama sin
      guarding de existencia (evita el "abort en cadena" del bug 1).

**Comando**: `node --test test/renderer-ipc-contract.test.js` → debe fallar.

### Tarea 2 — Arreglar el contrato IPC

**Archivo**: `src/renderer.js`, `preload.js`

- [ ] **T2.1** Quitar `window.api.onPomodoroState(...)` (línea 302). No existe el
      canal; `onPomodoroTick` ya cubre el countdown.
- [ ] **T2.2** Quitar `window.api.onPetSpeech(...)` (línea 306). No existe el
      canal. El speech real llega por `onSystemEvent` / `onMorningBriefing` /
      `onEveningSummary` / `onStreakMilestone`.
- [ ] **T2.3** Envolver `setupIPCListeners()` en `try/catch` por handler: que un
      handler roto no aborte los demás. (Defensa en profundidad del bug 1.)
- [ ] **T2.4** Restaurar las 7 suscripciones, cada una contra el payload real:

  | Handler | Payload real (main.js) | Acción en el renderer |
  |---|---|---|
  | `onPetAction` | `{ type:'speak', text, emotion, action, sound }` (main.js:816, 1421) | `speech.show(text)` + `viewport.setState()` según `action` (sit/lay/stretch) + `petAudio.play(sound)` |
  | `onTriggerAutonomousTip` | `void` (main.js:477) | `api.aiQuickTip()` → `speech.show(tip)` |
  | `onSystemEvent` | `{ event, source, text, ts }` (main.js:215) | `event==='lock'/'suspend'` → `viewport.setState('sleeping')`; `text` → `speech.show(text)` |
  | `onMorningBriefing` | `{ text, ts }` (main.js:1640) | `speech.show(text, 8000)` |
  | `onEveningSummary` | `{ text, ts }` (main.js:1671) | `speech.show(text, 8000)` |
  | `onUpdateStatus` | `{ kind, version }` | `speech.show(AutoUpdater.formatUpdateMessage(data))` |
  | `onAppChanged` | `{ processName, windowTitle, category, mood, wagTargets }` (main.js:1803) | `applyMoodClassTo(container, moodStateFromApi(mood))` |

- [ ] **T2.5** `onAppChanged` aplica el mood al `#pet-container` — cierra el
      `hasMoodClass: false` del runtime.

**Comando**: `node --test test/renderer-ipc-contract.test.js` → pasa.

### Tarea 3 — Arreglar el badge de Pomodoro

**Archivo**: `src/renderer/pomodoro-ui.js`

- [ ] **T3.1** `update(state)` formatea `remainingSec` → `MM:SS` (el payload real
      de `main.js:1283`), en vez de leer `state.formattedTime` (inexistente).
- [ ] **T3.2** Aceptar los 3 valores de `mode` reales (`focus`, `break`,
      `long_break`); hoy compara contra `longBreak` (nunca matchea).
- [ ] **T3.3** Test de `PomodoroUI.update()` con los payloads reales de main.

**Tests**: `test/pomodoro-ui.test.js` (NUEVO) — 3-4 tests.

### Tarea 4 — Arreglar el workflow de release

**Archivo**: `.github/workflows/release.yml`

- [ ] **T4.1** Build step: `npm run build -- --publish never` → electron-builder
      no intenta publicar, el build no puede fallar por falta de token.
- [ ] **T4.2** Upload step: subir **`.exe` + `latest.yml` + `.blockmap`**
      (los 3 que electron-updater necesita).
- [ ] **T4.3** Upload step: `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` (ya está) —
      verificar que el step de upload lo tenga y que el de build ya no lo necesite.
- [ ] **T4.4** Corregir `--target`: para push de tag, `--target ${{ github.ref_name }}`
      (el propio tag); para `workflow_dispatch`, sin `--target`.
- [ ] **T4.5** Test que parsea `release.yml` y asserta: el build NO publica
      (tiene `--publish never`), el upload sube `latest.yml`, y el upload tiene
      `GH_TOKEN`.

**Tests**: `test/release-workflow.test.js` (NUEVO) — 4 tests.

### Tarea 5 — Review + QA + gate strict

- [ ] **T5.1** Review adversarial en `docs/reviews/2026-10-26-renderer-ipc-release-gate.md`
      con frontmatter tipado (`status: APPROVED`, `severity.critical: 0`,
      `severity.major: 0`).
- [ ] **T5.2** QA sign-off en `docs/qa/2026-10-26-renderer-ipc-release-gate.md`
      con `evidence.tests` (cifra real) y `evidence.manual` (el runner de runtime
      con el `TypeError` ausente) + `signed_by` + `checked_at`.
- [ ] **T5.3** `gate strict` completo en verde.

## Verificación de los 3 bugs

| Bug | Cómo se prueba que está arreglado |
|---|---|
| 1 | Runner Electron con preload real: sin `Uncaught TypeError`; `apiOnPomodoroState` ausente del renderer; `hasMoodClass: true`; `onSettingsUpdated` registrado (cambio de mascota actualiza el SVG) |
| 2 | Test del workflow + corrida real del release con tag nuevo → `gh release view` lista la release con `.exe` y `latest.yml` |
| 3 | `gate strict` en verde |

## Orden de ejecución

1. Tarea 1 (test rojo)
2. Tarea 2 (contrato IPC) → test verde
3. Tarea 3 (badge)
4. Tarea 4 (release)
5. `npm test` + `npm run check`
6. Tarea 5 (review + QA + gate strict)
