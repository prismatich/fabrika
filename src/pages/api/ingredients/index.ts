import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { IngredientModel } from '../../../models/Ingredient';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';

const createIngredient: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { name, description, supplier, stock, category } = (request as any).validatedData;

    // Verificar si el ingrediente ya existe
    const ingredienteExistente = await IngredientModel.findOne({ name: name.trim() });
    if (ingredienteExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe un ingrediente con este nombre'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nuevo ingrediente
    const nuevoIngrediente = new IngredientModel({
        name: name.trim(),
        description: description.trim(),
        supplier: supplier.trim(),
        stock: stock || 0,
        category: category.trim()
    });

    const ingredienteGuardado = await nuevoIngrediente.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Ingrediente creado exitosamente',
        ingrediente: {
            id: ingredienteGuardado._id,
            name: ingredienteGuardado.name,
            description: ingredienteGuardado.description,
            supplier: ingredienteGuardado.supplier,
            stock: ingredienteGuardado.stock,
            category: ingredienteGuardado.category
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withRole(['admin', 'adminSucursal', 'superadmin'])(withCRUDValidation('ingredient', validationSchemas.ingredient)(createIngredient));

const getIngredients: APIRoute = async () => {
    await connectToMongoDB();
    
    const ingredientes = await IngredientModel.find({}).sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        ingredientes: ingredientes.map(ing => ({
            id: ing._id,
            name: ing.name,
            description: ing.description,
            supplier: ing.supplier,
            stock: ing.stock,
            category: ing.category,
            createdAt: (ing as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withRole(['user', 'admin', 'adminSucursal', 'superadmin'])(withReadOnly('ingredient')(getIngredients));
