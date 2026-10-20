# Default core check: gate.json valido (sin gate.json = perfil solo por defecto)
try {
    $cfg = Get-GateConfig -ProjectPath $Script:DoctorProject
    $label = if ($cfg.Source) { "gate.json (perfil $($cfg.Profile))" } else { "gate.json ausente: perfil $($cfg.Profile) por defecto" }
    Write-Ok $label
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'gate.json'; Pass = $true }
} catch {
    Write-Warn2 $_.Exception.Message
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'gate.json'; Pass = $false }
}
