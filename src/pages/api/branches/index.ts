import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { BranchModel } from '../../../models/Branch';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';

const createBranch: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { name, code, address, city, phone, email } = (request as any).validatedData;

    // Verificar si la sucursal ya existe por código
    const branchExistente = await BranchModel.findOne({ code: code.trim() });
    if (branchExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe una sucursal con este código'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nueva sucursal
    const nuevaBranch = new BranchModel({
        name: name.trim(),
        code: code.trim(),
        address: address.trim(),
        city: city.trim(),
        phone: phone?.trim(),
        email: email?.trim()
    });

    const branchGuardada = await nuevaBranch.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Sucursal creada exitosamente',
        branch: {
            id: branchGuardada._id,
            name: branchGuardada.name,
            code: branchGuardada.code,
            address: branchGuardada.address,
            city: branchGuardada.city,
            phone: branchGuardada.phone,
            email: branchGuardada.email,
            active: branchGuardada.active
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('branch', validationSchemas.branch)(createBranch);

const getBranches: APIRoute = async () => {
    await connectToMongoDB();
    
    const branches = await BranchModel.find({}).sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        branches: branches.map(branch => ({
            id: branch._id,
            name: branch.name,
            code: branch.code,
            address: branch.address,
            city: branch.city,
            phone: branch.phone,
            email: branch.email,
            active: branch.active,
            createdAt: (branch as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('branch')(getBranches);
