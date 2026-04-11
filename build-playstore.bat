@echo off
echo ================================================
echo   FacelessTube - Play Store Build (Signed AAB)
echo   Uses Google Play Billing (NOT Stripe)
echo   Version 2.3 - Build 14
echo ================================================
echo.

REM ============ ENVIRONMENT VARIABLES ============
set "CAPACITOR_BUILD=1"
set "VITE_BILLING_MODE=playstore"
set "ANDROID_HOME=C:\Users\ssjvi\AppData\Local\Android\Sdk"
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"

REM Supabase (same as .env)
set "VITE_SUPABASE_URL=https://bmpxhntqtcgmqghydpxl.supabase.co"
set "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtcHhobnRxdGNnbXFnaHlkcHhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NjU0NjYsImV4cCI6MjA4MzM0MTQ2Nn0.AEIF40pVQhJ3N5QgjcWj-UzRGLEl8mfy-jtpeP5mXIc"
set "VITE_API_URL=https://facelesstube-backend.onrender.com"

REM Keystore (for signing)
set "KEYSTORE_PASSWORD=FacelessTube2026!"
set "KEY_ALIAS=facelesstube"
set "KEY_PASSWORD=FacelessTube2026!"

echo Variables configuradas:
echo   BILLING_MODE: %VITE_BILLING_MODE%
echo   SUPABASE_URL: %VITE_SUPABASE_URL%
echo   API_URL: %VITE_API_URL%
echo.

REM ============ STEP 1: Web Build ============
echo [1/3] Building web app (Play Store mode)...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm run build fallo!
    echo Verifica que no haya errores de compilacion en el codigo.
    pause
    exit /b 1
)
echo    Web build OK!
echo.

REM ============ STEP 2: Sync to Android ============
echo [2/3] Syncing to Android (Capacitor)...
call npx cap sync android
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Capacitor sync fallo!
    echo Verifica que tengas Android Studio instalado.
    pause
    exit /b 1
)
echo    Sync OK!
echo.

REM ============ STEP 3: Build Signed AAB ============
echo [3/3] Building signed AAB with Gradle...
cd android
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Gradle build fallo!
    echo Verifica que JAVA_HOME y ANDROID_HOME esten correctos.
    cd ..
    pause
    exit /b 1
)
cd ..
echo    Gradle build OK!
echo.

echo ================================================
echo   BUILD EXITOSO! Version 2.3 (Build 14)
echo.
echo   AAB para subir a Play Console:
echo   android\app\build\outputs\bundle\release\app-release.aab
echo.
echo   Pasos para subir:
echo   1. Ve a https://play.google.com/console
echo   2. Tu app -> Produccion -> Crear nueva version
echo   3. Sube el archivo .aab
echo   4. Completa notas de la version
echo   5. Revisar y publicar
echo ================================================
pause
