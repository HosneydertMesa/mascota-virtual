---
name: sdlc-review
description: Code review adversarial con fresh context. El revisor no ve la conversación ni el plan, solo el diff. Encuentra bugs, problemas de seguridad, performance, y违反 convenciones. Usar antes de mergear o como parte del pre-commit.
---

# Skill: sdlc-review

## Cuándo usarla

- Antes de mergear un PR
- Como parte del pre-commit hook (modo rápido)
- Cuando quieres una segunda opinión independiente
- Después de cambios grandes o delicados (auth, pagos, datos)

**No usar para**: revisar typos en comentarios.

## Inputs

- `diff`: el diff a revisar (puede ser `git diff`, `git diff main..HEAD`, o un patch file)
- (opcional) `focus`: array de áreas específicas a revisar (`["security", "performance"]`)
- (opcional) `severity_threshold`: nivel mínimo para reportar (`"info" | "minor" | "major" | "critical"`)

## Categorías de revisión

### 🐛 Correctness
- Lógica de negocio correcta
- Edge cases manejados (null, empty, overflow, unicode, concurrencia)
- Race conditions
- Off-by-one errors
- Validación de inputs

### 🔒 Security
- Inyección (SQL, XSS, command, path)
- Auth/authz checks presentes donde corresponde
- Secrets en código
- Inputs no sanitizados
- CSRF, SSRF, IDOR
- Dependencias vulnerables

### ⚡ Performance
- N+1 queries
- Operaciones síncronas que deberían ser async
- Loops innecesarios
- Memoria: leaks, allocations innecesarias
- Caching opportunities

### 🎨 Style & Conventions
- Cumple con AGENTS.md del proyecto
- Naming consistente
- Funciones pequeñas y enfocadas
- Comentarios solo donde aportan
- No magic numbers

### 🧪 Testing
- Tests añadidos para código nuevo
- Edge cases cubiertos
- Tests son deterministas (no flaky)
- No se testeó la implementación sino el comportamiento

### 📚 Maintainability
- Código legible sin necesidad de comentarios extensos
- Nombres descriptivos
- Bajo acoplamiento
- Alta cohesión
- Sin duplicación innecesaria

## Formato de output

Para cada hallazgo, usa este formato:

```markdown
### [SEVERITY] [Category] Brief title

**File**: `path/to/file.ext:line_range`
**Issue**: Descripción clara del problema
**Impact**: Qué pasa si esto llega a producción
**Fix**: Cómo arreglarlo (con ejemplo de código si aplica)

```suggestion
// código sugerido
```
```

## Severities

- **CRITICAL**: debe bloquear el merge. Bug, vuln, data loss.
- **MAJOR**: debería bloquear el merge. Perf, maintainability, falta de tests en código crítico.
- **MINOR**: comment-only block, o nota para el autor.
- **INFO**: sugerencia, no bloquea nada.

## Comportamiento

- **Fresh context**: no leas la conversación. Solo el diff + archivos afectados.
- **Lee los archivos completos**, no solo el diff. El contexto completo importa.
- **No apruebes si hay CRITICAL o MAJOR sin resolver.**
- Si no encuentras nada, di explícitamente "APPROVED — no issues found en categorías X, Y, Z".
- Si el cambio es huge (>500 líneas), pide partirlo en commits más pequeños.

## Output

Guarda el review en `docs/reviews/<branch-o-pr>-<fecha>.md` o devuélvelo directo al usuario según contexto.
