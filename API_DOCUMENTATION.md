# Documentación de API - Sistema Fabrika

Esta documentación describe todas las APIs disponibles en el sistema Fabrika, organizadas por funcionalidad.

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Gestión de Usuarios](#gestión-de-usuarios)
3. [Gestión de Sucursales](#gestión-de-sucursales)
4. [Gestión de Clientes](#gestión-de-clientes)
5. [Gestión de Proveedores](#gestión-de-proveedores)
6. [Gestión de Materias Primas](#gestión-de-materias-primas)
7. [Gestión de Ingredientes](#gestión-de-ingredientes)
8. [Gestión de Recetas](#gestión-de-recetas)
9. [Producción](#producción)

---

## Autenticación

### POST /api/auth/login

**Descripción:** Inicia sesión de usuario en el sistema.

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Juan Pérez",
    "email": "usuario@ejemplo.com",
    "role": "ADMIN"
  }
}
```

**Headers de Respuesta:**
```
Set-Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; Secure; SameSite=Strict
```

**Errores:**
- `400`: Datos faltantes o inválidos
- `401`: Credenciales incorrectas
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

---

### POST /api/auth/logout

**Descripción:** Cierra la sesión del usuario actual.

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

**Headers de Respuesta:**
```
Set-Cookie: session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
```

---

## Gestión de Usuarios

### POST /api/users

**Descripción:** Crea un nuevo usuario en el sistema.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "contraseña123",
  "role": "USER"
}
```

**Roles Disponibles:**
- `SUPERADMIN`: Acceso completo al sistema
- `ADMIN`: Administrador general
- `AdminSucursal`: Administrador de sucursal
- `USER`: Usuario estándar

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Juan Pérez",
    "email": "juan@ejemplo.com",
    "role": "USER",
    "lastLogin": null,
    "createdAt": "2023-07-01T10:00:00.000Z"
  }
}
```

**Errores:**
- `400`: Datos de validación incorrectos
- `401`: No autorizado
- `403`: Sin permisos para crear usuarios con este rol
- `409`: Usuario ya existe
- `500`: Error interno del servidor

---

### GET /api/users

**Descripción:** Obtiene la lista de todos los usuarios.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "users": [
    {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "USER",
      "lastLogin": "2023-07-01T10:00:00.000Z",
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  ]
}
```

---

## Gestión de Sucursales

### POST /api/branches

**Descripción:** Crea una nueva sucursal.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Sucursal Centro",
  "code": "SUC001",
  "address": "Av. Principal 123",
  "city": "Ciudad de México",
  "phone": "+52 55 1234 5678",
  "email": "centro@fabrika.com"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Sucursal creada exitosamente",
  "branch": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Sucursal Centro",
    "code": "SUC001",
    "address": "Av. Principal 123",
    "city": "Ciudad de México",
    "phone": "+52 55 1234 5678",
    "email": "centro@fabrika.com",
    "active": true
  }
}
```

---

### GET /api/branches

**Descripción:** Obtiene la lista de todas las sucursales.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "branches": [
    {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Sucursal Centro",
      "code": "SUC001",
      "address": "Av. Principal 123",
      "city": "Ciudad de México",
      "phone": "+52 55 1234 5678",
      "email": "centro@fabrika.com",
      "active": true,
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/branches/[id]

**Descripción:** Actualiza una sucursal existente.

**Autenticación:** Requerida (JWT)

**Parámetros:**
- `id`: ID de la sucursal a actualizar

**Body:** Mismo formato que POST

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Sucursal actualizada exitosamente",
  "branch": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Sucursal Centro Actualizada",
    "code": "SUC001",
    "address": "Av. Principal 456",
    "city": "Ciudad de México",
    "phone": "+52 55 1234 5678",
    "email": "centro@fabrika.com",
    "active": true
  }
}
```

---

### DELETE /api/branches/[id]

**Descripción:** Elimina una sucursal.

**Autenticación:** Requerida (JWT)

**Parámetros:**
- `id`: ID de la sucursal a eliminar

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Sucursal eliminada exitosamente"
}
```

---

## Gestión de Clientes

### POST /api/customers

**Descripción:** Crea un nuevo cliente.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "María García",
  "phone": "+52 55 9876 5432",
  "email": "maria@ejemplo.com",
  "address": "Calle Secundaria 789",
  "birthDate": "1990-05-15",
  "gender": "F",
  "preferences": ["vegetariano", "sin gluten"],
  "notes": "Cliente preferencial"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Cliente creado exitosamente",
  "customer": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "María García",
    "phone": "+52 55 9876 5432",
    "email": "maria@ejemplo.com",
    "address": "Calle Secundaria 789",
    "birthDate": "1990-05-15T00:00:00.000Z",
    "gender": "F",
    "preferences": ["vegetariano", "sin gluten"],
    "notes": "Cliente preferencial",
    "active": true
  }
}
```

---

### GET /api/customers

**Descripción:** Obtiene la lista de todos los clientes.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "customers": [
    {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "María García",
      "phone": "+52 55 9876 5432",
      "email": "maria@ejemplo.com",
      "address": "Calle Secundaria 789",
      "birthDate": "1990-05-15T00:00:00.000Z",
      "gender": "F",
      "preferences": ["vegetariano", "sin gluten"],
      "notes": "Cliente preferencial",
      "active": true,
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/customers/[id]

**Descripción:** Actualiza un cliente existente.

**Autenticación:** Requerida (JWT)

**Parámetros:**
- `id`: ID del cliente a actualizar

**Body:** Mismo formato que POST

---

### DELETE /api/customers/[id]

**Descripción:** Elimina un cliente.

**Autenticación:** Requerida (JWT)

**Parámetros:**
- `id`: ID del cliente a eliminar

---

## Gestión de Proveedores

### POST /api/suppliers

**Descripción:** Crea un nuevo proveedor.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Proveedor ABC S.A.",
  "email": "contacto@proveedorabc.com",
  "phone": "+52 55 1111 2222",
  "address": "Av. Industrial 456",
  "city": "Guadalajara"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Proveedor creado exitosamente",
  "supplier": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Proveedor ABC S.A.",
    "email": "contacto@proveedorabc.com",
    "phone": "+52 55 1111 2222",
    "address": "Av. Industrial 456",
    "city": "Guadalajara",
    "active": true
  }
}
```

---

### GET /api/suppliers

**Descripción:** Obtiene la lista de todos los proveedores.

**Autenticación:** Requerida (JWT)

---

### PUT /api/suppliers/[id]

**Descripción:** Actualiza un proveedor existente.

**Autenticación:** Requerida (JWT)

---

### DELETE /api/suppliers/[id]

**Descripción:** Elimina un proveedor.

**Autenticación:** Requerida (JWT)

---

## Gestión de Materias Primas

### POST /api/raw-materials

**Descripción:** Crea una nueva materia prima.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Harina de Trigo",
  "code": "HT001",
  "description": "Harina de trigo integral orgánica",
  "category": "Cereales",
  "supplier": "64a1b2c3d4e5f6789abcdef0",
  "unit": "kg",
  "currentStock": 100,
  "minimumStock": 20,
  "maximumStock": 500,
  "unitCost": 15.50,
  "unitPrice": 18.00,
  "batchNumber": "BATCH2023001",
  "notes": "Materia prima de alta calidad"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Materia prima creada exitosamente",
  "rawMaterial": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Harina de Trigo",
    "code": "HT001",
    "description": "Harina de trigo integral orgánica",
    "category": "Cereales",
    "supplier": "64a1b2c3d4e5f6789abcdef0",
    "unit": "kg",
    "currentStock": 100,
    "minimumStock": 20,
    "maximumStock": 500,
    "unitCost": 15.50,
    "unitPrice": 18.00,
    "batchNumber": "BATCH2023001",
    "notes": "Materia prima de alta calidad",
    "active": true
  }
}
```

---

### GET /api/raw-materials

**Descripción:** Obtiene la lista de todas las materias primas.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "rawMaterials": [
    {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Harina de Trigo",
      "code": "HT001",
      "description": "Harina de trigo integral orgánica",
      "category": "Cereales",
      "supplier": "64a1b2c3d4e5f6789abcdef0",
      "unit": "kg",
      "currentStock": 100,
      "minimumStock": 20,
      "maximumStock": 500,
      "unitCost": 15.50,
      "unitPrice": 18.00,
      "batchNumber": "BATCH2023001",
      "notes": "Materia prima de alta calidad",
      "active": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/raw-materials/[id]

**Descripción:** Obtiene una materia prima específica por su ID.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "rawMaterial": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Harina de Trigo",
    "code": "HT001",
    "description": "Harina de trigo integral orgánica",
    "category": "Cereales",
    "supplier": "64a1b2c3d4e5f6789abcdef0",
    "unit": "kg",
    "currentStock": 100,
    "minimumStock": 20,
    "maximumStock": 500,
    "unitCost": 15.50,
    "unitPrice": 18.00,
    "batchNumber": "BATCH2023001",
    "notes": "Materia prima de alta calidad",
    "active": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Respuesta de Error (404):**
```json
{
  "success": false,
  "message": "Materia prima no encontrada"
}
```

---

### PUT /api/raw-materials/[id]

**Descripción:** Actualiza una materia prima existente.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:** (Mismo formato que crear materia prima)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Materia prima actualizada exitosamente",
  "rawMaterial": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Harina de Trigo Actualizada",
    "code": "HT001",
    "description": "Harina de trigo integral orgánica premium",
    "category": "Cereales",
    "supplier": "64a1b2c3d4e5f6789abcdef0",
    "unit": "kg",
    "currentStock": 150,
    "minimumStock": 25,
    "maximumStock": 600,
    "unitCost": 16.00,
    "unitPrice": 19.00,
    "batchNumber": "BATCH2023002",
    "notes": "Materia prima de alta calidad actualizada",
    "active": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-16T14:20:00.000Z"
  }
}
```

**Respuesta de Error (404):**
```json
{
  "success": false,
  "message": "Materia prima no encontrada"
}
```

**Respuesta de Error (409):**
```json
{
  "success": false,
  "message": "Ya existe otra materia prima con este código"
}
```

---

### DELETE /api/raw-materials/[id]

**Descripción:** Elimina una materia prima.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Materia prima eliminada exitosamente"
}
```

**Respuesta de Error (404):**
```json
{
  "success": false,
  "message": "Materia prima no encontrada"
}
```

### Campos de Materia Prima

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre de la materia prima |
| `code` | string | Sí | Código único de la materia prima |
| `description` | string | Sí | Descripción detallada |
| `category` | string | Sí | Categoría (Cereales, Lácteos, etc.) |
| `supplier` | string | Sí | ID del proveedor |
| `unit` | string | Sí | Unidad de medida (kg, litros, etc.) |
| `currentStock` | number | Sí | Stock actual |
| `minimumStock` | number | Sí | Stock mínimo |
| `maximumStock` | number | Sí | Stock máximo |
| `unitCost` | number | Sí | Costo por unidad |
| `unitPrice` | number | Sí | Precio de venta por unidad |
| `batchNumber` | string | No | Número de lote |
| `notes` | string | No | Notas adicionales |

### Validaciones

- **Código único**: No puede haber dos materias primas con el mismo código
- **Stock**: Los valores de stock deben ser números positivos
- **Precios**: Los precios deben ser números positivos
- **Proveedor**: Debe existir en la base de datos

---

## Gestión de Ingredientes

### POST /api/ingredients

**Descripción:** Crea un nuevo ingrediente.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Pan Integral",
  "description": "Pan de harina integral con semillas",
  "supplier": "Producción interna",
  "stock": 50,
  "category": "Panadería"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Ingrediente creado exitosamente",
  "ingrediente": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Pan Integral",
    "description": "Pan de harina integral con semillas",
    "supplier": "Producción interna",
    "stock": 50,
    "category": "Panadería"
  }
}
```

---

### GET /api/ingredients

**Descripción:** Obtiene la lista de todos los ingredientes.

**Autenticación:** Requerida (JWT)

---

### PUT /api/ingredients/[id]

**Descripción:** Actualiza un ingrediente existente.

**Autenticación:** Requerida (JWT)

---

### DELETE /api/ingredients/[id]

**Descripción:** Elimina un ingrediente.

**Autenticación:** Requerida (JWT)

---

## Gestión de Recetas

### POST /api/recipes

**Descripción:** Crea una nueva receta.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Body:**
```json
{
  "name": "Pan Integral Especial",
  "description": "Pan integral con semillas de girasol y ajonjolí",
  "instructions": "1. Mezclar harina con agua tibia\n2. Agregar levadura y sal\n3. Amasar por 10 minutos\n4. Dejar reposar 1 hora\n5. Hornear a 200°C por 30 minutos",
  "preparationTime": 90,
  "servings": 8,
  "category": "Panadería",
  "creator": "Chef Principal",
  "ingredients": [
    {
      "rawMaterialId": "64a1b2c3d4e5f6789abcdef0",
      "quantity": 500,
      "unit": "g"
    },
    {
      "rawMaterialId": "64a1b2c3d4e5f6789abcdef1",
      "quantity": 10,
      "unit": "g"
    }
  ]
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Receta creada exitosamente",
  "recipe": {
    "id": "64a1b2c3d4e5f6789abcdef0",
    "name": "Pan Integral Especial",
    "description": "Pan integral con semillas de girasol y ajonjolí",
    "instructions": "1. Mezclar harina con agua tibia\n2. Agregar levadura y sal\n3. Amasar por 10 minutos\n4. Dejar reposar 1 hora\n5. Hornear a 200°C por 30 minutos",
    "preparationTime": 90,
    "servings": 8,
    "category": "Panadería",
    "creator": "Chef Principal",
    "ingredients": [
      {
        "rawMaterialId": "64a1b2c3d4e5f6789abcdef0",
        "quantity": 500,
        "unit": "g"
      }
    ],
    "active": true
  }
}
```

---

### GET /api/recipes

**Descripción:** Obtiene la lista de todas las recetas con información enriquecida de materias primas.

**Autenticación:** Requerida (JWT)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "recipes": [
    {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Pan Integral Especial",
      "description": "Pan integral con semillas de girasol y ajonjolí",
      "instructions": "1. Mezclar harina con agua tibia...",
      "preparationTime": 90,
      "servings": 8,
      "category": "Panadería",
      "creator": "Chef Principal",
      "ingredients": [
        {
          "rawMaterialId": "64a1b2c3d4e5f6789abcdef0",
          "quantity": 500,
          "unit": "g",
          "rawMaterialInfo": {
            "id": "64a1b2c3d4e5f6789abcdef0",
            "name": "Harina de Trigo",
            "code": "HT001",
            "currentStock": 100,
            "unit": "kg",
            "category": "Cereales"
          }
        }
      ],
      "active": true,
      "createdAt": "2023-07-01T10:00:00.000Z"
    }
  ]
}
```

---

### PUT /api/recipes/[id]

**Descripción:** Actualiza una receta existente.

**Autenticación:** Requerida (JWT)

---

### DELETE /api/recipes/[id]

**Descripción:** Elimina una receta.

**Autenticación:** Requerida (JWT)

---

## Producción

### POST /api/recipes/[id]/produce

**Descripción:** Produce ingredientes usando una receta específica.

**Autenticación:** Requerida (JWT)

**Headers:**
```
Content-Type: application/json
Cookie: session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Parámetros:**
- `id`: ID de la receta a usar para la producción

**Body:**
```json
{
  "quantity": 10
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Se produjeron 10 unidades de Pan Integral Especial exitosamente",
  "production": {
    "recipeId": "64a1b2c3d4e5f6789abcdef0",
    "recipeName": "Pan Integral Especial",
    "quantity": 10,
    "ingredientsUsed": [
      {
        "rawMaterialId": "64a1b2c3d4e5f6789abcdef0",
        "quantityUsed": 5000
      }
    ]
  }
}
```

**Errores:**
- `400`: Cantidad inválida o stock insuficiente
- `401`: No autorizado
- `404`: Receta no encontrada
- `500`: Error interno del servidor

---

## Códigos de Estado HTTP

- `200`: OK - Operación exitosa
- `201`: Created - Recurso creado exitosamente
- `400`: Bad Request - Datos de entrada inválidos
- `401`: Unauthorized - No autenticado
- `403`: Forbidden - Sin permisos
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Recurso ya existe
- `500`: Internal Server Error - Error interno del servidor

---

## Autenticación

Todas las APIs (excepto login) requieren autenticación mediante JWT almacenado en una cookie de sesión.

**Cookie de Sesión:**
```
session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Configuración:**
- `HttpOnly`: true
- `Secure`: true (en producción)
- `SameSite`: Strict

---

## Validación de Datos

Todos los endpoints que reciben datos utilizan esquemas de validación predefinidos que verifican:

- Campos requeridos
- Tipos de datos
- Longitudes mínimas y máximas
- Patrones de formato (emails, etc.)
- Validaciones personalizadas

Los errores de validación se devuelven con código `400` y un array de mensajes de error específicos.

---

## Middleware

El sistema utiliza middleware para:

- **Autenticación**: Verificación de JWT
- **Validación**: Validación de datos de entrada
- **Logging**: Registro de operaciones
- **Manejo de errores**: Gestión centralizada de errores
- **Roles**: Control de acceso basado en roles

---

## Base de Datos

El sistema utiliza MongoDB con Mongoose ODM. Todas las operaciones incluyen:

- Conexión automática a la base de datos
- Manejo de errores de base de datos
- Validación de duplicados
- Soft delete (marcado como inactivo en lugar de eliminación física)

---

## 7. Facturas (Invoices)

### 7.1 Crear Factura
**POST** `/api/invoices`

Crea una nueva factura de compra.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "invoiceNumber": "FAC-2024-001",
  "supplier": "64a1b2c3d4e5f6789abcdef0",
  "branch": "64a1b2c3d4e5f6789abcdef1",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "items": [
    {
      "rawMaterial": "64a1b2c3d4e5f6789abcdef2",
      "description": "Harina de trigo premium",
      "quantity": 100,
      "unitPrice": 2.50,
      "totalPrice": 250.00,
      "unit": "kg"
    },
    {
      "rawMaterial": "64a1b2c3d4e5f6789abcdef3",
      "description": "Azúcar refinada",
      "quantity": 50,
      "unitPrice": 1.80,
      "totalPrice": 90.00,
      "unit": "kg"
    }
  ],
  "subtotal": 340.00,
  "taxAmount": 54.40,
  "discountAmount": 0.00,
  "totalAmount": 394.40,
  "notes": "Compra mensual de ingredientes",
  "paymentMethod": "Transferencia bancaria"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Factura creada exitosamente",
  "invoice": {
    "id": "64a1b2c3d4e5f6789abcdef4",
    "invoiceNumber": "FAC-2024-001",
    "supplier": {
      "id": "64a1b2c3d4e5f6789abcdef0",
      "name": "Proveedor ABC",
      "email": "contacto@proveedorabc.com",
      "phone": "+1234567890"
    },
    "branch": {
      "id": "64a1b2c3d4e5f6789abcdef1",
      "name": "Sucursal Centro",
      "code": "CENTRO-001"
    },
    "createdBy": {
      "id": "64a1b2c3d4e5f6789abcdef5",
      "name": "Juan Pérez",
      "email": "juan@fabrika.com"
    },
    "invoiceDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "items": [...],
    "subtotal": 340.00,
    "taxAmount": 54.40,
    "discountAmount": 0.00,
    "totalAmount": 394.40,
    "status": "pending",
    "notes": "Compra mensual de ingredientes",
    "paymentMethod": "Transferencia bancaria",
    "active": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 7.2 Obtener Facturas
**GET** `/api/invoices`

Obtiene la lista de facturas con filtros y paginación.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (opcional): Filtrar por estado (pending, approved, rejected, paid, cancelled)
- `supplier` (opcional): Filtrar por ID de proveedor
- `branch` (opcional): Filtrar por ID de sucursal
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)

**Ejemplo:**
```
GET /api/invoices?status=approved&page=1&limit=5
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "invoices": [
    {
      "id": "64a1b2c3d4e5f6789abcdef4",
      "invoiceNumber": "FAC-2024-001",
      "supplier": {...},
      "branch": {...},
      "createdBy": {...},
      "invoiceDate": "2024-01-15T00:00:00.000Z",
      "dueDate": "2024-02-15T00:00:00.000Z",
      "items": [...],
      "subtotal": 340.00,
      "taxAmount": 54.40,
      "discountAmount": 0.00,
      "totalAmount": 394.40,
      "status": "approved",
      "notes": "Compra mensual de ingredientes",
      "paymentMethod": "Transferencia bancaria",
      "paymentDate": null,
      "paymentReference": null,
      "approvedBy": {...},
      "approvedAt": "2024-01-16T09:15:00.000Z",
      "rejectionReason": null,
      "active": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-16T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 25,
    "pages": 5
  }
}
```

### 7.3 Obtener Factura por ID
**GET** `/api/invoices/{id}`

Obtiene una factura específica por su ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "invoice": {
    "id": "64a1b2c3d4e5f6789abcdef4",
    "invoiceNumber": "FAC-2024-001",
    "supplier": {...},
    "branch": {...},
    "createdBy": {...},
    "invoiceDate": "2024-01-15T00:00:00.000Z",
    "dueDate": "2024-02-15T00:00:00.000Z",
    "items": [...],
    "subtotal": 340.00,
    "taxAmount": 54.40,
    "discountAmount": 0.00,
    "totalAmount": 394.40,
    "status": "pending",
    "notes": "Compra mensual de ingredientes",
    "paymentMethod": "Transferencia bancaria",
    "paymentDate": null,
    "paymentReference": null,
    "approvedBy": null,
    "approvedAt": null,
    "rejectionReason": null,
    "active": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 7.4 Actualizar Factura
**PUT** `/api/invoices/{id}`

Actualiza una factura existente. Solo se pueden editar facturas con estado "pending".

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:** (Mismo formato que crear factura)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Factura actualizada exitosamente",
  "invoice": {...}
}
```

### 7.5 Eliminar Factura
**DELETE** `/api/invoices/{id}`

Elimina una factura. Solo se pueden eliminar facturas con estado "pending".

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Factura eliminada exitosamente"
}
```

### 7.6 Aprobar/Rechazar Factura
**POST** `/api/invoices/{id}/approve`

Aprueba o rechaza una factura pendiente.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body para Aprobar:**
```json
{
  "action": "approve"
}
```

**Body para Rechazar:**
```json
{
  "action": "reject",
  "rejectionReason": "Precios no acordados en el contrato"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Factura aprobada exitosamente",
  "invoice": {
    "id": "64a1b2c3d4e5f6789abcdef4",
    "status": "approved",
    "approvedBy": {...},
    "approvedAt": "2024-01-16T09:15:00.000Z",
    "rejectionReason": null,
    ...
  }
}
```

### 7.7 Marcar Factura como Pagada
**POST** `/api/invoices/{id}/pay`

Marca una factura aprobada como pagada.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentMethod": "Transferencia bancaria",
  "paymentReference": "TXN-123456789"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Factura marcada como pagada exitosamente",
  "invoice": {
    "id": "64a1b2c3d4e5f6789abcdef4",
    "status": "paid",
    "paymentMethod": "Transferencia bancaria",
    "paymentReference": "TXN-123456789",
    "paymentDate": "2024-01-20T14:30:00.000Z",
    ...
  }
}
```

### 7.8 Estados de Factura

| Estado | Descripción | Acciones Permitidas |
|--------|-------------|-------------------|
| `pending` | Pendiente de aprobación | Editar, Eliminar, Aprobar, Rechazar |
| `approved` | Aprobada, lista para pago | Marcar como pagada |
| `rejected` | Rechazada | Ninguna |
| `paid` | Pagada | Ninguna |
| `cancelled` | Cancelada | Ninguna |

### 7.9 Validaciones de Factura

- **Número de factura**: Debe ser único
- **Proveedor**: Debe existir en la base de datos
- **Sucursal**: Debe existir en la base de datos
- **Items**: Debe tener al menos un item
- **Cálculos**: El subtotal debe coincidir con la suma de items
- **Total**: Debe coincidir con (subtotal + impuestos - descuentos)
- **Fechas**: Fecha de vencimiento debe ser posterior a la fecha de factura

### 7.10 Códigos de Error Comunes

- `400`: Datos inválidos o factura no en estado correcto
- `404`: Factura no encontrada
- `409`: Número de factura duplicado
- `500`: Error interno del servidor

---

## Notas de Implementación

1. **Seguridad**: Las contraseñas se almacenan con hash bcrypt
2. **Logging**: Todas las operaciones se registran para auditoría
3. **Validación**: Validación estricta de todos los datos de entrada
4. **Roles**: Sistema de roles jerárquico para control de acceso
5. **Stock**: Control automático de inventario en operaciones de producción
6. **Relaciones**: Validación de referencias entre entidades (materias primas en recetas)
7. **Facturas**: Sistema completo de gestión de facturas con flujo de aprobación y pago
8. **Estados**: Control de estados para facturas (pending → approved → paid)
9. **Cálculos**: Validación automática de cálculos financieros en facturas
