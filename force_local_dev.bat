@echo off
echo ==========================================
echo      RAHI Web Local Dev Launcher
echo ==========================================
cd apps\web

echo [1/3] Verifying Local Binary Path...
set NEXT_CMD=node_modules\.bin\next.cmd

if not exist "%NEXT_CMD%" (
    echo [ERROR] Local binary not found at %NEXT_CMD%
    echo Please run 'npm install' in apps\web first.
    pause
    exit /b 1
)

echo [2/3] Checking Local Version (Should be 14.x)...
call "%NEXT_CMD%" --version
echo.

echo [3/3] STARTING SERVER (Bypassing npm)...
echo Executing: "%NEXT_CMD%" dev
call "%NEXT_CMD%" dev

pause
