---
name: gate-debug
description: Arregla un bug con método, primero la causa raíz y después el fix, y deja un test de regresión que falla antes del arreglo. Usar con /gate-debug, ante un bug, un test que falla o un comportamiento inesperado.
---

# gate-debug

Bug → causa raíz → test que lo reproduce → fix → suite en verde.

## Cuándo usarla

- `/gate-debug <síntoma>`, un test en rojo, un error en producción, "esto hace algo raro".
- Antes de proponer cualquier fix.

## Método

Método basado en superpowers (MIT).

Si `superpowers:systematic-debugging` está en tu lista de skills → invocalo y seguilo para encontrar la causa; para el fix, `superpowers:test-driven-development`.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

### Sin superpowers

1. Leé el error completo y reproducilo; anotá los pasos exactos.
2. Mirá qué cambió (`git log`, `git diff`) y compará con un caso que sí anda.
3. Probá una hipótesis por vez, con el cambio más chico posible.
4. No arregles el síntoma: seguí el dato hasta el punto donde se rompe.
5. Escribí un test que reproduzca el bug y miralo fallar por la razón correcta.
6. Implementá el fix mínimo y miralo pasar; después corré la suite completa.
7. Si tres intentos fallan, pará y revisá el diseño con el usuario en vez de seguir parchando.

## Artefacto gate

- El test de regresión va en una ruta de `paths.tests` (`gate config get paths.tests`): es la evidencia que `gate strict` busca para el `fix:`.
- Commits: `test: reproduce <bug>` (rojo) y `fix: <bug>` (verde), o los dos juntos en el `fix:`.
- Si de verdad no se puede testear (por ejemplo, un texto), poné en el cuerpo del `fix:` la línea `Tests: no aplica — <motivo>`.
