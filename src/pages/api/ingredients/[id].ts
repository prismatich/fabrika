import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { IngredientModel } from '../../../models/Ingredient';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';

const updateIngredient: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, description, supplier, stock, category } = (request as any).validatedData;

    // Buscar el ingrediente por ID
    const ingrediente = await IngredientModel.findById(params.id);
    if (!ingrediente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ingrediente no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el nombre ya existe en otro ingrediente
    const ingredienteExistente = await IngredientModel.findOne({ 
        name: name.trim(), 
        _id: { $ne: params.id } 
    });
    if (ingredienteExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otro ingrediente con este nombre'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar el ingrediente
    ingrediente.name = name.trim();
    ingrediente.description = description.trim();
    ingrediente.supplier = supplier.trim();
    ingrediente.stock = stock || 0;
    ingrediente.category = category.trim();

    const ingredienteActualizado = await ingrediente.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Ingrediente actualizado exitosamente',
        ingrediente: {
            id: ingredienteActualizado._id,
            name: ingredienteActualizado.name,
            description: ingredienteActualizado.description,
            supplier: ingredienteActualizado.supplier,
            stock: ingredienteActualizado.stock,
            category: ingredienteActualizado.category
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withRole(['admin', 'adminSucursal', 'superadmin'])(withCRUDValidation('ingredient', validationSchemas.ingredient)(updateIngredient));

const deleteIngredient: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar el ingrediente por ID
    const ingrediente = await IngredientModel.findById(params.id);
    if (!ingrediente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ingrediente no encontrado'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar el ingrediente
    await IngredientModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Ingrediente eliminado exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withRole(['admin', 'superadmin'])(withStandardCRUD('ingredient')(deleteIngredient));
