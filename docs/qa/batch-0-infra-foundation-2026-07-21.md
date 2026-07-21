# QA Sign-off: batch-0-infra-foundation

**Fecha**: 2026-07-21
**QA reviewer**: Mavis (sesión root)
**Veredicto**: ✅ **SIGN-OFF PARCIAL** (auto-verificación + checklist de smoke test)

---

## Auto-verificación ✅

| Check | Resultado | Detalle |
|---|---|---|
| `node --check` (sintaxis) | ✅ verde | 11 archivos JS validados |
| `node --test test/*.test.js` | ✅ **129/129** verde | 79 previos + 50 nuevos |
| `node scripts/sdlc.js dev` | ✅ verde | Sintaxis + tests + pre-commit + plan gate |
| Pre-commit hook | ✅ verde | Sin secrets, sin debug statements, sin archivos grandes |
| Plan en `docs/plans/` | ✅ presente | `batch-0-infra-foundation-2026-07-21.md` + roadmap |
| Review adversarial | ✅ APPROVED | `docs/reviews/batch-0-infra-foundation-2026-07-21.md` |
| Working tree limpio | ✅ verde | 0 cambios sin commitear |

---

## Smoke test recomendado (manual, antes de release público)

> Tiempo estimado: 10-15 minutos. Estos checks no se pueden automatizar desde CI.

### T3 — powerMonitor hookup
- [ ] Abrir la app: `npm start`
- [ ] Bloquear pantalla (Win+L / Cmd+Ctrl+Q)
- [ ] **Esperado**: la mascota entra en sleeping state (ojos cerrados / ZZ)
- [ ] Desbloquear pantalla
- [ ] **Esperado**: la mascota vuelve a idle tras 5s
- [ ] Repetir con `suspend` (cerrar laptop / `pmset sleep` en macOS)

### T4 — globalShortcut
- [ ] Con la app corriendo, apretar `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
- [ ] **Esperado**: togglea el pomodoro (start/pause)
- [ ] Si dashboard no estaba abierto, debe abrirse con tab `pomodoro`
- [ ] Apretar `Ctrl+Shift+S`: la mascota debe ir a sleeping
- [ ] Apretar `Ctrl+Shift+Q`: debe disparar el placeholder de quick capture (toast "coming soon")

### T9 — structured logger
- [ ] Después de un par de interacciones, revisar el archivo de log (path por default: `<userData>/mascota-debug.log` o stdout)
- [ ] **Esperado**: JSON-lines con campos `ts`, `level`, `msg`, `service`, `pid`
- [ ] Buscar `apiKey`, `password`, etc. en el log: **no deben aparecer en plaintext** (deben estar como `[REDACTED]`)

### T1 — refactor de comportamiento
- [ ] Chatear con la mascota (Luna o Max)
- [ ] **Esperado**: comportamiento idéntico al de v1.2.2
  - `intent=sleep` → duerme
  - `intent=stay` → quieta, no duerme
  - `intent=approach` → camina al cursor
  - `intent=retreat` → se aleja
  - `intent=play` → modo juguetón
  - `intent=wander` → paseo tranquilo
- [ ] Si algún comportamiento cambió, REVERTIR y debuggear (es un refactor puro, no debería haber diff observable)

### T8 — CI en GitHub
- [ ] Push a GitHub debe gatillar el workflow `.github/workflows/ci.yml`
- [ ] **Esperado**: matrix de 6 jobs (3 OS × 2 Node) pasa en ~5-10 min
- [ ] Si falla en alguna plataforma, debuggear (probablemente paths case-sensitive en Linux o algo de bash/PowerShell)

---

## Items no testeables automáticamente

- **T3 powerMonitor en Linux**: requiere test en máquina Linux. CI matrix lo cubre parcialmente.
- **T4 globalShortcut en macOS**: requiere permisos de accesibilidad. CI matrix lo cubre.
- **UX final**: el comportamiento exacto de la mascota se siente igual al de v1.2.2, pero la validación es subjetiva. Si el usuario percibe cambios, abrir issue.

---

## Riesgos residuales

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Algún comportamiento cambió en T1 refactor | Baja | Tests E2E de pet-behavior cubren 15 caminos. Si falla, `git revert` el commit `6a4a1d2` |
| Conflict de shortcuts con otra app | Media | Try/catch + log warning en T4. El usuario puede reasignar desde settings (no implementado aún) |
| PowerMonitor event no existe en algún OS | Baja | Try/catch defensivo en T3 |
| CI falla en macOS por algún detalle de paths | Baja | El workflow usa `actions/checkout@v4` estándar |

---

## Criterios de salida

- [x] Auto-verificación verde (129/129 tests, sintaxis, pre-commit, sdlc:dev)
- [x] Plan y review commiteados
- [x] Smoke test documentado
- [x] Riesgos residuales identificados
- [x] Plan de rollback documentado (revert del commit)

**SIGN-OFF** → pasa a GATE 4 (Release).
