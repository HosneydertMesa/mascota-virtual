---
id: 2026-11-11-incluir-en-el-reporte-semanal
branch: harness/20261111-113848-incluir-en-el-reporte-semanal
plan: docs/plans/2026-11-11-reporte-semanal-proximo-hito.md
status: APPROVED
evidence:
  tests: "npm test (node --test test/*.test.js): 951 tests, 951 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo (duration_ms 42734.8207). Incluye los 11 tests de próximo hito en test/weekly-report.test.js: tabla 0/2/3/5/6/7/59/60/99/100/101 vs PomodoroStreak.getNextMilestone (:535), racha normalizada (:546), shape exacto y null (:552), markdown racha 5 (:566) y racha 100 (:572), los dos sandbox node:vm (:584, :596) y los 4 tests de la ronda 2: singular 'falta 1' (:619), plural (:627), campo ausente sin línea (:634), null con '(100 días)' (:645). Sin tests debilitados: git show b093738 --numstat -- test/weekly-report.test.js = 99/0; git show 211a496 --numstat = 35/0; git diff 5802acf..HEAD -- test/weekly-report.test.js sólo tiene la cabecera '---' como línea con '-', 0 líneas eliminadas reales."
  smoke: "npm run smoke: Electron arranca 10s, '[smoke-test] OK — no se detectaron errores criticos en 10s', exit 0. Confirma que main.js sigue requiriendo src/core/weekly-report.js sin romper el arranque. Los 4 procesos electron.exe (PID 16280, 15468, 40760, 39852) se cerraron con taskkill /PID <pid> /T /F; tasklist ya no los muestra (grep exit 1)."
  manual: "npm run check (node --check sobre los 38 .js, incluido src/core/weekly-report.js): exit 0. Spot-check independiente fuera de la suite: node docs/qa/evidence/weekly-report-next-milestone-spotcheck.js (salida en docs/qa/evidence/weekly-report-next-milestone-spotcheck.txt): 16/16 checks OK (C1-C14), exit 0, contra los valores literales del plan y las 2 indicaciones de pausa. grep: src/core/weekly-report.js no contiene el arreglo literal 3,7,14,30,60,100 (exit 1) y sí referencia getNextMilestone (:290-291) y STREAK_MILESTONES (:377-378)."
signed_by: "qa (deepseek/deepseek-flash)"
checked_at: 2026-11-11
---

# QA Sign-off: próximo hito de racha en el reporte semanal

**Fecha**: 2026-11-11
**Branch**: `harness/20261111-113848-incluir-en-el-reporte-semanal`
**Plan**: `docs/plans/2026-11-11-reporte-semanal-proximo-hito.md`
**Review**: `docs/reviews/2026-11-11-incluir-en-el-reporte-semanal.md` (APPROVED)
**Veredicto**: **APPROVED**

---

## Alcance verificado

Commits de la rama sobre el plan:

- `b093738` — implementación: `getStreakApi()` perezoso/guarded
  (`require('./pomodoro-streak')` sólo si `module.exports` existe, fallback a
  `window.PomodoroStreak`, `null` si no hay API), `streak.nextMilestone` en
  `buildWeeklyReport` y la línea `- Próximo hito: …` en `## Racha`.
- `211a496` — ronda 2: singular `falta 1` cuando `daysLeft === 1` y omisión de
  la línea cuando el campo `nextMilestone` está **ausente**
  (`else if (nextMilestone !== undefined)`); `null` sigue anunciando el último
  hito. Tests nuevos en `test/weekly-report.test.js:617-650`.

`src/core/weekly-report.js` (estado actual):

- `buildWeeklyReport` → `streak.nextMilestone = streakApi.getNextMilestone(streak)`
  o `null` (líneas 289-292, 309-313); resto del shape intacto.
- `formatReportAsMarkdown` → dentro de `## Racha` (líneas 365-389):
  - `{ milestone, daysLeft }` numéricos → `- Próximo hito: N días (falta 1 | faltan M)`.
  - `null` → `- Próximo hito: ya alcanzaste el último (100 días)` (el `100` se
    deriva de `STREAK_MILESTONES`, no está hardcodeado en el texto).
  - `undefined` (campo ausente) → no se emite línea.
  - Sin API de racha + `null` → `- Próximo hito: ya alcanzaste el último`.

## Comandos corridos y salida real

### 1. `npm test`

Final de la salida real:

```
✔ formatReportAsMarkdown: con racha 100 avisa que alcanzó el último hito (0.0969ms)
✔ vm: window.WeeklyReport calcula nextMilestone con window.PomodoroStreak (1.6249ms)
✔ vm: sin window.PomodoroStreak degrada sin lanzar y sin paréntesis (1.2668ms)
✔ formatReportAsMarkdown: con un solo día de diferencia usa singular "falta 1" (0.2117ms)
✔ formatReportAsMarkdown: con dos o más días de diferencia sigue en plural (0.1312ms)
✔ formatReportAsMarkdown: sin el campo nextMilestone no aparece la línea de próximo hito (0.1782ms)
✔ formatReportAsMarkdown: nextMilestone null sí anuncia que alcanzó el último hito (0.168ms)
ℹ tests 951
ℹ suites 1
ℹ pass 951
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 42734.8207
```

### 2. `npm run check`

```
check exit=0
```

`node --check` sobre los 38 `.js` del script, incluido `src/core/weekly-report.js`.

### 3. `npm run smoke`

```
[smoke-test] Iniciando Electron por 10s...
[smoke-test] Timeout alcanzado (10s). Cerrando Electron...
[smoke-test] Electron salio con codigo null
[smoke-test] OK — no se detectaron errores criticos en 10s
smoke exit=0
```

Procesos Electron residuales cerrados después (`taskkill /PID 16280 15468 40760
39852 /T /F`; `tasklist | grep -i electron` → sin resultados, exit 1).

### 4. Spot-check independiente de los criterios

Script: `docs/qa/evidence/weekly-report-next-milestone-spotcheck.js`
Salida: `docs/qa/evidence/weekly-report-next-milestone-spotcheck.txt`
(compara contra los valores literales del plan, no contra lo que produce el
código).

```
OK   C1 streak 5 -> {milestone:7,daysLeft:2}
OK   C2 streak 0 y sin streak -> {3,3} == getNextMilestone(0)
OK   C3 streak 3 -> {7,4}; streak 99 -> {100,1}
OK   C4 streak 100/101/200 -> null
OK   C5 tabla 0,2,3,5,6,7,59,60,99,100,101 deepEqual getNextMilestone
OK   C6 markdown racha 5 incluye "- Próximo hito: 7 días (faltan 2)" en ## Racha
OK   C7 markdown racha 100 incluye "(100 días)" en ## Racha
OK   C8 navegador sin window.PomodoroStreak: no lanza y degrada sin parentesis
OK   C9 weekly-report.js sin arreglo literal y usa getNextMilestone/STREAK_MILESTONES
OK   C10a require("../src/core/weekly-report") funciona en Node
OK   C10b contexto navegador con window.PomodoroStreak calcula nextMilestone
OK   C11 singular: racha 99 -> "100 días (falta 1)", no "faltan 1"
OK   C11b plural: racha 5 -> "(faltan 2)", no "falta 2"
OK   C12 campo nextMilestone ausente: linea de proximo hito no aparece
OK   C13 nextMilestone null: anuncia "ya alcanzaste el último (100 días)"
OK   C14 undefined explicito tambien omite la linea (distinto de null)

RESULT: 16/16 checks OK
spotcheck exit=0
```

## Criterios de aceptación del plan

- [x] `streak: 5` → `{ milestone: 7, daysLeft: 2 }` — test `:552` + C1.
- [x] `streak: 0` / sin streak → `{ milestone: 3, daysLeft: 3 }` == `getNextMilestone(0)` — tests `:546`/`:535` + C2.
- [x] `streak: 3` → `{7,4}`; `streak: 99` → `{100,1}` — test `:552` + C3.
- [x] `streak: 100/101/200` → `null` — test `:552` + C4.
- [x] Tabla 0,2,3,5,6,7,59,60,99,100,101 deepEqual a `PomodoroStreak.getNextMilestone` — test `:535` + C5.
- [x] markdown racha 5 incluye `- Próximo hito: 7 días (faltan 2)` en `## Racha` — test `:566` + C6.
- [x] markdown racha 100 incluye `- Próximo hito: ya alcanzaste el último (100 días)` — test `:572` + C7.
- [x] Sin API de racha no lanza y degrada a `- Próximo hito: ya alcanzaste el último` — test vm `:596` + C8.
- [x] `src/core/weekly-report.js` sin arreglo literal; usa `getNextMilestone`/`STREAK_MILESTONES` — grep (exit 1 al literal) + C9.
- [x] `require('../src/core/weekly-report')` en Node y `window.WeeklyReport` con `window.PomodoroStreak` (vm) — tests `:584`/`:596` + C10a/C10b; smoke confirma el arranque de Electron.
- [x] `npm test` completo, 0 fallos — 951/951, 0 fail, 0 skipped.

## Indicaciones de las pausas (mandan sobre el plan)

- [x] Singular con un solo día: `- Próximo hito: 100 días (falta 1)`, sin `faltan 1` — test `:619` + C11; plural se mantiene con 2+ — test `:627` + C11b.
- [x] Campo `nextMilestone` **ausente**: no aparece ninguna línea de próximo hito (no se afirma que alcanzó el último) — test `:634` + C12/C14. `null` sí muestra `- Próximo hito: ya alcanzaste el último (100 días)` — test `:645` + C13.

## Integridad de los tests

- `git show b093738 --numstat -- test/weekly-report.test.js` → `99 0`.
- `git show 211a496 --numstat -- test/weekly-report.test.js` → `35 0`.
- `git diff 5802acf..HEAD -- test/weekly-report.test.js | grep '^-' | grep -v '^---'` → sin líneas (0 eliminadas; la única coincidencia era la cabecera del diff).
- Sin asserts eliminados, tolerancias ampliadas ni tests saltados. La suite pasa de 940 a 951 tests, todos en verde.

## Notas

- El plan no declara `visual: true` y el cambio es lógica pura sin superficie
  visual; no se adjuntan capturas PNG.
- Evidencia adicional de esta corrida: `docs/qa/evidence/weekly-report-next-milestone-spotcheck.js` y `.txt`.
- Sin desvíos: los dos comportamientos pedidos en las pausas están implementados y cubiertos por tests propios.
