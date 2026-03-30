@echo off
cd ai-engine
echo Starting AI Engine on global python...
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload
