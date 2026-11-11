---
id: 2026-11-11-agregar-a-src-core-pomodoro-st
branch: harness/20261111-110655-agregar-a-src-core-pomodoro-st
plan: docs/plans/2026-11-11-get-next-milestone.md
status: APPROVED
evidence:
  tests: "npm test (node scripts/run-tests.js): 940 tests, 940 pass, 0 fail, 0 skipped. node --test test/pomodoro-streak.test.js: 54 tests, 54 pass, 0 fail (13 tests de getNextMilestone). Sin tests debilitados: el diff contra el commit del plan (32ff37b) es puramente aditivo en test/pomodoro-streak.test.js (no se cambio ningun assert preexistente)."
  smoke: "npm run smoke: Electron arranca 10s sin errores criticos (exit 0, 'OK — no se detectaron errores criticos en 10s')."
  manual: "node --check via npm run check: exit 0 sobre los 37 archivos .js (incluye src/core/pomodoro-streak.js). Spot-check independiente con node -e (docs/qa/evidence/getnextmilestone-spotcheck.txt): los 19 inputs del plan devuelven exactamente lo esperado, la funcion esta exportada en el objeto PomodoroStreak, STREAK_MILESTONES sigue frozen e intacto, resultado determinista y objeto nuevo por llamada (sin estado compartido)."
signed_by: "qa (deepseek/deepseek-flash)"
checked_at: 2026-11-11
---

# QA Sign-off: getNextMilestone en src/core/pomodoro-streak.js

**Fecha**: 2026-11-11
**Branch**: `harness/20261111-110655-agregar-a-src-core-pomodoro-st`
**Plan**: `docs/plans/2026-11-11-get-next-milestone.md`
**Veredicto**: **APPROVED**

---

## Alcance verificado

Commit `4ed4357` agrega una funcion pura `getNextMilestone(streak)` a
`src/core/pomodoro-streak.js` y la exporta en el objeto `PomodoroStreak`,
junto con 13 tests nuevos en `test/pomodoro-streak.test.js`.

Archivos tocados (contra `32ff37b`, commit del plan):

- `src/core/pomodoro-streak.js` (+28/-1): nueva funcion y entrada en el
  objeto exportado.
- `test/pomodoro-streak.test.js` (+62/-1): solo se agrega `getNextMilestone`
  al destructuring y el bloque `--- getNextMilestone ---`.

## Comandos corridos y salida real

### 1. `npm test`

```
ℹ tests 940
ℹ suites 1
ℹ pass 940
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 55928.4892
```

### 2. `node --test test/pomodoro-streak.test.js`

```
✔ getNextMilestone: 0 → { milestone: 3, daysLeft: 3 }
✔ getNextMilestone: 2 → { milestone: 3, daysLeft: 1 }
✔ getNextMilestone: 3 (hito exacto) → siguiente hito { milestone: 7, daysLeft: 4 }
✔ getNextMilestone: 6 → { milestone: 7, daysLeft: 1 }
✔ getNextMilestone: 7 (hito exacto) → { milestone: 14, daysLeft: 7 }
✔ getNextMilestone: 59 → { milestone: 60, daysLeft: 1 }
✔ getNextMilestone: 60 (hito exacto) → { milestone: 100, daysLeft: 40 }
✔ getNextMilestone: 99 → { milestone: 100, daysLeft: 1 }
✔ getNextMilestone: 100 (ultimo hito) → null
✔ getNextMilestone: 101 → null
✔ getNextMilestone: 200 → null
✔ getNextMilestone: input invalido (null, undefined, "3", NaN, -5, Infinity) se trata como 0
✔ getNextMilestone: redondea hacia abajo como isStreakMilestone
ℹ tests 54
ℹ pass 54
ℹ fail 0
```

### 3. `npm run check`

Exit 0, sin errores de sintaxis (incluye `node --check src/core/pomodoro-streak.js`).

### 4. `npm run smoke`

```
[smoke-test] Iniciando Electron por 10s...
[smoke-test] Timeout alcanzado (10s). Cerrando Electron...
[smoke-test] Electron salio con codigo null
[smoke-test] OK — no se detectaron errores criticos en 10s
```

Exit 0. La app arranca sin errores criticos. (El cambio es logica pura en un
modulo core que todavia no esta cableado a la UI, asi que el smoke solo prueba
que no rompio el arranque.)

## Spot-check independiente de los criterios (fuera de los tests del repo)

Script `node -e` one-shot, salida guardada en
`docs/qa/evidence/getnextmilestone-spotcheck.txt` (evidencia de la corrida,
no entra al repo). Comparado contra los valores del plan:

| input | resultado | criterio del plan |
|---|---|---|
| 0 | `{milestone:3, daysLeft:3}` | ✅ |
| 2 | `{milestone:3, daysLeft:1}` | ✅ |
| 3 | `{milestone:7, daysLeft:4}` | ✅ |
| 6 | `{milestone:7, daysLeft:1}` | ✅ |
| 7 | `{milestone:14, daysLeft:7}` | ✅ |
| 59 | `{milestone:60, daysLeft:1}` | ✅ |
| 60 | `{milestone:100, daysLeft:40}` | ✅ |
| 99 | `{milestone:100, daysLeft:1}` | ✅ |
| 100 | `null` | ✅ |
| 101 / 200 | `null` | ✅ |
| null, undefined, `'3'`, NaN, -5, Infinity | `{milestone:3, daysLeft:3}` | ✅ |
| 2.9 / 3.9 (extra) | `{3,1}` / `{7,4}` (floor) | ✅ consistente con isStreakMilestone |

Pureza / export:

```
typeof exported: function
exported keys: STREAK_MILESTONES,getLocalDateKey,computeStreak,computeLongestStreak,isStreakMilestone,getStreakMilestoneMessage,getNextMilestone
STREAK_MILESTONES frozen: true
deterministic(6): true {"milestone":7,"daysLeft":1}
STREAK_MILESTONES unchanged: true
returns new object each call: true deepEqual=true
no global leak: true
```

- `getNextMilestone` esta en el objeto `PomodoroStreak` junto a las demas
  funciones (criterio 1).
- Solo lee `STREAK_MILESTONES` (frozen, sin mutar) y `Math.floor`; no escribe
  estado global (`globalThis.getNextMilestone` queda undefined), no hace I/O,
  devuelve un objeto nuevo por llamada. Es pura.
- No hay `throw` ni dependencia de `Date`/Electron.

## Integridad de los tests

`git diff 32ff37b 4ed4357 -- test/pomodoro-streak.test.js` muestra **solo
lineas agregadas** (`getNextMilestone` en el destructuring del `require` y el
bloque de 13 tests nuevos). No se modifico, relajo ni salteo ningun assert
preexistente, y la suite completa pasa (940/940) sin regresiones.

## Criterios de aceptacion

- [x] `getNextMilestone` exportado en `PomodoroStreak`, funcion pura.
- [x] `getNextMilestone(0)` → `{3,3}`
- [x] `getNextMilestone(2)` → `{3,1}`
- [x] `getNextMilestone(3)` → `{7,4}`
- [x] `getNextMilestone(6)` → `{7,1}`
- [x] `getNextMilestone(7)` → `{14,7}`
- [x] `getNextMilestone(59)` → `{60,1}`
- [x] `getNextMilestone(60)` → `{100,40}`
- [x] `getNextMilestone(99)` → `{100,1}`
- [x] `getNextMilestone(100)` → `null`
- [x] `getNextMilestone(101)` y `(200)` → `null`
- [x] Invalidos (`null`, `undefined`, `'3'`, `NaN`, `-5`, `Infinity`) → `{3,3}`
- [x] `npm test` completo: 940/940, 0 fallos.

Sin desvios. Ningun test debilitado. Aprobado.
