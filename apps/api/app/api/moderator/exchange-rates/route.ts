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
      // Les modérateurs voient seulement les taux soumis par des collecteurs de leur province
      // ou les taux globaux (sans ville)
      where.OR = [
        { cityId: null }, // Taux globaux
        {
          city: {
            provinceId: user.provinceId!,
          },
        },
        {
          submittedBy: {
            provinceId: user.provinceId!,
          },
        },
      ];
    }
    // Les admins voient tous les taux en attente (pas de filtre supplémentaire)

    const pendingRates = await prisma.exchangeRate.findMany({
      where,
      include: {
        city: {
          include: {
            province: true,
          },
        },
        submittedBy: {
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
            provinceId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ data: pendingRates });
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
    const rateId = searchParams.get('id');
    if (!rateId) {
      return NextResponse.json({ error: 'Rate ID required' }, { status: 400 });
    }

    const body = await req.json();
    const { approved, notes } = validateSchema.parse(body);

    const rate = await prisma.exchangeRate.findUnique({
      where: { id: rateId },
      include: { submittedBy: { select: { id: true, provinceId: true } } },
    });

    if (!rate) {
      return NextResponse.json({ error: 'Rate not found' }, { status: 404 });
    }

    // CRITICAL: Moderators can ONLY validate rates submitted by collectors from their province
    if (user.role === 'moderator') {
      if (rate.submittedBy.provinceId !== user.provinceId) {
        return NextResponse.json(
          { error: 'Forbidden: You can only validate rates from your province' },
          { status: 403 }
        );
      }
    }

    const oldRate = JSON.parse(JSON.stringify(rate));

    const updatedRate = await prisma.exchangeRate.update({
      where: { id: rateId },
      data: {
        status: approved ? 'approved' : 'rejected',
        validatedById: user.id,
        validatedAt: new Date(),
        notes: notes || rate.notes,
      },
    });

    await logAudit(user.id, 'UPDATE', 'exchange_rates', rateId, oldRate, updatedRate, req);

    return NextResponse.json({ data: updatedRate });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Données invalides' },
        { status: 400 }
      );
    }
    return handleError(error as Error);
  }
}
