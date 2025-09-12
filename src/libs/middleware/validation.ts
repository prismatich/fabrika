import type { APIRoute } from 'astro';

/**
 * Esquema de validación para campos requeridos
 */
export interface ValidationSchema {
    [key: string]: {
        required?: boolean;
        type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
        minLength?: number;
        maxLength?: number;
        min?: number;
        max?: number;
        pattern?: RegExp;
        custom?: (value: any) => string | null;
    };
}

/**
 * Middleware de validación de datos
 * Valida los datos del request según un esquema definido
 */
export const withValidation = (schema: ValidationSchema) => {
    return (handler: APIRoute): APIRoute => {
        return async (context) => {
            try {
                // Obtener datos del request
                const text = await context.request.text();
                
                if (!text || text.trim() === '') {
                    return new Response(JSON.stringify({
                        success: false,
                        message: 'No se recibieron datos'
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }

                let body;
                try {
                    body = JSON.parse(text);
                } catch (error) {
                    return new Response(JSON.stringify({
                        success: false,
                        message: 'Datos JSON inválidos'
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }

                // Validar cada campo según el esquema
                const errors: string[] = [];
                
                for (const [field, rules] of Object.entries(schema)) {
                    const value = body[field];
                    
                    // Verificar si es requerido
                    if (rules.required && (value === undefined || value === null || value === '')) {
                        errors.push(`${field} es requerido`);
                        continue;
                    }
                    
                    // Si el campo no está presente y no es requerido, continuar
                    if (value === undefined || value === null) {
                        continue;
                    }
                    
                    // Validar tipo
                    if (rules.type) {
                        const actualType = Array.isArray(value) ? 'array' : typeof value;
                        if (actualType !== rules.type) {
                            errors.push(`${field} debe ser de tipo ${rules.type}`);
                            continue;
                        }
                    }
                    
                    // Validar longitud para strings
                    if (rules.type === 'string' && typeof value === 'string') {
                        if (rules.minLength && value.length < rules.minLength) {
                            errors.push(`${field} debe tener al menos ${rules.minLength} caracteres`);
                        }
                        if (rules.maxLength && value.length > rules.maxLength) {
                            errors.push(`${field} no puede tener más de ${rules.maxLength} caracteres`);
                        }
                    }
                    
                    // Validar rango para números
                    if (rules.type === 'number' && typeof value === 'number') {
                        if (rules.min !== undefined && value < rules.min) {
                            errors.push(`${field} debe ser mayor o igual a ${rules.min}`);
                        }
                        if (rules.max !== undefined && value > rules.max) {
                            errors.push(`${field} debe ser menor o igual a ${rules.max}`);
                        }
                    }
                    
                    // Validar patrón regex
                    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
                        errors.push(`${field} no tiene el formato correcto`);
                    }
                    
                    // Validación personalizada
                    if (rules.custom) {
                        const customError = rules.custom(value);
                        if (customError) {
                            errors.push(customError);
                        }
                    }
                }
                
                // Si hay errores de validación, retornarlos
                if (errors.length > 0) {
                    return new Response(JSON.stringify({
                        success: false,
                        message: 'Errores de validación',
                        errors: errors
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }
                
                // Agregar los datos validados al contexto
                (context as any).validatedData = body;
                
                // Ejecutar el handler original
                return await handler(context);
            } catch (error) {
                console.error('Error en middleware de validación:', error);
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Error de validación'
                }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
        };
    };
};

/**
 * Esquemas de validación predefinidos para diferentes entidades
 */
export const validationSchemas = {
    // Esquema para ingredientes
    ingredient: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        description: { required: true, type: 'string' as const, minLength: 1, maxLength: 500 },
        supplier: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        stock: { required: false, type: 'number' as const, min: 0 },
        category: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 }
    },
    
    // Esquema para recetas
    recipe: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        description: { required: true, type: 'string' as const, minLength: 1, maxLength: 500 },
        instructions: { required: true, type: 'string' as const, minLength: 1, maxLength: 2000 },
        preparationTime: { required: true, type: 'number' as const, min: 1 },
        servings: { required: true, type: 'number' as const, min: 1 },
        category: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
        creator: { required: false, type: 'string' as const, maxLength: 100 },
        ingredients: { required: false, type: 'array' as const }
    },
    
    // Esquema para materias primas
    rawMaterial: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        code: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
        description: { required: true, type: 'string' as const, minLength: 1, maxLength: 500 },
        category: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
        unit: { required: true, type: 'string' as const, minLength: 1, maxLength: 20 },
        minimumStock: { required: true, type: 'number' as const, min: 0 },
        maximumStock: { required: true, type: 'number' as const, min: 0 },
        unitCost: { required: true, type: 'number' as const, min: 0 },
        unitPrice: { required: true, type: 'number' as const, min: 0 }
    },
    
    // Esquema para usuarios
    user: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        email: { 
            required: true, 
            type: 'string' as const, 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            custom: (value: string) => {
                if (!value.includes('@')) return 'Email debe ser válido';
                return null;
            }
        },
        password: { required: true, type: 'string' as const, minLength: 6 },
        role: { required: true, type: 'string' as const }
    },
    
    // Esquema para proveedores
    supplier: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        email: { 
            required: true, 
            type: 'string' as const, 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        phone: { required: true, type: 'string' as const, minLength: 1, maxLength: 20 }
    },
    
    // Esquema para clientes
    customer: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        phone: { required: true, type: 'string' as const, minLength: 1, maxLength: 20 },
        email: { 
            required: true, 
            type: 'string' as const, 
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
    },
    
    // Esquema para sucursales
    branch: {
        name: { required: true, type: 'string' as const, minLength: 1, maxLength: 100 },
        code: { required: true, type: 'string' as const, minLength: 1, maxLength: 20 },
        address: { required: true, type: 'string' as const, minLength: 1, maxLength: 200 },
        city: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 }
    },
    
    // Esquema para facturas
    invoice: {
        invoiceNumber: { required: true, type: 'string' as const, minLength: 1, maxLength: 50 },
        supplier: { required: true, type: 'string' as const, minLength: 1 },
        branch: { required: true, type: 'string' as const, minLength: 1 },
        invoiceDate: { required: true, type: 'string' as const },
        dueDate: { required: true, type: 'string' as const },
        items: { required: true, type: 'array' as const },
        subtotal: { required: true, type: 'number' as const, min: 0 },
        taxAmount: { required: false, type: 'number' as const, min: 0 },
        discountAmount: { required: false, type: 'number' as const, min: 0 },
        totalAmount: { required: true, type: 'number' as const, min: 0 },
        notes: { required: false, type: 'string' as const, maxLength: 1000 },
        paymentMethod: { required: false, type: 'string' as const, maxLength: 50 }
    }
};
