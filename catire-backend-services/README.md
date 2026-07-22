# Catire — Backend Services

Esta es la documentacion del servidor de la app movil del Catire Hot Dog. Contiene todo lo necesario para entender, instalar y ejecutar los microservicios en entornos Linux y Windows, así como instrucciones para Docker.

**Resumen**
- Proyecto: conjunto de microservicios (NestJS) que componen la API del proyecto.
- Estructura principal: cada microservicio está en su propia carpeta (por ejemplo: `auth-service`, `catalog-service`, `order-service`, `finance-config-service`).
- Configuracion: [docker compose.yml](docker compose.yml) y desarrollo local con Node.js.

**Requisitos**
- Node.js LTS (recomendado v18 o superior)
- npm (incluido con Node)
- Git
- Docker & Docker Compose
- En Windows: PowerShell o Git Bash.

**Estructura del repositorio**
- [auth-service](auth-service) — Autenticacion y autorizacion de usuarios
- [catalog-service](catalog-service) — Catalogo de los productos, menus y sucursales 
- [order-service](order-service) — Gestion de pedidos de los productos
- [finance-config-service](finance-config-service) — Configuracion/Pagos
- [nginx](nginx) — API Gateway (punto de partida)
- [docker compose.yml](docker compose.yml) — Servicios para despliegue local
- [Dockerfile.dev](Dockerfile.dev) — Definicion de Docker en dev (raíz)

## Guia de preparacion

- Prepara la variable de entorno raiz:

  Linux:
  ```
  cp .env.example .env
  ```

  Windows:
  ```
  copy .env.example .env
  ```

- Ejecuta los contenedores de docker:

  Linux:
  ```
  sudo docker compose up -d --build
  ```

  Windows (Asegurate de abrir el Docker Desktop para iniciar el engine de Docker):
  ```
  docker compose up -d --build
  ```
- Configura las variables de entorno del proyecto base y de los microservicios:

  Linux:
  ```
  cd auth-service/ && cp .env.example .env && cd ..
  cd catalog-service/ && cp .env.example .env && cd ..
  cd finance-config-service/ && cp .env.example .env && cd ..
  cd order-service/ && cp .env.example .env && cd ..
  ```

  Windows:
  ```
  cd auth-service ; copy .env.example .env ; cd ..
  cd catalog-service ; copy .env.example .env ; cd ..
  cd finance-config-service ; copy .env.example .env ; cd ..
  cd order-service ; copy .env.example .env ; cd ..
  ```

- Ejecuta los scripts para preparar los microservicios (dependencias, migraciones, etc):
  
  Linux:
  ```
  chmod +x prepare-microservices.sh
  ./prepare-microservices.sh
  ```

  Windows:
  ```
  .\prepare-microservices.bat
  ```

- Pruebe ahora ejecutando el contenedor de postgres y verificando las tablas:
  ```
  docker exec -it catire_postgres_db psql -U root -d postgres
  ```

  Si este comando falla, verifique los pasos anteriores.

  Y ahora haga una consulta a una base de datos para ver sus tablas:
  
  ```psql
  \c catire_auth_db
  \d
  ```

  ## Configuracion de Mongo

  Una vez verificados los contenedores, aseguramos que las bases de datos de Mongo funcionen correctamente en modo replicacion (`--replSet rs0`):

  Windows:
  ```
  docker exec -i catire_audit_db mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'catire_audit_db:27017'}]})"

  docker exec -i catire_audit_db mongosh --eval "rs.status()"

  docker exec -i catire_config_db mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'catire_config_db:27017'}]})"

  docker exec -i catire_config_db mongosh --eval "rs.status()"

  docker exec -i order-service npx prisma db push
  docker exec -i finance-config-service npx prisma db push
  ```

  Linux:
  ```
  docker exec -i catire_audit_db mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'catire_audit_db:27017'}]})"

  docker exec -i catire_audit_db mongosh --eval "rs.status()"

  docker exec -i catire_config_db mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'catire_config_db:27017'}]})"

  docker exec -i catire_config_db mongosh --eval "rs.status()"

  docker exec -i order-service npx prisma db push
  docker exec -i finance-config-service npx prisma db push
  ```

## Pasos en desarrollo

  Al iniciar el proyecto y querer ejecutar los microservicios, use el siguiente comando:

  Windows:
  ```
  docker compose up -d
  ```

  Linux:
  ```
  sudo docker compose up -d
  ```

  Si todos los pasos anteriores fueron correctos, podra consultar un servicio y sus salidas (no deberia ver errores). Por ejemplo:

  ```
  docker logs -f auth-service
  ```

  Al hacer algun cambio, es recomendado reiniciar los contenedores para asegurar un cambio asegurado:

  Windows:
  ```
  docker compose down && docker compose up -d
  ```

  Linux:
  ```
  sudo docker compose down && sudo docker compose up -d
  ```

  Asi mismo, es recomendado volver a generar los clientes de prisma en caso de modificar algo de la base de datos. Por ejemplo:

  Windows:
  ```
  docker exec -it auth-service npx prisma generate
  cd .\auth-service\ && npx prisma generate && cd ..
  ```

  Linux:
  ```
  sudo docker exec -it auth-service npx prisma generate
  cd auth-service/ && sudo npx prisma generate && cd ..
  ```

## Posibles soluciones a errores

  - Compruebe por volver a ejecutar el script **prepare-microservices** (.bat para windows, .sh para linux).
  
  - Vuelva a ejecutar el contenedor pero desde cero:

    Windows:
    ```
    docker compose down && docker compose up -d --build
    ```

    Linux:
    ```
    sudo docker compose down && sudo docker compose up -d --build
    ```

  - Considere eliminar las carpetas **node_modules** y **dist** de cada microservicio y volver a generar los contenedores, limpiando por completo docker para un reinicio masivo (OJO: solo hacerlo en casos necesarios, no todo el tiempo):

    Windows:
    ```
    docker compose down -v && docker compose rm -fsv && docker builder prune && docker compose up -d --build
    ```

    Linux:
    ```
    sudo docker compose down -v && sudo docker compose rm -fsv && sudo docker builder prune && sudo docker compose up -d --build
    ```

## Notas específicas por servicio
- `auth-service`: maneja login, refresh tokens, creación de usuarios y validación de permisos.
  - Revisa `src/main.ts` y `.env` para puerto y variables (JWT_SECRET, DB_URI).
- `catalog-service`: gestiona productos, categorías y búsquedas.
  - Variables típicas: conexión a base de datos, índices de búsqueda.
- `order-service`: crea y maneja flujo de pedidos (estado, pagos, notificaciones).
  - Puede requerir integración con `finance-config-service`.
- `finance-config-service`: servicios y configuraciones financieras necesarias para pagos y contabilidad.

---
Fecha de generación: 2026-04-23
