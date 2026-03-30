@echo off
echo Setting up RAHI Web Frontend...
cd apps\web
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed.
    pause
    exit /b %errorlevel%
)
echo Starting development server...
call npm run dev
pause
