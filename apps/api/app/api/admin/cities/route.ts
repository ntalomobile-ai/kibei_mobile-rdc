import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const createCitySchema = z.object({
  provinceId: z.string().trim().min(1),
  nameFr: z.string().trim().min(1),
  nameSw: z.string().trim().min(1),
  nameLn: z.string().trim().min(1),
  imageUrl: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.string().optional()
  ),
});

export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const cities = await prisma.city.findMany({
      include: {
        province: true,
        _count: { select: { markets: true } },
      },
      orderBy: [{ province: { nameFr: 'asc' } }, { nameFr: 'asc' }],
    });

    return NextResponse.json({ data: cities });
  } catch (error) {
    return handleError(error as Error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const data = createCitySchema.parse(body);

    // Vérifier que la province existe
    const province = await prisma.province.findUnique({
      where: { id: data.provinceId },
    });

    if (!province) {
      return NextResponse.json({ error: 'Province introuvable' }, { status: 400 });
    }

    const city = await prisma.city.create({ data });
    await logAudit(user.id, 'CREATE', 'cities', city.id, null, city, req);

    return NextResponse.json({ data: city }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    // Gérer les erreurs Prisma spécifiques
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ error: 'Une ville avec ce nom existe déjà dans cette province' }, { status: 400 });
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: 'Province introuvable' }, { status: 400 });
      }
    }
    return handleError(error as Error);
  }
}


