@echo off
setlocal
echo ==========================================
echo      RAHI Web App Bootstrap
echo ==========================================

cd apps\web

echo [1/5] Nuking old node_modules...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next

echo [2/5] Installing dependencies...
echo This will take a few minutes. Please wait...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b %errorlevel%
)

echo [3/5] Verifying critical packages...
if not exist node_modules\autoprefixer (
    echo [ERROR] Autoprefixer is still missing!
    echo Attempting force install...
    call npm install autoprefixer --save-dev
)

echo [4/5] Verifying local binary...
if not exist node_modules\.bin\next (
    echo [ERROR] Local Next.js binary missing.
    echo Attempting force install of Next.js...
    call npm install next@14.2.16
)

echo [5/5] Starting Development Server...
echo forcing usage of local binary at node_modules\.bin\next
call .\node_modules\.bin\next dev

pause
