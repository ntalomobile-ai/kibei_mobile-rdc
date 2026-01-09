import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const validateSchema = z.object({
  approved: z.boolean(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Moderators MUST have a province assigned
    if (user.role === 'moderator' && !user.provinceId) {
      return NextResponse.json(
        { error: 'Moderator must be assigned to a province' },
        { status: 403 }
      );
    }

    // Construire la condition where selon le rôle
    const where: any = {
      status: 'pending',
    };

    if (user.role === 'moderator') {
      // Les modérateurs voient seulement les prix de leur province
      where.market = {
        city: {
          provinceId: user.provinceId!,
        },
      };
    }
    // Les admins voient tous les prix en attente (pas de filtre supplémentaire)

    // Get pending prices in moderator's province (or all for admin)
    const pendingPrices = await prisma.price.findMany({
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

    return NextResponse.json({ data: pendingPrices });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['moderator', 'admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Moderators MUST have a province assigned
    if (user.role === 'moderator' && !user.provinceId) {
      return NextResponse.json(
        { error: 'Moderator must be assigned to a province' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const priceId = searchParams.get('id');
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { approved, notes } = validateSchema.parse(body);

    // Verify price belongs to moderator's province
    const price = await prisma.price.findUnique({
      where: { id: priceId },
      include: { market: { include: { city: { include: { province: true } } } } },
    });

    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    // CRITICAL: Moderators can ONLY validate prices from their own province
    if (user.role === 'moderator') {
      if (price.market.city.province.id !== user.provinceId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only validate prices from your province' },
          { status: 403 }
        );
      }
    }

    const oldPrice = JSON.parse(JSON.stringify(price));

    const updatedPrice = await prisma.price.update({
      where: { id: priceId },
      data: {
        status: approved ? 'approved' : 'rejected',
        validatedById: user.id,
        validatedAt: new Date(),
        notes: notes || price.notes,
      },
    });

    await logAudit(user.id, 'UPDATE', 'prices', priceId, oldPrice, updatedPrice, req);

    return NextResponse.json({ data: updatedPrice });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return handleError(error as Error);
  }
}
