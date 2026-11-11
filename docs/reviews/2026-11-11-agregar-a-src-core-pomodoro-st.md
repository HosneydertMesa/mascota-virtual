---
id: 2026-11-11-agregar-a-src-core-pomodoro-st
status: APPROVED
severity:
  critical: 0
  major: 0
---
**Verdict**: APPROVED

Revisión del diff contra `docs/plans/2026-11-11-get-next-milestone.md`.

## Resumen

La implementación cumple todos los criterios de aceptación del plan. No se
detectaron desvíos, tests debilitados ni incumplimientos de valores concretos.

## Verificación por criterio

- **Export y pureza**: `getNextMilestone` está definida en
  `src/core/pomodoro-streak.js` (línea 155) y agregada al objeto
  `PomodoroStreak` (línea 253) para su export. Es pura: solo lee la constante
  congelada `STREAK_MILESTONES`, sin side effects ni estado global mutable.
- **Casos de valor** (verificados manualmente contra el algoritmo
  `Math.floor` + primer hito `> days`):
  - `getNextMilestone(0)` → `{ milestone: 3, daysLeft: 3 }` ✅
  - `getNextMilestone(2)` → `{ milestone: 3, daysLeft: 1 }` ✅
  - `getNextMilestone(3)` → `{ milestone: 7, daysLeft: 4 }` ✅
  - `getNextMilestone(6)` → `{ milestone: 7, daysLeft: 1 }` ✅
  - `getNextMilestone(7)` → `{ milestone: 14, daysLeft: 7 }` ✅
  - `getNextMilestone(59)` → `{ milestone: 60, daysLeft: 1 }` ✅
  - `getNextMilestone(60)` → `{ milestone: 100, daysLeft: 40 }` ✅
  - `getNextMilestone(99)` → `{ milestone: 100, daysLeft: 1 }` ✅
  - `getNextMilestone(100)` → `null` ✅
  - `getNextMilestone(101)` y `getNextMilestone(200)` → `null` ✅
- **Entrada inválida** (`null`, `undefined`, `'3'`, `NaN`, `-5`, `Infinity`):
  la guarda `typeof streak === 'number' && Number.isFinite(streak) && streak > 0`
  descarta todos estos casos, dejando `days = 0` → `{ milestone: 3, daysLeft: 3 }` ✅
- **Redondeo**: `Math.floor` aplicado antes de comparar, coherente con
  `isStreakMilestone`. El test extra de redondeo (2.9 → 3 con 1 día; 3.9 → 7
  con 4 días) refuerza el comportamiento sin debilitar nada.
- **Tests**: se agregaron los casos del plan más un caso de redondeo adicional.
  Los tests no debilitan expectativas previas; usan `assert.deepEqual` /
  `assert.equal` con los valores exactos del plan. El runner `npm test`
  (`scripts/run-tests.js`) descubre todos los `test/*.test.js`, incluyendo
  `pomodoro-streak.test.js`, por lo que la nueva suite se ejecuta completa.

## Nota menor (no bloqueante)

El paso del plan menciona `daysLeft = milestone - streak`, mientras la
implementación usa `milestone - days` (con `days` ya redondeado). Para los
casos enteros del plan ambos son idénticos, y para fracciones el plan pide
explícitamente "redondear hacia abajo como isStreakMilestone", que es lo que
hace la implementación. Sin impacto en la aceptación.

## Conclusión

Sin hallazgos críticos ni mayores. Cambio aprobado.
