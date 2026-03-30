@echo off
echo Fixing missing dependencies...
cd apps\web
echo Installing autoprefixer explicitly...
call npm install autoprefixer --save-dev
if %errorlevel% neq 0 (
    echo Error: Failed to install autoprefixer.
    pause
    exit /b %errorlevel%
)
echo Verifying installation...
if exist node_modules\autoprefixer (
    echo Autoprefixer installed successfully.
) else (
    echo Error: Autoprefixer folder still missing!
    pause
    exit /b 1
)
echo Starting server...
call npm run dev
pause
