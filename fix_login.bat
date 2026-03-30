@echo off
echo Stopping services...
docker-compose down

echo Starting services (this may take a while)...
docker-compose up -d --build

echo Waiting for database to initialize (10 seconds)...
timeout /t 10 /nobreak

echo Creating test user...
docker exec rahi_backend python create_test_user.py

echo.
echo ========================================================
echo STATUS CHECK:
echo 1. Open http://localhost:8000 in your browser.
echo    If you see "Welcome to RAHI API", backend is working.
echo.
echo 2. If you are on a PHYSICAL PHONE:
echo    You MUST update apps/mobile/src/config.ts with your IP.
echo    Your IP is:
ipconfig | findstr "IPv4"
echo ========================================================
pause
