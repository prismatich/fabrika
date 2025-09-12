import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { RawMaterialModel } from '../../../models/RawMaterial';
import { withCRUDValidation, withStandardCRUD, validationSchemas } from '../../../libs/middleware';

const updateRawMaterial: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { 
        name, 
        code, 
        description, 
        category, 
        supplier, 
        unit, 
        currentStock, 
        minimumStock, 
        maximumStock, 
        unitCost, 
        unitPrice, 
        batchNumber, 
        notes 
    } = (request as any).validatedData;

    // Buscar la materia prima por ID
    const rawMaterial = await RawMaterialModel.findById(params.id);
    if (!rawMaterial) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Materia prima no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el código ya existe en otra materia prima
    const rawMaterialExistente = await RawMaterialModel.findOne({ 
        code: code.trim(), 
        _id: { $ne: params.id } 
    });
    if (rawMaterialExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otra materia prima con este código'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la materia prima
    rawMaterial.name = name.trim();
    rawMaterial.code = code.trim();
    rawMaterial.description = description.trim();
    rawMaterial.category = category.trim();
    rawMaterial.supplier = supplier;
    rawMaterial.unit = unit.trim();
    rawMaterial.currentStock = currentStock || 0;
    rawMaterial.minimumStock = minimumStock;
    rawMaterial.maximumStock = maximumStock;
    rawMaterial.unitCost = unitCost;
    rawMaterial.unitPrice = unitPrice;
    rawMaterial.batchNumber = batchNumber?.trim();
    rawMaterial.notes = notes?.trim();

    const rawMaterialActualizada = await rawMaterial.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Materia prima actualizada exitosamente',
        rawMaterial: {
            id: rawMaterialActualizada._id,
            name: rawMaterialActualizada.name,
            code: rawMaterialActualizada.code,
            description: rawMaterialActualizada.description,
            category: rawMaterialActualizada.category,
            supplier: rawMaterialActualizada.supplier,
            unit: rawMaterialActualizada.unit,
            currentStock: rawMaterialActualizada.currentStock,
            minimumStock: rawMaterialActualizada.minimumStock,
            maximumStock: rawMaterialActualizada.maximumStock,
            unitCost: rawMaterialActualizada.unitCost,
            unitPrice: rawMaterialActualizada.unitPrice,
            batchNumber: rawMaterialActualizada.batchNumber,
            notes: rawMaterialActualizada.notes,
            active: rawMaterialActualizada.active
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withCRUDValidation('raw-material', validationSchemas.rawMaterial)(updateRawMaterial);

const deleteRawMaterial: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar la materia prima por ID
    const rawMaterial = await RawMaterialModel.findById(params.id);
    if (!rawMaterial) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Materia prima no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar la materia prima
    await RawMaterialModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Materia prima eliminada exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withStandardCRUD('raw-material')(deleteRawMaterial);
