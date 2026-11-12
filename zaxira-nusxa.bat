@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist data\app.db (echo Hali baza yoq - saqlanadigan narsa yoq.& goto end)
for /f %%i in ('%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe -NoProfile -Command Get-Date -Format yyyy-MM-dd_HH-mm') do set D=%%i
if not defined D set D=nusxa
mkdir "zaxira\%D%" 2>nul
copy /y data\app.db "zaxira\%D%\app.db" >nul
if exist public\uploads xcopy /e /i /q /y public\uploads "zaxira\%D%\uploads" >nul
echo Zaxira nusxa saqlandi: zaxira\%D%
:end
if not "%1"=="nopause" pause
