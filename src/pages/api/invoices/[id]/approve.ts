import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { InvoiceModel } from '../../../models/Invoice';
import { withStandardCRUD } from '../../../libs/middleware';

const approveInvoice: APIRoute = async ({ request, params }) => {
    await connectToMongoDB();
    
    const { action, rejectionReason } = await request.json();

    // Validar acción
    if (!action || !['approve', 'reject'].includes(action)) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Acción inválida. Debe ser "approve" o "reject"'
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

    // Solo permitir aprobación/rechazo de facturas pendientes
    if (factura.status !== 'pending') {
        return new Response(JSON.stringify({
            success: false,
            message: 'Solo se pueden aprobar/rechazar facturas con estado pendiente'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Si es rechazo, validar que se proporcione razón
    if (action === 'reject' && (!rejectionReason || rejectionReason.trim() === '')) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Debe proporcionar una razón para el rechazo'
        }), {
            status: 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    // Actualizar la factura según la acción
    if (action === 'approve') {
        factura.status = 'approved';
        factura.approvedBy = (request as any).user?.id; // ID del usuario autenticado
        factura.approvedAt = new Date();
        factura.rejectionReason = undefined; // Limpiar razón de rechazo si existía
    } else {
        factura.status = 'rejected';
        factura.rejectionReason = rejectionReason.trim();
        factura.approvedBy = (request as any).user?.id; // ID del usuario que rechazó
        factura.approvedAt = new Date();
    }

    const facturaActualizada = await factura.save();

    // Poblar las referencias para la respuesta
    await facturaActualizada.populate('supplier', 'name email phone');
    await facturaActualizada.populate('branch', 'name code address city');
    await facturaActualizada.populate('createdBy', 'name email');
    await facturaActualizada.populate('approvedBy', 'name email');

    return new Response(JSON.stringify({
        success: true,
        message: `Factura ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
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
            approvedBy: facturaActualizada.approvedBy,
            approvedAt: facturaActualizada.approvedAt,
            rejectionReason: facturaActualizada.rejectionReason,
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

export const POST = withStandardCRUD('invoice')(approveInvoice);
