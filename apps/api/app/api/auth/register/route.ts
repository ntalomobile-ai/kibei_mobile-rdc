import { NextRequest, NextResponse } from 'next/server';
import { signToken, setAuthCookie, hashPassword } from '@kibei/auth';
import { z } from 'zod';
import { prisma, handleZodError } from '@/lib/api-utils';
import { Role } from '@kibei/db';

const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  fullName: z.string().trim().min(1, 'Le nom complet est requis'),
  phoneNumber: z.string().trim().optional().transform((val) => {
    // Normaliser le numéro de téléphone (supprimer espaces, tirets, etc.)
    return val ? val.replace(/\s+/g, '').replace(/[-()]/g, '') : undefined;
  }),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, fullName, phoneNumber, password } = registerSchema.parse(body);

    // Vérifier si l'utilisateur existe déjà par email
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Vérifier si le numéro de téléphone existe déjà (si fourni)
    if (phoneNumber) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'Un compte avec ce numéro de téléphone existe déjà' },
          { status: 409 }
        );
      }
    }

    // Hacher le mot de passe
    const passwordHash = hashPassword(password);

    // Créer l'utilisateur avec le rôle user_public uniquement
    const newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        phoneNumber: phoneNumber || null,
        passwordHash,
        role: 'user_public', // Forcer le rôle user_public pour les inscriptions publiques
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        avatarUrl: true,
        isActive: true,
      },
    });

    // Générer les tokens (connecter automatiquement l'utilisateur)
    const accessToken = await signToken(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
        provinceId: undefined,
      },
      900 // 15 minutes
    );

    const refreshToken = await signToken(
      {
        sub: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      604800 // 7 days
    );

    const response = NextResponse.json({
      success: true,
      user: newUser,
      message: 'Inscription réussie',
    });

    // Définir les cookies
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
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;

    // Vérifier les erreurs Prisma (contraintes uniques, etc.)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      if (error.message.includes('phone_number')) {
        return NextResponse.json(
          { error: 'Un compte avec ce numéro de téléphone existe déjà' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    console.error('[Auth Register Error]', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}

