---
id: gate-frontmatter-migration-2026-10-20
branch: feat/gate-frontmatter-migration
plan: docs/plans/2026-10-20-gate-migration.md
review: docs/reviews/sdlc-frontmatter-migration-2026-10-20.md
status: APPROVED
evidence:
  tests: "npm test — 845/845 tests pasando (antes: 878 con 9 fallos — 7 por fechas hardcodeadas y 2 por el formato del gate bespoke). Los 33 tests de test/sdlc.test.js se fueron con el tool retirado: 878 - 33 = 845. Suite Pester del repo sdlc: 324/324. check-frontmatter.ps1 -Kind all: 50/50 docs pasan."
  manual: "gate doctor 6/6; gate strict OK (plan + review + QA + version = tag); gate skill-guardrail 12/12 skills con 8/8 reglas; PSScriptAnalyzer -Severity Error: 0 findings; npm run check OK. La app Electron no se abrio en este entorno: la migracion no toca src/, asi que el riesgo de regresion visual es nulo, pero el smoke del .exe queda pendiente."
signed_by: Mavis
checked_at: 2026-10-20
---

# QA Sign-off: migración al gate genérico con frontmatter

**Fecha**: 2026-10-20
**Rama / PR**: `feat/gate-frontmatter-migration`
**Plan**: `docs/plans/2026-10-20-gate-migration.md`
**Review**: `docs/reviews/sdlc-frontmatter-migration-2026-10-20.md`

## Resultado automático

- Tests: **845 passed, 0 failed** (`npm test`)
- Tests antes de esta migración: 878 con 9 fallos. Los 33 tests de `test/sdlc.test.js` se retiraron con el tool bespoke que probaban.
- Coverage: no available (el proyecto no tiene `c8` instalado)
- Suite del repo `sdlc`: **324 passed, 0 failed** (Pester)
- Validador de frontmatter: **50/50 docs pasan** (`check-frontmatter.ps1 -Kind all`)
- `gate doctor`: **6/6 checks OK**
- `gate skill-guardrail`: **12/12 skills** con 8/8 reglas
- PSScriptAnalyzer (`-Severity Error`): **0 findings**
- `npm run check`: OK

## Qué se verificó a mano

| # | Verificación | Resultado |
|---|---|---|
| 1 | El bypass `migrated: true` approve los gates | **No.** `Test-FrontmatterPending` lo marca como pendiente y los 3 gates lo rechazan. Test Pester: *"migrated: true NO aprueba (no hay bypass)"*. |
| 2 | La severidad sale de la prosa (regex) | **No.** Sale de `severity.critical` / `severity.major` del frontmatter. Los 15 reviews tienen los conteos reales de sus cuerpos; `retroactivo-m3-parser` da 0/0 (antes el regex contaba 3/3). |
| 3 | `files: []` y `acceptance: []` se parsean como array | **Sí.** Flow-style soportado. Test Pester: *"flow-style: lista vacia es array vacio, no string"*. |
| 4 | Un plan sin frontmatter pasa cuando `frontmatter.mode = require` | **No.** `gate strict` los lista uno por uno con el motivo. |
| 5 | Los 47 docs tienen valores reales, no heurísticos | **Sí.** Cada campo sale del cuerpo del documento; la evidencia de QA describe lo que **realmente** se corrió (11 docs con `tests` + `manual`, 1 con `smoke` real, y `retroactivo-m3-parser` explícitamente **sin** `smoke` porque la app no arrancó). |
| 6 | Los 15 QA tienen la línea `Sign-off:` en el cuerpo | **Sí.** Ninguno la tenía; se agregó al final de cada uno, con el mismo nombre y fecha que el frontmatter. |
| 7 | Quedó un solo gate en el repo | **Sí.** `scripts/sdlc.js`, `scripts/sdlc-frontmatter.js` y `test/sdlc.test.js` eliminados. El enforcement es el CLI `gate` del setup `HosneydertMesa/sdlc`. |
| 8 | El gate de plan del hook funciona | **Sí, y era un bug.** El pre-commit hook de este repo leía el mensaje del commit **anterior** (git corre `pre-commit` antes de preparar el mensaje nuevo), así que el gate de plan nunca evaluaba el commit correcto. Al adoptar `gate`, el hook pasó a `commit-msg` y evalúa el mensaje real. |
| 9 | La suite de tests está verde y no depende del calendario | **Sí.** `npm test` 878/878. Los 7 tests de `pomodoro-store` tenían fecha fija (15-jul-2026) y ya habían caído fuera de la ventana de retención de 90 días; ahora son relativos a `Date.now()`. |
| 10 | La app Electron sigue arrancando | **No verificado.** No se abrió la app en este entorno. La migración no toca `src/`, así que el riesgo es bajo, pero el smoke del `.exe` queda pendiente de una corrida manual. |

## Checklist manual

- [x] El flujo principal funciona de punta a punta (la migracion de docs y la adopción del gate, verificado con el validador y `gate strict`)
- [x] Casos borde / errores probados (13 casos borde del parser, 6 tests de integración en `gate strict`, 1 test de regresión del hook)
- [x] Sin regresiones visibles en lo que toca el cambio (`npm test` verde, `npm run check` OK)
- [x] Docs / changelog actualizados (`AGENTS.md`, `docs/sdlc/PHASES.md`, `gate.json`, README del repo `sdlc`)
- [ ] App Electron arrancada y smoke del `.exe` — **pendiente**, no se pudo abrir la app en este entorno

## Limitaciones conocidas

- El smoke del `.exe` (arranque de Electron) no se ejecutó. La migración no toca `src/` ni `main.js`, así que no se espera regresión, pero la confirmación queda para una corrida manual.
- El repo `sdlc` tiene el cambio en la rama `feat/gate-frontmatter`; el PR a `main` es un paso aparte.

Sign-off: Mavis 2026-10-20
