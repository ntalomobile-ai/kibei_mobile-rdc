import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['open', 'resolved', 'dismissed']).optional(),
  resolvedNotes: z.string().optional(),
  transmittedToAuthorities: z.boolean().optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
});

// GET - Liste tous les signalements (admin uniquement)
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const transmitted = searchParams.get('transmitted');
    const priority = searchParams.get('priority') || undefined;

    const reports = await prisma.priceReport.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(transmitted !== null && transmitted !== undefined && { 
          transmittedToAuthorities: transmitted === 'true' 
        }),
        ...(priority && { priority }),
      },
      include: {
        product: { select: { nameFr: true, category: true, unitFr: true } },
        market: { 
          select: { 
            nameFr: true, 
            city: { 
              select: { 
                nameFr: true,
                province: { select: { nameFr: true, code: true } }
              } 
            } 
          } 
        },
        reportedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Statistiques
    const stats = await prisma.priceReport.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const transmitted_count = await prisma.priceReport.count({
      where: { transmittedToAuthorities: true },
    });

    return NextResponse.json({ 
      data: reports,
      stats: {
        byStatus: stats.reduce((acc, s) => ({ ...acc, [s.status]: s._count.id }), {}),
        transmitted: transmitted_count,
        total: reports.length,
      }
    });
  } catch (error) {
    return handleError(error as Error);
  }
}

// PUT - Mettre à jour un signalement
export async function PUT(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const reportId = searchParams.get('id');

    if (!reportId) {
      return NextResponse.json({ error: 'Report ID required' }, { status: 400 });
    }

    const body = await req.json();
    const data = updateSchema.parse(body);

    const existingReport = await prisma.priceReport.findUnique({
      where: { id: reportId },
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
    }

    const oldReport = JSON.parse(JSON.stringify(existingReport));

    const updateData: any = {};
    
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'resolved' || data.status === 'dismissed') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (data.resolvedNotes !== undefined) {
      updateData.resolvedNotes = data.resolvedNotes;
    }
    
    if (data.priority) {
      updateData.priority = data.priority;
    }
    
    if (data.transmittedToAuthorities !== undefined) {
      updateData.transmittedToAuthorities = data.transmittedToAuthorities;
      if (data.transmittedToAuthorities && !existingReport.transmittedToAuthorities) {
        updateData.transmittedAt = new Date();
      }
    }

    const updatedReport = await prisma.priceReport.update({
      where: { id: reportId },
      data: updateData,
      include: {
        product: { select: { nameFr: true } },
        market: { select: { nameFr: true } },
        reportedBy: { select: { fullName: true } },
      },
    });

    await logAudit(user.id, 'UPDATE', 'price_reports', reportId, oldReport, updatedReport, req);

    return NextResponse.json({ 
      success: true,
      message: 'Signalement mis à jour',
      data: updatedReport 
    });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}

