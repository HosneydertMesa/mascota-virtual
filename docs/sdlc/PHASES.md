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
> - El comando `sdlc:strict` falla si intentás cerrar una feature sin plan + review + QA
> - El pre-commit hook rechaza commits `feat:`/`fix:`/`refactor:` sin plan en `docs/plans/`
> - El `status` muestra `⚠ MANDATORY` si hay gates saltados
>
> **Anti-patterns** que rompen este sistema (no hagas):
> - ❌ Commitear código sin plan → el pre-commit hook te bloquea
> - ❌ "Lo arreglo rapidito sin documentar" → genera bugs regresivos
> - ❌ Cerrar feature sin REVIEW → `sdlc:release` falla

Pipeline de 6 gates que conecta los 4 skills del SDLC (`sdlc-plan`, `sdlc-team`,
`sdlc-review`, `sdlc-doc`) con checkpoints automáticos y manuales.

> **Orquestador**: `node scripts/sdlc.js` (ver `help`).
> **Estado actual**: `node scripts/sdlc.js status` o `npm run sdlc:status`.
> **Siguiente gate**: `node scripts/sdlc.js next` o `npm run sdlc:next`.
> **Strict mode** (rechaza features sin todos los gates): `npm run sdlc:strict`.

---

## Diagrama de flujo

```
                ┌──────────────────────────────────────────────┐
                │  Idea / feature request                      │
                └────────────────┬─────────────────────────────┘
                                 │
                                 ▼
            ┌────────────────────────────────────────┐
   GATE 0  │  PLAN  (opcional, recomendado)         │  ← /sdlc-plan
            │  Output: docs/plans/<feature>.md      │
            └────────────────┬───────────────────────┘
                             │ plan aprobado
                             ▼
            ┌────────────────────────────────────────┐
   GATE 1  │  DEV  (codear + tests)                 │  ← sdlc.js dev
            │  Auto: syntax, tests, pre-commit       │     + /sdlc-team
            │  Output: branch + commits              │
            └────────────────┬───────────────────────┘
                             │ tests verdes
                             ▼
            ┌────────────────────────────────────────┐
   GATE 2  │  REVIEW  (code review adversarial)     │  ← sdlc.js review
            │  Auto: captura diff                    │     + /sdlc-review
            │  Output: docs/reviews/<branch>.md     │
            └────────────────┬───────────────────────┘
                             │ APPROVED (sin CRITICAL/MAJOR)
                             ▼
            ┌────────────────────────────────────────┐
   GATE 3  │  QA  (smoke test + dogfooding)         │  ← sdlc.js qa
            │  Auto: build check                     │     (manual sign-off)
            │  Output: docs/qa/<feature>.md          │
            └────────────────┬───────────────────────┘
                             │ P0/P1 cerrados
                             ▼
            ┌────────────────────────────────────────┐
   GATE 4  │  RELEASE  (versionar + empaquetar)     │  ← sdlc.js release
            │  Auto: bump version, tag               │     (electron-builder TBD)
            │  Output: installer artifact            │
            └────────────────┬───────────────────────┘
                             │ release publicado
                             ▼
            ┌────────────────────────────────────────┐
   GATE 5  │  DOC  (documentar la decisión)         │  ← sdlc.js doc
            │  Output: docs/deliverables/<f>.docx   │     + /sdlc-doc
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
1. Abrir chat con Mavis y escribir: `/sdlc-plan "<descripción de la feature>"`
2. Mavis genera `docs/plans/<slug>.md` con: contexto, archivos a tocar, riesgos, criterios de aceptación, plan de testing, métricas.
3. Revisar el plan, ajustar si hace falta, **commit del plan al repo** (convención: `docs(plans): add plan for <feature>`).

**Criterios de salida:**
- [ ] Plan commiteado en `docs/plans/`
- [ ] Lista de archivos a tocar con paths específicos
- [ ] Criterios de aceptación medibles
- [ ] Riesgos identificados (breaking/perf/seguridad)
- [ ] Estimación de tamaño (S/M/L/XL)

**Skill SDLC usado:** `/sdlc-plan`

---

## GATE 1 — DEV

**Cuándo se corre:** siempre, en cada commit.

**Quién lo corre:** el dev (autogestionado).

**Cómo se hace:**
1. Codear en la branch de trabajo (default: `feat/<slug>` o `fix/<slug>`).
2. Antes de commitear: `npm run sdlc:dev` (corre syntax + tests + pre-commit).
3. Si todo verde, commitear. Si no, fixear.

**Auto-checks del orquestador (`sdlc.js dev`):**
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

**Skill SDLC usado:** `/sdlc-team` (cuando es multi-archivo o necesita coordinador).

**Anti-patrones:**
- ❌ Commitear con tests rojos "porque los arreglo en el siguiente"
- ❌ Commits gigantes sin mensaje claro
- ❌ Saltarse el pre-commit con `--no-verify` (debería ser la excepción, no la regla)

---

## GATE 2 — REVIEW

**Cuándo se corre:** antes de mergear a `main`, en cada PR.

**Quién lo corre:** el dev que recibe la review (la invoca y comparte el output).

**Cómo se hace:**
1. `npm run sdlc:review` captura el diff entre la branch y `main`.
2. Abrir chat con Mavis y escribir: `/sdlc-review` con el diff.
3. Mavis hace review adversarial con fresh context. Output: `docs/reviews/<branch>-<YYYY-MM-DD>.md`.
4. Si `CHANGES_REQUESTED`: el Implementer responde uno por uno, vuelve a GATE 1, repite GATE 2.
5. Si `APPROVED`: pasa a GATE 3.

**Auto-checks del orquestador (`sdlc.js review`):**
- Working tree limpio (commits hechos)
- Diff capturado en `docs/reviews/_pending/<branch>.diff`
- Sugiere ruta para el output del review

**Criterios de salida:**
- [ ] Review guardado en `docs/reviews/`
- [ ] Sin hallazgos `CRITICAL` ni `MAJOR` sin resolver
- [ ] Si hay `MINOR`/`INFO`, decisión documentada (fix o diferir)

**Severidades (del skill sdlc-review):**
- `CRITICAL` — bug, vuln, data loss. **Bloquea el merge.**
- `MAJOR` — perf, maintainability, falta de tests en código crítico. **Bloquea el merge.**
- `MINOR` — comment-only, nota para el autor. No bloquea.
- `INFO` — sugerencia. No bloquea.

**Skill SDLC usado:** `/sdlc-review`

---

## GATE 3 — QA

**Cuándo se corre:** después de REVIEW aprobado, antes de RELEASE.

**Quién lo corre:** el dev (dogfooding) o un tester si hay.

**Cómo se hace:**
1. `npm run sdlc:qa` muestra el checklist y abre la app.
2. Recorrer el checklist (ver abajo).
3. Si todo OK, firmar sign-off en `docs/qa/<feature>-<YYYY-MM-DD>.md` y commitear.
4. Si hay bug, abrir issue / volver a GATE 1.

**Auto-checks del orquestador (`sdlc.js qa`):**
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
1. `npm run sdlc:release` muestra el plan: bump version, tag, build.
2. Decidir el bump: `patch` (bugfix), `minor` (feature nueva), `major` (breaking).
3. Correr `npm version <patch|minor|major>` (actualiza `package.json` y crea tag).
4. (Cuando electron-builder esté integrado) `npm run dist` genera el installer.
5. Smoke test del installer en una máquina limpia.
6. Push del tag: `git push origin v<version>`.

**Auto-checks del orquestador (`sdlc.js release`):**
- Working tree limpio
- Tag no existe ya
- Tests verdes (última verificación)
- Sugiere comandos exactos

**Criterios de salida:**
- [ ] Version bumped en `package.json`
- [ ] Tag `v<version>` creado
- [ ] (futuro) Installer `.exe`/`.dmg`/`.AppImage` generado y verificado
- [ ] Notas de release redactadas (pueden venir del CHANGELOG)

**Skill SDLC usado:** ninguno (todavía). Integrar `/sdlc-doc` para el changelog.

---

## GATE 5 — DOC

**Cuándo se corre:** después de release publicado.

**Quién lo corre:** el dev o tech writer.

**Cómo se hace:**
1. `npm run sdlc:doc "<feature>"` sugiere el comando a invocar.
2. En Mavis: `/sdlc-doc finalize "<feature>"`.
3. Mavis genera `docs/deliverables/<feature>-finalize-<YYYY-MM-DD>.docx` con: resumen ejecutivo, decisiones técnicas, métricas, lecciones, trabajo futuro.
4. Compartir el DOCX con stakeholders si aplica.

**Auto-checks del orquestador (`sdlc.js doc`):**
- Verifica que la feature ya pasó RELEASE (busca tag)
- Sugiere ruta del DOCX

**Criterios de salida:**
- [ ] DOCX generado y commiteado
- [ ] Resumen ejecutivo refleja la decisión real
- [ ] Métricas completas (coverage, perf, etc.)

**Skill SDLC usado:** `/sdlc-doc`

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
2. Agregá un sub-comando en `scripts/sdlc.js` que lo orqueste.
3. Si tiene auto-checks, hazlos parte de `sdlc.js <gate>`.
4. Si tiene criterios visuales, agregalos al checklist del gate siguiente.

El orquestador está diseñado para que cada gate sea un módulo pequeño y testeable.
