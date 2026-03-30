@echo off
title RAHI Infrastructure (Databases)

echo ===================================================
echo     RAHI - Rural AI Healthcare Interface
echo       Starting Database Infrastructure
echo ===================================================
echo.
echo Starting PostgreSQL, MongoDB, and Redis via Docker...

docker-compose up -d db_sql db_nosql redis

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Failed to start containers!
    echo Please ensure Docker Desktop is running.
    echo.
    pause
    exit /b
)

echo.
echo [SUCCESS] Databases are running!
echo You can now start the backend service.
echo.
pause
