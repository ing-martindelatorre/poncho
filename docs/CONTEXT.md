# Contexto del Proyecto Poncho

Poncho es una aplicacion web para reemplazar y mejorar el control de obra que hoy se lleva en Excel.

El caso base viene del archivo `OMAR SEMANA 27.xlsx`, usado por un arquitecto para controlar:

- destajos
- nomina y mano de obra
- materiales en efectivo
- materiales facturados
- prepagos
- fotos/evidencia
- subcontratos
- reportes semanales
- acumulados por obra
- honorarios
- deuda y abonos

## Objetivo

Construir una aplicacion web desplegable en un servidor Linux con Docker, preparada para escalar a futuro.

La app debe permitir capturar informacion operativa de obra y generar reportes equivalentes o mejores a las caratulas y desglosados del Excel.

## Criterios de Diseno

- Primero usable, luego sofisticado.
- Cada modulo debe poder desplegarse y probarse en servidor.
- PostgreSQL debe vivir en Docker con volumen persistente.
- Fotos y documentos deben guardarse en volumen respaldable.
- Los cambios se suben a GitHub al terminar cada modulo.
- El deploy debe poder hacerse con `docker compose`.

## Stack Actual

- Next.js
- TypeScript
- Prisma
- PostgreSQL
- Docker Compose

## Repositorio

Repositorio remoto:

```txt
https://github.com/ing-martindelatorre/poncho
```

Ramas iniciales:

- `main`
- `codex/fase-1-docker-web`

