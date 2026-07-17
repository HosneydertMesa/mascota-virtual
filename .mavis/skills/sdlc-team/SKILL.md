---
name: sdlc-team
description: Orquesta un Agent Team estilo Leader → Implementer → Verifier para implementar una feature. El Verifier hace code review adversarial con fresh context. Usar después de tener un plan aprobado.
---

# Skill: sdlc-team

## Cuándo usarla

- Ya tienes un plan aprobado (de `/sdlc-plan` o de discusión previa)
- La feature toca múltiples archivos o requiere cambios coordinados
- Quieres separación clara entre "el que escribe" y "el que revisa"

**No usar para**: cambios de 1-2 archivos, fixes urgentes, hotfixes.

## Inputs

- `plan_path`: path al plan aprobado (ej: `docs/plans/auth-jwt.md`)
- (opcional) `branch`: nombre de la branch a crear (default: `feat/<slug>`)
- (opcional) `worktree_path`: si quieres trabajar en un worktree aislado (default: false)

## Roles del Agent Team

### 1. Leader (el orquestador)
- Lee el plan completo
- Divide el trabajo en tareas atómicas numeradas
- Asigna cada tarea a un Implementer
- Recolecta outputs de Implementers
- Pasa el código al Verifier
- Sintetiza el resultado final

### 2. Implementer (uno o varios)
- Recibe una tarea atómica del Leader
- Escribe código que cumple esa tarea respetando AGENTS.md
- Corre linter y typecheck antes de devolver
- Reporta al Leader: archivos modificados, tests añadidos, decisiones tomadas

### 3. Verifier (siempre fresh context)
- Recibe SOLO el diff de los Implementers
- NO ve la conversación previa
- Hace code review adversarial:
  - Lee cada archivo modificado en su totalidad
  - Busca: bugs lógicos, edge cases,安全问题, performance, legibilidad
  - Verifica que cumple los criterios de aceptación del plan
  - Verifica que respeta las convenciones de AGENTS.md
- Devuelve: APPROVED o CHANGES_REQUESTED con lista específica

## Workflow

```
[Plan aprobado] → [Leader parte tareas] → [Implementer(s) escriben]
                                              ↓
                                     [Verifier revisa fresh]
                                              ↓
                          ┌── APPROVED ──→ [Leader mergea y resume]
                          │
                          └── CHANGES ───→ [Leader pide fix a Implementer]
                                                  ↓
                                            (loop hasta APPROVED)
```

## Output

- Branch con el código implementado
- PR description auto-generada (ver `templates/pr-description-template.md`)
- Resumen de cambios, decisiones, y trade-offs

## Comportamiento

- El Verifier **nunca ve la conversación**. Solo el diff. Esto es intencional para evitar sesgo.
- Si Verifier encuentra issues, Implementer debe responder uno por uno, no en bloque.
- El Leader es responsable de mantener al equipo enfocado. Si una tarea se expande, debe volver a partirla.
- Cuando todos los criterios de aceptación están cumplidos y Verifier aprobó, Leader hace el commit + push + abre PR.

## Anti-patrones

- ❌ Verifier ve la conversación (anula el propósito de fresh context)
- ❌ Leader escribe código directamente (saltarse Implementer)
- ❌ Implementer no corre tests antes de devolver
- ❌ Aprobar sin haber leído los archivos modificados
- ❌ Mergear con CHANGES_REQUESTED pendiente
