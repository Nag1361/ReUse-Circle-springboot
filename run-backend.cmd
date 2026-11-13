@echo off
setlocal
cd /d "%~dp0backend"
if exist application-local.properties goto run
if not defined DB_USERNAME goto config
if not defined DB_PASSWORD goto config
if not defined JWT_SECRET goto config
:run
call mvnw.cmd spring-boot:run %*
exit /b %errorlevel%
:config
echo Copy backend\application-local.properties.example to backend\application-local.properties.
echo Set your MySQL credentials and JWT secret using README.md, then run again.
exit /b 1
