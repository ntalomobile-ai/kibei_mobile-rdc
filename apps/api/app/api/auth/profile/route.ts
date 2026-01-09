import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Le nom complet est requis').optional(),
  phoneNumber: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      // Normaliser le numéro de téléphone (supprimer espaces, tirets, etc.)
      return val ? val.replace(/\s+/g, '').replace(/[-()]/g, '') : null;
    })
    .nullable(),
  email: z.string().email().trim().toLowerCase().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updateData = updateProfileSchema.parse(body);

    // Vérifier si l'email existe déjà (si fourni et différent de l'actuel)
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Un compte avec cet email existe déjà' },
          { status: 409 }
        );
      }
    }

    // Vérifier si le numéro de téléphone existe déjà (si fourni et différent de l'actuel)
    if (updateData.phoneNumber) {
      const currentUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { phoneNumber: true },
      });

      if (updateData.phoneNumber !== currentUser?.phoneNumber) {
        const existingUser = await prisma.user.findUnique({
          where: { phoneNumber: updateData.phoneNumber },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: 'Un compte avec ce numéro de téléphone existe déjà' },
            { status: 409 }
          );
        }
      }
    }

    // Mettre à jour l'utilisateur (seul le propriétaire peut modifier son propre profil)
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(updateData.fullName && { fullName: updateData.fullName }),
        ...(updateData.phoneNumber !== undefined && { phoneNumber: updateData.phoneNumber }),
        ...(updateData.email && { email: updateData.email }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        provinceId: true,
        marketId: true,
        isActive: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil mis à jour avec succès',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return NextResponse.json(
        { error: firstError.message || 'Données invalides' },
        { status: 400 }
      );
    }

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

    console.error('[Update Profile Error]', error);
    return handleError(error as Error);
  }
}

