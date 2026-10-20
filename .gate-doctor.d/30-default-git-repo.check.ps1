# Default core check: Git repository
$checkPath = Join-Path $Script:DoctorProject '.git'
if (Test-Path $checkPath) {
    Write-Ok 'Git repo'
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'Git repo'; Pass = $true }
} else {
    Write-Warn2 'Falta: Git repo'
    $Script:DoctorChecks += [pscustomobject]@{ Name = 'Git repo'; Pass = $false }
}
