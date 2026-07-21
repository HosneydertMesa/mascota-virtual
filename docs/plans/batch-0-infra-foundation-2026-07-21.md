# Plan: batch-0-infra-foundation

**Fecha**: 2026-07-21
**Versión target**: v1.3.0
**Sprint**: 1-2 (semanas 1-2)
**Depende de**: nada (es el primer batch)
**Habilita**: batch 1 (mood + micro), batch 2 (recuerdos + context)

---

## 1. Objetivo

Establecer la base técnica para que features testeables (mood, recuerdos, context awareness) se puedan construir sin deuda. El corazón es **T1 full refactor** que desacopla `executePetBehavior` de Electron. Sin esto, no podemos testear el comportamiento de la IA de verdad (solo el parser y la física).

Output adicional: **CI verde desde el día 1** (T8) que valida cada PR automáticamente, evitando regresiones futuras.

---

## 2. Features del batch

| ID | Feature | Esfuerzo | Owner sugerido | Branch |
|---|---|---|---|---|
| T1 | Full refactor `executePetBehavior` | L (3-5 días) | Mavis (yo) | `feat/t1-refactor-behavior` |
| T2 | Modularizar `ALLOWED_*` a `pet-protocol.js` | S (1 día) | Worker 1 | `feat/t2-allowlist-shared` |
| T3 | `powerMonitor` hookup (lock/unlock/suspend/resume) | S (0.5-1 día) | Worker 2 | `feat/t3-powermonitor` |
| T4 | `globalShortcut` (Pomodoro, quick capture, mute) | S (0.5-1 día) | Worker 3 | `feat/t4-global-shortcut` |
| T8 | CI GitHub Actions (lint + test + sdlc dev) | M (1-2 días) | Worker 4 | `feat/t8-ci-github-actions` |
| T9 | Logging estructurado (JSON con niveles) | S (0.5-1 día) | Mavis (yo) — base para T1 | `feat/t9-logging` |

**Total**: 6 features, 5-7 días de calendario con paralelización correcta.

---

## 3. Orden de ejecución

### Día 1-2: Paralelo (4 workers)

| Worker | Feature | Notas |
|---|---|---|
| **Yo (Mavis)** | T9 logging | S, base para T1. Crear `src/services/logger.js` con niveles, redacción de API key, append JSON-lines. |
| **Worker 1** | T3 powerMonitor | S, no toca main.js. Usar `electron.powerMonitor` y exponer eventos a renderer via IPC. |
| **Worker 2** | T4 globalShortcut | S, no toca main.js. Registrar 3 shortcuts: `Cmd+Shift+P` (toggle pomodoro), `Cmd+Shift+S` (sleep pet), `Cmd+Shift+Q` (quick capture placeholder). |
| **Worker 3** | T8 CI | M, infra pura. Crear `.github/workflows/ci.yml` con matrix Windows/macOS/Linux, node 18+20, `npm ci && npm run check && npm test`. |

**Conflictos esperados**: T9 y T1 van juntos porque T1 necesita el logger para testear. T3, T4, T8 son independientes del main process (tienen su propio scope).

### Día 2-7: Secuencial (yo)

| Día | Actividad |
|---|---|
| Día 2 | T1 setup: identificar pure functions en `executePetBehavior`, diseñar interfaces |
| Día 3-4 | T1 implementación: extraer a `src/core/pet-behavior.js` (puro), `main.js` solo orquesta |
| Día 5 | T1 tests: mockear Electron, escribir 8-10 tests E2E de comportamiento |
| Día 6 | T1 cleanup: eliminar código duplicado, asegurar que `main.js` solo llama `executeBehavior(sanitizedAction, deps)` |
| Día 7 | T1 review + merge |

### Día 7-8: Cleanup (1 worker)

| Worker | Feature | Notas |
|---|---|---|
| **Worker 4** | T2 modularizar | S, depende de T1. Mover `ALLOWED_EMOTIONS/ACTIONS/SOUNDS/INTENTS` a `pet-protocol.js` (única fuente de verdad). `pet-motion.js` los importa. |

---

## 4. Criterios de aceptación por feature

### T1 — Full refactor `executePetBehavior`

**Criterios de aceptación**:
- [ ] `executeBehavior(sanitizedAction, deps)` es una función pura en `src/core/pet-behavior.js`
- [ ] Recibe `deps = { startMovement, chooseNewTarget, getCursorTrackingState, stopMovement, screen, isSleeping }` (inyectados)
- [ ] `main.js` solo arma `deps` y llama a `executeBehavior` — no hay lógica de decisión en main
- [ ] Mínimo 8 tests E2E cubriendo: sleep, stay, approach (lejos/cerca/encima), retreat, play, wander, no-match
- [ ] 0 cambios funcionales observables (la mascota se comporta idéntico)
- [ ] `sdlc:dev` verde

**Riesgos**:
- Si T1 excede 5 días → reducir scope: solo desacoplar `safeSend` + extraer 2-3 funciones puras. No tocar el resto.

### T2 — Modularizar `ALLOWED_*`

**Criterios de aceptación**:
- [ ] `ALLOWED_EMOTIONS/ACTIONS/SOUNDS/INTENTS` viven SOLO en `src/core/pet-protocol.js`
- [ ] `src/core/pet-motion.js` los importa desde pet-protocol (no los redeclara)
- [ ] Tests existentes siguen verdes
- [ ] `main.js` los importa solo de pet-protocol

### T3 — powerMonitor hookup

**Criterios de aceptación**:
- [ ] Cuando el OS entra en lock/suspend → `isSleeping = true` automático
- [ ] Cuando el OS vuelve de lock/suspend → `isSleeping = false` (con delay de 5s para no asustar)
- [ ] Eventos logueados con `logger.info('powermonitor:lock')`
- [ ] Test unitario: simular evento `lock-screen` y verificar transición de estado
- [ ] No rompe nada en Windows/macOS/Linux

### T4 — globalShortcut

**Criterios de aceptación**:
- [ ] `Cmd+Shift+P` (o `Ctrl+Shift+P` en Win/Linux): toggle pomodoro start/pause (envía IPC al dashboard)
- [ ] `Cmd+Shift+S`: pet goes to sleep
- [ ] `Cmd+Shift+Q`: quick capture (placeholder — feature real en batch 3)
- [ ] Si el shortcut no se puede registrar (otro app lo usa) → log warning, no crashea
- [ ] Cleanup correcto en `app.before-quit`
- [ ] Test: registrar shortcut, simular activación via Electron mock, verificar handler llamado

### T8 — CI GitHub Actions

**Criterios de aceptación**:
- [ ] `.github/workflows/ci.yml` con matrix: `os: [windows-latest, macos-latest, ubuntu-latest]`, `node: [18, 20]`
- [ ] Steps: `npm ci` → `npm run check` → `npm test` → `npm run sdlc:dev` (en strict cuando esté listo)
- [ ] Badge verde en README después de primer push
- [ ] Cache de `node_modules` configurado
- [ ] Trigger en: push a main, pull_request, manual dispatch

### T9 — Logging estructurado

**Criterios de aceptación**:
- [ ] `src/services/logger.js` con API: `logger.debug/info/warn/error(msg, meta?)`
- [ ] Output JSON-lines: `{"ts":"2026-07-21T16:18:00Z","level":"info","msg":"powermonitor:lock","meta":{}}`
- [ ] Redacción automática de campos sensibles: `apiKey`, `password`, `token`, `authorization`
- [ ] Mantiene `logDebug()` actual como wrapper deprecated (no rompe nada en main.js todavía)
- [ ] Rotación de archivo a 5MB máximo (mantiene últimos 3 archivos)
- [ ] Test: capturar output, verificar formato JSON + redacción

---

## 5. Estrategia de branching

```
main                                  # producción
  └── feat/t1-refactor-behavior       # mío, base para todo
  ├── feat/t2-allowlist-shared        # depende de T1
  ├── feat/t3-powermonitor            # independiente
  ├── feat/t4-global-shortcut         # independiente
  ├── feat/t8-ci-github-actions       # independiente
  └── feat/t9-logging                 # base para T1
```

**Reglas**:
- Cada feature en su branch dedicado
- PRs con título conventional: `feat(t1):`, `feat(t2):`, etc.
- Cada PR pasa por REVIEW adversarial antes de merge
- Merge solo con QA + sdlc:dev verdes
- Tag pre-merge: `v1.3.0-feat-T1-pre` por si hay que rollback

---

## 6. Plan de tests

### Tests nuevos (estimado, +12 total)
- `test/pet-behavior.test.js` (8-10 tests para T1)
- `test/logger.test.js` (3 tests para T9: format, redacción, rotación)
- `test/powermonitor.test.js` (2 tests para T3)
- `test/global-shortcut.test.js` (2 tests para T4)

### Cobertura esperada después del batch
- `pet-motion.js`: ya 100% (no cambia)
- `pet-protocol.js`: 100% (no cambia, pero ahora es la única fuente de verdad)
- `pet-behavior.js`: ~90% (nuevo, mockeando Electron)
- `logger.js`: ~80% (cubrir happy path + 2 edge cases)

---

## 7. Plan de rollback

Si algo del batch falla en producción:
1. `git revert` del merge (mantiene history)
2. O cherry-pick del último commit bueno a main
3. Tag `v1.2.2` sigue siendo la versión estable

Si T1 (refactor grande) causa bugs sutiles:
1. Tag pre-merge `v1.3.0-pre-t1` permite volver al estado pre-T1
2. Feature flag en `main.js`: `const USE_REFACTORED_BEHAVIOR = true` → si falla, `false` y vuelve al viejo

---

## 8. Riesgos del batch

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| T1 excede 5 días | Media | Alto | Reducir scope a subset crítico. Documentar lo no hecho como tech debt. |
| T3 powerMonitor no funciona igual en Win/Mac/Linux | Media | Medio | Test E2E en los 3 OS via CI matrix. Si falla en uno, log warning + skip. |
| T4 globalShortcut choca con apps del usuario | Alta | Bajo | Try/catch, log warning, no crashea. Documentar en README. |
| T8 CI no encuentra electron en ubuntu-latest | Baja | Medio | Usar `npm ci` (no `npm i`), pin versions en `package.json`. Documentar requirements. |
| T9 logger rota performance | Baja | Bajo | Append async en queue, flush cada 1s. No bloquea main thread. |
| T2 expone breaking change en `pet-protocol.js` | Baja | Medio | Hacer T2 justo después de T1, así el contrato está fresco. Tests viejos pasan. |

---

## 9. Comunicación

- **Daily async**: el orquestador (Mavis root) revisa `git log main..feat/* --oneline` cada mañana
- **Si worker termina antes**: arranca siguiente XS de la cola (no espera a los demás)
- **Si worker se bloquea >2 días**: escalación al usuario (decisión: split o skip)
- **Fin de batch**: PR final con changelog + decisión de release v1.3.0

---

## 10. Definition of Done

El batch está completo cuando:
- [ ] Las 6 features mergeadas a `main`
- [ ] CI verde en los 3 OS
- [ ] `npm run sdlc:dev` verde
- [ ] `npm run sdlc:strict` verde (debería ser no-op porque batch 0 no es user-facing)
- [ ] Changelog en `docs/deliverables/v1.3.0-changelog.md`
- [ ] Tag `v1.3.0` pusheado
- [ ] Usuario aprueba el release
- [ ] (Opcional) DOCX del changelog via `/sdlc-doc finalize` cuando haya pandoc

---

## 11. Changelog

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-07-21 | Creación del plan de batch 0 | Mavis |
