import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const createProvinceSchema = z.object({
  code: z.string().trim().min(1),
  nameFr: z.string().trim().min(1),
  nameSw: z.string().trim().min(1),
  nameLn: z.string().trim().min(1),
  capitalCity: z.string().trim().optional(),
  population: z.number().optional(),
  isPilot: z.boolean().optional(),
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

    const provinces = await prisma.province.findMany({
      include: {
        _count: { select: { cities: true, users: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: provinces });
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
    const { code, nameFr, nameSw, nameLn, capitalCity, population, isPilot } =
      createProvinceSchema.parse(body);

    const province = await prisma.province.create({
      data: {
        code,
        nameFr,
        nameSw,
        nameLn,
        capitalCity,
        population,
        isPilot,
      },
    });

    await logAudit(user.id, 'CREATE', 'provinces', province.id, null, province, req);

    return NextResponse.json({ data: province }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError?.message || 'Données invalides' },
        { status: 400 }
      );
    }
    return handleError(error as Error);
  }
}
