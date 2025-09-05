import type { APIRoute } from 'astro';
import { getCookieValue, COOKIE_NAME } from '../../../libs/auth';

export const GET: APIRoute = async ({ request }) => {
    try {
        // Obtener todas las cookies del request
        const allCookies = request.headers.get('cookie') || '';
        
        // Extraer la cookie de autenticación específica
        const authCookie = getCookieValue(request, COOKIE_NAME);
        
        // Parsear todas las cookies para mostrar
        const cookies = allCookies.split(';').map(cookie => {
            const [name, value] = cookie.trim().split('=');
            return { name, value: value || '' };
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Estado de las cookies',
            data: {
                allCookies: allCookies,
                parsedCookies: cookies,
                authCookie: authCookie,
                authCookieName: COOKIE_NAME,
                hasAuthCookie: !!authCookie
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error verificando cookies:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error verificando cookies'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
