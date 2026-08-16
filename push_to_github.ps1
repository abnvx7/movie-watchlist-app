# CineTrack - PowerShell Push to GitHub Script
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       CineTrack - Push to GitHub Automation" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$repoUrl = Read-Host "Enter your GitHub Repository URL (e.g. https://github.com/your-username/movie-watchlist-app.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "[ERROR] No URL entered. Exiting." -ForegroundColor Red
    Exit
}

Set-Location $PSScriptRoot

if (-not (Test-Path ".git")) {
    git init
}

git branch -M main
git remote remove origin 2>$null
git remote add origin $repoUrl.Trim()

Write-Host "`nStaging and committing files..." -ForegroundColor Yellow
git add .
git commit -m "feat: CineTrack Movie & TV Watchlist with JWT Auth & Production Config" 2>$null

Write-Host "`nPushing to GitHub..." -ForegroundColor Yellow
Write-Host "(A browser authentication window may pop up if not logged in)`n" -ForegroundColor DarkGray

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host " SUCCESS! Code pushed to GitHub successfully!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green
    Write-Host "`nNext Step: Deploy full-stack app on Render:" -ForegroundColor Cyan
    Write-Host "1. Go to https://render.com" -ForegroundColor White
    Write-Host "2. Click 'New +' -> 'Blueprint'" -ForegroundColor White
    Write-Host "3. Select your GitHub repository. It will automatically build and deploy both Backend & Frontend!" -ForegroundColor White
} else {
    Write-Host "`n[ERROR] Push failed. Check your repo URL and GitHub permissions." -ForegroundColor Red
}
