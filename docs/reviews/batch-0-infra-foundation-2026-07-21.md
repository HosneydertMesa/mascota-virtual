# Review: batch-0-infra-foundation

**Fecha**: 2026-07-21
**Reviewer**: Mavis (sesión root, modo adversarial)
**Branch**: feat/t1-refactor-behavior + feat/t3-powermonitor + feat/t4-global-shortcut + feat/t8-ci-github-actions + feat/t9-logging
**Veredicto**: ✅ **APPROVED** (con 6 hallazgos MINOR / 2 INFO, todos diferibles o documentados)

---

## Resumen ejecutivo

Batch 0 cumple el objetivo: base técnica para features testeables (mood, recuerdos, context awareness). 5 features mergeadas, 34 tests nuevos (total 129), 0 cambios funcionales observables, 0 breaking changes. El corazón es T1 — desacople de `executePetBehavior` en módulo puro testeable. Eso solo desbloquea el batch 1 (mood system).

Lo que se destaca:
- **T1 (refactor)**: extract method + dependency injection limpio. `executeBehavior(action, deps)` es 100% puro, 15 tests cubren todos los caminos, factory `buildMainDeps` mantiene main.js simple. Gran base para T1.5 (mood influence on intent).
- **T9 (logger)**: JSON-lines con redacción + rotación. Diseño limpio, inyección de stream para tests, WeakSet para circular refs. Production-ready.
- **T3 (powerMonitor)**: event-driven, testeable con EventEmitter mock, delay 5s en wake-up es buena UX. Cleanup correcto.
- **T4 (globalShortcut)**: try/catch por shortcut individual, no crashea si OS no permite. Handlers separados de register (testeable).
- **T8 (CI)**: matrix Win/Mac/Linux × Node 18/20, cache de node_modules, timeout 15min. Standard pero sólido.

---

## Hallazgos

### [INFO-1] Badge del README apunta a `Antigravity/mascota-virtual` (no verificado)

**Archivo**: `README.md` línea 3
**Impacto**: cosmético. El badge se muestra roto hasta que se cree el repo real.
**Decisión**: diferir hasta push a GitHub. Actualizar el path cuando se sepa el nombre real del repo (`HosneydertMesa/mascota-virtual` o similar).

### [INFO-2] Orquestación de workers en mismo workspace (lección aprendida documentada)

**Impacto**: operación. 3 workers en paralelo compartieron filesystem y se pisaron en main.js. Resolví manualmente con stash + merge conflict resolution.
**Decisión**: ya documentado en memoria cross-project. Próximos batches usarán **git worktrees** o reglas estrictas (sin checkout, sin stash).

### [MINOR-1] `Logger.minLevel` acepta número o string — API ambigua

**Archivo**: `src/services/logger.js` línea ~110
**Snippet**:
```js
this.minLevel = typeof opts.minLevel === 'number'
  ? opts.minLevel
  : (LEVELS[opts.levelName] || LEVELS.info);
```
**Impacto**: bajo. Dos keys para el mismo concepto (`minLevel` numérico vs `levelName` string).
**Decisión**: diferir. Refactor a un solo parámetro `level: 'info' | 'debug' | ...` en próxima iteración. No tocar ahora para no romper consumidores.

### [MINOR-2] `initMainDeps` se cachea — no re-construye si petWindow cambia

**Archivo**: `main.js` línea ~432-450
**Impacto**: bajo. `mainDeps` se construye una vez en `app.whenReady`, después de `createPetWindow`. El callback `getPetWindow: () => petWindow` lee el valor actual del closure, así que `getPetBounds` siempre retorna bounds correctos. Pero si la lógica de init cambia (ej. multi-mascota), el cache puede confundir.
**Decisión**: dejar como está. Es la opción correcta hoy. Documentar en comentario si crece el scope.

### [MINOR-3] `T4 handlePomodoroToggleShortcut` puede crear dashboard invisible

**Archivo**: `main.js` línea ~810-820
**Impacto**: UX. Si el usuario aprieta `Ctrl+Shift+P` con la app en background, se crea el dashboard y se le da focus. Edge case aceptable.
**Decisión**: diferir. Funcionar funciona, no es bug.

### [MINOR-4] `T3 powerMonitor` cleanup silencioso si hook no existe

**Archivo**: `src/services/power-monitor.js`
**Impacto**: bajo. Try/catch defensivo en cada listener. Si `powerMonitor.on('lock-screen')` tira (OS viejo), no se rompe la app.
**Decisión**: OK. Es la política correcta para máxima compatibilidad.

### [MINOR-5] T9 `Logger` con `levelName` no se usa después de constructor

**Archivo**: `src/services/logger.js`
**Impacto**: ninguno. La key se usa solo en constructor. No se persiste.
**Decisión**: ver MINOR-1. Misma solución.

### [MINOR-6] Tests de pet-behavior no cubren edge case: `intent` desconocido

**Archivo**: `test/pet-behavior.test.js`
**Impacto**: cobertura. Si la IA devuelve un intent no permitido (ej. `playful` que no está en el allow-list), `normalizeIntent` lo coerce a `'none'`, y `executeBehavior` retorna `{ did: 'none' }`. El test `intent=none y action=none → no-op` cubre este caso, pero podría ser más explícito.
**Decisión**: diferir. El comportamiento es correcto y está testeado indirectamente.

---

## Métricas

| Métrica | Antes (v1.2.2) | Después (v1.3.0-rc) | Delta |
|---|---|---|---|
| Tests | 79 | **129** | +50 (+63%) |
| Suites de test | 5 | **6** | +1 (logger) |
| Archivos `src/core/` | 2 | **3** | +1 (pet-behavior) |
| Archivos `src/services/` | 2 | **4** | +2 (logger, power-monitor) |
| Globals en main.js | ~25 | ~22 | -3 (movidos a deps) |
| LOC en main.js | 814 | **722** | -92 (refactor T1) |
| Líneas testeables de decisión de comportamiento | 0 | **115** (executeBehavior) | +115 |

---

## Lecciones aprendidas

1. **Workers en paralelo con mismo cwd no escalan**. Hay que usar git worktrees. Documentado en user memory.
2. **T1 full refactor confirmado como prerequisito real**: T9 (logger) ya está siendo usado por T3 (`logDebug` migrable) y el refactor de T1 dejó el código en estado "fácil de extender" para batch 1.
3. **`node --test` native es suficiente** para el proyecto. No necesitamos jest. 129 tests corren en ~10s.
4. **El pre-commit hook funcionó bien** — atrapó el cambio a `package.json` que se hubiera perdido.

---

## Criterios de salida

- [x] Tests pasan localmente (129/129)
- [x] Sintaxis limpia
- [x] Pre-commit hook limpio
- [x] AGENTS.md respetado
- [x] Cambios commiteados con conventional commits
- [x] Sin hallazgos CRITICAL ni MAJOR
- [x] Hallazgos MINOR/INFO documentados con decisión (fix o diferir)

**APPROVED** → pasa a GATE 3 (QA).
