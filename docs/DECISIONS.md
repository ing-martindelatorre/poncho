# Decisiones Tecnicas

## Docker desde el inicio

La app se construye para correr en Docker desde la fase 1 porque el destino real es un servidor Linux.

## PostgreSQL

Se usa PostgreSQL porque:

- escala mejor que SQLite para uso real
- funciona bien con Prisma
- es facil de respaldar con `pg_dump`
- puede migrarse despues a un servicio administrado

## Fotos en volumen local

Las fotos se guardaran inicialmente en volumen Docker.

Esto permite:

- deploy simple
- respaldos junto con base de datos
- migracion futura a MinIO, S3 o Backblaze

## Prisma

Prisma se usa para:

- versionar el modelo de datos
- generar migraciones
- mantener queries tipadas

## Modulos por commits

Cada modulo terminado se valida, se commitea y se sube a GitHub.

Esto deja puntos de restauracion claros y facilita deploy incremental en servidor.

