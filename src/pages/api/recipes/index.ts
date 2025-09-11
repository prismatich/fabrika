import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { RecipeModel } from '../../../models/Recipe';
import { RawMaterialModel } from '../../../models/RawMaterial';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';

const createRecipe: APIRoute = async ({ request }) => {
    await connectToMongoDB();
    
    const { 
        name, 
        description, 
        instructions, 
        preparationTime, 
        servings, 
        category, 
        creator, 
        ingredients 
    } = (request as any).validatedData;

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

    // Verificar si la receta ya existe por nombre
    const recipeExistente = await RecipeModel.findOne({ name: name.trim() });
    if (recipeExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe una receta con este nombre'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nueva receta
    const nuevaRecipe = new RecipeModel({
        name: name.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        preparationTime: preparationTime,
        servings: servings,
        category: category.trim(),
        creator: creator,
        ingredients: ingredients
    });

    const recipeGuardada = await nuevaRecipe.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Receta creada exitosamente',
        recipe: {
            id: recipeGuardada._id,
            name: recipeGuardada.name,
            description: recipeGuardada.description,
            instructions: recipeGuardada.instructions,
            preparationTime: recipeGuardada.preparationTime,
            servings: recipeGuardada.servings,
            category: recipeGuardada.category,
            creator: recipeGuardada.creator,
            ingredients: recipeGuardada.ingredients,
            active: recipeGuardada.active
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('recipe', validationSchemas.recipe)(createRecipe);

const getRecipes: APIRoute = async () => {
    await connectToMongoDB();
    
    const recipes = await RecipeModel.find({}).sort({ name: 1 });

    // Enriquecer las recetas con información de materias primas
    const enrichedRecipes = await Promise.all(recipes.map(async (recipe) => {
        let enrichedIngredients: any[] = [];
        
        if (recipe.ingredients && recipe.ingredients.length > 0) {
            enrichedIngredients = await Promise.all(recipe.ingredients.map(async (ingredient) => {
                const rawMaterial = await RawMaterialModel.findById(ingredient.rawMaterialId);
                return {
                    ...ingredient,
                    rawMaterialInfo: rawMaterial ? {
                        id: rawMaterial._id,
                        name: rawMaterial.name,
                        code: rawMaterial.code,
                        currentStock: rawMaterial.currentStock,
                        unit: rawMaterial.unit,
                        category: rawMaterial.category
                    } : null
                };
            }));
        }

        return {
            id: recipe._id,
            name: recipe.name,
            description: recipe.description,
            instructions: recipe.instructions,
            preparationTime: recipe.preparationTime,
            servings: recipe.servings,
            category: recipe.category,
            creator: recipe.creator,
            ingredients: enrichedIngredients,
            active: recipe.active,
            createdAt: (recipe as any).createdAt
        };
    }));

    return new Response(JSON.stringify({
        success: true,
        recipes: enrichedRecipes
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('recipe')(getRecipes);
