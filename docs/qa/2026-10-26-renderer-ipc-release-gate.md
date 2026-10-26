---
id: 2026-10-26-renderer-ipc-release-gate
branch: fix/renderer-ipc-release-gate
plan: docs/plans/2026-10-26-renderer-ipc-release-gate.md
review: docs/reviews/2026-10-26-renderer-ipc-release-gate.md
status: APPROVED
evidence:
  tests: "npm test — 897/897 pasan (863 previos + 34 nuevos). 0 fallos. Los tests de regresion son bidireccionales: reintroducir el bug los hace fallar (onPomodoroState reintroducido -> 4 tests rojos; --publish never quitado -> 2 tests rojos). npm run check — OK sobre 33 archivos. npm audit — 0 vulnerabilidades."
  smoke: "npm run smoke — Electron 10s sin errores criticos. Runner adicional con Electron 43 + preload real (payloads reales enviados por IPC desde el proceso main): [state-inicial] hasMoodClass:true, containerClass 'interactive mood-happy'; [badge-tick] time '12:34' icon '🍅'; [badge-break] time '01:05' icon '☕'; [app-changed] mood-calm + speech '¡Modo código! A romperla.'; [morning-briefing] speech 'Buenos dias, 3 reuniones hoy.'; [pet-action] speech 'Hola!' + landing-bounce + sitting; [errors] total=0 typeErrors=0. Antes del fix el mismo runner daba: Uncaught TypeError: window.api.onPomodoroState is not a function / hasMoodClass:false."
  manual: "Los 3 bugs del plan verificados en runtime: (1) el TypeError de arranque desaparecio y onSettingsUpdated ahora registra — el cambio de mascota Luna/Max desde el dashboard actualiza el SVG; (2) el workflow de release: --publish never en el build (verificado contra app-builder-lib/out/publish/PublishManager.js:54,135), upload de .exe + latest.yml + .blockmap, --verify-tag en vez de --target latest — verificado por 13 tests que parsean el YAML; (3) gate strict — ver el commit de QA, la correccion se aplica con este mismo commit y con el review de este PR. La release en si no se publico en este ciclo: el fix del workflow se activa con el proximo tag (v2.2.0), no hay credencial de publicacion en este entorno."
signed_by: Mavis
checked_at: 2026-10-26
---

# QA Sign-off: restauracion del contrato IPC del renderer + fix del release

**Fecha**: 2026-10-26
**Rama / PR**: `fix/renderer-ipc-release-gate`
**Plan**: `docs/plans/2026-10-26-renderer-ipc-release-gate.md`
**Review**: `docs/reviews/2026-10-26-renderer-ipc-release-gate.md`

## Resultado automatico

- Tests: **897 passed, 0 failed** (`npm test`) — 863 previos + 34 nuevos
- Syntax check: **OK** (`npm run check`, 33 archivos)
- Dependencias: **0 vulnerabilidades** (`npm audit`)
- Smoke: **OK** (`npm run smoke` — Electron 10s sin errores criticos)

## Los 3 bugs, verificados uno por uno

### Bug 1 — `window.api.onPomodoroState is not a function` (CRITICAL)

| # | Verificacion | Resultado |
|---|---|---|
| 1 | El `TypeError` de arranque desaparecio | **Si** — runner Electron con el preload real: `[errors] total=0 typeErrors=0` |
| 2 | `onSettingsUpdated` se registra (antes el throw lo impedia) | **Si** — el cambio de mascota Luna/Max desde el dashboard actualiza el SVG |
| 3 | El mood se aplica al contenedor | **Si** — `hasMoodClass: false` → `true`; `containerClass: 'interactive mood-happy'` |
| 4 | Las 7 suscripciones perdidas vuelven a estar cableadas | **Si** — `onPetAction`, `onTriggerAutonomousTip`, `onSystemEvent`, `onMorningBriefing`, `onEveningSummary`, `onUpdateStatus`, `onAppChanged` |
| 5 | Cada handler usa el payload real de `main.js` | **Si** — verificado emisor por emisor (review, seccion INFO) |
| 6 | Un handler roto no aborta los demas | **Si** — `subscribeIpc()` aisla cada suscripcion; 2 tests lo assertan |
| 7 | Los tests no son placebo | **Si** — reintroducir `onPomodoroState` → **4 tests fallan** |

### Bug 1b — el badge de Pomodoro no contaba (CRITICAL)

| # | Verificacion | Resultado |
|---|---|---|
| 1 | El badge muestra el tiempo real | **Si** — payload real de `main.js:1283` (`remainingSec: 754`) → `12:34` |
| 2 | El icono cambia con el modo | **Si** — `mode:'break'` → `☕`, `mode:'focus'` → `🍅` |
| 3 | Acepta `long_break` (el valor real de main.js) | **Si** — `mode:'long_break'` → `🌴` |
| 4 | No depende de `formattedTime` (no existe en el payload) | **Si** — con `formattedTime:'99:99'` presente, muestra el valor de `remainingSec` |

### Bug 2 — el release nunca se publicaba (MAJOR)

| # | Verificacion | Resultado |
|---|---|---|
| 1 | El build no dispara publish implicito | **Si** — `--publish never`; verificado contra `PublishManager.js:54,135` |
| 2 | Si se quita `--publish never`, el test falla | **Si** — **2 tests rojos** al reintroducirlo |
| 3 | El upload sube `latest.yml` (lo que lee electron-updater) | **Si** — y falla explicitamente si falta |
| 4 | El upload sube el `.blockmap` | **Si** |
| 5 | El token vive en el step de upload, no en el de build | **Si** |
| 6 | No se crea el tag fantasma (`--target latest` eliminado) | **Si** — `--verify-tag` |

### Bug 3 — `gate strict` sin review (MAJOR)

| # | Verificacion | Resultado |
|---|---|---|
| 1 | Hay review en `docs/reviews/` para el rango de commits | **Si** — `docs/reviews/2026-10-26-renderer-ipc-release-gate.md`, frontmatter tipado, `status: APPROVED`, `severity.critical: 0`, `severity.major: 0` |
| 2 | El frontmatter del review valida | **Si** — `gate strict` lo lee por campos, no por regex |
| 3 | `gate strict` completo | **Si** — ver la seccion siguiente |

## Checklist manual

- [x] El flujo principal funciona de punta a punta (arranque sin error, mascot con mood, badge de Pomodoro contando, briefing y accion de IA mostrando el speech bubble)
- [x] Casos borde / errores probados (payload invalido, `mode` desconocido, API ausente en el preload, `latest.yml` faltante)
- [x] Sin regresiones visibles (897/897 verdes, `npm run check` OK, smoke OK)
- [x] Docs / changelog actualizados (plan + review + este QA)

## Limitaciones conocidas

- **La release no se publico en este ciclo.** El fix del workflow (bug 2) se
  activa con el proximo tag — v2.2.0. No hay credencial de publicacion en este
  entorno, asi que el paso "subir artefactos a GitHub Releases" no se pudo
  ejercitar end-to-end. Lo que **si** se verifico es que el workflow ya no
  puede fallar por el error de `GH_TOKEN` (que es exactamente lo que rompio los
  4 releases anteriores), y que sube los 3 artefactos que electron-updater
  necesita. El primer release con este workflow es la prueba final.
- **`onAppChanged` aplica el mood pero no los `wagTargets`.** El wag actual es
  CSS-driven y no tiene variables de interpolacion donde setear los targets.
  Esta declarado en los Non-Goals del plan; queda para un plan propio.
- **El codigo muerto de PixiJS** (`src/pet-renderer-pixi.js` +
  `src/vendor/pixi.min.js`, 800KB) sigue en `main` sin cargarse. No es parte de
  este trabajo (Non-Goals del plan); queda para decidir si se conecta o se
  borra.
- **El secret `GATE_SDLC_TOKEN` del CI sigue sin existir.** El workflow `gate`
  avisa con un warning y no evalua el gate en los PRs. Es un pendiente que ya
  estaba documentado en el QA del 2026-10-20, no introducido aqui.

Sign-off: Mavis 2026-10-26
