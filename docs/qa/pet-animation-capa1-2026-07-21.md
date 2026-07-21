# QA Sign-off: pet-animation-capa1

**Fecha**: 2026-07-21
**Branch**: main
**Review**: [docs/reviews/pet-animation-capa1-2026-07-21.md](../reviews/pet-animation-capa1-2026-07-21.md) (APPROVED)

## Resumen

Sign-off basado en auto-checks + code review aprobado. Checks visuales manuales
**no** fueron ejecutados en este flow automatizado (requieren `npm start` en una
sesión interactiva). El usuario debe correr el checklist visual antes de releasear
a usuarios externos.

## Auto-checks (todos pasaron)

- [x] `npm run check` (sintaxis) — 6 archivos JS validados, 0 errores
- [x] `npm test` — **41/41 tests pasan** (incluye los 2 nuevos de `normalizeIntent`
      y el de system prompts con INTENTS)
- [x] Pre-commit hook — sin secrets, sin archivos >500KB, sin debug statements
- [x] Code review adversarial — 0 CRITICAL, 0 MAJOR (4 MINOR, 2 INFO — todos
      no-bloqueantes)
- [x] Working tree limpio después de los 3 commits del feature

## Checklist manual (pendiente — requiere sesión interactiva)

> Estos checks los tiene que correr el usuario con `npm start` en Electron.

- [ ] La app arranca (npm start)
- [ ] La mascota aparece, no rompe layout
- [ ] Drag funciona, se asienta al soltar (gravedad)
- [ ] Cursor tracking / wandering funciona
- [ ] **EAR TWITCH visible**: esperar 10-20s en idle, las orejas deben hacer
      pequeños tics aleatorios (izq o der, ±6°)
- [ ] **WALK CYCLE visible**: la mascota camina con patas oscilando (ya estaba
      en CSS, no introducido por este commit pero vale verificar)
- [ ] **BLINK**: los ojos parpadean cada 4-7s
- [ ] **AI INTENTS**: configurar API key → abrir chat → pedirle a Luna que se
      acerque/aleje/juegue. Verificar que la mascota obedece
- [ ] Pomodoro: start / pause / reset / break / focus
- [ ] Chat con IA: enviar, recibir, parseo de tags OK (incluye nuevo [INTENT:..])
- [ ] Settings: elegir mascota, sonido, guardar API key
- [ ] Cambios persisten tras cerrar/reabrir
- [ ] SafeStorage encripta la key
- [ ] Sin errores en consola ni en debug.log

## Bugs encontrados

**Ninguno** durante auto-checks y review.

**Conocidos (MINOR, no bloquean release)**:
1. `retreat` con cursor en el centro de la mascota → cae a random walk (cosmético)
2. `approach` con cursor encima de la mascota → cae a random walk (debería quedarse
   quieta o hacer happy bounce — fácil de arreglar en follow-up)
3. Ear twitch no aplica en estado walking/sleeping (decisión documentada; el 90%
   del tiempo la mascota está idle)
4. `ALLOWED_INTENTS` duplicado en 3 archivos (deuda técnica pre-existente)

## Decisión

**APROBADO CONDICIONAL** — pasa a GATE 4 (RELEASE) con la salvedad de que el
checklist visual manual queda pendiente de verificación por el usuario.

Si el usuario encuentra issues visuales durante `npm start`, se documentan como
issues y se hace hotfix (1.0.2) después del release 1.0.1.
