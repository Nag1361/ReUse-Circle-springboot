@echo off
setlocal
cd /d "%~dp0frontend"
if not exist .env copy /y .env.example .env >nul
call npmw.cmd ci
if errorlevel 1 exit /b %errorlevel%
call npmw.cmd run dev
exit /b %errorlevel%
