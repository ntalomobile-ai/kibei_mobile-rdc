import { NextRequest, NextResponse } from 'next/server';
import { signToken, setAuthCookie, hashPassword, verifyPassword, AuthError } from '@kibei/auth';
import { z } from 'zod';
import { authenticate } from '@/lib/api-utils';

import { prisma } from '@/lib/api-utils';

const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Identifiant requis'), // email, nom complet ou téléphone
  password: z.string().min(1, 'Mot de passe requis'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = loginSchema.parse(body);

    // Normaliser l'identifiant (supprimer les espaces, convertir en minuscules pour email)
    const normalizedIdentifier = identifier.trim().toLowerCase();

    // Chercher l'utilisateur par email, nom complet ou numéro de téléphone
    // Pour les utilisateurs publics, on accepte nom complet ou téléphone
    // Pour les autres rôles, on accepte uniquement l'email
    let user = null;

    // D'abord, essayer par email (pour tous les rôles)
    user = await prisma.user.findUnique({
      where: { email: normalizedIdentifier },
    });

    // Si pas trouvé et que c'est un utilisateur public, essayer par nom complet ou téléphone
    if (!user) {
      // Chercher par nom complet (insensible à la casse)
      user = await prisma.user.findFirst({
        where: {
          role: 'user_public',
          fullName: {
            equals: identifier.trim(),
            mode: 'insensitive', // Insensible à la casse
          },
        },
      });
    }

    // Si toujours pas trouvé, essayer par numéro de téléphone (pour utilisateurs publics uniquement)
    if (!user) {
      // Normaliser le numéro de téléphone (supprimer espaces, tirets, etc.)
      const normalizedPhone = identifier.replace(/\s+/g, '').replace(/[-()]/g, '');
      user = await prisma.user.findFirst({
        where: {
          role: 'user_public',
          phoneNumber: {
            equals: normalizedPhone,
            mode: 'insensitive',
          },
        },
      });
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Identifiant ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    const accessToken = await signToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        provinceId: user.provinceId || undefined,
      },
      900 // 15 minutes
    );

    const refreshToken = await signToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      604800 // 7 days
    );

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isActive: user.isActive,
      },
    });

    // Set cookies
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 900,
      path: '/',
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    console.error('[Auth Login Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
