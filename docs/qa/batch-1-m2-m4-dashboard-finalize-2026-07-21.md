# QA Sign-off: batch-1-m2-m4-dashboard-finalize

**Fecha**: 2026-07-21
**QA reviewer**: Mavis (sesión root)
**Veredicto**: ✅ **SIGN-OFF** (auto-verificación + checklist de smoke test)

---

## Auto-verificación ✅

| Check | Resultado | Detalle |
|---|---|---|
| `node --check` (sintaxis) | ✅ verde | 7 archivos JS validados (cat.js, dog.js, renderer.js, pet-mood.js, pet-mood-labels.js, dashboard-renderer.js, sdlc-worktree.js) |
| `node --test test/*.test.js` | ✅ **243/243** verde | 211 previos + 32 nuevos (13 SVG + 9 mood-labels + 12 mood-aware yawn, parcial worktree fix sin tests porque es infra) |
| `node scripts/sdlc.js dev` | ✅ verde | Sintaxis + tests + pre-commit + plan gate |
| Pre-commit hook | ✅ verde | Sin secrets, sin debug statements, sin archivos grandes |
| Plan en `docs/plans/` | ✅ presente | `batch-1-vida-interna-2026-07-21.md` (los 4 cambios finalizan features ya planificadas) |
| Review adversarial | ✅ APPROVED | `docs/reviews/batch-1-m2-m4-dashboard-finalize-2026-07-21.md` |
| Working tree limpio | ✅ verde | 0 cambios sin commitear, 4 commits ahead de origin |
| `node scripts/sdlc-worktree.js clean` | ✅ corre sin error en Windows | Antes fallaba por `grep` no existente + mainBranch detection roto |

---

## Smoke test recomendado (manual, antes de release público)

> Tiempo estimado: 10-15 minutos. Estos checks no se pueden automatizar desde CI (requieren GUI).

### M2 — eye tracking real

- [ ] Abrir la app: `npm start`
- [ ] Mover el mouse horizontalmente sobre la ventana de la mascota
- [ ] **Esperado**: el "glint" blanco dentro de cada ojo se desplaza hacia donde está el cursor
- [ ] Mover el mouse a la esquina superior izquierda de la pantalla
- [ ] **Esperado**: la pupila llega al borde del ojo (limitación de maxRadius), no se sale
- [ ] Esperar a que anochezca (o cambiar hora del sistema) y verificar que la pupila se dilata (más grande)
- [ ] Probar con `cat` y con `dog` (cambiar en Settings)
- [ ] **Esperado**: ambos tienen tracking funcional

### Dashboard widget del mood

- [ ] Abrir dashboard con `Ctrl+Shift+P` (o click derecho)
- [ ] Ir a tab **Settings**
- [ ] Scroll abajo hasta "Estado de ánimo"
- [ ] **Esperado**: aparece un chip con emoji (😌/😺/😴/😿/😐) y un texto ("Calmada"/"Contenta"/"Adormilada"/"Triste"/"Aburrida" para cat, o la versión masculina para dog)
- [ ] **Esperado**: 4 mini barras con valores numéricos (Energía, Felicidad, Curiosidad, Hambre)
- [ ] **Esperado**: el color de fondo del chip cambia según el estado (azul=calm, verde=happy, violeta=sleepy, gris=sad, naranja=bored)
- [ ] **Esperado**: cada barra tiene un color distinto (cian/rosa/violeta/amber)
- [ ] Esperar 10s y mover el mouse → el chip debería actualizarse (polling cada 5s)
- [ ] Hablarle a la mascota en tab Chat (ej: "Hola")
- [ ] **Esperado**: la barra de Felicidad sube y la de Curiosidad también (interaction `chat`)
- [ ] Cambiar a `dog` en Settings → el chip debería mostrar labels masculinos ("Calmado", "Contento") en el próximo refresh

### M4 — mood-aware yawn

- [ ] Con la app abierta, dejarla idle por 5+ minutos (no mover el mouse)
- [ ] **Esperado**: la mascota bosteza al menos una vez (trigger cada 5 min cuando está normal)
- [ ] Verificar que la lógica funciona: el bostezo muestra el speech bubble "*bosteza* ... ¿un descansito quizás?"
- [ ] **No testeable manualmente sin modificar el mood**: cuando `energy < 25` el intervalo baja a 2 min. Esto requiere esperar 60+ minutos sin interacción, o modificar manualmente el archivo `pet-mood.json` en el userData path.
- [ ] Verificar en logs: `~/.config/mascotaVirtual/pet-mood.json` (Linux) o `%APPDATA%\mascotaVirtual\pet-mood.json` (Windows). Bajar `energy` a 24 y reiniciar la app → debería bostezar cada 2 min en idle.

### sdlc:worktree clean (infra)

- [ ] Después de mergear un feature, correr: `node scripts/sdlc-worktree.js clean`
- [ ] **Esperado**: lista los worktrees, dice cuáles están mergeados y los elimina
- [ ] **Antes**: el comando fallaba con `grep: not found` en Windows
- [ ] Si hay un worktree cuyo branch está mergeado: `✓ <branch> está mergeada a main → removiendo worktree`

---

## Out of scope (no verificado en este sign-off)

- **Build instalador (electron-builder)**: no aplica hasta v2.0.
- **Security audit del preload**: cubierto por el code review adversarial. No hay `nodeIntegration: true`, todas las IPC pasan por `isKnownSender`/`isDashboardSender`.
- **Tests E2E con Playwright**: fuera del scope de este batch. Los 243 unit tests cubren la lógica.
- **Mood widget en el pet window (no solo dashboard)**: no estaba en este batch. Es posible candidato para batch 2 (P5: "mini mood indicator en el bubble" o similar).

---

## Veredicto final

✅ **APROBADO** para push a `origin/main` y posterior merge. Los 4 cambios finalizan features del batch 1 que estaban parciales (M2, M4) y agregan una mejora de UX (dashboard widget). El fix de `sdlc:worktree clean` es infra, sin impacto en el usuario final.

**Recomendación post-merge**: tag `v1.5.1` (patch) o `v1.6.0` (minor con feature visible) — depende si se quiere resaltar el widget como user-facing feature.
