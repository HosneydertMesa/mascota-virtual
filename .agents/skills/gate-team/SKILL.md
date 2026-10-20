---
name: gate-team
description: Implementa un plan aprobado tarea por tarea con TDD, con un revisor sin contexto entre tareas y Conventional Commits. Usar con un plan ya escrito, cuando el usuario escribe /gate-team o pide ejecutar el plan.
---

# gate-team

Ejecuta un plan aprobado: cada tarea con TDD, revisión con contexto limpio y Conventional Commits.

## Cuándo usarla

- Hay un plan aprobado en `docs/plans/` o `docs/superpowers/plans/`.
- No para cambios de 1 o 2 archivos: hacelos directo, con TDD.

## Método

Método basado en superpowers (MIT).

Si `superpowers:subagent-driven-development` está en tu lista de skills → invocalo y seguilo; para aislar el trabajo, `superpowers:using-git-worktrees`. Si el harness no tiene subagentes, `superpowers:executing-plans`.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

Si el skill ofrece mergear o cerrar la rama, antes corré `gate qa` y `/gate-review`: `gate strict` exige ese review.

### Sin superpowers

1. Trabajá en una rama (`feat/<slug>`), nunca en `main`.
2. Leé el plan una vez y anotá una tarea por cada una del plan.
3. Por tarea: escribí el test, miralo fallar, implementá lo mínimo, miralo pasar y corré la suite.
4. Con subagentes: uno nuevo por tarea, con solo el texto de su tarea y las interfaces que consume. Sin subagentes: hacé vos cada tarea en orden, sin saltear el test que falla.
5. Después de cada tarea, que la revise alguien sin la conversación (solo el diff y la tarea). Arreglá lo crítico antes de seguir.
6. Si el plan está mal en un punto, elegí el cambio mínimo que respeta la spec y anotalo; no improvises en silencio.
7. Al final, revisá toda la rama con `/gate-review`.

## Artefacto gate

- Commits Conventional Commits: `test:` para el test que falla y `feat:` / `fix:` para la implementación (o los dos juntos). El hook `commit-msg` exige el plan de la rama.
- `gate strict` falla si un `feat:` / `fix:` cambia código y no cambia ningún test en el rango. El escape es `Tests: no aplica — <motivo>`, en el plan o en el cuerpo del commit.
- Al terminar: `gate qa`, `/gate-review` y el PR con `templates/pr-description-template.md`.
