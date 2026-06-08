@echo off
echo.
echo ========================================
echo   CloudGuard AI - Setup Script
echo ========================================
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Starting Docker services...
call docker-compose up -d
if %errorlevel% neq 0 (
    echo Warning: Docker services may not be available
    echo You can continue without Docker for frontend-only demo
)

echo.
echo Generating Prisma client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo Warning: Database setup failed, continuing with mock data
)

echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Run: npm run dev
echo   2. Open: http://localhost:3000
echo   3. Enjoy the CloudGuard AI demo!
echo.
echo For Docker services:
echo   - Grafana: http://localhost:3001
echo   - Prometheus: http://localhost:9090
echo.
pause
