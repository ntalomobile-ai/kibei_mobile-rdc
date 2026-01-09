import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma, handleZodError } from '@/lib/api-utils';
import { randomBytes } from 'crypto';

const forgotPasswordSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
});

// Durée de validité du token de réinitialisation : 1 heure
const RESET_TOKEN_EXPIRY = 3600; // 1 heure en secondes

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Pour des raisons de sécurité, ne pas révéler si l'email existe ou non
    // Toujours retourner un succès même si l'utilisateur n'existe pas
    if (!user || !user.isActive) {
      // Attendre un peu pour éviter le timing attack
      await new Promise(resolve => setTimeout(resolve, 500));
      return NextResponse.json({
        success: true,
        message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.',
      });
    }

    // Générer un token sécurisé (hex, pas JWT)
    const token = randomBytes(32).toString('hex');

    // Calculer la date d'expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + RESET_TOKEN_EXPIRY);

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Créer le token de réinitialisation
    // Utiliser le token hex généré plutôt que le JWT pour le stockage en DB
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: token, // Stocker le token hex généré
        expiresAt,
      },
    });

    // Construire l'URL de réinitialisation
    // Utiliser le token hex pour l'URL, pas le JWT
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
    const resetUrl = `${webUrl}/reset-password?token=${token}`;

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // Pour l'instant, on log dans la console pour le développement
    console.log('=== PASSWORD RESET LINK ===');
    console.log(`User: ${user.email}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token expires at: ${expiresAt.toISOString()}`);
    console.log('===========================');

    // Dans un environnement de production, vous devriez envoyer un email ici
    // Exemple avec Resend, SendGrid, Nodemailer, etc.
    // await sendPasswordResetEmail(user.email, resetUrl);

    return NextResponse.json({
      success: true,
      message: 'Si cet email existe dans notre système, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;

    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}

