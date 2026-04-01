@echo off
echo ================================================
echo   FacelessTube - Play Store Build (Signed AAB)
echo   Uses Google Play Billing (NOT Stripe)
echo ================================================
echo.

REM Set environment variables
set "CAPACITOR_BUILD=1"
set "VITE_BILLING_MODE=playstore"
set "ANDROID_HOME=C:\Users\ssjvi\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

echo [1/3] Building with Vite (Play Store mode)...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.

echo [2/3] Syncing to Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo ERROR: Capacitor sync failed!
    exit /b 1
)
echo.

echo [3/3] Building signed AAB with Gradle...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo ERROR: Gradle build failed!
    cd ..
    exit /b 1
)
cd ..
echo.

echo ================================================
echo   BUILD SUCCESSFUL!
echo   AAB: android\app\build\outputs\bundle\release\app-release.aab
echo   Mode: Google Play Billing (signed release)
echo.
echo   Upload this AAB to Google Play Console:
echo   https://play.google.com/console
echo ================================================
