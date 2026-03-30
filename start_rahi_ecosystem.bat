@echo off
setlocal
title RAHI Ecosystem Launcher

echo ===================================================
echo     RAHI - Rural AI Healthcare Interface
echo      Starting All Services (Web & Mobile)
echo ===================================================
echo.

:: Ensure we are in the root directory
cd /d %~dp0

:: 1. Backend Service
echo [1/4] Starting Backend Service...
if not exist "backend\venv" (
    echo    - Virtual environment not found. Running setup...
    call setup_backend.bat
    cd /d %~dp0
)
start "RAHI Backend" cmd /k "cd backend && if exist venv (call venv\Scripts\activate) else (echo Venv missing, using global python) && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: 2. AI Engine Service
echo [2/4] Starting AI Engine...
:: Note: Relying on user-level installation or existing venv if present
start "RAHI AI Engine" cmd /k "cd ai-engine && if exist venv (call venv\Scripts\activate) else (echo Venv missing, using global python) && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001"

:: 3. Web Dashboard
echo [3/4] Starting Web Dashboard...
if not exist "apps\web\node_modules" (
    echo    - Dependencies missing in apps/web. Running npm install...
    cd apps\web
    call npm install
    cd /d %~dp0
)
start "RAHI Web Dashboard" cmd /k "cd apps\web && npm run dev"

:: 4. Mobile App
echo [4/4] Starting Mobile App...
if not exist "apps\mobile\node_modules" (
    echo    - Dependencies missing in apps/mobile. Running npm install...
    cd apps\mobile
    call npm install
    cd /d %~dp0
)
start "RAHI Mobile App" cmd /k "cd apps\mobile && npx expo start"

echo.
echo ===================================================
echo   All services have been launched in new windows!
echo ===================================================
echo.
echo - Backend API:      http://localhost:8000/docs
echo - AI Engine API:    http://localhost:8001/docs
echo - Web Dashboard:    http://localhost:3000
echo - Mobile App:       Scan the QR code in the Mobile App window
echo.
pause
