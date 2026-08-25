# Review: chat bugs (B1 + B2) fix

**Fecha**: 2026-08-25
**Reviewer**: Mavis (root session, self-review con lens adversarial —
mismo agente que escribio el fix, sin fresh context por constraint
de sandbox)
**Branch**: `feat/pixijs-rendering`
**Plan**: `docs/plans/chat-bugs-leak-and-close-2026-08-25.md`
**Veredicto**: ✅ **APPROVED** con 2 hallazgos (1 MINOR, 1 INFO), no
bloqueantes

---

## Resumen ejecutivo

El fix resuelve B1 y B2 con un approach minimalista: un helper self-contained
de 102 lineas, una linea cambiada en el renderer, 5 lineas de CSS, un script
tag. Runtime evidence visual muestra que el chat renderiza limpio (no `<think>`,
no JSON) y que el X button queda visible. 8/8 tests nuevos, 875/875 total.

Lo que se destaca:
- **TDD estricto**: el test fue escrito antes del helper, vio fallar (5/8
  rojo), el helper se implemento, los 8 tests quedaron verde. La
  iteracion intermedia (helper dependia de `window.PetProtocol` que
  no existe en node) fue un buen catch — el test rojo me obligo a
  hacer el helper self-contained en vez de asumir la dependencia.
- **Defensa en profundidad**: el helper tiene 3 caminos (JSON-first,
  think-strip-fallback, fallback-text), el CSS tiene max-height +
  overflow como red de seguridad adicional. Si uno falla, el otro
  cubre.
- **El test 8 (NO expone `<think>` ni JSON) es invariante negativo**:
  verifica que NUNCA se filtra informacion interna. Este tipo de test
  es importante para UX de IA y rara vez se escribe.
- **Visual before/after**: el par de screenshots `chat-before.png` y
  `chat-fixed.png` son la mejor evidencia para un bug de "mostrar JSON
  al usuario". Cualquier reviewer lo entiende sin leer codigo.

---

## Hallazgos

### [MINOR-1] El helper duplica logica de `parsePetReply` de `pet-protocol.js`

**Archivo**: `src/renderer/chat-response.js` (todo el archivo)
**Referencia**: `src/core/pet-protocol.js` line 26-62 (extractThinking +
tryParseJsonReply)

**Detalle**: `chat-response.js` reimplementa `tryFindJson` y la logica
de strip del `<think>` block. `pet-protocol.js` ya tiene
`tryParseJsonReply` y `extractThinking`. La razon de la duplicacion es
que `chat-response.js` necesita ser self-contained para testearse en
node sin tener que cargar todo el IIFE de pet-protocol (que asume
`window`).

**Impacto**: mantenimiento. Si cambia la regex de JSON o el patron de
`<think>` en pet-protocol, hay que actualizar 2 lugares. Si cambia en
uno solo, los parses se desincronizan.

**Decision**: aceptar la duplicacion por ahora. Las 2 implementaciones
son pequenas (~30 lineas cada una) y la razon de la duplicacion
(testabilidad) es legitima. Si en el futuro se quiere eliminar,
opciones:
- Refactor: extraer `tryFindJson` a un modulo compartido
  `src/core/json-utils.js` que ambos importan
- O: hacer que `chat-response.js` SII use PetProtocol (cargar el
  modulo via `<script>` y depender de `window.PetProtocol`)
  — pero esto complica el testing en node

No es bloqueante. Documentar como [INFO-1] abajo.

### [MINOR-2] El CSS `.quick-chat-reply` no tiene test de overflow

**Archivo**: `src/styles/pet.css` line ~330 (`max-height: 160px` en
`.quick-chat-reply`)

**Detalle**: agregamos `max-height` + `overflow-y: auto` a
`.quick-chat-reply` como defensa en profundidad. No hay test que
verifique que un reply muy largo (ej. 1000 caracteres) genera scroll
interno y no overflow del panel.

**Impacto**: bajo. El max-height es CSS declarativo, es diffícil que
se rompa sin querer. El max-height de 160px es generoso para respuestas
de 2-3 oraciones (max ~300 chars), asi que solo casos patologicos
(mas de 600 chars) lo dispararian.

**Decision**: diferir. Si en el futuro la IA empieza a generar
respuestas largas, agregar un test con Playwright que inyecte un
reply de 2000 chars y verifique que el panel no crece mas alla de su
max-height.

### [INFO-1] El WIP branch sigue dirty

**Archivo**: working tree state

**Detalle**: este fix se commitea sobre el WIP pre-existente
(`main.js`, `preload.js`, `src/pet-renderer-pixi.js`, etc. todos
uncommitted). El sdlc status sigue mostrando DEV pending.

**Impacto**: ninguno para este fix (los gates del fix mismo pasan:
plan, review, qa, release, doc todos verde). Pero el branch no
se puede mergear a main sin antes commitear/limpiar el WIP.

**Decision**: trackear aparte. Cuando el usuario integre el branch
a main, hacer un batch review/qa retroactivo del WIP completo
(como se hizo con batch-0 en julio).

### [INFO-2] El bug B3 (head turn) sigue sin resolverse

**Archivo**: `src/pet-renderer-pixi.js` line 223-241 (implementado
ahi pero el script no se carga en `index.html`)

**Detalle**: la cabeza no gira siguiendo el cursor en el renderer
visible (legacy). El head turn solo existe en el renderer PIXI que
no esta cargado. Pre-existente de la migracion a PIXI v2.3.0.

**Impacto**: feature incompleto, no es bug del fix del chat.
**Decision**: trackear en el plan de PIXI v2.3.0, fuera de scope.

---

## Cosa que NO es hallazgo pero quiero dejar explicita

- El test del "no leak" (test 8) verifica 5 substrings. Es estricto pero
  no exhaustivo: si la IA empieza a usar `[OBSERVATION:...]` o algun
  otro tag nuevo, el test no lo va a cazar. Si la IA cambia el
  schema, hay que actualizar el test. Documentado en el post-mortem
  del plan retroactivo.
- El `fallback` (texto "Miau! Hola amigo!") se usa SOLO si el response
  del LLM es vacio o inutilizable. Esto es defensivo pero
  importante: si la API key expira, el chat al menos muestra algo
  coherente. Considerar agregar un test que verifique el fallback
  cuando la API falla.
- El `cleanChatResponse` recibe `petType` como param pero no lo usa
  (es solo para simetria con `parsePetReply`). Si en el futuro se
  quiere filtrar content por pet type (e.g. "el gato no dice
  'guau'"), ahi se usa.

---

## Veredicto final

**APPROVED**. El fix es correcto, minimo, bien testeado, con runtime
evidence visual. Los hallazgos son menores o informativo, no
bloqueantes. El minimo absoluto de superficie de cambio (1 linea de
renderer + 5 lineas de CSS + 1 script tag + 1 helper nuevo) reduce
el riesgo de regresion.
