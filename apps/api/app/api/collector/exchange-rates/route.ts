import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const submitRateSchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  rate: z.number().positive(),
  cityId: z.string().uuid().optional(),
  source: z.string().optional(),
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
    const { fromCurrency, toCurrency, rate, cityId, source, notes } = submitRateSchema.parse(body);

    const rateRecord = await prisma.exchangeRate.create({
      data: {
        fromCurrency,
        toCurrency,
        rate,
        cityId: cityId || null,
        source,
        submittedById: user.id,
        status: 'pending',
        notes,
      },
    });

    await logAudit(user.id, 'CREATE', 'exchange_rates', rateRecord.id, null, rateRecord, req);

    return NextResponse.json({ data: rateRecord }, { status: 201 });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
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
      where.OR = [
        { cityId: null }, // Taux globaux
        {
          city: {
            provinceId: user.provinceId,
          },
        },
      ];
    }
    // Les admins voient toutes les soumissions (pas de filtre supplémentaire)

    if (status) {
      where.status = status as any;
    }

    const rates = await prisma.exchangeRate.findMany({
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ data: rates });
  } catch (error) {
    return handleError(error as Error);
  }
}