// src/libs/auth.ts
import jwt from 'jsonwebtoken';
import { UserModel, UserRole } from '../models/User';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Configuración JWT
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES_IN = '7d';

// Configuración de cookies
export const COOKIE_NAME = 'fabrika_token';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

// Generar token JWT
export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verificar token JWT
export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

// Crear cookie de sesión
export function createSessionCookie(token: string): string {
  const expires = new Date(Date.now() + COOKIE_MAX_AGE);
  const isProduction = process.env.NODE_ENV === 'production';
  
  return `${COOKIE_NAME}=${token}; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Expires=${expires.toUTCString()}`;
}

// Crear cookie de logout
export function createLogoutCookie(): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; HttpOnly; ${isProduction ? 'Secure;' : ''} SameSite=Strict; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

// Función para extraer cookies del request
export function getCookieValue(request: Request, cookieName: string): string | null {
  const cookies = request.headers.get('cookie');
  if (!cookies) return null;
  
  const cookie = cookies
    .split(';')
    .find(c => c.trim().startsWith(`${cookieName}=`));
    
  return cookie ? cookie.split('=')[1] : null;
}

// Middleware de autenticación
export async function requireAuth(request: Request): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    const token = getCookieValue(request, COOKIE_NAME);
    
    if (!token) {
      return { user: null, error: 'No se encontró cookie de sesión' };
    }

    const user = verifyToken(token);

    if (!user) {
      return { user: null, error: 'Token inválido o expirado' };
    }

    // Verificar que el usuario aún existe en la base de datos
    const dbUser = await UserModel.findById(user.id);
    if (!dbUser) {
      return { user: null, error: 'Usuario no encontrado' };
    }

    return { user };
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    return { user: null, error: 'Error interno de autenticación' };
  }
}

// Middleware de autorización por roles
export function requireRole(allowedRoles: UserRole[]) {
  return async (request: Request): Promise<{ user: AuthUser | null; error?: string }> => {
    const authResult = await requireAuth(request);
    
    if (!authResult.user) {
      return authResult;
    }

    if (!allowedRoles.includes(authResult.user.role)) {
      return { 
        user: null, 
        error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}` 
      };
    }

    return authResult;
  };
}

// Verificar si el usuario es admin
export function requireAdmin() {
  return requireRole([UserRole.ADMIN, UserRole.SUPERADMIN]);
}

// Verificar si el usuario es admin de sucursal o superior
export function requireAdminSucursal() {
  return requireRole([UserRole.ADMIN, UserRole.AdminSucursal, UserRole.SUPERADMIN]);
}

// Verificar si el usuario es superadmin
export function requireSuperAdmin() {
  return requireRole([UserRole.SUPERADMIN]);
}
