@echo off
echo ================================================
echo   FacelessTube - Debug APK Build
echo ================================================
echo.

REM Set environment variables
set "ANDROID_HOME=C:\Users\ssjvi\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

echo [1/3] Building with Vite...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Vite build failed!
    exit /b 1
)
echo.

echo [2/3] Syncing to Android with Capacitor...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    exit /b 1
)
echo.

echo [3/3] Building debug APK with Gradle...
cd android
call gradlew.bat assembleDebug
if %errorlevel% neq 0 (
    echo ERROR: Gradle debug build failed!
    cd ..
    exit /b 1
)
cd ..
echo.

echo ================================================
echo   DEBUG BUILD SUCCESSFUL!
echo   APK: android\app\build\outputs\apk\debug\app-debug.apk
echo ================================================
