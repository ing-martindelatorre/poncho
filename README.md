# Poncho

Aplicacion web para controlar obras, destajos, nomina, materiales, fotos y reportes semanales.

## Estado actual

Fase 1 en progreso:

- App web con Next.js y TypeScript.
- PostgreSQL en Docker.
- Prisma con modelo inicial.
- Migracion inicial versionada.
- Healthcheck de app y base de datos.
- Volumen para fotos/evidencias.
- Volumen para respaldos de PostgreSQL.

## Requisitos

- Docker
- Docker Compose

## Levantar en desarrollo con Docker

```bash
cp .env.example .env
docker compose up --build
```

La app queda disponible en:

```txt
http://localhost:3000
```

Healthcheck:

```txt
http://localhost:3000/api/health
```

## Variables principales

```txt
POSTGRES_DB=poncho
POSTGRES_USER=poncho
POSTGRES_PASSWORD=change_me_in_production
DATABASE_URL=postgresql://poncho:change_me_in_production@db:5432/poncho?schema=public
WEB_PORT=3000
BACKUP_RETENTION_DAYS=14
HONORARIOS_RATE=0.10
BASIC_AUTH_USER=
BASIC_AUTH_PASSWORD=
AUTH_SECRET=change_me_to_a_long_random_string
DOMAIN_NAME=localhost
```

Si `BASIC_AUTH_USER` y `BASIC_AUTH_PASSWORD` tienen valor, la app queda protegida con autenticacion basica HTTP. Si estan vacias, la proteccion queda apagada para desarrollo local.

Si `AUTH_SECRET` tiene valor, la app requiere login con usuarios internos. Al primer arranque visita `/setup` para crear el administrador inicial.

## Deploy inicial en Linux

En el servidor:

```bash
git clone https://github.com/ing-martindelatorre/poncho.git
cd poncho
cp .env.example .env
```

Editar `.env` y cambiar al menos:

```txt
POSTGRES_PASSWORD=una_contrasena_segura
DATABASE_URL=postgresql://poncho:una_contrasena_segura@db:5432/poncho?schema=public
```

Levantar:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Ver logs:

```bash
docker compose logs -f web
```

Apagar:

```bash
docker compose down
```

## Respaldos

El servicio `backup` genera un archivo SQL diario en el volumen `poncho_backups`.

Para listar respaldos:

```bash
docker compose exec backup ls -lah /backups
```

Para crear un respaldo manual:

```bash
docker compose exec backup sh /app/scripts/backup-postgres.sh
```

## Fases siguientes

1. CRUD de obras.
2. CRUD de semanas por obra.
3. Captura de destajos.
4. Captura de materiales y prepagos.
5. Captura de nomina y pagos.
6. Subida de fotos.
7. Reportes tipo caratula y acumulados.
8. Login y roles.
9. Proxy HTTPS y dominio.
