@echo off
echo ================================================
echo   FacelessTube - Web Build (Vercel)
echo   Uses Stripe Payments
echo ================================================
echo.

echo [1/1] Building with Vite (Web mode)...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    exit /b 1
)
echo.
echo ================================================
echo   BUILD SUCCESSFUL!
echo   Deploy with: npx vercel --prod
echo   Mode: Stripe Payments
echo ================================================
