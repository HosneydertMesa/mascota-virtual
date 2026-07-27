# Mascota con Vida — Visuals + Movement Upgrade

**Status:** Draft (Gate 1 — PLAN)
**Date:** 2026-07-27
**Target version:** v2.1.0
**Branch:** `feat/mascota-con-vida`
**Author:** Mavis (orchestrator) + HOSNE (user)
**Related:** AGENTS.md SDLC gates, `docs/sdlc/PHASES.md`

---

## 1. Goal

Convertir la mascota de escritorio de **"SVG estático con swap"** a **"mascota que se siente viva"**:
- más estados visuales (walk multi-frame, sit, lay, stretch)
- micro-animaciones (parpadeo, twitch, look-at-cursor)
- personalidad en el movimiento (mood affecting motion, squash & stretch)

**Constraint duro:** 100% compatible con el código actual (perf, pet-protocol allow-lists, IA M3, quick chat, dashboard).

## 2. Scope

### In scope
- **Assets nuevos**: SVGs multi-frame para cat y dog
  - `idle` (2 frames: idle + idle-blink)
  - `walking` (4 frames × 2 direcciones)
  - `sleeping` (2 frames: sleep + sleep-deep)
  - `sitting` (2 frames: sit + sit-blink)
  - `laying` (2 frames: lay + lay-breathe)
  - `stretching` (1 frame, animación vía CSS)
- **Micro-animaciones en rAF loop**:
  - Parpadeo cada 3-5s (seed random para no parecer robótico)
  - Look-at-cursor: pupilas siguen al cursor cuando está cerca (< 200px)
  - Twitch de orejas cada 8-15s
- **Squash & stretch**: scale Y en step del walk cycle
- **Mood affecting motion**:
  - `sad` → velocidad 0.6x, tail wag 0.3x, body slump
  - `excited` → velocidad 1.2x, tail wag 1.5x, bouncy
  - `calm` → velocidad 0.8x, tail wag 0.7x
  - `sleepy` → speed 0.5x y a los 30s → sleep state
- **Nuevos states en pet-protocol**: `sit`, `lay`, `stretch` (allow-list extendida)

### Out of scope (futuras versiones)
- **Fase 3**: Modelo local (`node-llama-cpp` + Qwen2.5-1.5B Q4)
- **Fase 4**: Autonomía real desde modelo (loop observa → decide → actúa)
- Cambios en dashboard, quick chat, settings, sonidos
- Cambios en arquitectura de IA (sigue M3-only)
- Sprites PNG / pixel art — seguimos con SVG vectorial

## 3. Architecture

### 3.1 Asset system

**Location:** `src/assets/pet-svgs/`

```
src/assets/pet-svgs/
├── cat/
│   ├── cat-idle-1.svg
│   ├── cat-idle-2.svg          # blink
│   ├── cat-walk-1.svg ... 4
│   ├── cat-sleep-1.svg
│   ├── cat-sleep-2.svg
│   ├── cat-sit-1.svg
│   ├── cat-sit-2.svg
│   ├── cat-lay-1.svg
│   ├── cat-lay-2.svg
│   └── cat-stretch.svg
└── dog/
    └── (mismo set, 15 archivos)
```

**Loading pattern:**
- `index.html` los inyecta via `<script>` que expone `window.petAssets.cat.walk = [svg1, svg2, svg3, svg4]`
- Mantener compat: `window.catIdleSVG` se mantiene como alias del primer frame
- Hot path cache: el renderer cachea refs a los nodos críticos (tail, eyes, ears) en `cachePetElements()`

**Asset generation strategy:**
- Usar M3 vía `llm-call` skill para iterar prompts de SVG generation
- O usar SVG art hand-coded si M3 no da el nivel de detalle necesario
- Validar cada asset con un test de render visual antes de mergear

### 3.2 Animation system (NEW)

**File:** `src/core/pet-animations.js`

```js
// API pública
const PetAnimations = {
  init(petContainer, petSvgWrapper),  // wire rAF loop
  setState(newState, options?),       // state machine transition
  getCurrentState(),
  // Hooks para micro-animations
  scheduleBlink(delayMs),
  scheduleEarTwitch(delayMs),
  onCursorMove(mouseX, mouseY),       // para look-at-cursor
  onPetMove(opts),                    // squash & stretch
  destroy()
};
```

**State machine:**

```
                    play
   idle ──────────────────────► playing
     │                              │
     │ sit                          │ stop
     ▼                              ▼
   sitting ◄── lay ──── laying ◄── idle
     │                              │
     │ sleep (auto si sleepy mood)  │
     ▼                              ▼
   sleeping                        sleeping
     ▲                              ▲
     └── wake                       └── wake
```

### 3.3 Renderer integration

**File:** `src/renderer.js` (UPDATE)

- Reemplazar `setVisualState(state, direction, force)` con `PetAnimations.setState(state, { direction, mood })`
- Mantener `loadMascotSVG()` interno pero extendido a multi-frame
- El rAF loop principal (que ya existe para tail wag) ahora también:
  - Avanza frame de walk cycle
  - Aplica look-at-cursor
  - Dispara micro-animations cuando toca
  - Aplica squash & stretch en base a velocity

### 3.4 CSS additions

**File:** `src/styles.css` (UPDATE)

- `@keyframes blink` (eye scale Y 1 → 0.1 → 1 en 150ms)
- `@keyframes breathe` (body scale 1 → 1.02 → 1 en 4s loop)
- `@keyframes stretch` (cuerpo se estira y contrae, 1.2s)
- `@keyframes twitch` (oreja rota -10deg, 200ms)
- `transition: opacity 200ms` para state changes
- `transform: scaleY()` para squash & stretch

### 3.5 Pet-protocol extension

**File:** `src/core/pet-protocol.js` (UPDATE)

```js
ALLOWED_ACTIONS = new Set([
  'none', 'jump', 'sleep', 'wag', 'walk',
  'sit',    // NEW
  'lay',    // NEW
  'stretch' // NEW
]);

ALLOWED_INTENTS = new Set([
  'none', 'greet', 'play', 'rest', 'work',
  'observe', 'celebrate', 'warn', 'comfort',
  'rest_sit',     // NEW
  'rest_lay',     // NEW
  'rest_stretch'  // NEW
]);
```

## 4. Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Perf regression en rAF | High | Medium | Benchmark antes/después, mantener <16ms/frame |
| SVG bloat (>20KB/frame) | Medium | Medium | ViewBox + minified paths, gzip en build |
| "Cuteness regression" | High | High | Iterative review: gate visual por milestone |
| Incompat con pet-protocol | Medium | Low | Extender allow-lists, no romper contrato |
| DPI / scaling issues | Low | Low | SVG vector, test en 1080p y 4K |
| Memory leak en micro-anim schedulers | Medium | Low | Cleanup en `PetAnimations.destroy()` |
| Asset generation falla (M3 no da calidad) | High | Medium | Plan B: SVG hand-coded con paths simples |

## 5. Test plan

- **Unit tests** (`test/pet-animations.test.js`):
  - State transitions válidas e inválidas
  - Frame index advances correctly with state
  - Micro-anim scheduler cancels on destroy
- **Compat tests** (`test/pet-protocol.test.js` si existe):
  - Nuevos actions/intents son aceptados
  - Viejos actions siguen funcionando
- **Visual regression**:
  - Screenshots antes/después de cada milestone
  - Side-by-side en `docs/reviews/mascota-con-vida/`
- **Performance test**:
  - Medir rAF delta-time con `performance.now()`
  - Assert < 16ms en estado idle, < 20ms en walking
- **Smoke test**:
  - `npm run smoke` debe pasar
- **Manual QA**:
  - Lanzar app, verificar cada state
  - Verificar look-at-cursor moviendo el mouse
  - Verificar parpadeo durante 30s+

## 6. Milestones

| M | Deliverable | Est. effort | Gate |
|---|-------------|-------------|------|
| M1 | Asset generation (15 SVGs × 2 pets = 30 archivos) | 2-3 iteraciones con M3 | Visual review |
| M2 | Multi-frame renderer (frame cycling, state machine) | 1 día | DEV pass |
| M3 | Micro-animations (blink, twitch, look-at-cursor) | 1 día | DEV + manual QA |
| M4 | Squash & stretch + new states (sit, lay, stretch) | 1 día | DEV + visual review |
| M5 | Mood affecting motion | 0.5 día | DEV + manual QA |
| M6 | Polish, perf benchmark, docs, changelog | 0.5 día | All gates |

**Total est.:** 4-5 días de trabajo (con iteraciones de review)

## 7. Dependencies

### Required
- **M3 (cloud)** vía `llm-call` skill — para iterar SVG asset generation
- `node-llama-cpp` — NO, eso es Fase 3
- No new npm deps para esta fase

### Tools
- `npm run sdlc:dev` — para gate DEV
- `npm run sdlc:review` — para gate REVIEW
- `npm run smoke` — para smoke test
- `git worktree` — N/A (trabajo solo, no paralelo)

## 8. SDLC gates checklist

- [x] **Gate 1 — PLAN** (este doc, en review)
- [ ] **Gate 2 — DESIGN** (design doc + screenshots después de M1)
- [ ] **Gate 3 — IMPLEMENT** (M1 → M6)
- [ ] **Gate 4 — DEV** (`npm run sdlc:dev` debe pasar)
- [ ] **Gate 5 — REVIEW** (adversarial review con screenshots)
- [ ] **Gate 6 — QA** (smoke + manual + visual)
- [ ] **Gate 7 — RELEASE** (v2.1.0 bump + tag + push)
- [ ] **Gate 8 — DOCS** (changelog actualizado + AGENTS.md refresh)

## 9. Decisions made (2026-07-27)

1. ✅ **Asset generation**: **Híbrido** — M3 define style guide y concept art, yo hand-codeo los SVGs. Balance velocidad/control.
2. ✅ **Look-at-cursor**: **Ojos + cabeza** — la cabeza rota levemente hacia el cursor cuando está cerca. Más expresivo, asume el riesgo de complejidad en la animación de la cabeza.
3. ✅ **Mood affecting motion**: **Gradual (lerp)** — transiciones suaves entre velocidades. Más natural, requiere más código.
4. ✅ **Stretch state**: **Solo por decisión de la IA** — el estado `stretch` queda en el protocol pero NO se triggerea automáticamente al despertar. La IA (M3) decide cuándo. Esto simplifica la lógica de transición de states.
5. ✅ **Performance budget**: **60fps (16ms/frame)** — ya está optimizado (ver `cachePetElements` en renderer.js), 16ms es alcanzable.

## 10. Rollback plan

Si M3 o M4 falla review:
- Los cambios se quedan en `feat/mascota-con-vida`
- Se puede mergear solo M1+M2 (assets + multi-frame) sin micro-animations
- O revertir completamente con `git reset --hard origin/main`

Si perf regressiona:
- M5 (mood affecting motion) se puede omitir — es "nice to have", no core
- M4 squash & stretch se puede desactivar con feature flag

## 11. Success criteria

- [ ] Mascota tiene 6 estados visuales (idle, walking, sleeping, sitting, laying, stretching)
- [ ] Parpadeo ocurre cada 3-5s sin parecer robótico
- [ ] Look-at-cursor funciona con cursor cerca
- [ ] Mood afecta velocidad y energía de la mascota
- [ ] rAF timing < 16ms/frame en idle
- [ ] `npm run sdlc:dev` pasa
- [ ] `npm run smoke` pasa
- [ ] Cero regresiones en features existentes (pomodoro, quick chat, dashboard)
- [ ] Changelog actualizado
- [ ] AGENTS.md actualizado con nueva asset location
