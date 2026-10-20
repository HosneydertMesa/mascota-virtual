# Default core check: .git/hooks/commit-msg installed (gate plan gate)
$checkPath = Join-Path $Script:DoctorProject '.git/hooks/commit-msg'
if (Test-Path $checkPath) {
    Write-Ok '.git/hooks/commit-msg'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/commit-msg'; Pass = $true }
} else {
    Write-Warn2 'Falta: .git/hooks/commit-msg'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/commit-msg'; Pass = $false }
}
