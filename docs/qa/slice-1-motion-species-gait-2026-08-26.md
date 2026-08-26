# QA Sign-off: slice 1 MOTION

> Species gait (Luna ≠ Max), idle variety (sit / sleep / stretch), mood
> class on the live SVG pet. Plan:
> `docs/plans/slice-1-motion-species-gait-2026-08-26.md`.

**Fecha**: 2026-08-26
**Branch**: `cursor/slice-1-motion-e5f8`
**Plan companion**: `docs/plans/slice-1-motion-species-gait-2026-08-26.md`
**Review companion**: `docs/reviews/slice-1-motion-species-gait-2026-08-26.md`

**Verdict**: **APPROVED** (automatizado; dogfood GUI no disponible en este entorno)

---

## Resumen de lo que se verifica

1. Walk CSS-distinct en `animations.css` (no duplicado en `dashboard.css`).
2. Exports sit/lay/stretch distintos de idle/sleep/walk.
3. Renderer dispara esos `PetViewport` states + `mood-*` via `getMood`.
4. Walking no reactiva swap 167ms.
5. Physics / chat / AI / Pomodoro / PET_PROFILES no se tocaron.

## Runtime evidence

### Test 1 — contratos MOTION

```
node --test test/pet-assets.test.js test/idle-motion.test.js
# tests 33
# pass 33
# fail 0
```

### Test 2 — suite completa + syntax

```
npm run check   # exit 0
npm test        # 885 pass / 6 fail
```

Los 6 fails son **preexistentes** en Linux: `test/app-detector.test.js`
(`queryForegroundApp` short-circuit si `process.platform !== 'win32'`).
No se tocó `src/services/app-detector.js`. En Windows esos tests siguen
siendo el contrato de PowerShell.

### Test 3 — lo que no se pudo dogfoodear aquí

No hay sesión Electron/GUI en este cloud agent. No se sampleó
`getComputedStyle().transform` de las patas en Chromium (el evidence
script de walk v2 carga `dashboard.css` solo; el gait canónico ahora
está en `animations.css`; el preview HTML ya importa ambos).

Checklist manual pendiente en máquina Windows del owner:

- [ ] `npm start` — Luna camina contenida (~0.65s), Max más amplio (~0.48s)
- [ ] Idle 15–25s → sitting (o laying si sleepy)
- [ ] Idle ~45s → sleeping
- [ ] Wake / landing bounce → stretch 1.2–2s → idle
- [ ] Walking cancela rest y gana
- [ ] `#pet-container` tiene `mood-happy|calm|sleepy|sad|bored`
- [ ] Dashboard preview Luna/Max (usa `window.dogSVG` / `window.catSVG`)
- [ ] Drag, fall, bar-mode, cursor-follow iguales
- [ ] Chat / Pomodoro / settings API key sin cambios

## Acceptance criteria

- [x] Tests de contrato + `npm run check` verdes
- [x] Gait Luna ≠ Max en CSS (periodo, keyframes, bob)
- [x] Pairing diagonal, sin swap 167ms
- [x] sit/lay/stretch no son aliases; renderer setea los estados
- [x] mood-* desde getMood (código + tests)
- [x] Physics / chat / AI / Pomodoro / PET_PROFILES intactos
- [ ] Dogfood visual en desktop (owner)

## Decision

**Verdict**: **APPROVED** para merge desde el lado automatizado.
El dogfood visual es el único ítem abierto y es el mismo gap de
siempre en CI sin Electron display.
