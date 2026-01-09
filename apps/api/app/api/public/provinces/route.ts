import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { nameFr: 'asc' },
      include: {
        cities: {
          orderBy: { nameFr: 'asc' },
          include: {
            markets: {
              where: { isActive: true },
              orderBy: { nameFr: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json({ data: provinces });
  } catch (error) {
    return handleError(error as Error);
  }
}
