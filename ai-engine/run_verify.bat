@echo off
"..\backend\venv\Scripts\python.exe" verify_offline.py > verify_result.txt 2>&1
echo DONE >> verify_result.txt
