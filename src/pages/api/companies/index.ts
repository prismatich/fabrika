// src/pages/api/companies/index.ts
import type { APIRoute } from 'astro';
import { CompanyModel } from '../../../models';
import { connectDB } from '../../../libs/mongoose';
import { z } from 'zod';
import { withRole } from '../../../libs/middleware/auth';

// Esquema de validación para crear empresa
const createCompanySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  city: z.string().min(1, 'La ciudad es requerida'),
  country: z.string().optional(),
  taxId: z.string().optional(),
  subscriptionAmount: z.number().min(0).optional(),
  subscriptionCurrency: z.string().optional(),
});

// Esquema de validación para actualizar empresa
const updateCompanySchema = createCompanySchema.partial();

const getCompaniesHandler: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || '';

    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.subscriptionStatus = status;
    }

    const skip = (page - 1) * limit;

    const [companies, total] = await Promise.all([
      CompanyModel.find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      CompanyModel.countDocuments(query)
    ]);

    return new Response(JSON.stringify({
      success: true,
      data: companies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener empresas:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error interno del servidor'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

const createCompanyHandler: APIRoute = async ({ request }) => {
  try {
    await connectDB();
    
    const body = await request.json();
    const validatedData = createCompanySchema.parse(body);

    // Verificar si ya existe una empresa con el mismo email
    const existingCompany = await CompanyModel.findOne({ 
      email: validatedData.email 
    });

    if (existingCompany) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Ya existe una empresa con este email'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const company = new CompanyModel({
      ...validatedData,
      subscriptionAmount: validatedData.subscriptionAmount || 0,
      subscriptionCurrency: validatedData.subscriptionCurrency || 'USD'
    });

    await company.save();

    return new Response(JSON.stringify({
      success: true,
      data: company,
      message: 'Empresa creada exitosamente'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al crear empresa:', error);
    
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

// Aplicar middleware de roles
export const GET = withRole(['admin', 'superadmin'])(getCompaniesHandler);
export const POST = withRole(['superadmin'])(createCompanyHandler);
