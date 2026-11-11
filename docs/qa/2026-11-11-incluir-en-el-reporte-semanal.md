---
id: 2026-11-11-incluir-en-el-reporte-semanal
branch: harness/20261111-113848-incluir-en-el-reporte-semanal
plan: docs/plans/2026-11-11-reporte-semanal-proximo-hito.md
status: APPROVED
evidence:
  tests: "npm test (node --test test/*.test.js): 947 tests, 947 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo (duration_ms 44036.5). Incluye los 7 tests nuevos de próximo hito en test/weekly-report.test.js (tabla 0/2/3/5/6/7/59/60/99/100/101 vs getNextMilestone, shape exacto, markdown de racha 5 y 100, y los dos casos node:vm). Sin tests debilitados: git show b093738 --numstat -- test/weekly-report.test.js = 99 insertions, 0 deletions; grep de líneas '-' en el diff del test = 0."
  smoke: "npm run smoke: Electron arranca 10s sin errores críticos (exit 0, 'OK — no se detectaron errores criticos en 10s'). Confirma que main.js sigue requiriendo src/core/weekly-report.js sin romper el arranque."
  manual: "npm run check (node --check sobre los 37 .js): exit 0. Spot-check independiente fuera de la suite: docs/qa/evidence/weekly-report-next-milestone-spotcheck.js ejecutado con node, salida en docs/qa/evidence/weekly-report-next-milestone-spotcheck.txt, 11/11 checks OK (C1-C10b) — cubre los 11 criterios de aceptación, exit 0. grep: src/core/weekly-report.js no contiene [3, 7, 14, 30, 60, 100] literal y sí referencia getNextMilestone/STREAK_MILESTONES."
signed_by: "qa (deepseek/deepseek-flash)"
checked_at: 2026-11-11
---

# QA Sign-off: próximo hito de racha en el reporte semanal

**Fecha**: 2026-11-11
**Branch**: `harness/20261111-113848-incluir-en-el-reporte-semanal`
**Plan**: `docs/plans/2026-11-11-reporte-semanal-proximo-hito.md`
**Review**: `docs/reviews/2026-11-11-incluir-en-el-reporte-semanal.md` (APPROVED, 0 critical / 0 major)
**Veredicto**: **APPROVED**

---

## Alcance verificado

Commit `b093738` (`feat(incluir-en-el-reporte-semanal)`), diff contra `e9fae0a`:

- `src/core/weekly-report.js` (+57/-1):
  - helper `getStreakApi()`: `require('./pomodoro-streak')` perezoso y guarded
    dentro de la función (`typeof module !== 'undefined' && module.exports &&
    typeof require === 'function'`), fallback a `window.PomodoroStreak`, y
    `null` si no hay API. Sin `require` de nivel superior.
  - `buildWeeklyReport`: `streak.nextMilestone = streakApi.getNextMilestone(streak)`
    o `null`. El resto del shape de `streak` (`current`, `longest`) intacto.
  - `formatReportAsMarkdown`: línea extra en `## Racha` —
    `- Próximo hito: N días (faltan M)` con `{milestone, daysLeft}` numéricos, o
    `- Próximo hito: ya alcanzaste el último (${último hito})` derivando el
    último hito de `STREAK_MILESTONES`, o degradación sin paréntesis si no hay
    API de racha.
- `test/weekly-report.test.js` (+99/-0): 7 tests nuevos (tabla de bordes,
  equivalencia con `getNextMilestone`, shape exacto, markdown de 5 y 100,
  carga en navegador con `node:vm` con y sin `window.PomodoroStreak`).

## Comandos corridos y salida real

### 1. `npm test`

```
✔ buildWeeklyReport: streak.nextMilestone es deepEqual a PomodoroStreak.getNextMilestone (0.3871ms)
✔ buildWeeklyReport: sin streak usa la racha normalizada (0) para el próximo hito (0.0916ms)
✔ buildWeeklyReport: shape exacto { milestone, daysLeft } y null sin hito (0.1329ms)
✔ formatReportAsMarkdown: con racha 5 muestra el próximo hito en ## Racha (0.1081ms)
✔ formatReportAsMarkdown: con racha 100 avisa que alcanzó el último hito (0.062ms)
✔ vm: window.WeeklyReport calcula nextMilestone con window.PomodoroStreak (1.1836ms)
✔ vm: sin window.PomodoroStreak degrada sin lanzar y sin paréntesis (0.7385ms)
ℹ tests 947
ℹ suites 1
ℹ pass 947
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 44036.5492
```

### 2. `npm run check`

```
check exit: 0
```

`node --check` sobre los 37 `.js`, incluido `src/core/weekly-report.js`.

### 3. `npm run smoke`

```
[smoke-test] Iniciando Electron por 10s...
[smoke-test] Timeout alcanzado (10s). Cerrando Electron...
[smoke-test] Electron salio con codigo null
[smoke-test] OK — no se detectaron errores criticos en 10s
smoke exit=0
```

### 4. Spot-check independiente de los criterios

Script: `docs/qa/evidence/weekly-report-next-milestone-spotcheck.js`
Salida: `docs/qa/evidence/weekly-report-next-milestone-spotcheck.txt`
(fuera de la suite del repo, comparado contra los valores literales del plan).

```
OK   C1 streak 5 -> {milestone:7,daysLeft:2}
OK   C2 sin streak -> {3,3} igual a getNextMilestone(0)
OK   C3 streak 3 -> {7,4}; streak 99 -> {100,1}
OK   C4 streak 100/101/200 -> null
OK   C5 tabla 0,2,3,5,6,7,59,60,99,100,101 deepEqual getNextMilestone
OK   C6 markdown racha 5 incluye "- Próximo hito: 7 días (faltan 2)" en ## Racha
OK   C7 markdown racha 100 incluye "(100 días)"
OK   C8 navegador sin window.PomodoroStreak: no lanza, degrada sin paréntesis
OK   C9 weekly-report.js no tiene arreglo literal [3,7,14,30,60,100]
OK   C10a require("../src/core/weekly-report") funciona en Node
OK   C10b context navegador (window={}) define window.WeeklyReport y usa window.PomodoroStreak

RESULT: todos los criterios OK
```

## Criterios de aceptación del plan

- [x] `buildWeeklyReport({ streak: 5 }).streak.nextMilestone` deepEqual `{ milestone: 7, daysLeft: 2 }` — test nuevo + C1.
- [x] streak 0 / sin streak → `{ milestone: 3, daysLeft: 3 }`, igual que `getNextMilestone(0)` — test nuevo + C2.
- [x] streak 3 → `{7,4}`; streak 99 → `{100,1}` — test nuevo + C3.
- [x] streak 100, 101 y 200 → `null` — test nuevo + C4.
- [x] Tabla 0,2,3,5,6,7,59,60,99,100,101 deepEqual a `PomodoroStreak.getNextMilestone(streak)`; la regla no se reimplementa — test de equivalencia + C5.
- [x] markdown racha 5 incluye `- Próximo hito: 7 días (faltan 2)` dentro de `## Racha` — test nuevo + C6 (la sección se recorta hasta `## Score`).
- [x] markdown racha 100 incluye `- Próximo hito: ya alcanzaste el último (100 días)` — test nuevo + C7.
- [x] Sin API de racha disponible, `formatReportAsMarkdown` no lanza y la línea degrada a `- Próximo hito: ya alcanzaste el último` — test `vm` sin `window.PomodoroStreak` + C8.
- [x] `src/core/weekly-report.js` no contiene el arreglo literal 3,7,14,30,60,100; la lista sale de `STREAK_MILESTONES` — grep + C9 (el último hito del texto «(100 días)» también se deriva de `STREAK_MILESTONES[milestones.length - 1]`).
- [x] `require('../src/core/weekly-report')` sigue funcionando en Node (main.js lo requiere sin cambios) y en contexto tipo navegador `window.WeeklyReport` existe y calcula `nextMilestone` con `window.PomodoroStreak` — C10a/C10b + test `vm`; smoke confirma que el arranque de Electron no se rompió.
- [x] `npm test` pasa completo, con los tests existentes de weekly-report y los nuevos, 0 fallos — 947/947, 0 fail, 0 skipped.

## Integridad de los tests

`git show b093738 --numstat -- test/weekly-report.test.js` → `99 0`: sólo
líneas agregadas. `git show b093738 -- test/weekly-report.test.js | grep -c "^-[^-]"`
→ `0`. Ningún assert preexistente se modificó, relajó ni salteó; la suite
completa sube de 940 a 947 tests con 0 fallos.

## Notas

- El plan no declara `visual: true` y el cambio es lógica pura sin superficie
  visual, por lo que no se adjuntan capturas PNG.
- Todos los procesos abiertos (Electron del smoke, node de test) terminaron
  con la corrida; no quedan servidores ni apps en segundo plano.
- Sin desvíos. Aprobado.
