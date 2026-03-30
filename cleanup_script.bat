@echo off
echo Cleaning up...
mkdir services\api 2>nul
mkdir services\ai-engine 2>nul
mkdir infrastructure 2>nul

echo Moving Backend...
robocopy backend services\api /E /MOVE /XD venv __pycache__ .pytest_cache

echo Moving AI Engine...
robocopy ai-engine services\ai-engine /E /MOVE /XD __pycache__ .ipynb_checkpoints

echo Moving Infrastructure...
move nginx infrastructure\nginx
move docker-compose.prod.yml infrastructure\
move deploy.sh infrastructure\
move deploy.bat infrastructure\
move locustfile.py services\api\

echo Deleting Junk...
del /q *.bat
del /q manually_setup.md
del /q docker-compose.yml 

echo Restoring Start Script...
echo @echo off > start.bat
echo echo Starting RAHI Ecosystem... >> start.bat
echo docker-compose -f infrastructure/docker-compose.yml up -d >> start.bat
echo echo Services started. >> start.bat
echo pause >> start.bat

echo Done.
