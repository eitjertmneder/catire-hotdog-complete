# Catire Hot Dog - Sistema de Gestion de Restaurantes

Sistema completo de gestion para cadena de restaurantes con aplicacion movil, backend con microservicios, y panel de administracion.

## Arquitectura

```
App Movil (React Native) → Nginx Gateway → 4 Microservicios NestJS
                                              ├── auth-service (PostgreSQL)
                                              ├── catalog-service (PostgreSQL)
                                              ├── order-service (MongoDB)
                                              └── finance-config-service (MongoDB)
```

## Requisitos Previos

- Docker Desktop
- Node.js 18+
- npm
- Git
- Expo Go (para desarrollo movil)

## Instalacion Rapida

### 1. Clonar el repositorio

```bash
git clone https://github.com/eitjertmneder/catire-hotdog-complete.git
cd catire-hotdog-complete
```

### 2. Iniciar el Backend (Docker)

```bash
cd catire-backend-services
docker-compose up -d
```

Esto levanta 8 contenedores:
- `api_gateway_nginx` (puerto 80)
- `auth-service` (puerto 3000)
- `catalog-service` (puerto 3000)
- `order-service` (puerto 3000)
- `finance-config-service` (puerto 3000)
- `catire_postgres_db` (puerto 5432)
- `catire_audit_db` (puerto 27017)
- `catire_config_db` (puerto 27017)

### 3. Configurar el Frontend

```bash
cd ../catire-frontend-mobile-app
npm install
```

### 4. Crear archivo .env

Crea un archivo `.env` en `catire-frontend-mobile-app/` con:

```env
EXPO_PUBLIC_API_URL=http://localhost/api
EXPO_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_google_maps_key
```

### 5. Iniciar la app movil

```bash
npx expo start --lan --port 8081
```

Escanea el QR con Expo Go en tu telefono.

## Credenciales de Prueba

| Rol | Email | Password |
|-----|-------|----------|
| Admin | wilmer@hotmail.com | 12345678 |
| Cajero Barrio Sucre | sergio@gmail.com | 12345678 |
| Cajero Barrio Obrero | pepe@gmail.com | 12345678 |
| Cliente | carlos@gmail.com | 12345678 |
| Invitado | guest@test.com | guest123 |

## Sucursales (8)

| ID | Nombre | Pais |
|----|--------|------|
| 1 | Barrio Sucre | Venezuela |
| 3 | El Malecon | Colombia |
| 4 | Prados del Este | Colombia |
| 11 | Barrio Obrero | Venezuela |
| 12 | La Asogata | Venezuela |
| 13 | La Grita | Venezuela |
| 16 | Sambil | Venezuela |
| 17 | Mestizos | Venezuela |

## Estructura del Proyecto

```
catire-hotdog-complete/
├── catire-frontend-mobile-app/    # React Native + Expo
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/           # Modulos (auth, catalog, orders, finance)
│   │   │   ├── shared/            # Componentes compartidos, stores, utils
│   │   │   ├── navigation/        # Navegacion
│   │   │   └── shared/styles/     # Temas y estilos
│   ├── app.json                   # Configuracion Expo
│   └── package.json               # Dependencias
│
├── catire-backend-services/       # NestJS Microservices
│   ├── auth-service/              # Autenticacion, usuarios, roles
│   ├── catalog-service/           # Sucursales, menus, productos, ingredientes
│   ├── order-service/             # Pedidos, auditoria, resenas
│   ├── finance-config-service/    # Pagos, tasas de cambio
│   ├── nginx/                     # API Gateway
│   └── docker-compose.yml         # Orquestacion
│
└── README.md
```

## Funcionalidades

### Cliente
- Login (Email, Google, Huella digital)
- Ver mapa de sucursales
- Armar pedidos personalizados
- Pagar (Pago Movil, Efectivo)
- Ver estado de pedidos
- Dejar resenas

### Cajero
- Panel de ordenes por sucursal
- Aprobar/cancelar pedidos
- Ver comprobante de pago
- Generar reporte diario (WhatsApp/PDF)
- Vibracion al recibir nuevas ordenes

### Administrador
- Dashboard con analytics
- Gestion de sucursales, menus, productos
- Gestion de usuarios y roles
- Inventario por sucursal
- Reportes avanzados
- Promociones
- Auditoria del sistema
- Configuracion de pagos y tasas de cambio

## Tecnologias

| Capa | Tecnologia |
|------|------------|
| Frontend | React Native + TypeScript + Expo SDK 57 |
| Backend | NestJS + TypeScript |
| Base de datos SQL | PostgreSQL 15 |
| Base de datos NoSQL | MongoDB 6 |
| ORM | Prisma 6.x |
| Estado global | Zustand |
| Navegacion | React Navigation |
| Mapas | Leaflet (WebView) |
| Autenticacion | JWT + Firebase |
| Infraestructura | Docker + Nginx |

## Comandos Utiles

```bash
# Iniciar backend
docker-compose up -d

# Detener backend
docker-compose down

# Ver logs
docker logs order-service -f

# Reiniciar un servicio
docker restart order-service

# Backup de base de datos
docker exec catire_postgres_db pg_dump -U root -d catire_auth_db > backup_auth.sql
docker exec catire_postgres_db pg_dump -U root -d catire_catalog_db > backup_catalog.sql

# Iniciar frontend (Expo Go)
npx expo start --lan --port 8081

# Iniciar frontend (Dev Client APK)
npx expo start --dev-client --lan --port 8081

# Build APK
npx eas-cli build --platform android --profile development
```

## Puerto de Servicios

| Servicio | Puerto |
|----------|--------|
| Nginx Gateway | 80 |
| PostgreSQL | 5432 |
| MongoDB Audit | 27017 |
| MongoDB Config | 27017 |

## Contacto

- WhatsApp: +584247038001
- Email: wilmer@hotmail.com
