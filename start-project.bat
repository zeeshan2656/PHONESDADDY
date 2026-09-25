@echo off
title PhonesDaddy Web Application Launcher
color 0A
echo ========================================================
echo        Starting PhonesDaddy Web Application
echo ========================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Navigate to script directory
cd /d "%~dp0"

echo [1/2] Checking MySQL connection...
echo (Make sure MySQL is started in XAMPP or Windows Services)
echo.

echo [2/2] Starting Node.js Web Server...
echo Website will run at: http://localhost:3000
echo Admin Portal:        http://localhost:3000/admin
echo.
echo Press Ctrl+C in this window to stop the server anytime.
echo ========================================================
echo.

npm start

pause
