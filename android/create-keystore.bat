@echo off
echo ================================================
echo   Creando NUEVO keystore para FacelessTube
echo   (borra el keystore viejo primero)
echo ================================================
echo.

set JAVA="C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe"
set KEYSTORE=..\facelesstube.keystore
set PASSWORD=FacelessTube2026!
set ALIAS=facelesstube

REM Delete old keystore so we can create fresh
if exist "%KEYSTORE%" (
    echo Borrando keystore viejo...
    del "%KEYSTORE%"
    echo Borrado OK.
)

echo Generando keystore nuevo...
%JAVA% -genkeypair ^
  -v ^
  -keystore "%KEYSTORE%" ^
  -storetype PKCS12 ^
  -storepass "%PASSWORD%" ^
  -alias "%ALIAS%" ^
  -keypass "%PASSWORD%" ^
  -keyalg RSA ^
  -keysize 2048 ^
  -validity 10000 ^
  -dname "CN=FacelessTube, OU=App, O=FacelessTube, L=Mexico, S=Mexico, C=MX"

if %errorlevel% equ 0 (
    echo.
    echo ================================================
    echo   KEYSTORE CREADO!
    echo   Archivo:  facelesstube.keystore
    echo   Alias:    facelesstube
    echo   Password: FacelessTube2026!
    echo.
    echo   Ahora ejecuta: gradlew.bat bundleRelease
    echo ================================================
) else (
    echo ERROR: No se pudo crear el keystore.
)
pause
