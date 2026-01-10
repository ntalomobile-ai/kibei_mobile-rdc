import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Statistiques de l'utilisateur
    const [
      totalReports,
      approvedReports,
      rejectedReports,
      recentReports,
      recentActivities,
    ] = await Promise.all([
      // Total de rapports soumis
      prisma.price.count({
        where: {
          submittedById: user.id,
          status: 'pending',
        },
      }),
      // Rapports approuvés
      prisma.price.count({
        where: {
          submittedById: user.id,
          status: 'approved',
        },
      }),
      // Rapports rejetés
      prisma.price.count({
        where: {
          submittedById: user.id,
          status: 'rejected',
        },
      }),
      // Rapports récents (7 derniers jours)
      prisma.price.count({
        where: {
          submittedById: user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Activités récentes
      prisma.price.findMany({
        where: {
          submittedById: user.id,
        },
        include: {
          product: {
            select: {
              nameFr: true,
            },
          },
          market: {
            select: {
              nameFr: true,
              city: {
                select: {
                  nameFr: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }),
    ]);

    // Fetch user's createdAt from DB
    const fullUser = await prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } });

    const stats = {
      totalReports,
      approvedReports,
      rejectedReports,
      pendingReports: totalReports,
      recentReports,
      recentActivities,
      joinedDate: fullUser?.createdAt || null,
      memberSince: fullUser?.createdAt
        ? Math.floor((Date.now() - new Date(fullUser.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        : null,
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    return handleError(error as Error);
  }
}

