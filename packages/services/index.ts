import { PrismaClient, Role } from '@kibei/db';

const prisma = new PrismaClient();

export interface PriceService {
  submitPrice(
    productId: string,
    marketId: string,
    price: number,
    userId: string
  ): Promise<any>;
  getApprovedPrices(marketId?: string): Promise<any[]>;
  validatePrice(priceId: string, approved: boolean, validatorId: string): Promise<any>;
}

export interface ExchangeRateService {
  submitExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    userId: string
  ): Promise<any>;
  getLatestExchangeRates(): Promise<any[]>;
  validateExchangeRate(rateId: string, approved: boolean, validatorId: string): Promise<any>;
}

export class PriceServiceImpl implements PriceService {
  async submitPrice(
    productId: string,
    marketId: string,
    price: number,
    userId: string
  ) {
    return prisma.price.create({
      data: {
        productId,
        marketId,
        price,
        submittedById: userId,
        status: 'pending',
      },
      include: {
        product: true,
        market: true,
        submittedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async getApprovedPrices(marketId?: string) {
    return prisma.price.findMany({
      where: {
        status: 'approved',
        ...(marketId && { marketId }),
      },
      include: {
        product: true,
        market: { include: { city: { include: { province: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async validatePrice(priceId: string, approved: boolean, validatorId: string) {
    return prisma.price.update({
      where: { id: priceId },
      data: {
        status: approved ? 'approved' : 'rejected',
        validatedById: validatorId,
        validatedAt: new Date(),
      },
    });
  }
}

export class ExchangeRateServiceImpl implements ExchangeRateService {
  async submitExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
    userId: string
  ) {
    return prisma.exchangeRate.create({
      data: {
        fromCurrency,
        toCurrency,
        rate,
        submittedById: userId,
        status: 'pending',
      },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
      },
    });
  }

  async getLatestExchangeRates() {
    return prisma.exchangeRate.findMany({
      where: { status: 'approved' },
      distinct: ['fromCurrency', 'toCurrency'],
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateExchangeRate(rateId: string, approved: boolean, validatorId: string) {
    return prisma.exchangeRate.update({
      where: { id: rateId },
      data: {
        status: approved ? 'approved' : 'rejected',
        validatedById: validatorId,
        validatedAt: new Date(),
      },
    });
  }
}
