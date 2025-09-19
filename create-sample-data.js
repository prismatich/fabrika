import mongoose from 'mongoose';
import crypto from 'crypto';

// Función para hashear la contraseña (usando SHA-256 para desarrollo)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Esquemas
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'manager', 'employee'], 
        default: 'employee' 
    },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    lastLogin: { type: Date },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    taxId: { type: String },
    subscriptionStatus: { 
        type: String, 
        enum: ['active', 'inactive', 'expired', 'cancelled'], 
        default: 'active' 
    },
    subscriptionStartDate: { type: Date },
    subscriptionEndDate: { type: Date },
    subscriptionAmount: { type: Number },
    subscriptionCurrency: { type: String, default: 'USD' },
    paymentStatus: { 
        type: String, 
        enum: ['paid', 'pending', 'failed', 'refunded'], 
        default: 'paid' 
    },
    lastPaymentDate: { type: Date },
    nextPaymentDate: { type: Date },
    paymentReference: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    taxId: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const supplierSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    country: { type: String },
    taxId: { type: String },
    contactPerson: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    manager: { type: String },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Company = mongoose.model('Company', companySchema);
const Customer = mongoose.model('Customer', customerSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Branch = mongoose.model('Branch', branchSchema);

async function createSampleData() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/testing');
        console.log('✅ Conectado a MongoDB');

        // Crear o encontrar empresa principal
        let company = await Company.findOne({ email: 'admin@fabrika.com' });
        if (!company) {
            company = new Company({
                name: 'Fabrika S.A.',
                email: 'admin@fabrika.com',
                phone: '+1234567890',
                address: 'Av. Principal 123',
                city: 'Ciudad Principal',
                country: 'México',
                taxId: 'FAB123456789',
                subscriptionStatus: 'active',
                subscriptionStartDate: new Date(),
                subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                subscriptionAmount: 199.99,
                subscriptionCurrency: 'MXN',
                paymentStatus: 'paid',
                lastPaymentDate: new Date(),
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                paymentReference: 'FAB2024001',
                active: true
            });
            await company.save();
            console.log('✅ Empresa creada:', company.name);
        } else {
            console.log('⚠️ Empresa ya existe:', company.name);
        }

        // Crear usuarios (manejar duplicados)
        const users = [
            {
                name: 'Administrador',
                email: 'admin@test.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                name: 'Gerente General',
                email: 'gerente@test.com',
                password: 'gerente123',
                role: 'manager'
            },
            {
                name: 'Empleado Ventas',
                email: 'ventas@test.com',
                password: 'ventas123',
                role: 'employee'
            }
        ];

        for (const userData of users) {
            try {
                const existingUser = await User.findOne({ email: userData.email });
                if (existingUser) {
                    console.log(`⚠️ Usuario ya existe: ${userData.name} (${userData.email})`);
                } else {
                    const user = new User({
                        ...userData,
                        password: hashPassword(userData.password),
                        company: company._id,
                        lastLogin: new Date(),
                        active: true
                    });
                    await user.save();
                    console.log(`✅ Usuario creado: ${userData.name} (${userData.email})`);
                }
            } catch (error) {
                if (error.code === 11000) {
                    console.log(`⚠️ Usuario ya existe: ${userData.name} (${userData.email})`);
                } else {
                    throw error;
                }
            }
        }

        // Crear clientes
        const customers = [
            {
                name: 'Restaurante El Buen Sabor',
                email: 'pedidos@elbuensabor.com',
                phone: '+52 55 1234 5678',
                address: 'Calle Comida 456',
                city: 'Ciudad de México',
                country: 'México',
                taxId: 'RBS987654321'
            },
            {
                name: 'Cafetería Central',
                email: 'compras@cafeteriacentral.com',
                phone: '+52 55 2345 6789',
                address: 'Av. Central 789',
                city: 'Guadalajara',
                country: 'México',
                taxId: 'CC876543210'
            },
            {
                name: 'Panadería La Tradición',
                email: 'ventas@latradicion.com',
                phone: '+52 55 3456 7890',
                address: 'Plaza Principal 321',
                city: 'Monterrey',
                country: 'México',
                taxId: 'PT765432109'
            },
            {
                name: 'Hotel Gran Vista',
                email: 'compras@granvista.com',
                phone: '+52 55 4567 8901',
                address: 'Boulevard Turístico 654',
                city: 'Cancún',
                country: 'México',
                taxId: 'HGV654321098'
            },
            {
                name: 'Catering Elegante',
                email: 'pedidos@elegante.com',
                phone: '+52 55 5678 9012',
                address: 'Zona Industrial 987',
                city: 'Puebla',
                country: 'México',
                taxId: 'CE543210987'
            }
        ];

        for (const customerData of customers) {
            const customer = new Customer({
                ...customerData,
                company: company._id,
                active: true
            });
            await customer.save();
            console.log(`✅ Cliente creado: ${customerData.name}`);
        }

        // Crear proveedores
        const suppliers = [
            {
                name: 'Distribuidora de Granos del Norte',
                email: 'ventas@distribuidora-norte.com',
                phone: '+52 55 6789 0123',
                address: 'Carretera Norte Km 15',
                city: 'Tijuana',
                country: 'México',
                taxId: 'DGN432109876',
                contactPerson: 'Carlos Mendoza'
            },
            {
                name: 'Proveedora de Especias Exóticas',
                email: 'pedidos@especias-exoticas.com',
                phone: '+52 55 7890 1234',
                address: 'Mercado de Abastos Local 45',
                city: 'Oaxaca',
                country: 'México',
                taxId: 'PEE321098765',
                contactPerson: 'María González'
            },
            {
                name: 'Carnes Premium del Sur',
                email: 'compras@carnes-premium.com',
                phone: '+52 55 8901 2345',
                address: 'Rastro Municipal Módulo 12',
                city: 'Mérida',
                country: 'México',
                taxId: 'CPS210987654',
                contactPerson: 'Roberto Silva'
            },
            {
                name: 'Lácteos Frescos del Valle',
                email: 'ventas@lacteos-frescos.com',
                phone: '+52 55 9012 3456',
                address: 'Rancho El Valle S/N',
                city: 'León',
                country: 'México',
                taxId: 'LFV109876543',
                contactPerson: 'Ana Rodríguez'
            },
            {
                name: 'Importadora de Productos Gourmet',
                email: 'pedidos@gourmet-imports.com',
                phone: '+52 55 0123 4567',
                address: 'Puerto de Veracruz Muelle 3',
                city: 'Veracruz',
                country: 'México',
                taxId: 'IPG098765432',
                contactPerson: 'Luis Fernández'
            }
        ];

        for (const supplierData of suppliers) {
            const supplier = new Supplier({
                ...supplierData,
                company: company._id,
                active: true
            });
            await supplier.save();
            console.log(`✅ Proveedor creado: ${supplierData.name}`);
        }

        // Crear sucursales
        const branches = [
            {
                name: 'Sucursal Centro',
                address: 'Av. Principal 123',
                city: 'Ciudad de México',
                country: 'México',
                phone: '+52 55 1111 1111',
                email: 'centro@fabrika.com',
                manager: 'Carlos López'
            },
            {
                name: 'Sucursal Norte',
                address: 'Blvd. del Norte 456',
                city: 'Monterrey',
                country: 'México',
                phone: '+52 81 2222 2222',
                email: 'norte@fabrika.com',
                manager: 'María García'
            },
            {
                name: 'Sucursal Sur',
                address: 'Av. del Sur 789',
                city: 'Guadalajara',
                country: 'México',
                phone: '+52 33 3333 3333',
                email: 'sur@fabrika.com',
                manager: 'José Martínez'
            },
            {
                name: 'Sucursal Este',
                address: 'Calle del Este 321',
                city: 'Puebla',
                country: 'México',
                phone: '+52 222 4444 4444',
                email: 'este@fabrika.com',
                manager: 'Ana Hernández'
            },
            {
                name: 'Sucursal Oeste',
                address: 'Boulevard del Oeste 654',
                city: 'Tijuana',
                country: 'México',
                phone: '+52 664 5555 5555',
                email: 'oeste@fabrika.com',
                manager: 'Pedro Sánchez'
            }
        ];

        for (const branchData of branches) {
            const branch = new Branch({
                ...branchData,
                company: company._id,
                active: true
            });
            await branch.save();
            console.log(`✅ Sucursal creada: ${branchData.name}`);
        }

        console.log('\n🎉 ¡Datos de muestra creados exitosamente!');
        console.log('\n📊 Resumen:');
        console.log(`- 1 Empresa: ${company.name}`);
        console.log(`- 3 Usuarios (admin, gerente, empleado)`);
        console.log(`- 5 Clientes`);
        console.log(`- 5 Proveedores`);
        console.log(`- 5 Sucursales`);

        console.log('\n🔑 Credenciales de acceso:');
        console.log('Admin: admin@test.com / admin123');
        console.log('Gerente: gerente@test.com / gerente123');
        console.log('Empleado: ventas@test.com / ventas123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
    }
}

// Ejecutar si se llama directamente
createSampleData();

export { createSampleData, User, Company, Customer, Supplier, Branch, hashPassword };
