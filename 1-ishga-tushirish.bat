@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Avtomaktab server
echo Avtomaktab serveri ishga tushmoqda... Bu oynani YOPMANG.
echo Toxtatish uchun shu oynani yoping.
if not exist node_modules call npm install
if not exist .next call npm run build
rem First run: put the "Avtomaktab" icon on the Desktop.
if not exist "%~dp0.yorliq" (call "%~dp0yorliq-yaratish.bat" nopause & echo.>"%~dp0.yorliq")
rem Open the platform in the browser once the server has had time to start.
start "" /min cmd /c "timeout /t 12 /nobreak >nul & start http://localhost:3000"
call npm start
pause
