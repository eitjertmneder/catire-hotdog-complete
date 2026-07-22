
# CATIRE HOT DOG - GUÍA MODO OFFLINE

## Requisitos Previos
- Docker Desktop instalado y ejecutándose
- Node.js instalado (para Expo)
- WiFi conectado en ambos dispositivos (PC y celular)

## Paso 1: Iniciar Backend (Solo una vez)

Abre PowerShell en la carpeta `catire-backend-services` y ejecuta:

```powershell
docker-compose up -d
```

Espera ~15 segundos a que todos los servicios estén listos.

Verificar que todo está corriendo:
```powershell
docker ps
```

Deberías ver 8 contenedores:
- catire_postgres_db
- catire_audit_db
- catire_config_db
- auth-service
- catalog-service
- order-service
- finance-config-service
- api_gateway_nginx

## Paso 2: Verificar Conexión

En tu PC, abre el navegador y ve a:
```
http://localhost/api/auth/
```

Deberías ver "hello world"

## Paso 3: Configurar la App Móvil

La app ya está configurada para conectarse a `10.0.1.192` (tu IP local).

Asegúrate de que:
1. El celular y la PC estén en la **misma red WiFi**
2. El firewall de Windows permita conexiones en el puerto 80

Si no funciona, ejecuta en PowerShell como administrador:
```powershell
New-NetFirewallRule -DisplayName "Allow HTTP 80" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
```

## Paso 4: Probar desde el Celular

En el navegador del celular, ve a:
```
http://10.0.1.192/api/auth/
```

Si ves "hello world", la conexión funciona.

## Paso 5: Ejecutar la App

### Opción A: Con Expo Go (Desarrollo)
```powershell
cd catire-frontend-mobile-app
npx expo start
```
Escanea el QR con Expo Go en tu celular.

### Opción B: Con APK (Producción)
Si ya tienes el APK instalado, simplemente ábrelo.

## Comandos Útiles

### Iniciar todo
```powershell
cd catire-backend-services
docker-compose up -d
```

### Detener todo
```powershell
cd catire-backend-services
docker-compose down
```

### Ver logs
```powershell
docker-compose logs -f
```

### Reiniciar un servicio específico
```powershell
docker-compose restart auth-service
```

### Ver contenedores corriendo
```powershell
docker ps
```

## Solución de Problemas

### "Network Error" en la app
1. Verifica que Docker esté corriendo
2. Verifica que los contenedores estén activos (`docker ps`)
3. Verifica que el celular y PC estén en la misma red
4. Verifica el firewall de Windows

### Los contenedores no inician
```powershell
docker-compose down
docker-compose up -d
```

### La base de datos tiene datos corruptos
```powershell
docker-compose down -v  # Elimina los volúmenes
docker-compose up -d    # Recrea todo
```

### Cambiar la IP del servidor
Si tu IP cambió, edita:
`catire-frontend-mobile-app/src/app/shared/constants/IP.ts`

Cambia `10.0.1.192` por tu nueva IP.

Para encontrar tu IP:
```powershell
ipconfig | findstr "IPv4"
```

## Datos por Defecto

### Usuarios
| Email | Contraseña | Rol |
|-------|------------|-----|
| wilmer@hotmail.com | 12345678 | Admin |
| sergio@gmail.com | 12345678 | Trabajador |
| carlos@gmail.com | 12345678 | Cliente |

### Tasas de Cambio
- 1 USD = 800 BS
- 1 USD = 4,000 COP

## Nota Importante

El modo offline funciona 100% sin internet. Todos los datos se almacenan localmente en:
- PostgreSQL (usuarios, catálogo)
- MongoDB (pedidos, finanzas)

Los datos persisten entre reinicios de Docker gracias a los volúmenes.
