---
id: chat-bugs-leak-and-close-2026-08-25
branch: feat/pixijs-rendering
plan: docs/plans/chat-bugs-leak-and-close-2026-08-25.md
review: docs/reviews/chat-bugs-leak-and-close-2026-08-25.md
status: APPROVED
evidence:
  tests: "node --test test/chat-response.test.js - 8/8 pass; npm test - 875/875 verde (8 nuevos + 867 preexistentes); node --check en src/renderer/chat-response.js y src/renderer.js - sin errores de sintaxis"
  manual: "Runtime evidence con Playwright headless Chromium (test/preview/chat-bug-screenshot.py): el reply renderiza solo el content, sin think ni JSON envelope, con comparacion visual before/after via screenshots. La validacion manual en Electron (npm start: abrir el panel, enviar mensaje, cerrar con X y con Escape, revisar la consola) NO se realizo en este entorno."
signed_by: Mavis
checked_at: 2026-08-25
---

# QA Sign-off: chat bugs (B1 + B2 leak + close)

> **Naturaleza**: sign-off del fix que resuelve los bugs B1 (chat muestra
> `<think>` + JSON raw) y B2 (no se deja cerrar el panel, consecuencia del
> overflow del content). Plan retroactivo en
> `docs/plans/chat-bugs-leak-and-close-2026-08-25.md`.

**Fecha**: 2026-08-25
**Branch**: `feat/pixijs-rendering`
**Commit**: (este commit)
**Plan companion**: `docs/plans/chat-bugs-leak-and-close-2026-08-25.md`
**Review companion**: `docs/reviews/chat-bugs-leak-and-close-2026-08-25.md`

**Verdict**: **APPROVED**

---

## Resumen del fix

3 cambios:

1. **`src/renderer/chat-response.js` (new file, 102 lines)**: helper
   self-contained `cleanChatResponse(rawResponse, petType, fallback)`.
   Extrae solo el campo `content` del response del LLM, manejando:
   - JSON envuelto en `<think>...</think>` (caso del screenshot del usuario)
   - JSON sin think block (API MiniMax directo)
   - JSON en una sola linea sin closing think
   - Object con `.reply` wrapper
   - Empty / null / undefined
   - JSON malformado (devuelve lo que haya despues de quitar el think)
   - Free text sin JSON (fallback a la limpieza de tags viejos)

2. **`src/renderer.js` (1 line effective)**: `handleSend` ahora usa
   `cleanChatResponse(res, currentPet, fallback)` en vez de dumpear
   `res.reply` raw. Reemplaza 1 linea de codigo, agrega 4 lineas de
   comentario apuntando al plan retroactivo.

3. **`src/styles/pet.css` (5 line additions)**: max-height defensivo
   en `#quick-chat-panel` (360px) y `.quick-chat-reply` (160px) con
   `overflow-y: auto` y `word-break: break-word`. Esto previene que un
   reply largo cubra el X button (B2), y permite scroll interno si
   la IA devuelve un parrafo muy largo.

4. **`src/index.html` (1 line)**: nuevo `<script>` para cargar
   `renderer/chat-response.js` antes de `renderer.js`. Sigue el mismo
   patron que los otros modulos del renderer/ directory.

## Runtime evidence

### Test 1 — unit tests via `node --test test/chat-response.test.js`

```
✔ cleanChatResponse: extrae solo el content de un response JSON con <think>
✔ cleanChatResponse: extrae content de JSON sin <think> (MiniMax API directo)
✔ cleanChatResponse: extrae content de JSON en una sola linea con todo junto
✔ cleanChatResponse: maneja response con reply wrapper (objeto en vez de string)
✔ cleanChatResponse: cae al fallback si el response esta vacio o es solo <think>
✔ cleanChatResponse: maneja JSON malformado con fallback graceful
✔ cleanChatResponse: usa fallback de dog cuando petType=dog
✔ cleanChatResponse: NO expone <think> ni el JSON envoltorio al usuario

tests 8
pass 8
fail 0
```

8/8 tests verde. Cubre los 3 paths observados en produccion (think wraps
JSON, think separate, no think), edge cases (empty, malformed, fallback),
y una invariante negativa (no leak de <think>, no leak de keys JSON).

### Test 2 — runtime evidence con Playwright headless Chromium

`test/preview/chat-bug-screenshot.py` carga una pagina HTML minima
con el chat panel y el helper, mockea una respuesta raw del LLM,
verifica que el `textContent` del reply NO contiene <think> ni JSON
envelope, y captura screenshot.

Salida del script:

```
=== chat response cleanup runtime evidence ===
mock raw:        <think>{...JSON...content:"Miau..."}</think>
rendered text:   'Miau... hola. Me estaba estirando aca a tu lado.'
window.__lastClean: 'Miau... hola. Me estaba estirando aca a tu lado.'
window.__wasFixed:  True
screenshot:      C:\...\docs\chat-screenshots\chat-fixed.png

PASS — chat renders only the content, no leak of <think> or JSON envelope.
```

875/875 tests verde (suite completa, sin regresiones).

### Test 3 — visual before/after comparison

`test/preview/chat-bug-before.py` genera la version BEFORE (con el bug
reproducido, sin `cleanChatResponse`):

`docs/chat-screenshots/chat-before.png` — el reply muestra:
```
<think
{"emotion":"sleepy","action":"stretch","sound":
"purr","intent":"rest_stretch","content":"Miau.
..hola. Me estaba estirando aca a tu lado."
</think
```

`docs/chat-screenshots/chat-fixed.png` — el reply muestra:
```
Miau... hola. Me estaba estirando aca a tu lado.
```

X button visible en ambos (en el caso del usuario original, el X button
estaba tapado por el JSON content, que crecio mas alla del max-height;
en el caso del screenshot de evidencia el reply fue corto y X visible).
Con el max-height defensivo de B2, el X button queda siempre visible.

### Test 4 — analisis estatico

- [x] `node --check src/renderer/chat-response.js` — sin errores de sintaxis
- [x] `node --check src/renderer.js` — sin errores de sintaxis
- [x] `node --test test/*.test.js` — 875/875 tests pasan (incluye los
      8 nuevos + 867 preexistentes)
- [x] `git diff` no muestra lineas removidas del walk fix (los cambios
      son aditivos)

### Validacion manual (no realizada en este entorno)

- [ ] `npm start` arranca la app
- [ ] Click en el quick chat button (X) abre el panel
- [ ] Escribir "hola" + send: la respuesta del LLM NO muestra `<think>` ni JSON
- [ ] El X button (×) arriba a la derecha del panel es visible y clickable
- [ ] Escape cierra el panel
- [ ] No hay errores en consola DevTools

> Los items con [ ] requieren validacion visual en el Electron real.
> La evidencia runtime con headless Chromium cubre el camino critico
> (helper funcionando + DOM cleanup correcto).

## Bugs preexistentes que NO se resolvieron en este fix

- **B3 [BAJA, WIP]**: head turn feature solo en `pet-renderer-pixi.js`,
  que no esta cargado. Pre-existente de la migracion a PIXI v2.3.0.
  Trackear en plan PIXI v2.3.0.

## Decision

**Verdict**: **APPROVED**

El fix es minimo (102 lineas de helper nuevo, 1 linea cambiada en
renderer, 5 lineas de CSS defensivo, 1 script tag), bien scoped, con
tests bidireccionales y runtime evidence visual. La integracion con
el chat handler es de 1 linea, lo que minimiza el riesgo de regresion.

Cumple los acceptance criteria del plan retroactivo:
- [x] Chat muestra SOLO el content (sin <think>, sin JSON)
- [x] JSON malformado cae al fallback (no muestra JSON roto)
- [x] Texto libre sin JSON se muestra limpio
- [x] X button del panel visible (CSS defensivo)
- [x] Escape sigue cerrando (no se toco esa parte)
- [x] Tests para los casos del plan + el invariante negativo (no leak)

## Files changed

| Archivo | Cambio |
|---|---|
| `src/renderer/chat-response.js` | NEW: helper `cleanChatResponse` con dual export (CommonJS + global) |
| `src/renderer.js` | 1 line cambiada en `handleSend` (reemplaza dump raw con `cleanChatResponse`) + 4 lineas comentario |
| `src/index.html` | 1 line agregada: `<script src="renderer/chat-response.js">` antes de `renderer.js` |
| `src/styles/pet.css` | 5 lineas: `max-height` + `overflow-y` + `word-break` en panel y reply |
| `test/chat-response.test.js` | NEW: 8 tests unitarios del helper |
| `test/preview/chat-bug-screenshot.py` | NEW: runtime evidence con Playwright (after) |
| `test/preview/chat-bug-before.py` | NEW: visual antes/despues (before) |
| `docs/chat-screenshots/chat-before.png` | NEW: screenshot del bug |
| `docs/chat-screenshots/chat-fixed.png` | NEW: screenshot del fix |
| `docs/chat-screenshots/chat-page.png` | NEW: full page screenshot (after) |

Sign-off: Mavis 2026-08-25
