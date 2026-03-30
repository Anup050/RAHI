@echo off
echo 🚀 RAHI AI Engine Upgrade Setup (Fixing Permissions)
echo ==================================================

echo 1. Upgrading pip...
python -m pip install --upgrade pip
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️ Failed to upgrade pip. Continuing...
)

echo.
echo 2. Installing dependencies (User Mode)...
python -m pip install --user -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies.
    echo Please try running this script as Administrator.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 3. Training the model...
python train_real.py
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Training failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Setup Complete! Model trained and saved.
echo You can now restart the backend server.
pause
