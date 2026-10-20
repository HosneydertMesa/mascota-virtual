# Phase Gates — mascotaVirtual

> ## ⚠️ MANDATORY — LEE ESTO PRIMERO
>
> **TODOS los cambios no triviales** (features, bugfixes, refactors > 5 lineas)
> **DEBEN** pasar por los 6 gates en orden. **Quick fixes** que se saltean
> el pipeline **están prohibidos** — son la causa #1 de bugs regresivos.
>
> **Cuándo se permiten skip** (solo cambios triviales, < 5 lineas):
> - Fix de typo en comentario
> - Update de versión de dependencia
> - Cambio cosmético sin lógica
>
> **Enforcement automático**:
> - El comando `gate strict` falla si intentás cerrar una feature sin plan + review + QA
> - El pre-commit hook rechaza commits `feat:`/`fix:`/`refactor:` sin plan en `docs/plans/`
> - El `status` muestra `⚠ MANDATORY` si hay gates saltados
>
> **Anti-patterns** que rompen este sistema (no hagas):
> - ❌ Commitear código sin plan → el pre-commit hook te bloquea
> - ❌ "Lo arreglo rapidito sin documentar" → genera bugs regresivos
> - ❌ Cerrar feature sin REVIEW → `gate deploy` falla

Pipeline de 6 gates que conecta los 4 skills del SDLC (`gate-plan`, `gate-team`,
`gate-review`, `gate-doc`) con checkpoints automáticos y manuales.

> **Orquestador**: `gate` (el CLI del setup `HosneydertMesa/sdlc`, ver `gate help`).
> **Estado actual**: `gate config show`.
> **Siguiente gate**: `gate strict`.
> **Strict mode** (rechaza features sin todos los gates): `gate strict`.

> **Frontmatter**: los gates PLAN/REVIEW/QA validan **frontmatter YAML** de los
> docs, no regex sobre la prosa. Cada plan/review/QA arranca con un bloque `---`
> con `id`, `status` y sus campos. La severidad de un review sale de
> `severity.critical` / `severity.major`; la evidencia de un QA, de
> `evidence.{tests,smoke,manual}`. Sin bypass: un doc con `migrated: true` o
> `pending: true` no aprueba ningún gate.
> Schema completo: `gate help` + el README del setup de gate.
> Verificá tus docs con:
> ```powershell
> pwsh -NoProfile -File "<setup>\scripts\check-frontmatter.ps1" -Path . -Kind all
> ```

---

## Diagrama de flujo

```
                ┌──────────────────────────────────────────────┐
                │  Idea / feature request                      │
                └────────────────┬─────────────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────┐
   GATE 0  │  PLAN  (opcional, recomendado)         │  ← /gate-plan
            │  Output: docs/plans/<feature>.md      │
            └────────────────┬───────────────────────┘
                             │ plan aprobado
                             ▼
            ┌────────────────────────────────────────┐
   GATE 1  │  DEV  (codear + tests)                 │  ← gate qa
            │  Auto: syntax, tests, pre-commit       │     + /gate-team
            │  Output: branch + commits              │
            └────────────────┬───────────────────────┘
                             │ tests verdes
                             ▼
            ┌────────────────────────────────────────┐
   GATE 2  │  REVIEW  (code review adversarial)     │  ← gate strict
            │  Auto: captura diff                    │     + /gate-review
            │  Output: docs/reviews/<branch>.md     │
            └────────────────┬───────────────────────┘
                             │ APPROVED (sin CRITICAL/MAJOR)
                             ▼
            ┌────────────────────────────────────────┐
   GATE 3  │  QA  (smoke test + dogfooding)         │  ← gate qa
            │  Auto: build check                     │     (manual sign-off)
            │  Output: docs/qa/<feature>.md          │
            └────────────────┬───────────────────────┘
                             │ P0/P1 cerrados
                             ▼
            ┌────────────────────────────────────────┐
   GATE 4  │  RELEASE  (versionar + empaquetar)     │  ← gate deploy
            │  Auto: bump version, tag               │     (electron-builder TBD)
            │  Output: installer artifact            │
            └────────────────┬───────────────────────┘
                             │ release publicado
                             ▼
            ┌────────────────────────────────────────┐
   GATE 5  │  DOC  (documentar la decisión)         │  ← /gate-doc
            │  Output: docs/deliverables/<f>.docx   │     + /gate-doc
            └────────────────────────────────────────┘
```

---

## GATE 0 — PLAN

**Cuándo es obligatorio:**
- Feature de >1 día
- Toca >3 archivos
- Hay decisiones de arquitectura
- Cualquier cosa que rompa compatibilidad

**Cuándo se puede saltar:**
- Fix de typo / comentario
- Bug trivial con causa clara
- Cambio cosmético sin lógica

**Quién lo corre:** dev o tech lead.

**Cómo se hace:**
1. Abrir chat con Mavis y escribir: `/gate-plan "<descripción de la feature>"`
2. Mavis genera `docs/plans/<slug>.md` con: contexto, archivos a tocar, riesgos, criterios de aceptación, plan de testing, métricas.
3. Revisar el plan, ajustar si hace falta, **commit del plan al repo** (convención: `docs(plans): add plan for <feature>`).

**Criterios de salida:**
- [ ] Plan commiteado en `docs/plans/`
- [ ] Lista de archivos a tocar con paths específicos
- [ ] Criterios de aceptación medibles
- [ ] Riesgos identificados (breaking/perf/seguridad)
- [ ] Estimación de tamaño (S/M/L/XL)

**Skill SDLC usado:** `/gate-plan`

---

## GATE 1 — DEV

**Cuándo se corre:** siempre, en cada commit.

**Quién lo corre:** el dev (autogestionado).

**Cómo se hace:**
1. Codear en la branch de trabajo (default: `feat/<slug>` o `fix/<slug>`).
2. Antes de commitear: `npm test + npm run check` (corre syntax + tests + pre-commit).
3. Si todo verde, commitear. Si no, fixear.

**Auto-checks del orquestador (`gate qa`):**
- `npm run check` (sintaxis)
- `npm test` (todos los tests pasan)
- Pre-commit hook: secrets, debug statements, archivos grandes
- Working tree limpio

**Criterios de salida:**
- [ ] Tests pasan localmente
- [ ] Sintaxis limpia
- [ ] Pre-commit hook limpio
- [ ] AGENTS.md respetado (estilo, naming, paths)
- [ ] Cambios commiteados con mensaje conventional (feat/fix/chore/refactor/...)

**Skill SDLC usado:** `/gate-team` (cuando es multi-archivo o necesita coordinador).

**Anti-patrones:**
- ❌ Commitear con tests rojos "porque los arreglo en el siguiente"
- ❌ Commits gigantes sin mensaje claro
- ❌ Saltarse el pre-commit con `--no-verify` (debería ser la excepción, no la regla)

---

## GATE 2 — REVIEW

**Cuándo se corre:** antes de mergear a `main`, en cada PR.

**Quién lo corre:** el dev que recibe la review (la invoca y comparte el output).

**Cómo se hace:**
1. `gate strict` captura el diff entre la branch y `main`.
2. Abrir chat con Mavis y escribir: `/gate-review` con el diff.
3. Mavis hace review adversarial con fresh context. Output: `docs/reviews/<branch>-<YYYY-MM-DD>.md`.
4. Si `CHANGES_REQUESTED`: el Implementer responde uno por uno, vuelve a GATE 1, repite GATE 2.
5. Si `APPROVED`: pasa a GATE 3.

**Auto-checks del orquestador (`gate strict`):**
- Working tree limpio (commits hechos)
- Diff capturado en `docs/reviews/_pending/<branch>.diff`
- Sugiere ruta para el output del review

**Criterios de salida:**
- [ ] Review guardado en `docs/reviews/`
- [ ] Sin hallazgos `CRITICAL` ni `MAJOR` sin resolver
- [ ] Si hay `MINOR`/`INFO`, decisión documentada (fix o diferir)

**Severidades (del skill gate-review):**
- `CRITICAL` — bug, vuln, data loss. **Bloquea el merge.**
- `MAJOR` — perf, maintainability, falta de tests en código crítico. **Bloquea el merge.**
- `MINOR` — comment-only, nota para el autor. No bloquea.
- `INFO` — sugerencia. No bloquea.

**Skill SDLC usado:** `/gate-review`

---

## GATE 3 — QA

**Cuándo se corre:** después de REVIEW aprobado, antes de RELEASE.

**Quién lo corre:** el dev (dogfooding) o un tester si hay.

**Cómo se hace:**
1. `gate qa` muestra el checklist y abre la app.
2. Recorrer el checklist (ver abajo).
3. Si todo OK, firmar sign-off en `docs/qa/<feature>-<YYYY-MM-DD>.md` y commitear.
4. Si hay bug, abrir issue / volver a GATE 1.

**Auto-checks del orquestador (`gate qa`):**
- `npm run check` (re-validar sintaxis)
- `npm test` (re-validar tests)
- Verifica que existe `docs/qa/` (lo crea si no)

**Checklist manual:**
- [ ] La app arranca (`npm start`)
- [ ] La mascota aparece, se ve, no rompe layout
- [ ] Drag funciona, se asienta al soltar (gravedad)
- [ ] Cursor tracking / wandering funciona
- [ ] Pomodoro: start / pause / reset / break / focus
- [ ] Chat con IA: enviar mensaje, recibir respuesta, parseo de tags OK
- [ ] Settings: elegir mascota, sonido, guardar API key
- [ ] Cambios de mascota persisten tras cerrar/reabrir
- [ ] (si hubo cambio) SafeStorage funciona encriptando la key
- [ ] No hay errores en consola ni en `debug.log`

**Criterios de salida:**
- [ ] Checklist completo firmado en `docs/qa/`
- [ ] Sin bugs P0 (bloquea release)
- [ ] Bugs P1 documentados como issues (no bloquean si está acordado)

**Skill SDLC usado:** ninguno automático. El orquestador arma el checklist.

---

## GATE 4 — RELEASE

**Cuándo se corre:** después de QA firmado.

**Quién lo corre:** el dev (con criterio de "esto sale al mundo").

**Cómo se hace:**
1. `gate deploy` muestra el plan: bump version, tag, build.
2. Decidir el bump: `patch` (bugfix), `minor` (feature nueva), `major` (breaking).
3. Correr `npm version <patch|minor|major>` (actualiza `package.json` y crea tag).
4. (Cuando electron-builder esté integrado) `npm run dist` genera el installer.
5. Smoke test del installer en una máquina limpia.
6. Push del tag: `git push origin v<version>`.

**Auto-checks del orquestador (`gate deploy`):**
- Working tree limpio
- Tag no existe ya
- Tests verdes (última verificación)
- Sugiere comandos exactos

**Criterios de salida:**
- [ ] Version bumped en `package.json`
- [ ] Tag `v<version>` creado
- [ ] (futuro) Installer `.exe`/`.dmg`/`.AppImage` generado y verificado
- [ ] Notas de release redactadas (pueden venir del CHANGELOG)

**Skill SDLC usado:** ninguno (todavía). Integrar `/gate-doc` para el changelog.

---

## GATE 5 — DOC

**Cuándo se corre:** después de release publicado.

**Quién lo corre:** el dev o tech writer.

**Cómo se hace:**
1. `/gate-doc "<feature>"` sugiere el comando a invocar.
2. En Mavis: `/gate-doc finalize "<feature>"`.
3. Mavis genera `docs/deliverables/<feature>-finalize-<YYYY-MM-DD>.docx` con: resumen ejecutivo, decisiones técnicas, métricas, lecciones, trabajo futuro.
4. Compartir el DOCX con stakeholders si aplica.

**Auto-checks del orquestador (`/gate-doc`):**
- Verifica que la feature ya pasó RELEASE (busca tag)
- Sugiere ruta del DOCX

**Criterios de salida:**
- [ ] DOCX generado y commiteado
- [ ] Resumen ejecutivo refleja la decisión real
- [ ] Métricas completas (coverage, perf, etc.)

**Skill SDLC usado:** `/gate-doc`

---

## Atajos (no siempre se corren los 6 gates)

| Tipo de cambio | Gates obligatorios |
|---|---|
| Bugfix trivial (1-2 líneas) | DEV → REVIEW (skip QA, RELEASE) |
| Fix de typo / comentario | solo DEV |
| Feature mediana | PLAN → DEV → REVIEW → QA → RELEASE → DOC |
| Feature grande / breaking | los 6 gates, con REVIEW profundo |
| Refactor sin cambio funcional | DEV → REVIEW |
| Hotfix en producción | DEV → REVIEW exprés → RELEASE (skip QA, doc al día siguiente) |

---

## Cómo extender el pipeline

Cuando agregues un nuevo gate (por ejemplo, "performance budget" o "accessibility audit"):

1. Definilo en este documento con: trigger, criterios de salida, skill usado.
2. Si es **de este repo**, agregá el auto-check al skill correspondiente (`gate-qa`,
   `gate-review`, `gate-debug`) o al `pre-commit` hook.
3. Si es **genérico para todos los proyectos**, va en el setup de gate
   (`HosneydertMesa/sdlc`): un sub-comando en `lib/commands/<cmd>.ps1` + su
   registro en `bin/gate.ps1` + tests en `tests/`.
4. Si tiene criterios visuales, agregalos al checklist del gate siguiente.

El orquestador (`gate`) está diseñado para que cada gate sea un módulo pequeño y testeable.

---

## Workers en paralelo (batch features)

**Problema**: cuando N workers comparten el mismo `cwd` y cada uno hace `git checkout` a su branch, se pisan en archivos centrales (`main.js`, `package.json`) y rompen el working tree del orquestador.

**Solución**: **git worktrees** — cada worker opera en su propio directorio físico (sibling del repo principal), apuntando a su propia branch.

### Workflow recomendado

1. **Orquestador (sesión root)**: define el batch en `docs/plans/<batch>-<fecha>.md` con N features independientes.
2. **Crear worktrees** desde el orquestador:
   ```bash
   npm run worktree -- add feat/mood-system
   npm run worktree -- add feat/micro-presence
   ```
   Esto crea `../mascotaVirtual-feat-mood-system/` y `../mascotaVirtual-feat-micro-presence/`, cada uno con su branch.
3. **Lanzar workers** (sub-agentes) con `run_in_background: true`. Cada uno trabaja en su worktree.
4. **Orquestador supervisa**: revisa `git log origin/<branch>` de cada worker. NO modifica el main repo mientras los workers estén activos.
5. **Merge serializado** cuando cada worker termina:
   - El worker pushea su branch al origin
   - El orquestador hace `git fetch` + `git merge <branch>` en el main repo
   - Resuelve conflictos si los hay
   - Continúa con el siguiente worker
6. **Cleanup**: `npm run worktree -- remove feat/<branch>` o `--clean` para borrar worktrees mergeados.

### Reglas para workers

- ❌ NO hacer `git checkout` desde el worktree a otras branches
- ❌ NO hacer `git stash` (cada worktree es independiente)
- ❌ NO modificar el main repo mientras trabaje en el worktree
- ✅ Commitear y pushear en su branch (no merge a main, eso lo hace el orquestador)
- ✅ Tests verdes localmente antes de pushear
- ✅ Mensaje de commit conventional (feat/fix/refactor/chore/docs/test)

### Comandos

```bash
npm run worktree -- add <branch>      # Crea ../mascotaVirtual-<branch>
npm run worktree -- list               # Lista worktrees activos
npm run worktree -- remove <branch>    # Elimina worktree (branch sigue)
npm run worktree -- clean              # Elimina worktrees mergeadas a main
```

### Lecciones aprendidas

- **mascotaVirtual batch 0 (2026-07-21)**: 3 workers compartieron cwd, se pisaron en main.js. Resolución manual: stash + merge conflict. Después se agregó este patrón + helper `worktree.js`. Documentado en user memory cross-project.

