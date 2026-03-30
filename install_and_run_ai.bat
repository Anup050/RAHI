@echo off
cd /d C:\Users\dubey\OneDrive\Desktop\RAHI\ai-engine
echo Installing joblib...
..\backend\venv\Scripts\pip.exe install joblib
echo Installing pandas...
..\backend\venv\Scripts\pip.exe install pandas
echo Installing scikit-learn...
..\backend\venv\Scripts\pip.exe install scikit-learn
echo Dependencies installed.
mod run_ai_simple.bat
pause
