import mongoose from 'mongoose';
import crypto from 'crypto';

// Función para hashear la contraseña (usando SHA-256 para desarrollo)
const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Esquema de Usuario
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
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// Esquema de Company
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
}, {
    timestamps: true
});

const Company = mongoose.model('Company', companySchema);

async function createTestUser() {
    try {
        // Conectar a MongoDB
        await mongoose.connect('mongodb://localhost:27017/testing');
        console.log('✅ Conectado a MongoDB');

        // Crear una empresa de prueba
        const company = new Company({
            name: 'Empresa de Prueba',
            email: 'admin@empresa.com',
            phone: '+1234567890',
            address: 'Calle Principal 123',
            city: 'Ciudad',
            country: 'País',
            taxId: 'TAX123456',
            subscriptionStatus: 'active',
            subscriptionStartDate: new Date(),
            subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 año
            subscriptionAmount: 99.99,
            subscriptionCurrency: 'USD',
            paymentStatus: 'paid',
            lastPaymentDate: new Date(),
            nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            paymentReference: 'PAY123456',
            active: true
        });

        await company.save();
        console.log('✅ Empresa creada:', company._id);

        // Crear usuario de prueba
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
        console.log('✅ Usuario creado:', user._id);
        console.log('📧 Email: admin@test.com');
        console.log('🔑 Contraseña: admin123');

        // Crear usuario empleado
        const employee = new User({
            name: 'Empleado Test',
            email: 'empleado@test.com',
            password: hashPassword('empleado123'),
            role: 'employee',
            company: company._id,
            active: true
        });

        await employee.save();
        console.log('✅ Empleado creado:', employee._id);
        console.log('📧 Email: empleado@test.com');
        console.log('🔑 Contraseña: empleado123');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado de MongoDB');
    }
}

// Ejecutar si se llama directamente
createTestUser();

export { createTestUser, User, Company, hashPassword };
