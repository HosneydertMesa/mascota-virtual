---
name: gate-spec
description: "Spec + plan de una feature: brainstorming hasta un diseño aprobado y después un plan TDD por tareas. Usar cuando el usuario escribe /gate-spec <feature> o pide diseñar algo no trivial antes de codear."
---

# gate-spec

Diseño aprobado (spec) y plan de implementación para una feature, antes de tocar código.

## Cuándo usarla

- `/gate-spec <descripción>`. Sin descripción, preguntá: "¿Qué feature querés especificar?"
- Features nuevas, cambios de comportamiento o de arquitectura. Para un plan sin diseño previo, `/gate-plan`.

## Método

Método basado en superpowers (MIT).

Si `superpowers:brainstorming` está en tu lista de skills → invocalo y seguilo hasta que el usuario apruebe el diseño; después invocá `superpowers:writing-plans` con la spec. Usá las rutas por defecto de esos skills (`docs/superpowers/specs/`, `docs/superpowers/plans/`): gate ya las reconoce.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

### Sin superpowers

1. Leé `AGENTS.md`, los archivos que toca la feature y los commits recientes.
2. Hacé una pregunta por mensaje hasta entender objetivo, restricciones y criterio de éxito.
3. Proponé 2 o 3 enfoques con sus trade-offs y recomendá uno.
4. Presentá el diseño por secciones (arquitectura, componentes, datos, errores, testing) y pedí aprobación de cada una.
5. Escribí la spec y releela: sin huecos, sin contradicciones, sin ambigüedades.
6. Pedile al usuario que revise la spec escrita; no sigas sin su OK.
7. Escribí el plan: tareas chicas, cada una con el test que falla primero, la implementación mínima, la verificación y el commit, con rutas y código exactos.
8. Ofrecé ejecutar el plan con `/gate-team`.

## Artefacto gate

- Spec: `docs/specs/AAAA-MM-DD-<slug>-design.md` o `docs/superpowers/specs/`. Plantilla: `templates/spec-template.md` del setup de gate.
- Plan: `docs/plans/AAAA-MM-DD-<slug>.md` o `docs/superpowers/plans/`. Es el plan que exige el hook `commit-msg` para los tipos de `gate config get plan.requiredFor`: commitealo en la rama antes del primer `feat:`.
- Si una tarea no lleva tests (script de una vez, config), escribí en el plan `Tests: no aplica — <motivo>`. `gate strict` lo acepta salvo con `tests.evidence = block-no-escape`.
- Commits sugeridos: `docs(specs): diseño de <slug>` y `docs(plans): plan de <slug>`.
