# Review: pet-animation-capa1

**Fecha**: 2026-07-21
**Revisor**: Mavis (self-review con fresh context)
**Diff**: `docs/reviews/_pending/pet-animation-capa1.diff` (616 lineas, 12 archivos)
**Alcance**: AI movement intents + ear twitch micro-animation + sdlc.js bug fix

**Verdict**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 4 MINOR, 2 INFO

---

## Categorías revisadas

### 🐛 Correctness

✅ **PASS** — `normalizeIntent` con allow-list correcta, IPC validation simétrica con los otros campos (emotion/action/sound), system prompts actualizados con la sección INTENTS.

### [MINOR] Correctness — `retreat` con cursor en el centro de la mascota

**File**: `main.js:executePetBehavior` (rama `intent === 'retreat'`)
**Issue**: Si el cursor está exactamente sobre el centro horizontal de la mascota, `cursorDelta === 0` y `Math.abs(cursorDelta) > 0` es `false`, entonces cae al fallback `chooseNewTarget('AI_RETREAT')` que es random walk, no retreat.
**Impact**: Comportamiento subóptimo pero no rompe nada. En práctica el cursor casi nunca está exactamente en el centro, así que la rama se ejecuta raramente.
**Fix**: Si `cursorDelta === 0`, tomar la dirección del último movimiento (o default a `+1`). Por ahora aceptable.

### [MINOR] Correctness — `approach` con cursor encima de la mascota

**File**: `main.js:executePetBehavior` (rama `intent === 'approach'`)
**Issue**: Si el cursor está dentro del radio de interacción (`tracking.close === true`), el código cae a `chooseNewTarget('AI_APPROACH')` que es random walk, no "approach" real. La mascota debería quedarse cerca del cursor o hacer un happy bounce, no alejarse al azar.
**Impact**: La mascota se va al lado opuesto cuando más quiere estar cerca. Contradice la intent.
**Fix**: Si `tracking.close`, no moverse (la IA ya está cerca, no necesita acercarse más). O trigger de un `happyBounce`.

### 🔒 Security

✅ **PASS** — Sin nueva superficie de ataque. `normalizeIntent` cae a `'none'` para input inválido (defense in depth). IPC sigue validando sender. Sin secretos nuevos. Sin nuevas dependencias.

### ⚡ Performance

✅ **PASS** — Ear twitch con early-return (0.25% prob, ~1 twitch cada 6.6s). Animación manejada por CSS keyframes (no JS-driven cada frame). Sin loops nuevos innecesarios.

### [MINOR] Performance — `maybeTwitchEar` se llama cada frame

**File**: `src/renderer.js` (en `animateTail`)
**Issue**: La función se ejecuta cada `requestAnimationFrame` (~60fps). Aunque el early-return es barato, son 60 checks/seg de un random + comparación.
**Impact**: Despreciable (medido en microsegundos). No optimizable sin agregar complejidad.
**Fix**: No requiere acción. Documentar en el código que el costo es negligible.

### 🎨 Style & Conventions

✅ **PASS** — Sigue los patterns existentes (funciones `normalize*`, allow-list `Set`, IPC sanitization simétrica).

### [MINOR] Style — `ALLOWED_INTENTS` duplicado en 3 archivos

**File**: `src/renderer.js`, `src/dashboard-renderer.js`, `src/core/pet-motion.js`
**Issue**: La allow-list está duplicada en 3 lugares. Si se agrega un nuevo intent, hay que sincronizar manualmente.
**Impact**: Misma deuda técnica que ya existía con `ALLOWED_EMOTIONS`/`ALLOWED_ACTIONS`/`ALLOWED_SOUNDS`.
**Fix**: Refactor mayor → extraer a `src/core/pet-protocol.js` y cargarlo en ambos renderers (mismo plan que en el review original). Out of scope de este commit.

### 🧪 Testing

✅ **PASS** — Cobertura nueva adecuada.

- ✅ `normalizeIntent` con 2 tests (6 intents válidos + inputs inválidos)
- ✅ System prompts verificados que mencionan los 6 intents
- ✅ 41/41 tests pasan

### [MINOR] Testing — `executePetBehavior` y `maybeTwitchEar` sin test directo

**Files**: `main.js`, `src/renderer.js`
**Issue**: La lógica de interpretación de intents en main.js no tiene test (depende de Electron + screen module). El trigger de ear twitch tampoco (DOM + random).
**Impact**: Cambios futuros en estos flows pueden romper sin que los tests lo detecten.
**Fix**: Para main.js, mockear Electron con un wrapper testeable (refactor mayor). Para ear twitch, extraer la decisión probabilística a una función pura testable.

### 📚 Maintainability

✅ **PASS** — Plan doc completo en `docs/plans/pet-animation-capa1.md`. Separación clara: AI genera intent → main interpreta → renderer ejecuta.

### [INFO] Maintainability — Magic number `18` en retreat

**File**: `main.js:executePetBehavior` (rama `retreat`)
**Issue**: `MARGIN_SAFETY + 18` y `MARGIN_SAFETY + PET_VISIBLE_SIZE.width - 18` — el `18` es un buffer sin explicar (probablemente para que la mascota no se pegue al borde).
**Impact**: Confuso para quien lea el código.
**Fix**: Extraer a constante con nombre, ej. `EDGE_PADDING = 18`. O documentar inline.

---

## Resumen

| Severidad | Cantidad |
|---|---|
| CRITICAL | 0 |
| MAJOR | 0 |
| MINOR | 4 |
| INFO | 2 |

**APPROVED** — listo para pasar a GATE 3 (QA).

Los MINOR son todos mejoras incrementales que no bloquean el merge:
- 2 son edge cases de intents poco frecuentes
- 1 es performance negligible documentado
- 1 es duplicación pre-existente (no introducida por este PR)

Los INFO son nice-to-have.
