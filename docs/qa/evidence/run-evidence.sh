#!/usr/bin/env bash
# run-evidence.sh — corre TODA la verificacion del fix de QA del 2026-10-27
# y deja la transcripcion en docs/qa/evidence/qa-evidence-log.txt.
#
# Uso: bash docs/qa/evidence/run-evidence.sh
#
# Criterios de aceptacion que verifica (frontmatter del plan):
#   6. la sombra plana cae abajo-derecha y NO cruza el contorno de la masa
#   7. la base de la cola se esconde bajo el cuerpo (y la pose es una silueta)
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
cd "$ROOT" || exit 1
LOG="docs/qa/evidence/qa-evidence-log.txt"
mkdir -p "$(dirname "$LOG")"

FAILED=0

run() {
  local title="$1"; shift
  {
    echo ""
    echo "=============================================================="
    echo "\$ $*"
    echo "--------------------------------------------------------------"
  } >> "$LOG"
  if "$@" >> "$LOG" 2>&1; then
    echo "[OK]    $title" | tee -a "$LOG"
  else
    echo "[FALLA] $title (exit $?)" | tee -a "$LOG"
    FAILED=1
  fi
}

{
  echo "=============================================================="
  echo "Evidencia de QA — fix cel-shading (2026-10-27)"
  echo "Repo:   $ROOT"
  echo "Fecha:  $(date '+%Y-%m-%d %H:%M:%S')"
  echo "Node:   $(node --version)"
  echo "Python: $(python --version 2>&1)"
} > "$LOG"

run "suite completa"                npm test
run "chequeo de sintaxis"           npm run check
run "smoke test"                    npm run smoke
run "criterio 6: sombra contenida"  node docs/qa/evidence/verify-cel-geometry.js
run "criterio 7: encaje de la cola" node docs/qa/evidence/verify-fit-rules.js
run "criterio 7: silueta unica"     python docs/qa/evidence/silhouette-components.py
run "informe de encaje de la cola"  node docs/qa/evidence/tail-fit.js
run "pivotes CSS == SVG (runtime)"  python docs/qa/evidence/runtime-pivot-check.py
run "capturas al dia"               python docs/qa/evidence/verify-screenshots-fresh.py

{
  echo ""
  echo "=============================================================="
  if [ "$FAILED" -eq 0 ]; then
    echo "RESULTADO: todo en verde"
  else
    echo "RESULTADO: hay comprobaciones en rojo"
  fi
} | tee -a "$LOG"

exit "$FAILED"
