# Plan: batch-2-contexto-recuerdos

**Fecha**: 2026-07-21
**Versión target**: v1.6.0 (2 tracks mergeados en una sola minor)
**Sprint**: 4-5 (semanas 4-6)
**Depende de**: batch 1 (A1 mood system, A2 powerMonitor — ambos done)
**Habilita**: batch 3 (productividad) y P4 (mood derives personality)

---

## 1. Objetivo

Dos capacidades nuevas que cierran la transición de "mascota que responde" a "acompañante que te conoce":

1. **P3 — Recuerdos persistentes**: la IA recuerda cosas importantes entre sesiones (N=50). Al iniciar chat, los recuerdos relevantes se inyectan al system prompt (RAG lite con TF-IDF). Esto convierte a la mascota de "olvidadiza" a "te conoce".

2. **A3 + A4 — Context awareness reactivo**: la mascota detecta inactividad del usuario (idle sin input) y typing rate alto, reaccionando con cambios sutiles (mood decay acelerado, modo "no molestar"). Esto agrega reactividad sin gastar API calls.

Decisiones:
- **A2 (powerMonitor)** ya está hecho en batch 0 — no se rehace.
- **A5 (cambio de ventana activa)** requiere permisos macOS/Windows → defer a batch 3.
- **A6 (notificaciones SO)** requiere permisos → defer a batch 3.
- **A7 (mic detection)** requiere WebRTC + permisos → defer a batch 3 o batch 4.
- **A8 (modo deep work)** se implementa como side-effect de A3 + A4 (sin feature nueva).

---

## 2. Features del batch (2 tracks paralelos)

### Track A — P3 Recuerdos persistentes (Worker 1) [M, 5-7 días]

**Alcance**:
- 50 recuerdos máximo, persistidos en `<userData>/pet-memories.json`
- Cada mensaje de chat del usuario pasa por un "memory extractor" (la IA genera 0-1 recuerdos por mensaje, max 1 por turno)
- Al iniciar nueva conversación, los recuerdos se rankean por relevance (TF-IDF contra el primer mensaje del usuario) y se inyectan al system prompt (top 5)
- Redacción PII opcional (toggle en Settings): emails, phones, tarjetas → `[REDACTED]`
- API: `pet-memories:list`, `pet-memories:add`, `pet-memories:clear`, `pet-memories:redact-toggle`

**Archivos nuevos**:
- `src/core/pet-memories.js` — pure functions (rankByRelevance, extractPII, dedup, format)
- `src/services/memories-store.js` — persistencia JSON (similar a mood-store.js)
- `src/services/memory-extractor.js` — orquesta la llamada IA para extraer (en main, no renderer)
- `test/pet-memories.test.js` — 25-30 tests (rank, dedup, PII redaction, format, persistence)
- `test/memories-store.test.js` — 10-15 tests (CRUD, límite N, atomic write)

**Archivos modificados**:
- `main.js` — wire memories load/save, hook en `ai:send-message` para inyectar memories + extraer
- `src/services/ai.js` — system prompt builder agrega bloque "## Recuerdos relevantes"
- `preload.js` — expone `memories:list`, `memories:clear`, `memories:redact-toggle`
- `src/dashboard.html` + `src/dashboard-renderer.js` — tab nueva "Recuerdos" con lista + botón clear + toggle PII
- `src/styles.css` — estilos de la lista de recuerdos

**Criterios de aceptación**:
- [ ] Chat "mi nombre es Jorge" → memoria "El usuario se llama Jorge" aparece en la lista
- [ ] Nueva sesión: el system prompt contiene los recuerdos relevantes
- [ ] TF-IDF rankea correctamente (test con dataset sintético)
- [ ] Toggle PII redacta emails en storage y en system prompt
- [ ] `npm run clear-memories` (o botón dashboard) borra todo
- [ ] Tests cubren: rank, dedup, PII redaction, persistence, overflow (>50)
- [ ] Sin PII leakage en logs (logger redacta automáticamente — ya lo hace en v1.3.0)

### Track B — A3 + A4 Context awareness (Worker 2) [S+S, 3-4 días]

**Alcance**:
- **A3 Idle detector**: sin input de mouse/teclado por X minutos (configurable, default 10) → trigger mood boost (boost `bored` probability via decay más agresivo) y muestra tip contextual "llevas X min sin actividad, ¿un break?"
- **A4 Typing rate monitor**: si typing rate > 80 WPM por 2+ min → modo "no molestar" (mascota más quieta, sin autonomous tips)

**Archivos nuevos**:
- `src/core/context-awareness.js` — pure functions (computeIdleMs, computeTypingRate, shouldSuggestBreak)
- `src/services/input-monitor.js` — trackea lastInput, buffer de typing events
- `test/context-awareness.test.js` — 15-20 tests (idle thresholds, typing rate windows, edge cases)

**Archivos modificados**:
- `main.js` — wire input listeners (mouse, keyboard via BrowserWindow events)
- `src/renderer.js` — wire `showSpeech` para tips de break
- `preload.js` — expone eventos de context al renderer (input:idle, input:busy)

**Criterios de aceptación**:
- [ ] Sin mover mouse 10 min → mascota muestra tip "llevas 10 min sin actividad, ¿un break?"
- [ ] Typing rate > 80 WPM por 2 min → autonomous tips se silencian
- [ ] Tests cubren umbrales, ventanas de tiempo, recovery (input vuelve → reset)
- [ ] Sin PII en el buffer de typing (solo se cuenta rate, no se guarda contenido)

---

## 3. Orquestación con worktrees

Lección batch 0: workers en mismo cwd se pisaron en main.js. Lección batch 1: workers con `run_in_background` no son confiables para M/L features. Solución batch 2: **worktrees + workers en foreground, monitoreados por orquestador**.

### Setup (orquestador)

```bash
node scripts/sdlc-worktree.js add feat/b2-memories
node scripts/sdlc-worktree.js add feat/b2-context
```

Resultado:
- `../mascotaVirtual-feat-b2-memories/` (branch feat/b2-memories)
- `../mascotaVirtual-feat-b2-context/` (branch feat/b2-context)

### Workers

Cada worker opera en su worktree. NO hace `git checkout` ni `git stash`. Commitea en su branch y pushea.

Para features M/L (P3 y A3+A4), **el orquestador hace el trabajo** (no delega a sub-agentes). El worker agent solo hace tareas de tamaño S (escribir tests, refactor chico, etc).

### Orquestador

- Monitorea: `git fetch --all && git log origin/feat/b2-memories --oneline`
- Merge serializado: cuando worker 1 termina, merge a main → release v1.6.0-track-a. Después worker 2 → v1.6.0-track-b. O merge ambos al final (probable porque tocan archivos distintos).
- Conflictos esperados: solo en `main.js`, `preload.js`, `src/dashboard.html` (todos los tracks los tocan). Merge manual si pasa.

---

## 4. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| **P3 puede leakear PII** (chat personal, emails, etc) | Redacción PII automática (regex para emails/phones/tarjetas). Toggle off por default, opt-in. Tests con corpus de PII sintético. |
| **RAG con TF-IDF puede rankear mal** | Tests con dataset sintético. Fallback: si TF-IDF falla, usar top-N por recencia. |
| **A3/A4 pueden disparar tips molestos** | Thresholds generosos (10 min idle, 80 WPM). Cooldown de 5 min entre tips. Toggle off en Settings. |
| **Buffer de typing consume memoria** | Solo contar rate (rolling window 30s). No guardar contenido. Cap a 1000 events. |
| **A2 powerMonitor ya hecho** | A3/A4 se integran via event emitter, no duplican código. |
| **main.js conflicts** | Aceptable: cada feature es un bloque pequeño, merge manual de 3-5 líneas. |

---

## 5. Métricas de éxito

- [ ] P3: 30+ tests verdes, demo manual "la mascota me recuerda entre sesiones"
- [ ] A3/A4: 15+ tests verdes, demo manual "idle 10 min → tip aparece"
- [ ] `npm run sdlc:dev` verde, `sdlc:strict` APPROVED
- [ ] No PII leakage en logs (verificado con grep)
- [ ] Changelog v1.6.0 con ambas features
- [ ] Working tree clean, tag v1.6.0 en origin
- [ ] Review adversarial con 0 MUST-FIX
- [ ] QA sign-off con smoke test pasando

ETA: 5-7 días (1 sprint completo). Asume que ambos tracks avanzan en paralelo con worktrees.

---

## 6. Out of scope (batch 3+)

- A5 (window focus): requiere permisos macOS/Windows
- A6 (notifications): requiere permisos
- A7 (mic detection): requiere WebRTC + permisos
- A8 (deep work mode): side-effect de A3+A4, no necesita feature nueva
- I1 (pomodoro adaptativo): batch 3
- I2 (quick capture): batch 3
- W3 (reporte semanal): batch 3
- Calendar awareness: batch 3 con .ics local

---

## 7. Decisiones de diseño (a confirmar antes de implementar)

1. **TF-IDF vs top-N recencia**: empezar con TF-IDF (más inteligente, mismo costo). Fallback a recencia si TF-IDF no encuentra nada relevante.
2. **Extracción de recuerdos por turno vs por fin de chat**: por turno (más reactivo, más API calls) vs por fin (más eficiente, más delay). Elegir **por turno** (1 memory max por mensaje del user) para feedback inmediato.
3. **PII redaction regex**: cubrir emails, phones (formato internacional), tarjetas (16 dígitos), SSN. NO cubrir nombres propios (demasiado falso positivo). Documentar lo que NO redacta.
4. **Tab "Recuerdos" en dashboard**: lista de los 50 con fecha, botón "borrar individual" y "borrar todo", toggle PII. Ocultar si está vacía.
5. **Typing rate threshold**: 80 WPM es alto pero no extremo. 60 WPM es promedio de tipeo rápido. 80 da margen sin molestar.
6. **Idle threshold**: 10 min es mucho. ¿5 min? Empezar con 10 (configurable), bajar en batch 3 si el user feedback indica.
