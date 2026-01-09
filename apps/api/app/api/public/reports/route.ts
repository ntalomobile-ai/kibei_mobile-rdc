import { NextRequest, NextResponse } from 'next/server';
import { authenticate, handleError, prisma } from '@/lib/api-utils';
import { z } from 'zod';

const reportSchema = z.object({
  productId: z.string().uuid(),
  marketId: z.string().uuid(),
  observedPrice: z.number().positive(),
  currency: z.string().default('CDF'),
  reason: z.string().min(10, 'Veuillez fournir une description détaillée'),
});

// POST - Soumettre un signalement de prix trop élevé
export async function POST(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const data = reportSchema.parse(body);

    // Vérifier que le produit et le marché existent
    const [product, market] = await Promise.all([
      prisma.product.findUnique({ where: { id: data.productId } }),
      prisma.market.findUnique({ where: { id: data.marketId } }),
    ]);

    if (!product) {
      return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
    }
    if (!market) {
      return NextResponse.json({ error: 'Marché introuvable' }, { status: 404 });
    }

    // Créer le signalement
    const report = await prisma.priceReport.create({
      data: {
        productId: data.productId,
        marketId: data.marketId,
        observedPrice: data.observedPrice,
        currency: data.currency,
        reportedById: user.id,
        reasonFr: data.reason,
        reasonSw: data.reason, // TODO: traduction
        reasonLn: data.reason, // TODO: traduction
        status: 'open',
        priority: 'normal',
      },
      include: {
        product: { select: { nameFr: true } },
        market: { select: { nameFr: true, city: { select: { nameFr: true } } } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Signalement enregistré avec succès',
      data: report,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return handleError(error as Error);
  }
}

// GET - Récupérer les signalements (pour admin)
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Seuls les admins et modérateurs peuvent voir les signalements
    if (!['admin', 'moderator'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const transmitted = searchParams.get('transmitted');

    const reports = await prisma.priceReport.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(transmitted !== null && { 
          transmittedToAuthorities: transmitted === 'true' 
        }),
      },
      include: {
        product: { select: { nameFr: true, category: true, unitFr: true } },
        market: { 
          select: { 
            nameFr: true, 
            city: { 
              select: { 
                nameFr: true,
                province: { select: { nameFr: true } }
              } 
            } 
          } 
        },
        reportedBy: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: [
        { status: 'asc' }, // open first
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ data: reports });
  } catch (error) {
    return handleError(error as Error);
  }
}

