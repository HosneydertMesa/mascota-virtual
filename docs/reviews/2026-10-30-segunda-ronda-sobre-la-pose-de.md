---
id: 2026-10-30-segunda-ronda-sobre-la-pose-de
plan: docs/plans/2026-10-30-dog-walk-torso-round2.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 6
reviewed_at: 2026-10-30
---

**Verdict**: APPROVED

# Review: segunda ronda sobre la pose de caminar de Max (torso)

**Fecha**: 2026-10-30
**Reviewer**: Agente revisor (pasada adversarial contra el plan)
**Plan**: `docs/plans/2026-10-30-dog-walk-torso-round2.md` (aprobado, `visual: true`, 12 criterios de aceptación)
**Diff**: `docs/pet-screenshots/README.md`, `docs/pet-screenshots/dog-walk.png`, `docs/plans/2026-10-30-dog-walk-torso-round2.md` (nuevo), `src/assets/dog.js`, `test/pet-assets.test.js`
**Veredicto**: ✅ **APPROVED** — 0 CRITICAL, 0 MAJOR, 6 MINOR

> Nota de alcance: este entorno de revisión no tiene shell (`npm test` / `npm run check` no se pudieron ejecutar). La verificación es **estática y geométrica**: recalculé a mano, sobre el `d` real del SVG, todas las medidas que toman los guards tocados y los guards preexistentes que el arte puede mover (mismas curvas, mismo aplanado y mismas intersecciones verticales que usa el helper). La ejecución de la suite y la revisión visual con zoom quedan para `/gate-qa`.

---

## Resumen ejecutivo

El diff implementa el plan de punta a punta y **no debilita ningún test**:

- **Arte**: se reescriben **solo** el `cel-outline` y el `cel-shadow` del torso `.pet-body` de `dogWalkSVG`. El `d` resultante es **idéntico, carácter por carácter**, a la geometría objetivo del §3 del plan (contorno y sombra). Cola, cabeza, orejas, patas, sombra de piso, parches crema, pivotes (`152px 106px` / `108px 113px`) y las otras 11 poses quedan **intactos**.
- **Tests**: 2 guards **nuevos** + 1 guard **modificado** (el que el plan manda modificar) + 5 asserts nuevos en el guard del README. La modificación del guard del lomo es **la que pide el plan explícitamente** (§2, §4.1 y `risks[0]`): el criterio viejo ("el lomo desciende ≥ 4 px **y vuelve a subir** en la grupa") *es* la joroba que esta ronda elimina. Las aserciones de pecho/cintura se conservan intactas. Cero tests borrados, skippeados ni relajados por fuera de lo planificado.
- **Los tres guards tocados muerden**: recalculé los tres contra el arte de la ronda 1 y **los tres fallan** (lomo: la grupa queda 5.5 px por encima de la plinga; vientre: sube a y=129 en x=129 y vuelve a caer a ≈132.5 en x=137; sombra: la punta de x≈122 queda 6-7 px por encima del promedio de sus vecinas). No son decorativos.
- **Evidencia visual**: `docs/pet-screenshots/dog-walk.png` regenerada (binario distinto) y la fila del README reescrita con los tres criterios nuevos.

No encontré nada que bloquee. Los 6 MINOR son observaciones de higiene, fragilidad y trazabilidad; ninguno incumple un criterio de aceptación.

---

## Verificación geométrica (criterios numéricos del plan)

Recalculé sobre el `d` real del SVG nuevo. BBox del torso: `x ∈ [54.87, 162]`, `y ∈ [85, 142]` → ancho **107.13 px**.

### 4.1 — Guard modificado: lomo casi recto, sin joroba

Ventana del guard: `shoulderX = 54.87 + 0.30·107.13 = 87.0` → `rumpX = 54.87 + 0.85·107.13 = 145.9`.

| Medida | Criterio | Medido | |
|---|---|---|---|
| Línea del lomo | nunca sube más de 1 px por encima del máximo ya alcanzado | **monótona**: 85.0 (x=86) → 85.3 (x=96.7) → 86.2 (x=106.5) → 87.6 (x=117.3) → 88.5 (x=124) → 90.2 (x=145.3) | ✅ |
| Desnivel total del tramo | ≤ 7 px | **5.25 px** (90.25 − 85.0) | ✅ (margen 1.75 px) |
| Pecho vs cintura (intacto) | `chestDepth ≥ waistDepth + 8` | pecho ≈ 56.9 px (x≈87) vs cintura ≈ 44.2 px (x=126.1) → **+12.7 px** | ✅ (margen 4.7 px) |
| Vientre pecho → cintura (intacto) | `chestBelly − waistBelly ≥ 8` | 142.0 − 132.9 = **9.07 px** | ✅ (margen **1.07 px** ⚠️ ver MINOR-2) |

Contra el arte de la ronda 1 el guard **falla**: el lomo viejo subía de 93 (plinga) a 87.5 (grupa) → 5.5 px por encima del máximo ya alcanzado. La lógica (`deepestBack = max(...)`; `assert(y >= deepestBack − 1)`) implementa exactamente el contrato del §4.1.

### 4.2 — Guard nuevo: vientre de una sola curva

`xDeep` (derecha de la meseta más baja) ≈ **107.5**; `groinX = 54.87 + 0.78·107.13 = 138.4`.

| Medida | Criterio | Medido | |
|---|---|---|---|
| Monotonía del vientre | desde `xDeep` nunca vuelve a bajar (tol. 0.5 px) | **monótono subiendo**: 141.5 (x=106) → 140.5 (x=110) → 134.75 (x=122.25) → 132.85 (x=126.1) → 130.5 (x=133) → 130.3 (x=138.4) | ✅ |
| Subida real hacia la ingle | ≥ 8 px | 142.0 → 130.3 = **11.7 px** | ✅ (margen 3.7 px) |

Contra el arte viejo **falla** en x≈137 (vuelve a caer de 129 a ≈132.5). El guard mide la línea real del `d`, no literales: un redibujo futuro que reintroduzca la muesca vuelve a caer en rojo.

### 4.2 — Guard nuevo: la sombra del vientre no forma gancho

Borde superior `u(x)` del plano `cel-shadow` del torso, en la ventana `[xDeep − 10, groinX] = [97.5, 138.4]`:

- `u(x)` es **monótono decreciente**: 135.7 (máx. en x≈87) → 135.3 (x=97.5) → 134.5 (x=107) → 130.7 (x=120) → 125.0 (x=134) → 122.9 (x=138.4).
- Margen más ajustado contra la regla `u(x) ≥ (u(x−8)+u(x+8))/2 − 3`: ≈ **2.6 px** (en x≈125-130). ✅

Contra el arte viejo **falla** en x≈122 (la punta a y≈120.5 contra un límite de ≈125.3).

### 4.3 — Guards preexistentes que el arte nuevo puede mover

| Guard | Resultado |
|---|---|
| Sombra contenida en la silueta (tol. 0.7 px) | La banda nueva sigue al contorno nuevo con **1.5-2.4 px** de holgura en todo el bajo (x=70→2.1, x=96→2.0, x=110→2.3, x=122→2.25, x=134→2.4, x=146→2.2, x=150→1.9) y ~8 px en la grupa. ✅ |
| Cola: raíz en el tercio trasero (x ≥ 121.4) | La cola entra en el torso solo en x ≥ 145. ✅ |
| Cola: punta ≥ 10 px sobre el torso | mín. y cola ≈57.2 vs mín. y torso 85 → **27.8 px**. ✅ |
| Cola: ≥ 5 px de aire sobre el lomo en la banda | El rizo visible queda **25-32 px** por encima de la línea del lomo. ✅ (el tramo de la cola que baja hacia la grupa queda dentro del torso y no se mide: ver MINOR-3) |
| Base de la cola enterrada (≥ 6 px y ≥ 5 px de envergadura) | Puntos enterrados en x ∈ [145, 152] (7 px de envergadura), profundidad ≈ 17 px. ✅ |
| Cabeza ↔ cuerpo (encaje ≥ 8 px, hueco ≤ 2 px) | La tinta del cuello (y=84.6…86.4, x=91…107) queda a **0.1-0.4 px** del lomo nuevo (antes 0.55 px): el lomo bajó, el encaje **aumenta**. ✅ |
| Patas delanteras sin doble línea (≤ 10 puntos a ≤1.2 px) | La esquina de tinta de `.left-paw` (58,129) queda a ≈1.1 px del contorno nuevo del pecho (antes ≈1.0 px) → sigue siendo 1 punto compartido, muy por debajo de 10. `.right-paw` sin cambios. ✅ |
| Una sola silueta | El torso es un path cerrado único y la cola sigue enterrada en la grupa. ✅ |
| Cel-shading: una tinta, dos tonos planos, sin degradados | `#F7B851` / `#C97E22` / `#E9CFA8` / `#FFF8EC` / `#3B2416`, `stroke-width 3.4`, sin `url(#…)`. ✅ |
| Hashes sha256 de las otras 11 poses | Intactos en el diff (no se tocó `cat.js` ni las otras poses de Max). ✅ |
| Deriva CSS ↔ SVG (pivotes) | `108px 113px` inline y `.dog-walk .pet-body` sin cambios. ✅ |

### Alcance del diff

Solo se tocan `src/assets/dog.js` (2 `d` dentro de `dogWalkSVG`), `test/pet-assets.test.js` (aditivo + la modificación que el plan pide), la fila de `docs/pet-screenshots/README.md` y el binario `docs/pet-screenshots/dog-walk.png`. El plan (`docs/plans/2026-10-30-dog-walk-torso-round2.md`) entra en el mismo diff, con frontmatter válido (`id`, `status: approved`, `size`, `acceptance` con 12 criterios).

### Tests nuevos — ¿muerden?

- Los tres guards **derivan la geometría del SVG real** (mismo `d`, mismo aplanado), no literales: un redibujo que rompa la pose los pone en rojo.
- Cada uno tiene una guarda anti-vacío (`checked > 20`, `belly !== null`, `shadowPolys.length > 0`): el vientre mide ~62 muestras y la sombra ~82, así que la medida nunca sale vacía.
- Los cinco asserts nuevos del guard del README (`/una sola curva/`, `/escalon/`, `/gancho/`, `/recto/`, `/joroba/`) **no casan** con la fila vieja → el test ampliado es efectivo.

---

## MINOR (no bloquean)

1. **El plan de la ronda 1 queda con un criterio obsoleto sin puntero.** `docs/plans/2026-10-30-dog-walk-pose-fix.md` línea 21 sigue diciendo *"descenso ≥ 4 px entre el hombro y la plinga y ascenso final en la grupa"*, criterio que el arte nuevo **incumple a propósito**. La ronda 2 lo declara superado de forma explícita (`risks[0]`, §2 y §4.1), así que no es un incumplimiento del plan vigente; pero conviene dejar **una línea en el plan de la ronda 1** apuntando a la ronda 2, para que un lector (o un chequeo automático de aceptación) no lo lea como una contradicción.

2. **Dos márgenes se estrecharon bastante con la geometría nueva** (no fallan hoy, pero se rompen con un nudge mínimo):
   - `chestBelly − waistBelly ≥ 8` → medido **9.07 px** (el arte viejo daba 12.7 px). Con 1 px de holgura, tocar los puntos de control del muslo/ingle rompe el guard de "vientre de perro en marcha".
   - "la pata delantera lejana queda pegada al vientre": en el extremo derecho del canto de la pata (x=106.4) el vientre quedó en **y=141.47** contra un canto de pata en y=141 → margen **0.97 px** (antes 1.5 px, con el vientre plano en 142).
   Sugerencia: cuando se vuelva a tocar este torso, subir el umbral de la cintura a 7 px o dejar el vientre plano 0.5 px más abajo.

3. **El borde descendente de la cola ahora roza el lomo nuevo en la grupa.** Con el lomo aplanado, la línea del lomo en x≈154-157 quedó en y≈91.3-92.5, y el borde exterior de la cola ahí está en y≈89.6-94.1: para x ≳ 154.5 asoma una **franja de ≈2 px de tinta de la cola por encima del lomo**, donde en el arte viejo quedaba totalmente tapada por el cuerpo. El guard de "aire sobre el lomo" **no lo puede ver** porque su banda termina en `bb.maxX − 10 = 152`. No lo cuento como defecto (la cola no cambió y el aire entre el rizo y la espalda se mantiene en 25-32 px), pero **el gate visual debería hacer zoom en la grupa** para confirmar que la unión cola-lomo se lee como una costura natural y no como una línea doble.

4. **`massShadowPolys` mezcla el plano de sombra con el parche acento.** Devuelve *todos* los `cel-shadow` de la masa —incluido el parche `#E9CFA8` del pecho— y `upperAt` toma el mínimo sobre todos. Hoy el parche (x 63-77) queda **fuera** de la ventana medida ([97.5, 138.4]), así que el guard es correcto; pero si ese acento se moviera al bajo del cuerpo, el guard pasaría a medir el parche en vez de la banda de sombra. Vale la pena filtrar por `fill` o dejar el exclusivo escrito en el comentario del helper.

5. **Falta el assert de la palabra clave `lomo`** que el Paso 2 del plan lista (`vientre, una sola curva, sin escalon, sin gancho, lomo, recto, joroba`). Los asserts de `/recto/` y `/joroba/` cubren la frase en la práctica, pero una fila que dijera "la espalda casi recta, sin joroba" también pasaría. Es un detalle de una línea.

6. **No quedó artefacto en el diff con la evidencia de rojo/verde** que el §5 del plan exige registrar en el paso 1 ("se registra la evidencia de **rojo** … y, al cerrar el paso, la de **verde**"). En la ronda 1 esa evidencia quedó en `docs/qa/evidence/` (fuera de este worktree). Como el plan no designa archivo, lo dejo como pendiente de `/gate-qa`; sólo quiero dejar constancia de que el paso 1 la pedía explícitamente.

---

## Veredicto por criterio de aceptación

| # | Criterio | Estado |
|---|---|---|
| 1 | Visual — vientre de una sola curva continua, sin escalón con borde duro | ✅ (geometría + PNG) |
| 2 | Visual — sombra plana del vientre continua, sin gancho | ✅ (u(x) monótono) |
| 3 | Visual — lomo casi recto, sin joroba | ✅ (5.25 px de desnivel, monótono) |
| 4 | Visual — shiba en marcha de una sola pieza, cola/cabeza sin cambios | ✅ (cola y cabeza byte a byte iguales) |
| 5 | El vientre solo sube desde su punto más bajo hasta la ingle | ✅ (guard nuevo, monótono) |
| 6 | El lomo no sube y su desnivel ≤ 7 px | ✅ (guard modificado) |
| 7 | La sombra del vientre no forma puntas (> 3 px sobre el promedio) | ✅ (guard nuevo) |
| 8 | Cola sin cambios + hashes de las otras 11 poses | ✅ |
| 9 | Guards de arte preexistentes verdes | ✅ (verificado estáticamente; ejecución en QA) |
| 10 | Cel-shading: una tinta, dos tonos planos, paleta fija | ✅ |
| 11 | `npm test` y `npm run check` verdes | ⚠️ sin shell en este entorno → pendiente de `/gate-qa` |
| 12 | PNG regenerada + fila del README con los 3 criterios nuevos | ✅ |

**Conclusión**: el diff cumple el plan (arte = geometría objetivo del §3 al pie de la letra; los tres guards del plan implementados con las tolerancias que fija; README y PNG al día), no debilita ningún test fuera de lo que el plan pide explícitamente y no toca nada fuera de alcance. Se aprueba; los 6 MINOR quedan anotados para el próximo toque de este arte y para el gate visual.

---
