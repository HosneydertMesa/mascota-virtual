# Default core check: .git/hooks/pre-push installed
$checkPath = Join-Path $Script:DoctorProject '.git/hooks/pre-push'
if (Test-Path $checkPath) {
    Write-Ok '.git/hooks/pre-push'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/pre-push'; Pass = $true }
} else {
    Write-Warn2 'Falta: .git/hooks/pre-push'
    $Script:DoctorChecks += [pscustomobject]@{ Name = '.git/hooks/pre-push'; Pass = $false }
}
