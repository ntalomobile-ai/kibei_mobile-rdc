#!/bin/bash

# KiBei Development Quick Start Script

set -e

echo "🟩 KiBei Mobile RDC - Quick Start"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js 18+ required${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo ""
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
fi

# Setup .env.local
if [ ! -f ".env.local" ]; then
    echo ""
    echo -e "${BLUE}🔧 Setting up environment...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo -e "${RED}⚠️  Please configure your Supabase credentials in .env.local${NC}"
    echo ""
    read -p "Press enter when ready..."
fi

# Generate Prisma
echo ""
echo -e "${BLUE}⚙️  Generating Prisma client...${NC}"
npm run --workspace=@kibei/db generate
echo -e "${GREEN}✓ Prisma generated${NC}"

# Show startup info
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "📝 Available commands:"
echo "  npm run dev              - Start all services"
echo "  npm run build            - Build all packages"
echo "  npm run lint             - Lint code"
echo "  npm run type-check       - Check types"
echo "  npm run db:push          - Push Prisma schema"
echo "  npm run db:seed          - Seed database"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
echo "📍 Services will run on:"
echo "  API:  http://localhost:3000"
echo "  Web:  http://localhost:3001"
echo ""
