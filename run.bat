@echo off
setlocal

set "cmd=%~1"

if "%cmd%"=="restart" goto restart
if "%cmd%"=="logs" goto logs
goto usage

:restart
docker compose down || exit /b 1
docker compose up --build -d || exit /b 1
goto :eof

:logs
docker compose logs -f
goto :eof

:usage
echo Usage: run {restart^|logs} 1>&2
exit /b 1
