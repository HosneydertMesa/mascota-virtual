# AGENTS.md — Project Memory

> **Edita este archivo para que Mavis (y Grok Build) entiendan tu proyecto.**
> Las convenciones aquí se aplican en cada sesión, sub-agente y skill.

---

> ## ⚠️ MANDATORY: SDLC gates para TODO cambio no trivial
>
> **REGLA NO NEGOCIABLE**: Cualquier cambio que no sea cosmético (typo, dep update)
> **DEBE** pasar por los 6 gates del SDLC en orden. Ver `docs/sdlc/PHASES.md`.
>
> **No es opcional. No es "para features grandes". Es para TODO.**
>
> **Cómo se enforce**:
> - El hook `commit-msg` rechaza `feat:` / `fix:` / `refactor:` sin plan de la rama en `docs/plans/`
> - `gate strict` falla si cerrás una feature sin plan + review + QA + release
> - `gate config show` muestra qué exige este repo (perfil de `gate.json`)
>
> **Por qué**: Los quick fixes que se saltean el pipeline introducen bugs regresivos
> (ejemplo real: yo mismo en esta sesión cambié de modelo AI y de formato de output
> sin un plan, y rompí el parser 2 veces — algo que el review habría pillado).
>
> **Tu trabajo como dev**:
> 1. Antes de tocar código, corré `/gate-plan "<feature>"` y seguí el flujo
> 2. Si vas a hacer "solo un cambio chico" sin plan, preguntate: ¿romperá algo?
>    Si la respuesta es "tal vez", necesita plan igual.
> 3. Después de implementar, **siempre** corré `npm test` y `npm run check` antes de commitear
> 4. Antes de mergear/cerrar, **siempre** corré `/gate-review` y `gate strict`
> 5. Si te da fiaca documentar, ese es el sintoma de que el cambio es más grande de lo que pensás

---

## Project Overview

| Field | Value |
|-------|-------|
| **Name** | `mascotaVirtual` |
| **Type** | `desktop app` (Electron) |
| **Primary stack** | `JavaScript (Node + Electron)` |
| **Repo** | `<url o path local>` |
| **Owner** | `HOSNE` |
| **License** | `MIT` |

---

## Build & Test Commands

> ⚠️ **Edita los placeholders.** Mavis los usa para correr hooks, cron, y verificar builds.

<!-- SDLC_COMMANDS_START -->
```bash
# Comandos reales de este proyecto (Electron + Node, JS puro).
# `gate` lee la línea `test:` para correr la suite en su fase 2.
setup:     npm install
test:      npm test               # node --test test/*.test.js
syntax:    npm run check          # node --check sobre los .js
smoke:     npm run smoke          # scripts/smoke-test.js
run:       npm start              # electron .
worktree:  npm run worktree       # scripts/worktree.js — un worktree por worker
clean:     Remove-Item -Recurse -Force node_modules\.cache, .parcel-cache, dist
```
<!-- SDLC_COMMANDS_END -->

> ⚠️ No hay `lint` / `format` / `typecheck` configurados aún (proyecto JS puro, sin TS, sin prettier/eslint). Si los agregas, rellena los comandos arriba.
>
> **Gates**: el enforcement lo hace el CLI `gate` (setup `HosneydertMesa/sdlc`).
> `gate config show` muestra qué exige este repo · `gate strict` es la verificación completa.
> Los hooks viven en `.git/hooks/` y apuntan al setup de gate.
>
> **Ejemplo (Node/TS — para referencia, NO aplica aún):**
```bash
format:   npx prettier --write .
lint:     npx eslint .
typecheck:npx tsc --noEmit
build:    npm run build
```

---

## Code Conventions

### Style
- **Indentation**: `<2 spaces \| 4 spaces \| tabs>`
- **Quotes**: `<single \| double>`
- **Semicolons**: `<yes \| no>`
- **Line length**: `<80 \| 100 \| 120>`
- **Naming**: `<camelCase variables, PascalCase classes, snake_case files>`

### Architecture
- **Pattern**: `<MVC \| Clean \| Hexagonal \| Microservices \| Monolith \| Serverless>`
- **Folder structure**:
  ```
  src/
  ├── ...
  ```
- **Public API rules**: `<what is exported, what stays private>`

### Error handling
- `<throw vs return Result>` 
- `<custom exception hierarchy>`
- `<logging standard — what to log, what NOT to log>`

### Testing
- **Coverage target**: `<80% \| 90%>`
- **Test framework**: `<jest \| pytest \| xunit \| ...>`
- **Test naming**: `test_<unit>_<scenario>_<expected>`
- **Mocking policy**: `<mock external services, never mock the unit under test>`

### Git
- **Branch naming**: `<feat/ \| fix/ \| chore/ \| hotfix/ \| + ticket id>`
- **Commit format**: `<Conventional Commits | custom>`
- **PR template**: `<.github/PULL_REQUEST_TEMPLATE.md path>`
- **Required reviewers**: `<N>`

---

## SDLC Workflow (este repo)

> Flujo por defecto para features no triviales. Adáptalo a tu realidad.
>
> **Orquestador**: `gate` (el CLI del setup `HosneydertMesa/sdlc`).
> Config efectiva: `gate config show` · Verificación: `gate strict`.
> Detalle de cada gate: `docs/sdlc/PHASES.md`.
>
> ```
> 1. PLAN     →  /gate-plan "<feature>"  (output: docs/plans/<feature>.md con frontmatter)
> 2. DESIGN   →  /gate-spec "<feature>"  (spec + plan; opcional si el diseño ya está claro)
> 3. IMPLEMENT → /gate-team implement "<feature>"  (Leader → Implementer → Verifier)
> 4. DEV GATE →  npm test + npm run check  (el pre-commit hook corre los checks)
> 5. REVIEW   →  /gate-review  (output: docs/reviews/<rama>-<fecha>.md con frontmatter)
> 6. QA       →  /gate-qa + firma humana  (output: docs/qa/<feature>-<fecha>.md con frontmatter)
> 7. RELEASE  →  gate strict  →  gate deploy <major|minor|patch>
> 8. DOCS     →  /gate-doc finalize "<feature>"  (DOCX con changelog en docs/deliverables/)
> 9. DEPLOY   →  manual o via CI, segun tu pipeline
> ```
>
> **Gates atajo** (no todos los features pasan los 9):
> - Bugfix trivial → solo paso 4 (DEV)
> - Feature mediana → 1, 3, 4, 5, 6, 7, 8
> - Refactor sin lógica → 3, 4, 5
> - Hotfix → 4, 5 (exprés), 7 (doc al día siguiente)
>
> Ver `docs/sdlc/PHASES.md` para criterios de salida de cada gate.

### Frontmatter en los docs de gate

Los docs de plan, review y QA arrancan con un bloque `---` de metadata YAML.
`gate strict` los valida **por campos tipados**, no por regex sobre la prosa:
la severidad sale de `severity.critical` / `severity.major`, y la evidencia de
QA sale de `evidence.{tests,smoke,manual}`.

- **Plan** (`docs/plans/`): `id`, `status: approved`, `size`, `acceptance` (≥1 criterio).
- **Review** (`docs/reviews/`): `status: APPROVED`, `severity.critical: 0`, `severity.major: 0`.
- **QA** (`docs/qa/`): `status: APPROVED`, `evidence` con al menos un campo, `signed_by`, `checked_at`.

**Sin bypass**: un doc con `migrated: true` o `pending: true` no aprueba ningún
gate. La evidencia describe lo que **realmente** se corrió: si la app no se pudo
arrancar, no pongas `smoke`.

Verificá los docs del repo:

```powershell
pwsh -NoProfile -File "<setup de gate>\scripts\check-frontmatter.ps1" -Path . -Kind all
```

---

## Hard Rules (nunca romper)

- ❌ No commitear secrets, API keys, ni credenciales
- ❌ No hacer force-push a `main` / `master`
- ❌ No saltarse tests sin razón documentada
- ❌ No mergear sin code review aprobado
- ✅ Toda feature nueva pasa por PLAN → IMPLEMENT → REVIEW → TEST → DOCS
- ✅ Toda decision arquitectónica queda escrita en `docs/adr/`
- ✅ Cambios breaking van con major version bump

---

## Context Mavis debe recordar

> Mavis tiene 3 capas de memoria. Esta sección la usa para que no tenga que re-aprender el proyecto cada sesión.

- **Lenguaje de conversación**: español
- **Zona horaria del equipo**: `America/Bogota`
- **Stack del proyecto**: JavaScript + Electron (desktop pet con Pomodoro + IA)
- **Herramientas clave**: GitHub, Linear, Slack
- **Persona del equipo**: directo, sin ceremonias, documenta lo importante
- **Métricas que importan**: `<latency p99 \| uptime \| error rate \| ...>`

---

## Skills disponibles en este workspace

| Skill | Cuándo usarla |
|---|---|
| `/gate-spec` | Spec + plan de una feature nueva (brainstorming → plan TDD) |
| `/gate-plan` | Para arrancar una feature nueva |
| `/gate-team` | Para implementar con Agent Team (Leader-Worker-Verifier) |
| `/gate-review` | Para hacer code review adversarial |
| `/gate-debug` | Bug: causa raíz, test que falla antes del fix, fix mínimo |
| `/gate-qa` | Corre los tests y escribe el registro de QA en `docs/qa/` |
| `/gate-doc` | Para generar design doc o changelog en DOCX |
| `/gate-deploy` | Bump + changelog + tag + push (corre `gate strict` antes) |

---

## Notas adicionales

> Espacio libre. Cosas que Mavis debería saber pero no encajan en otra sección.


## Método

> Cómo trabaja el agente en este repo, con o sin superpowers.

- **Evidencia antes de "listo"**: corré el comando que prueba lo que decís (tests, build) y citá su resultado (`/gate-qa`).
- **Bugs con `/gate-debug`**: primero la causa raíz y un test que falla; después el fix.
- **Diseño antes que código**: `/gate-spec` o `/gate-plan` para lo no trivial, y TDD en cada tarea.
- **`/gate-review` antes de mergear**: un revisor sin la conversación; el veredicto va a `docs/reviews/`.
- **Qué exige este repo**: `gate config show` (perfil de `gate.json`: plan, review, QA, tests).
- Si tu harness tiene superpowers, cada skill `gate-*` lo usa; si no, trae su propio método.
