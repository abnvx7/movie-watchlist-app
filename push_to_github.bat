@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo       CineTrack - Push to GitHub Automation
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. Check if git is installed
where git >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

:: 2. Prompt for GitHub repository URL
echo Enter your GitHub Repository URL (e.g. https://github.com/your-username/movie-watchlist-app.git):
set /p REPO_URL="Repo URL: "

if "%REPO_URL%"=="" (
    echo [ERROR] No URL provided. Please run the script again with a valid GitHub repository URL.
    pause
    exit /b 1
)

echo.
echo [1/4] Checking Git repository initialization...
if not exist ".git" (
    git init
    git branch -M main
) else (
    git branch -M main
)

echo [2/4] Setting remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
echo Remote set to: %REPO_URL%

echo [3/4] Staging and committing files...
git add .
git commit -m "feat: CineTrack Movie & TV Watchlist with JWT Auth & Production Config" >nul 2>&1

echo [4/4] Pushing to GitHub (main branch)...
echo (A browser window may open asking you to sign in to GitHub if you are not already logged in)
echo.

git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  SUCCESS! Code pushed to GitHub successfully!
    echo ========================================================
    echo.
    echo Next Step: Deploy to Render or Vercel
    echo 1. Go to https://render.com
    echo 2. Click New + > Blueprint
    echo 3. Connect your repository to deploy both Backend and Frontend automatically!
    echo.
) else (
    echo.
    echo [ERROR] Push failed. Please check the error above and verify:
    echo 1. The repository exists on your GitHub account.
    echo 2. You are logged into GitHub with permission to push.
    echo.
)

pause
