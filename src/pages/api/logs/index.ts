import type { APIRoute } from 'astro';
import connectToMongoDB from '../../../libs/mongoose';
import { LogModel } from '../../../models/Log';
import { withReadOnly } from '../../../libs/middleware';
import { withRole } from '../../../libs/middleware/auth';
import { Types } from 'mongoose';

const getLogs: APIRoute = async ({ url }) => {
    await connectToMongoDB();
    
    const searchParams = new URLSearchParams(url.search);
    const level = searchParams.get('level');
    const module = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const companyId = searchParams.get('companyId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Construir filtros
    const filters: any = {};
    if (level) filters.level = level;
    if (module) filters.module = module;
    if (action) filters.action = action;
    if (userId) filters.user = userId;
    if (companyId && Types.ObjectId.isValid(companyId)) {
        filters.company = companyId;
    }

    // Obtener logs con paginación
    const logs = await LogModel.find(filters)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    // Contar total de logs
    const totalLogs = await LogModel.countDocuments(filters);

    return new Response(JSON.stringify({
        success: true,
        logs: logs.map(log => ({
            id: log._id,
            level: log.level,
            message: log.message,
            module: log.module,
            action: log.action,
            user: log.user,
            entity: log.entity,
            additionalData: log.additionalData,
            ip: log.ip,
            userAgent: log.userAgent,
            createdAt: (log as any).createdAt
        })),
        pagination: {
            page,
            limit,
            total: totalLogs,
            pages: Math.ceil(totalLogs / limit)
        }
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

export const GET = withRole(['admin', 'superadmin'])(withReadOnly('logs')(getLogs));
