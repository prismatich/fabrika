import type { APIRoute } from 'astro';
import connectToMongoDB from '../../libs/mongoose';
import { IngredienteModel } from '../../models/Ingrediente';
import { requireAuth } from '../../libs/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        await connectToMongoDB();
        
        // Verificar autenticación
        const authResult = await requireAuth(request);
        if (!authResult.user) {
            return new Response(JSON.stringify({
                success: false,
                message: authResult.error || 'No autorizado'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        
        // Obtener datos del formulario
        const text = await request.text();

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

        const body = JSON.parse(text);
        const { nombre, descripcion, proveedor, stock, categoria } = body;

        // Validar campos requeridos
        if (!nombre || !descripcion || !proveedor || !categoria) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Nombre, descripción, proveedor y categoría son requeridos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Verificar si el ingrediente ya existe
        const ingredienteExistente = await IngredienteModel.findOne({ nombre: nombre.trim() });
        if (ingredienteExistente) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Ya existe un ingrediente con este nombre'
            }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Crear nuevo ingrediente
        const nuevoIngrediente = new IngredienteModel({
            nombre: nombre.trim(),
            descripcion: descripcion.trim(),
            proveedor: proveedor.trim(),
            stock: stock || 0,
            categoria: categoria.trim()
        });

        const ingredienteGuardado = await nuevoIngrediente.save();

        return new Response(JSON.stringify({
            success: true,
            message: 'Ingrediente creado exitosamente',
            ingrediente: {
                id: ingredienteGuardado._id,
                nombre: ingredienteGuardado.nombre,
                descripcion: ingredienteGuardado.descripcion,
                proveedor: ingredienteGuardado.proveedor,
                stock: ingredienteGuardado.stock,
                categoria: ingredienteGuardado.categoria
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al crear ingrediente:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al crear ingrediente'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

export const GET: APIRoute = async () => {
    try {
        await connectToMongoDB();
        
        const ingredientes = await IngredienteModel.find({}).sort({ nombre: 1 });

        return new Response(JSON.stringify({
            success: true,
            ingredientes: ingredientes.map(ing => ({
                id: ing._id,
                nombre: ing.nombre,
                descripcion: ing.descripcion,
                proveedor: ing.proveedor,
                stock: ing.stock,
                categoria: ing.categoria,
                createdAt: (ing as any).createdAt
            }))
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al obtener ingredientes:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al obtener ingredientes'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
