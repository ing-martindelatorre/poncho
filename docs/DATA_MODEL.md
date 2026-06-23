# Modelo de Datos

El modelo inicial esta definido en `prisma/schema.prisma`.

## Entidades Principales

### Project

Representa una obra.

Relaciones:

- tiene muchas semanas
- tiene compras de materiales
- tiene fotos

### WeeklyPeriod

Representa un corte semanal de una obra.

Relaciones:

- pertenece a una obra
- tiene destajos
- tiene pagos de nomina
- tiene compras de materiales
- tiene entregas de materiales
- tiene pagos
- tiene fotos

### WorkItem

Representa un concepto de destajo.

Campos importantes:

- categoria
- descripcion
- unidad
- largo, ancho, alto, piezas
- volumen
- precio unitario
- total
- tipo de dinero: efectivo o facturado

### LaborPayment

Representa pagos de mano de obra o nomina.

### MaterialPurchase

Representa compra o prepago de material.

Campos importantes:

- proveedor
- factura/remision
- cantidad
- unidad
- total
- monto pagado
- estado: ordenado, parcial, entregado

### MaterialDelivery

Representa entregas contra una compra de material.

### Payment

Representa abonos o pagos generales.

### Photo

Representa una foto o evidencia almacenada en el volumen de uploads.

Puede ligarse a:

- obra
- semana
- destajo
- material
- nomina
- pago

