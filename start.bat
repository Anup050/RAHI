@echo off
echo Starting RAHI Ecosystem...
docker-compose -f infrastructure/docker-compose.yml up -d
echo Services started.
pause
