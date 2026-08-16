@echo off
echo ========================================================
echo Launching CineTrack Full-Stack Application
echo ========================================================
start "CineTrack Backend (Django :8000)" cmd /k "%~dp0run_backend.bat"
start "CineTrack Frontend (React :5173)" cmd /k "%~dp0run_frontend.bat"
echo.
echo Both servers are starting up:
echo - Frontend UI: http://localhost:5173
echo - Backend API: http://127.0.0.1:8000/api/
echo - Admin Panel: http://127.0.0.1:8000/admin/
echo.
