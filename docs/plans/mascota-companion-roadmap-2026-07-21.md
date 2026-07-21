# Plan: mascota-companion-roadmap

**Fecha**: 2026-07-21
**Autor**: Mavis (sesión root, modo orquestador)
**Status**: propuesta — pendiente aprobación del usuario
**Target**: mascotaVirtual v1.3.0 → v2.0.0
**Skill SDLC**: este documento es un **plan estratégico** (no un feature-PR). Los features individuales que salgan de acá se procesan con `/sdlc-plan "<feature>"` cuando se arranquen.

---

## 1. Resumen ejecutivo

La mascota virtual v1.2.2 está **sólida en cimientos**: parser IA robusto, físicas de movimiento, SDLC estricto, 2 mascotas con personalidad, audio sintetizado, 5 suites de tests. Lo que tiene es **una mascota que se mueve bien y habla cuando le hablan**.

Lo que le falta para ser **acompañante de trabajo** de verdad es:
- **Vida interna** (mood persistente, decays, necesidades)
- **Reactividad al contexto** (qué app, qué hora, inactividad, lock screen)
- **Micro-presencia** (respiración, eye tracking, pupil dilation, modulación de voz)
- **Capa de productividad** (Pomodoro adaptativo, quick capture, calendar awareness)
- **Personalidad evolutiva** (XP, recuerdos, items)

Esto NO es rehacer, es **profundizar sobre lo que ya hay**. El plan propone 4 batches SDLC ejecutables en paralelo por feature (1 orquestador + N workers), para llegar a v2.0 (acompañante completo) en ~4 sprints sin reescribir nada.

---

## 2. Status actual (auditoría rápida)

### 2.1 Lo que está maduro ✅
| Área | Implementación |
|---|---|
| Movement | `src/core/pet-motion.js` con física pura testeable + 6 intents IA |
| AI parser | `src/core/pet-protocol.js` — JSON + tags viejos + thinking + fallbacks |
| AI client | `src/services/ai.js` — MiniMax M3, 2 system prompts (Luna/Max), timeout, retry mental |
| Audio | `src/services/pet-audio.js` — 5 sonidos sintetizados en runtime (meow/purr/bark/whine/sniff) |
| IPC | `main.js` — 11 handlers, todos con `isKnownSender()` |
| Seguridad | `safeStorage` para API key, `contextIsolation+sandbox`, validación allow-list en normalizers |
| Tests | 5 suites (`ai`, `ai-contract`, `pet-motion`, `pet-protocol`, `sdlc`) |
| SDLC | `sdlc:strict`, `sdlc:status`, `sdlc:next`, gates automatizados con cmd.exe shim |
| UX core | Drag con gravedad, cursor tracking, dashboard tabbed (Pomodoro · Chat · Settings) |

### 2.2 Lo que ya está en backlog documentado 🔄
De los deliverables previos (v1.1.0):
- **Capa 2** mood persistente (happy/calm/sleepy/sad/bored/neutral con decay)
- **Capa 2** memoria local de patrones del usuario
- **Capa 3** autonomía real (IA decide acciones cada 5-10 min sin chat)
- **Capa 3** empaquetado con `electron-builder`
- Refactor `executePetBehavior` para testearlo
- Modularizar `ALLOWED_*` a `pet-protocol.js` (ya hay duplicación con `pet-motion.js`)

### 2.3 Lo que NO existe todavía (gap real) ❌
- ❌ Mood state interno (la mascota no "siente" nada entre interacciones)
- ❌ Reactividad al contexto del usuario (app activa, lock screen, idle, hora)
- ❌ Micro-animaciones idle avanzadas (respiración, eye tracking, pupil)
- ❌ TTS (la mascota no habla, solo aparece texto)
- ❌ Global shortcuts (no hay Cmd+Shift+P)
- ❌ Calendar awareness
- ❌ Recuerdos persistentes de cosas dichas
- ❌ XP/levels/items/achievements
- ❌ Pomodoro adaptativo (ahora es timer plano de 25/5)
- ❌ Quick capture de ideas
- ❌ Daily standup briefing
- ❌ Modo "deep work" detection
- ❌ Reacción a notificaciones del SO
- ❌ Multi-mascota simultánea

---

## 3. Lo que falta — categorizado

### 3.1 Micro-interacciones (capa visual, alto impacto perceptual)

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| M1 | **Respiración idle**: chest rise/fall sutil cada ~3s (loop CSS) | XS | Alto |
| M2 | **Eye tracking**: pupilas siguen el cursor dentro de un cono (sin mover cuerpo) | M | Muy alto |
| M3 | **Pupil dilation**: se dilata con luz baja / modo nocturno | XS | Medio |
| M4 | **Bostezo**: cada ~5 min en idle, lead-in a sugerencia de break | S | Alto |
| M5 | **Tail flick**: max 1 cada ~12s, desactivado en sleep | XS | Bajo |
| M6 | **Flinch on click**: pequeño recoil al recibir click (feedback háptico) | XS | Alto |
| M7 | **Sombras dinámicas**: shadow crece si está "en el aire" (drag) | S | Medio |
| M8 | **Drag dust particles**: pequeñas partículas al arrastrar (canvas) | M | Medio |
| M9 | **Reacción a music/sounds del sistema** (luna "escucha", max ladra) | M | Medio |
| M10 | **Seasonal items** (sombrerito de Halloween, bufanda en diciembre) | S | Bajo |

**Detalle clave de M2 (eye tracking)**: el renderer actual envía `update-pet-position` con `x`, pero la mascota NO rastrea al cursor con los ojos. Solo camina hacia él cuando el AI lo decide. Implementar eye tracking le da sensación de **presencia atenta** sin gastar recursos en IA.

### 3.2 Acciones nuevas (capa de comportamiento)

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| A1 | **Mood system** (5 estados internos + decay temporal) | L | Crítico |
| A2 | **Reacción a lock screen** (powerMonitor → sleep automático) | S | Alto |
| A3 | **Reacción a inactividad** (sin teclado por X min → bosteza/se aburre) | M | Alto |
| A4 | **Reacción a teclado intenso** (typing rate → modo "no molestar") | M | Alto |
| A5 | **Reacción a cambio de ventana activa** (IDE vs browser vs mail → cambia mood) | L | Alto |
| A6 | **Reacción a notificaciones del SO** (orejas alertas, mira arriba) | M | Medio |
| A7 | **Microfono activo detection** (max ladra bajito, luna "escucha") | S | Medio |
| A8 | **Modo "deep work" automático** (silencio + no molestar) | M | Alto |
| A9 | **Quick tip contextual** (cambia según app: IDE → commit, browser → focus) | M | Alto |
| A10 | **Pedir permiso antes de hablar** (notificación no-bloqueante) | S | Medio |

**Detalle clave de A1 (mood system)**: estado interno `{ energy, happiness, curiosity, hunger }` que decae con `tick()` cada minuto, se modifica con interacciones del usuario, e INFLUYE en el `intent` que la IA puede elegir. Esto convierte la mascota de "responde cuando le hablan" a "tiene estado propio".

### 3.3 Personalidad evolutiva (capa de progresión)

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| P1 | **XP por uso real** (no por hora activa — por completitud) | M | Alto |
| P2 | **Levels visuales** (cambia el aura, no el sprite — accesible) | M | Alto |
| P3 | **Recuerdos persistentes** (la IA recuerda cosas que dijiste, N=50) | M | Muy alto |
| P4 | **Mood derives personality** (luna calm por X días → personalidad "zen") | L | Alto |
| P5 | **Achievements/hitos** (100 chats, 1 semana sin pausar pomodoro, etc.) | M | Alto |
| P6 | **Item system** (hat, scarf, glasses — se ganan por achievement) | L | Medio |
| P7 | **Custom names** (llama a la mascota, ella responde al nombre) | S | Alto |
| P8 | **Birthday del adopt** (la mascota cumple "meses" contigo) | S | Medio |

**Detalle clave de P3 (recuerdos)**: el chat history actual es 6 mensajes (ventana corta). Lo que falta es una capa de **memoria larga curada**: la IA, al final de cada conversación, decide qué archivar (max 50 frases), y al iniciar nueva sesión los recibe como system context. Esto convierte a la mascota de "olvidadiza" a "te conoce".

### 3.4 Integraciones de productividad

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| I1 | **Pomodoro adaptativo** (sugiere break largo si llevas 4 focus seguidos) | M | Alto |
| I2 | **Quick capture** (atajo global → textarea flotante → mascota archiva) | M | Alto |
| I3 | **Calendar awareness** (reunión en 5min → retreat, focus mode) | L | Alto |
| I4 | **Git activity awareness** (commits recientes = happy, dirty tree = sad) | M | Medio |
| I5 | **Time tracking awareness** (sabe en qué app llevas más tiempo) | L | Medio |
| I6 | **Slack/Linear notification forwarding** (la mascota reacciona) | L | Bajo |
| I7 | **Daily standup briefing** (al abrir la app cuenta tu día) | M | Alto |
| I8 | **Resumen al final del día** (stats: 4 focus blocks, 12 chats, mood delta) | M | Alto |
| I9 | **Focus music integration** (reproduce sonidos ambientales) | M | Medio |
| I10 | **Reading mode detection** (PDF largo = luna quieta, no molesta) | M | Alto |

**Detalle clave de I3 (calendar)**: NO requiere OAuth de Google. Empieza con **calendarios locales** (.ics file en el proyecto) o **manual entry** en dashboard. OAuth es v3.

### 3.5 Productividad real (acompañante que ayuda)

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| W1 | **Modo "compañía silenciosa"** (la mascota solo aparece, sin hablar) | S | Muy alto |
| W2 | **Auto-pause en reuniones** (calendar + audio device detection) | M | Alto |
| W3 | **Reporte semanal de productividad** (correo o markdown export) | M | Alto |
| W4 | **Plantillas de Pomodoro** (50/10, 90/20, custom) | S | Medio |
| W5 | **Streak tracking** (racha de días con focus blocks) | S | Alto |
| W6 | **Mood-aware responses** (si está sleepy, recomienda break) | M | Alto |
| W7 | **Anti-procrastination nudge** (si llevas 30min en Twitter, ladra) | L | Alto |

### 3.6 Infra técnica (prereq para escalar features)

| # | Idea | Esfuerzo | Impacto |
|---|---|---|---|
| T1 | **Refactor `executePetBehavior`** (mockear Electron, hacerlo testeable) | L | Crítico |
| T2 | **Modularizar `ALLOWED_*` allow-lists** (dedupe pet-motion vs pet-protocol) | S | Alto |
| T3 | **powerMonitor hookup** (lock/unlock, suspend/resume) | S | Alto |
| T4 | **Global shortcuts** (`globalShortcut` de Electron) | S | Alto |
| T5 | **Performance profiling** (60fps verificado, requestAnimationFrame) | M | Alto |
| T6 | **Auto-update** (`electron-updater` o Squirrel) | M | Medio |
| T7 | **electron-builder** (.exe distribuible) | M | Alto (si va a público) |
| T8 | **CI con GitHub Actions** (lint + test en cada PR) | M | Alto |
| T9 | **Logging estructurado** (JSON con niveles, redact API key) | S | Medio |
| T10 | **Crash reporting local** (volcado de debug.log, no envío) | S | Medio |
| T11 | **Multi-display support test** (ya hay constrains, falta E2E) | S | Medio |
| T12 | **Single source of truth para ALLOWED_INTENTS** (módulo `pet-protocol.js`) | S | Alto |

---

## 4. Matriz de priorización

```
                    IMPACTO
              Bajo    Medio    Alto    Crítico
ESFUERZO  ┌──────────────────────────────────┐
   XS     │ M3,M5,M6│ T2,T3,T4│ M1,M4  │       │
   S      │ T9,T10  │ T11     │ M7,P7  │       │
   M      │ M10     │ I9      │ M2,M8, │ A1    │
          │         │         │ A2,A3, │       │
          │         │         │ A4,A9, │       │
          │         │         │ P1,P3, │       │
          │         │         │ P5,P7, │       │
          │         │         │ I1,I2, │       │
          │         │         │ I7,I8, │       │
          │         │         │ W1,W4, │       │
          │         │         │ W5,T5, │       │
          │         │         │ T8     │       │
   L      │ I6      │ A5,P4,  │ P6,I3, │ T1    │
          │         │ P6,I5,  │ I10,W3 │       │
          │         │ W7      │        │       │
   XL     │         │         │        │       │
          └──────────────────────────────────┘
```

**Quick wins** (alto impacto, esfuerzo ≤ S):
- M1 (respiración), M3 (pupil), M4 (bostezo), M6 (flinch)
- T2 (modularizar), T3 (powerMonitor), T4 (globalShortcut), T9 (logging)
- P7 (custom name)
- W1 (modo silencioso), W4 (plantillas pomodoro), W5 (streaks)

**Features estructurales** (alto impacto, esfuerzo M-L, prereq o game-changer):
- A1 (mood system) — **game-changer**, prerequisito de A5, A8, W6
- P3 (recuerdos) — **game-changer**, prerequisito de P4
- T1 (refactor executePetBehavior) — **prereq de todo test serio**
- M2 (eye tracking) — alto impacto perceptual, M effort

---

## 5. Plan SDLC con batches paralelos

### Principios de orquestación

1. **Una feature por PR, branch dedicado** (`feat/mood-system`, `feat/eye-tracking`)
2. **SDLC completo por feature**: PLAN → IMPLEMENT → REVIEW → QA → RELEASE → DOCS
3. **2 workers paralelos por batch** (capacidad del orquestador)
4. **Batches secuenciales por dependencia, paralelos dentro de batch**
5. **Gate "infra" rompe la cadena** — sin T1/T2/T3/T4 hechos, no se puede testear nada bien
6. **Override**: features XS-S pueden mergear con `sdlc:dev` + commit trivial (ya tienes skip-gates-for-trivial)

### Roadmap de batches

```
Sprint 1-2 (semana 1-2): BATCH 0 — INFRA FOUNDATION (paralelo + secuencial)
├── [PARALELO día 1-2]
│   ├── [YO/Worker] T9 logging estructurado       (S)
│   ├── [Worker]    T3 powerMonitor hookup        (S)
│   ├── [Worker]    T4 globalShortcut             (S)
│   └── [Worker]    T8 CI GitHub Actions           (M, infra)
├── [SECUENCIAL día 2-7]
│   └── [YO]        T1 full refactor executePetBehavior  (L, crítica)
└── [PARALELO día 7-8]
    └── [Worker]    T2 modularizar ALLOWED_* a pet-protocol.js  (S, post-T1)
        ↓ libera el pipeline para features testeables + da red de seguridad CI

Sprint 3 (semana 3-4): BATCH 1 — VIDA INTERNA + MICRO (2 paralelos)
├── [WORKER 1] feat/mood-system-capa2     [A1, W6]
│             incluye: 5 estados + decay + persistencia JSON
│                       + influence en system prompt + mood-aware responses
│             estimación: 5-7 días
│
└── [WORKER 2] feat/micro-presence        [M1, M2, M3, M4, P7]
              incluye: respiración idle + eye tracking + pupil dilation
                        + bostezo + custom name (XS quick win)
              estimación: 3-4 días
              (termina antes → arranca M6, M8 en cola)

Sprint 4-5 (semana 4-6): BATCH 2 — CONTEXTO + RECUERDOS (2 paralelos)
├── [WORKER 1] feat/recuerdos-persistentes [P3, A8]
│             incluye: extracción al final de chat + RAG lite (TF-IDF o top-N)
│                       + 100% local + redacción PII opcional
│             estimación: 5-7 días
│
└── [WORKER 2] feat/context-awareness      [A2, A3, A4, A5, A6, A7]
              incluye: powerMonitor, idle detector, typing rate, app focus
              estimación: 5-7 días

Sprint 6 (semana 6-7): BATCH 3 — PRODUCTIVIDAD (2 paralelos)
├── [WORKER 1] feat/pomodoro-adaptativo    [I1, I7, I8, W3, W4, W5]
│             incluye: stats, plantillas, streaks, daily briefing
│             estimación: 4-5 días
│
└── [WORKER 2] feat/quick-capture          [I2, T4]
              incluye: global shortcut + textarea flotante + save
              estimación: 3-4 días

Sprint 7-8 (semana 7-9): BATCH 4 — DISTRIBUCIÓN + PULIDO (1 worker + auditor)
├── feat/electron-builder                  [T7]  (.exe distribuible)
├── feat/auto-update                        [T6]  (electron-updater)
├── feat/modo-compania-silenciosa          [W1, W2]
├── feat/custom-name-and-react             [P7] ← ya en batch 1, este es el connect con TTS
├── feat/performance-pass-60fps            [T5, T11]
├── feat/security-audit                    [pre-v2.0]  (revisión pre-distribución)
└── (orquestador) sdlc strict end-to-end + tag v2.0.0
```

### Output por batch

| Batch | Versión | Features nuevas | Tests nuevos (estimado) | LOC delta |
|---|---|---|---|---|
| 0 | v1.3.0 | infra + T1 full refactor + CI | +12 | +400 |
| 1 | v1.4.0 | mood + micro + custom name | +15 | +600 |
| 2 | v1.5.0 | recuerdos + context | +18 | +800 |
| 3 | v1.6.0 | pomodoro adapt + quick capture | +12 | +700 |
| 4 | v2.0.0 | builder + auto-update + polish + security audit | +15 | +900 |

**ETA a v2.0.0**: ~8 sprints (16 semanas) si se ejecutan los 2 workers por batch sin bloqueos. La versión original era 6 sprints, pero el full refactor T1 + CI + builder + security audit suman ~4 semanas.

### Reglas de orquestación

1. **Cada worker abre su branch desde `main`** al arrancar el batch
2. **El orquestador revisa diariamente**: `git fetch --all && git log main..feat/X --oneline`
3. **Conflictos**: si 2 workers tocan `main.js`, el orquestador hace merge serializado
4. **Si worker 2 termina antes** (ej. eye-tracking termina día 3): arranca siguiente XS de la cola (M6, T11, etc.) sin esperar
5. **Rollback**: cada feature tiene un tag `v1.X.0-feat-Y-pre` antes de merge, para revertir si falla QA
6. **No se commitean features sin tests** (excepto XS triviales con `--no-verify`)

---

## 6. Criterios de salida por gate (recuerdo del SDLC)

| Gate | Criterio |
|---|---|
| 1. PLAN | Doc en `docs/plans/<feature>.md` con criterios de aceptación |
| 2. DESIGN | DOCX en `docs/deliverables/<feature>-design-<fecha>.docx` (opcional para XS) |
| 3. IMPLEMENT | Code + tests + commit en branch dedicado |
| 4. DEV | `npm run sdlc:dev` verde (sintaxis + tests + pre-commit) |
| 5. REVIEW | Adversarial review en `docs/reviews/<feature>-<fecha>.md` |
| 6. QA | Sign-off manual en `docs/qa/<feature>-<fecha>.md` |
| 7. RELEASE | `npm run sdlc:release` con bump version + tag + push |
| 8. DOCS | `/sdlc-doc finalize` → DOCX con changelog |

---

## 7. Riesgos y tradeoffs

| Riesgo | Mitigación |
|---|---|
| **T1 (refactor executePetBehavior) toca mucho** | Hacerlo en batch 0 con tests E2E primero; si >2 días, cortar a subset (solo desacoplar `safeSend`) |
| **Mood system podría sentirse "fake" si la IA no lo usa** | A1 debe incluir cambios al system prompt que expliquen al M3 cómo influye mood en intent choice |
| **Recuerdos persistentes pueden leakear datos sensibles** | P3 debe ser 100% local, redacción de PII opcional, y se borra con `npm run clear-memories` |
| **Calendar awareness requiere permisos** | Empezar con .ics file local o manual entry, OAuth solo en v3 |
| **Quick capture podría ser molesto** | Toggle on/off, default off, sin sonido |
| **Performance en features L** (eye tracking + mood + context al mismo tiempo) | T5 (60fps pass) al final del batch 4 |
| **Orquestación de 2 workers puede chocar en `main.js`** | Lockfile `docs/.orchestrator.lock` con `whoami/now`, solo 1 worker a la vez toca el main process |
| **XP/levels puede sentirse "gamificado" para algunos** | P1 default off, opt-in en settings |

---

## 8. Decisiones confirmadas (cierre 2026-07-21)

1. **Target**: **Voy a compartirla** → T6 (auto-update), T7 (electron-builder), T8 (CI) y security audit son **obligatorios** antes de v2.0.
2. **Prioridad**: **Camino conservador** → respetar el orden de batches (infra → micro/mood → context/recuerdos → productividad → polish+distribución).
3. **Recuerdos persistentes (P3)**: **Sí**, batch 2, prioridad alta. Local-only, 100% en disco del usuario.
4. **Refactor T1**: **Full refactor** en batch 0 (no subset). Cuesta más pero limpia el camino.
5. **Custom name (P7)**: **En batch 1**, dentro del track visual (XS-S effort junto a M1-M4).

### Implicaciones en el roadmap

- **T8 (CI GitHub Actions)** se mueve a **batch 0** (paralelo a T1, no bloquea nada, da red de seguridad).
- **T6, T7, security audit** se mueven a **batch 4** (pre-v2.0).
- **ETA recalculado**: 5 batches × ~2 semanas = **~10 semanas a v2.0 distribuible** (un poco más largo que la estimación original de 6, porque T1 full refactor + CI + builder suman trabajo).
- **Batch 0 más pesado**: 6 features en vez de 4. Mitigación: 3 se pueden paralelizar (T3, T4, T8) y 2 (T9, T2) son S; solo T1 es L.

---

## 9. Próximo paso

**Orden de ejecución propuesto para batch 0** (sujeto a tu OK):

```
Día 1-2 (paralelo):
  ├─ [YO]     T9 logging estructurado        (S, base para T1)
  ├─ [WORKER] T3 powerMonitor hookup          (S, no toca main.js)
  ├─ [WORKER] T4 globalShortcut              (S, no toca main.js)
  └─ [WORKER] T8 CI GitHub Actions            (M, infraestructura)

Día 2-7 (secuencial, supervisado):
  └─ [YO]     T1 full refactor executePetBehavior  (L, crítica)
              └─ desacopla Electron
              └─ extrae pure functions
              └─ tests E2E con mocks

Día 7-8 (cleanup, paralelo):
  └─ [WORKER] T2 modularizar ALLOWED_* a pet-protocol.js  (S, post-T1)
```

**Para arrancar**, opciones:
- (A) Empezar hoy: yo arranco T9 + delego T3/T4/T8 a workers en paralelo
- (B) Esperar a que termines algo y volver con refresh
- (C) Cambiar alguna pieza del plan

---

## 10. Changelog de este plan

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-07-21 | Creación inicial — auditoría + roadmap 4 batches | Mavis |
| 2026-07-21 | Cierre de 5 decisiones (target=compartir, conservador, recuerdos sí, full refactor, name batch 1). T8 movido a batch 0, T6/T7/security audit a batch 4, ETA recalculado a ~10 semanas | Mavis |
