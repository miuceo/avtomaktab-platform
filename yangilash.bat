@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Avval serverni toxtating (server oynasini yoping), keyin istalgan tugmani bosing.
pause
call "%~dp0zaxira-nusxa.bat" nopause
git pull
call npm install
call npm run build
echo Yangilandi. Endi 1-ishga-tushirish.bat ni oching.
pause
