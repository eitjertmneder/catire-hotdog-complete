# Guía rápida para correr el backend

## 1) Preparar variables de entorno
Copia el ejemplo de variables de entorno a un archivo real:

### Windows
```powershell
copy .env.example .env
```

### Linux / macOS
```bash
cp .env.example .env
```

> Puedes ajustar los valores de `.env` si necesitas cambiar usuario, contraseña o puertos.

---

## 2) Instalar dependencias de todos los microservicios

### Windows
```powershell
install-microservices.bat
```

### Linux
```bash
chmod +x install-microservices.sh
./install-microservices.sh
```

---

## 3) Ejecutar el backend con Docker (recomendado)
Esto levanta las bases de datos, los microservicios y el gateway Nginx.

### Windows
```powershell
docker compose up --build
```

### Linux
```bash
docker compose up --build
```

Para detenerlo:

### Windows
```powershell
docker compose down
```

### Linux
```bash
docker compose down
```

---

## 4) Ejecutar un microservicio individualmente (modo desarrollo)
Si prefieres correr un servicio por separado, entra a la carpeta y usa NestJS.

### Windows
```powershell
cd auth-service
npm install
npm run start:dev
```

### Linux
```bash
cd auth-service
npm install
npm run start:dev
```

Puedes repetir lo mismo con:
- `catalog-service`
- `order-service`
- `finance-config-service`

---

## 5) Comandos útiles

### Windows
```powershell
npm test
npm run build
```

### Linux
```bash
npm test
npm run build
```
