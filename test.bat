@echo off
set "title=Paziņojums"
set "message=Fails tika palaists"

REM Find the user's desktop directory dynamically
for /f "tokens=2* delims=:"] %%a in ('"%SYSTEMROOT%\System32\Reg.exe QUERY "HKCU\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders" /v Desktop"') do set "desktopPath=%%b"
set "desktopPath=%desktopPath:\\=\%"
set "iconPath=%desktopPath%\zVwOQQHJb54y5A3NvviupegCTNCHLA1N.ico"

mshta "vbscript:msgbox(""%message%"", 64, ""%title%"")(window.close)"

REM 64 is the vbscript constant for an informational icon.
