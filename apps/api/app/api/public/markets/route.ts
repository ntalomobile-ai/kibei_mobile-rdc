import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cityId = searchParams.get('cityId');
    const provinceId = searchParams.get('provinceId');

    const markets = await prisma.market.findMany({
      where: {
        isActive: true,
        ...(cityId && { cityId }),
        ...(provinceId && { city: { provinceId } }),
      },
      orderBy: { nameFr: 'asc' },
      include: {
        city: { include: { province: true } },
      },
    });

    return NextResponse.json({ data: markets });
  } catch (error) {
    return handleError(error as Error);
  }
}


