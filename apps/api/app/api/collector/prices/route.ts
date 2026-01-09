import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const submitPriceSchema = z.object({
  productId: z.string().uuid(),
  marketId: z.string().uuid(),
  price: z.number().positive(),
  currency: z.string().default('CDF'),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['collector', 'moderator', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, marketId, price, currency, notes } = submitPriceSchema.parse(body);

    const priceRecord = await prisma.price.create({
      data: {
        productId,
        marketId,
        price,
        currency,
        submittedById: user.id,
        status: 'pending',
        notes,
      },
      include: {
        product: true,
        market: true,
      },
    });

    await logAudit(user.id, 'CREATE', 'prices', priceRecord.id, null, priceRecord, req);

    return NextResponse.json({ data: priceRecord }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return handleError(error as Error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['collector', 'moderator', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // Construire la condition where selon le rôle
    const where: any = {};
    
    if (user.role === 'collector') {
      // Les collecteurs voient seulement leurs propres soumissions
      where.submittedById = user.id;
    } else if (user.role === 'moderator') {
      // Les modérateurs voient toutes les soumissions de leur province
      if (!user.provinceId) {
        return NextResponse.json(
          { error: 'Moderator must be assigned to a province' },
          { status: 403 }
        );
      }
      where.market = {
        city: {
          provinceId: user.provinceId,
        },
      };
    }
    // Les admins voient toutes les soumissions (pas de filtre supplémentaire)

    if (status) {
      where.status = status as any;
    }

    const prices = await prisma.price.findMany({
      where,
      include: {
        product: true,
        market: { include: { city: { include: { province: true } } } },
        submittedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ data: prices });
  } catch (error) {
    return handleError(error as Error);
  }
}