import type { APIRoute } from 'astro';
import { requireAuth } from '../../../libs/auth';

export const GET: APIRoute = async ({ request }) => {
    try {
        const authResult = await requireAuth(request);
        
        if (!authResult.user) {
            return new Response(JSON.stringify({
                success: false,
                message: authResult.error || 'No autenticado'
            }), {
                status: 401,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        return new Response(JSON.stringify({
            success: true,
            user: authResult.user
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error interno del servidor'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
