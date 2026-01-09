# KiBei Development Setup & Commands

## 🚀 Quick Start (5 minutes)

```bash
# 1. Clone repo
git clone https://github.com/kibei/mobile-rdc.git
cd kibei

# 2. Run quick start script
bash scripts/quickstart.sh

# 3. Start development
npm run dev
```

## 📦 Installation Commands

```bash
# Install all dependencies
npm install

# Install a specific package
npm install <package> --workspace=@kibei/db

# Update dependencies
npm update
```

## 🏃 Development Commands

```bash
# Start all services (API + Web)
npm run dev

# Start specific service
npm run dev --workspace=@kibei/api      # API only
npm run dev --workspace=kibei-web       # Web only

# Watch mode for specific package
npm run watch --workspace=@kibei/auth
```

## 🗄️ Database Commands

```bash
# Push Prisma schema to database
npm run db:push --workspace=@kibei/db

# Create & run migration
npm run db:migrate --workspace=@kibei/db

# Seed database with test data
npm run db:seed --workspace=@kibei/db

# Open Prisma Studio (UI)
npx prisma studio
```

## 🔧 Code Quality Commands

```bash
# Type check all packages
npm run type-check

# Lint all code
npm run lint

# Format code
npm run format

# Run tests (when implemented)
npm test
```

## 🏗️ Build Commands

```bash
# Build all packages
npm run build

# Build specific package
npm run build --workspace=@kibei/db

# Analyze bundle size
npm run analyze

# Production build
NODE_ENV=production npm run build
```

## 📝 Documentation Commands

```bash
# Generate API docs (when implemented)
npm run docs

# Start docs server
npm run docs:serve
```

## 🧹 Cleanup Commands

```bash
# Clean build artifacts
npm run clean

# Clean node_modules
rm -rf node_modules package-lock.json
npm install

# Reset database (WARNING: deletes all data)
npm run db:reset --workspace=@kibei/db
```

## 🔐 Environment Setup

```bash
# Copy example env file
cp .env.example .env.local

# Required variables to configure:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - DATABASE_URL
# - JWT_SECRET (min 32 characters)

# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚀 Deployment Commands

```bash
# Deploy to Vercel
vercel deploy

# Deploy to production
vercel deploy --prod

# Deploy to staging
vercel deploy --prod --scope=staging
```

## 📊 Monitoring & Debugging

```bash
# View API logs
npm run logs:api

# View Web logs
npm run logs:web

# Debug with inspector
node --inspect apps/api/server.js

# View database queries
PRISMA_QUERY_ENGINE_LOG=debug npm run dev
```

## 🤝 Git Commands

```bash
# Create feature branch
git checkout -b feature/your-feature

# Push to GitHub
git push -u origin feature/your-feature

# Create pull request
# Go to GitHub and create PR

# Merge after review
git checkout main
git pull
git merge feature/your-feature
git push
```

## 💡 Tips & Tricks

### Run scripts from specific workspace
```bash
npm run <command> --workspace=@kibei/db
npm run <command> --workspace=kibei-api
npm run <command> --workspace=kibei-web
```

### Filter output
```bash
npm run dev -- --filter=@kibei/api  # Only API
npm run build -- --filter=@kibei/*  # Only packages
```

### Force clean install
```bash
rm -rf node_modules package-lock.json
npm install
npm run db:push --workspace=@kibei/db
```

### Kill port if stuck
```bash
# On macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

## ⚠️ Common Issues & Solutions

### Issue: "Cannot find module @kibei/db"
```bash
# Solution: Run generate in all workspaces
npm run --workspaces generate

# Or specific workspace
npm run --workspace=@kibei/db generate
```

### Issue: Port already in use
```bash
# Kill existing process
lsof -ti:3000 | xargs kill -9

# Or use different ports
npm run dev -- --port 3002 --workspace=@kibei/api
```

### Issue: Database connection refused
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check Supabase credentials
# Verify SUPABASE_URL and keys are correct
```

### Issue: JWT Secret too short
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=<new-secret>
```

## 📞 Getting Help

- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** dev@kibei.cd
- **Docs:** https://docs.kibei.cd

---

**Last Updated:** December 22, 2024
