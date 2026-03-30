@echo off
echo ==========================================
echo      RAHI PRODUCTION DEPLOYMENT
echo ==========================================

echo.
echo [1/3] Stopping existing containers...
docker-compose -f docker-compose.prod.yml down

echo.
echo [2/3] Building and Starting Production Services...
echo This may take a while (downloading images, building web/backend)...
docker-compose -f docker-compose.prod.yml up -d --build

echo.
echo [3/3] Deployment Request Sent.
echo.
echo Check status with: docker ps
echo.
echo Access your application at:
echo - Dashboard: http://localhost:3000
echo - API Docs:  http://localhost:8000/docs
echo - AI Engine: http://localhost:8001
echo.
pause
