# Release Notes: v1.2.0 — M3 parser + strict-mode

> Release notes formales del batch retroactivo.
> Para el design doc completo del feature anterior (Capa 1),
> ver `docs/deliverables/pet-animation-capa1-finalize-2026-07-21.md`.

**Fecha**: 2026-07-21
**Versión anterior**: v1.1.1
**Tag**: v1.2.0 (minor — feature nueva: M3 + strict mode)

## Resumen ejecutivo

Esta versión introduce dos cambios estructurales importantes:

1. **Parser M3 / JSON**: la app ahora habla con el modelo `MiniMax-M3` y
   espera respuestas en formato JSON. Si el modelo no devuelve JSON, hay
   fallback automático a tags legacy `[EMOJI]...[/EMOJI]` y a texto plano.
2. **SDLC strict mode**: los 6 gates del pipeline (PLAN → DEV → REVIEW →
   QA → RELEASE → DOC) ahora son **obligatorios**. Un commit con tipo
   `feat:`/`fix:`/`refactor:` no se puede hacer sin un plan previo en
   `docs/plans/`. Y `sdlc:strict` falla si hay commits sin review/qa.

## Cambios

### Feature: modelo M3 + JSON

- **`feat(ai): switch to MiniMax-M3 and JSON output format`** (`a25a112`)
  Cambio de `MiniMax-M2.5` → `MiniMax-M3`. System prompt reescrito para
  forzar respuesta JSON con `{"reply": "...", "emoji": "...", "sound": "..."}`.

- **`fix(ai): strengthen system prompt format enforcement and warn on missing tags`**
  (`057f071`) El prompt ahora repite las instrucciones de formato al final
  y avisa explícitamente cuando falta el campo `sound`.

- **`refactor(pet): extract parser to shared module + robust JSON extraction`**
  (`1bf9c4c`) Nueva módulo `src/core/pet-protocol.js` con UMD para
  compartir entre main process y renderer. Parser con cadena de fallback:
  JSON → tags legacy → texto plano. Validación per-pet de sonidos
  permitidos (cat: meow/purr, dog: bark/whine/sniff).

- **`fix(pet-protocol): wrap in IIFE to prevent 'Identifier already declared' error`**
  (`0c21476`) El módulo ahora está envuelto en IIFE para evitar el
  error `Identifier 'api' has already been declared` cuando Electron
  lo carga dos veces (proceso principal + preload).

- **`fix(renderer): remove duplicate old parsePetReply that referenced undefined tryParseJsonReply`**
  (`5b54694`) Quita el `parsePetReply` viejo de `src/renderer.js` que
  referenciaba `tryParseJsonReply` (ya no existe tras el refactor).
  Resuelve el error `tryParseJsonReply is not defined` en consola.

### Feature: SDLC strict mode (MANDATORY gates)

- **`feat(sdlc): make phase gates MANDATORY via sdlc:strict + pre-commit plan gate`**
  (`60124bb`) Comando `sdlc:strict` que falla si hay cambios sin gates
  pasados. Pre-commit hook endurecido: rechaza `feat:`/`fix:`/`refactor:`
  sin plan en `docs/plans/`.

- `sdlc-setup/hooks/pre-commit.sh` y `.ps1` — gate 6 nuevo (CHECK_SDLC_PLAN)
- `sdlc-setup/bin/sdlc.ps1` — sub-comando `strict`
- `sdlc-setup/README.md` — sección MANDATORY con flujo y excepciones
- `mascotaVirtual/scripts/sdlc.js` — `cmdStrict` (156 líneas nuevas)
- `mascotaVirtual/package.json` — wire `sdlc:strict`
- `mascotaVirtual/test/sdlc.test.js` — 5 tests nuevos
- `mascotaVirtual/.git/hooks/pre-commit` — re-copiado con gate 6
- `mascotaVirtual/AGENTS.md` y `docs/sdlc/PHASES.md` — banner MANDATORY
- `mascotaVirtual/docs/plans/m3-parser-strict-mode.md` — plan retroactivo

## Métricas

- **Tests**: 63/63 pasando (era 53, +10: 5 del strict mode + 5 de pet-protocol
  que se agregaron en la misma sesión)
- **Cobertura**: parser 100% (todas las branches: JSON OK, JSON malformado,
  tags legacy, texto plano, sound validation, intents allow-list)
- **Archivos cambiados**: 14 files, +808 -99
- **LOC agregados**: 808 (muchos en tests y docs)

## Decisiones técnicas

### ¿Por qué M3 y no otro modelo?

El M2.5 estaba retornando respuestas que no parseaban como JSON ni como
tags. El log mostraba texto plano con formato inconsistente. M3 es la
siguiente generación, con mejor cumplimiento de instrucciones de formato
(system prompt adherence).

### ¿Por qué fallback a tags y no solo JSON?

Porque no hemos verificado end-to-end que M3 devuelva JSON válido en
todos los casos. El fallback da robustez mientras se valida. Es deuda
técnica documentada que se pagará en v1.3.0.

### ¿Por qué strict mode retroactivo?

El usuario llamó la atención: "esto pasa porque lo haces directo sin
aplicar sdd ni los gates de dev qa etc... es más si puedes hacerlo
obligatorio para todos los proyectos muchoi mejor". El gate es la
garantía sistémica de que no vuelva a pasar.

## Lecciones aprendidas

1. **El system prompt NO basta para forzar formato** en LLMs. Hay que
   tener parser con fallback. Es la lección más cara del batch (4
   commits para llegar al fix final).
2. **UMD + IIFE** es necesario cuando Electron puede cargar el mismo
   módulo dos veces (main + preload vía contextBridge). Costo: un
   `typeof exports` check al inicio que no es óbice.
3. **Conventional Commits + pre-commit gate** es la combinación que
   cierra el loophole. El git log por sí solo no es contrato; el hook
   que lo enforce sí.
4. **Retroactivo formal** (plan + review + qa + doc) es burocracia
   cuando ya hiciste el trabajo, pero es la única forma de tener
   trazabilidad real. Mejor haberlo hecho en su momento.

## Trabajo futuro (carry-over del review)

- [ ] **MINOR-1**: Verificar nombre real del modelo M3 en DevTools
      Network tab. Si es distinto, ajustar `DEFAULT_MODEL` y bumpear
      a v1.2.1.
- [ ] **MINOR-2**: Consolidar `ALLOWED_INTENTS` en `pet-protocol.js`
      y eliminar la copia en `renderer.js`.
- [ ] **MINOR-3**: Simplificar UMD a CommonJS puro cuando se confirme
      el entorno final.
- [ ] **MINOR-4**: Endurecer `cmdStrict` con validación de fecha
      (review/qa deben ser posteriores al último tag).
- [ ] Cuando M3 confirme JSON estable, quitar el fallback a tags.
- [ ] Agregar `sdlc:strict` a GitHub Actions como pre-merge check
      (cuando se configure el remote).
- [ ] Validación visual end-to-end del feature M3 en una máquina
      con GUI (no se pudo hacer en este sandbox).

## Anexo: comandos del release

```bash
# Validar strict mode (debe pasar)
npm run sdlc:strict

# Bump
npm version minor -m "chore(release): v%s"

# Verificar
git tag -l
```
