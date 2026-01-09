# 📱 KiBei Mobile Flutter - Phase 2

Application Flutter pour KiBei Mobile RDC (Android & iOS)

## 🏗️ Architecture

```
apps/mobile-flutter/
├── lib/
│   ├── main.dart                 # Point d'entrée
│   ├── config/
│   │   └── api_config.dart       # Configuration API (partagée)
│   ├── services/
│   │   └── api_service.dart      # Service API (Dio)
│   ├── models/                   # Modèles de données
│   ├── providers/                # Riverpod providers
│   ├── screens/                  # Pages
│   ├── widgets/                  # Composants réutilisables
│   └── utils/                    # Helpers
├── pubspec.yaml                  # Dépendances Dart/Flutter
└── README.md                     # (ce fichier)
```

## 🎯 Principes d'Architecture

### ✅ Ce que Flutter fait
- 📱 Interface native (Android / iOS)
- 🔐 Authentification via l'API (JWT tokens)
- 🌐 Consomme uniquement l'API HTTP (`http://localhost:3000`)
- 💾 Stockage local (SharedPreferences, Hive)
- 🌍 Multilangue (intl partagé avec le monorepo)

### ❌ Ce que Flutter NE fait PAS
- ❌ Ne dépend pas de Next.js
- ❌ Ne dépend pas de Prisma
- ❌ Ne dépend pas de Supabase directement
- ❌ Ne partage pas de dépendances Node.js

### 🔗 Ressources partagées du monorepo
```
📄 packages/i18n/   → Traductions JSON (FR/SW/LN)
⚙️ packages/config/ → Configuration (URLs, constantes)
📚 Documentation    → Guides, architecture, API
```

## 📦 Dépendances principales

### État & Configuration
- **riverpod** - State management simple et performant
- **freezed** - Immutable models

### Réseau
- **dio** - Client HTTP avancé
- **http** - Client HTTP simple (fallback)

### Stockage
- **shared_preferences** - Tokens, user data
- **hive** - Base de données locale
- **flutter_secure_storage** - Données sensibles

### UI & Navigation
- **go_router** - Navigation type-safe
- **flutter_svg** - Icônes SVG

### Multilangue
- **intl** - i18n Flutter (lié aux traductions du monorepo)

## 🚀 Démarrage

### Installation dépendances
```bash
cd apps/mobile-flutter
flutter pub get
```

### Mode développement
```bash
flutter run
```

### Build Android
```bash
flutter build apk --release
# Ou pour App Bundle
flutter build appbundle --release
```

### Build iOS
```bash
flutter build ios --release
```

## 🔐 Authentification

Flutter utilise la même API d'authentification que le Web:

```dart
// 1. Login
POST /api/auth/login
{
  "email": "collecteur@kibei.cd",
  "password": "Collector123!"
}
Response: { access_token, refresh_token, user }

// 2. Tokens stockés dans SharedPreferences
// 3. Envoyés dans Authorization: Bearer header

// 4. Refresh automatique quand expiré
POST /api/auth/refresh { refresh_token }

// 5. Logout
POST /api/auth/logout
```

## 📊 API Endpoints utilisés

Tous les endpoints viennent de `apps/api`:

### Publics
```
GET /api/public/prices
GET /api/public/exchange-rates
GET /api/public/provinces
```

### Authentifiés (Collector)
```
POST /api/collector/prices
POST /api/collector/rates
```

### Dashboard (Toutes les données)
```
GET /api/prices
GET /api/exchange-rates
GET /api/users (admin)
```

## 🌐 Configuration API

Voir [lib/config/api_config.dart](lib/config/api_config.dart):
- ✅ Développement: `http://localhost:3000`
- ✅ Staging: `https://staging-api.kibei.cd`
- ✅ Production: `https://api.kibei.cd`

## 📱 Fonctionnalités Phase 2

- [ ] Écran de login
- [ ] Liste des prix avec filtres
- [ ] Liste des taux de change
- [ ] Soumettre un prix (collecteurs)
- [ ] Tableau de bord personnel
- [ ] Notifications push
- [ ] Mode hors-ligne
- [ ] Synchronisation auto

## 🧪 Tests

```bash
# Tests unitaires
flutter test

# Tests d'intégration
flutter test integration_test/
```

## 🛠️ Debugging

```bash
# Verbose logging
flutter run -v

# DevTools
flutter pub global activate devtools
devtools

# Inspect requêtes HTTP
# Dio logs automatiques en mode debug
```

## 📚 Documentation

- [ARCHITECTURE.md](../../ARCHITECTURE.md) - Architecture globale
- [API.md](../../API.md) - Documentation API complète
- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Déploiement mobile

## 🤝 Contribution

Voir [CONTRIBUTING.md](../../CONTRIBUTING.md) pour les guidelines de développement.

## ⚠️ Important

**Flutter reste complètement isolé du backend Next.js:**
- Aucune dépendance Node.js
- Aucune dépendance Prisma
- Aucun accès direct à la base de données
- Communication UNIQUEMENT via HTTP

C'est une architecture saine et scalable pour un projet national.
