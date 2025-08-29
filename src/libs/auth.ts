// src/libs/auth.ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectToMongoDB from './mongose.ts';
import { User } from '../models/User.ts';

// Configuración
const SALT_ROUNDS = 12;
const JWT_ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'contraseña que pondria andres y que josue no adivina';
const JWT_REFRESH_TOKEN_SECRET = JWT_ACCESS_TOKEN_SECRET + 'otra clave';
const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

// Configuración de cookies
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', 
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días en milisegundos
};

const ACCESS_COOKIE_OPTIONS = {
  ...COOKIE_OPTIONS,
  maxAge: 15 * 60 * 1000, // 15 minutos en milisegundos
};

// Interfaces
export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export interface JWTPayload extends UserPayload {
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  id: string;
  iat: number;
  exp: number;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

// Clase para manejo de cookies
export class CookieUtils {
  static setAccessTokenCookie(response: Response, token: string): void {
    const cookieValue = `accessToken=${token}; Max-Age=${15 * 60}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    response.headers.set('Set-Cookie', cookieValue);
  }

  static setRefreshTokenCookie(response: Response, token: string): void {
    const cookieValue = `refreshToken=${token}; Max-Age=${7 * 24 * 60 * 60}; Path=/; HttpOnly; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
    response.headers.set('Set-Cookie', cookieValue);
  }

  static clearTokensCookies(response: Response): void {
    const clearAccessCookie = 'accessToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
    const clearRefreshCookie = 'refreshToken=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict';
    
    response.headers.set('Set-Cookie', [clearAccessCookie, clearRefreshCookie].join(', '));
  }

  static getTokenFromCookies(request: Request): { accessToken?: string; refreshToken?: string } {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return {};

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);

    return {
      accessToken: cookies.accessToken,
      refreshToken: cookies.refreshToken
    };
  }

  static setTokensCookies(response: Response, tokens: TokenResponse): void {
    this.setAccessTokenCookie(response, tokens.accessToken);
    this.setRefreshTokenCookie(response, tokens.refreshToken);
  }

  // Método mejorado para verificar si existe un access token válido en las cookies
  static async verifyAccessTokenFromCookies(request: Request): Promise<{
    isValid: boolean;
    user?: UserPayload;
    error?: string;
  }> {
    try {
      const { accessToken } = this.getTokenFromCookies(request);
      
      if (!accessToken) {
        return {
          isValid: false,
          error: 'No se encontró access token en las cookies'
        };
      }

      // Verificar el token
      const decoded = TokenUtils.verifyAccessToken(accessToken);
      
      return {
        isValid: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name
        }
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Token inválido o expirado'
      };
    }
  }
}

// bcrypt
export class PasswordUtils {

  static async hashPassword(password: string): Promise<string> {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      return hashedPassword;
    } catch (error) {
      console.error('Error hasheando contraseña:', error);
      throw new Error('Error procesando contraseña');
    }
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(password, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error comparando contraseña:', error);
      throw new Error('Error verificando contraseña');
    }
  }
}

// Clase mejorada para manejo de tokens
export class TokenUtils {
  static generateAccessToken(user: UserPayload): string {
    try {
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name
        },
        JWT_ACCESS_TOKEN_SECRET,
        { 
          expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN
        }
      );
      return accessToken;
    } catch (error) {
      console.error('Error generando access token:', error);
      throw new Error('Error generando access token de autenticación');
    }
  }

  static generateRefreshToken(user: UserPayload): string {
    try {
      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_TOKEN_SECRET,
        { 
          expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN
        }
      );
      return refreshToken;
    } catch (error) {
      console.error('Error generando refresh token:', error);
      throw new Error('Error generando refresh token');
    }
  }

  static generateTokenPair(user: UserPayload): TokenResponse {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
      refreshExpiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN
    };
  }

  static verifyAccessToken(accessToken: string): JWTPayload {
    try {
      const decoded = jwt.verify(accessToken, JWT_ACCESS_TOKEN_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Access token inválido');
      } else {
        console.error('Error verificando access token:', error);
        throw new Error('Error verificando access token');
      }
    }
  }

  static verifyRefreshToken(refreshToken: string): RefreshTokenPayload {
    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expirado');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Refresh token inválido');
      } else {
        console.error('Error verificando refresh token:', error);
        throw new Error('Error verificando refresh token');
      }
    }
  }

  static extractAccessTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      return parts[1];
    }
    
    return null;
  }

  static extractRefreshTokenFromHeader(authHeader: string | null): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length === 2 && parts[0] === 'Refresh') {
      return parts[1];
    }
    
    return null;
  }
}

// Middleware mejorado con la renovacion de token usando cookies
export class AuthMiddleware {
  // Método simple para verificar autenticación sin renovar tokens
  static async isAuthenticated(request: Request): Promise<{
    isAuthenticated: boolean;
    user?: UserPayload;
    error?: string;
  }> {
    try {
      const { accessToken } = CookieUtils.getTokenFromCookies(request);
      
      if (!accessToken) {
        return {
          isAuthenticated: false,
          error: 'No se encontró access token'
        };
      }

      const decoded = TokenUtils.verifyAccessToken(accessToken);
      
      return {
        isAuthenticated: true,
        user: {
          id: decoded.id,
          email: decoded.email,
          name: decoded.name
        }
      };

    } catch (error) {
      return {
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Token inválido'
      };
    }
  }

  static async requireAuth(request: Request): Promise<{ 
    user: UserPayload; 
    newTokens?: TokenResponse;
  } | { 
    error: string; 
    status: number;
    shouldRefresh?: boolean; 
  }> {
    try {
      // Obtener tokens de las cookies
      const { accessToken, refreshToken } = CookieUtils.getTokenFromCookies(request);
      
      if (!accessToken) {
        return {
          error: 'Access token de autenticación requerido',
          status: 401
        };
      }

      try {
        // Verificar el access token
        const decoded = TokenUtils.verifyAccessToken(accessToken);
        
        return {
          user: {
            id: decoded.id,
            email: decoded.email,
            name: decoded.name
          }
        };

      } catch (error) {
        // Si el access token expiró y tenemos refresh token, intentar renovarlo
        if (error instanceof Error && error.message === 'Access token expirado' && refreshToken) {
          console.log('🔄 Access token expirado, intentando renovar con refresh token...');
          
          const refreshResult = await this.refreshAccessToken(refreshToken);
          
          if (refreshResult.success && refreshResult.user) {
            console.log('✅ Tokens renovados exitosamente');
            return {
              user: refreshResult.user,
              newTokens: refreshResult.tokens
            };
          } else {
            console.log('❌ Error renovando tokens:', refreshResult.error);
            return {
              error: 'Sesión expirada, por favor inicie sesión nuevamente',
              status: 401,
              shouldRefresh: true
            };
          }
        }
        
        // Si es otro tipo de error
        console.log('❌ Error verificando access token:', error);
        return {
          error: error instanceof Error ? error.message : 'Error de autenticación',
          status: 401
        };
      }

    } catch (error) {
      console.error('❌ Error general en autenticación:', error);
      return {
        error: error instanceof Error ? error.message : 'Error de autenticación',
        status: 401
      };
    }
  }

  static async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    user?: UserPayload;
    tokens?: TokenResponse;
    error?: string;
  }> {
    try {
      await connectToMongoDB();
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      
      if (!user || user.refreshToken !== refreshToken) {
        return {
          success: false,
          error: 'Refresh token no válido'
        };
      }

      const userPayload = {
        id: user._id.toString(),
        email: user.email,
        name: user.name
      };

      const newTokens = TokenUtils.generateTokenPair(userPayload);
      user.refreshToken = newTokens.refreshToken;
      await user.save();

      return {
        success: true,
        user: userPayload,
        tokens: newTokens
      };

    } catch (error) {
      console.error('Error renovando access token:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error renovando token'
      };
    }
  }

  static async validateRefreshToken(refreshToken: string): Promise<{
    success: boolean;
    user?: UserPayload;
    error?: string;
  }> {
    try {
      await connectToMongoDB();
      
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);
      
      if (!user || user.refreshToken !== refreshToken) {
        return {
          success: false,
          error: 'Refresh token no válido'
        };
      }

      return {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error validando refresh token'
      };
    }
  }
}
