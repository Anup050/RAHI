@echo off
echo FIXING RAHI WEB APP...
echo ----------------------------------
cd apps\web

echo [1/3] Removing broken files...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo [2/3] Installing dependencies (Wait for this!)...
call npm install --legacy-peer-deps

echo [3/3] Starting App...
call npm run dev
pause
