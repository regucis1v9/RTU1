@echo off
echo Running title changer...

:: Run the title changer and wait for it to complete
call node title_changer.js
if errorlevel 1 (
    echo Failed to change title
    pause
    exit /b 1
)

:: Only start servers after title_changer.js has completed successfully
echo.
echo Title change completed. Starting servers...
echo.

echo Starting the node server...
start cmd /k node server.js

echo Starting the application...
start cmd /k npm start

pause
