import { PrismaClient } from '@kibei/db';
import { hashPassword } from '@kibei/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seed de la base de données...\n');

  try {
    // Clean existing data (ordre important pour les foreign keys)
    console.log('🗑️  Nettoyage des données existantes...');
    await prisma.priceReport.deleteMany();
    await prisma.price.deleteMany();
    await prisma.exchangeRate.deleteMany();
    await prisma.market.deleteMany();
    await prisma.city.deleteMany();
    await prisma.province.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Nettoyage complété\n');

    // Seed Provinces
    console.log('📍 Création des provinces...');
    const lualaba = await prisma.province.create({
      data: {
        code: 'LBA',
        nameFr: 'Lualaba',
        nameSw: 'Lualaba',
        nameLn: 'Lualaba',
        capitalCity: 'Kolwezi',
        population: 1600000,
        isPilot: true,
        descriptionFr: 'Province pilote pour KiBei',
      },
    });

    const katanga = await prisma.province.create({
      data: {
        code: 'KTG',
        nameFr: 'Katanga',
        nameSw: 'Katanga',
        nameLn: 'Katanga',
        capitalCity: 'Lubumbashi',
        population: 2000000,
        isPilot: false,
      },
    });

    console.log(`✓ 2 provinces créées\n`);

    // Seed Cities
    console.log('🏙️  Création des villes...');
    const kolwezi = await prisma.city.create({
      data: {
        provinceId: lualaba.id,
        nameFr: 'Kolwezi',
        nameSw: 'Kolwezi',
        nameLn: 'Kolwezi',
        latitude: -10.715,
        longitude: 25.426,
        population: 500000,
      },
    });

    const dilolo = await prisma.city.create({
      data: {
        provinceId: lualaba.id,
        nameFr: 'Dilolo',
        nameSw: 'Dilolo',
        nameLn: 'Dilolo',
        latitude: -11.4,
        longitude: 23.5,
        population: 50000,
      },
    });

    const lubumbashi = await prisma.city.create({
      data: {
        provinceId: katanga.id,
        nameFr: 'Lubumbashi',
        nameSw: 'Lubumbashi',
        nameLn: 'Lubumbashi',
        latitude: -11.66,
        longitude: 27.58,
        population: 1300000,
      },
    });

    console.log('✓ 3 villes créées\n');

    // Seed Markets
    console.log('🛒 Création des marchés...');
    const market1 = await prisma.market.create({
      data: {
        cityId: kolwezi.id,
        nameFr: 'Marché Central de Kolwezi',
        nameSw: 'Sokoni Kuu la Kolwezi',
        nameLn: 'Zando Monene ya Kolwezi',
        locationGps: '-10.715,25.426',
      },
    });

    const market2 = await prisma.market.create({
      data: {
        cityId: kolwezi.id,
        nameFr: 'Marché Kamoa',
        nameSw: 'Sokoni Kamoa',
        nameLn: 'Zando Kamoa',
        locationGps: '-10.72,25.43',
      },
    });

    const market3 = await prisma.market.create({
      data: {
        cityId: dilolo.id,
        nameFr: 'Marché de Dilolo',
        nameSw: 'Sokoni ya Dilolo',
        nameLn: 'Zando ya Dilolo',
        locationGps: '-11.4,23.5',
      },
    });

    console.log('✓ 3 marchés créés\n');

    // Seed Products
    console.log('🥘 Création des produits...');
    const products = [
      {
        code: 'MAIZE',
        nameFr: 'Maïs',
        nameSw: 'Mahindi',
        nameLn: 'Liwa',
        category: 'Agriculture',
        unitFr: 'kg',
        unitSw: 'kg',
        unitLn: 'kg',
      },
      {
        code: 'RICE',
        nameFr: 'Riz',
        nameSw: 'Wali',
        nameLn: 'Mbengo',
        category: 'Agriculture',
        unitFr: 'kg',
        unitSw: 'kg',
        unitLn: 'kg',
      },
      {
        code: 'BEANS',
        nameFr: 'Haricots',
        nameSw: 'Maharagwe',
        nameLn: 'Mbimbi',
        category: 'Agriculture',
        unitFr: 'kg',
        unitSw: 'kg',
        unitLn: 'kg',
      },
      {
        code: 'OIL',
        nameFr: 'Huile de Palme',
        nameSw: 'Mafuta ya Palme',
        nameLn: 'Mafuta ma Palme',
        category: 'Food',
        unitFr: 'litre',
        unitSw: 'lita',
        unitLn: 'lita',
      },
      {
        code: 'FUEL',
        nameFr: 'Essence',
        nameSw: 'Mafuta ya Petrol',
        nameLn: 'Mafuta ma Petrol',
        category: 'Energy',
        unitFr: 'litre',
        unitSw: 'lita',
        unitLn: 'lita',
      },
    ];

    const createdProducts = [];
    for (const product of products) {
      const created = await prisma.product.create({ data: product });
      createdProducts.push(created);
    }

    console.log(`✓ ${createdProducts.length} produits créés\n`);

    // Seed Users
    console.log('👤 Création des utilisateurs...');
    const adminPassword = hashPassword('AdminKiBei123!');
    const collectorPassword = hashPassword('Collector123!');
    const moderatorPassword = hashPassword('Moderator123!');

    const admin = await prisma.user.create({
      data: {
        email: 'admin@kibei.cd',
        passwordHash: adminPassword,
        fullName: 'Admin KiBei',
        role: 'admin',
      },
    });

    const collector = await prisma.user.create({
      data: {
        email: 'collecteur@kibei.cd',
        passwordHash: collectorPassword,
        fullName: 'Collecteur RDC',
        role: 'collector',
        marketId: market1.id,
      },
    });

    const moderator = await prisma.user.create({
      data: {
        email: 'moderateur@kibei.cd',
        passwordHash: moderatorPassword,
        fullName: 'Modérateur Lualaba',
        role: 'moderator',
        provinceId: lualaba.id,
      },
    });

    const publicUser = await prisma.user.create({
      data: {
        email: 'user@kibei.cd',
        passwordHash: hashPassword('User123!'),
        fullName: 'Utilisateur Public',
        role: 'user_public',
      },
    });

    console.log('✓ 4 utilisateurs créés\n');

    // Seed Sample Prices
    console.log('💰 Création des prix d\'exemple...');
    await prisma.price.create({
      data: {
        productId: createdProducts[0].id, // Maïs
        marketId: market1.id,
        submittedById: collector.id,
        price: 450.0, // CDF
        currency: 'CDF',
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    await prisma.price.create({
      data: {
        productId: createdProducts[1].id, // Riz
        marketId: market1.id,
        submittedById: collector.id,
        price: 780.0, // CDF
        currency: 'CDF',
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    console.log('✓ 2 prix créés\n');

    // Seed Exchange Rates (par ville)
    console.log('💱 Création des taux de change par ville...');
    
    // Dilolo - Taux de la capitale Lualaba
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: 'USD',
        toCurrency: 'CDF',
        rate: 2750.0,
        cityId: dilolo.id,
        submittedById: collector.id,
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    // Lubumbashi - Taux légèrement différent (plus proche de la Zambie)
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: 'USD',
        toCurrency: 'CDF',
        rate: 2800.0,
        cityId: lubumbashi.id,
        submittedById: collector.id,
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    // Kolwezi - Taux similaire à Lubumbashi
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: 'USD',
        toCurrency: 'CDF',
        rate: 2820.0,
        cityId: kolwezi.id,
        submittedById: collector.id,
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    // Taux ZMW pour Lubumbashi (proche de la frontière zambienne)
    await prisma.exchangeRate.create({
      data: {
        fromCurrency: 'ZMW',
        toCurrency: 'CDF',
        rate: 140.0,
        cityId: lubumbashi.id,
        submittedById: collector.id,
        status: 'approved',
        validatedById: moderator.id,
        validatedAt: new Date(),
      },
    });

    console.log('✓ 4 taux de change créés (par ville)\n');

    console.log('✅ Seed complété avec succès!\n');
    console.log('📊 Statistiques:');
    console.log(`  - Provinces: 2`);
    console.log(`  - Villes: 3`);
    console.log(`  - Marchés: 3`);
    console.log(`  - Produits: ${createdProducts.length}`);
    console.log(`  - Utilisateurs: 4`);
    console.log(`  - Prix: 2`);
    console.log(`  - Taux de change: 4 (par ville)\n`);

    console.log('🔐 Comptes de test:');
    console.log('  Admin: admin@kibei.cd / AdminKiBei123!');
    console.log('  Collecteur: collecteur@kibei.cd / Collector123!');
    console.log('  Modérateur: moderateur@kibei.cd / Moderator123!');
    console.log('  Public: user@kibei.cd / User123!\n');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
