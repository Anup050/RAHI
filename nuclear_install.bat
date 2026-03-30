@echo off
echo ==========================================
echo      RAHI Web NUCLEAR RESET
echo ==========================================
cd apps\web

echo [1/6] Removing package-lock.json...
if exist package-lock.json del /f /q package-lock.json

echo [2/6] Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo [3/6] Cleaning npm cache...
call npm cache clean --force

echo [4/6] Installing dependencies (Fresh Start)...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b %errorlevel%
)

echo [5/6] Verifying Autoprefixer...
if exist node_modules\autoprefixer (
    echo [SUCCESS] Autoprefixer is FINALLY installed.
) else (
    echo [CRITICAL ERROR] Autoprefixer is STILL missing. Check your antivirus or permissions.
    pause
    exit /b 1
)

echo [6/6] Starting Server...
echo Note: If this fails, please check the error message carefully.
call npm run dev

pause
