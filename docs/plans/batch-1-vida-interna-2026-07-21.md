# Plan: batch-1-vida-interna

**Fecha**: 2026-07-21
**Versión target**: v1.4.0
**Sprint**: 3 (semanas 3-4)
**Depende de**: batch 0 (T1 refactor — done)
**Habilita**: batch 2 (recuerdos + context)

---

## 1. Objetivo

Meter **vida interna real** a la mascota: estado emocional persistente que decae con el tiempo, micro-animaciones que la hacen sentir "viva" sin gastar recursos de IA, y nombre custom. Esto convierte la mascota de "responde cuando le hablan" a "tiene estado propio entre interacciones".

---

## 2. Features del batch (5 features en 2 tracks paralelos)

### Track A — Mood system (Worker 1) [L, 5-7 días]
- **A1** Mood system con 5 estados internos (happy, calm, sleepy, sad, bored) + decay temporal
- **W6** Mood-aware responses: si está sleepy recomienda break, si está happy es más juguetón

### Track B — Micro presence + custom name (Worker 2) [M, 3-4 días]
- **M1** Respiración idle (chest rise/fall cada ~3s)
- **M2** Eye tracking: pupilas siguen el cursor sin mover cuerpo
- **M3** Pupil dilation nocturna
- **M4** Bostezo: cada ~5 min en idle, lead-in a sugerencia de break
- **P7** Custom name: la mascota responde al nombre

---

## 3. Orquestación con worktrees

**Lección batch 0**: workers en mismo cwd se pisaron en main.js. Solución: **worktrees**.

### Setup (orquestador)

```bash
npm run sdlc:worktree -- add feat/b1-mood-system
npm run sdlc:worktree -- add feat/b1-micro-presence
```

Resultado:
- `../mascotaVirtual-feat-b1-mood-system/` (branch feat/b1-mood-system)
- `../mascotaVirtual-feat-b1-micro-presence/` (branch feat/b1-micro-presence)

### Workers

Cada worker opera en su worktree. NO hace `git checkout` ni `git stash`. Commitea en su branch y pushea.

### Orquestador

- Monitorea: `git fetch && git log origin/feat/b1-mood-system --oneline`
- Merge serializado: cuando worker 1 termina, merge a main → release. Después worker 2.
- O merge ambos a main al final y resolver conflictos si hay (no debería porque tocan archivos distintos).

---

## 4. Detalle de features

### A1 + W6 — Mood system (Worker 1)

**Concepto**:
- Estado interno `{ energy, happiness, curiosity, hunger }` que decae con tick cada minuto
- 5 estados derivados (umbral-based): `happy | calm | sleepy | sad | bored`
- Persistencia en JSON local (`<userData>/pet-mood.json`)
- Inicialización: arranca en `calm` con valores medios
- Decay: cada minuto, -1 a `energy`, -0.5 a `happiness` (si no hay interacción)
- Recharge: cada chat con la IA → +5 a `happiness`, +3 a `curiosity`
- System prompt influence: el M3 recibe el mood actual como contexto y lo usa para elegir `intent` apropiado

**Archivos**:
- `src/core/pet-mood.js` — pure functions (compute state, apply decay, apply interaction)
- `src/services/mood-store.js` — persistencia JSON
- `main.js` — wire: tick interval, chat integration
- `src/services/ai.js` — modificar system prompt para incluir mood
- `test/pet-mood.test.js` — 12-15 tests (compute, decay, persistence)

**Criterios de aceptación**:
- [ ] Estado se persiste entre sesiones
- [ ] Decay funciona: tras 30 min sin chat, energy baja visible
- [ ] Tras chat con IA, happiness sube
- [ ] System prompt incluye mood → la IA responde diferente según mood
- [ ] `sdlc:dev` verde

### M1, M2, M3, M4, P7 — Micro presence (Worker 2)

**Concepto**:
- M1 Respiración: CSS keyframe `breathe` en el SVG del pet, ~3s loop, scaleY 1.0 → 1.04 → 1.0
- M2 Eye tracking: dos círculos pequeños (pupilas) que se posicionan absoluto en el SVG, con JS que actualiza su posición según el cursor (delta del centro del ojo al cursor, clamp a radio máximo)
- M3 Pupil dilation: cuando `powerMonitor` emite evento de luz baja (no hay en Electron, fallback a hora del día: 20:00-07:00) → pupilas más grandes
- M4 Bostezo: cada 5 min en idle, mostrar SVG de bostezo (overlay o animación CSS), después sugerir break
- P7 Custom name: en settings, agregar input "Nombre de la mascota", guardar en JSON. La IA usa el nombre en respuestas ("Hola, soy Luna, pero podés llamarme cómo quieras, ¿cuál te gusta?")

**Archivos**:
- `src/assets/cat.js` y `src/assets/dog.js` — agregar pupilas, animación de respiración, bostezo
- `src/styles.css` — keyframes breathe, yawn
- `src/renderer.js` — eye tracking JS, pupil dilation toggle, yawn trigger
- `src/dashboard-renderer.js` — settings: custom name input
- `main.js` — IPC para set/get name
- `src/services/ai.js` — system prompt incluye pet name
- `test/micro-presence.test.js` — tests para los pure functions (e.g., pupil position calculation)

**Criterios de aceptación**:
- [ ] Mascota respira visiblemente (no molesta)
- [ ] Pupilas siguen el cursor dentro del cono
- [ ] De noche, pupilas más grandes
- [ ] Bostezo cada ~5 min en idle, después sugiere break (toast o chat)
- [ ] Custom name se guarda, IA lo usa
- [ ] `sdlc:dev` verde

---

## 5. Plan de tests

### Worker 1 (mood)
- 12-15 tests nuevos
- Cubre: compute state (umbrales), apply decay, apply interaction, persistence (load/save)

### Worker 2 (micro)
- 6-8 tests nuevos
- Cubre: pupil position (delta + clamp), name storage, mood → time-of-day mapping

**Total batch 1**: +18-23 tests → de 129 a ~150

---

## 6. Plan de merge

### Opción A: serializado (recomendado)
1. Worker 1 termina → push → orquestador merge → release v1.4.0
2. Worker 2 termina → push → orquestador merge → release v1.4.1 o v1.5.0

**Pro**: si algo falla, sé cuál.
**Contra**: más lento (2 releases).

### Opción B: paralelo
1. Ambos workers terminan
2. Orquestador merge ambos a main (resuelve conflictos si los hay)
3. Release v1.4.0 con todo

**Pro**: 1 release.
**Contra**: si hay bug, no sé de qué feature viene.

**Decisión recomendada**: opción A (serializado), porque los workers pueden terminar en momentos diferentes y el orquestador hace review/QA entre cada uno.

---

## 7. Riesgos

| Riesgo | Mitigación |
|---|---|
| Worker 1 (mood) se atrasa | Worker 2 puede mergear primero; mood no bloquea micro |
| Decay mood demasiado rápido/lento | Test con valores extremos (24h sin chat) |
| Pupilas se ven raras con SVGs existentes | Revisar SVGs de cat/dog antes; iterar con screenshots |
| Custom name choca con system prompt (longitud, caracteres raros) | Validar en settings; default fallback a "Luna"/"Max" |

---

## 8. Criterios de salida del batch

- [ ] Track A (mood) mergeado a main con review/QA
- [ ] Track B (micro) mergeado a main con review/QA
- [ ] 150+ tests verde
- [ ] `sdlc:strict` verde
- [ ] Tag v1.5.0 (o v1.4.0 + v1.4.1) pusheado
- [ ] Changelog v1.4.0 (o v1.5.0) en `docs/deliverables/`
- [ ] Smoke test manual (10-15 min): respirar, pupilas, bostezo, mood en chat

---

## 9. Changelog

| Fecha | Cambio | Autor |
|---|---|---|
| 2026-07-21 | Creación del plan de batch 1 | Mavis |
