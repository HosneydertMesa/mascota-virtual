---
name: gate-plan
description: Plan de implementación por tareas TDD para una feature o cambio no trivial, con rutas y código exactos. Usar cuando el usuario pide arrancar un trabajo o escribe /gate-plan; si todavía no hay diseño, usar /gate-spec.
---

# gate-plan

Plan de implementación listo para ejecutar, sin escribir código todavía.

## Cuándo usarla

- `/gate-plan <feature>` o "voy a empezar X". Si el diseño todavía no está claro, `/gate-spec`.
- No para fixes de una línea ni cambios cosméticos.

## Método

Método basado en superpowers (MIT).

Si `superpowers:writing-plans` está en tu lista de skills → invocalo y seguilo.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

### Sin superpowers

1. Leé `AGENTS.md`, la spec si existe y el código que se toca.
2. Mapeá los archivos a crear o modificar y qué responsabilidad tiene cada uno.
3. Partí el trabajo en tareas chicas; cada una termina en algo que se puede testear por separado.
4. En cada tarea: el test que falla (con su código), el comando para verlo fallar, la implementación mínima, el comando para verlo pasar y el commit.
5. Usá nombres reales: rutas, funciones, comandos. Nada de "manejar errores" sin decir cómo.
6. Anotá arriba, una sola vez, las restricciones globales (versiones, convenciones).
7. Releé el plan contra la spec: cada requisito tiene su tarea y los nombres coinciden entre tareas.
8. Pedile al usuario que lo revise antes de implementar.

## Artefacto gate

- `docs/plans/AAAA-MM-DD-<slug>.md` o `docs/superpowers/plans/`. Plantilla: `templates/plan-template.md` del setup de gate.
- El plan arranca con frontmatter: es lo que `gate strict` lee. `status` tiene que estar en `approved` para que el plan cuente, y `acceptance` necesita al menos un criterio medible. Las listas van en block-style (un `-` por línea) o flow-style (`[a, b]`).

```markdown
---
id: <slug>
status: approved
created: <AAAA-MM-DD>
size: M
files:
  - src/<archivo>
acceptance:
  - "<criterio medible>"
risks:
  - "<riesgo conocido>"
---
```

- El hook `commit-msg` exige un plan de la rama para los tipos de `gate config get plan.requiredFor`: commitealo (`docs(plans): ...`) antes del primer `feat:`.
- Si una tarea no lleva tests, decilo en el plan: `Tests: no aplica — <motivo>`.
