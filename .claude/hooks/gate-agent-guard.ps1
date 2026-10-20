#!/usr/bin/env pwsh
# agent-guard.ps1 — PreToolUse hook para agentes (Claude Code, DSH via dsh-hooks-claude-code)
#
# Los git hooks (pre-commit, commit-msg, pre-push) ya corren cuando el agente hace
# `git commit` / `git push` desde su tool Bash. Lo unico que este guard agrega es
# impedir que el agente se los SALTE:
#   - `--no-verify` en cualquier comando git
#   - `-n` (alias de --no-verify) en `git commit`, suelto o en cluster (-an, -nm "...")
#   - `core.hooksPath` (git -c core.hooksPath=... / git config core.hooksPath ...)
#
# Contrato Claude Code: lee el JSON del evento por stdin (tool_input.command).
# exit 2 = bloquear (stderr se le muestra al agente). exit 0 = permitir.
# Si el input no se puede parsear, permite: el guard no debe romper al agente.

$ErrorActionPreference = 'Stop'

function Get-GitBypassReason([string]$Command) {
    if (-not $Command -or $Command -notmatch '\bgit\b') { return $null }
    # -c "core.hooksPath=..." con comillas: chequear antes de sacar el texto citado.
    if ($Command -match '\s-c\s*["'']?core\.hooksPath') { return 'core.hooksPath' }

    # Sacar el contenido entre comillas (mensajes -m "...", heredocs dentro de "$(...)")
    # para no confundir texto del mensaje con flags.
    $bare = [regex]::Replace($Command, '"(?:\\.|[^"\\])*"', '""')
    $bare = [regex]::Replace($bare, "'[^']*'", "''")

    foreach ($segment in ($bare -split '&&|\|\||[;|\r\n]')) {
        $tokens = @($segment.Trim() -split '\s+' | Where-Object { $_ })
        $gitIdx = -1
        for ($i = 0; $i -lt $tokens.Count; $i++) {
            if ($tokens[$i] -match '(^|[\\/])git(\.exe)?$') { $gitIdx = $i; break }
        }
        if ($gitIdx -lt 0) { continue }
        $rest = @($tokens | Select-Object -Skip ($gitIdx + 1))

        if ($rest -match '^--no-verify$') { return '--no-verify' }
        if ($rest -match 'core\.hooksPath') { return 'core.hooksPath' }

        # Subcomando = primer token que no es opcion global (salteando el valor de -c / -C).
        $sub = $null; $subIdx = -1
        for ($i = 0; $i -lt $rest.Count; $i++) {
            if ($rest[$i] -in @('-c', '-C')) { $i++; continue }
            if ($rest[$i].StartsWith('-')) { continue }
            $sub = $rest[$i]; $subIdx = $i; break
        }
        if ($sub -ne 'commit') { continue }

        foreach ($tok in ($rest | Select-Object -Skip ($subIdx + 1))) {
            if ($tok -notmatch '^-[a-zA-Z]+$') { continue }
            # En un cluster de flags cortos, una letra que toma valor (m, F, C, c, t)
            # se come el resto del token: `-mnuevo` es el mensaje "nuevo", no -n.
            foreach ($ch in $tok.Substring(1).ToCharArray()) {
                if ($ch -ceq 'n') { return '-n (--no-verify)' }
                if ('mFCct'.IndexOf($ch) -ge 0) { break }
            }
        }
    }
    return $null
}

$raw = [Console]::In.ReadToEnd()
try {
    $hookInput = $raw | ConvertFrom-Json -ErrorAction Stop
} catch {
    exit 0
}

$command = $hookInput.tool_input.command
$reason = Get-GitBypassReason $command
if ($reason) {
    [Console]::Error.WriteLine("gate: comando bloqueado ($reason). Los agentes no pueden saltarse los git hooks del gate.")
    [Console]::Error.WriteLine("gate: arreglá lo que reporta el hook (ej. falta un plan en docs/plans/) y reintentá sin el bypass.")
    [Console]::Error.WriteLine("gate: si de verdad hace falta saltarlo, pedile al usuario que lo corra él.")
    exit 2
}
exit 0
