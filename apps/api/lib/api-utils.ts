import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@kibei/auth';
import type { Role } from '@kibei/db';
import { ZodError } from 'zod';

function normalizeDatabaseUrl(raw: string): string {
  // Supabase Postgres requires SSL in most configurations.
  // Prisma can report "Can't reach database server" when SSL is required but not enabled.
  const url = new URL(raw);

  const host = url.hostname;
  const isLocal =
    host === 'localhost' || host === '127.0.0.1' || host === '::1' || host.endsWith('.local');

  if (isLocal) return raw;

  const hasSslMode = url.searchParams.has('sslmode');
  if (!hasSslMode) url.searchParams.set('sslmode', 'require');

  return url.toString();
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: normalizeDatabaseUrl(process.env.DATABASE_URL) } }
      : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export interface AuthRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: Role;
    provinceId?: string;
  };
}

export async function authenticate(req: AuthRequest) {
  try {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      provinceId: payload.provinceId,
    };
  } catch {
    return null;
  }
}

export function requireAuth(allowedRoles?: Role[]) {
  return async (req: AuthRequest) => {
    const user = await authenticate(req);

    if (!user) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
      });
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
      });
    }

    req.user = user;
    return null;
  };
}

export function handleZodError(error: unknown): NextResponse | null {
  if (error instanceof ZodError) {
    // Utiliser une assertion de type pour accéder à la propriété errors
    const zodError = error as unknown as { errors?: Array<{ message?: string }> };
    const firstError = zodError.errors?.[0];
    return NextResponse.json(
      { error: firstError?.message || 'Données invalides' },
      { status: 400 }
    );
  }
  return null;
}

export function handleError(error: Error) {
  console.error('[API Error]', error);

  if (error.message.includes('Unique constraint failed')) {
    return new NextResponse(JSON.stringify({ error: 'Resource already exists' }), {
      status: 409,
    });
  }

  const isProd = process.env.NODE_ENV === 'production';
  return new NextResponse(
    JSON.stringify({
      error: 'Internal Server Error',
      ...(isProd ? {} : { message: error.message }),
    }),
    { status: 500 }
  );
}

export async function logAudit(
  userId: string | null,
  action: string,
  tableName: string,
  recordId: string | null,
  oldValues: any = null,
  newValues: any = null,
  req?: NextRequest
) {
  try {
    const ip = req?.headers.get('x-forwarded-for') || req?.headers.get('x-real-ip') || 'unknown';
    const userAgent = req?.headers.get('user-agent') || undefined;

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValues,
        newValues,
        ipAddress: ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error('[Audit Log Error]', error);
  }
}

