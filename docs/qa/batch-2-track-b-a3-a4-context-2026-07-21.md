# QA Sign-off: batch-2-track-b-a3-a4-context

**Fecha**: 2026-07-21
**QA reviewer**: Mavis (sesión root)
**Veredicto**: ✅ **SIGN-OFF** (auto-verificación + checklist de smoke test)

---

## Auto-verificación ✅

| Check | Resultado | Detalle |
|---|---|---|
| `node --check` (sintaxis) | ✅ verde | 21 archivos JS validados (main.js, preload.js, 13 src/services + 10 src/core + 2 renderer) |
| `node --test test/*.test.js` | ✅ **383/383** verde | 339 previos + 44 nuevos (31 context-awareness + 13 idle-monitor) |
| `node scripts/sdlc.js dev` | ✅ verde | Sintaxis + tests + pre-commit + plan gate |
| Pre-commit hook | ✅ verde | Sin secrets, sin debug statements, sin archivos grandes |
| Plan en `docs/plans/` | ✅ presente | `batch-2-contexto-recuerdos-2026-07-21.md` |
| Review adversarial | ✅ APPROVED | `docs/reviews/batch-2-track-b-a3-a4-context-2026-07-21.md` (4 MINOR, todos diferibles) |
| Working tree limpio | ✅ verde | 0 cambios sin commitear, 2 commits ahead de origin |

---

## Smoke test recomendado (manual, antes de release público)

> Tiempo estimado: 15-20 minutos. Requiere GUI + inactividad real (no podés usar el mouse/teclado durante 10+ min).

### A3.1 — Idle detection basico

- [ ] Abrir la app: `npm start`
- [ ] Dejar el sistema COMPLETAMENTE idle por 11+ min (no tocar mouse ni teclado)
- [ ] **Esperado**: la mascota muestra un speech bubble "Llevas 11 min sin actividad. ¿Un break?"
- [ ] Si no aparece: verificar que `powerMonitor.getSystemIdleTime()` esté disponible (log en debug)

### A3.2 — Cooldown de 5 min

- [ ] Después del tip de A3.1, hacer un poco de actividad (mover el mouse)
- [ ] Volver a dejar idle por 11+ min
- [ ] **Esperado**: NO aparece otro tip inmediatamente (el último fue hace < 5 min)
- [ ] Esperar 5+ min más sin actividad
- [ ] **Esperado**: aparece otro tip

### A3.3 — Idle corto no dispara

- [ ] Mover el mouse cada 5 min
- [ ] **Esperado**: ningún tip de break (idle nunca llega a 10 min)

### A3.4 — El tip se ve en la mascota

- [ ] Durante un tip de A3.1, verificar:
  - El speech bubble aparece centrado arriba de la mascota
  - El texto es "Llevas X min sin actividad. ¿Un break?"
  - Desaparece después de unos segundos (auto-hide)

### A3.5 — No crashea si powerMonitor no está

- [ ] Ejecutar la app en un Linux sin systemd-logind (donde `getSystemIdleTime` puede no funcionar)
- [ ] **Esperado**: la app arranca normal, no crashea, no aparece tip de break (es OK, feature desactivada)

### A4.1 — Typing rate detectado

- [ ] Abrir dashboard, tab "Chatear"
- [ ] En el input, escribir a alta velocidad (copiar-pegar un texto largo ayuda)
- [ ] Verificar en DevTools console que `keystrokes` está creciendo
- [ ] Esperar 2+ min de typing sostenido > 80 WPM
- [ ] **Esperado**: DND se activa. No debería haber autonomous tips del pet durante este tiempo

### A4.2 — DND suprime autonomous tips

- [ ] Con DND activo, esperar 5+ min (el autonomous cycle corre cada 4.5 min)
- [ ] **Esperado**: el pet NO dispara autonomous tips (speech bubble, movimiento autónomo)
- [ ] Verificar en log: `DND: ON`

### A4.3 — DND sale cuando typing baja

- [ ] Con DND activo, dejar de escribir por 30s
- [ ] **Esperado**: DND se desactiva. Verificar en log: `DND: OFF`
- [ ] Después de otros 5+ min, el autonomous cycle vuelve a disparar tips normalmente

### A4.4 — Backspace infla el rate

- [ ] Escribir un texto y luego presionarrrrrrrrrrrr Backspace muchas veces (>80 veces en 30s)
- [ ] **Esperado**: DND se activa (porque el conteo es alto, no porque sea typing real)
- [ ] Es comportamiento documentado en MINOR-4 del review. Aceptable para v1.

### A4.5 — Paste no dispara muchos eventos

- [ ] Copiar un párrafo largo al clipboard
- [ ] Pegarlo en el chat input con Ctrl+V
- [ ] **Esperado**: solo 1 evento input (no infla artificialmente el WPM)

### A4.6 — Limpieza al cerrar dashboard

- [ ] Activar DND (typing rápido)
- [ ] Cerrar el dashboard mientras DND está activo
- [ ] **Esperado**: el flag DND se limpia (beforeunload handler)
- [ ] El pet vuelve a poder disparar autonomous tips

---

## Out of scope (no verificado en este sign-off)

- **A3 mide idle del SO entero** (no solo de la app). Aceptable — documentado en MINOR-1.
- **A4 solo mide typing en el chat**, no en otras apps. Aceptable — documentado en MINOR-2.
- **Cooldown del DND** se basa en el calculo stateless de shouldEnter/shouldExit, no en un timestamp. Aceptable — documentado en MINOR-3.
- **Backspace infla el WPM**. Aceptable — documentado en MINOR-4.
- **No tests E2E con Electron** — los smoke tests son manuales. La lógica pure tiene 44 tests que cubren la matemática.
- **No tests del wire en main.js** (IPC handlers, integrate idle-monitor). Se valida con smoke test.
- **No tests del typing rate en dashboard-renderer** (la integración con el listener input). Se valida con smoke test.

---

## Veredicto final

✅ **APROBADO** para push a `origin/main` y tag v1.6.0 (cierre de batch 2 completo).

**Batch 2 cerrado**:
- v1.6.0-track-a: P3 recuerdos persistentes
- v1.6.0: P3 + A3 idle + A4 DND

**Próximos**:
- batch 3 (productividad): pomodoro adaptativo + quick capture
- batch 4 (distribución + polish): electron-builder + auto-update + security audit → v2.0
