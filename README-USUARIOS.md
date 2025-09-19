# Crear Datos de Prueba

Este archivo contiene scripts para crear datos de prueba completos en la base de datos.

## Scripts Disponibles

### 1. `create-user.js` - Solo usuarios básicos
```bash
node create-user.js
```

### 2. `create-sample-data.js` - Datos completos del sistema
```bash
node create-sample-data.js
```

## Uso

### 1. Instalar dependencias
```bash
npm install mongoose crypto
```

### 2. Ejecutar el script completo
```bash
node create-sample-data.js
```

## Datos Creados

### Empresa
- **Nombre:** Fabrika S.A.
- **Email:** admin@fabrika.com
- **Suscripción:** Activa

### Usuarios
- **Admin:** admin@test.com / admin123
- **Gerente:** gerente@test.com / gerente123
- **Empleado:** ventas@test.com / ventas123

### Clientes (5)
- Restaurante El Buen Sabor
- Cafetería Central
- Panadería La Tradición
- Hotel Gran Vista
- Catering Elegante

### Proveedores (5)
- Distribuidora de Granos del Norte
- Proveedora de Especias Exóticas
- Carnes Premium del Sur
- Lácteos Frescos del Valle
- Importadora de Productos Gourmet

### Sucursales (5)
- Sucursal Centro (CDMX)
- Sucursal Norte (Monterrey)
- Sucursal Sur (Guadalajara)
- Sucursal Este (Puebla)
- Sucursal Oeste (Tijuana)

## Base de Datos

- **MongoDB:** mongodb://localhost:27017/fabrika
- **Colecciones:** users, companies, customers, suppliers, branches

## Notas

- Las contraseñas se hashean con SHA-256 (solo para desarrollo)
- En producción usar bcrypt o argon2
- Todos los datos están asociados a la empresa principal
- Todos los registros están activos por defecto
