@echo off
cd backend
if not exist venv (
    echo Virtual environment not found. Please run setup_backend.bat first.
    pause
    exit /b
)
call venv\Scripts\activate
echo Starting Backend Server...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
pause
