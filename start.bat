@echo off
echo ========================================================
echo   Starting Jack.3D Portfolio Local Server
echo   URL: http://localhost:3000
echo ========================================================
powershell -ExecutionPolicy Bypass -File .\serve.ps1 -Port 3000
pause
