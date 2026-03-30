@echo off
setlocal
echo ===================================================
echo      RAHI Control Center - QUICK FIX
echo ===================================================
echo.
echo Attempting to install ONLY the missing packages...
echo.

cd apps\web

call npm install framer-motion class-variance-authority clsx tailwind-merge lucide-react react-hook-form zod @hookform/resolvers @radix-ui/react-alert-dialog @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-tabs @tanstack/react-query --legacy-peer-deps

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Install failed again.
    echo Please TAKE A SCREENSHOT of the error above.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Missing packages installed.
echo Starting server...
call npm run dev
pause
