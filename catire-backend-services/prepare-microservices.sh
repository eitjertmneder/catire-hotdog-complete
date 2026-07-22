#!/bin/bash

# Definición de servicios
SERVICES=("auth-service" "catalog-service" "order-service" "finance-config-service")

echo "Preparando cada microservicio (Local y Docker)..."

for s in "${SERVICES[@]}"; do
    if [ -d "$s" ]; then
        echo -e "\n===================================================="
        echo "PROCESANDO: $s"
        echo "===================================================="
        
        pushd "$s" > /dev/null

        rm -rf node_modules dist
        
        echo "[1] Instalando dependencias locales..."
        npm install
        
        echo "[2] Instalando dependencias en Docker..."
        sudo docker exec -i "$s" npm install
        
        if [[ "$s" == "order-service" || "$s" == "finance-config-service" ]]; then
            echo "[3] Preparar base de datos..."
            npx prisma generate
            sudo docker exec -i "$s" npx prisma db push
            sudo docker exec -i "$s" npx prisma generate
            echo "[4] Reiniciando servicio en Docker para cargar cliente Prisma generado..."
            sudo docker restart "$s"

        else
            echo "[3] Preparar base de datos..."
            npx prisma generate
            sudo docker exec -i "$s" npx prisma migrate deploy
            sudo docker exec -i "$s" npx prisma generate
            echo "[4] Reiniciando servicio en Docker para cargar cliente Prisma generado..."
            sudo docker restart "$s"
        fi
        
        popd > /dev/null
    else
        echo -e "\nERROR: La carpeta $s no existe."
    fi
done

echo -e "\nProceso finalizado."