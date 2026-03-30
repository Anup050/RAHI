@echo off
cd ai-engine
if not exist venv (
    echo Creating virtual environment for AI Engine...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
    python train.py
) else (
    call venv\Scripts\activate
)

echo Starting AI Engine...
uvicorn main:app --reload --host 0.0.0.0 --port 8003
pause
