import { NextRequest, NextResponse } from 'next/server';
import { handleError, prisma } from '@/lib/api-utils';

export async function GET(req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { nameFr: 'asc' },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    return handleError(error as Error);
  }
}


