import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, hashPassword } from '@kibei/auth';
import { prisma, handleZodError } from '@/lib/api-utils';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetSchema.parse(body);

    // Verify token (will throw AuthError on invalid/expired)
    const payload = await verifyToken(token);

    // Update user's password
    await prisma.user.update({
      where: { id: payload.sub },
      data: { passwordHash: hashPassword(password) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const zodResponse = handleZodError(error);
    if (zodResponse) return zodResponse;

    console.error('[Reset Password Error]', error);
    return NextResponse.json({ error: 'Invalid token or server error' }, { status: 400 });
  }
}
