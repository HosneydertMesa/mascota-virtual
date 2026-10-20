# Default core check: AGENTS.md present
$checkPath = Join-Path $Script:DoctorProject 'AGENTS.md'
if (Test-Path $checkPath) {
    Write-Ok 'AGENTS.md'
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'AGENTS.md'; Pass = $true }
} else {
    Write-Warn2 'Falta: AGENTS.md'
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'AGENTS.md'; Pass = $false }
}
