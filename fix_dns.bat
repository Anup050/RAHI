@echo off
echo ===================================================
echo This script will add the Neon DB address to your
echo Windows hosts file to bypass the local DNS block.
echo.
echo PLEASE ENSURE YOU RAN THIS AS ADMINISTRATOR!
echo ===================================================
pause

set "HOSTS_FILE=%WINDIR%\System32\drivers\etc\hosts"
set "IP_ADDRESS=3.0.167.45"
set "HOSTNAME=ep-raspy-art-aoqeixf5-pooler.c-2.ap-southeast-1.aws.neon.tech"

echo.
echo Adding entry to hosts file...
echo %IP_ADDRESS% %HOSTNAME% >> "%HOSTS_FILE%"

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Failed to update hosts file!
    echo Did you forget to right-click and "Run as Administrator"?
    echo.
) else (
    echo.
    echo SUCCESS! The hosts file has been updated.
    echo Your database connection should now work perfectly.
    echo.
)
pause
