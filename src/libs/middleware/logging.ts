import type { APIRoute } from 'astro';

/**
 * Middleware de logging
 * Registra información sobre las peticiones HTTP para debugging y monitoreo
 */
export const withLogging = (handler: APIRoute): APIRoute => {
    return async (context) => {
        const startTime = Date.now();
        const method = context.request.method;
        const url = context.url;
        const userAgent = context.request.headers.get('user-agent') || 'Unknown';
        const ip = context.request.headers.get('x-forwarded-for') || 
                  context.request.headers.get('x-real-ip') || 
                  'Unknown';
        
        // Obtener información del usuario si está autenticado
        const userId = (context as any).user?.id || 'Anonymous';
        
        console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip} - User: ${userId} - UserAgent: ${userAgent}`);
        
        try {
            const response = await handler(context);
            const duration = Date.now() - startTime;
            
            console.log(`[${new Date().toISOString()}] ${method} ${url} - Status: ${response.status} - Duration: ${duration}ms`);
            
            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(`[${new Date().toISOString()}] ${method} ${url} - ERROR - Duration: ${duration}ms - Error: ${error instanceof Error ? error.message : String(error)}`);
            
            throw error;
        }
    };
};

/**
 * Middleware de logging detallado para operaciones de base de datos
 */
export const withDatabaseLogging = (operation: string) => {
    return (handler: APIRoute): APIRoute => {
        return async (context) => {
            const startTime = Date.now();
            const method = context.request.method;
            const url = context.url;
            
            console.log(`[DB-${operation}] Iniciando ${method} ${url} - ${new Date().toISOString()}`);
            
            try {
                const response = await handler(context);
                const duration = Date.now() - startTime;
                
                console.log(`[DB-${operation}] Completado ${method} ${url} - Status: ${response.status} - Duration: ${duration}ms`);
                
                return response;
            } catch (error) {
                const duration = Date.now() - startTime;
                console.error(`[DB-${operation}] Error en ${method} ${url} - Duration: ${duration}ms - Error: ${error instanceof Error ? error.message : String(error)}`);
                
                throw error;
            }
        };
    };
};

/**
 * Middleware para logging de operaciones CRUD específicas
 */
export const withCRUDLogging = (entity: string) => {
    return (handler: APIRoute): APIRoute => {
        return withDatabaseLogging(`${entity.toUpperCase()}-CRUD`)(handler);
    };
};
