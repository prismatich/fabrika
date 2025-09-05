import type { APIRoute } from 'astro';
import connectToMongoDB from '../../libs/mongoose';
import { ProveedorModel } from '../../models/Proveedor';
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
        const { nombre, email, telefono, direccion, ciudad, pais, codigoPostal } = body;

        // Validar campos requeridos
        if (!nombre || !email || !telefono) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Nombre, email y teléfono son requeridos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Verificar si el proveedor ya existe por email
        const proveedorExistente = await ProveedorModel.findOne({ email: email.toLowerCase() });
        if (proveedorExistente) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Ya existe un proveedor con este email'
            }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Crear nuevo proveedor
        const nuevoProveedor = new ProveedorModel({
            nombre: nombre.trim(),
            email: email.toLowerCase().trim(),
            telefono: telefono.trim(),
            direccion: direccion?.trim(),
            ciudad: ciudad?.trim(),
            pais: pais?.trim(),
            codigoPostal: codigoPostal?.trim()
        });

        const proveedorGuardado = await nuevoProveedor.save();

        return new Response(JSON.stringify({
            success: true,
            message: 'Proveedor creado exitosamente',
            proveedor: {
                id: proveedorGuardado._id,
                nombre: proveedorGuardado.nombre,
                email: proveedorGuardado.email,
                telefono: proveedorGuardado.telefono,
                direccion: proveedorGuardado.direccion,
                ciudad: proveedorGuardado.ciudad,
                pais: proveedorGuardado.pais,
                codigoPostal: proveedorGuardado.codigoPostal,
                activo: proveedorGuardado.activo
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al crear proveedor'
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
        
        const proveedores = await ProveedorModel.find({}).sort({ nombre: 1 });

        return new Response(JSON.stringify({
            success: true,
            proveedores: proveedores.map(prov => ({
                id: prov._id,
                nombre: prov.nombre,
                email: prov.email,
                telefono: prov.telefono,
                direccion: prov.direccion,
                ciudad: prov.ciudad,
                pais: prov.pais,
                codigoPostal: prov.codigoPostal,
                activo: prov.activo,
                createdAt: (prov as any).createdAt
            }))
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al obtener proveedores'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
