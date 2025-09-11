import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { SupplierModel } from '../../../models/Supplier';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';

const updateSupplier: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, email, phone, address, city } = (request as any).validatedData;

    // Buscar el proveedor por ID
    const supplier = await SupplierModel.findById(params.id);
    if (!supplier) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Proveedor no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el email ya existe en otro proveedor
    const supplierExistente = await SupplierModel.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: params.id } 
    });
    if (supplierExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otro proveedor con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar el proveedor
    supplier.name = name.trim();
    supplier.email = email.toLowerCase().trim();
    supplier.phone = phone.trim();
    supplier.address = address?.trim();
    supplier.city = city?.trim();

    const supplierActualizado = await supplier.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Proveedor actualizado exitosamente',
        supplier: {
            id: supplierActualizado._id,
            name: supplierActualizado.name,
            email: supplierActualizado.email,
            phone: supplierActualizado.phone,
            address: supplierActualizado.address,
            city: supplierActualizado.city,
            active: supplierActualizado.active
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withCRUDValidation('supplier', validationSchemas.supplier)(updateSupplier);

const deleteSupplier: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar el proveedor por ID
    const supplier = await SupplierModel.findById(params.id);
    if (!supplier) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Proveedor no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar el proveedor
    await SupplierModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Proveedor eliminado exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withStandardCRUD('supplier')(deleteSupplier);
