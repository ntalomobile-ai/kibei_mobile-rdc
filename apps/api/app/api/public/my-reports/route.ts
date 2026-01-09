import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, prisma } from '@/lib/api-utils';

// GET - Récupérer les signalements de l'utilisateur connecté
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reports = await prisma.priceReport.findMany({
      where: {
        reportedById: user.id,
      },
      include: {
        product: { 
          select: { 
            nameFr: true, 
            category: true, 
            unitFr: true,
            imageUrl: true,
          } 
        },
        market: { 
          select: { 
            nameFr: true, 
            city: { 
              select: { 
                nameFr: true,
                province: { select: { nameFr: true } }
              } 
            } 
          } 
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Statistiques personnelles
    const stats = {
      total: reports.length,
      open: reports.filter(r => r.status === 'open').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      dismissed: reports.filter(r => r.status === 'dismissed').length,
      transmitted: reports.filter(r => r.transmittedToAuthorities).length,
    };

    return NextResponse.json({ 
      data: reports,
      stats,
    });
  } catch (error) {
    return handleError(error as Error);
  }
}

