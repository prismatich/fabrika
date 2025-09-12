import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { RawMaterialModel } from '../../../models/RawMaterial';
import { withCRUDValidation, withReadOnly, validationSchemas } from '../../../libs/middleware';

const createRawMaterial: APIRoute = async ({ request }) => {
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

    // Verificar si la materia prima ya existe por código
    const rawMaterialExistente = await RawMaterialModel.findOne({ code: code.trim() });
    if (rawMaterialExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe una materia prima con este código'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Crear nueva materia prima
    const nuevaRawMaterial = new RawMaterialModel({
        name: name.trim(),
        code: code.trim(),
        description: description.trim(),
        category: category.trim(),
        supplier: supplier,
        unit: unit.trim(),
        currentStock: currentStock || 0,
        minimumStock: minimumStock,
        maximumStock: maximumStock,
        unitCost: unitCost,
        unitPrice: unitPrice,
        batchNumber: batchNumber?.trim(),
        notes: notes?.trim()
    });

    const rawMaterialGuardada = await nuevaRawMaterial.save();

    return new Response(JSON.stringify({
        success: true,
        message: 'Materia prima creada exitosamente',
        rawMaterial: {
            id: rawMaterialGuardada._id,
            name: rawMaterialGuardada.name,
            code: rawMaterialGuardada.code,
            description: rawMaterialGuardada.description,
            category: rawMaterialGuardada.category,
            supplier: rawMaterialGuardada.supplier,
            unit: rawMaterialGuardada.unit,
            currentStock: rawMaterialGuardada.currentStock,
            minimumStock: rawMaterialGuardada.minimumStock,
            maximumStock: rawMaterialGuardada.maximumStock,
            unitCost: rawMaterialGuardada.unitCost,
            unitPrice: rawMaterialGuardada.unitPrice,
            batchNumber: rawMaterialGuardada.batchNumber,
            notes: rawMaterialGuardada.notes,
            active: rawMaterialGuardada.active
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDValidation('raw-material', validationSchemas.rawMaterial)(createRawMaterial);

const getRawMaterials: APIRoute = async () => {
    await connectToMongoDB();
    
    const rawMaterials = await RawMaterialModel.find({}).sort({ name: 1 });

    return new Response(JSON.stringify({
        success: true,
        rawMaterials: rawMaterials.map(rawMaterial => ({
            id: rawMaterial._id,
            name: rawMaterial.name,
            code: rawMaterial.code,
            description: rawMaterial.description,
            category: rawMaterial.category,
            supplier: rawMaterial.supplier,
            unit: rawMaterial.unit,
            currentStock: rawMaterial.currentStock,
            minimumStock: rawMaterial.minimumStock,
            maximumStock: rawMaterial.maximumStock,
            unitCost: rawMaterial.unitCost,
            unitPrice: rawMaterial.unitPrice,
            batchNumber: rawMaterial.batchNumber,
            notes: rawMaterial.notes,
            active: rawMaterial.active,
            createdAt: (rawMaterial as any).createdAt
        }))
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withReadOnly('raw-material')(getRawMaterials);
