@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Creates the "Avtomaktab" icon on the Desktop (works with OneDrive-redirected desktops too).
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -Command "$d=[Environment]::GetFolderPath('Desktop'); $s=(New-Object -ComObject WScript.Shell).CreateShortcut((Join-Path $d 'Avtomaktab.lnk')); $s.TargetPath='%~dp01-ishga-tushirish.bat'; $s.WorkingDirectory='%~dp0'; $s.IconLocation='%SystemRoot%\System32\shell32.dll,13'; $s.Description='Avtomaktab platformasini ishga tushirish'; $s.Save()"
if errorlevel 1 (echo Yorliq yaratilmadi.) else (echo Ish stolida "Avtomaktab" yorlig'i tayyor.)
if not "%1"=="nopause" pause
