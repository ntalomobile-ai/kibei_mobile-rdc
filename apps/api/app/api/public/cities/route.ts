import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const provinceId = searchParams.get('provinceId');

    const cities = await prisma.city.findMany({
      where: {
        ...(provinceId && { provinceId }),
      },
      orderBy: { nameFr: 'asc' },
      include: {
        province: true,
        markets: {
          where: { isActive: true },
          orderBy: { nameFr: 'asc' },
        },
      },
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    return handleError(error as Error);
  }
}


