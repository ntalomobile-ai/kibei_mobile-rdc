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

    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        province: true,
        markets: {
          where: { isActive: true },
          orderBy: { nameFr: 'asc' },
        },
      },
    });

    if (!city) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data: city });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


