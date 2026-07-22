@echo off
echo ========================================
echo   CATIRE HOT DOG - MODO OFFLINE
echo ========================================
echo.

REM Verificar que Docker este corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker no esta ejecutandose.
    echo Por favor inicia Docker Desktop y vuelve a intentar.
    pause
    exit /b 1
)

echo [1/3] Iniciando servicios backend...
cd /d "%~dp0catire-backend-services"

REM Verificar si los contenedores ya estan corriendo
docker ps --format "{{.Names}}" | findstr "api_gateway_nginx" >nul
if not errorlevel 1 (
    echo Los servicios ya estan ejecutandose.
) else (
    echo Iniciando contenedores Docker...
    docker-compose up -d
    echo Esperando que los servicios esten listos...
    timeout /t 15 /nobreak >nul
)

echo.
echo [2/3] Verificando servicios...
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr "catire\|auth\|catalog\|order\|finance\|nginx"
echo.

echo [3/3] Obteniendo IP local...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "172\."') do (
    set IP=%%a
)
set IP=%IP: =%
echo Tu IP local es: %IP%
echo.
echo ========================================
echo   CONFIGURACION PARA EL CELULAR
echo ========================================
echo.
echo 1. Asegurate de estar en la misma red WiFi
echo 2. En la app, la URL de la API debe ser:
echo    http://%IP%/api
echo.
echo 3. Para probar en el navegador del celular:
echo    http://%IP%/api/auth/
echo    Deberias ver "hello world"
echo.
echo ========================================
echo   SERVICIOS ACTIVOS
echo ========================================
echo.
echo - Backend API: http://%IP%/api
echo - PostgreSQL: localhost:5432
echo - MongoDB: localhost:27017
echo.
echo Para detener los servicios: docker-compose down
echo.
pause
