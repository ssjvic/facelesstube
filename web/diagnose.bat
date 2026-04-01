@echo off
echo --- Directory Listing --- > build_check.txt
dir src /s >> build_check.txt
echo. >> build_check.txt
echo --- Logo Check --- >> build_check.txt
if exist src\assets\logo.png (echo LOGO_EXISTS >> build_check.txt) else (echo LOGO_MISSING >> build_check.txt)
echo. >> build_check.txt
echo --- NPM Build Output --- >> build_check.txt
npm run build >> build_check.txt 2>&1
