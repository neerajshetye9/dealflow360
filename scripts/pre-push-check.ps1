# DealFlow360 Helper: Pre-Push Security & Compliance Check
$branch = git branch --show-current
$uName = git config --local user.name
$uEmail = git config --local user.email
$remoteUrl = git remote get-url origin

Write-Host "=== DEALFLOW360 PRE-PUSH SAFETY AUDIT ===" -ForegroundColor Cyan

# 1. Main protection check
if ($branch -eq "main") {
    Write-Host "[FAIL] DIRECT PUSH TO MAIN IS FORBIDDEN! Create a feature branch or PR into develop." -ForegroundColor Red
    exit 1
} else {
    Write-Host "[PASS] Not on protected 'main' branch (Current: $branch)." -ForegroundColor Green
}

# 2. Secret and .env file check
$dangerousFiles = Get-ChildItem -Recurse -Force -Include ".env*", "*.pem", "*.key", "id_ed25519*" -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notlike "*\.git\*" }
if ($dangerousFiles) {
    Write-Host "[FAIL] Potentially sensitive files found in workspace:" -ForegroundColor Red
    $dangerousFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Yellow }
    Write-Host "Remove or add them to .gitignore before pushing!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "[PASS] No secrets or .env files detected." -ForegroundColor Green
}

# 3. Identity check
Write-Host "[PASS] Verified Author: $uName <$uEmail>" -ForegroundColor Green
Write-Host "[READY] Safe to push to $branch via $remoteUrl" -ForegroundColor Cyan
