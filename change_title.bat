@echo off
echo Palaiž nosaukuma mainītāju...

:: Palaist nosaukuma mainītāju un sagaidīt, līdz tas pabeidz darbu
call node title_changer.js
if errorlevel 1 (
    echo Neizdevās mainīt nosaukumu
    pause
    exit /b 1
)

:: Startēt serverus tikai tad, ja title_changer.js pabeidzas veiksmīgi
echo.
echo Nosaukuma maiņa pabeigta. Startē serverus...
echo.

echo Startē Node serveri...
start cmd /k node server.js

echo Startē lietotni...
start cmd /k npm start

pause
