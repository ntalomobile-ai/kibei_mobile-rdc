import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';
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
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleError(error as Error);
  }
}


