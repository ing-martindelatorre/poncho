# Poncho - Contexto Completo del Proyecto

Este documento resume el estado actual del proyecto Poncho para retomar desarrollo, desplegar en servidor Linux o revisar decisiones tecnicas sin depender del historial de chat.

## Objetivo

Poncho es una aplicacion web para un arquitecto que actualmente controla obras en Excel. El sistema reemplaza y mejora el control de:

- obras
- cortes semanales
- destajos
- nomina y mano de obra
- materiales en efectivo y facturados
- prepagos y entregas de material
- pagos y abonos
- fotos/evidencias
- reportes por obra
- usuarios y permisos
- respaldos

El proyecto parte del analisis del archivo `OMAR SEMANA 27.xlsx`, que tenia hojas de caratulas, destajos, facturado, desglosado, prepagos, totales, fotos y fierrero.

## Repositorio

Repositorio remoto:

```txt
https://github.com/ing-martindelatorre/poncho
```

Ramas actualizadas:

- `main`
- `codex/fase-1-docker-web`

## Stack Tecnico

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Docker Compose
- Caddy opcional para HTTPS
- Node test runner
- GitHub Actions CI

## Servicios Docker

Servicios principales:

- `web`: aplicacion Next.js
- `db`: PostgreSQL
- `backup`: respaldos diarios
- `proxy`: Caddy opcional con perfil `proxy`

Volumenes:

- `poncho_pgdata`: datos PostgreSQL
- `poncho_uploads`: fotos/evidencias
- `poncho_backups`: respaldos SQL y uploads comprimidos
- `poncho_caddy_data`: certificados/datos Caddy
- `poncho_caddy_config`: configuracion Caddy

## Variables de Entorno

Archivo base: `.env.example`.

Variables importantes:

```txt
POSTGRES_DB=poncho
POSTGRES_USER=poncho
POSTGRES_PASSWORD=change_me_in_production
DATABASE_URL=postgresql://poncho:change_me_in_production@db:5432/poncho?schema=public
NEXT_PUBLIC_APP_NAME=Poncho
UPLOAD_DIR=/app/uploads
HONORARIOS_RATE=0.10
BASIC_AUTH_USER=
BASIC_AUTH_PASSWORD=
AUTH_SECRET=change_me_to_a_long_random_string
DOMAIN_NAME=localhost
```

Notas:

- `AUTH_SECRET` activa login interno con sesiones firmadas.
- `BASIC_AUTH_USER` y `BASIC_AUTH_PASSWORD` activan proteccion HTTP Basic adicional.
- `DOMAIN_NAME` se usa con Caddy para HTTPS.

## Deploy

Deploy basico:

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Deploy con HTTPS/Caddy:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile proxy up -d --build
```

Primer usuario administrador:

```txt
http://SERVER_IP:3000/setup
```

Despues de crear el primer admin:

```txt
http://SERVER_IP:3000/login
```

Healthcheck:

```txt
http://SERVER_IP:3000/api/health
```

## Modulos Implementados

### Dashboard

Ruta:

```txt
/
```

Incluye:

- obras totales
- semanas abiertas
- total capturado
- pagos
- deuda estimada
- obras recientes
- accesos rapidos

### Obras

Rutas:

```txt
/projects
/projects/[id]
```

Funciones:

- crear obra
- listar obras
- editar obra
- eliminar obra
- ver ficha rapida
- ver semanas relacionadas
- acceder a reporte

Campos:

- nombre
- direccion
- cliente
- m2 construidos
- fecha de inicio
- estado
- notas

### Semanas / Cortes

Rutas:

```txt
/projects/[id]/weeks/[periodId]
```

Funciones:

- crear corte semanal
- editar corte
- cerrar/reabrir semana
- eliminar corte
- ver resumen por semana

Cuando una semana esta cerrada:

- la vista queda en modo lectura
- se ocultan formularios de captura
- las acciones de escritura rechazan cambios desde servidor

### Destajos

Rutas:

```txt
/projects/[id]/weeks/[periodId]/work-items/[workItemId]
```

Funciones:

- capturar destajo
- editar destajo
- eliminar destajo
- calcular total desde volumen y precio unitario
- separar efectivo y facturado

Campos:

- categoria
- descripcion
- unidad
- largo
- ancho
- alto
- piezas
- volumen
- precio unitario
- total
- tipo de dinero
- notas

### Materiales

Rutas:

```txt
/projects/[id]/weeks/[periodId]/materials/[materialId]
```

Funciones:

- capturar compra/prepago
- editar material
- eliminar material
- proveedor por nombre
- factura/remision
- efectivo/facturado
- pagado
- estado de entrega

### Entregas de Material

Dentro del detalle de material.

Funciones:

- registrar entrega
- eliminar entrega
- ver cantidad entregada
- ver cantidad pendiente
- ver saldo de pago

### Nomina y Mano de Obra

Rutas:

```txt
/projects/[id]/weeks/[periodId]/labor/[laborId]
```

Funciones:

- capturar trabajador
- dias/horas
- tarifa
- total calculable
- editar
- eliminar
- efectivo/facturado

### Pagos y Abonos

Rutas:

```txt
/projects/[id]/weeks/[periodId]/payments/[paymentId]
```

Funciones:

- registrar abono
- editar pago
- eliminar pago
- metodo de pago
- efectivo/facturado

### Fotos / Evidencias

Rutas:

```txt
/api/photos/[id]
```

Funciones:

- subir fotos por semana
- ver galeria
- eliminar foto
- guardar archivo en volumen `uploads`
- registrar metadatos en PostgreSQL

### Reportes

Rutas:

```txt
/projects/[id]/reports
/projects/[id]/reports/export
```

Funciones:

- reporte acumulado por obra
- efectivo
- facturado
- honorarios
- total
- pagos
- deuda
- costo por m2
- imprimir/exportar PDF desde navegador
- exportar CSV compatible con Excel

### Importador

Rutas:

```txt
/imports
/imports/template
```

Funciones:

- descargar plantilla CSV
- importar resumen historico guardado desde Excel
- crear obras si no existen
- crear semanas si no existen
- registrar efectivo/facturado/pagos importados

Columnas esperadas:

```txt
project_name,address,client_name,week_number,label,start_date,end_date,cash,invoiced,payments
```

### Catalogos

Ruta:

```txt
/catalogs
```

Catalogos:

- proveedores
- contratistas

Funciones:

- crear
- editar
- activar/inactivar
- eliminar

### Usuarios y Roles

Rutas:

```txt
/setup
/login
/logout
/users
```

Roles:

- `ADMIN`
- `ARCHITECT`
- `CAPTURE`
- `READ_ONLY`

Permisos actuales:

- `ADMIN`: administra usuarios y puede escribir.
- `ARCHITECT`: puede administrar obras/catalogos/importaciones y escribir.
- `CAPTURE`: puede capturar en semanas abiertas.
- `READ_ONLY`: solo lectura.

## Modelo de Datos Principal

Archivo:

```txt
prisma/schema.prisma
```

Entidades principales:

- `User`
- `Project`
- `WeeklyPeriod`
- `Contractor`
- `Supplier`
- `WorkItem`
- `LaborPayment`
- `MaterialPurchase`
- `MaterialDelivery`
- `Payment`
- `Photo`

Migraciones:

- `202606220001_initial`
- `202606220002_users`

## Seguridad

Capas actuales:

1. Sesion interna firmada con cookie `poncho_session`.
2. Login con usuario/contraseña guardada como hash PBKDF2.
3. Roles internos.
4. Autorizacion en acciones de servidor.
5. Basic Auth opcional por `.env`.
6. Semanas cerradas en modo lectura.

## Respaldos

El servicio `backup` genera:

- respaldo SQL de PostgreSQL
- respaldo `.tar.gz` de uploads/fotos

Comandos utiles:

```bash
docker compose exec backup ls -lah /backups
docker compose exec backup sh /app/scripts/backup-postgres.sh
```

## CI y Tests

GitHub Actions:

```txt
.github/workflows/ci.yml
```

Ejecuta:

- `npm ci`
- `npx prisma generate`
- `npm test`
- `npm run check`
- `npm run build`

Tests:

```txt
tests/csv.test.mjs
tests/reporting.test.mjs
```

## Comandos Locales

Instalar:

```bash
npm install
```

Generar Prisma:

```bash
npx prisma generate
```

Validar:

```bash
npm test
npm run check
npm run build
```

Levantar con Docker:

```bash
docker compose up -d --build
```

## Estado Actual

El proyecto tiene MVP operativo y varias piezas de produccion base:

- captura completa por obra/semana
- evidencias
- reportes
- import/export
- usuarios
- permisos
- backups
- HTTPS opcional
- CI

Pendientes recomendados para siguientes iteraciones:

- mejorar experiencia movil en obra
- selects integrados de contratistas/proveedores en formularios operativos
- auditoria fina de cambios por usuario
- exportacion XLSX nativa
- PDF generado en servidor
- dashboard con graficas
- integracion de almacenamiento externo para fotos
- pruebas end-to-end

