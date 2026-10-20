---
id: gate-frontmatter-migration
status: approved
created: 2026-10-20
size: M
files:
  - test/pomodoro-store.test.js
  - scripts/sdlc.js
  - scripts/sdlc-frontmatter.js
  - test/sdlc.test.js
  - scripts/sdlc-worktree.js
  - scripts/worktree.js
  - package.json
  - AGENTS.md
  - gate.json
  - docs/plans/batch-0-infra-foundation-2026-07-21.md
  - docs/plans/batch-1-m2-m4-dashboard-finalize-2026-07-21.md
  - docs/plans/batch-2-track-a-p3-memories-2026-07-21.md
  - docs/plans/batch-2-track-b-a3-a4-context-2026-07-21.md
  - docs/plans/batch-3-productividad-2026-07-22.md
  - docs/plans/batch-4-distribucion-2026-07-22.md
  - docs/plans/chat-bugs-leak-and-close-2026-08-25.md
  - docs/plans/hotfix-v2.0.2-strict-mode-conflict-2026-07-22.md
  - docs/plans/m3-parser-strict-mode.md
  - docs/plans/mascota-companion-roadmap-2026-07-21.md
  - docs/plans/mascota-con-vida.md
  - docs/plans/pet-animation-capa1.md
  - docs/plans/skip-gates-for-trivial-commits.md
  - docs/plans/strict-mode-by-date.md
  - docs/plans/v2.2.0-app-aware-mascota.md
  - docs/plans/v2.3.0-pixijs-rendering.md
  - docs/plans/walk-leg-swing-fix-2026-08-25.md
  - docs/plans/walk-v2-natural-enhancement-2026-08-25.md
  - docs/reviews/batch-0-infra-foundation-2026-07-21.md
  - docs/reviews/batch-1-m2-m4-dashboard-finalize-2026-07-21.md
  - docs/reviews/batch-2-track-a-p3-memories-2026-07-21.md
  - docs/reviews/batch-2-track-b-a3-a4-context-2026-07-21.md
  - docs/reviews/batch-3-productividad-2026-07-22.md
  - docs/reviews/batch-4-distribucion-2026-07-22.md
  - docs/reviews/chat-bugs-leak-and-close-2026-08-25.md
  - docs/reviews/close-minor4-2026-07-21.md
  - docs/reviews/hotfix-v2.0.2-scope-conflict-2026-07-22.md
  - docs/reviews/pet-animation-capa1-2026-07-21.md
  - docs/reviews/post-v2.0.1-sdlc-hardening-2026-07-22.md
  - docs/reviews/retroactivo-m3-parser-2026-07-21.md
  - docs/reviews/sdlc-frontmatter-migration-2026-10-20.md
  - docs/reviews/skip-trivial-gates-2026-07-21.md
  - docs/reviews/walk-leg-swing-2026-08-25.md
  - docs/reviews/walk-v2-natural-enhancement-2026-08-25.md
  - docs/qa/batch-0-infra-foundation-2026-07-21.md
  - docs/qa/batch-1-m2-m4-dashboard-finalize-2026-07-21.md
  - docs/qa/batch-2-track-a-p3-memories-2026-07-21.md
  - docs/qa/batch-2-track-b-a3-a4-context-2026-07-21.md
  - docs/qa/batch-3-productividad-2026-07-22.md
  - docs/qa/batch-4-distribucion-2026-07-22.md
  - docs/qa/chat-bugs-leak-and-close-2026-08-25.md
  - docs/qa/close-minor4-2026-07-21.md
  - docs/qa/pet-animation-capa1-2026-07-21.md
  - docs/qa/retroactivo-m3-parser-2026-07-21.md
  - docs/qa/skip-trivial-gates-2026-07-21.md
  - docs/qa/v2.0.1-hotfix-2026-07-22.md
  - docs/qa/v2.0.2-hotfix-2026-07-22.md
  - docs/qa/walk-leg-swing-2026-08-25.md
  - docs/qa/walk-v2-natural-enhancement-2026-08-25.md
acceptance:
  - "npm test termina con 0 fallos (hoy hay 9: 2 por el WIP de frontmatter y 7 por fechas hardcodeadas)"
  - "gate strict pasa: plan, review APPROVED, QA sign-off, version = tag"
  - "Los 47 docs de docs/plans, docs/reviews y docs/qa pasan los validadores de frontmatter (sin migrated: true)"
  - "Los 15 reviews declaran severity.critical = 0 y severity.major = 0 con los conteos reales de MINOR/INFO"
  - "Los 15 QA declaran evidencia real (tests|smoke|manual) + signed_by + checked_at, y la linea Sign-off: en el cuerpo"
  - "scripts/sdlc.js, scripts/sdlc-frontmatter.js y test/sdlc.test.js no existen: el gate es el generico"
  - "AGENTS.md habla de /gate-* y de `gate`, no de /sdlc-* ni de npm run sdlc:*"
risks:
  - "backward-compat: 16 de 17 planes estan en status:draft por la migracion heuristica; hay que decidir uno por uno si se ejecutaron"
  - "El perfil strict de gate.json exige Sign-off humano en cada QA: 15 docs de QA hoy no tienen esa linea"
  - "Retirar scripts/sdlc.js rompe el npm run sdlc:* que el AGENTS.md documentaba: hay que actualizar AGENTS.md en el mismo commit"
---

# Plan: migrar al gate genérico con frontmatter

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que `mascotaVirtual` use el gate genérico (`sdlc-setup`) con validación por frontmatter, con los 47 documentos migrados a valores reales y su gate bespoke retirado.

**Architecture:** el `gate` genérico pasa a ser el único enforcement del proyecto (`gate.json` con perfil `strict` + `frontmatter.mode: require`). El `scripts/sdlc.js` bespoke, que valida por regex y tiene un bypass (`migrated: true`) que aprueba los 47 docs sin mirar su contenido, se borra. Los 47 documentos se limpian para que el gate los valide de verdad.

**Tech Stack:** Node 20 (`node --test`), PowerShell 7 (`pwsh`) para el CLI de `gate`, Markdown.

**Plan maestro (repo `sdlc`):** `C:\Users\HOSNE\.minimax\workspace\sdlc-setup\docs\plans\2026-10-20-gate-frontmatter.md` — Tasks 1-4 (el gate) y Tasks 5-8 (este repo). Este documento es el plan espejo que exige el hook `commit-msg`.

**Review que lo origina:** `docs/reviews/sdlc-frontmatter-migration-2026-10-20.md` — 1 CRITICAL, 5 MAJOR, 3 MINOR, 3 INFO. Los 6 hallazgos de severidad bloqueante están todos resueltos por este plan.

## Global Constraints

- `npm test` tiene que estar verde antes de cada commit (el pre-commit hook lo corre).
- Los valores del frontmatter salen del **cuerpo** de cada documento. No se inventa evidencia ni conteos.
- Ningún documento queda con `migrated: true` ni `pending: true`: eso bloquea el gate.
- PowerShell 7 (`pwsh`) para el CLI de `gate`. Nunca `powershell`.
- Todo cambio de código va con su test. Todo cambio de doc no necesita test, pero sí la verificación del validador.

## Tareas

| # | Tarea | Repo | Commit |
|---|---|---|---|
| 1 | Arreglar los 7 tests de `pomodoro-store` con fecha relativa a `Date.now()` | `mascotaVirtual` | `fix(test): fechas relativas al reloj en los tests de pomodoro-store` |
| 2 | `gate init` + `gate.json` perfil `strict` + borrar `scripts/sdlc.js`, `scripts/sdlc-frontmatter.js`, `test/sdlc.test.js` + `AGENTS.md` al día | `mascotaVirtual` | `refactor(sdlc): migrar al gate genérico y retirar el gate bespoke` |
| 3 | Limpiar los 47 docs (status/severity/evidence reales, `Sign-off:` en los QA) | `mascotaVirtual` | `docs(gate): frontmatter con valores reales en plan, review y QA` |
| 4 | Review + QA sign-off de esta migración + release v2.1.0 | `mascotaVirtual` | `chore(release): v2.1.0 — gate genérico con frontmatter` |
| 5 | Limpiar los restos del gate bespoke que quedaron traccionados (CI, `CLAUDE.md`, skills `.mavis/skills/sdlc-*`) | `mascotaVirtual` | `fix(sdlc): quitar los restos del gate bespoke que rompian el CI y las instrucciones` |

Los detalles de cada tarea (pasos exactos, código, comandos) están en el plan maestro, Tasks 5-8. Esta tabla es el índice y la fuente de verdad para los criterios de aceptación.

## Tarea 5 — restos del gate bespoke (post-release)

Al publicar la migración, `gate init` había generado `CLAUDE.md` **antes** de que este plan actualizara `AGENTS.md`: quedó como una copia del `AGENTS.md` viejo, con instrucciones a comandos que ya no existen (`npm run sdlc:dev`, `npm run sdlc:plan`, `node scripts/sdlc.js`, skills `/sdlc-*`).

Los restos que quedan y secorrigen acá:

| Resto | Problema | Corrección |
|---|---|---|
| `.github/workflows/ci.yml` | el paso "SDLC dev gate" corría `npm run sdlc:dev`, script que ya no existe → **el CI quedó rojo en cada push** | se elimina el paso: "Syntax check" (`npm run check`) y "Run tests" (`npm test`) ya cubren lo que hacía |
| `CLAUDE.md` | copia obsoleta de `AGENTS.md` con el flujo del gate retirado | se regenera como copia del `AGENTS.md` actual, igual que hace `gate init` |
| `.mavis/skills/sdlc-{doc,plan,review,team}/` | skills del bootstrap original (`b14cc66`) que enseñan el flujo bespoke | se borran: el proyecto usa `.agents/skills/gate-*` |

Verificación: `npm test` verde, `npm run check` OK, `gate strict` OK, y el CI de GitHub en verde.


## Verificación de la tarea 3

```powershell
pwsh -NoProfile -Command ". 'C:\Users\HOSNE\.minimax\workspace\sdlc-setup\lib\frontmatter.ps1'; Get-ChildItem 'docs/plans/*.md' | ForEach-Object { $r = Read-FrontmatterFile $_.FullName; $v = Test-FrontmatterPlan $r.Data; if (-not $v.Ok) { Write-Host \"PLAN $($_.Name): $($v.Reasons -join '; ')\" } }"
```

Idéntico para `docs/reviews/` con `Test-FrontmatterReview` y `docs/qa/` con `Test-FrontmatterQa`.
Cero líneas de salida = los 47 docs pasan.

## Orden

1. Tarea 1 (arreglar la suite) — es lo único que bloquea cualquier commit con el hook activo.
2. Tarea 2 (instalar el gate) — después de esto, el hook `commit-msg` exige este plan en la rama.
3. Tarea 3 (limpiar los docs) — es la parte editorial.
4. Tarea 4 (gates + release).
