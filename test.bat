
@echo off
echo Set objArgs = WScript.Arguments > "%temp%\msgbox.vbs"
echo Set objShell = CreateObject("WScript.Shell") >> "%temp%\msgbox.vbs"
echo objShell.Popup "Fails tika palaists", 0, "Paziņojums", 64 >> "%temp%\msgbox.vbs"
echo WScript.Quit >> "%temp%\msgbox.vbs"
cscript //nologo "%temp%\msgbox.vbs"
del "%temp%\msgbox.vbs"

