@echo off
setlocal enabledelayedexpansion

set SERVICES=auth-service catalog-service order-service finance-config-service

echo Preparando cada microservicio (Local y Docker)...

for %%s in (%SERVICES%) do (
    if exist %%s (
        echo.
        echo ====================================================
        echo PROCESANDO: %%s
        echo ====================================================
        
        pushd %%s

        call rd /s /q node_modules
        call rd /s /q dist
        
        echo [1] Instalando dependencias locales...
        call npm install
        echo [2] Instalando dependencias en Docker...
        docker exec -i %%s npm install
        
        set "ES_MONGO=0"
        if "%%s"=="order-service" set "ES_MONGO=1"
        if "%%s"=="finance-config-service" set "ES_MONGO=1"

        if "!ES_MONGO!"=="1" (
            echo [3] Preparar base de datos...
            call npx prisma generate
            docker exec -i %%s npx prisma db push
            docker exec -i %%s npx prisma generate
            echo Reiniciando servicio en Docker para cargar cliente Prisma generado...
            docker restart %%s
        ) else (
            echo [3] Preparar base de datos...
            call npx prisma generate
            docker exec -i %%s npx prisma migrate deploy
            docker exec -i %%s npx prisma generate
            echo Reiniciando servicio en Docker para cargar cliente Prisma generado...
            docker restart %%s
        )
        popd
    ) else (
        echo ERROR: La carpeta %%s no existe.
    )
)

echo.
echo Proceso finalizado.
pause