import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { RecipeModel } from '../../../models/Recipe';
import { IngredientModel } from '../../../models/Ingredient';
import { RawMaterialModel } from '../../../models/RawMaterial';
import { withRole } from '../../../libs/middleware/auth';

const produceRecipeHandler: APIRoute = async ({ params, request }) => {
    try {
        await connectToMongoDB();
        
        const { id } = params;
        const { quantity } = await request.json();

        if (!quantity || quantity <= 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'La cantidad debe ser mayor a 0'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Buscar la receta
        const recipe = await RecipeModel.findById(id);
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

        // Verificar que la receta tenga ingredientes
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            return new Response(JSON.stringify({
                success: false,
                message: 'La receta no tiene ingredientes definidos'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // 1. Verificar stock disponible de materias primas
        const stockVerification = [];
        for (const ingredient of recipe.ingredients) {
            if (ingredient.rawMaterialId) {
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

                const requiredQuantity = ingredient.quantity * quantity;
                if (rawMaterial.currentStock < requiredQuantity) {
                    return new Response(JSON.stringify({
                        success: false,
                        message: `No hay suficiente stock de ${rawMaterial.name}. Disponible: ${rawMaterial.currentStock}, Requerido: ${requiredQuantity}`
                    }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                }

                stockVerification.push({
                    rawMaterialId: ingredient.rawMaterialId,
                    requiredQuantity: requiredQuantity,
                    availableStock: rawMaterial.currentStock
                });
            }
        }

        // 2. Descontar stock de materias primas
        for (const verification of stockVerification) {
            await RawMaterialModel.findByIdAndUpdate(
                verification.rawMaterialId,
                { $inc: { currentStock: -verification.requiredQuantity } }
            );
        }

        // 3. Crear o actualizar el ingrediente final
        const outputIngredient = await IngredientModel.findOne({ name: recipe.name });
        
        if (outputIngredient) {
            // Si el ingrediente ya existe, aumentar su stock
            await IngredientModel.findByIdAndUpdate(
                outputIngredient._id,
                { $inc: { stock: quantity } }
            );
        } else {
            // Si no existe, crear un nuevo ingrediente
            const newIngredient = new IngredientModel({
                name: recipe.name,
                description: `Producido usando la receta: ${recipe.name}`,
                supplier: 'Producción interna',
                stock: quantity,
                category: recipe.category
            });
            await newIngredient.save();
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Se produjeron ${quantity} unidades de ${recipe.name} exitosamente`,
            production: {
                recipeId: recipe._id,
                recipeName: recipe.name,
                quantity: quantity,
                ingredientsUsed: stockVerification.map(v => ({
                    rawMaterialId: v.rawMaterialId,
                    quantityUsed: v.requiredQuantity
                }))
            }
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error('Error al producir ingrediente:', error);
        return new Response(JSON.stringify({
            success: false,
            message: 'Error al producir ingrediente'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// Aplicar middleware de roles - solo usuarios autenticados pueden producir recetas
export const POST = withRole(['user', 'admin', 'adminSucursal', 'superadmin'])(produceRecipeHandler);
