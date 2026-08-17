@echo off
setlocal
echo ========================================================
echo Starting CineTrack React Vite Frontend (Port 5173)
echo ========================================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [Setup] Installing frontend dependencies...
    call npm.cmd install
)

echo.
echo ========================================================
echo React Vite Frontend running on http://127.0.0.1:5173/
echo ========================================================
call npm.cmd run dev -- --host 127.0.0.1 --port 5173
pause
