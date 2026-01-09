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

    const market = await prisma.market.findUnique({
      where: { id },
      include: {
        city: {
          include: {
            province: true,
          },
        },
      },
    });

    if (!market) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data: market });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


