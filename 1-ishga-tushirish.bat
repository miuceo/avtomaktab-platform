@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Avtomaktab server
echo Avtomaktab serveri ishga tushmoqda... Bu oynani YOPMANG.
echo Toxtatish uchun shu oynani yoping.
if not exist node_modules call npm install
if not exist .next call npm run build
call npm start
pause
