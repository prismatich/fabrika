import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../../libs/mongoose';
import { InvoiceModel } from '../../../../models/Invoice';
import { withStandardCRUD, withActionDatabaseLogging } from '../../../../libs/middleware';

const payInvoice: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { paymentMethod, paymentReference } = await request.json();

    // Validar datos requeridos
    if (!paymentMethod || paymentMethod.trim() === '') {
        return new Response(JSON.stringify({
            success: false,
            message: 'El método de pago es requerido'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

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

    // Solo permitir pago de facturas aprobadas
    if (factura.status !== 'approved') {
        return new Response(JSON.stringify({
            success: false,
            message: 'Solo se pueden pagar facturas con estado aprobado'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la factura como pagada
    factura.status = 'paid';
    factura.paymentMethod = paymentMethod.trim();
    factura.paymentReference = paymentReference?.trim();
    factura.paymentDate = new Date();

    const facturaActualizada = await factura.save();

    // Poblar las referencias para la respuesta
    await facturaActualizada.populate('supplier', 'name email phone');
    await facturaActualizada.populate('branch', 'name code address city');
    await facturaActualizada.populate('createdBy', 'name email');
    await facturaActualizada.populate('approvedBy', 'name email');

    return new Response(JSON.stringify({
        success: true,
        message: 'Factura marcada como pagada exitosamente',
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
            paymentDate: facturaActualizada.paymentDate,
            paymentReference: facturaActualizada.paymentReference,
            approvedBy: facturaActualizada.approvedBy,
            approvedAt: facturaActualizada.approvedAt,
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

export const POST = withActionDatabaseLogging('invoice', 'pay')(withStandardCRUD('invoice')(payInvoice));
