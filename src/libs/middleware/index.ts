import type { APIRoute } from 'astro';
import { withAuth, withRole } from './auth';
import { withValidation, validationSchemas } from './validation';
import { withErrorHandler, withDatabaseErrorHandler } from './errorHandler';
import { withLogging, withCRUDLogging } from './logging';

/**
 * Función para combinar múltiples middlewares
 */
export const combineMiddlewares = (...middlewares: Array<(handler: APIRoute) => APIRoute>) => {
    return (handler: APIRoute): APIRoute => {
        return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
    };
};

/**
 * Middleware estándar para operaciones CRUD con autenticación
 */
export const withStandardCRUD = (entity: string) => {
    return combineMiddlewares(
        withLogging,
        withCRUDLogging(entity),
        withAuth,
        withDatabaseErrorHandler
    );
};

/**
 * Middleware para operaciones CRUD con autenticación y validación
 */
export const withCRUDValidation = (entity: string, schema: any) => {
    return combineMiddlewares(
        withLogging,
        withCRUDLogging(entity),
        withAuth,
        withValidation(schema),
        withDatabaseErrorHandler
    );
};

/**
 * Middleware para operaciones que requieren roles específicos
 */
export const withRoleValidation = (entity: string, allowedRoles: string[], schema?: any) => {
    const middlewares = [
        withLogging,
        withCRUDLogging(entity),
        withAuth,
        withRole(allowedRoles)
    ];
    
    if (schema) {
        middlewares.push(withValidation(schema));
    }
    
    middlewares.push(withDatabaseErrorHandler);
    
    return combineMiddlewares(...middlewares);
};

/**
 * Middleware para operaciones de solo lectura (GET)
 */
export const withReadOnly = (entity: string) => {
    return combineMiddlewares(
        withLogging,
        withCRUDLogging(entity),
        withAuth,
        withDatabaseErrorHandler
    );
};

/**
 * Middleware para operaciones de escritura (POST, PUT, DELETE)
 */
export const withWriteOperation = (entity: string, schema: any, allowedRoles?: string[]) => {
    const middlewares = [
        withLogging,
        withCRUDLogging(entity),
        withAuth
    ];
    
    if (allowedRoles) {
        middlewares.push(withRole(allowedRoles));
    }
    
    middlewares.push(withValidation(schema));
    middlewares.push(withDatabaseErrorHandler);
    
    return combineMiddlewares(...middlewares);
};

// Exportar todos los middlewares individuales
export {
    withAuth,
    withRole,
    withValidation,
    withErrorHandler,
    withDatabaseErrorHandler,
    withLogging,
    withCRUDLogging,
    validationSchemas
};

// Exportar middlewares de logging en base de datos
export {
    withDatabaseLogging,
    withCRUDDatabaseLogging,
    withActionDatabaseLogging
} from './databaseLogging';