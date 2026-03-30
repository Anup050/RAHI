@echo off
cd /d "C:\Users\dubey\OneDrive\Desktop\RAHI\ai-engine"
"..\backend\venv\Scripts\python.exe" -m uvicorn main:app --reload --host 0.0.0.0 --port 8002
pause
