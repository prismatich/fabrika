import fetch from 'node-fetch';

// Función para simular el login y obtener cookies
async function loginAndGetCookies(email, password) {
    const loginResponse = await fetch('http://localhost:4321/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });

    const loginData = await loginResponse.json();

    if (loginData.success) {
        console.log('✅ Login exitoso!');
        // Extraer la cookie 'fabrika_token' del encabezado 'Set-Cookie'
        const setCookieHeader = loginResponse.headers.get('set-cookie');
        if (setCookieHeader) {
            const cookies = setCookieHeader.split(';').map(c => c.trim());
            const fabrikaTokenCookie = cookies.find(c => c.startsWith('fabrika_token='));
            if (fabrikaTokenCookie) {
                return fabrikaTokenCookie; // Retorna la cookie completa
            }
        }
    } else {
        console.log('❌ Error en login:', loginData.message);
    }
    return null;
}

// Función para probar una API con la cookie de autenticación
async function testApi(url, cookie) {
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (cookie) {
            headers['Cookie'] = cookie;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
        });

        const data = await response.json();
        if (response.ok && data.success) {
            console.log(`✅ API ${url} exitosa!`);
            console.log(`📊 Datos encontrados: ${data.customers?.length || data.suppliers?.length || data.branches?.length || 0}`);
            if (data.customers) console.log(`   - Clientes: ${data.customers.length}`);
            if (data.suppliers) console.log(`   - Proveedores: ${data.suppliers.length}`);
            if (data.branches) console.log(`   - Sucursales: ${data.branches.length}`);
        } else {
            console.log(`❌ Error en API ${url}: ${response.status}`);
            console.log(data); // Mostrar el mensaje de error de la API
        }
    } catch (error) {
        console.error(`❌ Error al llamar a la API ${url}:`, error);
    }
}

async function runTests() {
    console.log('🧪 Probando el login...');
    const authCookie = await loginAndGetCookies('admin@test.com', 'admin123');

    if (authCookie) {
        console.log('🧪 Probando API de clientes...');
        await testApi('http://localhost:4321/api/customers', authCookie);

        console.log('🧪 Probando API de proveedores...');
        await testApi('http://localhost:4321/api/suppliers', authCookie);

        console.log('🧪 Probando API de sucursales...');
        await testApi('http://localhost:4321/api/branches', authCookie);
    } else {
        console.log('No se pudo obtener la cookie de autenticación. Las pruebas de API no se ejecutarán.');
    }
    console.log('🎉 Pruebas completadas!');
}

runTests();