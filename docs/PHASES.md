# Fases de Programacion

## Fase 1: Base Desplegable

Estado: completada.

Incluye:

- app Next.js
- TypeScript
- Prisma
- PostgreSQL en Docker
- migracion inicial
- healthcheck
- volumen de uploads
- volumen de backups
- README de deploy

## Fase 2: Obras

Estado: completada.

Objetivo:

- crear obras
- listar obras
- editar datos generales
- ver resumen inicial por obra

Campos base:

- nombre
- direccion
- cliente
- m2 construidos
- fecha de inicio
- estado
- notas

## Fase 3: Semanas

Estado: completada.

Objetivo:

- crear cortes semanales por obra
- listar semanas
- cerrar/abrir semanas
- ver totales preliminares por semana

## Fase 4: Destajos

Estado: completada.

Objetivo:

- capturar conceptos de destajo
- manejar unidades m2, ml, kg, pza, lote, hora
- calcular volumen, precio unitario y total
- asociar contratista

## Fase 5: Materiales

Objetivo:

- capturar material efectivo y facturado
- controlar proveedor
- controlar prepagos
- controlar entregas pendientes

## Fase 6: Nomina y Pagos

Objetivo:

- registrar pagos de mano de obra
- registrar abonos
- separar efectivo y facturado
- calcular deuda

## Fase 7: Fotos

Objetivo:

- subir evidencia
- asociar fotos a obra, semana, destajo, material o pago
- preparar galeria por semana

## Fase 8: Reportes

Objetivo:

- caratula semanal efectivo
- caratula facturado
- desglosado acumulado
- totales por semana
- costo por m2
- exportacion PDF

## Fase 9: Seguridad

Objetivo:

- login
- roles
- auditoria basica
- bloqueo de semanas cerradas
