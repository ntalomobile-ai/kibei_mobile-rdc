import { NextRequest, NextResponse } from 'next/server';
import { handleError, handleZodError, prisma } from '@/lib/api-utils';
import { z } from 'zod';

function toNum(v: any): number | null {
  if (v == null) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  try {
    const s = typeof v?.toString === 'function' ? v.toString() : String(v);
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

const querySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { take } = querySchema.parse({
      take: searchParams.get('take') ?? undefined,
    });

    const limit = take ?? 20;

    console.log('[Notifications] Fetching approved prices...');
    const approvedPrices = await prisma.price.findMany({
      where: {
        status: 'approved',
        // “validé par modérateur/admin” ⇒ validatedById/validatedAt généralement remplis.
        // On ne force pas validatedAt car seed/dev peut avoir des approved sans validatedAt.
      },
      include: {
        product: true,
        market: { include: { city: { include: { province: true } } } },
        validatedBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: [{ validatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    console.log(`[Notifications] Found ${approvedPrices.length} approved prices`);
    
    const priceEvents = await Promise.all(
      approvedPrices.map(async (p) => {
        try {
          const prev = await prisma.price.findFirst({
            where: {
              status: 'approved',
              productId: p.productId,
              marketId: p.marketId,
              createdAt: { lt: p.createdAt },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true, price: true, currency: true, createdAt: true, validatedAt: true },
          });

          const current = toNum(p.price);
          const previous = toNum(prev?.price);
          const delta = current != null && previous != null ? current - previous : null;
          const pct = delta != null && previous != null && previous !== 0 ? (delta / previous) * 100 : null;

          const direction =
            delta == null ? 'new' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';

          return {
            type: 'price' as const,
            id: p.id,
            product: p.product,
            market: p.market,
            currency: p.currency,
            price: current,
            createdAt: p.createdAt,
            validatedAt: p.validatedAt,
            validatedBy: p.validatedBy,
            previousPrice: previous,
            previousAt: prev?.validatedAt || prev?.createdAt || null,
            delta,
            pct,
            direction,
          };
        } catch (err) {
          console.error('[Notifications] Error processing price:', p.id, err);
          throw err;
        }
      })
    );

    console.log('[Notifications] Fetching approved rates...');
    const approvedRates = await prisma.exchangeRate.findMany({
      where: { status: 'approved' },
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
        validatedBy: { select: { id: true, fullName: true, role: true } },
      },
      orderBy: [{ validatedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });

    console.log(`[Notifications] Found ${approvedRates.length} approved rates`);

    const rateEvents = await Promise.all(
      approvedRates.map(async (r) => {
        try {
          const prev = await prisma.exchangeRate.findFirst({
            where: {
              status: 'approved',
              fromCurrency: r.fromCurrency,
              toCurrency: r.toCurrency,
              cityId: r.cityId || null,
              createdAt: { lt: r.createdAt },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true, rate: true, createdAt: true, validatedAt: true },
          });

          const current = toNum(r.rate);
          const previous = toNum(prev?.rate);
          const delta = current != null && previous != null ? current - previous : null;
          const pct = delta != null && previous != null && previous !== 0 ? (delta / previous) * 100 : null;
          const direction =
            delta == null ? 'new' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';

          return {
            type: 'rate' as const,
            id: r.id,
            fromCurrency: r.fromCurrency,
            toCurrency: r.toCurrency,
            rate: current,
            city: r.city || null,
            createdAt: r.createdAt,
            validatedAt: r.validatedAt,
            validatedBy: r.validatedBy,
            previousRate: previous,
            previousAt: prev?.validatedAt || prev?.createdAt || null,
            delta,
            pct,
            direction,
          };
        } catch (err) {
          console.error('[Notifications] Error processing rate:', r.id, err);
          throw err;
        }
      })
    );

    console.log('[Notifications] Merging and sorting...');
    const merged = [...priceEvents, ...rateEvents].sort((a: any, b: any) => {
      const ad = new Date(a.validatedAt || a.createdAt).getTime();
      const bd = new Date(b.validatedAt || b.createdAt).getTime();
      return bd - ad;
    });

    console.log(`[Notifications] Returning ${merged.length} notifications`);
    return NextResponse.json({ data: merged.slice(0, limit) });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


