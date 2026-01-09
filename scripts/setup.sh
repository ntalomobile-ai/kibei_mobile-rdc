#!/bin/bash

set -e

echo "🟩 KiBei Setup - Initialisation du monorepo"
echo "==========================================="
echo ""

# Check for Node.js
echo "✓ Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    echo "✗ Node.js n'est pas installé. Veuillez installer Node.js >= 18"
    exit 1
fi
echo "  Version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installation des dépendances..."
npm install
echo "✓ Dépendances installées"
echo ""

# Setup environment
echo "🔧 Configuration des variables d'environnement..."
if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo "✓ Fichier .env.local créé"
    echo "  ⚠️  N'oubliez pas de configurer vos variables d'environnement!"
else
    echo "✓ Fichier .env.local existant"
fi
echo ""

# Prisma generate
echo "⚙️  Génération du client Prisma..."
npm run --workspace=@kibei/db generate
echo "✓ Client Prisma généré"
echo ""

# Optional: Run seed
echo "🌱 Voulez-vous lancer la base de seed? (y/n)"
read -r SEED_RESPONSE
if [[ $SEED_RESPONSE == "y" ]]; then
    echo "Exécution du seed..."
    npm run --workspace=@kibei/db db:seed
    echo "✓ Seed exécuté"
else
    echo "Seed ignoré"
fi
echo ""

echo "🎉 Setup complété!"
echo ""
echo "📝 Prochaines étapes:"
echo "1. Configurez vos variables d'environnement dans .env.local"
echo "2. Lancez la base de données: npm run db:push --workspace=@kibei/db"
echo "3. Démarrez le développement: npm run dev"
echo ""
