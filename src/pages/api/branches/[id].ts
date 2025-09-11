import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { BranchModel } from '../../../models/Branch';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';

const updateBranch: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, code, address, city, phone, email } = (request as any).validatedData;

    // Buscar la sucursal por ID
    const branch = await BranchModel.findById(params.id);
    if (!branch) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Sucursal no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el código ya existe en otra sucursal
    const branchExistente = await BranchModel.findOne({ 
        code: code.trim(), 
        _id: { $ne: params.id } 
    });
    if (branchExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otra sucursal con este código'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la sucursal
    branch.name = name.trim();
    branch.code = code.trim();
    branch.address = address.trim();
    branch.city = city.trim();
    branch.phone = phone?.trim();
    branch.email = email?.trim();

    const branchActualizada = await branch.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Sucursal actualizada exitosamente',
        branch: {
            id: branchActualizada._id,
            name: branchActualizada.name,
            code: branchActualizada.code,
            address: branchActualizada.address,
            city: branchActualizada.city,
            phone: branchActualizada.phone,
            email: branchActualizada.email,
            active: branchActualizada.active
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withCRUDValidation('branch', validationSchemas.branch)(updateBranch);

const deleteBranch: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar la sucursal por ID
    const branch = await BranchModel.findById(params.id);
    if (!branch) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Sucursal no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar la sucursal
    await BranchModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Sucursal eliminada exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withStandardCRUD('branch')(deleteBranch);
