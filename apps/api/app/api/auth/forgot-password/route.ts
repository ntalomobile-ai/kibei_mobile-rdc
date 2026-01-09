import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/api-utils';
import { randomBytes } from 'crypto';
import { signToken } from '@kibei/auth';

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

    // Générer un token sécurisé
    const token = randomBytes(32).toString('hex');
    
    // Créer un JWT pour le token (optionnel, pour validation côté serveur)
    const jwtToken = await signToken(
      {
        sub: user.id,
        email: user.email,
        token,
      },
      RESET_TOKEN_EXPIRY
    );

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
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: jwtToken, // Stocker le JWT comme token
        expiresAt,
      },
    });

    // Construire l'URL de réinitialisation
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
    const resetUrl = `${webUrl}/reset-password?token=${jwtToken}`;

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
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message || 'Données invalides' },
        { status: 400 }
      );
    }

    console.error('[Forgot Password Error]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}

