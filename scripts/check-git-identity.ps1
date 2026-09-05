# DealFlow360 Helper: Check Local Git Identity and Remote
$currentDir = Get-Location
$uName = git config --local user.name
$uEmail = git config --local user.email
$remoteUrl = git remote get-url origin
$branch = git branch --show-current

Write-Host "=== DEALFLOW360 LOCAL GIT IDENTITY CHECK ===" -ForegroundColor Cyan
Write-Host "Working Directory: $currentDir"
Write-Host "Current Branch:    $branch" -ForegroundColor Yellow
Write-Host "Git Author:        $uName" -ForegroundColor Green
Write-Host "Git Email:         $uEmail" -ForegroundColor Green
Write-Host "Remote URL:        $remoteUrl" -ForegroundColor Gray

# Validate identity match
if ($currentDir -like "*dealflow-neeraj*" -and ($uName -ne "neerajshetye9" -or $remoteUrl -notlike "*github-neeraj*")) {
    Write-Host "[WARNING] Identity or SSH remote mismatch for Neeraj repository!" -ForegroundColor Red
} elseif ($currentDir -like "*dealflow-atharva*" -and ($uName -ne "atharvashirke18" -or $remoteUrl -notlike "*github-atharva*")) {
    Write-Host "[WARNING] Identity or SSH remote mismatch for Atharva repository!" -ForegroundColor Red
} elseif ($currentDir -like "*dealflow-vignesh*" -and ($uName -ne "vignesh752006" -or $remoteUrl -notlike "*github-vignesh*")) {
    Write-Host "[WARNING] Identity or SSH remote mismatch for Vignesh repository!" -ForegroundColor Red
} else {
    Write-Host "[PASS] Git local identity and SSH remote verified." -ForegroundColor Green
}
