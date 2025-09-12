import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { InvoiceModel } from '../../../models/Invoice';
import { SupplierModel } from '../../../models/Supplier';
import { BranchModel } from '../../../models/Branch';
import { withCRUDValidation, withReadOnly, validationSchemas, withCRUDDatabaseLogging } from '../../../libs/middleware';

const createInvoice: APIRoute = async ({ request }) => {
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

    // Verificar si la factura ya existe por número
    const invoiceExistente = await InvoiceModel.findOne({ invoiceNumber: invoiceNumber.trim() });
    if (invoiceExistente) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Ya existe una factura con este número'
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

    // Crear nueva factura
    const nuevaFactura = new InvoiceModel({
        invoiceNumber: invoiceNumber.trim(),
        supplier: supplier,
        branch: branch,
        createdBy: (request as any).user?.id, // ID del usuario autenticado
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        items: items,
        subtotal: subtotal,
        taxAmount: taxAmount,
        discountAmount: discountAmount,
        totalAmount: totalAmount,
        notes: notes?.trim(),
        paymentMethod: paymentMethod?.trim(),
        status: 'pending'
    });

    const facturaGuardada = await nuevaFactura.save();

    // Poblar las referencias para la respuesta
    await facturaGuardada.populate('supplier', 'name email phone');
    await facturaGuardada.populate('branch', 'name code address city');
    await facturaGuardada.populate('createdBy', 'name email');

    return new Response(JSON.stringify({
        success: true,
        message: 'Factura creada exitosamente',
        invoice: {
            id: facturaGuardada._id,
            invoiceNumber: facturaGuardada.invoiceNumber,
            supplier: facturaGuardada.supplier,
            branch: facturaGuardada.branch,
            createdBy: facturaGuardada.createdBy,
            invoiceDate: facturaGuardada.invoiceDate,
            dueDate: facturaGuardada.dueDate,
            items: facturaGuardada.items,
            subtotal: facturaGuardada.subtotal,
            taxAmount: facturaGuardada.taxAmount,
            discountAmount: facturaGuardada.discountAmount,
            totalAmount: facturaGuardada.totalAmount,
            status: facturaGuardada.status,
            notes: facturaGuardada.notes,
            paymentMethod: facturaGuardada.paymentMethod,
            active: facturaGuardada.active,
            createdAt: (facturaGuardada as any).createdAt
        }
    }), {
        status: 201,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const POST = withCRUDDatabaseLogging('invoice')(withCRUDValidation('invoice', validationSchemas.invoice)(createInvoice));

const getInvoices: APIRoute = async ({ url }) => {
    await connectToMongoDB();
    
    const searchParams = new URLSearchParams(url.search);
    const status = searchParams.get('status');
    const supplier = searchParams.get('supplier');
    const branch = searchParams.get('branch');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters: any = {};
    if (status) filters.status = status;
    if (supplier) filters.supplier = supplier;
    if (branch) filters.branch = branch;

    // Obtener facturas con paginación
    const facturas = await InvoiceModel.find(filters)
        .populate('supplier', 'name email phone')
        .populate('branch', 'name code address city')
        .populate('createdBy', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(limit);

    // Contar total de facturas
    const totalFacturas = await InvoiceModel.countDocuments(filters);

    return new Response(JSON.stringify({
        success: true,
        invoices: facturas.map(factura => ({
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
        })),
        pagination: {
            page,
            limit,
            total: totalFacturas,
            pages: Math.ceil(totalFacturas / limit)
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withCRUDDatabaseLogging('invoice')(withReadOnly('invoice')(getInvoices));
