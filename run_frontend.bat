@echo off
echo ========================================================
echo Starting CineTrack React Vite Frontend (Port 5173)
echo ========================================================
cd /d "%~dp0frontend"
call npm.cmd run dev -- --host
pause
