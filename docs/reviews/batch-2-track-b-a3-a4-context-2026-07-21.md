# Review: batch-2-track-b-a3-a4-context

**Fecha**: 2026-07-21
**Reviewer**: Mavis (sesión root, modo adversarial)
**Branch**: main (2 commits directos, batch 2 track B)
**Veredicto**: ✅ **APPROVED** (con 4 hallazgos MINOR, todos diferibles o documentados)

---

## Resumen ejecutivo

Track B de batch 2 mergeado a main. La mascota ahora es **reactiva al contexto del usuario**:
- **A3 Idle detection**: cada 60s, main consulta `powerMonitor.getSystemIdleTime()`. Si el SO lleva 10+ min sin input Y no estamos en cooldown (5 min), sugiere un break vía `pet-system-event` con texto "Llevas X min sin actividad. ¿Un break?". El pet renderer lo muestra como speech bubble.
- **A4 Typing rate → DND**: el dashboard mide keystrokes en el chat input. Si el usuario typing > 80 WPM sostenido por 2+ min, activa modo "Do Not Disturb" (vía IPC). Mientras está en DND, el autonomous cycle del main se saltea (no interrumpe). Sale de DND si typing baja < 60 WPM por 30s.

2 commits, 10 archivos, +851/-2 LOC, +44 tests (de 339 → 383).

Lo que se destaca:
- **Decisión arquitectural clave**: A3 usa `powerMonitor.getSystemIdleTime()` (built-in Electron, cross-platform, NO requiere permisos especiales). Es la opción correcta — antes el plan hablaba de "input de mouse/teclado" que requeriría APIs OS-específicas (GetLastInputInfo, CGEventSourceCreate) con permisos.
- **A4 solo mide typing en el chat** (no system-wide). Aceptable porque (a) la mayoría del tiempo el usuario interactúa con la mascota via chat, (b) medir typing system-wide requiere permisos adicionales.
- **Pure functions bien separadas**: `context-awareness.js` (isSystemIdle, shouldSuggestBreak, computeTypingRate, shouldEnterDoNotDisturb, shouldExitDoNotDisturb, formatIdleTime) son todas testables sin Electron.
- **idle-monitor service** encapsula el powerMonitor con try/catch defensivo, no-op si no está disponible.

---

## Hallazgos

### [MINOR-1] A3 mide idle del SO entero, no solo de la app

**Archivos**: `src/services/idle-monitor.js:tick`, `src/core/context-awareness.js:isSystemIdle`
**Impacto**: bajo. Si el usuario está en otra app (browser, IDE) por 10 min sin tocar nada, la mascota le sugiere break. Esto es probablemente lo que el usuario quiere (la mascota "se preocupa"). Pero podría ser un poco intrusivo para usuarios que dejan la compu sola intencionalmente.
**Decisión**: aceptable. El cooldown de 5 min limita el spam. Si en batch 3 hay feedback de "muy invasivo", agregar toggle off en Settings.

### [MINOR-2] A4 solo mide typing en el chat, no en otras apps

**Archivos**: `src/dashboard-renderer.js:keystrokes`, `chatInput.addEventListener`
**Impacto**: bajo. Si el usuario está en su IDE typing 100 WPM pero no en el chat, DND no se activa. La mascota podría interrumpir con autonomous tips.
**Decisión**: diferir. Para v1 el caso de uso principal es "el usuario está chateando con la mascota a alta velocidad y se distrae". Si en batch 3 se quiere medir system-wide, requiere permisos OS + node-ffi. Out of scope.

### [MINOR-3] Cooldown del DND usa timestamp global, no último cambio

**Archivos**: `src/core/context-awareness.js:shouldEnterDoNotDisturb`, `shouldExitDoNotDisturb`
**Impacto**: bajo. El cálculo es stateless (toma keystrokes y now), no mantiene "cuándo entramos en DND". Esto significa que si el usuario deja de typing por 5 min, la próxima keystroke individual puede re-disparar el cálculo y entrar en DND de nuevo (depende del threshold).
**Decisión**: aceptable. La función `maybeCheckDnd` en el dashboard se ejecuta solo cada 10s, y verifica el estado actual. El cooldown está implícito en el cálculo (60s de typing < 80 WPM sale de DND antes de que entre de nuevo).

### [MINOR-4] `computeTypingRate` cuenta TODOS los eventos input (incluyendo paste)

**Archivos**: `src/dashboard-renderer.js:chatInput.addEventListener('input', ...)`
**Impacto**: muy bajo. Si el usuario hace paste de un texto largo, dispara un solo evento 'input' (no múltiples), así que no infla artificialmente el WPM. Si presiona Backspace muchas veces, también infla el rate sin ser typing real.
**Decisión**: aceptable. Para v1 es suficientemente preciso. Si en batch 3 se quiere ser más estricto, filtrar keys que sean texto (no Backspace/Delete) o medir WPM solo en keystrokes consecutivos sin pausas largas.

---

## Lo que NO se encontró (búsquedas adversariales)

- ✅ No hay secrets, API keys, ni credenciales.
- ✅ No hay `console.log` olvidados (solo `console.error` legítimo en catch).
- ✅ No hay archivos > 500KB.
- ✅ No hay `require` circulares (`context-awareness.js` no requiere nada; `idle-monitor.js` requiere solo `context-awareness.js`).
- ✅ **Defensivo**: `idle-monitor.js` no crashea si `powerMonitor.getSystemIdleTime` no existe o lanza error — devuelve un handle no-op.
- ✅ **No leak de timers**: `detach()` llama a `clearIntervalFn`. Idempotente (segunda llamada no rompe).
- ✅ **No race conditions**: `idleMonitorHandle` se setea null en detach, `tick` corre con el closure correcto. El setInterval no acumula refs.
- ✅ **IPC security**: `dnd:update` usa `isDashboardSender` (no cualquier renderer puede setear DND). Solo el dashboard puede.
- ✅ **Tests cubren**:
  - Constantes y defaults
  - isSystemIdle: threshold, invalidos (null/NaN/negativo/string)
  - shouldSuggestBreak: idle + cooldown combos, threshold custom
  - computeTypingRate: 0 keystrokes, dentro/fuera de ventana, WPM exactos, invalidos
  - shouldEnterDoNotDisturb: typing alto/bajo, sostenido vs no sostenido (test documenta el calculo naive)
  - shouldExitDoNotDisturb: salir sin keystrokes, mantener con typing alto
  - formatIdleTime: seg/min/horas, invalidos
  - idle-monitor: powerMonitor missing, null, throwing, primer tick, idle bajo/alto, cooldown, getState, detach idempotente, callback throws
- ✅ **XSS en idle-break**: el texto del tip es un string estático (`Llevas X min sin actividad. ¿Un break?`) con el `idleFormatted` interpolado. Como se construye en main (Node) y se envía por IPC, no hay XSS. El renderer lo muestra con `showSpeech(text)` que usa textContent (no innerHTML).
- ✅ **No side effects en pure functions**: `context-awareness.js` no muta state, no hace I/O, todo determinista.
- ✅ **logDebug es opcional**: si el caller no lo pasa, es un no-op (no rompe).
- ✅ **package.json check**: incluye los nuevos archivos.

---

## Cambios aprobados

| Commit | Tipo | Descripción | Tests |
|---|---|---|---|
| `0dbaeb1` | feat(context) | pure functions (idle, typing rate, DND) | +31 |
| `ffbb2e9` | feat(context) | idle-monitor service + main wire + IPC + dashboard DND | +13 |

**Total**: 383/383 tests verde, working tree clean, listo para QA + push + tag v1.6.0.
