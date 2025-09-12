import type { APIRoute } from 'astro';
import connectToMongoDB from '../mongoose';
import { LogModel } from '../../models/Log';

/**
 * Middleware para logging en base de datos
 * Registra todas las operaciones de API en la base de datos
 */
export const withDatabaseLogging = (entity: string, action: string) => {
    return (handler: APIRoute): APIRoute => {
        return async (context) => {
            const startTime = Date.now();
            const method = context.request.method;
            const url = context.url;
            const userAgent = context.request.headers.get('user-agent') || 'Unknown';
            const ip = context.request.headers.get('x-forwarded-for') || 
                      context.request.headers.get('x-real-ip') || 
                      'Unknown';
            
            // Obtener información del usuario si está autenticado
            const userId = (context as any).user?.id;
            const userEmail = (context as any).user?.email;
            
            let response;
            let logLevel: 'info' | 'warning' | 'error' | 'debug' = 'info';
            let logMessage = '';
            let additionalData: Record<string, any> = {};
            
            try {
                // Ejecutar el handler original
                response = await handler(context);
                const duration = Date.now() - startTime;
                
                // Determinar el nivel de log basado en el status code
                if (response.status >= 500) {
                    logLevel = 'error';
                } else if (response.status >= 400) {
                    logLevel = 'warning';
                } else {
                    logLevel = 'info';
                }
                
                // Crear mensaje de log
                logMessage = `${method} ${url} - Status: ${response.status} - Duration: ${duration}ms`;
                
                // Agregar datos adicionales
                additionalData = {
                    method,
                    url,
                    status: response.status,
                    duration: `${duration}ms`,
                    userAgent,
                    ip,
                    timestamp: new Date().toISOString()
                };
                
                // Si hay parámetros de ruta, agregarlos
                if ((context as any).params?.id) {
                    additionalData.entityId = (context as any).params.id;
                }
                
                // Si hay datos validados, agregar información relevante
                if ((context as any).validatedData) {
                    const validatedData = (context as any).validatedData;
                    additionalData.dataKeys = Object.keys(validatedData);
                    
                    // Para operaciones de creación, agregar el nombre/código si existe
                    if (action === 'create' && validatedData.name) {
                        additionalData.entityName = validatedData.name;
                    }
                    if (action === 'create' && validatedData.code) {
                        additionalData.entityCode = validatedData.code;
                    }
                    if (action === 'create' && validatedData.invoiceNumber) {
                        additionalData.invoiceNumber = validatedData.invoiceNumber;
                    }
                }
                
            } catch (error) {
                const duration = Date.now() - startTime;
                logLevel = 'error';
                logMessage = `${method} ${url} - ERROR - Duration: ${duration}ms - ${error instanceof Error ? error.message : String(error)}`;
                
                additionalData = {
                    method,
                    url,
                    error: error instanceof Error ? error.message : String(error),
                    duration: `${duration}ms`,
                    userAgent,
                    ip,
                    timestamp: new Date().toISOString()
                };
                
                // Re-lanzar el error
                throw error;
            }
            
            // Guardar el log en la base de datos
            try {
                await connectToMongoDB();
                
                const logEntry = new LogModel({
                    level: logLevel,
                    message: logMessage,
                    module: entity,
                    action: action,
                    user: userId,
                    entity: (context as any).params?.id ? {
                        type: entity,
                        id: (context as any).params.id
                    } : undefined,
                    additionalData: additionalData,
                    ip: ip,
                    userAgent: userAgent
                });
                
                await logEntry.save();
                
            } catch (logError) {
                // No fallar la operación principal si el logging falla
                console.error('Error al guardar log en base de datos:', logError);
            }
            
            return response;
        };
    };
};

/**
 * Middleware específico para operaciones CRUD
 */
export const withCRUDDatabaseLogging = (entity: string) => {
    return (handler: APIRoute): APIRoute => {
        return async (context) => {
            const method = context.request.method;
            let action = '';
            
            // Determinar la acción basada en el método HTTP
            switch (method) {
                case 'GET':
                    action = context.params?.id ? 'read' : 'list';
                    break;
                case 'POST':
                    action = 'create';
                    break;
                case 'PUT':
                case 'PATCH':
                    action = 'update';
                    break;
                case 'DELETE':
                    action = 'delete';
                    break;
                default:
                    action = 'unknown';
            }
            
            return await withDatabaseLogging(entity, action)(handler)(context);
        };
    };
};

/**
 * Middleware para operaciones específicas (aprobar, pagar, etc.)
 */
export const withActionDatabaseLogging = (entity: string, action: string) => {
    return (handler: APIRoute): APIRoute => {
        return withDatabaseLogging(entity, action)(handler);
    };
};
