@echo off
echo Installing AI Engine Dependencies...
cd ai-engine
pip install -r requirements.txt

echo.
echo Training AI Model...
python train.py

echo.
echo Starting AI Inference Server...
uvicorn main:app --reload --host 0.0.0.0 --port 8001
pause
