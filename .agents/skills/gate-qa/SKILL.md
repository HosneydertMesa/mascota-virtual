---
name: gate-qa
description: "Verifica con evidencia que el trabajo está listo: corre los tests del proyecto, lee la salida y reporta; escribe el registro de QA si el repo lo exige. Usar con /gate-qa, o antes de decir que algo está terminado."
---

# gate-qa

Corre los tests y reporta lo que de verdad pasó. No escribe ni modifica tests.

## Cuándo usarla

- `/gate-qa [<feature>]` después de implementar (el argumento es solo contexto).
- Antes de decir "listo", "arreglado" o "pasa": esa afirmación necesita la salida de un comando.

## Método

Método basado en superpowers (MIT).

Si `superpowers:verification-before-completion` está en tu lista de skills → invocalo y seguilo.

Con o sin superpowers: en los dos casos, cumplí `## Artefacto gate` al terminar.

### Sin superpowers

1. Elegí el comando que prueba la afirmación: la suite completa, no un test suelto.
2. Correlo ahora, sobre este árbol; una corrida vieja no cuenta.
3. Leé la salida entera: exit code, cantidad de fallas, warnings.
4. Si falla, reportá la falla con la salida; no digas "debería andar".
5. Si pasa, reportá el comando y el resultado (por ejemplo "214/214 passed").
6. Nombrá también las fallas que no causaste vos.

## Comando de test

`gate qa -ProjectPath .` lo resuelve solo:

1. La línea `test:` del bloque `<!-- SDLC_COMMANDS_START -->` de `AGENTS.md` (la última, si hay varias).
2. Si no la hay, por stack: `package.json` → `npm test`; `pyproject.toml` / `requirements.txt` → `pytest`; `*.sln` → `dotnet test`; `go.mod` → `go test ./...`; `Cargo.toml` → `cargo test`; `pom.xml` → `mvn test`; `composer.json` → `phpunit`.
3. Si no encuentra nada, o si el comando no está en el PATH, sale con exit 2: agregá el bloque a `AGENTS.md` o instalá la herramienta.

Sale con 0 si todo pasa y con 1 si falla algo. Mostrá las últimas 100 líneas, el resumen (passed / failed / skipped y cobertura si aparece) y, si falla, qué tests fallaron.

## Artefacto gate

Leé `gate config get qa.signoff`:

- `none` (perfil `solo`): no escribas registro. La evidencia son los tests, que `gate strict` vuelve a correr en su fase 2.
- `human` (perfiles `team` y `strict`): si los tests pasan, escribí `docs/qa/<rama>-AAAA-MM-DD.md` desde `templates/qa-signoff-template.md` del setup de gate.

El registro arranca con frontmatter: es lo que `gate strict` lee.

```markdown
---
id: <slug>
branch: <rama>
plan: docs/plans/<slug>.md
review: docs/reviews/<slug>.md
status: APPROVED
evidence:
  tests: "<X passed, Y failed — comando y resultado>"
  smoke: "<qué se vio al arrancar, o se borra la linea>"
  manual: "<qué se probó a mano, o se borra la linea>"
signed_by: <nombre>
checked_at: <AAAA-MM-DD>
---
```

`status` tiene que ser `APPROVED` y `evidence` necesita al menos uno de `tests`, `smoke` o `manual`. La evidencia describe **lo que realmente se corrió**: si la app no se pudo arrancar, no pongas `smoke` — poné `manual` con el análisis estático y anotá la limitación en el cuerpo.

El cuerpo va con el resumen de los tests, el checklist manual y la línea `Sign-off: <pendiente>`. Dejá `Sign-off: <pendiente>`: firma una persona (`Sign-off: <nombre> <fecha>`) y `gate strict` falla hasta que esté firmado.

## Fuera de alcance

Escribir tests (eso es `/gate-debug` o el plan), umbrales de cobertura y QA visual (`/gate-visual`).
