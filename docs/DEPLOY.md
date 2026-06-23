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
AUTH_SECRET=otra_cadena_larga_y_aleatoria
```

Despues del primer arranque con `AUTH_SECRET`, abrir:

```txt
http://SERVER_IP:3000/setup
```

Ese flujo crea el primer usuario administrador. A partir de ahi se entra por `/login`.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Actualizar Deploy

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## HTTPS con dominio

Configurar en `.env`:

```txt
DOMAIN_NAME=tu-dominio.com
```

Levantar incluyendo el perfil proxy:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile proxy up -d --build
```

Caddy genera certificados automaticamente cuando el dominio apunta al servidor y los puertos 80/443 estan abiertos.

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
Tambien genera un respaldo comprimido de `uploads` con fotos/evidencias.

Listar respaldos:

```bash
docker compose exec backup ls -lah /backups
```

Crear respaldo manual:

```bash
docker compose exec backup sh /app/scripts/backup-postgres.sh
```
