import { NextRequest, NextResponse } from 'next/server';
import { handleError, handleZodError, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const querySchema = z.object({
  fromCurrency: z.string().length(3),
  toCurrency: z.string().length(3),
  cityId: z.string().uuid().optional(),
  take: z.coerce.number().int().min(2).max(60).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { fromCurrency, toCurrency, cityId, take } = querySchema.parse({
      fromCurrency: searchParams.get('fromCurrency'),
      toCurrency: searchParams.get('toCurrency'),
      cityId: searchParams.get('cityId') ?? undefined,
      take: searchParams.get('take') ?? undefined,
    });

    const history = await prisma.exchangeRate.findMany({
      where: {
        status: 'approved',
        fromCurrency,
        toCurrency,
        ...(cityId && { cityId }),
      },
      orderBy: { createdAt: 'asc' },
      take: take ?? 30,
      select: {
        id: true,
        fromCurrency: true,
        toCurrency: true,
        rate: true,
        createdAt: true,
        validatedAt: true,
        city: {
          select: {
            id: true,
            nameFr: true,
          },
        },
      },
    });

    return NextResponse.json({ data: history });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


