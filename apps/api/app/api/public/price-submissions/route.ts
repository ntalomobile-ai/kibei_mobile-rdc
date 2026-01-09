import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const submitSchema = z.object({
  productId: z.string().uuid(),
  marketId: z.string().uuid(),
  price: z.number().positive(),
  currency: z.string().default('CDF'),
  notes: z.string().optional(),
});

// Public users can "signal" a price: we store it as a pending Price submission.
// Moderators/admins can validate it via existing moderation screens.
export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'user_public') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { productId, marketId, price, currency, notes } = submitSchema.parse(body);

    const record = await prisma.price.create({
      data: {
        productId,
        marketId,
        price,
        currency,
        submittedById: user.id,
        status: 'pending',
        notes: notes ? `[PUBLIC] ${notes}` : '[PUBLIC] Signalement utilisateur',
      },
      include: {
        product: true,
        market: { include: { city: { include: { province: true } } } },
      },
    });

    await logAudit(user.id, 'CREATE', 'prices', record.id, null, record, req);

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleError(error as Error);
  }
}


