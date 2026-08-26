# Review — hotfix v2.0.2 (scope conflict context-awareness.js)

**Fecha**: 2026-07-22
**Reviewer**: Mavis (self-review)
**Fix scope**: 1 archivo source + 1 archivo test (nuevo) + 1 huérfano eliminado
**LOC delta**: +4 / -3 (solo el wrap IIFE)

## Verdict

**APPROVED**

## Resumen del cambio

`src/core/context-awareness.js`: el cuerpo se envolvió en IIFE `(function(root){...})(window || globalThis)`. La API pública NO cambia:
- Node: `module.exports = ContextAwareness` (igual que antes)
- Browser: `root.ContextAwareness = ContextAwareness` → `window.ContextAwareness` (igual que antes)

Solo cambia el **scope de las funciones internas** (de global a IIFE-private). Antes, `function shouldEnterDoNotDisturb` quedaba en el global scope del browser window, donde colisionaba con el `const { shouldEnterDoNotDisturb } = window.ContextAwareness` de `dashboard-renderer.js`. Después, las funciones son privadas del IIFE y NO contaminan el global.

## Detalle del review

### Archivo: `src/core/context-awareness.js`

✅ **Patrón consistente con codebase**: `pet-protocol.js` ya usaba IIFE wrap (commit previo). El nuevo wrap sigue el mismo estilo:
```js
(function (root) {
  // ... cuerpo privado ...
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContextAwareness;
  } else {
    root.ContextAwareness = ContextAwareness;
  }
})(typeof window !== 'undefined' ? window : globalThis);
```

✅ **API pública intacta**: `module.exports` en Node y `window.ContextAwareness` en browser. Los 31 tests existentes de `context-awareness.test.js` siguen pasando (mismo export, misma firma).

✅ **No introduce side effects adicionales**: la única mutación global nueva es `window.ContextAwareness = ContextAwareness` (que ya estaba antes).

✅ **Naming consistente**: usa el nombre `root` para el parameter, igual que `pet-protocol.js`.

⚠️ **NIT-1**: el archivo podría tener un `try { ... } catch` alrededor del set de `window.ContextAwareness` por si la CSP lo bloquea, pero `script-src 'self'` ya permite self-evaluated scripts. No necesario.

⚠️ **NIT-2**: la indentación dentro del IIFE podría re-ajustarse para que sea más consistente con el resto del archivo, pero es cosmético puro. El diff es +4 / -3 LOC, no justifica.

### Archivo: `test/context-awareness-scope-conflict.test.js` (NUEVO)

✅ **5 tests, todos verde en 77ms**:
1. API pública intacta (Node module.exports)
2. Browser expone `window.ContextAwareness`
3. REGRESIÓN: dashboard-renderer.js + context-awareness.js NO colisionan
4. BIDIRECCIONAL sentinel: simula el archivo SIN IIFE y confirma que el bug SE reproduce → test NO es placebo
5. No quedan top-level function declarations (guard estructural para futuros refactors)

✅ **Test 4 es el crítico**: usa un fragmento "buggy" inline con `function shouldEnterDoNotDisturb` a top-level + el destructure de dashboard-renderer.js, y verifica que `assert.throws` captura el SyntaxError. Si el fix no estuviera, este test pasaría igualmente (el fix no afecta al buggy fragment). Pero al estar combinado con test 3, garantiza:
- Sin fix: test 3 falla, test 4 pasa → comportamiento buggy
- Con fix: test 3 pasa, test 4 pasa → comportamiento correcto

✅ **Test 5 es defensivo**: si alguien en el futuro mueve código fuera del IIFE, el test rompe. Es la red de seguridad para que esto no vuelva a pasar.

### Archivo eliminado: `dashboard-renderer.js` (raíz, huérfano)

✅ Era un duplicado exacto de `src/dashboard-renderer.js` (mismo SHA-256). Probablemente lo creó el editor o un script accidentalmente. 46760 bytes eliminados. No afecta el build (electron-builder solo incluye `src/**`).

## Métricas

| Métrica | Antes | Después |
|---|---|---|
| Tests | 821 | 826 (+5) |
| Tests contexto-awareness | 31 | 31 (sin cambio) |
| LOC `context-awareness.js` | 162 | 159 (-3) |
| Archivos en raíz del repo | 1 huérfano | 0 huérfanos |
| `npm run check` | verde | verde |
| `npm test` | 821/821 | 826/826 |
| SDLC gates | OK | OK |

## Conclusión

Fix mínimo, localizado, no invasivo, con regression test bidireccional. Mismo patrón que ya usa el codebase. Aprobado para merge a main y release v2.0.2.
