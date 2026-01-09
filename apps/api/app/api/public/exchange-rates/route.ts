import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId');

    console.log('[ExchangeRates] Fetching rates, cityId:', cityId);

    const rates = await prisma.exchangeRate.findMany({
      where: {
        status: 'approved',
        ...(cityId && { cityId }),
      },
      include: {
        city: {
          select: {
            id: true,
            nameFr: true,
            province: {
              select: {
                id: true,
                nameFr: true,
              },
            },
          },
        },
      },
      orderBy: { validatedAt: 'desc' },
      take: 100,
    });

    console.log(`[ExchangeRates] Found ${rates.length} rates`);

    // Dédupliquer manuellement: garder le taux le plus récent pour chaque combinaison (fromCurrency, toCurrency, cityId)
    const uniqueRatesMap = new Map<string, any>();
    for (const rate of rates) {
      const key = `${rate.fromCurrency}-${rate.toCurrency}-${rate.cityId || 'global'}`;
      if (!uniqueRatesMap.has(key)) {
        uniqueRatesMap.set(key, rate);
      }
    }

    const uniqueRates = Array.from(uniqueRatesMap.values()).slice(0, 50);
    console.log(`[ExchangeRates] Returning ${uniqueRates.length} unique rates`);

    return NextResponse.json({ data: uniqueRates });
  } catch (error) {
    console.error('[ExchangeRates] Error:', error);
    return handleError(error as Error);
  }
}
