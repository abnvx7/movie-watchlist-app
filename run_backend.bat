@echo off
setlocal
echo ========================================================
echo Starting CineTrack Django REST Backend (Port 8000)
echo ========================================================
cd /d "%~dp0backend"

if not exist "venv\Scripts\python.exe" (
    echo [Setup] Creating Python virtual environment...
    python -m venv venv
    echo [Setup] Installing requirements...
    .\venv\Scripts\pip.exe install -r requirements.txt
)

echo [Setup] Running database migrations...
.\venv\Scripts\python.exe manage.py migrate --no-input

echo [Setup] Verifying demo account and seed data...
.\venv\Scripts\python.exe init_demo.py

echo.
echo ========================================================
echo Django REST Backend running on http://127.0.0.1:8000/
echo ========================================================
.\venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
