import type { APIRoute } from 'astro';

/**
 * Middleware de manejo de errores
 * Captura errores no manejados y los convierte en respuestas HTTP apropiadas
 */
export const withErrorHandler = (handler: APIRoute): APIRoute => {
    return async (context) => {
        try {
            return await handler(context);
        } catch (error) {
            console.error('Error no manejado en API:', error);
            
            // Determinar el tipo de error y el código de estado apropiado
            let status = 500;
            let message = 'Error interno del servidor';
            
            if (error instanceof Error) {
                // Errores de validación de MongoDB
                if (error.name === 'ValidationError') {
                    status = 400;
                    message = 'Error de validación de datos';
                }
                // Errores de duplicado de MongoDB
                else if (error.name === 'MongoError' && (error as any).code === 11000) {
                    status = 409;
                    message = 'El recurso ya existe';
                }
                // Errores de conexión a la base de datos
                else if (error.message.includes('connection') || error.message.includes('timeout')) {
                    status = 503;
                    message = 'Error de conexión a la base de datos';
                }
                // Errores de autenticación
                else if (error.message.includes('auth') || error.message.includes('token')) {
                    status = 401;
                    message = 'Error de autenticación';
                }
                // Errores de permisos
                else if (error.message.includes('permission') || error.message.includes('forbidden')) {
                    status = 403;
                    message = 'No tienes permisos para realizar esta acción';
                }
                // Errores de recurso no encontrado
                else if (error.message.includes('not found') || error.message.includes('no encontrado')) {
                    status = 404;
                    message = 'Recurso no encontrado';
                }
                // Errores de validación personalizados
                else if (error.message.includes('validation') || error.message.includes('validación')) {
                    status = 400;
                    message = error.message;
                }
            }
            
            return new Response(JSON.stringify({
                success: false,
                message: message,
                ...(process.env.NODE_ENV === 'development' && {
                    error: error instanceof Error ? error.message : String(error),
                    stack: error instanceof Error ? error.stack : undefined
                })
            }), {
                status: status,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
    };
};

/**
 * Middleware para manejar errores específicos de base de datos
 */
export const withDatabaseErrorHandler = (handler: APIRoute): APIRoute => {
    return withErrorHandler(async (context) => {
        try {
            return await handler(context);
        } catch (error) {
            // Errores específicos de MongoDB
            if (error instanceof Error) {
                if (error.name === 'CastError') {
                    return new Response(JSON.stringify({
                        success: false,
                        message: 'ID de recurso inválido'
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
                
                if (error.name === 'MongoError') {
                    const mongoError = error as any;
                    if (mongoError.code === 11000) {
                        // Extraer el campo duplicado del mensaje de error
                        const field = mongoError.keyPattern ? Object.keys(mongoError.keyPattern)[0] : 'campo';
                        return new Response(JSON.stringify({
                            success: false,
                            message: `Ya existe un recurso con este ${field}`
                        }), {
                            status: 409,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                    }
                }
            }
            
            // Re-lanzar el error para que sea manejado por el error handler principal
            throw error;
        }
    });
};
