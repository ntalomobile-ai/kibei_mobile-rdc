import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const createProductSchema = z.object({
  code: z.string().trim().min(1),
  nameFr: z.string().trim().min(1),
  nameSw: z.string().trim().min(1),
  nameLn: z.string().trim().min(1),
  category: z.string().trim().min(1),
  unitFr: z.string().trim().min(1),
  unitSw: z.string().trim().min(1),
  unitLn: z.string().trim().min(1),
  imageUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
  descriptionFr: z.string().trim().optional(),
  descriptionSw: z.string().trim().optional(),
  descriptionLn: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { nameFr: 'asc' },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const {
      code,
      nameFr,
      nameSw,
      nameLn,
      category,
      unitFr,
      unitSw,
      unitLn,
      imageUrl,
      descriptionFr,
      descriptionSw,
      descriptionLn,
    } = createProductSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        code,
        nameFr,
        nameSw,
        nameLn,
        category,
        unitFr,
        unitSw,
        unitLn,
        imageUrl,
        descriptionFr,
        descriptionSw,
        descriptionLn,
      },
    });

    await logAudit(user.id, 'CREATE', 'products', product.id, null, product, req);

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}
