---
name: sdlc-doc
description: Genera documentos de diseño, changelogs, y post-mortems en formato DOCX profesional. Usar al final de cada feature para documentar la decisión, o cuando se necesite un deliverable compartible con stakeholders no-técnicos.
---

# Skill: sdlc-doc

## Cuándo usarla

- Acabas de terminar una feature y quieres documentarla
- Necesitas un design doc para review con stakeholders
- Quieres un changelog/post-mortem en formato Word para auditoría
- Cualquier deliverable formal que requiera DOCX (no Markdown plano)

**No usar para**: README rápidos, comentarios en código, docs internas de una función.

## Sub-comandos

### `/sdlc-doc design "<feature>"`
Genera un design doc con:
- Contexto y motivación
- Opciones consideradas (con pros/cons)
- Decisión tomada y por qué
- Plan de implementación
- Trade-offs conocidos
- Plan de rollback

### `/sdlc-doc finalize "<feature>"`
Genera un changelog/post-mortem con:
- Resumen ejecutivo (1 párrafo)
- Qué se hizo (high level)
- Decisiones técnicas clave
- Métricas (latencia, coverage, performance)
- Lecciones aprendidas
- Trabajo futuro

### `/sdlc-doc postmortem "<incidente>"`
Genera un post-mortem con:
- Timeline del incidente
- Impacto (usuarios afectados, duración, revenue)
- Root cause analysis (5 whys)
- Por qué no se detectó antes
- Action items con owners

## Plantillas

Ver `templates/design-doc-template.md` y estructura interna del skill.

## Output

DOCX en `docs/deliverables/<feature>-<tipo>-<fecha>.docx`

## Convenciones del documento

- **Portada**: logo, título, fecha, autor, versión
- **TOCs**: en docs de >5 secciones
- **Headers**: nombre del proyecto a la izquierda, fecha a la derecha
- **Footers**: número de página centrado
- **Estilo**: Arial 11pt body, headings jerárquicos, code blocks en Consolas 9pt
- **Tablas**: con header sombreado, filas alternadas
- **Imágenes**: con caption y numeración
- **Diagramas**: si aplica, generar con mermaid y exportar a PNG primero

## Comportamiento

- Lee `AGENTS.md` para contexto del proyecto
- Lee el código real (no inventes features que no existen)
- Si vas a generar un design doc retroactivo, lee los commits y PRs para reconstruir la decisión
- Mantén el documento escaneable: headings claros, bullets concisos, no párrafos largos
- El executive summary debe poder leerse solo y entenderse la decisión
- Termina con "Próximos pasos" o "Action items" concretos, no ambiguos

## Anti-patrones

- ❌ DOCX lleno de imágenes de stock
- ❌ Jerga innecesaria — escribe para tu audiencia (PM, legal, CTO, etc.)
- ❌ Párrafos de más de 5 líneas
- ❌ Decisiones sin justificar el "por qué"
- ❌ Olvidar las métricas (sin métricas, ¿cómo sabemos que sirvió?)
