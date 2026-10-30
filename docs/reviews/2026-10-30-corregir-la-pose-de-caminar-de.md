---
id: 2026-10-30-corregir-la-pose-de-caminar-de
plan: docs/plans/2026-10-30-dog-walk-pose-fix.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 4
reviewed_at: 2026-10-30
---

**Verdict**: APPROVED

# Review: corregir la pose de caminar de Max (torso y cola)

**Fecha**: 2026-10-30
**Reviewer**: Agente revisor (pasada adversarial contra el plan)
**Plan**: `docs/plans/2026-10-30-dog-walk-pose-fix.md` (aprobado, con el addendum §6 del review previo, MAJOR-1)
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 4 MINOR

> Nota de alcance: este entorno de revisión no tiene shell (`npm test` / `npm run check` no se pudieron ejecutar). La verificación es **estática y geométrica**: recalculé a mano, sobre el `d` real del SVG, las medidas que toman los guards nuevos y los guards preexistentes que el art toca. La ejecución de la suite queda para `/gate-qa`.

---

## Resumen ejecutivo

El diff implementa el plan completo (paso 1 + paso 2) y cierra el MAJOR-1 del review anterior:

- **Arte**: solo se reescribe el bloque `const dogWalkSVG` de `src/assets/dog.js` (torso `.pet-body` + cola `.anim-wag` + sus planos de sombra y el parche crema del pecho). Cabeza, orejas, patas, sombra de piso, orden de pintado y el resto del archivo quedan **intactos**.
- **Pivotes**: `152px 106px` (cola) y `108px 113px` (torso) inline **y** en las dos reglas CSS que ganan la cascada en walk (`.walking-bob.dog-walk .anim-wag-fast`, `.dog-walk .pet-body`).
- **Tests**: 5 tests **nuevos** (cola enroscada, torso de perro en marcha, pata lejana pegada al vientre, hash congelado de las otras 11 poses, fila del README). **Cero tests existentes modificados, relajados, skippeados ni borrados** — el diff de `test/pet-assets.test.js` es 100 % aditivo (`crypto` + 5 tests + helpers). Ningún assert se cambió "para que pase".
- **Evidencia visual**: `docs/pet-screenshots/dog-walk.png` regenerada (binario distinto) y fila del README actualizada con los cuatro criterios que hay que mirar.

No encontré nada que bloquee. Los 4 MINOR son observaciones de estilo/fragilidad, no incumplimientos.

---

## Verificación geométrica (criterios numéricos del plan)

Recalculé sobre el `d` real del SVG (las medidas coinciden con lo que toman los guards, que usan el mismo aplanado de curvas y las mismas intersecciones verticales).

### Torso (`.pet-body`)

BBox: `x ∈ [55.0, 162.0]`, `y ∈ [85, 142]` → ancho 107 px.

| Medida | Plan | Medido | |
|---|---|---|---|
| Lomo: hombro → plinga | descenso ≥ 4 px | (87, 85.0) → (121, 92.5) = **7.5 px** | ✅ |
| Lomo: grupa | vuelve a subir | (146, **87.5**) ≤ plinga − 2 | ✅ |
| Vientre: pecho → cintura | sube ≥ 8 px | y 142 (pecho) → y 129.3 (cintura) = **12.7 px** | ✅ |
| Profundidad pecho vs cintura | ≥ 8 px | 56.5 px vs 35.1 px = **21.4 px** | ✅ |
| Vientre plano | §3 + addendum §6 | `y=142` de `x=78` a `x=107`, la cintura arranca en 113–129 | ✅ |

### Cola (`.anim-wag`)

| Medida | Plan | Medido | |
|---|---|---|---|
| Punta sobre el torso | ≥ 10 px | mín y cola 57.2 vs mín y torso 85 = **27.8 px** | ✅ |
| Raíz en la grupa | tercio trasero (`x ≥ minX + 0.62·ancho` = 121.3) | **toda** la cola tiene `x ≥ 143`; los puntos enterrados van de 143 a 162 | ✅ |
| Aire sobre el lomo | ≥ 5 px en la banda `x ∈ [87, 152]` | los puntos **visibles** de la cola (curva del rizo, x 143–152) quedan **20–30 px** por encima del lomo | ✅ |
| Raíz enterrada | ≥ 6 px profundidad, ≥ 5 px envergadura | traslapo cola↔torso de ~10–16 px de envergadura y >20 px de profundidad | ✅ |

### Pata delantera lejana (`.right-paw`) — el MAJOR-1

- Tramo plano del canto superior de la pata (x 85.6 → 106.4), canto a `y = 139…141`.
- Vientre del torso plano en `y = 142` en todo ese tramo → el torso **cubre** el canto de la pata: no queda cuna de fondo ni extremo de tinta abierto al aire (el fallo del review anterior era vientre en `y=138` en `x=102`, con la pata en 140.9 → ~5 px de fondo).
- El guard nuevo (`belly >= pawTop - 0.5`) **mordería** ese fallo: con el vientre viejo en 138 y el canto de la pata en 140.9, `138 >= 140.4` es falso → rojo. El guard es real, no decorativo.

### Guards preexistentes que el art nuevo puede mover

| Guard | Resultado |
|---|---|
| Sombra contenida (tol. 0.7 px) | Sombra del torso 1.3–3.4 px dentro del contorno; sombra de la cola ≥1.2 px dentro (el punto más ajustado es `(150.4, 64)`, ~1.2 px del canto interior del rizo). ✅ |
| Silueta = 1 componente | La cola se solapa con la grupa (no es una astilla) y el polígono de la cola no se autointersecta. ✅ |
| Cabeza ↔ cuerpo (≥8 px, ≤2 px) | Profundidad ≈ 11 px; **min gap real ≈ 0.55 px** (x≈91–96), el nudo del cuello sigue tocado. ✅ |
| Patas delanteras sin doble línea (≤10 puntos a ≤1.2 px del contorno) | ~2 puntos (`.left-paw`) y ~3 (`.right-paw`, por el extremo de tinta en `(107,142)`). ✅ |
| Orden de pintado / sombra de piso primero | Intacto. ✅ |
| Paleta, una sola tinta, pesos de línea, parches crema sin contorno | Intactos: `#F7B851 / #C97E22 / #8A4A12 / #FFF8EC / #E9CFA8 / #3B2416`, contornos 3.4, sin degradados ni `url(#…)`. ✅ |
| Deriva CSS ↔ SVG (52 checks) | Inline `152px 106px` / `108px 113px` == CSS. La regla que gana no cambió (mismo selector, mismos `!important`), así que el guard sigue comparando contra el mismo ganador. ✅ |

### Alcance

El diff solo toca: `src/assets/dog.js` (bloque `dogWalkSVG`), dos reglas de `src/styles/animations.css`, `test/pet-assets.test.js` (aditivo), `docs/pet-screenshots/README.md` (una fila) y `docs/pet-screenshots/dog-walk.png` (binario). `src/assets/cat.js` y las otras 5 poses de Max no aparecen en el diff, y el test nuevo congela sus sha256 (11 poses) con el comentario de que solo se actualizan si otro plan redibuja esa pose.

### Tests nuevos — ¿muerden?

- Los 5 derivan la geometría del SVG real (no literales del `d`), así que un redibujo futuro que rompa la pose los pone en rojo. Verifiqué que hoy pasan con holgura (los mínimos reales están 2–4× por debajo/por encima del umbral).
- El guard de la fila del README (12 regex sobre el texto de la celda) casa con el texto nuevo de `docs/pet-screenshots/README.md`.
- Ninguno es tautológico: cada uno tiene un `assert.ok(... > 0)` / `checked > 20` / `length === 11` que impide que la medida salga vacía.

---

## MINOR (no bloquean)

1. **La cola perdió los dos trazos de detalle interiores** (`stroke-width 1.8`) que tenía el rizo viejo. El plan no los exigía ni los prohibía y el rizo nuevo se lee más limpio (es una forma delgada, los trazos la ensuciaban), pero es una pérdida de detalle no contemplada: si el revisor visual de QA prefiere algo de "pelo" en la punta, es un tweak de 1 línea.
2. **El encuentro cuello/lomo se movió hacia el límite del guard.** La tinta de la cabeza arranca en `(107, 86.4)`; con el lomo nuevo ese punto queda ~1.5 px **por encima** de la línea del lomo (antes estaba ~0.8 px por debajo, dentro del torso). El guard (`≤ 2 px`) sigue verde porque el mínimo real está en x≈91–96 (~0.55 px), pero la holgura se redujo: si se vuelve a bajar el lomo en ese tramo, el guard va a morder.
3. **`flatTopSpan` depende de una arista virtual.** El `cel-outline` de `.right-paw` es un path *abierto*; el helper lo cierra en línea recta de `(107,142)` a `(88,139)`, y esa recta es la que acota el tramo plano medido (x 85.6–106.4). Funciona con el arte actual, pero es frágil: un redibujo futuro de la pata que cierre el path con curva cambiaría el tramo medido sin que nadie lo note. Conviene recordarlo en el comentario del helper.
4. **El muestreo del guard de cola es por vértices** (24 por curva). Una inmersión de 1–2 px de la cola entre dos vértices pasaría el filtro. Hoy no aplica (la cola nueva está 20+ px por encima del lomo en toda la banda), y el criterio es el que fija el propio plan, así que no lo cambio: lo dejo anotado para cuando se vuelva a tocar el rizo.

---

## Veredicto por criterio de aceptación

| Criterio | Estado |
|---|---|
| Cola enroscada de shiba, aire sobre el lomo | ✅ |
| Torso de perro en marcha (lomo y vientre) | ✅ |
| Silueta única (fondo claro y oscuro) | ✅ (verificado en `dog-walk.png`) |
| Cel-shading, una tinta, dos tonos planos, paleta fija | ✅ |
| Identidad shiba, cabeza/hocico/ojo (48,66) sin cambios | ✅ |
| Alcance acotado + hash sha256 de las otras 11 poses | ✅ |
| Raíz enterrada (≥6 px / ≥5 px), punta ≥10 px, aire ≥5 px | ✅ |
| Pecho ≥8 px más hondo, lomo no plano | ✅ |
| Pivotes CSS ↔ SVG sincronizados | ✅ |
| Guards de arte preexistentes verdes | ✅ |
| Pata lejana pegada al vientre | ✅ |
| `npm test` / `npm run check` verdes | ⚠️ pendiente de `/gate-qa` (verificado estáticamente) |
| PNG regenerada + README documentando qué mirar | ✅ |

**Conclusión**: el diff cumple el plan (incluido el addendum §6 que cerró el MAJOR-1), no debilita ningún test y respeta el alcance declarado. Se aprueba; los 4 MINOR quedan como observaciones para el próximo toque de este arte.
