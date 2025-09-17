import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { CustomerModel } from '../../../models/Customer';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';

const updateCustomer: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, phone, email, address, birthDate, gender, preferences, notes } = (request as any).validatedData;

    // Buscar el cliente por ID
    const customer = await CustomerModel.findById(params.id);
    if (!customer) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Cliente no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el email ya existe en otro cliente
    const customerExistente = await CustomerModel.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: params.id } 
    });
    if (customerExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otro cliente con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar el cliente
    customer.name = name.trim();
    customer.phone = phone.trim();
    customer.email = email.toLowerCase().trim();
    customer.address = address?.trim();
    customer.birthDate = birthDate ? new Date(birthDate) : undefined;
    customer.gender = gender;
    customer.preferences = preferences;
    customer.notes = notes?.trim();

    const customerActualizado = await customer.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Cliente actualizado exitosamente',
        customer: {
            id: customerActualizado._id,
            name: customerActualizado.name,
            phone: customerActualizado.phone,
            email: customerActualizado.email,
            address: customerActualizado.address,
            birthDate: customerActualizado.birthDate,
            gender: customerActualizado.gender,
            preferences: customerActualizado.preferences,
            notes: customerActualizado.notes,
            active: customerActualizado.active
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withRole(['admin', 'adminSucursal', 'superadmin'])(withCRUDValidation('customer', validationSchemas.customer)(updateCustomer));

const deleteCustomer: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar el cliente por ID
    const customer = await CustomerModel.findById(params.id);
    if (!customer) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Cliente no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar el cliente
    await CustomerModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Cliente eliminado exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withRole(['admin', 'superadmin'])(withStandardCRUD('customer')(deleteCustomer));
