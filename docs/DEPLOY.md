# Deploy en Linux Server

## Requisitos

- Docker
- Docker Compose
- Git

## Primer Deploy

```bash
git clone https://github.com/ing-martindelatorre/poncho.git
cd poncho
cp .env.example .env
```

Editar `.env` y cambiar contrasenas.

Para proteger el deploy de pruebas:

```txt
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=una_contrasena_segura
```

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Actualizar Deploy

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Ver Logs

```bash
docker compose logs -f web
```

## Ver Estado

```bash
docker compose ps
```

## Healthcheck

```txt
http://SERVER_IP:3000/api/health
```

## Respaldos

El servicio `backup` genera respaldos SQL diarios en el volumen `poncho_backups`.

Listar respaldos:

```bash
docker compose exec backup ls -lah /backups
```

Crear respaldo manual:

```bash
docker compose exec backup sh /app/scripts/backup-postgres.sh
```
