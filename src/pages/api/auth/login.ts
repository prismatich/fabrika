import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { UserModel } from '../../../models/User';
import { generateToken, createSessionCookie } from '../../../libs/middleware/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        await connectToMongoDB();
        
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
        const { email, password } = body;

        if (!email || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Email y contraseña son requeridos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const user = await UserModel.findOne({ email: email.toLowerCase() }).populate('company');

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

        // Comparar contraseña usando crypto.subtle (alternativa a bcrypt)
        const encoder = new TextEncoder();
        const passwordBuffer = encoder.encode(password);
        const passwordHash = await crypto.subtle.digest('SHA-256', passwordBuffer);
        const passwordHashHex = Array.from(new Uint8Array(passwordHash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Nota: En producción, deberías usar bcrypt o argon2 para el hash de contraseñas
        // Esta es solo una implementación básica para desarrollo
        if (passwordHashHex !== user.password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Contraseña incorrecta'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Actualizar último login
        await UserModel.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Crear token JWT y cookie
        const authUser = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.company.toString()
        };
        
        const token = generateToken(authUser);
        const sessionCookie = createSessionCookie(token);

        return new Response(JSON.stringify({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: authUser
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': sessionCookie,
            },
        });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error en la autenticación'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
