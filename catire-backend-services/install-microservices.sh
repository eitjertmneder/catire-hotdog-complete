#!/bin/bash

SERVICES=("auth-service" "catalog-service" "order-service" "finance-config-service")

echo "Instalando dependencias de cada microservicio..."

for SERVICE in "${SERVICES[@]}"
do
    if [ -d "$SERVICE" ]; then
        echo "----------------------------------------------------"
        echo "Instalando en: $SERVICE"
        echo "----------------------------------------------------"
        cd "$SERVICE" && npm install
        cd ..
    else
        echo "ERROR: La carpeta $SERVICE no existe. Saltando al siguiente..."
    fi
done

echo "¡Proceso finalizado con éxito!"