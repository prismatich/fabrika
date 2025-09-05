import type { APIRoute } from 'astro';
import { createSessionCookie, generateToken } from '../../../libs/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        const text = await request.text();
        const body = text ? JSON.parse(text) : {};
        const { name = 'Usuario Test', email = 'test@ejemplo.com', role = 'user' } = body;

        // Crear un token de prueba
        const authUser = {
            id: 'test-user-id',
            name: name,
            email: email,
            role: role
        };
        
        const token = generateToken(authUser);
        const sessionCookie = createSessionCookie(token);

        return new Response(JSON.stringify({
            success: true,
            message: 'Cookie de prueba establecida',
            user: authUser,
            cookie: sessionCookie
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': sessionCookie,
            },
        });
    } catch (error) {
        console.error('Error estableciendo cookie:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error estableciendo cookie'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
