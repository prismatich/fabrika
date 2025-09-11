import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { CustomerModel } from '../../../models/Customer';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';

const createCustomer: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { name, phone, email, address, birthDate, gender, preferences, notes } = (request as any).validatedData;

    // Verificar si el cliente ya existe por email
    const customerExistente = await CustomerModel.findOne({ email: email.toLowerCase() });
    if (customerExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe un cliente con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nuevo cliente
    const nuevoCustomer = new CustomerModel({
        name: name.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        address: address?.trim(),
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender: gender,
        preferences: preferences,
        notes: notes?.trim()
    });

    const customerGuardado = await nuevoCustomer.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Cliente creado exitosamente',
        customer: {
            id: customerGuardado._id,
            name: customerGuardado.name,
            phone: customerGuardado.phone,
            email: customerGuardado.email,
            address: customerGuardado.address,
            birthDate: customerGuardado.birthDate,
            gender: customerGuardado.gender,
            preferences: customerGuardado.preferences,
            notes: customerGuardado.notes,
            active: customerGuardado.active
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('customer', validationSchemas.customer)(createCustomer);

const getCustomers: APIRoute = async () => {
    await connectToMongoDB();
    
    const customers = await CustomerModel.find({}).sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        customers: customers.map(customer => ({
            id: customer._id,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            birthDate: customer.birthDate,
            gender: customer.gender,
            preferences: customer.preferences,
            notes: customer.notes,
            active: customer.active,
            createdAt: (customer as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('customer')(getCustomers);
