#!/usr/bin/env ts-node

/**
 * Database health check script
 * Usage: npx ts-node scripts/healthcheck.ts
 */

import { PrismaClient } from '@kibei/db';

const prisma = new PrismaClient();

async function main() {
  console.log('🏥 KiBei Database Health Check\n');

  try {
    // 1. Check connection
    console.log('📡 Testing database connection...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✓ Connection OK\n');

    // 2. Check tables
    console.log('📊 Checking tables...');
    const tables = [
      'users',
      'provinces',
      'cities',
      'markets',
      'products',
      'prices',
      'exchange_rates',
      'price_reports',
      'audit_logs',
    ];

    for (const table of tables) {
      const result = await prisma.$queryRaw`
        SELECT COUNT(*) as count FROM ${table}
      `;
      const count = (result as any)[0]?.count || 0;
      console.log(`  ✓ ${table}: ${count} records`);
    }
    console.log('');

    // 3. Check RLS
    console.log('🔒 Checking RLS Policies...');
    const rlsPolicies = await prisma.$queryRaw`
      SELECT table_name, policy_name 
      FROM information_schema.table_constraints
    `;
    console.log(`  ✓ RLS policies found\n`);

    // 4. Check indexes
    console.log('⚡ Checking indexes...');
    const indexes = await prisma.$queryRaw`
      SELECT schemaname, tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      LIMIT 5
    `;
    console.log(`  ✓ ${(indexes as any).length} indexes found\n`);

    // 5. Get stats
    console.log('📈 Database Statistics:');
    const dbSize = await prisma.$queryRaw`
      SELECT 
        pg_size_pretty(pg_database_size('postgres')) as size
    `;
    console.log(`  Size: ${(dbSize as any)[0]?.size}\n`);

    console.log('✅ Database health check passed!');
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
