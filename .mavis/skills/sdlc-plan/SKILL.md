---
name: sdlc-plan
description: Auto-genera un plan técnico detallado para una feature nueva. Usar cuando el usuario pida arrancar trabajo, refactor, o cualquier cambio no trivial. Genera estructura en markdown lista para revisar.
---

# Skill: sdlc-plan

## Cuándo usarla

- Usuario dice "voy a empezar X feature" o "hay que hacer Y cambio"
- Tarea de código no trivial (multi-archivo, multi-decisión)
- Antes de empezar a tocar código en cualquier proyecto mediano

**No usar para**: fixes de una línea, cambios cosméticos, preguntas simples.

## Inputs

- `feature_description`: string libre describiendo la feature
- (opcional) `context`: código o contexto adicional que el usuario pegue
- (opcional) `constraints`: límites de tiempo, presupuesto, compatibilidad, etc.

## Workflow

1. **Lee `AGENTS.md`** del proyecto actual para entender stack, convenciones, build commands.
2. **Investiga el codebase**: identifica los archivos que probablemente se tocan, busca patrones similares, dependencias que ya existen.
3. **Estructura el plan** con la siguiente plantilla (usar `templates/plan-template.md` como base).
4. **Identifica riesgos** explícitamente: breaking changes, performance, seguridad, migración de datos.
5. **Lista archivos a crear/modificar** con paths específicos estimados.
6. **Criterios de aceptación**: cómo verificamos que está listo.
7. **Plan de testing**: qué tests unitarios, integration, e2e se necesitan.
8. **Métricas de éxito**: latencia, cobertura, etc. (ver AGENTS.md).

## Output

Guarda el plan en `docs/plans/<slug-de-feature>.md` donde `<slug-de-feature>` es kebab-case de la descripción.

Si el usuario no tiene esa carpeta, créala.

## Plantilla

Ver `templates/plan-template.md` en este mismo skill.

## Comportamiento

- **No escribas código todavía**. Esto es SOLO plan.
- Sé concreto: nombres de archivos, funciones, endpoints. No "actualizar el módulo de auth", sino `src/auth/middleware.py::verify_token()`.
- Si hay decisiones arquitectónicas grandes, marcalas como "Decisiones a confirmar con el equipo" y propón opciones.
- Incluye estimación de esfuerzo relativa (S/M/L/XL) por sección.
- Si la feature toca >10 archivos, dividila en sub-features en el plan.
- Termina siempre con "Próximos pasos concretos" numerados.

## Anti-patrones

- ❌ Plan genérico sin nombres de archivos
- ❌ "Verificar performance" sin métrica
- ❌ Saltarse la sección de riesgos
- ❌ No incluir criterios de aceptación medibles
- ❌ Olvidar la sección de testing
