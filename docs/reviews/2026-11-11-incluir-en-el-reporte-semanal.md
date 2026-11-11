---
id: 2026-11-11-incluir-en-el-reporte-semanal
status: APPROVED
severity:
  critical: 0
  major: 0
---
**Verdict**: APPROVED

## Revisión: incluir el próximo hito en el reporte semanal

Plan revisado: `docs/plans/2026-11-11-reporte-semanal-proximo-hito.md`. Diff
contra la base en `src/core/weekly-report.js` y `test/weekly-report.test.js`.

### Cumplimiento del plan

La implementación sigue el plan al pie de la letra:

- **`getStreakApi()`** resuelve el módulo de racha de forma perezosa y
  guardada: `require('./pomodoro-streak')` sólo dentro de la función y sólo si
  `module.exports` y `require` existen (sin `require` a nivel top-level que
  rompería el `<script>` del renderer); en navegador usa `window.PomodoroStreak`;
  si ninguna está disponible retorna `null`. Coincide con el paso (1) del plan.
- **`buildWeeklyReport`** agrega `streak.nextMilestone` como
  `{ milestone, daysLeft } | null`, calculado vía `streakApi.getNextMilestone(streak)`
  sobre la racha ya normalizada (`streak >= 0`, default 0). El resto del shape
  queda intacto (`period`, `pomodoro`, `captures`, `streak.current/longest`, `score`).
- **`formatReportAsMarkdown`** agrega la línea de próximo hito en `## Racha`,
  con la rama "sin hito" derivando el último hito del último elemento de
  `STREAK_MILESTONES` (no hardcodea `100`), y degradando sin el paréntesis
  cuando no hay API de racha. Sin `TypeError` ante `nextMilestone` nulo/ausente.
- **Sin reimplementación de la regla ni copia del arreglo**: `grep` de
  `3,\s*7,\s*14,\s*30,\s*60,\s*100` en `src/core/weekly-report.js` no arroja
  coincidencias. La lista y la regla viven sólo en `pomodoro-streak.js`.

### Criterios de aceptación (verificación estática)

- `{ streak: 5 }` → `{ milestone: 7, daysLeft: 2 }` ✓ (getNextMilestone(5) = {7,2}).
- streak 0/sin streak → `{ milestone: 3, daysLeft: 3 }` = getNextMilestone(0) ✓.
- streak 3 → `{7,4}`; 99 → `{100,1}` ✓ (getNextMilestone cubre ambos).
- 100/101/200 → `null` ✓.
- Tabla 0,2,3,5,6,7,59,60,99,100,101 deepEqual a `PomodoroStreak.getNextMilestone` ✓.
- Markdown racha 5 → `- Próximo hito: 7 días (faltan 2)` ✓.
- Markdown racha 100 → `- Próximo hito: ya alcanzaste el último (100 días)` ✓.
- Sin API de racha no lanza y degrada a `- Próximo hito: ya alcanzaste el último` ✓.
- `require` en Node sin cambios para `main.js` ✓ (export UMD-lite intacto al
  final del archivo); contexto navegador con `vm` expone `window.WeeklyReport`
  y usa `window.PomodoroStreak` ✓.

### Tests

Los tests nuevos son fieles al plan: equivalencia deepEqual con
`getNextMilestone` en los bordes, shape exacto, null en 100/101/200, markdown
de ambos casos (acotado a la sección `## Racha` vía helper `rachaSection`), y
dos tests `node:vm` que verifican la carga tipo navegador con y sin
`window.PomodoroStreak`. No se observa ningún test debilitado, valor esperado
ajustado al código, assert eliminado ni skip; todo refuerza los criterios del
plan.

### Conclusión

Sin hallazgos que bloqueen. La implementación cumple el plan y los criterios de
aceptación; la fuente de verdad de hitos permanece única y la degradación en
navegador/sin API es segura.

> Nota: no ejecuté `npm test` en esta sesión (sin herramienta de ejecución
> disponible); la verificación fue estática. El gate de tests corre a
> continuación.
