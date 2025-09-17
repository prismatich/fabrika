// src/pages/api/companies/[id]/renew-subscription.ts
import type { APIRoute } from 'astro';
import { CompanyModel } from '../../../../models';
import { PaymentStatus } from '../../../../models/Company';
import connectToMongoDB from '../../../../libs/mongoose';
import { z } from 'zod';
import { Types } from 'mongoose';
import { withRole } from '../../../../libs/middleware/auth';

// Esquema para renovar suscripción
const renewSubscriptionSchema = z.object({
  months: z.number().min(1).max(12).default(1),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
});

const renewSubscriptionHandler: APIRoute = async ({ params, request }) => {
  try {
    await connectToMongoDB();
    
    const { id } = params;
    
    if (!id || !Types.ObjectId.isValid(id)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'ID de empresa inválido'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const validatedData = renewSubscriptionSchema.parse(body);

    const company = await CompanyModel.findById(id);
    if (!company) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Empresa no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Actualizar datos de suscripción si se proporcionan
    if (validatedData.amount) {
      company.subscriptionAmount = validatedData.amount;
    }
    if (validatedData.currency) {
      company.subscriptionCurrency = validatedData.currency;
    }

    // Renovar suscripción
    company.renewSubscription(validatedData.months);

    // Actualizar información de pago si se proporciona
    if (validatedData.paymentMethod) {
      company.paymentStatus = PaymentStatus.PAID;
      company.lastPaymentDate = new Date();
    }
    if (validatedData.paymentReference) {
      company.paymentReference = validatedData.paymentReference;
    }

    await company.save();

    return new Response(JSON.stringify({
      success: true,
      data: company,
      message: `Suscripción renovada por ${validatedData.months} mes(es)`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al renovar suscripción:', error);
    
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Datos inválidos',
        errors: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Aplicar middleware de roles - solo superadministradores pueden renovar suscripciones
export const POST = withRole(['superadmin'])(renewSubscriptionHandler);
