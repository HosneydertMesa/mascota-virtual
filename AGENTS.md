# AGENTS.md — Project Memory

> **Edita este archivo para que Mavis (y Grok Build) entiendan tu proyecto.**
> Las convenciones aquí se aplican en cada sesión, sub-agente y skill.

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
# Ajustado a scripts reales de este proyecto (Electron + Node, JS puro)
setup:     npm install
syntax:    npm run check          # node --check sobre los .js
test:      npm test               # node --test test/*.test.js
test-cov:  npx c8 npm test        # opcional, requiere `npm i -D c8`
run:       npm start              # electron .
clean:     Remove-Item -Recurse -Force node_modules\.cache, .parcel-cache, dist
```
<!-- SDLC_COMMANDS_END -->

> ⚠️ No hay `lint` / `format` / `typecheck` / `build` configurados aún (proyecto JS puro, sin TS, sin prettier/eslint). Si los agregas, rellena los comandos arriba.
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

```
1. PLAN     →  /sdlc-plan "<feature>"
2. DESIGN   →  design doc en docs/design/<feature>.md (auto-gen DOCX con /sdlc-doc)
3. IMPLEMENT → /sdlc-team implement "<feature>"  (Leader → Implementer → Verifier)
4. REVIEW   →  /sdlc-review (automático en pre-commit hook + manual con skill)
5. TEST     →  nightly cron en .grok/sdlc-setup/cron/nightly-tests.ps1
6. MERGE    →  PR con MCP GitHub (auto-review + auto-assign)
7. DOCS     →  /sdlc-doc finalize "<feature>"  (DOCX con changelog)
8. DEPLOY   →  manual o via CI, segun tu pipeline
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
| `/sdlc-plan` | Para arrancar una feature nueva |
| `/sdlc-team` | Para implementar con Agent Team (Leader-Worker-Verifier) |
| `/sdlc-review` | Para hacer code review adversarial |
| `/sdlc-doc` | Para generar design doc o changelog en DOCX |

---

## Notas adicionales

> Espacio libre. Cosas que Mavis debería saber pero no encajan en otra sección.

