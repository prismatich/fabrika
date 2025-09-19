import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { UserModel } from '../../../models/User';
import { verifyToken } from '../../../libs/middleware/auth';

export const GET: APIRoute = async ({ request }) => {
    try {
        await connectToMongoDB();
        
        // Obtener el token de la cookie
        const cookieHeader = request.headers.get('cookie');
        if (!cookieHeader) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No se encontró token de sesión'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Extraer el token de la cookie
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.trim().split('=');
            acc[key] = value;
            return acc;
        }, {} as Record<string, string>);

        const token = cookies['fabrika_token'];
        if (!token) {
            return new Response(JSON.stringify({
                success: false,
                message: 'No se encontró token de sesión'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Verificar el token
        const decoded = verifyToken(token);
        if (!decoded) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Token inválido'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Buscar el usuario en la base de datos
        const user = await UserModel.findById(decoded.id).populate('company');
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Usuario no encontrado'
            }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Retornar información del usuario
        const authUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company ? user.company.toString() : null,
            company: user.company
        };

        return new Response(JSON.stringify({
            success: true,
            user: authUser
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error al verificar autenticación:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al verificar autenticación'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
