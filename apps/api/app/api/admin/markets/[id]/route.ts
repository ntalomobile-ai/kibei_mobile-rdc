import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, handleZodError, logAudit, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const updateMarketSchema = z.object({
  cityId: z.string().trim().min(1).optional(),
  nameFr: z.string().trim().min(1).optional(),
  nameSw: z.string().trim().min(1).optional(),
  nameLn: z.string().trim().min(1).optional(),
  // Note: imageUrl n'existe pas dans le modèle Market
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    console.log('[Update Market] Received body:', JSON.stringify(body, null, 2));
    const data = updateMarketSchema.parse(body);
    console.log('[Update Market] Parsed data:', JSON.stringify(data, null, 2));

    const oldMarket = await prisma.market.findUnique({ where: { id: params.id } });
    if (!oldMarket) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    // Vérifier que la ville existe si cityId est fourni
    if (data.cityId) {
      const city = await prisma.city.findUnique({
        where: { id: data.cityId },
      });
      if (!city) {
        return NextResponse.json({ error: 'Ville introuvable' }, { status: 400 });
      }
    }

    // Construire l'objet de données à mettre à jour (seulement les champs fournis)
    // Note: Le modèle Market n'a pas de champ imageUrl dans le schéma Prisma
    const updateData: any = {};
    if (data.cityId !== undefined) {
      // Pour Prisma, on doit utiliser la relation avec connect
      updateData.city = { connect: { id: data.cityId } };
    }
    if (data.nameFr !== undefined) updateData.nameFr = data.nameFr;
    if (data.nameSw !== undefined) updateData.nameSw = data.nameSw;
    if (data.nameLn !== undefined) updateData.nameLn = data.nameLn;
    // imageUrl n'existe pas dans le modèle Market, on l'ignore
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Vérifier qu'il y a au moins un champ à mettre à jour
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }

    console.log('[Update Market] Data to update:', updateData);

    const market = await prisma.market.update({
      where: { id: params.id },
      data: updateData,
    });

    // Log audit de manière non-bloquante
    try {
      await logAudit(user.id, 'UPDATE', 'markets', market.id, oldMarket, market, req);
    } catch (auditError) {
      console.error('[Audit Log Error]', auditError);
      // Ne pas bloquer la mise à jour si l'audit échoue
    }

    return NextResponse.json({ data: market });
  } catch (error) {
    console.error('[Update Market Error]', error);
    const zodErrorResponse = handleZodError(error);
    if (zodErrorResponse) return zodErrorResponse;
    // Gérer les erreurs Prisma spécifiques
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any;
      console.error('[Prisma Error]', prismaError);
      if (prismaError.code === 'P2002') {
        return NextResponse.json({ error: 'Un marché avec ce nom existe déjà dans cette ville' }, { status: 400 });
      }
      if (prismaError.code === 'P2003') {
        return NextResponse.json({ error: 'Ville introuvable' }, { status: 400 });
      }
    }
    return handleError(error as Error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const oldMarket = await prisma.market.findUnique({ where: { id: params.id } });
    if (!oldMarket) {
      return NextResponse.json({ error: 'Market not found' }, { status: 404 });
    }

    await prisma.market.delete({ where: { id: params.id } });
    await logAudit(user.id, 'DELETE', 'markets', params.id, oldMarket, null, req);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error as Error);
  }
}

