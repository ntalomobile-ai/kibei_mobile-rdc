# KiBei Deployment Guide

## 🚀 Pre-Deployment Checklist

### Code Quality
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] TypeScript strict mode compliant
- [ ] ESLint passing
- [ ] Code reviewed

### Security
- [ ] JWT_SECRET = random 32+ chars
- [ ] Database backups enabled
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Environment variables protected
- [ ] Password hashing with bcryptjs
- [ ] Rate limiting enabled

### Database
- [ ] Migrations tested locally
- [ ] RLS policies validated
- [ ] Indexes created
- [ ] Backup strategy in place
- [ ] Connection pooling configured

### Performance
- [ ] Build optimized
- [ ] Images optimized
- [ ] Database queries profiled
- [ ] Caching configured

---

## 🌍 Environment Setup

### Production Environment Variables

```env
# App
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.kibei.cd
NEXT_PUBLIC_WEB_URL=https://kibei.cd

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://user:pass@db.supabase.co:5432/postgres

# JWT
JWT_SECRET=random-32-character-secret-key-here
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# Optional
SENTRY_DSN=https://...@sentry.io/...
DATADOG_API_KEY=...
```

---

## 📋 Deployment Platforms

### Option 1: Vercel (Recommended)

#### API Deployment
```bash
# 1. Connect GitHub repository
# 2. In Vercel dashboard:
#    - Select "packages/api" as root
#    - Set environment variables
#    - Deploy

# Or manually:
vercel --prod --confirm
```

#### Web Deployment
```bash
# 1. Similar steps for apps/web
# 2. Set environment variables
# 3. Deploy

vercel --prod --confirm
```

### Option 2: Railway

```bash
# 1. Create project on Railway
# 2. Connect GitHub
# 3. Select monorepo root
# 4. Add environment variables
# 5. Configure build command:
npm run build
# 6. Configure start command:
npm run start
```

### Option 3: Render

```bash
# Create build command:
npm install && npm run build

# Create start command:
npm run start
```

---

## 🗄️ Database Deployment

### Supabase (Recommended)

```bash
# 1. Create project
# 2. Go to SQL Editor
# 3. Run schema.sql:
psql postgresql://user:pass@db.supabase.co:5432/postgres < scripts/schema.sql

# 4. Run migrations
npm run db:migrate --workspace=@kibei/db

# 5. Run seed
npm run db:seed --workspace=@kibei/db

# 6. Enable RLS
# Already in schema.sql
```

### AWS RDS

```bash
# 1. Create PostgreSQL instance
# 2. Configure security groups
# 3. Update DATABASE_URL
# 4. Run schema and migrations
psql -h endpoint.rds.amazonaws.com -U admin -d kibei < scripts/schema.sql
```

---

## 🔒 Security Hardening

### 1. SSL/TLS
```bash
# Use HTTPS everywhere
# Redirect HTTP to HTTPS
```

### 2. CORS Configuration
```typescript
// apps/api/middleware.ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_WEB_URL,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Credentials': 'true',
};
```

### 3. Rate Limiting
```typescript
// Install ratelimit library
npm install @vercel/kv

// In API routes
import { Ratelimit } from '@vercel/kv';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
});

const { success } = await ratelimit.limit(`ip:${ip}`);
if (!success) return new Response('Rate limited', { status: 429 });
```

### 4. Headers Security
```typescript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ];
  },
};
```

---

## 📊 Monitoring & Logging

### Sentry Error Tracking
```bash
npm install @sentry/nextjs

# In next.config.js
withSentryConfig(nextConfig, {
  org: 'kibei',
  project: 'kibei-api',
});
```

### Datadog APM
```bash
npm install dd-trace

# In server
import tracer from 'dd-trace';
tracer.init();
```

### Custom Logging
```typescript
// lib/logger.ts
export function log(level: string, message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const log = { timestamp, level, message, data };
  
  if (process.env.NODE_ENV === 'production') {
    // Send to log aggregator (LogStash, etc)
    fetch('https://logs.kibei.cd', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  } else {
    console.log(JSON.stringify(log));
  }
}
```

---

## 🧪 Testing Before Deploy

### Local Testing
```bash
# Install dependencies
npm install

# Run tests
npm run test

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Test build
npm run start
```

### Staging Environment
```bash
# Create staging branch
git checkout -b staging

# Deploy to staging
git push -u origin staging

# Test in staging
# - Login test
# - Submit price test
# - Validate price test
# - Admin CRUD test
```

---

## 📈 Post-Deployment

### Health Checks
```bash
# API health
curl https://api.kibei.cd

# Database connection
npm run db:healthcheck --workspace=@kibei/db

# Monitoring
# - Check Sentry dashboard
# - Check Datadog APM
# - Check Vercel analytics
```

### Performance Monitoring
```bash
# Core Web Vitals
# Target: LCP < 2.5s, FID < 100ms, CLS < 0.1

# API Response Times
# Target: < 200ms for most endpoints

# Database Query Times
# Target: < 100ms for most queries
```

### Backup & Disaster Recovery

```bash
# Daily database backups
# Via Supabase: automated snapshots every 24h
# Or cron job:
0 2 * * * /scripts/backup.sh

# Backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
gsutil cp backup-*.sql gs://kibei-backups/
```

---

## 🔄 Continuous Deployment

### GitHub Actions Setup
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run deploy:prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue:** Database connection timeout
```bash
# Solution: Check DATABASE_URL and network
# Test connection:
psql $DATABASE_URL -c "SELECT 1"
```

**Issue:** JWT verification failed
```bash
# Solution: Verify JWT_SECRET matches across apps
echo $JWT_SECRET | wc -c  # Should be > 32
```

**Issue:** CORS errors
```bash
# Solution: Check CORS headers and origins
# Verify NEXT_PUBLIC_WEB_URL is correct
```

**Issue:** Image upload fails
```bash
# Solution: Check Supabase Storage bucket permissions
# Verify SUPABASE_SERVICE_ROLE_KEY has access
```

---

## 📝 Rollback Procedure

```bash
# If deployment fails:
1. Revert code:
   git revert <commit-hash>
   git push

2. Redeploy previous version:
   vercel --prod --confirm

3. Monitor:
   - Check error logs
   - Monitor performance
   - Verify API health

4. Post-mortem:
   - Identify root cause
   - Fix locally
   - Re-test before deploy
```

---

**Version:** 0.1.0  
**Last Updated:** December 22, 2024  
**Status:** 🟩 Ready for Production
