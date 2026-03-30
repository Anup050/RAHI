@echo off
setlocal
echo ===================================================
echo      RAHI Control Center - NETWORK REPAIR & INTALL
echo ===================================================

cd apps\web

echo [1/5] resetting NPM Network Config...
call npm config delete proxy
call npm config delete https-proxy
call npm config set registry https://registry.npmjs.org/
call npm config set strict-ssl false

echo [2/5] Cleaning NPM Cache & Old Modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
call npm cache clean --force

echo [3/5] Installing Dependencies (This WILL work now)...
call npm install --legacy-peer-deps --no-audit
if %errorlevel% neq 0 (
    echo [ERROR] Installation failed!
    echo Please check your internet connection.
    pause
    exit /b 1
)

echo [4/5] Installing Dev Dependencies explicitly...
call npm install typescript @types/node @types/react postcss tailwindcss autoprefixer --save-dev

echo [5/5] Starting Development Server...
call npm run dev

pause
