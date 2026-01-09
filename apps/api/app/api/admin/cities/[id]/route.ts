import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const idSchema = z.string().uuid();

const updateCitySchema = z.object({
  provinceId: z.string().uuid().optional(),
  nameFr: z.string().optional(),
  nameSw: z.string().optional(),
  nameLn: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const id = idSchema.parse(params.id);
    const body = await req.json();
    const data = updateCitySchema.parse(body);

    const old = await prisma.city.findUnique({ where: { id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.city.update({ where: { id }, data });
    await logAudit(user.id, 'UPDATE', 'cities', updated.id, old, updated, req);

    return NextResponse.json({ data: updated });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const id = idSchema.parse(params.id);

    const old = await prisma.city.findUnique({
      where: { id },
      include: { _count: { select: { markets: true } } },
    });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if ((old as any)._count?.markets > 0) {
      return NextResponse.json(
        { error: 'City has markets; delete markets first.' },
        { status: 409 }
      );
    }

    const deleted = await prisma.city.delete({ where: { id } });
    await logAudit(user.id, 'DELETE', 'cities', id, old, deleted, req);

    return NextResponse.json({ data: deleted });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


