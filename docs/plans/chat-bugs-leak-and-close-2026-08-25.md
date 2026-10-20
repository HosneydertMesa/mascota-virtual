---
id: chat-bugs-leak-and-close-2026-08-25
status: approved
created: 2026-08-25
size: S
files:
  - src/renderer.js
  - src/styles/pet.css
  - src/core/pet-protocol.js
  - src/services/ai.js
  - src/index.html
  - src/pet-renderer-pixi.js
  - test/ai.test.js
  - test/pet-assets.test.js
acceptance:
  - "B1: el chat muestra solo el texto del content, sin el bloque think ni el JSON envolvente ni las keys de emotion/action/sound/intent"
  - "B1: cuando la IA devuelve un JSON malformado el chat muestra el fallback local y cuando devuelve texto libre muestra ese texto"
  - "B2: el boton X del panel del chat queda siempre visible y clickeable, nunca tapado por el overflow del reply"
  - "B3: el head turn sigue trackeado en el plan de migracion a PIXI v2.3.0 y no bloquea el fix del chat (fuera de scope de este plan)"
  - "Tests: se agrega un test que simula la respuesta cruda con think + JSON y verifica que parsePetReply extrae solo el content"
  - "Escape sigue cerrando el panel (comportamiento existente que no se rompe)"
risks:
  - "B2 es probablemente consecuencia de B1: se agrega max-height y overflow defensivo a .quick-chat-panel y .quick-chat-reply"
  - "PetProtocol puede no estar disponible si el script no se cargo: fallback doble que hace strip manual del think"
---

# Plan retroactivo: Chat bugs (B1 + B2 + B3 observado por HOSNE 2026-08-25)

> **Status**: Open (pendiente de implementacion)
> **Date**: 2026-08-25
> **Author**: Mavis (M3) + HOSNE
> **Branch**: `feat/pixijs-rendering`
> **Reported in**: screenshot del quick chat abierto mostrando contenido
> crudo y boton X no visible

---

## 1. Bugs observados

HOSNE reporto via screenshot (12:51 GMT-5) tres issues visibles en el
quick chat panel abierto:

### B1 [ALTA] El chat muestra el thinking interno del LLM

**Sintoma**: en la respuesta se ve raw:
```
<think>
{"emotion":"sleepy","action":"stretch","sound":"purr","intent":"rest_stretch",
"content":"Miau... hola. Me estab
```
El bloque `<think>...</think>` y el JSON envoltorio son visibles al usuario.

**Root cause**: en `src/renderer.js` line 97-99, el handler de chat hace:
```js
const resText = typeof res === 'string' ? res : (res?.reply || fallback);
if (reply) reply.textContent = resText;
if (speech) speech.show(resText);
```
Dump directo del raw response, sin pasar por `parsePetReply`. El parser
ya existe en `src/core/pet-protocol.js` (`parsePetReply` + `extractThinking`
+ `tryParseJsonReply`) y hace exactamente lo que necesitamos: extrae
`<think>...</think>`, parsea el JSON, devuelve `content` limpio.

Ademas, el sistema prompt del LLM (`src/services/ai.js` line 165, 221) le
pide EXPLICITAMENTE que responda con `<think>...</think>` ANTES del JSON
("El JSON es lo UNICO que cuenta para la UI"). El LLM obedece; el
renderer ignora la convencion.

### B2 [ALTA, probablemente colateral de B1] No se puede cerrar el panel

**Sintoma**: el usuario reporta "no se deja cerrar" el chat. El boton X
deberia estar arriba a la derecha del panel header (line 30-32 de
`src/index.html`).

**Root cause (hipotesis)**: la respuesta raw sin parsear contiene el JSON
+ thinking block completo. Esto genera un texto muy largo que OVERFLOW
el panel (no hay `max-height` ni `overflow: hidden` en `#quick-chat-panel`
line 248-267 de `src/styles/pet.css`). El reply content crece hacia arriba
y cubre el header (incluido el X button).

Verificacion: en el screenshot, NO se ve "Habla con Luna" ni el
subtitulo, ni el X button. Solo se ve el reply content en la parte de
arriba del panel, con el input field en la parte de abajo. Esto confirma
que el header esta oculto detras del content overflow.

Una vez que B1 este fixeado (content = solo "Miau... hola. Me estaba..."),
el texto sera corto (~2-3 oraciones, max ~150 chars), no va a overflow,
y el X button va a ser visible. **B2 es probablemente consecuencia de B1**.

### B3 [BAJA, WIP] Head turn feature solo en PIXI

**Sintoma**: la cabeza no gira siguiendo el cursor en la app real.

**Root cause**: `pet-renderer-pixi.js` line 223-241 implementa el
`updateHeadRotation()` con math de `atan2` para apuntar al cursor. Pero
ese renderer NO esta cargado en `src/index.html` (no aparece en los
`<script src="...">`), y el `pet-canvas` esta `display: none` (line 70).
El renderer visible es el legacy (`PetViewport` + innerHTML swap), que
no tiene logica de head turn.

**Status**: pre-existente, parte del WIP de migracion a PIXI v2.3.0
(commits `84ece76`, `3e0c3b2`, `231e40e`, `c84c5d0`, `7c7f3dc`, `6ba820b`
sin merge a main). No es bloqueante para el fix del chat.

## 2. Fix propuesto

### B1 — usar `parsePetReply` en el chat handler

Cambio en `src/renderer.js` line 85-110 (funcion `handleSend`):

```js
// Antes:
const resText = typeof res === 'string' ? res : (res?.reply || fallback);
if (reply) reply.textContent = resText;
if (speech) speech.show(resText);

// Despues:
let resText = fallback;
if (typeof window.PetProtocol?.parsePetReply === 'function') {
  const parsed = window.PetProtocol.parsePetReply(
    typeof res === 'string' ? res : (res?.reply || ''),
    currentPet
  );
  resText = parsed.content || fallback;
} else if (typeof res === 'string') {
  // Fallback del fallback: strip <think> manualmente
  resText = res.replace(/<think>[\s\S]*?(<\/think>|$)/gi, '').trim() || fallback;
}
if (reply) reply.textContent = resText;
if (speech) speech.show(resText);
```

Notas:
- `parsePetReply` ya maneja los 3 caminos (JSON puro, tags viejos, texto
  libre) y devuelve `content` siempre. Si la IA responde en formato
  inesperado, el fallback es el string local.
- Doble fallback (manual strip) por si `PetProtocol` no esta disponible
  (ej. si el script no se cargo). Esto cubre el caso de runtime con
  scripts en orden de carga raro.
- `parsePetReply` ya esta exportado en `window.PetProtocol` via la IIFE
  en `src/core/pet-protocol.js` line 137-138. No requiere cambios al
  parser.

### B2 — fix de overflow por si B1 no resuelve del todo

Agregar a `#quick-chat-panel` en `src/styles/pet.css`:

```css
#quick-chat-panel {
  max-height: 360px;          /* prevent reply overflow from hiding header */
  overflow: hidden;           /* hard clip — no scroll needed, just trim */
  display: flex;
  flex-direction: column;
  /* ... resto igual ... */
}

.quick-chat-reply {
  max-height: 140px;          /* bounded reply area */
  overflow-y: auto;           /* if really long, scroll inside reply */
  /* ... resto igual ... */
}
```

Esto es defensivo. Si B1 ya retorna content corto, el max-height nunca
se va a hit. Pero si la IA genera un parrafo largo, el reply se clipa
dentro de su area, sin afectar el header (donde esta el X).

### B3 — fuera de scope de este plan

Trackear aparte en el plan de migracion a PIXI v2.3.0.

## 3. Acceptance criteria

- [ ] Chat muestra SOLO el texto del content (sin `<think>`, sin JSON,
      sin keys de emotion/action/etc)
- [ ] Cuando la IA devuelve un JSON malformado, el chat muestra el
      fallback local (no muestra el JSON roto)
- [ ] Cuando la IA devuelve texto libre (no JSON), el chat muestra el
      texto (parser tiene fallback para eso)
- [ ] El X button del panel siempre es visible y clickable (no queda
      cubierto por content overflow)
- [ ] Escape cierra el panel (esto YA funciona, no se rompe)
- [ ] Tests: casos para `parsePetReply` ya existen en `test/ai.test.js`
      (cubre JSON, tags viejos, texto libre). Agregar 1 test al pet-assets
      que verifique que el chat renderiza solo el content (puede ser un
      test de integracion o un test que simule la respuesta cruda y
      verifique que `parsePetReply` extrae correctamente)

## 4. Files a tocar

| Archivo | Cambio |
|---|---|
| `src/renderer.js` | Usar `window.PetProtocol.parsePetReply` en `handleSend` (line 97-99) |
| `src/styles/pet.css` | Agregar `max-height` + `overflow` defensivo a `#quick-chat-panel` y `.quick-chat-reply` |
| `test/pet-assets.test.js` (o nuevo test) | Test de integracion: simular respuesta cruda con `<think>`+JSON, verificar que `parsePetReply` extrae solo el content |

## 5. Estimacion

- B1: **S** (15-30 min) — cambio pequeno en renderer + verificar que
  `parsePetReply` retorna lo esperado. La logica de parsing ya existe.
- B2: **S** (10 min) — 2 lineas CSS adicionales.
- Tests: incluido en B1.
- Total: **S** (30-45 min)

## 6. Por que es SEPARADO del walk fix

El walk fix era estructural-quirurgico (SVG + CSS animation). El chat bug
es de UX/data flow (raw response vs parsed response). No comparten archivos
(el walk toca `cat.js`, `dog.js`, `dashboard.css`; el chat toca
`renderer.js`, `pet.css`). Se pueden commitear independientemente sin
conflictos.

## 7. Post-mortem (preventivo)

Por que no se cazo antes:
- El test `test/ai.test.js` cubre `parsePetReply` exhaustivamente, pero
  no cubre el path del renderer donde se deberia USAR el parser.
- No hay test de integracion "render del chat" que verifique que la
  respuesta visible al usuario no contiene `<think>` o JSON.
- El sistema prompt instruye al LLM a usar `<think>`, pero el renderer
  original (escrito antes de `parsePetReply`) esperaba texto plano. El
  parser se agrego despues (en M3 parser batch, julio 2026) pero nadie
  actualizo el chat handler para usarlo.

Lección: cuando se agrega un parser X, hay que buscar todos los call
sites que recibian el raw string y migrarlos. Un grep de
`aiSendMessage` o `res.reply` habria encontrado este call site.
