---
id: mascota-con-vida
status: approved
created: 2026-07-27
size: M
files:
  - src/core/pet-animations.js
  - src/core/pet-protocol.js
  - src/assets/cat.js
  - src/assets/dog.js
  - src/renderer.js
  - src/styles.css
  - test/pet-animations.test.js
  - test/pet-protocol.test.js
  - AGENTS.md
acceptance:
  - "M1: 18 SVGs nuevos (4 frames de walk + sit, lay y stretch para cat y dog) y el allow-list de pet-protocol acepta las nuevas actions sit, lay y stretch con los intents rest_sit, rest_lay y rest_stretch"
  - "M2: el renderer recorre los walk frames multi-frame a ~6fps con cross-fade suave entre states y un state machine con transiciones validas e invalidas controladas"
  - "M3: el look-at-cursor rota la cabeza hacia el cursor cuando esta cerca"
  - "M4: el mood afecta el movimiento de forma gradual (lerp en la velocidad y amplitud del tail wag)"
  - "M5: squash and stretch en el walk con polish del landing bounce"
  - "M6: tests del state machine y del performance budget, changelog y AGENTS.md actualizado"
  - "Success criteria: 6 estados visuales (idle, walking, sleeping, sitting, laying, stretching), parpadeo cada 3-5s, rAF por debajo de 16ms/frame en idle, npm run sdlc:dev y npm run smoke verdes, cero regresiones en pomodoro, quick chat y dashboard"
risks:
  - "Perf regression en el rAF: benchmark antes y despues manteniendo menos de 16ms por frame"
  - "SVG bloat por encima de 20KB por frame: viewBox y paths minificados, gzip en build"
  - "Cuteness regression: review iterativo con gate visual por milestone"
  - "Incompatibilidad con pet-protocol: extender las allow-lists sin romper el contrato"
  - "Asset generation falla porque M3 no da calidad: plan B de SVG hand-coded con paths simples"
---

# Mascota con Vida — Visuals + Movement Upgrade

**Status:** Draft (Gate 1 — PLAN)
**Date:** 2026-07-27
**Target version:** v2.1.0
**Branch:** `feat/mascota-con-vida`
**Author:** Mavis (orchestrator) + HOSNE (user)
**Related:** AGENTS.md SDLC gates, `docs/sdlc/PHASES.md`

---

## 1. Goal

Mejorar la mascota de escritorio agregando **más vida y personalidad**:
- walk cycle multi-frame (en vez del único frame profile actual)
- nuevos states visuales (sit, lay, stretch)
- look-at-cursor con cabeza rotando (hoy solo los ojos siguen)
- mood affecting motion gradual (lerp, no binario)
- squash & stretch pulido en walk

**Constraint duro:** 100% compatible con el código actual (perf, pet-protocol allow-lists, IA M3, quick chat, dashboard). NO vamos a regenerar los SVGs existentes — son buenos. Solo AGREGAMOS los que faltan.

## 2. Scope

### Contexto importante (post-discovery)

**Lo que YA EXISTE y NO hay que rehacer:**
- 3 SVGs por mascota: `idle`, `walk`, `sleep` (en `src/assets/cat.js` y `dog.js`)
- Eye tracking en pupilas (`pet-pupil` con `data-anchor-x/y`)
- Blink animation (`anim-blink` group)
- Ear twitch (`pet-ear-left/right` con `transform-origin`)
- Breath animation (`anim-breath` group)
- CSS keyframes para `zzz` (sleeping particles), `happy-bounce`, `landing-bounce`
- rAF loop con tail wag procedural
- zzz container en `index.html`

**Lo que FALTA y SÍ hay que hacer:**
- **Walk cycle multi-frame** (4 frames en profile, manteniendo el look actual)
- **Nuevos states visuales**: sit, lay, stretch (en profile para cat, en side para dog)
- **Multi-frame renderer**: cycle through walk frames a ~6fps
- **Smooth state transitions**: cross-fade entre states (no swap directo)
- **Look-at-cursor cabeza**: wrap head group, rotate leve hacia el cursor
- **Mood affecting motion gradual**: lerp en tail wag speed, velocity, etc.
- **Squash & stretch**: scale Y en walk step
- **pet-protocol extendido**: agregar `sit`, `lay`, `stretch` a ALLOWED_ACTIONS

### In scope (M1-M6)

- **M1**: Multi-frame walk (4 frames × 2 mascotas) + nuevos states (sit, lay, stretch × 2 mascotas) = 14 SVGs nuevos
- **M2**: Multi-frame renderer + smooth state transitions
- **M3**: Look-at-cursor con cabeza rotando
- **M4**: Mood affecting motion gradual (lerp)
- **M5**: Squash & stretch en walk + polish
- **M6**: Tests + docs + changelog

### Out of scope (futuras versiones)
- **Fase 3**: Modelo local (`node-llama-cpp` + Qwen2.5-1.5B Q4)
- **Fase 4**: Autonomía real desde modelo (loop observa → decide → actúa)
- Cambios en dashboard, quick chat, settings, sonidos
- Cambios en arquitectura de IA (sigue M3-only)
- Sprites PNG / pixel art — seguimos con SVG vectorial
- Refactor de los SVGs actuales (están bien como están)

## 3. Architecture

### 3.1 Asset system

**No vamos a crear un directorio nuevo.** Los SVGs se agregan al final de `src/assets/cat.js` y `src/assets/dog.js` (siguiendo el patrón actual de `const catIdleSVG = ...`). Esto evita tocar el sistema de load (`<script src="assets/cat.js">`) y mantiene CSP intacto.

**SVGs nuevos a agregar (14 total):**
- `catWalk1SVG`, `catWalk2SVG`, `catWalk3SVG`, `catWalk4SVG` (4 frames walk cycle, profile)
- `catSitSVG`, `catSitBlinkSVG` (sit + sit-blink)
- `catLaySVG`, `catLayBreatheSVG` (lay + lay-breathe)
- `catStretchSVG` (1 frame, animación vía CSS)
- Idem para dog (4 + 4 + 1 = 9 nuevos)
- **Total: 18 SVGs nuevos** (4 walk + 4 sit/lay/stretch + sus 2 frames c/u)

**Loading pattern:**
- Mismo patrón actual: `const catWalk1SVG = \`...\`;`
- Renderer los expone via `window.catWalk1SVG` etc.
- Multi-frame array: `window.catWalkFrames = [catWalk1SVG, catWalk2SVG, catWalk3SVG, catWalk4SVG]`

**Asset generation strategy:**
- **Hand-coded** — basándome en los SVGs actuales como referencia (mismo viewBox 200x200, mismas gradients, mismos colores)
- Mantener consistencia con la paleta actual:
  - Cat: skin `#ffd8a8` → `#ff922b`, ear `#ffdeeb` → `#faa2c1`, stripes `#d9480f`
  - Dog: skin `#ffd43b` → `#e67e22`, patches `#d35400` → `#a04000`, collar `#e74c3c` → `#c0392b`
- Validar visualmente: el user abre la app y me da feedback
- **M3 NO usado**: el provider requiere auth que no está configurada (`authMode: managed-login`, `apiKey: sk-xxx` placeholder). Hago todo hand-coded.

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
| M1 | 18 SVGs nuevos: 4 walk + 4 sit/lay/stretch × 2 pets + pet-protocol update | 2 días | Visual review por user |
| M2 | Multi-frame renderer: cycle walk frames a ~6fps + cross-fade entre states | 0.5 día | DEV pass + visual |
| M3 | Look-at-cursor con cabeza rotando levemente hacia el cursor | 0.5 día | DEV + manual QA |
| M4 | Mood affecting motion gradual (lerp en tail wag + velocity) | 0.5 día | DEV + manual QA |
| M5 | Squash & stretch en walk + polish de landing bounce | 0.5 día | DEV + perf benchmark |
| M6 | Tests (state machine, perf), changelog, AGENTS.md update | 0.5 día | All gates |

**Total est.:** 4-5 días de trabajo (con iteraciones de review)

**Pacing recomendado:**
- M1 es el más grande (visual). Iteramos con vos: primero los 4 walk frames de cat, después sigo con el resto si te gusta.
- M2-M5 son código, no se ven tan rápido, los hago en bloque.
- M6 al final.

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
