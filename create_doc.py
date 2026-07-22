from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE

doc = Document()

style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)

title = doc.add_heading('Documentación Técnica - Catire Hot Dog', 0)
title.alignment = WD_ALIGN_PARAGRAPH.CENTER

doc.add_paragraph('Sistema de Gestión de Pedidos para Restaurante de Comida Rápida')
doc.add_paragraph('')

doc.add_heading('Índice', level=1)
toc = doc.add_paragraph()
toc.add_run('1. Arquitectura General del Sistema\n')
toc.add_run('2. Tecnologías Utilizadas\n')
toc.add_run('3. Backend - Microservicios con NestJS\n')
toc.add_run('4. Docker y Docker Compose\n')
toc.add_run('5. Nginx como API Gateway\n')
toc.add_run('6. Bases de Datos - PostgreSQL y MongoDB\n')
toc.add_run('7. Prisma ORM\n')
toc.add_run('8. Sistema de Autenticación y Autorización\n')
toc.add_run('9. Frontend - React Native con Expo\n')
toc.add_run('10. Flujo de Pedidos\n')
toc.add_run('11. Sistema de Pagos\n')
toc.add_run('12. Sistema de Inventario\n')
toc.add_run('13. Comunicación entre Microservicios\n')
toc.add_run('14. Variables de Entorno\n')
toc.add_run('15. Decisiones de Diseño\n')
toc.add_run('16. Panel de Órdenes del Trabajador\n')
toc.add_run('17. Gestión de Usuarios por Administrador\n')
toc.add_run('18. Generación e Instalación del APK\n')
toc.add_run('19. Sistema de Notificaciones y Sonidos\n')
toc.add_run('20. Panel de Órdenes del Cliente\n')
toc.add_run('21. Gestión de Imágenes de Productos\n')
toc.add_run('22. Modo Offline - Ejecución sin Internet\n')
toc.add_run('23. Resumen de Compatibilidad Multiplataforma\n')

doc.add_page_break()

doc.add_heading('1. Arquitectura General del Sistema', level=1)
doc.add_paragraph(
    'Catire Hot Dog es una aplicación móvil para la gestión de pedidos de un restaurante de comida rápida '
    'venezolano. El sistema sigue una arquitectura de microservicios distribuida, donde el frontend '
    '(React Native/Expo) se comunica con múltiples servicios backend a través de un API Gateway (Nginx).'
)
doc.add_paragraph('')

doc.add_heading('Diagrama de Arquitectura', level=2)
doc.add_paragraph(
    '┌─────────────────┐     ┌──────────────┐     ┌─────────────────┐\n'
    '│   App Móvil     │────▶│    Nginx     │────▶│  auth-service   │\n'
    '│  React Native   │     │ API Gateway  │     │  (PostgreSQL)   │\n'
    '│     Expo        │     │              │     │   Puerto 3000   │\n'
    '└─────────────────┘     │              │     └─────────────────┘\n'
    '                        │              │     ┌─────────────────┐\n'
    '                        │              │────▶│ catalog-service │\n'
    '                        │              │     │  (PostgreSQL)   │\n'
    '                        │              │     │   Puerto 3000   │\n'
    '                        │              │     └─────────────────┘\n'
    '                        │              │     ┌─────────────────┐\n'
    '                        │              │────▶│  order-service  │\n'
    '                        │              │     │   (MongoDB)     │\n'
    '                        │              │     │   Puerto 3000   │\n'
    '                        │              │     └─────────────────┘\n'
    '                        │              │     ┌─────────────────┐\n'
    '                        │              │────▶│ finance-service │\n'
    '                        └──────────────┘     │   (MongoDB)     │\n'
    '                                             │   Puerto 3000   │\n'
    '                                             └─────────────────┘'
)

doc.add_heading('Patrón de Arquitectura', level=2)
doc.add_paragraph(
    'El sistema utiliza el patrón de arquitectura de microservicios con las siguientes características:'
)
bullet_points = [
    'Separación por dominios: Autenticación, Catálogo, Pedidos y Finanzas',
    'Cada servicio tiene su propia base de datos (Database per Service pattern)',
    'Comunicación síncrona entre servicios mediante REST API',
    'API Gateway centralizado para enrutamiento de peticiones',
    'Autenticación centralizada con validación distribuida',
]
for point in bullet_points:
    doc.add_paragraph(point, style='List Bullet')

doc.add_page_break()

doc.add_heading('2. Tecnologías Utilizadas', level=1)

doc.add_heading('Backend', level=2)
techs_backend = [
    ('NestJS v11', 'Framework de Node.js para construir APIs escalables con TypeScript'),
    ('Prisma ORM', 'ORM moderno para bases de datos PostgreSQL y MongoDB'),
    ('TypeScript', 'Lenguaje de programación con tipado estático'),
    ('Passport.js', 'Middleware de autenticación para Node.js'),
    ('JWT (JSON Web Tokens)', 'Estándar para tokens de acceso seguros'),
    ('bcrypt', 'Librería para hash de contraseñas'),
    ('PDFKit', 'Generación de reportes PDF'),
    ('Axios', 'Cliente HTTP para comunicación entre servicios'),
    ('class-validator', 'Validación de datos con decoradores'),
    ('class-transformer', 'Transformación de objetos plano a clases'),
]
for name, desc in techs_backend:
    doc.add_paragraph(f'{name}: {desc}', style='List Bullet')

doc.add_heading('Frontend', level=2)
techs_frontend = [
    ('React Native', 'Framework para desarrollo móvil multiplataforma'),
    ('Expo SDK 54', 'Plataforma para desarrollo rápido con React Native'),
    ('TypeScript', 'Tipado estático para mayor robustez'),
    ('Zustand', 'Gestión de estado ligera y eficiente'),
    ('React Navigation v7', 'Navegación nativa para React Native'),
    ('TanStack React Query', 'Gestión de datos del servidor'),
    ('Axios', 'Cliente HTTP para peticiones al backend'),
    ('AsyncStorage', 'Almacenamiento local persistente'),
    ('expo-image-picker', 'Selección de imágenes del dispositivo'),
    ('expo-clipboard', 'Acceso al portapapeles del dispositivo'),
]
for name, desc in techs_frontend:
    doc.add_paragraph(f'{name}: {desc}', style='List Bullet')

doc.add_heading('Infraestructura', level=2)
techs_infra = [
    ('Docker', 'Containerización de servicios'),
    ('Docker Compose', 'Orquestación de múltiples contenedores'),
    ('Nginx', 'API Gateway y balanceador de carga'),
    ('PostgreSQL', 'Base de datos relacional (Auth y Catálogo)'),
    ('MongoDB', 'Base de datos NoSQL (Pedidos y Finanzas)'),
]
for name, desc in techs_infra:
    doc.add_paragraph(f'{name}: {desc}', style='List Bullet')

doc.add_page_break()

doc.add_heading('3. Backend - Microservicios con NestJS', level=1)
doc.add_paragraph(
    'El backend está construido con NestJS, un framework de Node.js que utiliza TypeScript y está '
    'inspirado en Angular. NestJS proporciona una arquitectura modular que facilita la creación de '
    'microservicios escalables y mantenibles.'
)

doc.add_heading('3.1 auth-service', level=2)
doc.add_paragraph(
    'Responsable de la autenticación, autorización y gestión de usuarios. Utiliza PostgreSQL como '
    'base de datos principal.'
)
doc.add_paragraph('Endpoints principales:', style='List Bullet')
endpoints_auth = [
    'POST /auth/login - Inicio de sesión con email/password',
    'POST /auth/register - Registro de nuevos usuarios',
    'GET /users - Listar usuarios (requiere permisos)',
    'GET /users/:id - Obtener usuario por ID',
    'PATCH /users/:id - Actualizar usuario',
    'DELETE /users/:id - Eliminar usuario (soft delete)',
    'GET /users/report - Generar PDF de usuarios',
]
for ep in endpoints_auth:
    doc.add_paragraph(ep, style='List Bullet 2')

doc.add_heading('3.2 catalog-service', level=2)
doc.add_paragraph(
    'Gestiona las sucursales, menús, productos e ingredientes. Utiliza PostgreSQL.'
)
doc.add_paragraph('Endpoints principales:', style='List Bullet')
endpoints_catalog = [
    'CRUD /branches - Gestión de sucursales con coordenadas GPS',
    'CRUD /menus - Gestión de menús por sucursal',
    'CRUD /products - Gestión de productos con categorías',
    'CRUD /ingredients - Gestión de ingredientes',
    'GET /products/report - PDF de productos',
]
for ep in endpoints_catalog:
    doc.add_paragraph(ep, style='List Bullet 2')

doc.add_heading('3.3 order-service', level=2)
doc.add_paragraph(
    'Gestiona los pedidos de los clientes. Utiliza MongoDB por su flexibilidad en el esquema '
    'y capacidad de manejar documentos complejos como las características de los productos.'
)
doc.add_paragraph('Endpoints principales:', style='List Bullet')
endpoints_orders = [
    'GET /orders - Listar pedidos (filtrado por rol)',
    'POST /orders - Crear nuevo pedido',
    'GET /orders/:id - Obtener pedido por ID',
    'PATCH /orders/:id - Actualizar estado del pedido',
    'DELETE /orders/:id - Eliminar pedido',
    'GET /orders/report - PDF de pedidos',
]
for ep in endpoints_orders:
    doc.add_paragraph(ep, style='List Bullet 2')

doc.add_heading('3.4 finance-config-service', level=2)
doc.add_paragraph(
    'Gestiona las compras y tasas de cambio. Utiliza MongoDB.'
)
doc.add_paragraph('Endpoints principales:', style='List Bullet')
endpoints_finance = [
    'GET /purchases - Listar compras',
    'POST /purchases - Crear compra (valida pedido y calcula total)',
    'GET /purchases/report - PDF de compras',
]
for ep in endpoints_finance:
    doc.add_paragraph(ep, style='List Bullet 2')

doc.add_page_break()

doc.add_heading('4. Docker y Docker Compose', level=1)
doc.add_paragraph(
    'El sistema utiliza Docker para containerizar cada microservicio, garantizando consistencia '
    'entre entornos de desarrollo y producción.'
)

doc.add_heading('4.1 Dockerfile', level=2)
doc.add_paragraph(
    'Todos los servicios comparten el mismo Dockerfile.dev con las siguientes características:'
)
docker_features = [
    'Imagen base: node:22-alpine',
    'Directorio de trabajo: /app',
    'Instalación de dependencias con npm install',
    'Habilitación de hot-reload con CHOKIDAR_USEPOLLING=true',
    'Puerto expuesto: 3000',
    'Comando de inicio: npm run start:dev',
]
for feat in docker_features:
    doc.add_paragraph(feat, style='List Bullet')

doc.add_heading('4.2 docker-compose.yml', level=2)
doc.add_paragraph(
    'El archivo docker-compose.yml define los siguientes servicios:'
)
services = [
    'auth-service: Servicio de autenticación (PostgreSQL: catire_auth_db)',
    'catalog-service: Servicio de catálogo (PostgreSQL: catire_catalog_db)',
    'order-service: Servicio de pedidos (MongoDB: catire_order_db)',
    'finance-config-service: Servicio de finanzas (MongoDB: catire_finance_config_db)',
    'nginx: API Gateway (puerto 80)',
    'catire_postgres_db: PostgreSQL 16 (puerto 5432)',
    'catire_audit_db: MongoDB 7 (puerto 27017, replica set)',
    'catire_config_db: MongoDB 7 (puerto 27017, replica set)',
]
for svc in services:
    doc.add_paragraph(svc, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Nota: MongoDB requiere replica set para soportar transacciones multi-documento. '
    'El servicio catire_audit_db se inicializa con rs0 como nombre de replica set.'
)

doc.add_page_break()

doc.add_heading('5. Nginx como API Gateway', level=1)
doc.add_paragraph(
    'Nginx actúa como API Gateway, enrutando las peticiones del cliente al microservicio correspondiente '
    'basándose en el prefijo de la URL.'
)

doc.add_heading('Configuración de rutas', level=2)
nginx_routes = [
    '/api/auth/ → auth-service:3000',
    '/api/catalog/ → catalog-service:3000',
    '/api/orders/ → order-service:3000',
    '/api/finance/ → finance-config-service:3000',
]
for route in nginx_routes:
    doc.add_paragraph(route, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Ventajas de usar Nginx como API Gateway:'
)
nginx_advantages = [
    'Punto de entrada único para el frontend',
    'Balance de carga entre instancias de servicios',
    'Terminación SSL/TLS',
    'Compresión de respuestas (gzip)',
    'Rate limiting para prevenir abusos',
]
for adv in nginx_advantages:
    doc.add_paragraph(adv, style='List Bullet')

doc.add_page_break()

doc.add_heading('6. Bases de Datos - PostgreSQL y MongoDB', level=1)

doc.add_heading('6.1 PostgreSQL (Auth y Catálogo)', level=2)
doc.add_paragraph(
    'PostgreSQL se utiliza para los servicios que requieren datos estructurados y relaciones '
    'fuertes entre entidades.'
)
doc.add_paragraph('Bases de datos:', style='List Bullet')
pg_dbs = [
    'catire_auth_db: Almacena usuarios, roles y permisos',
    'catire_catalog_db: Almacena sucursales, menús, productos, categorías e ingredientes',
]
for db in pg_dbs:
    doc.add_paragraph(db, style='List Bullet 2')

doc.add_heading('6.2 MongoDB (Pedidos y Finanzas)', level=2)
doc.add_paragraph(
    'MongoDB se utiliza para los servicios que manejan documentos complejos y flexibles.'
)
mongo_reasons = [
    'Los pedidos contienen arrays de items con características variables (toppings, salsas, etc.)',
    'Las compras referencian pedidos de otra base de datos',
    'Esquema flexible para futuras expansiones',
    'MongoDB requiere replica set para soportar transacciones ACID',
]
for reason in mongo_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_page_break()

doc.add_heading('7. Prisma ORM', level=1)
doc.add_paragraph(
    'Prisma es un ORM moderno para Node.js y TypeScript que proporciona type-safety, '
    'auto-completado y migraciones de base de datos.'
)

doc.add_heading('7.1 ¿Por qué Prisma?', level=2)
prisma_reasons = [
    'Type-safety: Genera tipos TypeScript automáticamente desde el esquema',
    'Migraciones: Sistema de migraciones declarativo con prisma migrate',
    'Query API: API intuitiva y legible para consultas',
    'Soporte multi-database: Funciona con PostgreSQL y MongoDB',
    'Prisma Studio: Interfaz gráfica para explorar datos',
]
for reason in prisma_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_heading('7.2 Soft Delete', level=2)
doc.add_paragraph(
    'Todos los servicios implementan soft delete mediante extensiones de Prisma. En lugar de '
    'eliminar registros físicamente, se establece un campo deleted_at con la fecha de eliminación.'
)
doc.add_paragraph(
    'Implementación: Se utiliza Prisma $extends para interceptar las operaciones delete y '
    'convertirlas en update({ deleted_at: new Date() }).'
)

doc.add_heading('7.3 Esquemas Prisma', level=2)
doc.add_paragraph('Auth Service (PostgreSQL):')
schemas_auth = [
    'User: id, full_name, email, password, dni, phone_1, phone_2, role_id, deleted_at',
    'Role: id, name, permissions (JSON), deleted_at',
]
for s in schemas_auth:
    doc.add_paragraph(s, style='List Bullet')

doc.add_paragraph('Catalog Service (PostgreSQL):')
schemas_catalog = [
    'Branch: id, name, address, latitude, longitude, deleted_at',
    'Menu: id, name, branch_id, deleted_at',
    'Product: id, name, description, base_price, category_id, deleted_at',
    'Category: id, name, deleted_at',
    'Ingredient: id, name, category, deleted_at',
]
for s in schemas_catalog:
    doc.add_paragraph(s, style='List Bullet')

doc.add_paragraph('Order Service (MongoDB):')
schemas_order = [
    'Order: id, user_id, is_delivery, notes, address, status, payment_proof, deleted_at',
    'OrderDetails: id, order_id, product_id, quantity, base_price, features[], deleted_at',
]
for s in schemas_order:
    doc.add_paragraph(s, style='List Bullet')

doc.add_paragraph('Finance Service (MongoDB):')
schemas_finance = [
    'Purchase: id, order_id, user_id, purchase_base, purchase_total, invoice_number, deleted_at',
    'CurrencyRate: id, rate_usd, rate_cop, rate_bs',
]
for s in schemas_finance:
    doc.add_paragraph(s, style='List Bullet')

doc.add_page_break()

doc.add_heading('8. Sistema de Autenticación y Autorización', level=1)

doc.add_heading('8.1 Autenticación con JWT', level=2)
doc.add_paragraph(
    'El sistema utiliza JSON Web Tokens (JWT) para la autenticación. El flujo es:'
)
auth_flow = [
    'El cliente envía email y password al endpoint /auth/login',
    'El auth-service valida las credenciales usando bcrypt para comparar el hash',
    'Si son correctas, genera un JWT con el payload { sub: user_id, email }',
    'El token tiene una expiración de 2 horas',
    'El frontend almacena el token en SecureStore (encriptado)',
    'Cada petición incluye el token en el header Authorization: Bearer <token>',
]
for step in auth_flow:
    doc.add_paragraph(step, style='List Bullet')

doc.add_heading('8.2 Autorización por Permisos', level=2)
doc.add_paragraph(
    'El sistema implementa un control de acceso basado en roles (RBAC) con permisos granulares:'
)
roles = [
    'client: Puede ver menús, crear pedidos, ver sus órdenes y compras',
    'employee: Puede gestionar menús, productos y administrar pedidos',
    'admin: Acceso completo a todas las funcionalidades incluyendo usuarios e inventario',
]
for role in roles:
    doc.add_paragraph(role, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Cada endpoint está decorado con @CheckPermission(module, action) que verifica '
    'si el usuario tiene el permiso necesario. Los permisos se almacenan como JSON en el modelo Role.'
)

doc.add_heading('8.3 RemoteAuthGuard', level=2)
doc.add_paragraph(
    'Los servicios que no son auth-service utilizan RemoteAuthGuard, que valida el token '
    'haciendo una petición HTTP al auth-service. Esto centraliza la validación de tokens '
    'en un solo lugar.'
)

doc.add_page_break()

doc.add_heading('9. Frontend - React Native con Expo', level=1)

doc.add_heading('9.1 Estructura del Proyecto', level=2)
doc.add_paragraph(
    'El frontend está organizado en módulos siguiendo una estructura modular:'
)
modules = [
    'auth/: Autenticación, registro, perfil de usuario',
    'catalog/: Sucursales, menús, productos, carrito',
    'orders/: Gestión de pedidos (cliente, empleado, admin)',
    'finance/: Compras e historial',
    'inventory/: Control de inventario',
    'shared/: Componentes, stores, estilos y utilidades compartidas',
]
for mod in modules:
    doc.add_paragraph(mod, style='List Bullet')

doc.add_heading('9.2 Gestión de Estado con Zustand', level=2)
doc.add_paragraph(
    'Zustand es una librería ligera de gestión de estado. El proyecto utiliza los siguientes stores:'
)
stores = [
    'auth.store: Estado de autenticación (token, usuario, login/logout)',
    'cart.store: Carrito de compras (items, cantidades, totales)',
    'orders.store: Pedidos (CRUD, estados, comprobantes de pago)',
    'currency.store: Tasas de cambio (USD, VES, COP)',
    'messages.store: Mensajes internos de la aplicación',
    'inventory.store: Inventario de ingredientes',
]
for store in stores:
    doc.add_paragraph(store, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Todos los stores utilizan persist con AsyncStorage para mantener el estado entre sesiones.'
)

doc.add_heading('9.3 Navegación', level=2)
doc.add_paragraph(
    'La navegación se gestiona con React Navigation utilizando stack nativo. Las rutas son '
    'condicionales según el rol del usuario:'
)
nav_roles = [
    'Sin autenticación: Solo pantalla de Login',
    'Cliente: Mapa de sucursales, menú, productos, carrito, pedidos, mensajes',
    'Empleado: Gestión de pedidos, menús y productos',
    'admin: Panel de administración completo con todos los módulos',
]
for nav in nav_roles:
    doc.add_paragraph(nav, style='List Bullet')

doc.add_page_break()

doc.add_heading('10. Flujo de Pedidos', level=1)
doc.add_paragraph('El ciclo de vida de un pedido sigue estos estados:')
order_states = [
    'PENDING: El cliente crea el pedido y envía comprobante de pago',
    'PAID: El empleado confirma que el pago fue recibido',
    'PREPARING: El pedido está siendo preparado',
    'READY: El pedido está listo para entrega',
    'ON_THE_WAY: El pedido está en camino (delivery)',
    'DELIVERED: El pedido fue entregado exitosamente',
    'CANCELLED: El pedido fue cancelado (con motivo)',
]
for state in order_states:
    doc.add_paragraph(state, style='List Bullet')

doc.add_heading('10.1 Creación de Pedido', level=2)
doc.add_paragraph('El flujo de creación de un pedido es:')
create_flow = [
    '1. El cliente selecciona productos del menú y los agrega al carrito',
    '2. Personaliza cada producto (tamaño, toppings, salchicha, salsas)',
    '3. Selecciona método de pago: Pago Móvil o Efectivo',
    '4. Si es Pago Móvil, adjunta comprobante de pago (imagen)',
    '5. Indica si es delivery o retiro en local',
    '6. El frontend envía la orden al backend con todos los datos',
    '7. El backend valida los productos contra el catálogo',
    '8. Crea la orden en MongoDB con los items anidados',
    '9. El cliente ve la orden en su historial con estado PENDING',
]
for step in create_flow:
    doc.add_paragraph(step, style='List Bullet')

doc.add_page_break()

doc.add_heading('11. Sistema de Pagos', level=1)
doc.add_paragraph(
    'El sistema soporta dos métodos de pago:'
)

doc.add_heading('11.1 Pago Móvil', level=2)
doc.add_paragraph('Datos de la cuenta:')
pago_movil_data = [
    'Banco: BNC',
    'Teléfono: 04127995855',
    'Cédula: 30982230',
    'Titular: Juan Diego',
]
for data in pago_movil_data:
    doc.add_paragraph(data, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'El cliente realiza la transferencia y adjunta una foto del comprobante. '
    'El empleado verifica el pago y cambia el estado a PAID.'
)

doc.add_heading('11.2 Efectivo', level=2)
doc.add_paragraph(
    'El cliente selecciona pagar en efectivo al recibir el pedido. No requiere comprobante.'
)

doc.add_heading('11.3 Multi-moneda', level=2)
doc.add_paragraph(
    'El sistema muestra los precios en tres monedas simultáneamente:'
)
currencies = [
    'USD: Dólares estadounidenses (moneda base)',
    'VES: Bolívares venezolanos (tasa configurable por admin)',
    'COP: Pesos colombianos (tasa configurable por admin)',
]
for curr in currencies:
    doc.add_paragraph(curr, style='List Bullet')

doc.add_page_break()

doc.add_heading('12. Sistema de Inventario', level=1)
doc.add_paragraph(
    'El inventario gestiona el stock de ingredientes y productos. Cada item tiene:'
)
inventory_fields = [
    'name: Nombre del insumo',
    'stock: Cantidad disponible',
    'unit: Unidad de medida (Unidades, Kg, Litros)',
    'reorder_level: Nivel mínimo para alerta de stock bajo',
    'feature_tag: Característica vinculada (SIZE, TOPPINGS, TYPE_SAUSAGE, etc.)',
    'feature_value: Valor de la característica',
]
for field in inventory_fields:
    doc.add_paragraph(field, style='List Bullet')

doc.add_heading('12.1 Categorías de Inventario', level=2)
categories = [
    'Salchichas: Mini Frankfurt, Catirota, CatireHot, Chicken, Chesse, Salchicatire, Chistorra, Uruguayo, Antioqueño, Choricatire, Chori Frito',
    'Carnes: Carne de Res, Croqueta de Pollo, Croqueta de Chuleta',
    'Panes: Pan Mini, Pan Normal, Pan de Hamburguesa',
    'Toppings: Queso, Lechuga, Tomate, Cebolla, Papa, Zanahoria, Queso Gouda, Tocineta, Huevo Frito',
    'Salsas: Ketchup, Mayonesa, Mostaza, Salsa de Ajo',
    'Bebidas: 2L, 1L, Personal, Nestea',
]
for cat in categories:
    doc.add_paragraph(cat, style='List Bullet')

doc.add_page_break()

doc.add_heading('13. Comunicación entre Microservicios', level=1)
doc.add_paragraph(
    'Los microservicios se comunican entre sí mediante peticiones HTTP síncronas usando Axios. '
    'Patrones de comunicación:'
)

doc.add_heading('13.1 Validación de Productos', level=2)
doc.add_paragraph(
    'Cuando se crea un pedido, el order-service valida cada producto haciendo una petición GET '
    'al catalog-service: GET /products/:product_id'
)

doc.add_heading('13.2 Datos de Usuario', level=2)
doc.add_paragraph(
    'Para mostrar información del usuario en los pedidos, el order-service consulta al '
    'auth-service: GET /users/:user_id'
)

doc.add_heading('13.3 Creación de Compras', level=2)
doc.add_paragraph(
    'El finance-service coordina la creación de compras:'
)
purchase_flow = [
    '1. Valida que el pedido existe (GET order-service)',
    '2. Verifica que no esté ya pagado',
    '3. Calcula el total consultando precios (GET catalog-service)',
    '4. Crea el registro de compra',
    '5. Marca el pedido como PAID (PATCH order-service)',
]
for step in purchase_flow:
    doc.add_paragraph(step, style='List Bullet')

doc.add_page_break()

doc.add_heading('14. Variables de Entorno', level=1)
doc.add_paragraph('Variables utilizadas en docker-compose:')
env_vars = [
    'POSTGRES_USER=root',
    'POSTGRES_PASSWORD=postgres1234',
    'POSTGRES_PORT=5432',
    'MONGO_USERNAME=root',
    'MONGO_PASSWORD=mongodb1234',
    'MONGO_PORT=27017',
    'JWT_SECRET=super_secret_jwt_key',
    'AUTH_SERVICE_URL=http://auth-service:3000',
    'CATALOG_SERVICE_URL=http://catalog-service:3000',
    'ORDER_SERVICE_URL=http://order-service:3000',
]
for var in env_vars:
    doc.add_paragraph(var, style='List Bullet')

doc.add_heading('Frontend (.env)', level=2)
doc.add_paragraph('EXPO_PUBLIC_API_URL=http://localhost/api')

doc.add_page_break()

doc.add_heading('15. Decisiones de Diseño', level=1)

doc.add_heading('15.1 ¿Por qué TypeScript?', level=2)
doc.add_paragraph(
    'TypeScript fue elegido como lenguaje de programación para todo el stack (frontend y backend) '
    'por las siguientes razones:'
)
ts_reasons = [
    'Tipado estático: Permite detectar errores en tiempo de compilación antes de ejecutar el código, lo que reduce bugs en producción',
    'Mejor experiencia de desarrollo: El autocompletado y la detección de errores en el IDE aumentan la productividad',
    'Mantenibilidad: Los tipos actúan como documentación viva del código, facilitando el trabajo en equipo',
    'Ecosistema: Tanto NestJS como React Native/Expo están escritos en TypeScript, por lo que usar el mismo lenguaje garantiza compatibilidad total',
    'Escalabilidad: TypeScript facilita la escalabilidad del código al proporcionar interfaces y tipos que definen contratos claros entre módulos',
    'Reutilización de código: Se pueden compartir tipos y modelos entre el frontend y el backend (interfaces de usuario, productos, pedidos)',
    'Comunidad: TypeScript es el lenguaje más utilizado en el ecosistema de Node.js y React, con amplia documentación y soporte',
]
for reason in ts_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_heading('15.2 ¿Por qué React Native y no otra tecnología?', level=2)
doc.add_paragraph(
    'React Native con Expo fue elegido para el desarrollo móvil por las siguientes razones:'
)
rn_reasons = [
    'Multiplataforma: Un solo código base genera aplicaciones para iOS y Android simultáneamente',
    'Desarrollo web: Con Expo, el mismo código puede ejecutarse como aplicación web en navegadores',
    'Escritorio: El backend (NestJS) corre en cualquier sistema operativo: Windows, Linux y macOS',
    'Nativo: React Native genera componentes nativos reales, no webviews, lo que garantiza rendimiento óptimo',
    'Hot Reload: Los cambios se reflejan instantáneamente sin reiniciar la app',
    'Ecosistema: Acceso a librerías nativas como cámara, GPS, notificaciones push, almacenamiento seguro',
    'Expo: Simplifica la configuración, compilación y distribución de la app (generación de APK sin Android Studio)',
]
for reason in rn_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Compatibilidad multiplataforma del sistema completo:'
)
platforms = [
    'App Móvil (Frontend): Android, iOS (via React Native/Expo)',
    'App Web (Frontend): Windows, Linux, macOS (via navegador web)',
    'Backend (API): Windows, Linux, macOS (Node.js es multiplataforma)',
    'Bases de Datos: Windows, Linux, macOS (PostgreSQL y MongoDB son multiplataforma)',
    'Docker: Windows, Linux, macOS (Docker Desktop disponible para todos)',
]
for platform in platforms:
    doc.add_paragraph(platform, style='List Bullet')

doc.add_heading('15.3 ¿Por qué dos bases de datos (PostgreSQL y MongoDB)?', level=2)
doc.add_paragraph(
    'Se utilizaron dos bases de datos diferentes para demostrar el patrón "Database per Service" '
    'y aprovechar las fortalezas de cada una:'
)

doc.add_heading('PostgreSQL (Para Auth y Catálogo)', level=3)
pg_reasons = [
    'Datos estructurados: Usuarios, roles, productos y categorías tienen una estructura fija y relaciones claras',
    'Integridad referencial: Las foreign keys garantizan que un producto pertenezca a una categoría válida',
    'Consultas complejas: Los JOINs permiten consultar datos relacionados de manera eficiente',
    'ACID: Transacciones que garantizan consistencia en operaciones críticas como registro de usuarios',
    'Tipos de datos: Soporte para tipos específicos como DECIMAL para precios, JSON para permisos',
]
for reason in pg_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_heading('MongoDB (Para Pedidos y Finanzas)', level=3)
mongo_reasons_detail = [
    'Esquema flexible: Los pedidos tienen items con características variables (diferentes toppings, salsas, tamaños por producto)',
    'Documentos anidados: Un pedido contiene un array de items, cada uno con su propio array de features',
    'Sin relaciones estrictas: Los pedidos referencian productos de otra base de datos (PostgreSQL), no necesitan foreign keys',
    'Escalabilidad horizontal: MongoDB escala fácilmente añadiendo más servidores',
    'Rendimiento: Las lecturas de documentos completos son más rápidas que los JOINs en SQL',
    'Replica Set: MongoDB soporta replicación nativa para alta disponibilidad',
]
for reason in mongo_reasons_detail:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Ejemplo práctico de por qué MongoDB para pedidos: Un pedido de salchipapa puede tener '
    '[Queso gouda, Papa] como toppings, mientras que un pedido de hamburguesa puede tener '
    '[Lechuga, Tomate, Tocineta, Huevo frito]. En PostgreSQL esto requeriría múltiples tablas '
    'y JOINs complejos. En MongoDB, todo se almacena en un solo documento flexible.'
)

doc.add_heading('15.4 ¿Por qué Nginx?', level=2)
doc.add_paragraph(
    'Nginx proporciona un punto de entrada único, enrutamiento por URL, balance de carga '
    'y es extremadamente eficiente para servir como proxy inverso.'
)

doc.add_heading('15.5 ¿Por qué Prisma?', level=2)
doc.add_paragraph(
    'Prisma ofrece type-safety, migraciones declarativas, y una API intuitiva. '
    'Su soporte para PostgreSQL y MongoDB permite usar un solo ORM para ambos tipos de base de datos.'
)

doc.add_heading('15.6 ¿Por qué Expo?', level=2)
doc.add_paragraph(
    'Expo facilita el desarrollo rápido con React Native, proporciona herramientas como '
    'expo-image-picker, expo-clipboard, y permite generar APKs sin configuración compleja '
    'de Android Studio.'
)

doc.add_heading('15.7 ¿Por qué Zustand?', level=2)
doc.add_paragraph(
    'Zustand es más ligero que Redux, tiene una API más simple, soporta persistencia '
    'con AsyncStorage y no requiere boilerplate adicional.'
)

doc.add_heading('15.8 ¿Por qué Docker?', level=2)
doc.add_paragraph(
    'Docker fue utilizado por las siguientes razones:'
)
docker_reasons = [
    'Consistencia: El mismo entorno se ejecuta en desarrollo, pruebas y producción',
    'Aislamiento: Cada servicio corre en su propio contenedor sin conflictos de dependencias',
    'Orquestación: Docker Compose permite levantar todos los servicios con un solo comando',
    'Portabilidad: El sistema se ejecuta en cualquier máquina con Docker instalado (Windows, Linux, macOS)',
    'Escalabilidad: Se puede escalar individualmente cada servicio añadiendo más contenedores',
    'Simplicidad: Un desarrollador nuevo puede levantar todo el sistema con "docker-compose up"',
]
for reason in docker_reasons:
    doc.add_paragraph(reason, style='List Bullet')

doc.add_page_break()

doc.add_heading('16. Panel de Órdenes del Trabajador', level=1)
doc.add_paragraph(
    'El panel de órdenes del trabajador (Empleado) está diseñado para gestionar eficientemente '
    'los pedidos del restaurante. Las órdenes se organizan en tres categorías claramente separadas:'
)

doc.add_heading('16.1 Categorías de Órdenes', level=2)
categories = [
    '🔥 Actuales (PENDING, PAID, PREPARING, READY, ON_THE_WAY): Pedidos que requieren atención inmediata del trabajador. Incluye desde pedidos recién creados hasta los que están en camino.',
    '✅ Completadas (DELIVERED): Pedidos que fueron entregados exitosamente al cliente. Se muestran como referencia y para consulta del historial.',
    '❌ Canceladas (CANCELLED): Pedidos que fueron cancelados, ya sea por el trabajador (con motivo) o por el cliente. Se muestran con el motivo de cancelación.',
]
for cat in categories:
    doc.add_paragraph(cat, style='List Bullet')

doc.add_heading('16.2 Flujo de Trabajo del Trabajador', level=2)
workflow = [
    '1. El trabajador inicia sesión con sus credenciales (ej: sergio@gmail.com)',
    '2. Visualiza la pestaña "Actuales" con todos los pedidos pendientes',
    '3. Confirma pagos (PENDING → PAID), elabora comida (PAID → PREPARING)',
    '4. Marca pedidos como listos (PREPARING → READY) y en camino (READY → ON_THE_WAY)',
    '5. Finaliza entregas (ON_THE_WAY → DELIVERED)',
    '6. Puede cancelar pedidos con motivo obligatorio en cualquier estado activo',
]
for step in workflow:
    doc.add_paragraph(step, style='List Bullet')

doc.add_heading('16.3 Comunicación con Cliente', level=2)
doc.add_paragraph(
    'El trabajador puede enviar mensajes al cliente a través de WhatsApp directamente desde la app '
    'cuando el pedido está en camino (ON_THE_WAY). Esto facilita la coordinación de la entrega.'
)

doc.add_page_break()

doc.add_heading('17. Gestión de Usuarios por Administrador', level=1)
doc.add_paragraph(
    'El administrador del sistema tiene la capacidad de crear y gestionar usuarios con diferentes '
    'roles dentro de la plataforma.'
)

doc.add_heading('17.1 Tipos de Usuario', level=2)
user_types = [
    '👤 Cliente (role_id: 1): Puede ver menús, crear pedidos, ver su historial y compras.',
    '👷 Trabajador (role_id: 2): Puede gestionar pedidos, menús y productos. Acceso al panel de órdenes.',
    '⭐ Administrador (role_id: 3): Acceso completo a todas las funcionalidades incluyendo gestión de usuarios e inventario.',
]
for ut in user_types:
    doc.add_paragraph(ut, style='List Bullet')

doc.add_heading('17.2 Creación de Usuarios', level=2)
doc.add_paragraph(
    'El administrador puede crear nuevos usuarios desde el panel de administración. '
    'Al crear un usuario, debe proporcionar:'
)
create_fields = [
    'Nombre completo',
    'Correo electrónico (único en el sistema)',
    'DNI / Cédula de identidad',
    'Teléfono principal',
    'Teléfono secundario (opcional)',
    'Contraseña',
    'Tipo de usuario (Cliente, Trabajador o Administrador)',
]
for field in create_fields:
    doc.add_paragraph(field, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'El sistema valida que el correo electrónico no esté registrado previamente. '
    'Las contraseñas se almacenan de forma segura usando hash bcrypt.'
)

doc.add_page_break()

doc.add_heading('18. Generación e Instalación del APK', level=1)
doc.add_paragraph(
    'La aplicación móvil se compila como un archivo APK (Android Package Kit) utilizando '
    'EAS Build de Expo. Este proceso permite generar un instalador nativo de Android '
    'sin necesidad de Android Studio.'
)

doc.add_heading('18.1 Configuración del Build', level=2)
doc.add_paragraph('El archivo eas.json define los perfiles de compilación:')
build_profiles = [
    'development: Para desarrollo con Expo Go (requiere servidor local)',
    'preview: Genera APK para pruebas internas (distribution: internal)',
    'production: Genera APK para distribución final',
]
for profile in build_profiles:
    doc.add_paragraph(profile, style='List Bullet')

doc.add_heading('18.2 Generación del APK', level=2)
doc.add_paragraph('Para generar el APK se ejecuta:')
doc.add_paragraph('eas build --profile preview --platform android --clear-cache')
doc.add_paragraph('')
doc.add_paragraph(
    'EAS Build compila la aplicación en la nube de Expo y proporciona un link de descarga. '
    'El proceso tarda aproximadamente 5-10 minutos.'
)

doc.add_heading('18.3 Instalación en Android', level=2)
doc.add_paragraph('Para instalar el APK en un dispositivo Android:')
install_steps = [
    '1. Descargar el archivo APK desde el link proporcionado por EAS',
    '2. En el dispositivo, ir a Ajustes → Seguridad → Permitir instalación de fuentes desconocidas',
    '3. En dispositivos Xiaomi/MIUI: Desactivar "Optimización de MIUI" en Opciones de desarrollador',
    '4. Desactivar Google Play Protect temporalmente',
    '5. Abrir el archivo APK y seguir las instrucciones de instalación',
    '6. Una vez instalada, la app solicitará los permisos necesarios (cámara, almacenamiento)',
]
for step in install_steps:
    doc.add_paragraph(step, style='List Bullet')

doc.add_heading('18.4 Solución de Problemas Comunes', level=2)
problems = [
    'Network Error: Verificar que el dispositivo y el servidor estén en la misma red WiFi. La URL de la API debe apuntar a la IP local del servidor.',
    'Error de instalación: Desinstalar versiones anteriores de la app antes de instalar una nueva.',
    'App no responde: Verificar que los contenedores Docker estén ejecutándose (docker ps).',
    'Permisos denegados: Ir a Ajustes → Aplicaciones → Catire Hot Dog → Permisos y habilitar todos los permisos necesarios.',
]
for prob in problems:
    doc.add_paragraph(prob, style='List Bullet')

doc.add_page_break()

doc.add_heading('19. Sistema de Notificaciones y Sonidos', level=1)
doc.add_paragraph(
    'La aplicación incorpora un sistema de notificaciones con sonido para mantener informados '
    'tanto a los trabajadores como a los clientes sobre el estado de los pedidos.'
)

doc.add_heading('19.1 Tecnología de Audio', level=2)
doc.add_paragraph('Se utiliza expo-av para reproducir sonidos de notificación:')
audio_features = [
    'Reproducción de sonido incluso en modo silencioso del dispositivo',
    'Sonido de alerta corto y distintivo para nuevas órdenes',
    'Vibración como respaldo si el audio no puede reproducirse',
    'Compatibilidad con Android e iOS',
]
for feat in audio_features:
    doc.add_paragraph(feat, style='List Bullet')

doc.add_heading('19.2 Notificaciones para Trabajadores', level=2)
doc.add_paragraph('Cuando llega un nuevo pedido:')
notif_worker = [
    'Se reproduce un sonido de alerta',
    'El dispositivo vibra con un patrón distintivo (vibración doble)',
    'Se muestra una alerta visual con el número de pedidos nuevos',
    'La alerta indica al trabajador que revise la pestaña "Actuales"',
    'El sistema detecta nuevos pedidos cada 15 segundos mediante polling',
]
for n in notif_worker:
    doc.add_paragraph(n, style='List Bullet')

doc.add_heading('19.3 Notificaciones para Clientes', level=2)
doc.add_paragraph('Cuando cambia el estado de un pedido:')
notif_client = [
    'Se reproduce un sonido de notificación',
    'El dispositivo vibra para alertar al cliente',
    'Se muestra una alerta con el nuevo estado del pedido',
    'Los estados notificados son: PAID, PREPARING, READY, ON_THE_WAY, DELIVERED, CANCELLED',
    'El cliente puede ver el detalle en la pestaña correspondiente de su panel',
]
for n in notif_client:
    doc.add_paragraph(n, style='List Bullet')

doc.add_page_break()

doc.add_heading('20. Panel de Órdenes del Cliente', level=1)
doc.add_paragraph(
    'El cliente tiene acceso a un panel de órdenes organizado en tres categorías '
    'para facilitar el seguimiento de sus pedidos.'
)

doc.add_heading('20.1 Categorías del Panel', level=2)
client_categories = [
    '🔥 En Espera (PENDING, PAID, PREPARING, READY, ON_THE_WAY): Pedidos que están en proceso activo. El cliente puede ver el estado actualizado en tiempo real.',
    '✅ Anteriores (DELIVERED): Pedidos que fueron entregados exitosamente. Funciona como historial de compras.',
    '❌ Canceladas (CANCELLED): Pedidos que fueron cancelados, ya sea por el cliente, el trabajador o el administrador. Se muestra el motivo de cancelación.',
]
for cat in client_categories:
    doc.add_paragraph(cat, style='List Bullet')

doc.add_heading('20.2 Visualización de Precios Multi-moneda', level=2)
doc.add_paragraph(
    'El carrito de compras muestra los precios en tres monedas simultáneamente:'
)
currency_display = [
    'USD: Dólares estadounidenses (moneda base)',
    'VES: Bolívares venezolanos (tasa por defecto: 1 USD = 800 BS)',
    'COP: Pesos colombianos (tasa por defecto: 1 USD = 4,000 COP)',
]
for curr in currency_display:
    doc.add_paragraph(curr, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Las tasas de cambio son configuradas por el administrador desde el panel de administración '
    'y se sincronizan automáticamente con todos los dispositivos.'
)

doc.add_heading('20.3 Método de Pago y Comprobante', level=2)
doc.add_paragraph('Al crear un pedido, el cliente puede seleccionar:')
payment_methods = [
    'Pago Móvil: Requiere adjuntar foto del comprobante de pago. Se muestran los datos bancarios para la transferencia.',
    'Efectivo: Pago al recibir el pedido. No requiere comprobante.',
]
for pm in payment_methods:
    doc.add_paragraph(pm, style='List Bullet')

doc.add_page_break()

doc.add_heading('21. Gestión de Imágenes de Productos', level=1)
doc.add_paragraph(
    'Los administradores y trabajadores pueden asignar imágenes a los productos de dos formas:'
)

doc.add_heading('21.1 Imagen desde Galería', level=2)
doc.add_paragraph(
    'Permite seleccionar una imagen del dispositivo. Esta opción es útil para pruebas '
    'rápidas, pero la imagen solo será visible en el dispositivo donde se seleccionó.'
)

doc.add_heading('21.2 Imagen por URL', level=2)
doc.add_paragraph(
    'Permite ingresar una URL de imagen de internet. Esta es la opción recomendada para '
    'producción, ya que la imagen será visible en todos los dispositivos.'
)
doc.add_paragraph('Ejemplos de servicios gratuitos para hospedar imágenes:')
image_services = [
    'Imgur (imgur.com): Subir imagen y copiar el enlace directo',
    'Google Drive: Compartir enlace público',
    'Cloudinary: Servicio profesional con plan gratuito',
]
for svc in image_services:
    doc.add_paragraph(svc, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Nota: Al usar URLs de internet, todos los dispositivos podrán ver la imagen sin '
    'necesidad de tenerla almacenada localmente.'
)

doc.add_page_break()

doc.add_heading('22. Modo Offline - Ejecución sin Internet', level=1)
doc.add_paragraph(
    'El sistema Catire Hot Dog está diseñado para funcionar completamente offline, '
    'sin necesidad de conexión a internet. Todos los servicios se ejecutan localmente '
    'en la máquina del desarrollador.'
)

doc.add_heading('22.1 Arquitectura Offline', level=2)
doc.add_paragraph('Componentes que ejecutan localmente:')
offline_components = [
    'PostgreSQL: Base de datos relacional (usuarios, catálogo) - Puerto 5432',
    'MongoDB: Base de datos NoSQL (pedidos, finanzas) - Puerto 27017',
    'NestJS: 4 microservicios backend - Puerto 3000 cada uno',
    'Nginx: API Gateway - Puerto 80',
    'React Native/Expo: App móvil que se conecta a la red local',
]
for comp in offline_components:
    doc.add_paragraph(comp, style='List Bullet')

doc.add_heading('22.2 Requisitos para Modo Offline', level=2)
offline_requirements = [
    'Docker Desktop instalado y ejecutándose',
    'Node.js instalado (para Expo)',
    'WiFi conectado en ambos dispositivos (PC y celular)',
    'Imágenes de Docker descargadas previamente (postgres:15-alpine, mongo:6-jammy, nginx:alpine, node:20-alpine)',
]
for req in offline_requirements:
    doc.add_paragraph(req, style='List Bullet')

doc.add_heading('22.3 Iniciar el Sistema Offline', level=2)
doc.add_paragraph('Pasos para ejecutar el sistema sin internet:')
offline_steps = [
    '1. Abrir Docker Desktop y esperar a que inicie completamente',
    '2. Abrir PowerShell en la carpeta catire-backend-services',
    '3. Ejecutar: docker-compose up -d',
    '4. Esperar ~15 segundos a que todos los servicios estén listos',
    '5. Verificar con: docker ps (deben aparecer 8 contenedores)',
    '6. En el celular, abrir la app que ya está configurada para la IP local',
]
for step in offline_steps:
    doc.add_paragraph(step, style='List Bullet')

doc.add_heading('22.4 Configuración de Red', level=2)
doc.add_paragraph('Para que la app se conecte al backend:')
network_config = [
    'El celular y la PC deben estar en la misma red WiFi',
    'El firewall de Windows debe permitir conexiones en el puerto 80',
    'La IP del servidor se configura en: src/app/shared/constants/IP.ts',
    'Para encontrar tu IP: ipconfig | findstr "IPv4"',
]
for config in network_config:
    doc.add_paragraph(config, style='List Bullet')

doc.add_heading('22.5 Persistencia de Datos', level=2)
doc.add_paragraph(
    'Todos los datos se almacenan localmente y persisten entre reinicios de Docker '
    'gracias a los volúmenes configurados en docker-compose.yml:'
)
volumes = [
    'pg_data: Datos de PostgreSQL (usuarios, catálogo)',
    'audit_mongo_data: Datos de MongoDB para pedidos',
    'config_mongo_data: Datos de MongoDB para finanzas',
]
for vol in volumes:
    doc.add_paragraph(vol, style='List Bullet')

doc.add_paragraph('')
doc.add_paragraph(
    'Nota: Para reiniciar la base de datos completamente, ejecutar: docker-compose down -v '
    'Esto eliminará todos los datos y recreará las bases de datos vacías.'
)

doc.add_heading('22.6 Scripts de Automatización', level=2)
doc.add_paragraph('Se proporcionan scripts para facilitar la gestión:')
scripts = [
    'iniciar_offline.bat: Inicia todos los servicios y muestra la IP local',
    'OFFLINE.md: Guía completa de uso offline con comandos útiles',
]
for script in scripts:
    doc.add_paragraph(script, style='List Bullet')

doc.add_page_break()

doc.add_heading('23. Resumen de Compatibilidad Multiplataforma', level=1)
doc.add_paragraph(
    'El sistema Catire Hot Dog está diseñado para ser completamente multiplataforma:'
)
doc.add_paragraph(
    'El sistema Catire Hot Dog está diseñado para ser completamente multiplataforma:'
)

doc.add_heading('Frontend (App Móvil)', level=2)
doc.add_paragraph(
    'La aplicación móvil construida con React Native y Expo puede ejecutarse en:'
)
mobile_platforms = [
    'Android: Genera archivo APK para instalación directa en dispositivos Android',
    'iOS: Genera aplicación compatible con iPhone y iPad (requiere cuenta de Apple Developer)',
    'Web: El mismo código puede ejecutarse como aplicación web en cualquier navegador moderno',
]
for p in mobile_platforms:
    doc.add_paragraph(p, style='List Bullet')

doc.add_heading('Backend (API Server)', level=2)
doc.add_paragraph(
    'Los microservicios backend construidos con NestJS (Node.js) pueden ejecutarse en:'
)
backend_platforms = [
    'Windows: Compatible con Windows 10/11',
    'Linux: Compatible con todas las distribuciones principales (Ubuntu, CentOS, Debian, etc.)',
    'macOS: Compatible con macOS 10.15+',
    'Docker: Cualquier sistema operativo con Docker instalado',
]
for p in backend_platforms:
    doc.add_paragraph(p, style='List Bullet')

doc.add_heading('Bases de Datos', level=2)
doc.add_paragraph(
    'Las bases de datos utilizadas son multiplataforma:'
)
db_platforms = [
    'PostgreSQL: Disponible para Windows, Linux, macOS',
    'MongoDB: Disponible para Windows, Linux, macOS',
    'Ambas se ejecutan en Docker para máxima portabilidad',
]
for p in db_platforms:
    doc.add_paragraph(p, style='List Bullet')

doc.save('C:\\Users\\Dell\\Desktop\\estudiar.docx')
print('Documento creado exitosamente en C:\\Users\\Dell\\Desktop\\estudiar.docx')
