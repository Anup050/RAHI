@echo off
cd ai-engine
echo Starting with logging...
python -m uvicorn main:app --host 0.0.0.0 --port 8002 --reload > ai_crash_log.txt 2>&1
