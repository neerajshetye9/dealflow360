# Ensure Git is found on PATH
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    $env:Path = "$userPath;$env:Path"
}

$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "Error: Not inside a Git repository." -ForegroundColor Red
    exit 1
}

if ($currentBranch -eq "main") {
    Write-Host "Error: You are on 'main'. Do not merge development changes directly on main." -ForegroundColor Red
    exit 1
}

Write-Host "=== SYNCING DEVELOP INTO $currentBranch ===" -ForegroundColor Cyan
Write-Host "1. Stashing any uncommitted local work..."
git stash

Write-Host "2. Fetching latest origin..."
git fetch origin --prune

Write-Host "3. Switching to develop and pulling latest..."
git switch develop
git pull origin develop

Write-Host "4. Switching back to $currentBranch..."
git switch $currentBranch

Write-Host "5. Merging develop into $currentBranch..."
git merge develop

Write-Host "6. Restoring stashed work if any..."
git stash pop

Write-Host "[COMPLETE] Current branch $currentBranch is now up to date with develop." -ForegroundColor Green
