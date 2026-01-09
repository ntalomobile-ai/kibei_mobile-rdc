import { NextRequest, NextResponse } from 'next/server';
import { handleError, handleZodError, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const idSchema = z.string().uuid();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = idSchema.parse(params.id);

    const price = await prisma.price.findFirst({
      where: { id, status: 'approved' },
      include: {
        product: true,
        market: { include: { city: { include: { province: true } } } },
        submittedBy: {
          select: { id: true, fullName: true },
        },
      },
    });

    if (!price) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const history = await prisma.price.findMany({
      where: {
        status: 'approved',
        productId: price.productId,
        marketId: price.marketId,
      },
      orderBy: { createdAt: 'asc' },
      take: 30,
      select: {
        id: true,
        price: true,
        currency: true,
        createdAt: true,
        validatedAt: true,
      },
    });

    return NextResponse.json({ data: { price, history } });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


