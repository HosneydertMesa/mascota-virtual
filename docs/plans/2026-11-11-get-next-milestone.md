---
id: 2026-11-11-get-next-milestone
status: approved
size: S
acceptance:
  - "getNextMilestone está exportado desde src/core/pomodoro-streak.js en el objeto PomodoroStreak, junto a las demás funciones, y es una función pura (sin side effects, no lee ni escribe estado global distinto de STREAK_MILESTONES)"
  - "getNextMilestone(0) retorna { milestone: 3, daysLeft: 3 }"
  - "getNextMilestone(2) retorna { milestone: 3, daysLeft: 1 }"
  - "getNextMilestone(3) retorna { milestone: 7, daysLeft: 4 } (racha exactamente en un hito → el siguiente de la lista)"
  - "getNextMilestone(6) retorna { milestone: 7, daysLeft: 1 }"
  - "getNextMilestone(7) retorna { milestone: 14, daysLeft: 7 }"
  - "getNextMilestone(59) retorna { milestone: 60, daysLeft: 1 }"
  - "getNextMilestone(60) retorna { milestone: 100, daysLeft: 40 }"
  - "getNextMilestone(99) retorna { milestone: 100, daysLeft: 1 }"
  - "getNextMilestone(100) retorna null (racha alcanzó el último hito)"
  - "getNextMilestone(101) y getNextMilestone(200) retornan null (racha pasó el último hito)"
  - "racha inválida (null, undefined, '3', NaN, -5, Infinity) se trata como 0 y retorna { milestone: 3, daysLeft: 3 }"
  - "npm test pasa completo: todos los tests existentes más los nuevos de getNextMilestone, 0 fallos"
steps:
  - "En test/pomodoro-streak.test.js agregar los tests de getNextMilestone (casos 0, 2, 3, 6, 7, 59, 60, 99, 100, 101, 200 e inválidos null/undefined/'3'/NaN/-5/Infinity), importándola en el destructuring de require. Luego implementar la función pura getNextMilestone(streak) en src/core/pomodoro-streak.js (valida entrada: no numérico, NaN, Infinity o negativo → 0; redondea hacia abajo con Math.floor como isStreakMilestone; recorre STREAK_MILESTONES y devuelve el primer hito estrictamente mayor que la racha con daysLeft = milestone - streak, o null si no hay ninguno) y agregarla al objeto PomodoroStreak para exportarla. Correr node --test test/pomodoro-streak.test.js y dejar la suite en verde."
---
