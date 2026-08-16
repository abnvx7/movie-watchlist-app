@echo off
echo ========================================================
echo Starting CineTrack Django REST Backend (Port 8000)
echo ========================================================
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
) else (
    python manage.py runserver 0.0.0.0:8000
)
pause
