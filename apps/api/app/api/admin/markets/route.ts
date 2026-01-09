import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const createMarketSchema = z.object({
  cityId: z.string().trim().min(1),
  nameFr: z.string().trim().min(1),
  nameSw: z.string().trim().min(1),
  nameLn: z.string().trim().min(1),
  imageUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
});

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const markets = await prisma.market.findMany({
      include: {
        city: {
          include: {
            province: true,
          },
        },
        _count: { select: { prices: true } },
      },
      orderBy: [{ city: { province: { nameFr: 'asc' } } }, { city: { nameFr: 'asc' } }, { nameFr: 'asc' }],
    });

    return NextResponse.json({ data: markets });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const data = createMarketSchema.parse(body);

    const market = await prisma.market.create({ data });
    await logAudit(user.id, 'CREATE', 'markets', market.id, null, market, req);

    return NextResponse.json({ data: market }, { status: 201 });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}

