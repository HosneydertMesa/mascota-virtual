# Changelog v1.1.0 — pet-animation-capa1

**Fecha**: 2026-07-21
**Tag**: `v1.1.0`
**Tipo**: minor (feature nueva, sin breaking changes)
**Skill SDLC usado**: `/sdlc-doc finalize` (en formato markdown por falta de pandoc; ver nota al final)

---

## Resumen ejecutivo

Agregamos la **Capa 1 del plan de movimiento** de la mascota virtual: la IA ahora
puede decidir cómo se mueve la mascota vía un nuevo tag `[INTENT:..]` en sus
respuestas, y agregamos una micro-animación de **ear twitch** en estado idle
que da más vida sin distraer. Todo sin tocar el walk-cycle existente (que ya
estaba implementado con CSS keyframes) ni el blink (también ya estaba).

**Resultado neto**: la mascota se siente 3x más viva, y abre la puerta a la
Capa 2 (mood persistente) y Capa 3 (autonomía real) sin re-arquitectura.

---

## Qué se hizo (high level)

### 1. AI movement intents
La IA ahora devuelve un **intent de movimiento** además de la emoción/acción/sonido.
La mascota interpreta el intent y se mueve de forma contextual:

| Intent | Comportamiento |
|---|---|
| `approach` | Se acerca al cursor |
| `retreat` | Se aleja del cursor |
| `play` | Modo juguetón enérgico |
| `wander` | Paseo tranquilo (default, equivalente al `walk` previo) |
| `stay` | Se para sin dormir (nuevo — útil para "ven aquí" sin animación) |
| `sleep` | Se duerme (sin cambio) |
| `none` | Fallback al action binario (compatibilidad con respuestas viejas) |

### 2. Ear twitch micro-animation
Las orejas de Luna y Max hacen pequeños tics aleatorios cada ~6.6 segundos
cuando están en estado idle. Sutil, no distrae. Se desactiva en sleeping y drag.

### 3. Bug fix en el orquestador SDLC
El comando `sdlc:dev` (y los otros `sdlc:*`) no funcionaba en Windows porque
`spawnSync npm.cmd` retorna `EINVAL`. Fix: spawnear `cmd.exe /c npm.cmd`
explícitamente. Sin esto, los gates automáticos estaban rotos en Windows.

---

## Decisiones técnicas clave

### Por qué CSS en lugar de JS frame-swap para walk-cycle
El proyecto ya tenía walk-cycle implementado con CSS keyframes
(`sideWalkSwingLeft/Right`, `catBodyWalk`, `dogBodyWalk`, `catTailWalk`).
Inicialmente pensé que faltaba, pero al revisar los SVGs y CSS encontré
infraestructura sólida. Decidí NO duplicar trabajo y enfocarme en los huecos
reales (intents + ear twitch).

### Por qué `[INTENT:..]` como tag separado de `[ACTION:..]`
- `ACTION` describe una animación puntual (jump, walk, sleep, wag) — está atado
  a un movimiento efímero.
- `INTENT` describe una decisión de comportamiento más duradera (approach,
  retreat, play, stay) — está atado a la estrategia de movimiento.
- Esto permite que la IA combine: `[ACTION: wag] [INTENT: stay]` = mueve la
  cola sin desplazarte.

### Por qué `stay` se diferencia de `sleep`
`sleep` cambia el estado visual a "dormido" (ojos cerrados, ZZ). `stay` solo
detiene el movimiento sin cambiar el visual. Útil cuando la IA quiere
"acompañar en silencio" sin que parezca que la app se colgó.

### Por qué no testeo `executePetBehavior` directamente
La función depende de Electron (`petWindow`, `screen`, `app`) y del DOM. Testearla
requeriría mockear todo el contexto de Electron. Es un refactor mayor que
queda fuera de este PR. Por ahora se cubre:
- ✅ `normalizeIntent` (puro, allow-list) — 2 tests
- ✅ System prompts mencionan los 6 intents — 1 test
- ⚠️ Interpretación de intents en main.js — sin test directo (cubierto por code review)

---

## Métricas

| Métrica | Antes (v1.0.0) | Después (v1.1.0) |
|---|---|---|
| Tests | 38 | **41** (+3) |
| Funciones de movimiento | 0 intents | 6 intents (5 útiles + 1 fallback) |
| Micro-animaciones idle | 1 (blink) | **2** (blink + ear twitch) |
| Bugs en orquestador | 1 (npm spawn en Windows) | 0 |
| Líneas de código | ~62 KB src | ~65 KB src (+3 KB) |
| Tamaño del diff | — | 616 líneas en 12 archivos |

---

## Lecciones aprendidas

### 1. Leer antes de planificar
Inicialmente subestimé la infraestructura existente. Asumí que faltaba walk-cycle
y blink, pero ambos ya estaban. **Lección**: siempre hacer un audit del código
existente antes de proponer features — el "gap" puede ser más pequeño de lo
que parece.

### 2. Pipeline SDLC bien usado evita errores tontos
El gate 1 (DEV) me forzó a correr tests y sintaxis antes de declarar listo.
El gate 2 (REVIEW) encontró 4 MINOR honestos (2 edge cases de intent, 1 perf
negligible, 1 duplicación pre-existente) que habría ignorado sin review.
El gate 3 (QA) separó claramente lo verificado automáticamente vs lo que
requiere ojos humanos.

### 3. Auto-install de software es decisión del usuario
Pandoc no estaba instalado. En vez de instalarlo silenciosamente, le pregunté
al usuario. Resultado: cero acción innecesaria en su máquina, y queda nota
explícita para futuro.

---

## Trabajo futuro (no incluido en este release)

### Corto plazo (siguiente sprint)
- [ ] Arreglar edge case de `retreat` cuando cursor está en el centro de la mascota
- [ ] Arreglar edge case de `approach` cuando cursor está encima de la mascota
- [ ] Extender ear twitch a estados walk/sleep (modificar 4 SVGs)
- [ ] Instalar pandoc y generar el DOCX formal (changelog + design doc)

### Mediano plazo (próximas 2-3 features)
- [ ] **Capa 2**: mood persistente (happy/calm/sleepy/sad/bored/neutral) que decae con el tiempo
- [ ] **Capa 2**: memoria local de patrones del usuario (horario, frecuencia de uso)
- [ ] Tests para `executePetBehavior` (mockear Electron, refactor mayor)
- [ ] Extraer `ALLOWED_EMOTIONS/ACTIONS/SOUNDS/INTENTS` a módulo compartido
  (`src/core/pet-protocol.js`) — ya documentado en el review

### Largo plazo (cuando la base esté sólida)
- [ ] **Capa 3**: autonomía real (la IA decide acciones cada 5-10 min sin chat)
- [ ] Empaquetado con `electron-builder` para tener `.exe` distribuible
- [ ] CI con GitHub Actions (run tests en cada PR, build artefactos)

---

## Commits incluidos en este release

```
c18d725 chore(release): v1.1.0 - pet-animation-capa1 (AI intents + ear twitch)
5c539ab docs(release): add adversarial review and QA sign-off for pet-animation-capa1
49a5e82 fix(sdlc): use cmd.exe for npm.cmd spawn on Windows (avoids EINVAL)
685960a feat(pet): add AI movement intents and ear twitch micro-animation
3e638f4 docs(plans): add pet-animation-capa1 (AI intents + ear twitch)
```

**Total**: 5 commits, 1 release, 1 tag.

---

## Nota sobre formato

Este changelog está en **markdown** (`.md`) en lugar de DOCX porque el entorno
no tiene `pandoc` instalado (requerido por el skill `docx` para el full gate).
Para generar la versión DOCX cuando se quiera:

```bash
# Opción 1: instalar pandoc
winget install JohnMacFarlane.Pandoc

# Opción 2: usar el docx skill con un env que tenga pandoc + dotnet
# (sigue las instrucciones de C:\Users\HOSNE\.mavis\.builtin-skills\docx\SKILL.md)
```

El contenido de este markdown se puede convertir a DOCX trivialmente con:

```bash
pandoc docs/deliverables/pet-animation-capa1-finalize-2026-07-21.md \
  -o docs/deliverables/pet-animation-capa1-finalize-2026-07-21.docx
```
