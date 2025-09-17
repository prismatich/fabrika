import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { UserModel, UserRole } from '../../../models/User';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';
import bcrypt from 'bcryptjs';

// Función para verificar permisos de roles
const checkRolePermissions = (userRole: UserRole, targetRole: UserRole): boolean => {
    switch (userRole) {
        case UserRole.SUPERADMIN:
            return true; // Superadmin puede crear cualquier rol
        case UserRole.ADMIN:
            return targetRole === UserRole.ADMIN || targetRole === UserRole.AdminSucursal || targetRole === UserRole.USER;
        case UserRole.AdminSucursal:
            return targetRole === UserRole.AdminSucursal || targetRole === UserRole.USER;
        default:
            return false; // USER no puede crear otros usuarios
    }
};

const updateUser: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, email, password, role } = (request as any).validatedData;
    const currentUser = (request as any).user;

    // Buscar el usuario por ID
    const user = await UserModel.findById(params.id);
    if (!user) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Usuario no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar permisos de rol
    if (!checkRolePermissions(currentUser.role as UserRole, role as UserRole)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'No tienes permisos para asignar este rol'
        }), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el email ya existe en otro usuario
    const userExistente = await UserModel.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: params.id } 
    });
    if (userExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otro usuario con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar el usuario
    user.name = name.trim();
    user.email = email.toLowerCase().trim();
    user.role = role as UserRole;
    
    // Solo actualizar contraseña si se proporciona
    if (password) {
        const saltRounds = 10;
        user.password = await bcrypt.hash(password, saltRounds);
    }

    const userActualizado = await user.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: {
            id: userActualizado._id,
            name: userActualizado.name,
            email: userActualizado.email,
            role: userActualizado.role,
            lastLogin: userActualizado.lastLogin,
            createdAt: (userActualizado as any).createdAt
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withRole(['admin', 'superadmin'])(withCRUDValidation('user', validationSchemas.user)(updateUser));

const deleteUser: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const currentUser = (request as any).user;

    // Verificar que no se esté eliminando a sí mismo
    if (params.id === currentUser.id) {
        return new Response(JSON.stringify({
            success: false,
            message: 'No puedes eliminarte a ti mismo'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Buscar el usuario por ID
    const user = await UserModel.findById(params.id);
    if (!user) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Usuario no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar permisos para eliminar (solo superadmin puede eliminar otros superadmins)
    if (user.role === UserRole.SUPERADMIN && currentUser.role !== UserRole.SUPERADMIN) {
        return new Response(JSON.stringify({
            success: false,
            message: 'No tienes permisos para eliminar superadministradores'
        }), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar el usuario
    await UserModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Usuario eliminado exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withRole(['superadmin'])(withStandardCRUD('user')(deleteUser));
