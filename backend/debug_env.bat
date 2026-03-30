@echo off
echo Starting debug env setup > env_debug.log
echo Checking python... >> env_debug.log
python --version >> env_debug.log 2>&1
if %errorlevel% neq 0 (
    echo Python not found in PATH >> env_debug.log
    echo Trying py... >> env_debug.log
    py --version >> env_debug.log 2>&1
)

echo Creating venv... >> env_debug.log
python -m venv venv >> env_debug.log 2>&1
if exist venv (
    echo Venv created successfully >> env_debug.log
) else (
    echo Venv creation failed >> env_debug.log
)

echo Done >> env_debug.log
