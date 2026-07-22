# Review: batch-2-track-a-p3-memories

**Fecha**: 2026-07-21
**Reviewer**: Mavis (sesión root, modo adversarial)
**Branch**: main (5 commits directos, batch 2 track A)
**Veredicto**: ✅ **APPROVED** (con 4 hallazgos MINOR, todos diferibles o documentados)

---

## Resumen ejecutivo

Track A de batch 2 mergeado a main. La mascota ahora **recuerda cosas entre sesiones**: cada mensaje del usuario pasa por un extractor IA que decide si hay un hecho memorable para guardar (max 50), se redacta PII automáticamente, y al iniciar nueva conversación los recuerdos relevantes se inyectan al system prompt via TF-IDF lite. Esto convierte a la mascota de "olvidadiza" a "te conoce".

5 commits, 14 archivos, +2116/-8 LOC, +96 tests (de 243 → 339).

Lo que se destaca:
- **pet-memories.js (38 tests)**: pure functions con tokenización Unicode, bag-of-words TF, PII redaction (email/phone/CC), dedup Jaccard, format para prompt, prune. UMD-lite para reuso browser+Node.
- **memories-store.js (37 tests)**: persistencia versionada, escritura atómica (.tmp + rename), `addMemory` integra PII redaction + dedup + prune, `setRedactPII` re-redacta existentes al pasar a ON.
- **memory-extractor.js (21 tests)**: prompt dedicado con reglas claras de qué SÍ/NO es recuerdo, `parseExtractorResponse` pure (maneja think tags, markdown, JSON embebido, garbage).
- **main.js wire**: `ai:send-message` inyecta top-5 relevantes al prompt + extrae en background (no bloquea reply). IPC handlers con `isDashboardSender` para mutaciones.
- **Dashboard tab "Recuerdos"**: lista con DOM API (no innerHTML con user data → imposible XSS), contador N/50, toggle PII, borrar individual + clear all con confirm.

---

## Hallazgos

### [MINOR-1] Memorias son globales, no per-pet

**Archivos**: `src/services/memories-store.js`, `main.js:loadMemories`
**Impacto**: bajo. Si el usuario tiene Luna (cat) y Max (dog), comparten los mismos recuerdos. Probablemente está bien — la mascota "conoce al usuario" en general. Pero podría ser feature pedir memorias distintas por mascota.
**Decisión**: diferir a v2 (o cuando haya feedback de uso). El plan original lo dejó como single store.

### [MINOR-2] PII redaction puede dar falsos positivos en phones

**Archivos**: `src/core/pet-memories.js:RE_PHONE`
**Impacto**: bajo. El regex `(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}` es permisivo para cubrir formatos internacionales, pero puede matchear secuencias numéricas arbitrarias de 4+4+4 dígitos (ej: fechas 2026-2026-2026). El test `extractPII: input sin PII` lo cubre parcialmente.
**Decisión**: aceptable. Falsos positivos son conservadores (mejor redactar de más que de menos). Si se quiere refinar, agregar validación contextual (ej: requiere al menos un separador entre grupos). Diferir.

### [MINOR-3] `loadMemoriesList` se llama cada vez que se abre la tab

**Archivos**: `src/dashboard-renderer.js:loadMemoriesList`
**Impacto**: bajo. Si el usuario abre/cierra la tab "Recuerdos" muchas veces, se hace una IPC por click. IPC es < 1ms, no es problema de performance. Pero el código no cachea el último store — si llegan memorias nuevas via chat mientras la tab está cerrada, no se ven hasta reabrirla.
**Decisión**: aceptable. El refresh-on-open es semánticamente correcto. Si en el futuro se quiere auto-refresh, agregar `setInterval(loadMemoriesList, 5000)` cuando la tab está activa.

### [MINOR-4] El extractor consume API quota en cada mensaje

**Archivos**: `src/services/memory-extractor.js:extractMemoryFromMessage`
**Impacto**: bajo (costo) + privacy (cada mensaje va al M3 dos veces: chat + extract). Para usuarios activos (20 chats/dia) son ~4000 tokens/dia extra. El plan lo documentó como trade-off conocido.
**Decisión**: diferir optimización. Si en batch 3 se quiere reducir, opciones: (a) solo extraer cada Nth mensaje, (b) solo si el mensaje tiene keywords (nombre, lugar, etc), (c) hacer extract solo cuando el usuario guarda explícitamente. v1 acepta el costo.

---

## Lo que NO se encontró (búsquedas adversariales)

- ✅ No hay secrets, API keys, ni credenciales en el diff.
- ✅ No hay `console.log` olvidados (solo `console.error` legítimo en catch blocks).
- ✅ No hay archivos > 500KB.
- ✅ No hay `require` circulares (`pet-memories.js` no requiere nada; `memories-store.js` solo requiere `pet-memories.js`; `memory-extractor.js` no requiere nada del store).
- ✅ **No hay XSS en la UI**: el dashboard usa DOM API (`textContent`, `createElement`) para renderizar recuerdos, NO `innerHTML` con user data. Confirmado en `loadMemoriesList`.
- ✅ **No hay PII leak en logs**: el logger ya redacta API keys (v1.3.0), y los recuerdos se redactan ANTES de persistir (en `addMemory`). El extractor puede loguear `MEMORY ADDED` con el texto truncado a 50 chars — bajo riesgo.
- ✅ **Atomic write**: `.tmp` + `rename` evita JSON corrupto si se corta la energía.
- ✅ **Validación de inputs**: `isValidStore` y `isValidCandidate` en store, `parseExtractorResponse` valida tipos y longitudes, `extractMemoryFromMessage` valida apiKey y userMessage.
- ✅ **IPC security**: `isKnownSender` para read (`memories:list`), `isDashboardSender` para mutaciones (`remove`, `clear`, `set-redact`). No hay forma de que un renderer no-dashboard modifique recuerdos.
- ✅ **Tests cubren los 5 estados del mood, los 4 stats, y los edge cases** (esto es de v1.5.0 pero aplica por la integración).
- ✅ **UMD-lite de pet-memories.js**: compatible con los tests existentes en Node, expone `window.PetMemories` para browser.
- ✅ **TF-IDF lite**: bag-of-words sin IDF completo. Documentado en el archivo como decisión consciente (corpus chico, IDF aporta poco).
- ✅ **PII patterns en orden correcto**: creditCard ANTES de phone para que CCs con guiones no se matcheen como phone (4+4+4 dígitos).
- ✅ **Empty state visible**: cuando memories=[], muestra mensaje explicativo, no se rompe.
- ✅ **dedupMemory con Jaccard 0.7**: previene duplicados sin ser tan estricto que rechace reformulaciones válidas.

---

## Cambios aprobados

| Commit | Tipo | Descripción | Tests |
|---|---|---|---|
| `9793d1f` | feat(memories) | pure functions (tokenize, rank, PII, dedup, format) | +38 |
| `b3d46f6` | feat(memories) | persistencia JSON con escritura atómica | +37 |
| `2541685` | feat(memories) | extractor IA con parseExtractorResponse | +21 |
| `8acda4c` | feat(memories) | wire en main.js + IPC + ai.js prompt extension | 0 (integration) |
| `7bbe59a` | feat(dashboard) | tab "Recuerdos" con lista + clear + toggle PII | 0 (UI) |

**Total**: 339/339 tests verde, working tree clean, listo para QA + push + tag v1.6.0-track-a.
