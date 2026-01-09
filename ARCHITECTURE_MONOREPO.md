# 🏗️ Architecture Monorepo KiBei (Phase 1 + Phase 2)

## Vue d'ensemble

KiBei utilise un **monorepo Turborepo unique** contenant:
- ✅ Backend API centralisé (Next.js)
- ✅ Frontend Web (Next.js)
- ✅ Application Mobile (Flutter)
- ✅ Librairies partagées (types, auth, i18n, utils)

**Décision architecturale:** Un seul repo = Une seule vérité = Meilleure gouvernance

---

## 📊 Topology: Isolation et Partage

```
┌─────────────────────────────────────────────────────┐
│                   MONOREPO KIBEI                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐ ┌───────────┐ │
│  │   API        │  │    Web       │ │  Flutter  │ │
│  │ (Next.js)    │  │ (Next.js)    │ │ (Dart)    │ │
│  │ Port 3000    │  │ Port 3001    │ │ Native    │ │
│  └──────┬───────┘  └──────┬───────┘ └─────┬─────┘ │
│         │                 │               │        │
│         └─────────────────┼───────────────┘        │
│                           │                        │
│  ┌────────────────────────▼────────────────────┐  │
│  │         SHARED PACKAGES (packages/)         │  │
│  │                                            │  │
│  │  ✅ db/         (Prisma types)            │  │
│  │  ✅ auth/       (JWT, RBAC)               │  │
│  │  ✅ services/   (Business logic)          │  │
│  │  ✅ ui/         (React components)        │  │
│  │  ✅ i18n/       (JSON translations)       │  │
│  │  ✅ utils/      (TS/JS helpers)           │  │
│  │  ✅ config/     (Central config)          │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │         DATABASE & INFRASTRUCTURE            │  │
│  │                                              │  │
│  │  🗄️  PostgreSQL (Supabase)                   │  │
│  │  🔐  RLS Policies (Row Level Security)       │  │
│  │  📊  9 Tables (users, prices, etc)           │  │
│  │  📝  Audit logs                              │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Isolation par Couche

### 1️⃣ **Tier Présentation (3 applications indépendantes)**

#### Web (apps/web/)
```
Framework: Next.js 14 (React)
Serveur: Port 3001
Dépendances: @kibei/ui, @kibei/auth, @kibei/i18n, @kibei/config
Communication: HTTP vers API
```

#### API Backend (apps/api/)
```
Framework: Next.js 14 (API Routes)
Serveur: Port 3000
Dépendances: @kibei/db (Prisma), @kibei/auth, @kibei/services
Responsabilité: Logic métier, validation, RLS
```

#### Mobile Flutter (apps/mobile-flutter/)
```
Framework: Flutter (Dart)
Dépendances: dio, riverpod, shared_preferences
Communication: HTTP vers API UNIQUEMENT
❌ N'utilise JAMAIS: Prisma, Supabase client, Next.js
```

### 2️⃣ **Tier Métier (Partage contrôlé)**

#### @kibei/db
```
Exports: Prisma types, enums (Role, Status, etc)
Dépendances: Prisma (TypeScript generation)
Utilisé par: apps/api
⚠️ Web n'importe PAS directement
⚠️ Flutter ignore complètement
```

#### @kibei/auth
```
Exports: signToken, verifyToken, hashPassword, RBAC checks
Dépendances: jose, node crypto
Utilisé par: apps/api pour auth
Web importe: Uniquement côté client (login flow)
Flutter: N'en a pas besoin (tokens en SharedPreferences)
```

#### @kibei/services
```
Exports: PriceService, ExchangeRateService, etc
Dépendances: @kibei/db, Prisma
Utilisé par: apps/api UNIQUEMENT
Web: N'y accède pas (appelle API HTTP)
Flutter: N'y accède pas (appelle API HTTP)
```

#### @kibei/i18n
```
Exports: translations object (JSON)
Format: { fr: {...}, sw: {...}, ln: {...} }
Utilisé par: Web (React), Flutter (peut copier les fichiers)
Pas de dépendances Node.js
```

#### @kibei/utils
```
Exports: formatPrice(), validateEmail(), etc
Utilisé par: Web, API
Flutter: Peut réimplémenter en Dart si besoin
```

#### @kibei/config
```
Exports: API_URL, ROLES, CURRENCIES, etc
Utilisé par: Web, API, potentiellement Flutter
```

---

## 🔄 Flux de Communication

### Scenario 1: Utilisateur se connecte via Web

```
1. Web (apps/web)
   └─> POST /api/auth/login
       ├─> Form validation (Zod)
       ├─> API (apps/api)
       │   ├─> Find user in DB (@kibei/db)
       │   ├─> Hash password check (@kibei/auth)
       │   ├─> Generate JWT (@kibei/auth)
       │   ├─> Set HttpOnly cookies
       │   └─> Return user data
       └─> Store in Zustand
           └─> Redirect /dashboard
```

### Scenario 2: Collecteur soumet prix via Mobile

```
1. Flutter (apps/mobile-flutter)
   └─> Lecteur jeton de SharedPreferences
       ├─> POST /api/collector/prices
       │   ├─> API (apps/api)
       │   │   ├─> Verify JWT header
       │   │   ├─> Check RBAC (@kibei/auth)
       │   │   ├─> Validate input (Zod)
       │   │   ├─> Create Price in DB (@kibei/services)
       │   │   ├─> Log audit entry
       │   │   └─> Return created Price
       │   └─> Store response locally (Hive)
       └─> Show success message
```

### Scenario 3: Modérateur valide prix via Web

```
1. Web (apps/web)
   └─> GET /api/moderator/prices
       ├─> API (apps/api)
       │   ├─> Authenticate (JWT cookie)
       │   ├─> Check role = moderator (@kibei/auth)
       │   ├─> Filter by moderator's province (RLS)
       │   ├─> Return pending prices
       │   └─> Fetch details
       └─> Display form
           └─> PUT /api/moderator/prices/[id]
               ├─> API validates & updates
               └─> Re-render list
```

---

## 🔐 Couches de Sécurité

### Niveau 1: JWT Authentication

```
┌─────────────────┐
│  Apps (Web/API) │
├─────────────────┤
│  1. Login       │──> Generate JWT (@kibei/auth)
│  2. Token       │    expires_in: 15m
│  3. Cookie      │    httpOnly: true
│  4. Refresh     │    secure: true (production)
└─────────────────┘
```

### Niveau 2: API RBAC

```
┌──────────────────────┐
│  apps/api middleware │
├──────────────────────┤
│  authenticate()      │──> Verify JWT
│  requireAuth(roles)  │    Check role in [allowed]
│  handleError()       │    Return 401/403
└──────────────────────┘
```

### Niveau 3: RLS Policies (Database)

```
┌──────────────────────┐
│  PostgreSQL (RLS)    │
├──────────────────────┤
│  policy "users"      │──> SELECT: Only own user
│  policy "prices"     │    Public see approved
│                      │    Moderators see pending
│  policy "audit_logs" │    Only admins
└──────────────────────┘
```

### Niveau 4: Field Filtering

```
┌────────────────┐
│  API Response  │
├────────────────┤
│  User object   │──> ❌ Never send passwordHash
│  Price object  │──> ❌ Never send internal status
│  Log object    │──> ❌ Never send IP/UserAgent to client
└────────────────┘
```

---

## 🧵 Dépendances de Compilation (Turborepo)

### Build Order

```
Phase 1: Packages (Sequential - dépendances)
┌─────────────────┐
│  @kibei/db      │──> types from schema.prisma
└─────────┬───────┘
          │
    ┌─────▼────────────────────────┐
    │ @kibei/auth (uses @kibei/db) │
    └─────┬─────────────────────────┘
          │
    ┌─────▼──────────────────────────────┐
    │ @kibei/services (uses both above)  │
    └──────────────────────────────────────┘

Phase 2: Applications (Parallel - indépendantes du type tech)
┌──────────────┐  ┌──────────────┐  ┌────────────────┐
│  apps/api    │  │  apps/web    │  │ mobile-flutter │
│ (uses Node   │  │  (uses React)│  │   (uses Dart)  │
│  packages)   │  │  packages)   │  │   no packages) │
└──────────────┘  └──────────────┘  └────────────────┘

Phase 3: Deployment
┌──────────────────────────────────────┐
│ Deploy API → Web → Mobile (in order) │
└──────────────────────────────────────┘
```

### Système de Dépendances (Turborepo)

```json
{
  "turbo": {
    "pipeline": {
      "build": {
        "dependsOn": ["^build"],
        "outputs": ["dist/**"]
      },
      "dev": {
        "cache": false,
        "persistent": true
      }
    }
  }
}
```

---

## 📱 Flutter dans le Monorepo

### Pourquoi Flutter reste isolé?

1. **Langage différent (Dart ≠ TypeScript)**
   - Flutter compile en code natif (Android/iOS)
   - TypeScript compile en JavaScript/Node
   - Aucune dépendance partageable

2. **Technologie différente**
   - Flutter: pubspec.yaml (Dart packages)
   - Node: package.json (npm packages)
   - Pas de chevauchement

3. **Résultat de déploiement différent**
   - API → Railway, Vercel, etc (Node server)
   - Web → Vercel, AWS S3, etc (static + Next.js)
   - Flutter → Google Play, Apple App Store (binaires compilés)

### Ce que Flutter PEUT partager

```
✅ i18n (JSON files)
   └─> Copy to assets/translations/

✅ API Contracts (OpenAPI spec or JSON schema)
   └─> Code generation (openapi-generator, freezed)

✅ Configuration (URLs, credentials, constants)
   └─> Shared config/ package exported as JSON

✅ Documentation
   └─> README, API docs, etc
```

### Ce que Flutter NE partage PAS

```
❌ @kibei/db (Prisma = TypeScript/PostgreSQL)
❌ @kibei/auth (Node.js crypto)
❌ @kibei/services (TypeScript + Prisma)
❌ Node.js à tout (Flutter = JVM + Swift)
```

---

## 🔄 Cycle de Développement

### Setup Initial

```bash
# 1. Clone + Install tout
git clone <repo>
npm install  # Node dependencies
cd apps/mobile-flutter && flutter pub get  # Dart dependencies

# 2. Configure DB
cp .env.example .env.local  # Supabase credentials

# 3. Prepare data
npm run db:push
npm run db:seed
```

### Développement Quotidien

```bash
# Terminal 1: API + Web
npm run dev

# Terminal 2: Flutter
cd apps/mobile-flutter && flutter run
```

### Tests & Linting

```bash
# API & Web
npm run test
npm run lint

# Flutter
cd apps/mobile-flutter && flutter test
flutter analyze
```

### Deployment

```bash
# API & Web (Turborepo handles both)
npm run build
vercel deploy

# Flutter
flutter build apk --release
flutter build ipa --release
# Upload to Google Play & App Store manually
```

---

## 🚀 Avantages de cette Architecture

### ✅ Pour les développeurs

- 📚 Code centralisé, facile à naviguer
- 🔄 Changements API → Web + Flutter bénéficient ensemble
- 🔐 Une seule source de vérité pour auth, config, i18n
- 🧪 Tests intégrés pour API + Web + Mobile

### ✅ Pour l'organisation

- 📊 Version unique du projet
- 🎯 Une seule roadmap
- 📈 Audit trail complet
- 🤝 Facile pour partenaires/bailleurs (présenter un seul repo)

### ✅ Pour la production

- 🔐 Sécurité cohérente (API ≠ DB ≠ clients)
- 📈 Scalabilité (Flutter n'ajoute charge nulle au serveur)
- 🛡️ Isolation technologique (crash Flutter ≠ crash API)
- 🚀 Déploiement orchestré (CI/CD unique)

---

## ⚠️ Points d'Attention

1. **Taille du repo:** Peut grossir avec les binaires Flutter
   → Solution: `.gitignore` pour `build/`, `**/node_modules`, etc

2. **Performance de build:** Flutter + Node.js en parallèle?
   → Solution: Turborepo parallélise, mais peut être lent
   → Alternative: Build agents séparés pour mobile

3. **Dépendances conflictuelles:** Si on voulait partager du code Node/Dart
   → Solution: Ne pas essayer - rester isolé
   → Code dupliqué acceptable pour cette raison

4. **Dev machine setup:** Besoin Android SDK + iOS SDK + Node + Dart
   → Solution: Docs claires, GitHub Actions pour CI

---

## 📖 Prochaines Lectures

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Clean Architecture détaillée
- [apps/mobile-flutter/README.md](./apps/mobile-flutter/README.md) - Guide Flutter
- [API.md](./API.md) - Contrats API pour Flutter
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Déploiement Web + Mobile
