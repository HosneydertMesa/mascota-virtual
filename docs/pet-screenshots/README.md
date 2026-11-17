# Capturas de las 12 poses de produccion

Una PNG por pose de produccion (idle, walk, sleep, sit, lay, stretch &times;
Luna/Max). Cada PNG muestra **la misma pose renderizada dos veces**: sobre
fondo claro y sobre fondo oscuro, con la etiqueta de la pose arriba.

Son la evidencia de la revision visual del plan
[`docs/plans/2026-10-27-cel-shading-mascot-redesign.md`](../../docs/plans/2026-10-27-cel-shading-mascot-redesign.md)
(criterios de aceptacion visual, seccion 10): contorno marcado, sombras planas
de dos tonos, silueta continua, proporciones expresivas y lectura sobre fondo
claro y oscuro.

Las capturas se generan desde los SVG reales de `src/assets/cat.js` y
`src/assets/dog.js` (no son copias): si el arte cambia, hay que volver a
correr el comando de abajo.

## Indice

| PNG | Especie | Estado | Que mirar |
|---|---|---|---|
| [`cat-idle.png`](cat-idle.png) | Luna (gato) | idle | Pose de referencia: contorno marcado, ojos grandes, cola en curva alta |
| [`cat-walk.png`](cat-walk.png) | Luna (gato) | walk | Perfil: la silueta exterior debe leerse como una sola linea continua |
| [`cat-sleep.png`](cat-sleep.png) | Luna (gato) | sleep | Acostada, ojos cerrados, sombra de piso mas baja |
| [`cat-sit.png`](cat-sit.png) | Luna (gato) | sit | Sentada, pecho erguido, cola en curva baja al costado |
| [`cat-lay.png`](cat-lay.png) | Luna (gato) | lay | Acostada panza abajo, patas estiradas |
| [`cat-stretch.png`](cat-stretch.png) | Luna (gato) | stretch | Estirada, grupa alta, cola alzada |
| [`dog-idle.png`](dog-idle.png) | Max (perro) | idle | Pose de referencia del shiba: orejas caidas, hocico, cola en sable |
| [`dog-walk.png`](dog-walk.png) | Max (perro) | walk | Cola que nace de la grupa y se enrosca hacia arriba sin apoyarse en el lomo (queda aire entre el rizo y la espalda); pecho mas hondo que la cintura; la pata delantera lejana pegada al vientre (sin cuna de fondo entre la pata y el cuerpo); el vientre de una sola curva continua desde el pecho hasta la ingle (sin escalon con borde duro delante de las patas traseras, no se lee como una pieza pegada bajo el cuerpo); la sombra plana del vientre continua y sin gancho (ni punta hacia arriba delante de las patas traseras); el lomo casi recto, sin joroba (no se hunde en la plinga ni vuelve a subir en la grupa); silueta unica (una sola linea continua) |
| [`dog-sleep.png`](dog-sleep.png) | Max (perro) | sleep | Acostado, ojos cerrados, sombra de piso mas baja |
| [`dog-sit.png`](dog-sit.png) | Max (perro) | sit | Sentado, pecho erguido, cola en curva baja al costado |
| [`dog-lay.png`](dog-lay.png) | Max (perro) | lay | Acostado panza abajo, patas estiradas |
| [`dog-stretch.png`](dog-stretch.png) | Max (perro) | stretch | Estirado, grupa alta, cola alzada |

## Como regenerarlas

```bash
python test/preview/pet-poses-capture.py
```

Opciones utiles:

```bash
python test/preview/pet-poses-capture.py --scale 3          # mas nitidez (default 2)
python test/preview/pet-poses-capture.py --only cat-idle     # solo algunas poses
```

Requisitos (solo para el script; la pagina de preview no los necesita):

```bash
python -m pip install playwright
python -m playwright install chromium
```

## La pagina de preview

[`test/preview/pet-poses-preview.html`](../../test/preview/pet-poses-preview.html)
es el grid con las 12 poses, cada una sobre fondo claro y fondo oscuro con
etiqueta. Se abre con doble click en cualquier navegador (no necesita
Playwright ni servidor) y dibuja los SVG de produccion en el momento.

## Cuando cambien las poses

1. Correr `python test/preview/pet-poses-capture.py` para refrescar las PNG.
2. Revisar el diff de los PNG (el revisor visual juzga la silueta, no los hex).
3. Si se agrego o renombro una pose, actualizar la lista `POSES` de
   `test/preview/pet-poses-capture.py` y la tabla de este README: el script
   avisa si la pagina y la lista no coinciden.
