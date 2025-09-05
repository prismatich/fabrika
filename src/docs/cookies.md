# Sistema de Cookies - Documentación

## Descripción
Sistema de autenticación basado en cookies HTTP-only con JWT para máxima seguridad.

## Características de las Cookies

### Configuración de Seguridad
- **HttpOnly**: No accesible desde JavaScript (previene XSS)
- **Secure**: Solo se envía sobre HTTPS en producción
- **SameSite=Strict**: Protección contra ataques CSRF
- **Path=/**: Disponible en toda la aplicación
- **Expires**: 7 días de duración

### Nombre de la Cookie
```
fabrika_token
```

## Endpoints de Cookies

### 1. Establecer Cookie de Prueba
**POST** `/api/auth/set-cookie`

Establece una cookie de prueba para testing.

**Request Body (opcional):**
```json
{
  "name": "Usuario Test",
  "email": "test@ejemplo.com", 
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cookie de prueba establecida",
  "user": {
    "id": "test-user-id",
    "name": "Usuario Test",
    "email": "test@ejemplo.com",
    "role": "user"
  },
  "cookie": "fabrika_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Verificar Estado de Cookies
**GET** `/api/auth/cookie-test`

Muestra el estado actual de todas las cookies.

**Response:**
```json
{
  "success": true,
  "message": "Estado de las cookies",
  "data": {
    "allCookies": "fabrika_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "parsedCookies": [
      {
        "name": "fabrika_token",
        "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    ],
    "authCookie": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "authCookieName": "fabrika_token",
    "hasAuthCookie": true
  }
}
```

### 3. Login (Establece Cookie)
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "user_id",
    "name": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "role": "user"
  }
}
```

### 4. Logout (Elimina Cookie)
**POST** `/api/auth/logout`

**Response:**
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

### 5. Verificar Autenticación
**GET** `/api/auth/me`

**Response (autenticado):**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "Nombre Usuario",
    "email": "usuario@ejemplo.com",
    "role": "user"
  }
}
```

**Response (no autenticado):**
```json
{
  "success": false,
  "message": "No se encontró cookie de sesión"
}
```

## Uso en el Frontend

### JavaScript/TypeScript
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  // La cookie se establece automáticamente
  return data;
};

// Verificar autenticación
const checkAuth = async () => {
  const response = await fetch('/api/auth/me');
  const data = await response.json();
  return data.success ? data.user : null;
};

// Logout
const logout = async () => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST'
  });
  // La cookie se elimina automáticamente
  return response.json();
};

// Verificar cookies
const checkCookies = async () => {
  const response = await fetch('/api/auth/cookie-test');
  return response.json();
};
```

### React Hook de ejemplo
```javascript
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  return { user, loading, login, logout, checkAuth };
};
```

## Configuración de Entorno

### Variables de Entorno
```env
# .env
JWT_SECRET=tu-secreto-super-seguro-cambiar-en-produccion
MONGODB_URI=mongodb://localhost:27017/fabrika
NODE_ENV=development
```

### Producción
En producción, las cookies se configuran automáticamente con:
- `Secure` flag habilitado
- Solo HTTPS
- Configuración de seguridad máxima

## Debugging

### Verificar Cookies en el Navegador
1. Abrir DevTools (F12)
2. Ir a Application/Storage > Cookies
3. Buscar `fabrika_token`

### Endpoint de Debug
Usar `/api/auth/cookie-test` para ver el estado completo de las cookies.

### Logs del Servidor
Los errores de autenticación se registran en la consola del servidor.

## Seguridad

1. **HttpOnly**: Previene acceso desde JavaScript malicioso
2. **Secure**: Solo se envía sobre conexiones seguras
3. **SameSite=Strict**: Previene ataques CSRF
4. **JWT Firmado**: Tokens verificables criptográficamente
5. **Expiración**: Tokens expiran automáticamente
6. **Validación**: Verificación de usuario en base de datos
