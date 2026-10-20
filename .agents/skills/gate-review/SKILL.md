---
name: gate-review
description: Code review con contexto limpio del diff de una rama antes de mergear, y registro del veredicto en docs/reviews/ que lee gate strict. Usar con /gate-review, antes de un merge, o al recibir hallazgos de un review.
---

# gate-review

Review independiente del diff y veredicto escrito, que `gate strict` exige.

## Cuándo usarla

- `/gate-review` antes de mergear o de correr `gate strict`.
- Después de cambios delicados (auth, pagos, datos).
- Al recibir hallazgos de un review, propio o ajeno.

## Método

Método basado en superpowers (MIT).

Si `superpowers:requesting-code-review` está en tu lista de skills → invocalo y seguilo para pedir el review a un revisor con contexto limpio. Para aplicar los hallazgos, `superpowers:receiving-code-review`.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

Traducción del resultado: Critical = CRITICAL, Important = MAJOR, Minor = MINOR; `Ready to merge: Yes` → APPROVED, `With fixes` o `No` → CHANGES_REQUESTED hasta resolverlos.

### Sin superpowers

1. Armá el diff (`git diff $(git merge-base main HEAD)..HEAD`) y la lista de commits.
2. Dáselo junto con el plan a un revisor sin la conversación: un subagente nuevo, otro modelo u otra persona. Si no hay, revisalo vos en una pasada aparte, leyendo los archivos completos.
3. Revisá correctitud y casos borde, seguridad (inyección, secretos, permisos), tests (que cubran el comportamiento y no la implementación), performance y las convenciones de `AGENTS.md`.
4. Cada hallazgo lleva severidad (CRITICAL / MAJOR / MINOR), archivo:línea, un escenario concreto de falla y el fix sugerido.
5. Al recibir hallazgos, verificá cada uno contra el código antes de aceptarlo; si uno está mal, decilo con evidencia.
6. Arreglá los CRITICAL y MAJOR con un test que reproduzca el problema primero; los MINOR quedan anotados.
7. Si queda alguno sin resolver, el veredicto es CHANGES_REQUESTED.

## Artefacto gate

Guardá el review en `docs/reviews/<rama>-AAAA-MM-DD.md`, con la rama cambiando '/' por '-' (`feat/login` → `feat-login`).

El review arranca con frontmatter: es lo que `gate strict` lee del review más reciente.

```markdown
---
id: <slug>
branch: <rama>
plan: docs/plans/<slug>.md
status: APPROVED
severity:
  critical: 0
  major: 0
  minor: 3
  info: 1
reviewed_at: <AAAA-MM-DD>
---
```

`status` tiene que ser `APPROVED` y `severity.critical` y `severity.major` en 0 para aprobar. Los conteos son los hallazgos que escribiste, contados de verdad: no se leen de la prosa. Usá `APPROVED` solo si no quedan CRITICAL ni MAJOR abiertos; si no, `CHANGES_REQUESTED`.

El cuerpo va con el título y los hallazgos (plantilla: `templates/review-template.md` del setup de gate). La línea `**Verdict**: APPROVED` se sigue escribiendo para los proyectos que todavía usan el camino legacy, pero con frontmatter no hace falta.

Commit: `docs(reviews): review de <rama>`.
