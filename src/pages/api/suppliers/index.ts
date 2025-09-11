import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { SupplierModel } from '../../../models/Supplier';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';

const createSupplier: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { name, email, phone, address, city } = (request as any).validatedData;

    // Verificar si el proveedor ya existe por email
    const supplierExistente = await SupplierModel.findOne({ email: email.toLowerCase() });
    if (supplierExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe un proveedor con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nuevo proveedor
    const nuevoSupplier = new SupplierModel({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim(),
        address: address?.trim(),
        city: city?.trim()
    });

    const supplierGuardado = await nuevoSupplier.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Proveedor creado exitosamente',
        supplier: {
            id: supplierGuardado._id,
            name: supplierGuardado.name,
            email: supplierGuardado.email,
            phone: supplierGuardado.phone,
            address: supplierGuardado.address,
            city: supplierGuardado.city,
            active: supplierGuardado.active
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('supplier', validationSchemas.supplier)(createSupplier);

const getSuppliers: APIRoute = async () => {
    await connectToMongoDB();
    
    const suppliers = await SupplierModel.find({}).sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        suppliers: suppliers.map(supplier => ({
            id: supplier._id,
            name: supplier.name,
            email: supplier.email,
            phone: supplier.phone,
            address: supplier.address,
            city: supplier.city,
            active: supplier.active,
            createdAt: (supplier as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('supplier')(getSuppliers);
