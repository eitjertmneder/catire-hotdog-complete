@echo off
setlocal enabledelayedexpansion

set SERVICES=auth-service catalog-service order-service finance-config-service

echo Instalando dependencias de cada microservicio...

for %%s in (%SERVICES%) do (
    if exist %%s (
        echo ----------------------------------------------------
        echo Instalando en: %%s
        echo ----------------------------------------------------
        cd %%s
        call npm install
        cd ..
    ) else (
        echo ERROR: La carpeta %%s no existe. Saltando al siguiente...
    )
)

echo ¡Proceso finalizado con exito!
pause