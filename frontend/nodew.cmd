@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "..\tools\node.ps1" node %*
exit /b %errorlevel%
