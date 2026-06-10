@echo off
echo Starting BAFCO Platform...
echo.

echo [1/2] Starting Backend Server (port 3000)...
start "BAFCO-Server" cmd /c "cd /d %~dp0server && npx tsx src/index.ts"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (port 5173)...
start "BAFCO-Client" cmd /c "cd /d %~dp0client && npx vite --host"

echo.
echo BAFCO Platform is starting up!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Close this window to stop both servers.
pause
