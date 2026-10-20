# Default core check: .git/hooks/pre-commit installed
$checkPath = Join-Path $Script:DoctorProject '.git/hooks/pre-commit'
if (Test-Path $checkPath) {
    Write-Ok '.git/hooks/pre-commit'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/pre-commit'; Pass = $true }
} else {
    Write-Warn2 'Falta: .git/hooks/pre-commit'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/pre-commit'; Pass = $false }
}
