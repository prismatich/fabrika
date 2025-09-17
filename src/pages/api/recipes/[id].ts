import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { RecipeModel } from '../../../models/Recipe';
import { RawMaterialModel } from '../../../models/RawMaterial';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';

const updateRecipe: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { name, description, instructions, preparationTime, servings, category, creator, ingredients } = (request as any).validatedData;

    // Validar ingredientes si se proporcionan
    if (ingredients && Array.isArray(ingredients)) {
        for (const ingredient of ingredients) {
            if (!ingredient.rawMaterialId || !ingredient.quantity || !ingredient.unit) {
                return new Response(JSON.stringify({
                    success: false,
                    message: 'Cada ingrediente debe tener rawMaterialId, quantity y unit'
                }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }

            // Verificar que la materia prima existe
            const rawMaterial = await RawMaterialModel.findById(ingredient.rawMaterialId);
            if (!rawMaterial) {
                return new Response(JSON.stringify({
                    success: false,
                    message: `Materia prima no encontrada: ${ingredient.rawMaterialId}`
                }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
            }
        }
    }

    // Buscar la receta por ID
    const recipe = await RecipeModel.findById(params.id);
    if (!recipe) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Receta no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el nombre ya existe en otra receta
    const recipeExistente = await RecipeModel.findOne({ 
        name: name.trim(), 
        _id: { $ne: params.id } 
    });
    if (recipeExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otra receta con este nombre'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la receta
    recipe.name = name.trim();
    recipe.description = description.trim();
    recipe.instructions = instructions.trim();
    recipe.preparationTime = preparationTime;
    recipe.servings = servings;
    recipe.category = category.trim();
    recipe.creator = creator;
    recipe.ingredients = ingredients;

    const recipeActualizada = await recipe.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Receta actualizada exitosamente',
        recipe: {
            id: recipeActualizada._id,
            name: recipeActualizada.name,
            description: recipeActualizada.description,
            instructions: recipeActualizada.instructions,
            preparationTime: recipeActualizada.preparationTime,
            servings: recipeActualizada.servings,
            category: recipeActualizada.category,
            creator: recipeActualizada.creator,
            ingredients: recipeActualizada.ingredients,
            active: recipeActualizada.active
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withRole(['admin', 'adminSucursal', 'superadmin'])(withCRUDValidation('recipe', validationSchemas.recipe)(updateRecipe));

const deleteRecipe: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar la receta por ID
    const recipe = await RecipeModel.findById(params.id);
    if (!recipe) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Receta no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar la receta
    await RecipeModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Receta eliminada exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withRole(['admin', 'superadmin'])(withStandardCRUD('recipe')(deleteRecipe));
