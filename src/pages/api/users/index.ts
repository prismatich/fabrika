import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { UserModel, UserRole } from '../../../models/User';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';
import bcrypt from 'bcryptjs';
import { requireAuth } from '../../../libs/middleware/auth';

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

// Función para verificar contraseña (útil para login)
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(password, hashedPassword);
};

const createUser: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { name, email, password, role } = (request as any).validatedData;
    const user = (request as any).user;

    // Verificar permisos de rol
    if (!checkRolePermissions(user.role as UserRole, role as UserRole)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'No tienes permisos para crear usuarios con este rol'
        }), {
            status: 403,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el usuario ya existe
    const userExistente = await UserModel.findOne({ email: email.toLowerCase() });
    if (userExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe un usuario con este email'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Encriptar contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario
    const nuevoUser = new UserModel({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role as UserRole
    });

    const userGuardado = await nuevoUser.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
            id: userGuardado._id,
            name: userGuardado.name,
            email: userGuardado.email,
            role: userGuardado.role,
            lastLogin: userGuardado.lastLogin,
            createdAt: (userGuardado as any).createdAt
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('user', validationSchemas.user)(createUser);

const getUsers: APIRoute = async () => {
    await connectToMongoDB();
    
    const users = await UserModel.find({}).select('-password').sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        users: users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            lastLogin: user.lastLogin,
            createdAt: (user as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('user')(getUsers);
