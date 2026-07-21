# Plan: pet-animation-capa1

> Walk-cycle + idle micro-animations. Capa 1 del review de movimiento.

## Contexto

El proyecto ya tiene infraestructura de animación más rica de lo que se
asumió inicialmente:
- `styles.css:1015-1104` define keyframes para walk-cycle de las 4 patas
  (`sideWalkSwingLeft/Right`), body bob (`catBodyWalk`/`dogBodyWalk`),
  tail walk (`catTailWalk`/`dogTailWalk`)
- `styles.css:999-1007` define blink (`@keyframes blink` + `.anim-blink`)
- `styles.css:1118-1122` desactiva blink cuando está durmiendo
- `src/renderer.js:46-48` togglea las clases `walking-bob`/`cat-walk`/`dog-walk`
  según el estado

**Lo que falta** (los huecos reales de esta capa):

1. **Ear twitch** — no hay micro-animación de orejas
2. **AI decidiendo movimiento** — la IA puede triggear acciones binarias
   (`walk`/`sleep`) pero no intenciones contextuales
3. **Smooth visual transitions** entre estados (swap duro idle↔walking↔sleeping)

Este plan cubre los puntos 1 y 2. El punto 3 (cross-fade) queda como follow-up
si los primeros dos se sienten bien en uso.

## Decisiones de diseño

### Ear twitch
- **Cat**: rotación sutil de la oreja izquierda (-3° a 3°) cada 5-10s aleatorio
- **Dog**: las orejas floppy se balancean con un ligero retardo de la cola
- Implementación: `@keyframes earTwitchCat` (CSS) + timer JS en `animateTail`
  (que ya corre con `requestAnimationFrame`)
- Trigger: ~0.5% chance por frame, anim dura 400ms

### AI intents
- Nuevo tag en la respuesta de la IA: `[INTENT: tipo]`
- Tipos válidos: `approach | retreat | play | sleep | wander | stay`
- La IA también puede opcionalmente `[TARGET: cursor | edge | user | idle]`
- El main process (`executePetBehavior`) interpreta la intent y la traduce a
  parámetros de movimiento:
  - `approach cursor` → activa cursor tracking (CURIOUS)
  - `wander` → triggea `chooseNewTarget` con velocidad normal
  - `retreat` → se mueve en dirección opuesta al cursor
  - `play` → fuerza estado PLAYING
  - `stay` → cancela cualquier movimiento en curso
  - `sleep` → equivalente al action existente
- Si la intent es desconocida o falta, fallback al action actual (`walk`/`sleep`)

## Archivos a tocar

| Archivo | Cambios |
|---|---|
| `src/core/pet-motion.js` | Agregar `ALLOWED_INTENTS`, `normalizeIntent` (similar a `normalizeEmotion`) |
| `src/renderer.js` | Agregar lógica de ear twitch al `animateTail`; toggle de clases |
| `src/styles.css` | `@keyframes earTwitchCat`, `@keyframes earTwitchDog` |
| `src/services/ai.js` | Extender `systemPromptCat`/`systemPromptDog` con sección de intents |
| `main.js` | Interpretar `[INTENT:...]` en `executePetBehavior` |
| `test/pet-motion.test.js` | Tests para `normalizeIntent` |
| `test/ai.test.js` | Tests para system prompts (que mencionan INTENTS) |

## Criterios de aceptación

- [ ] Orejas del gato se mueven aleatoriamente cada 5-10s
- [ ] Orejas del perro siguen con ligero retardo a la cola
- [ ] Cuando la IA devuelve `[INTENT: approach]`, la mascota se acerca al cursor
- [ ] Cuando la IA devuelve `[INTENT: stay]`, la mascota deja de moverse
- [ ] Si la intent no es válida, no rompe nada (fallback al action actual)
- [ ] Tests pasan: 19 existentes + ~6 nuevos

## Estimación

- Ear twitch: **S** (1-2 horas)
- AI intents: **M** (3-4 horas)
- Tests: incluido en cada uno
- Total: **M** (medio día)

## Anti-patrones a evitar

- ❌ No meter la lógica de intent en el renderer (debe estar en main para que
  la IPC siga validando sender)
- ❌ No cambiar el formato de respuesta de la IA de forma breaking (los tags
  `[EMOTION:..][ACTION:..][SOUND:..]` siguen funcionando igual)
- ❌ No agregar más de 2 intents sin pedir feedback — el alcance se infla fácil

## Próximos pasos

1. Implementar `normalizeIntent` + tests
2. Extender `ai.js` system prompts
3. Cablear en `main.js` con `executePetBehavior`
4. Ear twitch (CSS + JS)
5. `npm run sdlc:dev` (sintaxis + tests)
6. Commit
