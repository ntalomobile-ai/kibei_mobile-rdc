import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats: any = {
      submissions: 0,
      approved: 0,
      toValidate: 0,
      mySubmissions: 0,
      myApproved: 0,
      myRejected: 0,
    };

    // Statistiques selon le rôle
    if (user.role === 'collector') {
      // Mes soumissions
      const [myPrices, myRates] = await Promise.all([
        prisma.price.count({ where: { submittedById: user.id } }),
        prisma.exchangeRate.count({ where: { submittedById: user.id } }),
      ]);
      stats.mySubmissions = myPrices + myRates;

      const [myApprovedPrices, myApprovedRates] = await Promise.all([
        prisma.price.count({ where: { submittedById: user.id, status: 'approved' } }),
        prisma.exchangeRate.count({ where: { submittedById: user.id, status: 'approved' } }),
      ]);
      stats.myApproved = myApprovedPrices + myApprovedRates;

      const [myRejectedPrices, myRejectedRates] = await Promise.all([
        prisma.price.count({ where: { submittedById: user.id, status: 'rejected' } }),
        prisma.exchangeRate.count({ where: { submittedById: user.id, status: 'rejected' } }),
      ]);
      stats.myRejected = myRejectedPrices + myRejectedRates;

      const [myPendingPrices, myPendingRates] = await Promise.all([
        prisma.price.count({ where: { submittedById: user.id, status: 'pending' } }),
        prisma.exchangeRate.count({ where: { submittedById: user.id, status: 'pending' } }),
      ]);
      stats.submissions = myPendingPrices + myPendingRates;
    }

    if (user.role === 'moderator') {
      // Statistiques de ma province
      const provinceFilter = user.provinceId
        ? { market: { city: { province: { id: user.provinceId } } } }
        : {};

      const [pendingPrices, pendingRates] = await Promise.all([
        prisma.price.count({
          where: {
            status: 'pending',
            ...provinceFilter,
          },
        }),
        prisma.exchangeRate.count({
          where: {
            status: 'pending',
            submittedBy: user.provinceId ? { provinceId: user.provinceId } : undefined,
          },
        }),
      ]);
      stats.toValidate = pendingPrices + pendingRates;

      const [approvedPrices, approvedRates] = await Promise.all([
        prisma.price.count({
          where: {
            status: 'approved',
            validatedById: user.id,
          },
        }),
        prisma.exchangeRate.count({
          where: {
            status: 'approved',
            validatedById: user.id,
          },
        }),
      ]);
      stats.approved = approvedPrices + approvedRates;
    }

    if (user.role === 'admin') {
      // Statistiques complètes pour l'admin
      const [
        pendingPrices,
        pendingRates,
        approvedPrices,
        approvedRates,
        rejectedPrices,
        rejectedRates,
        totalPrices,
        totalRates,
        totalUsers,
        totalProvinces,
        totalCities,
        totalMarkets,
        totalProducts,
        usersByRole,
        recentPrices,
        recentRates,
        priceReports,
      ] = await Promise.all([
        prisma.price.count({ where: { status: 'pending' } }),
        prisma.exchangeRate.count({ where: { status: 'pending' } }),
        prisma.price.count({ where: { status: 'approved' } }),
        prisma.exchangeRate.count({ where: { status: 'approved' } }),
        prisma.price.count({ where: { status: 'rejected' } }),
        prisma.exchangeRate.count({ where: { status: 'rejected' } }),
        prisma.price.count(),
        prisma.exchangeRate.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.province.count(),
        prisma.city.count(),
        prisma.market.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isActive: true } }),
        prisma.user.groupBy({
          by: ['role'],
          where: { isActive: true },
          _count: true,
        }),
        prisma.price.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            product: { select: { nameFr: true } },
            market: { include: { city: { include: { province: { select: { nameFr: true } } } } } },
            submittedBy: { select: { fullName: true, email: true } },
          },
        }),
        prisma.exchangeRate.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            city: { include: { province: { select: { nameFr: true } } } },
            submittedBy: { select: { fullName: true, email: true } },
          },
        }),
        prisma.priceReport.count({ where: { status: 'open' } }),
      ]);

      stats.toValidate = pendingPrices + pendingRates;
      stats.approved = approvedPrices + approvedRates;
      stats.submissions = totalPrices + totalRates;
      stats.rejected = rejectedPrices + rejectedRates;
      stats.totalUsers = totalUsers;
      stats.totalProvinces = totalProvinces;
      stats.totalCities = totalCities;
      stats.totalMarkets = totalMarkets;
      stats.totalProducts = totalProducts;
      stats.pendingPrices = pendingPrices;
      stats.pendingRates = pendingRates;
      stats.approvedPrices = approvedPrices;
      stats.approvedRates = approvedRates;
      stats.usersByRole = usersByRole.reduce((acc: any, item: any) => {
        acc[item.role] = item._count;
        return acc;
      }, {});
      stats.recentPrices = recentPrices;
      stats.recentRates = recentRates;
      stats.openReports = priceReports;
    }

    return NextResponse.json({ data: stats });
  } catch (error) {
    return handleError(error as Error);
  }
}

