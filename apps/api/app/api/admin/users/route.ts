import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@kibei/db';
import { authenticate, handleError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';
import { hashPassword } from '@kibei/auth';

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string(),
  password: z.string().min(8),
  role: z.enum(['user_public', 'collector', 'moderator', 'admin']),
  provinceId: z.string().uuid().optional(),
  marketId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  password: z.string().min(8).optional(),
  role: z.enum(['user_public', 'collector', 'moderator', 'admin']).optional(),
  provinceId: z.string().uuid().nullable().optional(),
  marketId: z.string().uuid().nullable().optional(),
  isActive: z.boolean().optional(),
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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        province: { select: { id: true, nameFr: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: users });
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
    const { email, fullName, password, role, provinceId, marketId } = createUserSchema.parse(body);

    const passwordHash = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: role as Role,
        provinceId,
        marketId,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    await logAudit(user.id, 'CREATE', 'users', newUser.id, null, newUser, req);

    return NextResponse.json({ data: newUser }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleError(error as Error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateUserSchema.parse(body);

    const data: any = { ...parsed };
    if (parsed.password) {
      data.passwordHash = hashPassword(parsed.password);
      delete data.password;
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
        province: { select: { id: true, nameFr: true } },
      },
    });

    await logAudit(user.id, 'UPDATE', 'users', updated.id, null, updated, req);

    return NextResponse.json({ data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return handleError(error as Error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Soft-delete: disable account to preserve referential integrity.
    const disabled = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    await logAudit(user.id, 'DISABLE', 'users', disabled.id, null, disabled, req);

    return NextResponse.json({ data: disabled });
  } catch (error) {
    return handleError(error as Error);
  }
}
