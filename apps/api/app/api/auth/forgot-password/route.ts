import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { signToken } from '@kibei/auth';
import { prisma, handleZodError } from '@/lib/api-utils';

const RESET_TOKEN_EXPIRY = 60 * 60; // 1 hour

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotSchema.parse(body);

    const normalized = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalized } });

    if (user) {
      // Sign a time-limited reset token.
      const token = await signToken(
        { sub: user.id, email: user.email, role: user.role },
        RESET_TOKEN_EXPIRY
      );

      // Build reset URL (client route expected at /reset-password)
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset-password?token=${encodeURIComponent(token)}`;

      const brevoApiKey = process.env.BREVO_API_KEY;
      const brevoSender = process.env.BREVO_SENDER_EMAIL;

      if (brevoApiKey && brevoSender) {
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': brevoApiKey,
            },
            body: JSON.stringify({
              sender: { email: brevoSender },
              to: [{ email: user.email }],
              subject: 'Réinitialisation de votre mot de passe',
              htmlContent: `<p>Bonjour,</p><p>Cliquez sur <a href="${resetUrl}">ce lien</a> pour réinitialiser votre mot de passe. Le lien expire dans 1 heure.</p>`,
            }),
          });
        } catch (err) {
          console.error('[Brevo send error]', err);
        }
      } else {
        // Fallback dev behaviour: log the token URL (DO NOT log API keys)
        console.log(`[DEV] Password reset URL for ${user.email}: ${resetUrl}`);
      }
    }

    // Always return success to avoid leaking user existence
    return NextResponse.json({ success: true });
  } catch (error) {
    const zodResponse = handleZodError(error);
    if (zodResponse) return zodResponse;

    console.error('[Forgot Password Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
