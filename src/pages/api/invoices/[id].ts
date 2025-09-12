import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { InvoiceModel } from '../../../models/Invoice';
import { SupplierModel } from '../../../models/Supplier';
import { BranchModel } from '../../../models/Branch';
import { withCRUDValidation, withStandardCRUD, validationSchemas, withCRUDDatabaseLogging } from '../../../libs/middleware';

const getInvoice: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    const factura = await InvoiceModel.findById(params.id)
        .populate('supplier', 'name email phone address city')
        .populate('branch', 'name code address city')
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email');

    if (!factura) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Factura no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    return new Response(JSON.stringify({
        success: true,
        invoice: {
            id: factura._id,
            invoiceNumber: factura.invoiceNumber,
            supplier: factura.supplier,
            branch: factura.branch,
            createdBy: factura.createdBy,
            invoiceDate: factura.invoiceDate,
            dueDate: factura.dueDate,
            items: factura.items,
            subtotal: factura.subtotal,
            taxAmount: factura.taxAmount,
            discountAmount: factura.discountAmount,
            totalAmount: factura.totalAmount,
            status: factura.status,
            notes: factura.notes,
            paymentMethod: factura.paymentMethod,
            paymentDate: factura.paymentDate,
            paymentReference: factura.paymentReference,
            approvedBy: factura.approvedBy,
            approvedAt: factura.approvedAt,
            rejectionReason: factura.rejectionReason,
            active: factura.active,
            createdAt: (factura as any).createdAt,
            updatedAt: (factura as any).updatedAt
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withCRUDDatabaseLogging('invoice')(withStandardCRUD('invoice')(getInvoice));

const updateInvoice: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { 
        invoiceNumber,
        supplier,
        branch,
        invoiceDate,
        dueDate,
        items,
        subtotal,
        taxAmount = 0,
        discountAmount = 0,
        totalAmount,
        notes,
        paymentMethod
    } = (request as any).validatedData;

    // Buscar la factura por ID
    const factura = await InvoiceModel.findById(params.id);
    if (!factura) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Factura no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Solo permitir edición si la factura está pendiente
    if (factura.status !== 'pending') {
        return new Response(JSON.stringify({
            success: false,
            message: 'Solo se pueden editar facturas con estado pendiente'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar si el número de factura ya existe en otra factura
    const facturaExistente = await InvoiceModel.findOne({ 
        invoiceNumber: invoiceNumber.trim(), 
        _id: { $ne: params.id } 
    });
    if (facturaExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe otra factura con este número'
        }), {
            status: 409,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar que el proveedor existe
    const supplierExists = await SupplierModel.findById(supplier);
    if (!supplierExists) {
        return new Response(JSON.stringify({
            success: false,
            message: 'El proveedor especificado no existe'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Verificar que la sucursal existe
    const branchExists = await BranchModel.findById(branch);
    if (!branchExists) {
        return new Response(JSON.stringify({
            success: false,
            message: 'La sucursal especificada no existe'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Validar items de la factura
    if (!items || items.length === 0) {
        return new Response(JSON.stringify({
            success: false,
            message: 'La factura debe tener al menos un item'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Validar cálculos de la factura
    const calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const calculatedTotal = calculatedSubtotal + taxAmount - discountAmount;

    if (Math.abs(calculatedSubtotal - subtotal) > 0.01) {
        return new Response(JSON.stringify({
            success: false,
            message: 'El subtotal no coincide con la suma de los items'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        return new Response(JSON.stringify({
            success: false,
            message: 'El total no coincide con los cálculos (subtotal + impuestos - descuentos)'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la factura
    factura.invoiceNumber = invoiceNumber.trim();
    factura.supplier = supplier;
    factura.branch = branch;
    factura.invoiceDate = new Date(invoiceDate);
    factura.dueDate = new Date(dueDate);
    factura.items = items;
    factura.subtotal = subtotal;
    factura.taxAmount = taxAmount;
    factura.discountAmount = discountAmount;
    factura.totalAmount = totalAmount;
    factura.notes = notes?.trim();
    factura.paymentMethod = paymentMethod?.trim();

    const facturaActualizada = await factura.save();

    // Poblar las referencias para la respuesta
    await facturaActualizada.populate('supplier', 'name email phone');
    await facturaActualizada.populate('branch', 'name code address city');
    await facturaActualizada.populate('createdBy', 'name email');

    return new Response(JSON.stringify({
        success: true,
        message: 'Factura actualizada exitosamente',
        invoice: {
            id: facturaActualizada._id,
            invoiceNumber: facturaActualizada.invoiceNumber,
            supplier: facturaActualizada.supplier,
            branch: facturaActualizada.branch,
            createdBy: facturaActualizada.createdBy,
            invoiceDate: facturaActualizada.invoiceDate,
            dueDate: facturaActualizada.dueDate,
            items: facturaActualizada.items,
            subtotal: facturaActualizada.subtotal,
            taxAmount: facturaActualizada.taxAmount,
            discountAmount: facturaActualizada.discountAmount,
            totalAmount: facturaActualizada.totalAmount,
            status: facturaActualizada.status,
            notes: facturaActualizada.notes,
            paymentMethod: facturaActualizada.paymentMethod,
            active: facturaActualizada.active,
            createdAt: (facturaActualizada as any).createdAt,
            updatedAt: (facturaActualizada as any).updatedAt
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const PUT = withCRUDDatabaseLogging('invoice')(withCRUDValidation('invoice', validationSchemas.invoice)(updateInvoice));

const deleteInvoice: APIRoute = async ({ params }) => {
    await connectToMongoDB();
    
    // Buscar la factura por ID
    const factura = await InvoiceModel.findById(params.id);
    if (!factura) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Factura no encontrada'
        }), {
            status: 404,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Solo permitir eliminación si la factura está pendiente
    if (factura.status !== 'pending') {
        return new Response(JSON.stringify({
            success: false,
            message: 'Solo se pueden eliminar facturas con estado pendiente'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Eliminar la factura
    await InvoiceModel.findByIdAndDelete(params.id);

    return new Response(JSON.stringify({
        success: true,
        message: 'Factura eliminada exitosamente'
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const DELETE = withCRUDDatabaseLogging('invoice')(withStandardCRUD('invoice')(deleteInvoice));
