import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, handleZodError } from '@/lib/api-utils';
import { hashPassword, verifyToken } from '@kibei/auth';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    // Chercher le token dans la base de données
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Vérifier que le token n'a pas été utilisé
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'Ce token a déjà été utilisé' },
        { status: 400 }
      );
    }

    // Vérifier que le token n'est pas expiré
    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Le token a expiré. Veuillez demander un nouveau lien de réinitialisation.' },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur existe et est actif
    if (!resetToken.user || !resetToken.user.isActive) {
      return NextResponse.json(
        { error: 'Compte utilisateur invalide' },
        { status: 400 }
      );
    }

    // Valider le token JWT (optionnel, pour vérification supplémentaire)
    try {
      const payload = await verifyToken(token);
      if (!payload || payload.sub !== resetToken.userId) {
        return NextResponse.json(
          { error: 'Token invalide' },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }

    // Hacher le nouveau mot de passe
    const passwordHash = hashPassword(password);

    // Mettre à jour le mot de passe de l'utilisateur
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });

    // Supprimer tous les autres tokens non utilisés pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: {
          not: resetToken.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Votre mot de passe a été réinitialisé avec succès.',
    });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;

    console.error('[Reset Password Error]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}

