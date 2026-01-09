# 🟩 KiBei Mobile RDC – Phase 1 & 2

Plateforme multi-canal de suivi national des prix et des taux de change en République Démocratique du Congo.

**Phase 1 (Complète):** Web (Next.js)  
**Phase 2 (Prête):** Applications mobiles iOS/Android (Flutter)

> **Nouveau:** Structure monorepo unifié avec Flutter complètement isolé. Voir [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md) pour la justification.

## 🚀 Démarrage Rapide (Choisir votre chemin)

### 👤 Je suis développeur
```bash
1. npm install
2. cp .env.example .env.local  # Remplir Supabase credentials
3. npm run db:push && npm run db:seed
4. npm run dev
5. Open http://localhost:3001/login
```

Voir [COMMANDS.md](./COMMANDS.md) pour plus de commandes.

### 📱 Je travaille sur Flutter
```bash
1. flutter pub get (apps/mobile-flutter/)
2. flutter doctor  # Vérifier installation
3. flutter run
```

Voir [FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md) pour setup complet.

### 🏛️ Je suis manager/architecte
1. Lire [ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md) (5 min)
2. Lire [PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md) (5 min)
3. Vérifier [DELIVERABLES.md](./DELIVERABLES.md) (completion checklist)

### 📚 Je veux comprendre tout
Voir [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) pour le guide complet.

## 📖 Documentation

**Consultez [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) pour le guide complet de la documentation.**

### Lectures essentielles (dans cet ordre)

1. **[PHASE_1_COMPLETE.md](./PHASE_1_COMPLETE.md)** (5 min) - État du projet, checklist
2. **[ARCHITECTURE_DECISION.md](./ARCHITECTURE_DECISION.md)** (10 min) - Pourquoi cette architecture?
3. **[ARCHITECTURE_MONOREPO.md](./ARCHITECTURE_MONOREPO.md)** (15 min) - Comment ça marche?
4. **[ARCHITECTURE.md](./ARCHITECTURE.md)** (20 min) - Détails techniques
5. **[API.md](./API.md)** (30 min) - Tous les endpoints
6. **[FLUTTER_INTEGRATION.md](./FLUTTER_INTEGRATION.md)** (20 min) - Setup mobile
7. **[DEPLOYMENT.md](./DEPLOYMENT.md)** (25 min) - Production guide
8. **[COMMANDS.md](./COMMANDS.md)** (15 min) - Référence quotidienne
9. **[CONTRIBUTING.md](./CONTRIBUTING.md)** (10 min) - Guidelines team

### Comptes de test

Après `npm run db:seed`:

```
Admin:       admin@kibei.cd / AdminKiBei123!
Collecteur:  collecteur@kibei.cd / Collector123!
Modérateur:  moderateur@kibei.cd / Moderator123!
User:        user@kibei.cd / User123!
```

## 🏗️ Architecture

### Structure Monorepo (Turborepo + Flutter)

```
kibei/
├── apps/
│   ├── api/                  # Backend API (Next.js 14, port 3000)
│   ├── web/                  # Frontend Web (Next.js 14, port 3001)
│   └── mobile-flutter/       # App Mobile (Flutter - Android/iOS)
│
├── packages/
│   ├── db/                   # Prisma ORM + types
│   ├── auth/                 # JWT + Authentication
│   ├── services/             # Business logic
│   ├── ui/                   # Composants React partagés
│   ├── i18n/                 # Traductions JSON (FR/SW/LN)
│   ├── utils/                # Helpers TypeScript/JavaScript
│   └── config/               # Configuration globale
│
├── scripts/
│   ├── setup.sh              # Installation initiale
│   ├── seed.ts               # Seed de la base de données
│   └── schema.sql            # Schéma PostgreSQL + RLS
│
└── README.md
```

## 🛡️ Règles Architecturales (Non-Négociables)

✅ **Imposées:**
- API centrale = seule source de vérité
- RLS (Row Level Security) actif sur Supabase
- JWT maison avec cookies HttpOnly
- Zod validation côté API
- Clean Architecture

❌ **Interdites:**
- Accès direct DB depuis le frontend
- Logique métier côté frontend
- Supabase client dans le web app

## 🔐 Authentification & RBAC

### Rôles Utilisateurs

| Rôle | Permissions |
|------|-------------|
| `user_public` | Lecture + Signalement |
| `collector` | Soumettre prix/taux + Lire |
| `moderator` | Valider données (sa province) |
| `admin` | Accès complet |

### JWT Tokens
- **Access Token:** 15 minutes (httpOnly cookie)
- **Refresh Token:** 7 jours (httpOnly cookie)
- Secret: `$JWT_SECRET` (min 32 chars)

## 🗄️ Base de Données

### Technologie
- **Provider:** PostgreSQL (Supabase)
- **ORM:** Prisma 5.x
- **Sécurité:** RLS policies activées

### Tables Principales
- `users` - Utilisateurs
- `provinces` - Provinces RDC
- `cities` - Villes
- `markets` - Marchés
- `products` - Produits
- `prices` - Prix soumis
- `exchange_rates` - Taux de change
- `price_reports` - Signalements
- `audit_logs` - Logs d'audit

## 🌍 Multilingue

Support complet: **Français, Swahili, Lingala**

### Traductions Incluses
- Navigation
- Authentification
- Prix & Taux
- Dashboard
- Admin
- Footer

Stockage: `packages/i18n/index.ts` (JSON)

## 🚀 Démarrage Rapide

### Prérequis
- Node.js >= 18
- npm 10+
- PostgreSQL (ou Supabase account)

### Installation

```bash
# 1. Cloner et installer
git clone <repo>
cd kibei
npm install

# 2. Configuration des variables
cp .env.example .env.local
# Éditer .env.local avec vos credentials Supabase

# 3. Seed initial
npm run db:seed

# 4. Démarrage du développement
npm run dev
```

### Accès
- **API:** http://localhost:3000
- **Web:** http://localhost:3001

### Comptes de Test
```
Admin:      admin@kibei.cd      / AdminKiBei123!
Collecteur: collecteur@kibei.cd / Collector123!
Modérateur: moderateur@kibei.cd / Moderator123!
Public:     user@kibei.cd       / User123!
```

## 📡 API Routes

### Publiques (Sans Auth)
```
GET  /api/public/prices              # Lister prix approuvés
GET  /api/public/exchange-rates      # Lister taux approuvés
GET  /api/public/provinces           # Lister provinces
```

### Authentication
```
POST /api/auth/login                 # Login
POST /api/auth/refresh               # Refresh token
POST /api/auth/logout                # Logout
```

### Collecteur (role: collector)
```
POST /api/collector/prices           # Soumettre prix
POST /api/collector/exchange-rates   # Soumettre taux
```

### Modérateur (role: moderator)
```
GET  /api/moderator/prices           # Lister à valider
PUT  /api/moderator/prices?id=...    # Valider/Rejeter prix
GET  /api/moderator/exchange-rates   # Lister taux
PUT  /api/moderator/exchange-rates   # Valider/Rejeter taux
```

### Admin (role: admin)
```
GET/POST /api/admin/users            # Gérer utilisateurs
GET/POST /api/admin/provinces        # Gérer provinces
GET/POST /api/admin/cities           # Gérer villes
GET/POST /api/admin/markets          # Gérer marchés
GET/POST /api/admin/products         # Gérer produits
```

## 🎨 Interface Publique

### Pages
- `/` - Landing page
- `/prices` - Consultation des prix
- `/exchange-rates` - Taux de change
- `/login` - Connexion

### Fonctionnalités
- Sélection Province → Ville → Marché
- Affichage des prix approuvés
- Historique et variations
- Signalement de prix anormal (modal)
- Sélecteur de langue (FR/SW/LN)

## 📊 Dashboard Authentifié

### Pour Collecteur
- Soumettre prix/taux
- Voir statut de ses soumissions
- Dashboard personnel

### Pour Modérateur
- Valider/rejeter soumissions (sa province)
- Voir historique de validation
- Statistiques

### Pour Admin
- CRUD complet (utilisateurs, provinces, villes, marchés, produits)
- Upload d'images (Supabase Storage)
- Logs d'audit
- Gestion des rôles

## 🔍 Schéma Base de Données

### Users
```sql
id, email (unique), password_hash, full_name, role, 
province_id, market_id, is_active, created_at, updated_at, deleted_at
```

### Products
```sql
id, code (unique), name_fr, name_sw, name_ln, 
category, unit_fr/sw/ln, is_active
```

### Prices
```sql
id, product_id, market_id, submitted_by_id, price, currency,
status (pending/approved/rejected), validated_by_id, validated_at
```

### Exchange Rates
```sql
id, from_currency, to_currency, rate, submitted_by_id,
status, validated_by_id, validated_at,
UNIQUE(from_currency, to_currency, date)
```

## 🛡️ Sécurité

✅ **Implémentée:**
- JWT Access + Refresh tokens
- HTTP-only cookies
- CSRF protection (Next.js natif)
- CORS configuré
- Zod input validation
- RLS Supabase par rôle
- Audit logs complets
- Password hashing

⚠️ **À Améliorer (Production):**
- Remplacer hashPassword simple par bcryptjs
- Rate limiting sur auth
- 2FA pour admins
- IPwhitelist optionnel
- Encryption de données sensibles

## 🔗 Stack Technique

### Backend
- **Framework:** Next.js 14 (App Router)
- **API:** API Routes native
- **DB:** PostgreSQL (Supabase)
- **ORM:** Prisma 5.x
- **Auth:** JWT (jose)
- **Validation:** Zod
- **Styling:** Tailwind CSS
- **Runtime:** Node.js

### Frontend
- **Framework:** Next.js 14 (App Router)
- **State:** Zustand (auth + language)
- **UI:** shadcn/ui + Tailwind
- **Icons:** Lucide React
- **Styling:** Tailwind CSS

### Build & Deploy
- **Monorepo:** Turborepo
- **Package Manager:** npm 10+
- **Type Safety:** TypeScript 5.3 strict
- **Testing:** À ajouter (Jest/Vitest)

## 📦 Installation Détaillée

### 1. Clone & Setup
```bash
git clone https://github.com/kibei/mobile-rdc.git
cd kibei
npm install
```

### 2. Variables d'Environnement

Créer `.env.local`:
```env
# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/kibei

# JWT
JWT_SECRET=votre-cle-secrete-min-32-caracteres
JWT_EXPIRY=900
JWT_REFRESH_EXPIRY=604800

# App URLs
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WEB_URL=http://localhost:3001
NODE_ENV=development
```

### 3. Database Setup
```bash
# Push schema Prisma
npm run db:push --workspace=@kibei/db

# Seed initial
npm run db:seed --workspace=@kibei/db
```

### 4. Démarrage
```bash
# Tous les services
npm run dev

# Ou individuellement
npm run dev --workspace=@kibei/api      # API sur :3000
npm run dev --workspace=kibei-web       # Web sur :3001
```

### 5. Tests
```bash
# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## 🚢 Déploiement

### Recommandations
- **API:** Vercel, Railway, ou Render
- **Web:** Vercel, Railway
- **DB:** Supabase (géré), ou AWS RDS
- **Storage:** Supabase Storage (images)

### Checklist Pre-Production
- [ ] JWT_SECRET = clé aléatoire 32+ chars
- [ ] Passwords hashées avec bcryptjs
- [ ] RLS policies validées et testées
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Logs d'audit fonctionnels
- [ ] Backup DB activé
- [ ] HTTPS en production
- [ ] Environment variables sécurisées
- [ ] Tests unitaires + E2E

## 📊 Métriques & Performance

### Cibles
- Temps de chargement: < 2s
- Uptime: > 99.9%
- API latency: < 200ms
- DB queries: < 100ms

### Monitoring (À ajouter)
- Sentry (error tracking)
- DataDog (APM)
- Vercel Analytics
- Logstash (logs centralisés)

## 🤝 Contributing

1. Fork le repository
2. Créer une branch feature
3. Commit avec messages clairs
4. PR vers main avec description

## 📝 License

Proprietary - KiBei RDC 2024

## 📞 Support

- **Issues:** GitHub Issues
- **Email:** support@kibei.cd
- **Docs:** https://docs.kibei.cd

## 🗺️ Roadmap

### Phase 2 (Mobile)
- App iOS (React Native)
- App Android (React Native)
- Push notifications
- Offline sync

### Phase 3 (Scale)
- Analytics dashboard
- API v2 optimisée
- Blockchain verification
- SMS integration

### Phase 4 (Integration)
- Payment gateway
- Logistics optimization
- AI price prediction
- IoT sensors support

---

**Version:** 0.1.0  
**Last Updated:** Dec 22, 2024  
**Status:** 🟩 Active Development
