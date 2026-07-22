# Plan: batch-3-productividad

**Fecha**: 2026-07-22
**Versión target**: v1.7.0
**Sprint**: 6 (semana 6-7)
**Depende de**: batch 2 (A1 mood, A2 powerMonitor, A3/A4 context, P3 recuerdos — todos done en v1.6.0)
**Habilita**: batch 4 (distribución + polish + T7 electron-builder → v2.0)

---

## 1. Objetivo

Cerrar la **capa de productividad** de la mascota: que no solo te acompañe y te
conozca, sino que te **ayude a hacer**. Tres líneas de trabajo:

1. **Track A — Pomodoro que se adapta**: timer con plantillas (25/5, 50/10, 90/20,
   custom), break largo cada 4 focus blocks (I1), racha de días con ≥1 focus
   block (W5), plantillas configurables (W4).
2. **Track B — Quick capture + reportes**: textarea flotante con `Cmd+Shift+Q`
   para capturar ideas sin abrir el dashboard (I2), y reporte semanal markdown
   de productividad (W3).
3. **Track C — Briefing diario**: al abrir la app por la mañana te cuenta cómo
   viene el día (I7), y al final del día te muestra un resumen (I8).

Decisiones tomadas:
- **Daily briefing/summary (I7/I8)** lo hago **yo** (orquestador) porque es
  transversal: toca startup, renderer's `onSystemEvent`, y depende de stats de
  pomodoro + capturas + recuerdos. Coordinar eso entre 2 workers es pedir que
  se pisen en `main.js`.
- **W4 plantillas**: 3 fijas (25/5, 50/10, 90/20) + 1 custom (libre). Storage
  en JSON, default = 25/5.
- **W5 streak**: racha de **días consecutivos con ≥1 focus block completado**.
  Si un día no hay focus → racha rota. Mensaje al usuario cuando llega a 3, 7, 14, 30 días.
- **I2 quick capture**: el shortcut `Cmd+Shift+Q` ya está wireado a
  `quick-capture-trigger` en `preload.js` (v1.3.0 batch 0). Falta el handler en
  renderer y la persistencia. Máximo 200 caracteres (no es nota larga, es
  "anota esto antes de que se me olvide").
- **I7/I8 daily briefing**: usa la hora del sistema. Briefing = string corto
  (≤ 200 chars) que el `renderer.showSpeech` muestra como globo. No es modal.
  En nightly builds (hora < 7 o > 22) no se muestra.
- **PII redaction**: aplica también a las capturas (mismas reglas que memories).

---

## 2. Features del batch (3 tracks)

### Track A — I1 + W4 + W5 Pomodoro adaptativo (Worker 1) [M, 4-5 días]

**Alcance**:

- **W4 plantillas**: dropdown en dashboard con 4 opciones (25/5 classic,
  50/10 long-focus, 90/20 deep-work, custom). Custom abre 2 inputs (focus/break
  en minutos). Persiste selección en `<userData>/pomodoro-config.json`.
- **I1 adaptativo**: después de 4 focus blocks consecutivos sin break largo,
  el siguiente break es **largo** (15 min por default, configurable). El
  contador de "focus blocks consecutivos" se resetea con el break largo.
- **W5 streak**: contador visible en dashboard ("Llevas 3 días con focus").
  Mensaje motivacional al alcanzar 3, 7, 14, 30 días (cat/dog personality).
  Persiste en `pomodoro-sessions.json` (no archivo nuevo).
- **Stats visibles**: 3 widgets en dashboard — "Focus hoy: X", "Total esta
  semana: Y", "Racha: Z días".

**Archivos nuevos**:

- `src/core/pomodoro-templates.js` (UMD-lite pure)
  - `TEMPLATES` constant: `[{ id, label, focusMin, breakMin, longBreakMin, longBreakEvery }, ...]`
  - `getTemplate(id)`, `validateTemplate({focusMin, breakMin, longBreakMin, longBreakEvery})`
  - `formatTemplateForDisplay(template)` → `"25 / 5 (long break 15 every 4)"`
  - Tests: validación de cada plantilla, validateTemplate con inputs
    inválidos, format edge cases.

- `src/core/pomodoro-adaptive.js` (UMD-lite pure)
  - `DEFAULT_LONG_BREAK_EVERY = 4`
  - `DEFAULT_LONG_BREAK_MIN = 15`
  - `shouldUseLongBreak(focusBlocksCompleted, longBreakEvery)` → bool
  - `nextBreakKind({focusBlocksCompleted, lastBreakWasLong, longBreakEvery})` → `'short'|'long'`
  - Tests: edge case 3→4, 4→5 (regresa a short), last break long (skip long
    immediately), custom threshold.

- `src/core/pomodoro-streak.js` (UMD-lite pure)
  - `computeStreak(completedDays, today)` → número de días consecutivos
    hacia atrás con ≥1 focus (incluye hoy si hay focus hoy)
  - `isStreakMilestone(days)` → bool (true en 3, 7, 14, 30, 60, 100)
  - `getStreakMilestoneMessage(days, petType)` → string con tono cat/dog
  - Tests: racha de 1, 3, 5 (no milestone), 7 (milestone), racha rota
    (ayer sin focus → 0), edge cases de timezone (usar fecha local, no UTC).

- `src/services/pomodoro-store.js` (persistencia)
  - `<userData>/pomodoro-config.json` (plantilla seleccionada + custom values)
  - `<userData>/pomodoro-sessions.json` (sesiones completadas: timestamp,
    tipo focus/break, duración real)
  - `loadConfig()`, `saveConfig({templateId, customFocus, customBreak})`,
    `loadSessions()`, `appendSession({kind, durationSec, startedAt,
    endedAt})`, `getStatsToday()`, `getStatsThisWeek()`,
    `getCompletedDays(today, n)` → array de `{date, focusCount}` para
    streak.
  - Patrón igual a `mood-store.js` y `memories-store.js`: `FILE_VERSION`,
    `isValidStore`, atomic write (.tmp + rename), `clearFile()`.
  - Tests: round-trip, corrupt file → initial, append, prune a últimos 90
    días (no más, no nos interesa el histórico de hace 3 meses).

- `test/pomodoro-templates.test.js` (~15 tests)
- `test/pomodoro-adaptive.test.js` (~12 tests)
- `test/pomodoro-streak.test.js` (~15 tests)
- `test/pomodoro-store.test.js` (~15 tests)

**Archivos modificados**:

- `src/dashboard.html`: dropdown de plantillas + inputs custom + widgets de
  stats ("Focus hoy", "Total semana", "Racha").
- `src/dashboard-renderer.js`:
  - `applyTemplate(template)` reemplaza `focusDuration`/`breakDuration`.
  - Al completar un focus block: `window.api.pomodoroRegisterSession(...)`,
    refrescar stats widget.
  - `getStreak()` cada 1 min mientras dashboard está abierto.
  - Bind handlers de dropdown e inputs custom.
- `src/styles.css`: estilos para dropdown, inputs, stat widgets.
- `main.js`:
  - `pomodoroConfig` cargado al startup, expuesto via IPC.
  - IPC `pomodoro:register-session`, `pomodoro:get-stats`, `pomodoro:get-config`,
    `pomodoro:set-config` (con `isDashboardSender`).
  - En `startTimer` cuando timeLeft==0: si era focus, antes de cambiar a
    break, llamar `pomodoro-adaptive.nextBreakKind(...)` para decidir
    `breakDuration` (short vs long).
  - Si llega a milestone (3/7/14/30 días), emitir evento al renderer
    `streak-milestone` con mensaje.
- `preload.js`: exponer `pomodoroGetConfig`, `pomodoroSetConfig`,
  `pomodoroRegisterSession`, `pomodoroGetStats`, `pomodoroGetStreak`,
  `onStreakMilestone`.
- `package.json`: agregar nuevos archivos al `check` script.

**Criterios de aceptación**:

- [ ] Dashboard permite cambiar entre 4 plantillas, persiste la selección.
- [ ] Plantilla custom: focus entre 5-120 min, break entre 1-30 min, valida.
- [ ] Después de 4 focus blocks, el 5to break es largo (15 min).
- [ ] Después del break largo, el siguiente focus NO entra en "long break" (el
      contador se resetea).
- [ ] Dashboard muestra stats correctos: focus hoy, total semana, racha.
- [ ] Racha se calcula con fecha local (no UTC) — testeado con mocks de Date.
- [ ] Mensaje de milestone (3 días, 7 días) llega al renderer y se muestra
      como speech.
- [ ] `pomodoro-sessions.json` no crece más de 90 días.
- [ ] 55+ tests nuevos pasan.
- [ ] `npm run sdlc:dev` verde, `sdlc:strict` APPROVED.

---

### Track B — I2 + W3 Quick capture + reporte semanal (Worker 2) [M, 3-4 días]

**Alcance**:

- **I2 quick capture**: con `Cmd+Shift+Q` se abre un overlay flotante en
  `petWindow` con un textarea (max 200 chars), botón "Guardar" y "Cancelar".
  Enter = guardar, Esc = cancelar. Persiste en
  `<userData>/quick-captures.json`. PII redactada si toggle ON (reusar
  `extractPII` de `pet-memories.js`).
- **W3 reporte semanal**: botón en dashboard "Exportar reporte semanal" que
  genera un markdown con:
  - Período (lunes a domingo, configurable)
  - Focus blocks completados (total + por día)
  - Tiempo total en focus (HH:MM)
  - Racha actual + mejor racha
  - Quick captures de la semana (top 5 más largas o todas si < 5)
  - Score de productividad (0-100): heurística simple = `min(100, focusBlocks * 5 + min(20, streak * 2))`
  - Botón "Copiar al portapapeles" + "Guardar como .md"
- API: `quick-capture:save`, `quick-capture:list`, `quick-capture:clear`,
  `weekly-report:get`.

**Archivos nuevos**:

- `src/core/quick-capture.js` (UMD-lite pure)
  - `validateCaptureText(text)`, `truncateForPreview(text, maxChars=60)`,
    `formatTimestamp(ts)`, `applyPIIRedaction(text, extractPII)` (wrapper).
  - Tests: validación, truncate, format timestamp, PII redaction.

- `src/services/quick-capture-store.js`
  - `FILE_VERSION = 1`, atomic write, lista de capturas `{id, text,
    createdAt}`.
  - `loadCaptures()`, `appendCapture(text)`, `clearCaptures()`,
    `getRecentCaptures(limit=20)`.
  - Tests: round-trip, corrupt file, append, clear, prune a últimas 100.

- `src/core/weekly-report.js` (UMD-lite pure)
  - `getWeekRange(today, weekStart='monday')` → `{start, end}` Dates
  - `filterSessionsByRange(sessions, start, end)` → sessions filtradas
  - `filterCapturesByRange(captures, start, end)` → captures filtradas
  - `buildWeeklyReport({sessions, captures, streak, longestStreak,
    weekStart, today})` → objeto con secciones
  - `formatReportAsMarkdown(report)` → string markdown
  - `computeProductivityScore({focusBlocks, totalFocusMinutes, streak})` →
    number 0-100
  - Tests: cada pure function, edge cases (semana vacía, sesión única,
    semana cruzada de mes).

- `test/quick-capture.test.js` (~12 tests)
- `test/quick-capture-store.test.js` (~10 tests)
- `test/weekly-report.test.js` (~20 tests)

**Archivos modificados**:

- `src/pet.html` o crear `src/quick-capture.html` + `src/quick-capture.css` +
  `src/quick-capture-renderer.js`: overlay flotante.
  - OJO: alternativa más simple: inyectar overlay en `pet.html` existente
    (el pet window) con `<div id="quick-capture-overlay" hidden>...`.
    Recomiendo esta para evitar crear una ventana nueva.
- `src/pet.html`: agregar el overlay markup + script.
- `src/renderer.js`: handler `window.api.onQuickCaptureTrigger(...)` → toggle
  overlay.
- `main.js`:
  - IPC `quick-capture:save`, `quick-capture:list`, `quick-capture:clear`,
    `weekly-report:get` (con `isDashboardSender`).
  - Carga `quickCaptures` al startup, integra con PII redaction global.
- `preload.js`: `quickCaptureSave`, `quickCaptureList`,
  `quickCaptureClear`, `weeklyReportGet`, `onQuickCaptureTrigger` (ya existe).
- `src/dashboard.html` + `src/dashboard-renderer.js`:
  - Nueva tab "Capturas" (entre "Recuerdos" y "Settings") con lista +
    botón clear.
  - Botón "Reporte semanal" en tab Pomodoro → genera markdown → opciones
    copiar/guardar.
- `src/styles.css`: estilos del overlay, lista de capturas, modal de
  reporte.
- `package.json`: nuevos archivos en `check`.

**Criterios de aceptación**:

- [ ] `Cmd+Shift+Q` abre overlay flotante sobre la mascota.
- [ ] Textarea acepta hasta 200 chars, contador visible.
- [ ] Enter guarda, Esc cancela, click fuera cancela.
- [ ] Captura persiste en JSON, se ve en tab "Capturas" del dashboard.
- [ ] PII redactada si toggle ON.
- [ ] Reporte semanal se genera como markdown válido, copy-to-clipboard
      funciona.
- [ ] Score de productividad 0-100 con heurística documentada.
- [ ] 40+ tests nuevos pasan.

---

### Track C — I7 + I8 Daily briefing + summary (YO, sequential) [S, 2 días]

**Por qué yo y no worker**: I7/I8 son transversales. Toca startup de Electron
(`app.whenReady`), el handler de eventos del renderer (`onSystemEvent`), y
consume stats de pomodoro + capturas + recuerdos. Dos workers haciendo esto se
pisan en `main.js` seguro. Además, es scope pequeño (S), no justifica
delegar.

**Alcance**:

- **I7 Morning briefing**: string corto que aparece como globo de la mascota
  al abrir la app, si la hora está entre 7:00 y 12:00. Incluye:
  - Saludo según hora (buenos días / buen día)
  - "Ayer completaste X focus blocks" o "Esta semana llevas Y"
  - Racha actual ("Llevas Z días con focus")
  - "Tienes N capturas pendientes" (si hay)
- **I8 Evening summary**: string corto al cerrar la app, si hora >= 18:00.
  - "Hoy completaste X focus blocks (Y minutos)"
  - "Tu racha: Z días"
  - "Mañana seguimos, [nombre de mascota]"
- **No intrusivo**: si el usuario no quiere, toggle en Settings "Mostrar
  briefing diario" (default ON). El toggle es opt-out, no opt-in.
- **Frecuencia**: solo 1 vez por día. Si el usuario abre la app 5 veces en la
  mañana, solo ve el briefing la primera. Estado persistido en
  `daily-briefing.json`.

**Archivos nuevos**:

- `src/core/daily-briefing.js` (UMD-lite pure)
  - `getGreetingByHour(hour, petType)` → "Buenos días" / "Buen día" /
    "Buenas tardes" (con tono cat/dog)
  - `shouldShowBriefing({hour, lastShownDate, enabled})` → bool
  - `buildMorningBriefing({today, yesterdayStats, weekStats, streak,
    pendingCaptures, petType})` → string ≤ 200 chars
  - `buildEveningSummary({today, todayStats, streak, petType})` → string
    ≤ 200 chars
  - Tests: cada función, edge cases (sin datos, hora frontera, 1 vez por
    día).

- `src/services/daily-briefing-store.js`
  - `<userData>/daily-briefing.json` con `{lastShownDate, enabled}`
  - `loadBriefingState()`, `markShown(today)`, `setEnabled(bool)`,
    `clearBriefingState()`.
  - Tests: round-trip, markShown no duplica mismo día, setEnabled.

- `test/daily-briefing.test.js` (~18 tests)
- `test/daily-briefing-store.test.js` (~6 tests)

**Archivos modificados**:

- `main.js`:
  - Después de `app.whenReady()` y antes de crear `petWindow`, si hora
    actual está en rango y `shouldShowBriefing` → programar emisión del
    evento `morning-briefing` (después de que la ventana esté lista, 3s
    delay para que no aparezca de una).
  - Antes de `app.on('before-quit')`, si hora >= 18:00 y no se mostró
    summary hoy → `evening-summary`.
  - IPC `briefing:get-today` (con `isDashboardSender`) para forzar desde
    dashboard (botón "Ver briefing").
  - IPC `briefing:set-enabled`.
- `src/renderer.js`: handler `morning-briefing` y `evening-summary` →
  `showSpeech(text, ...)`.
- `preload.js`: `onMorningBriefing`, `onEveningSummary`, `briefingGetToday`,
  `briefingSetEnabled`.
- `src/dashboard.html` + `src/dashboard-renderer.js`: en Settings, toggle
  "Mostrar briefing diario". Botón "Ver briefing de hoy" en tab Pomodoro.
- `package.json`: nuevos archivos en `check`.

**Criterios de aceptación**:

- [ ] Al abrir la app entre 7-12am (primera vez del día) → globo con
      briefing.
- [ ] Al abrir la app por 2da vez en la mañana → NO se muestra (solo 1/día).
- [ ] Al cerrar la app después de 18:00 → summary aparece.
- [ ] Briefing/summary respetan tono cat/dog.
- [ ] Toggle en Settings apaga ambos.
- [ ] Briefing menciona stats reales (focus hoy, racha, capturas).
- [ ] 24+ tests nuevos pasan.

---

## 3. Orquestación con worktrees (3 tracks)

Lección batch 0: workers en mismo cwd se pisaban en `main.js`. Lección batch
2: workers con `run_in_background: true` no confiables para M/L. Solución
batch 3: **worktrees + workers en foreground pero `run_in_background: true`
para que no bloqueen al orquestador + yo superviso**.

### Setup (orquestador)

```bash
node scripts/sdlc-worktree.js add feat/b3-pomodoro-adapt
node scripts/sdlc-worktree.js add feat/b3-quickcapture-report
```

Resultado:
- `../mascotaVirtual-feat-b3-pomodoro-adapt/` (branch feat/b3-pomodoro-adapt)
- `../mascotaVirtual-feat-b3-quickcapture-report/` (branch feat/b3-quickcapture-report)

### Track A — Worker 1 (M, 4-5 días)

Worker opera en su worktree. NO hace `git checkout` ni `git stash`. Commitea
en su branch. Prompt ultra detallado (este documento es la spec).

**Si worker se traba** (> 30 min sin progreso detectable, o push --force, o
modifica archivos fuera de scope): orquestador retoma manualmente.

### Track B — Worker 2 (M, 3-4 días)

Worker opera en su worktree. Mismas reglas que Track A.

**Track B debería terminar antes** (es M chico vs M grande). Si termina
antes: arranca a redactar el reporte de cierre o ayuda a Track A.

### Track C — Yo (S, 2 días)

Trabajo en `main` directamente, en commits chicos y reversibles. Como los
otros tracks están en worktrees, no hay pisoteo en `main.js`.

Empiezo Track C apenas los workers estén en marcha, en bloques de 1-2 horas
entre monitoreos.

### Orquestador

- Monitorea cada 30-60 min: `git fetch --all && git log origin/feat/b3-XXX --oneline`
- Si worker empuja commits, los reviso con `git diff main..feat/b3-XXX --stat`
- Conflictos esperados al merge: `main.js`, `preload.js`, `src/dashboard.html`,
  `src/dashboard-renderer.js`, `src/styles.css`, `package.json`. Merge
  manual de 5-20 líneas, factible.
- Orden de merge: Track B primero (más chico, menos conflicto), después Track
  A, después Track C. Tag `v1.7.0-track-b` después de merge B, `v1.7.0-track-a`
  después de merge A, `v1.7.0` final.

---

## 4. Conflictos anticipados y resolución

| Archivo | Track A | Track B | Track C | Resolución |
|---|---|---|---|---|
| `main.js` | IPC pomodoro (4) | IPC quick-capture + weekly-report (4) | IPC briefing (3) | Merge manual: bloques de IPC no se solapan, son `ipcMain.handle('xxx', ...)`. |
| `preload.js` | 6 funciones pomodoro | 4 funciones quick-capture | 4 funciones briefing | Merge manual: cada track agrega su sección. |
| `src/dashboard.html` | Dropdown + 3 widgets | Tab "Capturas" + botón reporte | Toggle Settings | Merge manual por sección. |
| `src/dashboard-renderer.js` | Handlers pomodoro | Handlers capturas + reporte | Handlers briefing | Merge manual: cada handler está en su propia función. |
| `src/styles.css` | .pomodoro-stats, .template-select | .quick-capture-list, .report-modal | .briefing-toggle | Sin solapamiento (clases distintas). |
| `package.json` | Agrega 4 archivos a `check` | Agrega 3 archivos a `check` | Agrega 2 archivos a `check` | Concatenar, no duplicar. |
| `src/renderer.js` | (no toca) | Handler onQuickCaptureTrigger | Handler morning/evening events | Merge manual: append al final. |

Todos los conflictos son mecánicos, no lógicos. El merge debería tomar
~30 min al final del batch.

---

## 5. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| **Workers M/L se traban** (lección batch 1) | Prompts ultra detallados. Si > 30 min sin progreso, retomo yo. Cada track es un branch separado → rollback es `git reset --hard origin/main`. |
| **PII leak en quick-captures** | Mismo `extractPII` de memories-store, toggle reusado de Settings (ya en v1.6.0). Test con corpus PII. |
| **Streak calculado mal con timezone** | Usar `toLocaleDateString('en-CA')` (YYYY-MM-DD local) en lugar de `toISOString()`. Test con mocks de Date en distintas zonas. |
| **Adaptive pomodoro confunde al usuario** | Tooltip explica: "Cada 4 focus blocks, break largo (15 min)". Solo después del 4to focus, no antes. |
| **Briefing se vuelve spam** | 1 vez por día, persistido. Si user abre 10 veces, ve 1. Toggle off. |
| **Reporte semanal con score "fake"** | Documentar la heurística en el código. Score es solo orientativo, no se muestra como "calificación oficial". |
| **Quick capture overlay choca con pet click area** | Overlay tiene `pointer-events: auto` solo cuando visible. Pet click area solo cuando oculto. |
| **Storage crece sin límite** | Pomodoro sessions: prune a 90 días. Captures: prune a 100 últimas. Memories: ya tiene prune a 50. |

---

## 6. Métricas de éxito

- [ ] 3 tracks mergeados sin conflictos lógicos
- [ ] 410+ tests verdes (383 actuales + ~50-70 nuevos)
- [ ] `npm run sdlc:dev` verde
- [ ] `sdlc:strict` APPROVED con plan + review + qa
- [ ] Review adversarial con 0 MUST-FIX
- [ ] QA sign-off con smoke test: pomodoro cambia a break largo al 4to,
      quick capture guarda, briefing aparece, reporte se genera
- [ ] No PII leakage en logs
- [ ] Changelog v1.7.0 con 7 features nuevas (I1, I2, I7, I8, W3, W4, W5)
- [ ] Working tree clean
- [ ] Tag v1.7.0 en origin

ETA: 5-7 días (1 sprint).

---

## 7. Out of scope (batch 4+)

- **I3 calendar awareness**: requiere .ics parser o OAuth. → batch 4 con T7
  electron-builder (lo metemos como stretch).
- **I4 git activity awareness**: defer.
- **I5 time tracking awareness**: defer.
- **I6 Slack/Linear forwarding**: defer (requiere OAuth).
- **I9/I10 focus music + reading mode**: defer.
- **W1 modo compañía silenciosa**: defer (batch 4 polish).
- **W2 auto-pause en reuniones**: defer (necesita calendar).
- **W6/W7 mood-aware responses + anti-procrastination**: defer.
- **T5 60fps perf pass**: defer (batch 4).
- **T6/T7 auto-update + builder**: batch 4 (pre-v2.0).

---

## 8. Decisiones a confirmar antes de implementar

1. **Quick capture**: overlay flotante sobre pet window, o ventana nueva?
   - Recomiendo: **overlay** (más fluido, no interrumpe).
2. **Streak milestone**: ¿qué counts como milestone? Mi propuesta: **3, 7,
   14, 30, 60, 100 días**.
3. **Adaptive long break**: ¿después de cuántos focus blocks? Mi propuesta:
   **cada 4**, configurable.
4. **Briefing storage**: archivo nuevo `daily-briefing.json` o agregar a
   `mood-store.json`?
   - Recomiendo: **archivo nuevo** (separation of concerns).
5. **Reporte semanal formato**: ¿markdown, JSON, o ambos?
   - Recomiendo: **markdown** (legible, copy-paste friendly, no necesita
     parser en renderer).

---

## 9. Changelog de este plan

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-07-22 | Creación inicial — batch 3 productividad (I1+I2+I7+I8+W3+W4+W5), 3 tracks (2 workers + yo), target v1.7.0 | Mavis |
