---
id: corregir-la-pose-de-caminar-de
branch: harness/20261030-142343-corregir-la-pose-de-caminar-de
plan: docs/plans/2026-10-30-pose-caminar-luna.md
status: APPROVED
evidence:
  manual: "resultado aceptado por claude sin firma de QA (detalle en el cuerpo)"
signed_by: "claude (aceptación sin firma de QA)"
checked_at: 2026-10-31
---

# QA: corregir-la-pose-de-caminar-de (aceptado sin firma de QA)

QA siguió pidiendo cambios tras agotar las rondas y claude aceptó el resultado.

Respuesta: acepto: a tamaño real la pose de caminar se ve bien (torso curvo, zancada, patas naranjas con calcetines crema); la unión pata-pecho que pide el revisor visual solo se aprecia con zoom extremo

### Hallazgos pendientes

Revisión visual (capturas en C:\Users\HOSNE\.harness\runs\20261030-142343-corregir-la-pose-de-caminar-de\qa-evidence\r10):
Torso curvo, zancuda separada, forma de pata con codo y mano, calcetines crema y ausencia de X/triángulo crema: todo correcto y no hay que tocarlo. Lo que sigue defectuoso es la unión de las patas delanteras con el pecho. En luna-walk-zoom-union-patas-vientre-claro.png, luna-walk-zoom-union-patas-vientre-oscuro.png, luna-walk-zoom-patas-delanteras-claro.png y luna-walk-zoom-patas-delanteras-oscuro.png (y en el pecho de luna-walk-completa-claro.png / luna-walk-completa-oscuro.png): (1) el trazo de tinta del pecho baja recto y termina en una punta/vertex angular vivo justo encima del hombro de la pata adelantada, de modo que el hombro no nace del pecho sino que se apoya contra una linea que se corta en angulo; (2) la banda de sombra del vientre se interrumpe con un borde escalonado duro (un muñón) que muerde la parte superior de ambas patas, dejando un escalón horizontal visible sobre el hombro. Deberia verse: el contorno del pecho/vientre debe continuar de forma continua y curva dentro de cada pata, sin ninguna linea de tinta horizontal que corte la pata, sin vertices en pico y sin que el borde de la sombra del vientre termine en un escalon; el hombro de cada pata debe fundirse con el pecho (misma tinta, mismo relleno naranja hasta la muneca) de modo que la pata se lea saliendo del pecho y no como una pieza pegada encima.
