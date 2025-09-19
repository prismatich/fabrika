import mongoose from 'mongoose';
import crypto from 'crypto';

// Función para hashear la contraseña
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Esquemas simplificados para crear datos de prueba
const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: 'México' },
    taxId: { type: String },
    subscriptionStatus: { type: String, default: 'active' },
    subscriptionStartDate: { type: Date, default: Date.now },
    subscriptionEndDate: { type: Date },
    subscriptionAmount: { type: Number, default: 0 },
    subscriptionCurrency: { type: String, default: 'MXN' },
    paymentStatus: { type: String, default: 'paid' },
    lastPaymentDate: { type: Date, default: Date.now },
    nextPaymentDate: { type: Date },
    paymentReference: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin', 'adminSucursal', 'superadmin'], default: 'user' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    lastLogin: { type: Date },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const customerSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String },
    birthDate: { type: Date },
    gender: { type: String, enum: ['M', 'F', 'O'] },
    active: { type: Boolean, default: true },
    preferences: { type: String },
    notes: { type: String }
}, { timestamps: true });

const supplierSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    city: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const branchSchema = new mongoose.Schema({
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    active: { type: Boolean, default: true }
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Supplier = mongoose.model('Supplier', supplierSchema);
const Branch = mongoose.model('Branch', branchSchema);

async function createTestData() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/testing');
        console.log('✅ Conectado a MongoDB');

        // Limpiar datos existentes
        await Customer.deleteMany({});
        await Supplier.deleteMany({});
        await Branch.deleteMany({});
        await User.deleteMany({});
        await Company.deleteMany({});
        console.log('🧹 Datos existentes eliminados');

        // Crear empresa
        const company = new Company({
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

        // Crear usuario admin
        const user = new User({
            name: 'Administrador',
            email: 'admin@test.com',
            password: hashPassword('admin123'),
            role: 'admin',
            company: company._id,
            lastLogin: new Date(),
            active: true
        });

        await user.save();
        console.log('✅ Usuario creado:', user.name);

        // Crear clientes
        const customers = [
            {
                name: 'Carlos Flores',
                phone: '+1234567890',
                email: 'carlos.flores@email.com',
                address: 'Calle Principal 123',
                birthDate: new Date('1990-05-15'),
                gender: 'M',
                preferences: 'Productos orgánicos',
                notes: 'Cliente frecuente'
            },
            {
                name: 'María García',
                phone: '+1234567891',
                email: 'maria.garcia@email.com',
                address: 'Avenida Central 456',
                birthDate: new Date('1985-08-22'),
                gender: 'F',
                preferences: 'Productos sin gluten',
                notes: 'Nueva cliente'
            },
            {
                name: 'Juan Pérez',
                phone: '+1234567892',
                email: 'juan.perez@email.com',
                address: 'Calle Secundaria 789',
                birthDate: new Date('1992-12-10'),
                gender: 'M',
                preferences: 'Productos veganos',
                notes: 'Cliente VIP'
            }
        ];

        for (const customerData of customers) {
            const customer = new Customer({
                ...customerData,
                company: company._id,
                active: true
            });
            await customer.save();
        }
        console.log('✅ Clientes creados');

        // Crear proveedores
        const suppliers = [
            {
                name: 'Proveedor Norte S.A.',
                email: 'contacto@proveedornorte.com',
                phone: '+9876543210',
                address: 'Zona Industrial Norte',
                city: 'Ciudad Norte'
            },
            {
                name: 'Distribuidora Central',
                email: 'ventas@distribuidoracentral.com',
                phone: '+9876543211',
                address: 'Parque Industrial Central',
                city: 'Ciudad Central'
            },
            {
                name: 'Suministros del Sur',
                email: 'info@suministrosdelsur.com',
                phone: '+9876543212',
                address: 'Complejo Industrial Sur',
                city: 'Ciudad Sur'
            }
        ];

        for (const supplierData of suppliers) {
            const supplier = new Supplier({
                ...supplierData,
                company: company._id,
                active: true
            });
            await supplier.save();
        }
        console.log('✅ Proveedores creados');

        // Crear sucursales
        const branches = [
            {
                name: 'Sucursal Norte',
                code: 'SUC-N-001',
                address: 'Avenida Norte 100',
                city: 'Ciudad Norte',
                phone: '+5551234567',
                email: 'norte@fabrika.com'
            },
            {
                name: 'Sucursal Centro',
                code: 'SUC-C-001',
                address: 'Calle Central 200',
                city: 'Ciudad Central',
                phone: '+5551234568',
                email: 'centro@fabrika.com'
            },
            {
                name: 'Sucursal Sur',
                code: 'SUC-S-001',
                address: 'Boulevard Sur 300',
                city: 'Ciudad Sur',
                phone: '+5551234569',
                email: 'sur@fabrika.com'
            }
        ];

        for (const branchData of branches) {
            const branch = new Branch({
                ...branchData,
                company: company._id,
                active: true
            });
            await branch.save();
        }
        console.log('✅ Sucursales creadas');

        console.log('🎉 Datos de prueba creados exitosamente!');
        console.log('📧 Email: admin@test.com');
        console.log('🔑 Contraseña: admin123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

createTestData();