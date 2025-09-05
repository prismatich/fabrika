import type { APIRoute } from 'astro';
import connectToMongoDB from '../../libs/mongoose';
import { SucursalModel } from '../../models/Sucursal';
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
        const { nombre, codigo, direccion, ciudad, pais, codigoPostal, telefono, email } = body;

        // Validar campos requeridos
        if (!nombre || !codigo || !direccion || !ciudad || !pais) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Nombre, código, dirección, ciudad y país son requeridos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Verificar si la sucursal ya existe por código
        const sucursalExistente = await SucursalModel.findOne({ codigo: codigo.trim() });
        if (sucursalExistente) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Ya existe una sucursal con este código'
            }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Crear nueva sucursal
        const nuevaSucursal = new SucursalModel({
            nombre: nombre.trim(),
            codigo: codigo.trim(),
            direccion: direccion.trim(),
            ciudad: ciudad.trim(),
            pais: pais.trim(),
            codigoPostal: codigoPostal?.trim(),
            telefono: telefono?.trim(),
            email: email?.trim()
        });

        const sucursalGuardada = await nuevaSucursal.save();

        return new Response(JSON.stringify({
            success: true,
            message: 'Sucursal creada exitosamente',
            sucursal: {
                id: sucursalGuardada._id,
                nombre: sucursalGuardada.nombre,
                codigo: sucursalGuardada.codigo,
                direccion: sucursalGuardada.direccion,
                ciudad: sucursalGuardada.ciudad,
                pais: sucursalGuardada.pais,
                codigoPostal: sucursalGuardada.codigoPostal,
                telefono: sucursalGuardada.telefono,
                email: sucursalGuardada.email,
                activa: sucursalGuardada.activa
            }
        }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al crear sucursal:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al crear sucursal'
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
        
        const sucursales = await SucursalModel.find({}).sort({ nombre: 1 });

        return new Response(JSON.stringify({
            success: true,
            sucursales: sucursales.map(suc => ({
                id: suc._id,
                nombre: suc.nombre,
                codigo: suc.codigo,
                direccion: suc.direccion,
                ciudad: suc.ciudad,
                pais: suc.pais,
                codigoPostal: suc.codigoPostal,
                telefono: suc.telefono,
                email: suc.email,
                activa: suc.activa,
                createdAt: (suc as any).createdAt
            }))
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al obtener sucursales:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al obtener sucursales'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
