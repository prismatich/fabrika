// src/pages/api/companies/[id]/subscription-status.ts
import type { APIRoute } from 'astro';
import { CompanyModel } from '../../../../models';
import connectDB from '../../../../libs/mongoose';
import { Types } from 'mongoose';
import { withRole } from '../../../../libs/middleware/auth';

const getSubscriptionStatusHandler: APIRoute = async ({ params }) => {
  try {
    await connectDB();
    
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

    const company = await CompanyModel.findById(id).lean();
    if (!company) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Empresa no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verificar si la suscripción está activa
    const isActive = company.subscriptionStatus === 'active' && 
      (!company.subscriptionEndDate || new Date() <= new Date(company.subscriptionEndDate));

    const daysUntilExpiry = company.subscriptionEndDate 
      ? Math.ceil((new Date(company.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const subscriptionStatus = {
      isActive,
      status: company.subscriptionStatus,
      paymentStatus: company.paymentStatus,
      startDate: company.subscriptionStartDate,
      endDate: company.subscriptionEndDate,
      nextPaymentDate: company.nextPaymentDate,
      lastPaymentDate: company.lastPaymentDate,
      amount: company.subscriptionAmount,
      currency: company.subscriptionCurrency,
      daysUntilExpiry: daysUntilExpiry && daysUntilExpiry > 0 ? daysUntilExpiry : 0,
      isExpired: daysUntilExpiry !== null && daysUntilExpiry <= 0,
      isExpiringSoon: daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0
    };

    return new Response(JSON.stringify({
      success: true,
      data: subscriptionStatus
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al verificar estado de suscripción:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Aplicar middleware de roles - solo administradores y superadministradores pueden ver estados de suscripción
export const GET = withRole(['admin', 'superadmin'])(getSubscriptionStatusHandler);
