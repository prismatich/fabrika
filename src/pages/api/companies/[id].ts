// src/pages/api/companies/[id].ts
import type { APIRoute } from 'astro';
import { CompanyModel } from '../../../models';
import connectDB from '../../../libs/mongoose';
import { z } from 'zod';
import { Types } from 'mongoose';
import { withRole } from '../../../libs/middleware/auth';

// Esquema de validación para actualizar empresa
const updateCompanySchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'expired', 'suspended', 'cancelled']).optional(),
  subscriptionAmount: z.number().min(0).optional(),
  subscriptionCurrency: z.string().optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  active: z.boolean().optional(),
});

// Esquema para renovar suscripción
const renewSubscriptionSchema = z.object({
  months: z.number().min(1).max(12).default(1),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
});

const getCompanyHandler: APIRoute = async ({ params }) => {
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

    return new Response(JSON.stringify({
      success: true,
      data: company
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener empresa:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

const updateCompanyHandler: APIRoute = async ({ params, request }) => {
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

    const body = await request.json();
    const validatedData = updateCompanySchema.parse(body);

    // Verificar si existe la empresa
    const existingCompany = await CompanyModel.findById(id);
    if (!existingCompany) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Empresa no encontrada'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Si se está actualizando el email, verificar que no exista otra empresa con el mismo email
    if (validatedData.email && validatedData.email !== existingCompany.email) {
      const emailExists = await CompanyModel.findOne({ 
        email: validatedData.email,
        _id: { $ne: id }
      });

      if (emailExists) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Ya existe una empresa con este email'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      id,
      { $set: validatedData },
      { new: true, runValidators: true }
    );

    return new Response(JSON.stringify({
      success: true,
      data: updatedCompany,
      message: 'Empresa actualizada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    
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

const deleteCompanyHandler: APIRoute = async ({ params }) => {
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

    // En lugar de eliminar, marcar como inactiva
    await CompanyModel.findByIdAndUpdate(id, { 
      active: false,
      subscriptionStatus: 'cancelled'
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Empresa desactivada exitosamente'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al desactivar empresa:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Aplicar middleware de roles
export const GET = withRole(['admin', 'superadmin'])(getCompanyHandler);
export const PUT = withRole(['admin', 'superadmin'])(updateCompanyHandler);
export const DELETE = withRole(['superadmin'])(deleteCompanyHandler);
