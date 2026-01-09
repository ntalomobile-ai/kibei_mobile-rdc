import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const marketId = searchParams.get('marketId');
    const productId = searchParams.get('productId');
    const provinceId = searchParams.get('provinceId');
    const cityId = searchParams.get('cityId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const take = parseInt(searchParams.get('take') || '100', 10);

    // Construire les filtres
    const where: any = {
      status: 'approved',
    };

    if (marketId) {
      where.marketId = marketId;
    }

    if (productId) {
      where.productId = productId;
    }

    if (provinceId) {
      where.market = {
        ...where.market,
        city: {
          ...where.market?.city,
          provinceId,
        },
      };
    }

    if (cityId) {
      where.market = {
        ...where.market,
        cityId,
      };
    }

    if (category) {
      where.product = {
        ...where.product,
        category,
      };
    }

    // Note: La recherche textuelle sera effectuée côté client pour plus de flexibilité
    // On récupère tous les prix approuvés et on filtre côté client
    // Cela permet aussi d'éviter les problèmes de compatibilité avec Prisma

    // Get approved prices with all details (optional filters)
    const prices = await prisma.price.findMany({
      where,
      include: {
        product: true,
        market: {
          include: {
            city: {
              include: {
                province: true,
              },
            },
          },
        },
        submittedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(take, 500), // Limiter à 500 pour éviter les surcharges
    });

    return NextResponse.json({ data: prices });
  } catch (error) {
    return handleError(error as Error);
  }
}
