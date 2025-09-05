import type { APIRoute } from 'astro';
import { createLogoutCookie } from '../../../libs/auth';

export const POST: APIRoute = async ({ request }) => {
    try {
        // Con JWT, el logout es simple: solo eliminamos la cookie
        // No necesitamos invalidar nada en la base de datos
        return new Response(JSON.stringify({
            success: true,
            message: 'Sesión cerrada exitosamente'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': createLogoutCookie(),
            },
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al cerrar sesión'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
