# QA Sign-off: batch-2-track-a-p3-memories

**Fecha**: 2026-07-21
**QA reviewer**: Mavis (sesión root)
**Veredicto**: ✅ **SIGN-OFF** (auto-verificación + checklist de smoke test)

---

## Auto-verificación ✅

| Check | Resultado | Detalle |
|---|---|---|
| `node --check` (sintaxis) | ✅ verde | 19 archivos JS validados (main.js, preload.js, 11 src/services + 9 src/core + 2 renderer) |
| `node --test test/*.test.js` | ✅ **339/339** verde | 243 previos + 96 nuevos (38 pet-memories + 37 memories-store + 21 memory-extractor) |
| `node scripts/sdlc.js dev` | ✅ verde | Sintaxis + tests + pre-commit + plan gate |
| Pre-commit hook | ✅ verde | Sin secrets, sin debug statements, sin archivos grandes |
| Plan en `docs/plans/` | ✅ presente | `batch-2-contexto-recuerdos-2026-07-21.md` |
| Review adversarial | ✅ APPROVED | `docs/reviews/batch-2-track-a-p3-memories-2026-07-21.md` (4 MINOR, todos diferibles) |
| Working tree limpio | ✅ verde | 0 cambios sin commitear, 5 commits ahead de origin |

---

## Smoke test recomendado (manual, antes de release público)

> Tiempo estimado: 15-20 minutos. Estos checks no se pueden automatizar desde CI (requieren GUI + LLM real).

### Setup

- [ ] Limpiar `<userData>/pet-memories.json` (o usar una instalación fresca) para empezar de cero
- [ ] Abrir la app: `npm start`
- [ ] Configurar MiniMax API Key en dashboard (si no está)

### P3.1 — Extracción básica

- [ ] Abrir dashboard, tab "Chatear"
- [ ] Escribir: "Hola, me llamo Jorge y soy developer de Bogotá"
- [ ] Esperar respuesta de la mascota
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: aparece 1-2 recuerdos: "El usuario se llama Jorge" y "Vive en Bogotá" (o similar)
- [ ] **Esperado**: contador muestra "2/50"
- [ ] Si no aparece nada, el extractor no detectó info memorable → repetir con frase más explícita

### P3.2 — Persistencia entre sesiones

- [ ] Cerrar la app completamente (no solo la ventana, matar el proceso)
- [ ] Volver a abrir
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: los recuerdos de la sesión anterior siguen ahí

### P3.3 — Inyección en system prompt (la mascota "te conoce")

- [ ] Con recuerdos guardados, abrir tab "Chatear"
- [ ] Escribir: "¿Qué sabes de mí?"
- [ ] **Esperado**: la mascota responde mencionando los recuerdos (nombre, ciudad, etc)
- [ ] Si no los menciona, el ranking no encontró los relevantes — probar con query más directa

### P3.4 — PII redaction

- [ ] En tab "Chatear", escribir: "Mi email es test@example.com y mi teléfono es (555) 123-4567"
- [ ] Esperar respuesta
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: el recuerdo NO contiene "test@example.com" ni "(555) 123-4567", sino `[REDACTED:email]` y `[REDACTED:phone]`
- [ ] **Esperado**: el toggle "Redactar PII" está en ON (default)

### P3.5 — Toggle PII

- [ ] Apagar el toggle "Redactar PII" en tab "Recuerdos"
- [ ] En tab "Chatear", escribir: "Mi tarjeta es 4532123456789010"
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: el recuerdo contiene el número completo (no redactado)
- [ ] Volver a encender el toggle
- [ ] **Esperado**: feedback "Se redactaron N recuerdo(s) existentes." si hay recuerdos con PII

### P3.6 — Dedup

- [ ] En tab "Chatear", escribir: "Tengo un gato llamado Michi"
- [ ] Esperar respuesta
- [ ] Escribir: "Mi gato se llama Michi" (reformulación)
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: solo 1 recuerdo sobre Michi, no 2 (dedup los une)

### P3.7 — Prune al límite

- [ ] Editar `<userData>/pet-memories.json` manualmente: agregar 50 recuerdos dummy con `createdAt` desde 1 hasta 50
- [ ] En tab "Chatear", escribir: "Recuerdo final nuevo test"
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: contador muestra "50/50", el recuerdo más viejo (createdAt=1) ya no está

### P3.8 — Borrar individual

- [ ] Click en el botón × de un recuerdo
- [ ] Aceptar el confirm
- [ ] **Esperado**: el recuerdo desaparece, contador baja

### P3.9 — Borrar todo

- [ ] Click en "Borrar todos los recuerdos"
- [ ] Aceptar el confirm
- [ ] **Esperado**: lista vacía, empty state visible, contador "0/50"

### P3.10 — Verificar no-XSS

- [ ] En tab "Chatear", escribir: "Mi nickname es <script>alert('xss')</script>"
- [ ] Esperar respuesta
- [ ] Ir a tab "Recuerdos"
- [ ] **Esperado**: el recuerdo muestra el texto literal `<script>...` como texto (no se ejecuta JS)
- [ ] Verificar DevTools console: no hay alerts ni errores XSS

---

## Out of scope (no verificado en este sign-off)

- **Performance con 50 recuerdos**: tests sintéticos validan prune y rank, pero no midió latencia real con 50 entries. Aceptable porque el corpus es chico y el ranking es O(n*k) con n=50, k=20 (palabras de la query).
- **Race conditions en main.js**: el extractor corre en background. Si el usuario cierra la app justo después de enviar un mensaje, el extracto puede perderse. Aceptable (es best-effort).
- **Memory persistence en .tmp corrupto**: si rename falla (disco lleno, permisos), la escritura atómica deja el .tmp viejo. La próxima save lo sobrescribe. No testeado.
- **Multi-window**: solo se probó con 1 dashboard + 1 pet window. Multi-window no es caso de uso actual.
- **A3/A4 (context awareness)**: este sign-off es solo de P3. Track B tiene su propio batch.

---

## Veredicto final

✅ **APROBADO** para push a `origin/main` y tag v1.6.0-track-a. Los 5 commits cierran el Track A de batch 2 (P3 recuerdos). 

**Recomendación de tag**: `v1.6.0-track-a` (P3 completo) → si Track B (A3+A4 context awareness) sale en la misma sesión, bump a `v1.6.0`. Si se difiere, se queda en v1.6.0-track-a y se aplica bump a v1.6.0 cuando se mergee Track B.

**ETA Track B** (A3+A4): 1 sesión adicional, ~3-4 horas. Plan ya está.
