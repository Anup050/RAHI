@echo off
cd apps\mobile
echo Cleaning dependencies...
rmdir /s /q node_modules
del package-lock.json
echo Installing dependencies...
npm install --legacy-peer-deps
echo Done!
pause
