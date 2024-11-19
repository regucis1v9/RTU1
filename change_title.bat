@echo off
node title_changer.js
if errorlevel 1 (
    echo Failed to change title
    pause
    exit /b 1
)

echo Starting the node server...
start cmd /k node server.js

echo Starting the application...
start cmd /k npm start

pause
