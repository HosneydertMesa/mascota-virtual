---
id: 2026-11-11-reporte-semanal-proximo-hito
status: approved
size: S
acceptance:
  - "buildWeeklyReport({ streak: 5 }).streak.nextMilestone es deepEqual a { milestone: 7, daysLeft: 2 }"
  - "buildWeeklyReport con streak 0 (o sin streak) devuelve streak.nextMilestone = { milestone: 3, daysLeft: 3 }, igual que getNextMilestone(0)"
  - "buildWeeklyReport con streak 3 devuelve streak.nextMilestone = { milestone: 7, daysLeft: 4 }; con 99 devuelve { milestone: 100, daysLeft: 1 }"
  - "buildWeeklyReport con streak 100, 101 y 200 devuelve streak.nextMilestone = null (no queda hito)"
  - "Para la tabla 0, 2, 3, 5, 6, 7, 59, 60, 99, 100 y 101, report.streak.nextMilestone es deepEqual a PomodoroStreak.getNextMilestone(streak): la regla no se reimplementa ni se desvía"
  - "formatReportAsMarkdown de un reporte con racha 5 incluye en la sección ## Racha la línea '- Próximo hito: 7 días (faltan 2)'"
  - "formatReportAsMarkdown de un reporte con racha 100 incluye la línea '- Próximo hito: ya alcanzaste el último (100 días)'"
  - "formatReportAsMarkdown sin próximos hitos pero sin API de racha disponible no lanza excepción (la línea degrada a '- Próximo hito: ya alcanzaste el último')"
  - "src/core/weekly-report.js no contiene un arreglo literal con 3, 7, 14, 30, 60, 100: la lista de hitos sale de PomodoroStreak.STREAK_MILESTONES"
  - "require('../src/core/weekly-report') sigue funcionando en Node sin cambios para main.js, y cargar src/core/pomodoro-streak.js + src/core/weekly-report.js en un contexto tipo navegador sin module ni require define window.WeeklyReport y calcula streak.nextMilestone usando window.PomodoroStreak (test con vm)"
  - "npm test pasa completo, con los tests existentes de weekly-report y los nuevos, 0 fallos"
steps:
  - "En test/weekly-report.test.js agregar primero los tests: (a) importar PomodoroStreak desde ../src/core/pomodoro-streak y verificar que buildWeeklyReport({ today: <fecha fija> }).streak.nextMilestone coincide en deepEqual con PomodoroStreak.getNextMilestone(streak) para 0, 2, 3, 5, 6, 7, 59, 60, 99, 100 y 101, más el caso sin streak; (b) verificar el objeto exacto { milestone, daysLeft } en 5, 99 y null en 100/101/200; (c) verificar que formatReportAsMarkdown incluye '- Próximo hito: 7 días (faltan 2)' con racha 5 y '- Próximo hito: ya alcanzaste el último (100 días)' con racha 100 dentro de la sección ## Racha; (d) un test con node:vm que lea src/core/pomodoro-streak.js y src/core/weekly-report.js como texto y los ejecute en un sandbox con window = {} y sin module/require, comprobando que window.WeeklyReport existe y que buildWeeklyReport({ streak: 5 }) devuelve nextMilestone { milestone: 7, daysLeft: 2 }; y un segundo sandbox que cargue sólo weekly-report.js (sin window.PomodoroStreak), comprobando que buildWeeklyReport({ streak: 100 }) y formatReportAsMarkdown no lanzan y la línea de racha es '- Próximo hito: ya alcanzaste el último'. Luego implementar en src/core/weekly-report.js: (1) un helper interno getStreakApi() que devuelva el módulo de racha según el entorno —si typeof module !== 'undefined' && module.exports && typeof require === 'function', require('./pomodoro-streak') (guarded, nunca require bare a nivel top-level); si no, window.PomodoroStreak si existe; si no, null—; (2) en buildWeeklyReport calcular const nextMilestone = streakApi ? streakApi.getNextMilestone(streak) : null y agregarlo dentro de streak como nextMilestone (objeto { milestone, daysLeft } o null), sin tocar el resto del shape; (3) en formatReportAsMarkdown, después de Actual/Mejor, si report.streak.nextMilestone tiene milestone y daysLeft numéricos empujar '- Próximo hito: ${milestone} días (faltan ${daysLeft})', y si no, empujar '- Próximo hito: ya alcanzaste el último (${lastMilestone} días)' tomando lastMilestone del último elemento de STREAK_MILESTONES de getStreakApi() (sin escribir la lista de hitos en weekly-report.js; si la API no está disponible, emitir la misma línea sin el paréntesis). Correr node --test test/weekly-report.test.js y dejar la suite en verde."
---

## Contexto

`src/core/weekly-report.js` arma el reporte semanal (`buildWeeklyReport`) y lo
serializa a markdown (`formatReportAsMarkdown`). Ya existe en
`src/core/pomodoro-streak.js` la función pura `getNextMilestone(streak)`, que
devuelve `{ milestone, daysLeft }` con la lista canónica
`STREAK_MILESTONES = [3, 7, 14, 30, 60, 100]`, o `null` cuando la racha ya
alcanzó/pasó el último hito.

El reporte semanal todavía no muestra el próximo hito, así que el usuario no
sabe cuánto le falta para el siguiente logro.

## Qué se hace

1. `buildWeeklyReport` agrega `streak.nextMilestone` con la forma
   `{ milestone, daysLeft } | null`, calculado con `getNextMilestone` sobre la
   racha ya normalizada (`streak >= 0`, default 0).
2. `formatReportAsMarkdown` agrega una línea más en la sección `## Racha`:
   - `- Próximo hito: N días (faltan M)` cuando hay próximo hito.
   - `- Próximo hito: ya alcanzaste el último (100 días)` cuando no queda
     ninguno.
3. Tests nuevos en `test/weekly-report.test.js` que cubren el shape, la
   equivalencia con `getNextMilestone` en los bordes (0, 3, 99, 100, 101),
   el markdown de ambos casos y la carga en un contexto tipo navegador.

## Por qué así

- **Una sola fuente de verdad**: la lista de hitos y la regla viven en
  `pomodoro-streak.js`. `weekly-report.js` sólo consume
  `STREAK_MILESTONES`/`getNextMilestone`; no copia el arreglo `[3, 7, 14, 30,
  60, 100]` ni reimplementa el cálculo. El texto del último hito también se
  deriva del último elemento de `STREAK_MILESTONES`, no de un `100` hardcodeado.
- **Node y navegador**: `weekly-report.js` hoy se carga con `require` en
  `main.js` y como `<script>` clásico que expone `window.WeeklyReport`. Por eso
  la resolución del módulo de racha es perezosa y guardada: `require` sólo se
  ejecuta dentro de una función y sólo si `module.exports` existe; en el
  navegador se usa `window.PomodoroStreak` (que `pomodoro-streak.js` ya publica).
  Así no se agrega un `require` de nivel superior que rompería el `<script>`.
- **Degradación segura**: si ninguna API estuviera disponible,
  `nextMilestone` queda `null` y el markdown no lanza; el reporte sigue
  generándose.

## Riesgos / casos borde

- `streak` inválido ya se normaliza a 0 en `buildWeeklyReport`, por lo que
  `nextMilestone` debe ser `{ milestone: 3, daysLeft: 3 }`, consistente con
  `getNextMilestone(0)`.
- `streak` exactamente en un hito (3, 7, …) apunta al siguiente hito, regla que
  ya implementa `getNextMilestone`; no hay lógica nueva que duplique ese borde.
- Reportes armados a mano sin `nextMilestone` deben seguir formateando: la
  rama "sin hito" cubre `null`/`undefined` sin `TypeError`.
