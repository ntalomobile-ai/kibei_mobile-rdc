import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const idSchema = z.string().uuid();

const updateProductSchema = z.object({
  code: z.string().optional(),
  nameFr: z.string().optional(),
  nameSw: z.string().optional(),
  nameLn: z.string().optional(),
  category: z.string().optional(),
  unitFr: z.string().optional(),
  unitSw: z.string().optional(),
  unitLn: z.string().optional(),
  imageUrl: z.string().url().nullable().optional(),
  descriptionFr: z.string().nullable().optional(),
  descriptionSw: z.string().nullable().optional(),
  descriptionLn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
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
    const data = updateProductSchema.parse(body);

    const old = await prisma.product.findUnique({ where: { id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data,
    });

    await logAudit(user.id, 'UPDATE', 'products', updated.id, old, updated, req);
    return NextResponse.json({ data: updated });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}

// "Delete" as soft-disable: isActive=false
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const id = idSchema.parse(params.id);
    const old = await prisma.product.findUnique({ where: { id } });
    if (!old) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    await logAudit(user.id, 'DELETE', 'products', updated.id, old, updated, req);
    return NextResponse.json({ data: updated });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    return handleError(error as Error);
  }
}


