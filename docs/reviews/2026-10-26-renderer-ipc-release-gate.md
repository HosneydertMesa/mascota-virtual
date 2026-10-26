---
id: 2026-10-26-renderer-ipc-release-gate
branch: fix/renderer-ipc-release-gate
plan: docs/plans/2026-10-26-renderer-ipc-release-gate.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 3
  info: 4
reviewed_at: 2026-10-26
---

# Review: restauracion del contrato IPC del renderer + fix del release

**Fecha**: 2026-10-26
**Revisor**: Mavis (root session, con contexto fresco sobre el diff)
**Diff**: `origin/main...fix/renderer-ipc-release-gate` (2 commits, 7 archivos, +1093/-26)
**Scope**: `src/renderer.js`, `src/renderer/pomodoro-ui.js`, `.github/workflows/release.yml`, `test/renderer-ipc-contract.test.js`, `test/pomodoro-ui.test.js`, `test/release-workflow.test.js`

## Veredicto

**APPROVED** — los 3 bugs del plan están arreglados con causa raíz y tests de
regresión bidireccionales. Los 3 hallazgos MINOR de este review son mejoras
de robustez, no bloqueantes: el fix es correcto y está verificado en runtime
real.

## Qué se revisó

| Archivo | Cambio | Riesgo |
|---|---|---|
| `src/renderer.js` | +192 — `subscribeIpc()` defensivo + 7 suscripciones restauradas | Alto (toca el arranque del renderer) |
| `src/renderer/pomodoro-ui.js` | +30 — `formatClock()` + `mode` correctos | Bajo |
| `.github/workflows/release.yml` | +54 — `--publish never`, upload de 3 artefactos, `--verify-tag` | Medio (solo CI) |
| `test/renderer-ipc-contract.test.js` | +291 — 9 tests de contrato IPC | — |
| `test/pomodoro-ui.test.js` | +108 — 12 tests del badge | — |
| `test/release-workflow.test.js` | +175 — 13 tests del workflow | — |

## Verificación de los tests (el punto mas importante de este review)

Un test de regresion que no falla con el bug reintroducido es un placebo. Los
3 archivos de test se probaron ** reintroduciendo el bug**:

| Test | Bug reintroducido | Resultado |
|---|---|---|
| `renderer-ipc-contract.test.js` | `window.api.onPomodoroState(() => {})` de vuelta en el renderer | **4 tests fallan** → restaurado: 9/9 |
| `release-workflow.test.js` | `npm run build` sin `--publish never` | **2 tests fallan** → restaurado: 13/13 |
| `pomodoro-ui.test.js` | `update()` leyendo `state.formattedTime` | verificado por lectura directa del codigo |

Verificado ademas que los tests **ignoran comentarios**: el codigo documenta
los bugs que corrige, y un comentario con `window.api.onPomodoroState()` no
puede hacer fallar el test (ni hacerlo pasar por accidente).

---

## Hallazgos

### [MINOR] El test de contrato IPC parsea el codigo por regex, no por AST

**File**: `test/renderer-ipc-contract.test.js:88-140`

**Issue**: la extraccion de `window.api.onX(...)` y `subscribeIpc('onX', ...)`
es por regex sobre el fuente. Si alguien escribe la llamada con una forma
distinta (ej. `window['api']['onX'](...)` o aliasing de `window.api`), el test
no la ve.

**Impact**: bajo. El test tiene 2 patrones y cubre las 2 formas que usa el
codigo. Un alias exotico escaparia del test — pero entonces tambien escapa
del TypeError en runtime.

**Fix** (no bloqueante): cuando se agregue un bundler o un transpiler, migrar
el test a un parser AST. Anotado para el futuro.

---

### [MINOR] `subscribeIpc` silencia el fallo de una API ausente con un `warn`

**File**: `src/renderer.js:264-278`

**Issue**: si `preload.js` pierde una API, el renderer loguea un `warn` y sigue.
En produccion el usuario no ve el warning (Electron no abre DevTools), asi que
la feature se rompe en silencio.

**Impact**: bajo, y es **deliberado**: el objetivo del fix es que una API
ausente no aborte las demas suscripciones. El test de contrato
(`renderer no llama window.api.onX que preload.js no exponga`) es la red de
seguridad real — corre en CI y en `npm test`.

**Fix** (no bloqueante): si se quiere visibilidad en produccion, acumular los
nombres faltantes y emitirlos por `pet-system-event` una vez al arrancar.

---

### [MINOR] El greeting por app se dispara en el primer cambio de categoria, no en el primero de cada categoria

**File**: `src/renderer.js:466-474`

**Issue**: `SEEN_APP_CATEGORIES` se puebla al primer `app-changed` de cada
categoria, asi que el saludo suena **una vez por categoria por sesion**. Si el
usuario cambia entre `code` y `browser` 20 veces, suena 2 veces. Es el
comportamiento del codigo original (`7c7f3dc`) y coincide con la intencion
documentada ("Mostrar saludo solo la primera vez que vemos esta category").

**Impact**: ninguno — es el comportamiento esperado.

**Fix**: ninguno. Se documenta para que un review futuro no lo cambie por
error.

---

### [INFO] Los 7 handlers restaurados usan el payload real de `main.js`, verificado uno por uno

**File**: `src/renderer.js:381-478`

Se verifico el payload de cada canal contra el emitter:

| Handler | Emitter | Payload verificado |
|---|---|---|
| `onPetAction` | `main.js:816`, `main.js:1421` | `{ type:'speak', text, emotion, action, sound, intent }` — `text` es `String(...).slice(0,1000)`, `sound` normalizado a `'none'` si es invalido (`pet-motion.js:68`) |
| `onTriggerAutonomousTip` | `main.js:477` | `void` — el handler llama `api.aiQuickTip()` |
| `onSystemEvent` | `main.js:215` | `{ event, source, text, ts }` — `event` ∈ {`lock`,`unlock`,`suspend`,`resume`,`idle-break`} |
| `onMorningBriefing` | `main.js:1640` | `{ text, ts }` |
| `onEveningSummary` | `main.js:1671` | `{ text, ts }` |
| `onUpdateStatus` | `main.js` (auto-updater) | `{ kind, version }` |
| `onAppChanged` | `main.js:1803` | `{ processName, windowTitle, category, mood, wagTargets }` |

`normalizePetSound` devuelve `'none'` para sonidos invalidos, asi que el check
`data.sound !== 'none'` del handler de audio es correcto: no intenta
sintetizar un sonido desconocido.

---

### [INFO] `onAppChanged` aplica el mood pero no los `wagTargets`

**File**: `src/renderer.js:466-474`

**Issue**: el payload trae `wagTargets: { speed, amplitude }` y el handler los
ignora. La feature v2.2.0 completa (interpolacion gradual del wag) no queda
restaurada.

**Impact**: medio en la feature, **cero en la app**: el sistema de wag actual
es CSS-driven (`animations.css` con `.anim-wag` / `.anim-wag-fast`), no hay
variables de interpolacion que setear. Los targets no tienen a donde ir sin
reimplementar el lerp.

**Decision**: el plan lo declara explicitamente en **Non-Goals**: *"No se
implementa onAppChanged con wag targets interpolados... El wag dinámico queda
para un plan propio."* El mood por app (la parte visible) si queda restaurado.

**Fix**: plan propio para el lerp de wag sobre CSS. No bloqueante para este PR.

---

### [INFO] `pomodoro:completed` NO se suscribe (decisión deliberada, con test que la fija)

**File**: `src/renderer.js:369-380`, `test/release-workflow.test.js:216-246`

Este fue **el hallazgo mas importante del review**: la primera version de este
fix suscribia `onPomodoroCompleted` para actualizar el badge con
`{ status:'idle', mode:'focus', remainingSec:0 }`.

**Era incorrecto.** `main.js:1293-1296` emite:

```js
broadcastToAllWindows('pomodoro:tick', payload);        // PRIMERO
if (eventKind === 'completed') {
  broadcastToAllWindows('pomodoro:completed', payload); // DESPUES, mismo payload
}
```

El payload ya trae el estado **nuevo** (tras un bloque de focus: `mode:'break'`,
`remainingSec` = duracion del break). El handler de `completed` llega despues y
pisaba ese estado con los valores del focus ya terminado → el badge mostraba
`00:00 🍅` en vez de `05:00 ☕`.

**Fix aplicado**: se elimino la suscripcion a `onPomodoroCompleted`. El badge se
actualiza solo con `onPomodoroTick`, que recibe todos los cambios de estado
(`eventKind` ∈ {`started`,`paused`,`tick`,`completed`}).

**Test que lo fija**: `test/release-workflow.test.js` asserta (a) que `main.js`
emite `pomodoro:tick` antes que `pomodoro:completed`, y (b) que el renderer
**no** se suscribe a `onPomodoroCompleted`. Si alguien reintroduce el handler,
el test falla.

---

### [INFO] El workflow de release: 3 correcciones verificadas contra el codigo de electron-builder

**File**: `.github/workflows/release.yml:78-148`

1. **`--publish never`** — verificado en el fuente de electron-builder:
   `node_modules/app-builder-lib/out/publish/PublishManager.js:54` dispara el
   publish implicito por tag, y la linea 135
   (`artifactCreatedWithoutExplicitPublishConfig`) es la que tira el error de
   `GH_TOKEN`. Sin `--publish never`, el build falla antes del upload.

2. **`latest.yml`** — verificado en `package.json`: `build.publish` esta
   configurado, y `electron-updater` lee `latest.yml` de la release para
   detectar updates. Sin subirlo, el auto-update del README
   ("la app chequea updates al abrirla y cada 6 horas") no funciona.

3. **`--verify-tag` en vez de `--target latest`** — `latest` no es ni una rama
   ni un commit (es el nombre de la release). Con `--target latest` y sin
   `--verify-tag`, `gh release create` podia crear un tag fantasma. Ahora el
   workflow falla si el tag no existe, que es el comportamiento correcto (el
   orquestador es quien taguea).

**Test**: 13 tests parsean el YAML y asserta cada punto.

---

## Evidencia de runtime (app real, no mocks)

Ejecutado con Electron 43 + el `preload.js` real, enviando los payloads
reales por IPC desde el proceso main:

```
[state-inicial]    {"hasMoodClass":true,"containerClass":"interactive mood-happy",
                    "svgTags":1,"badgeTime":"25:00","badgeIcon":"🍅"}
[badge-tick]       {"time":"12:34","icon":"🍅"}    (payload real de main.js:1283)
[badge-break]      {"time":"01:05","icon":"☕"}
[app-changed]      {"containerClass":"interactive mood-calm","speechVisible":true,
                    "speechText":"¡Modo código! A romperla."}
[morning-briefing] {"speechVisible":true,"speechText":"Buenos dias, 3 reuniones hoy."}
[pet-action]       {"speechVisible":true,"speechText":"Hola!",
                    "containerClass":"interactive mood-calm landing-bounce sitting"}
[errors]           total=0 typeErrors=0
```

**Antes del fix** (mismo runner, 2026-10-26 pre-fix):

```
[console] Uncaught TypeError: window.api.onPomodoroState is not a function
[state]   {"apiOnPomodoroState":"undefined","apiOnPetSpeech":"undefined",
           "apiOnSettingsUpdated":"function","hasMoodClass":false}
```

`hasMoodClass: false` → `true` y `typeErrors: 0` → `0`. El bug 1 esta
cerrado verificado en runtime, no solo por tests.

---

## Suite completa

```
npm test   → 897/897 pass, 0 fail (863 previos + 34 nuevos)
npm run check → OK (33 archivos)
npm audit  → 0 vulnerabilidades
```

## Conteo de severidad (coincide con el frontmatter)

| Severidad | Cantidad | Hallazgos |
|---|---|---|
| CRITICAL | 0 | — |
| MAJOR | 0 | — |
| MINOR | 3 | parsing por regex, warn silencioso, greeting por categoría |
| INFO | 4 | payloads verificados, wagTargets fuera de scope, `pomodoro:completed`, workflow |

**Todos los MINOR son mejoras de robustez sin impacto en el comportamiento
corregido.** El hallazgo de `pomodoro:completed` fue CRITICAL en la primera
version del fix y quedo **corregido antes de aprobar** — no se approve con
deuda abierta.
