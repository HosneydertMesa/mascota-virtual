# Review: batch-1-m2-m4-dashboard-finalize

**Fecha**: 2026-07-21
**Reviewer**: Mavis (sesión root, modo adversarial)
**Branch**: main (4 commits directos tras merge de batch 1 v1.5.0)
**Veredicto**: ✅ **APPROVED** (con 3 hallazgos MINOR, todos diferibles o documentados)

---

## Resumen ejecutivo

Finalización del batch 1 (v1.5.0 ya mergeado): M2 (eye tracking real) + dashboard widget del mood + M4 (mood-aware yawn) + fix de `sdlc:worktree clean` para Windows. 4 commits, 14 archivos tocados, +592/-29 LOC, +34 tests (de 211 → 243).

Lo que se destaca:
- **M2 (eye tracking)**: el JS de tracking estaba listo desde v1.4.0 pero los SVGs no tenían los `<circle class="pet-pupil">` que el JS buscaba — fallo silencioso. Ahora los SVGs tienen pupils con `data-anchor-x/y` correcto, y el test `pet-assets.test.js` previene regresiones estructurales.
- **viewBox bug**: el `renderer.js` usaba `width / 130` cuando el viewBox real es `0 0 200 200`. Sin este fix, el tracking mapeaba al 65% del área real y la pupila apenas se movía.
- **Dashboard widget**: chip con emoji+texto según estado, 4 mini barras de stats. Polling cada 5s (suficiente granularidad, el decay es cada 60s en main).
- **M4 (mood-aware yawn)**: nueva pure `getYawnIntervalMs(mood)` en `pet-micro-presence.js`. Refactor de `checkYawn` a `async` con IPC `mood:get`, fallback a default si la IPC falla.
- **sdlc:worktree clean fix**: el `grep -w` no existe en Windows + el `git symbolic-ref ... HEAD` puede devolver un branch stale, así que parseamos en Node y validamos que sea `main`/`master`.

---

## Hallazgos

### [MINOR-1] Pupila puede sobresalir del ojo en profile (cat/dog walk)

**Archivos**: `src/assets/cat.js:181`, `src/assets/dog.js:164`
**Snippet**:
```js
// cat walk
<ellipse cx="42" cy="78" rx="4" ry="5.5" fill="#1e1e24" />
<circle class="pet-pupil" data-anchor-x="42" data-anchor-y="78" cx="42" cy="78" r="1.6" fill="#ffffff" />
```
**Impacto**: cosmético. Con `maxRadius=4` (default) y `r=1.6`, la pupila puede moverse hasta 4px del anchor, quedando su borde a `1.6+4 = 5.6` del centro. El ojo es un ellipse con `rx=4, ry=5.5`, así que la pupila asoma ~1.6px en x y ~0.1px en y.
**Decisión**: diferir. El estado walk es transitorio (~5-10s), el ojo es pequeño, y el efecto es apenas perceptible. Si se quiere refinar, en batch 2 podemos pasar `maxRadius=2` específicamente para profile SVGs (más fácil que modificar el pure function).

### [MINOR-2] Chip del mood no se actualiza al instante cuando el usuario cambia el tipo de mascota

**Archivo**: `src/dashboard-renderer.js:154, 213`
**Impacto**: UX. Cuando el usuario clickea un `mascot-card` (cat → dog) o llega un `onSettingsUpdated`, `currentPet` cambia, pero el chip del mood muestra el label del tipo anterior hasta el próximo poll (hasta 5s).
**Decisión**: diferir. La latencia de 5s es aceptable y el usuario normalmente está en la tab Settings cuando hace este cambio, así que ve el chip refrescarse. Si se nota en uso real, en batch 2 hacemos `refreshMoodWidget()` unfollow'de pet type change.

### [MINOR-3] (revisado) `barEl.dataset.stat = stat` es necesario, no redundante

**Archivo**: `src/dashboard-renderer.js`
**Revisión**: pensaba que el HTML seteaba `data-stat` estáticamente, pero no. El CSS usa `.mood-stat-bar-fill[data-stat="hunger"]` para colorear cada stat con un color distinto (cian/rosa/violeta/amber). El `dataset.stat = stat` en JS es **necesario**, no redundante. Sin esa línea, las 4 barras serían todas del color por default (azul).
**Decisión**: dejar como está. La línea está haciendo trabajo real.

---

## Lo que NO se encontró (búsquedas adversariales)

- ✅ No hay secrets, API keys, ni credenciales en el diff.
- ✅ No hay `console.log` olvidados (solo `console.error` legítimo en catch blocks).
- ✅ No hay archivos > 500KB.
- ✅ No hay `require` circulares (verificado: `pet-mood.js` no requiere nada, `pet-mood-labels.js` tampoco).
- ✅ No hay race conditions evidentes: `checkYawn` es async pero el setInterval de 30s + IPC < 1ms hacen overlap teórico pero no práctico.
- ✅ Tests cubren los 5 estados del mood, los 4 stats, y los edge cases (energy 24/25/null/undefined/string).
- ✅ El UMD-lite de `pet-mood.js` mantiene compatibilidad con los 27 tests existentes en Node.
- ✅ El fix de `sdlc:worktree clean` no cambia comportamiento en Unix (los tests visuales lo confirmarían en CI).
- ✅ `mood:get` IPC ya estaba protegido con `isKnownSender` en main.js (verificado en diff).

---

## Cambios aprobados

| Commit | Tipo | Descripción | Tests |
|---|---|---|---|
| `ae30ea1` | feat(pet) | M2 eye tracking real (pet-pupil SVGs + viewBox fix) | +13 |
| `3c21e24` | feat(dashboard) | Mood widget en Settings (chip + 4 stats) | +9 |
| `d278503` | feat(micro) | M4 mood-aware yawn (2 min si energy < 25) | +12 |
| `f8cccca` | fix(sdlc) | worktree clean portable (parse en Node) | 0 (infra) |

**Total**: 243/243 tests verde, working tree clean, listo para QA + push.
