# 🏛️ Décision Architecturale: Monorepo Unique avec Flutter Isolé

**Approuvée:** Phase 1 + Phase 2  
**Statut:** En vigueur  
**Révisée:** 22 Décembre 2025

---

## 📌 Décision

**KiBei utilise UN SEUL MONOREPO contenant:**
- ✅ Backend API (Next.js)
- ✅ Frontend Web (Next.js)
- ✅ Application Mobile (Flutter)

**Principes clés:**
1. **Un repo = Une vérité**
2. **Flutter reste 100% isolé techniquement**
3. **Communication UNIQUEMENT via HTTP**
4. **Partage limité et contrôlé** (i18n, contracts, docs)

---

## 🎯 Contexte et Justification

### Pourquoi un monorepo unique?

#### ✅ Gouvernance Institutionnelle
```
Pour un projet NATIONAL financé par des partenaires:
- Une seule "version" du produit
- Versioning unifié (v1.0.0 = API + Web + Mobile)
- Audit trail complet dans un seul dépôt
- Facile à présenter aux bailleurs/partenaires
```

#### ✅ Single Source of Truth
```
Avantages:
- API contracts dans un seul endroit
- Traductions synchronisées automatiquement
- Configuration centrale (URLs, constantes)
- Documentation unique

Évite:
- Désynchronisation API ↔ Mobile
- Versions incompatibles
- Traductions orphelines
- Configurations obsolètes
```

#### ✅ CI/CD Coordonné
```
Pipeline unifié:
1. Test API
2. Test Web
3. Test Flutter (en parallèle)
4. Build tout
5. Deploy tout (versioning atomique)

Alternative (plusieurs repos):
- N pipelines indépendants
- Risque de déployer versions incompatibles
- Difficile à synchroniser
```

#### ✅ Contexte Institutionnel (RDC)
```
Pour un projet national:
- Auditeurs veulent "tout" dans un seul endroit
- Bailleurs veulent tracer complètement
- Équipe RDC pourra manager depuis GitHub
- Facile de montrer "c'est fait" à des partenaires
```

### Pourquoi Flutter reste isolé?

#### ✅ Pas de dépendances TypeScript/Node.js
```
Flutter (Dart) n'a PAS BESOIN de:
- Node.js / npm
- Prisma (TypeScript)
- Next.js
- Modules Node.js

Forcer à les installer = bloat, confusions, incompatibilités
```

#### ✅ Langages différents = Technos différentes
```
TypeScript → JavaScript → Node.js → Serveur HTTP
Dart → Machine code → Mobile app → HTTP client

Il n'y a PAS de "partage de code" technique entre eux.
```

#### ✅ Cycle de build différent
```
API:     tsc + next build  (JavaScript)
Web:     tsc + next build  (JavaScript)
Flutter: dart build        (Machine code)

Aucun point commun techniquement.
```

#### ✅ Déploiement différent
```
API  → Railway, Vercel, AWS (serveur Node.js)
Web  → Vercel, Netlify, AWS S3 (static + Next.js)
Mobile → Google Play, App Store (binaires APK/IPA)

Trois destinations complètement différentes.
```

---

## 🏗️ Architecture Finale

```
┌─────────────────────────────────────────────────────┐
│                 MONOREPO KIBEI                       │
│                   GitHub repo                        │
│            Versionning: v1.0.0 du tout               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  TIER PRÉSENTATION (3 apps indépendantes)          │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │ API (TS/Node)│  │Web(TS/React)│  │ Flutter   │ │
│  │ Port 3000    │  │Port 3001    │  │ (Dart)    │ │
│  └──────┬───────┘  └──────┬──────┘  └─────┬─────┘ │
│         └──────────────────┼──────────────┘         │
│                    HTTP API 🔌                      │
│                                                     │
│  TIER PARTAGE (packages/ avec contrôle)           │
│  ┌────────────────────────────────────────────┐   │
│  │ @kibei/contracts  (API types/interfaces)   │   │
│  │ @kibei/i18n       (JSON translations)      │   │
│  │ @kibei/config     (Endpoints, constants)   │   │
│  │ Docs & guides     (README, architecture)   │   │
│  └────────────────────────────────────────────┘   │
│                                                     │
│  DATABASE (PostgreSQL + RLS)                       │
│  └────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘

RÈGLES D'ISOLATION:

✅ Flutter PEUT:
   - Appeler API HTTP
   - Lire JSON contracts
   - Utiliser translations.json
   - Consulter documentation

❌ Flutter NE PEUT PAS:
   - Importer @kibei/db (Prisma TypeScript)
   - Importer @kibei/auth (Node crypto)
   - Accéder directement à PostgreSQL
   - Dépendre de packages Node.js
```

---

## 📊 Comparaison: 3 approches

### Option A: Monorepo unique ✅ CHOIX

```
Avantages:
+ Un repo, une version
+ Facile à gouverner (audit trail)
+ Partenaires voient "tout" au même endroit
+ CI/CD coordonné
+ Documentation unique
+ Déploiement atomique

Inconvénients:
- Repo plus volumineux (build/ folders)
- Peut sembler "confus" (3 techos différentes)
- Besoin de Flutter SDK pour clone complet

Mitigation:
✓ .gitignore pour build/ artifacts
✓ Documentation très claire (ce document!)
✓ Path aliases et structure logique
```

### Option B: 3 repos indépendants ❌ REJETÉ

```
Avantages:
+ Chaque équipe son repo
+ Techos séparées = moins "confus"
+ Plus flexibilité per-app

Inconvénients:
- ❌ 3 versions différentes possibles = divergence
- ❌ API contracts = synchronisation manuelle = bugs
- ❌ Traductions = copier/coller = erreurs
- ❌ Bailleurs RDC confus ("où est le projet?")
- ❌ CI/CD = 3 pipelines indépendants
- ❌ Rollback difficile (versions incompatibles)
- ❌ Pour un projet national = gouvernance mauvaise

Conclusion: MAUVAIS pour contexte institutionnel RDC
```

### Option C: Monorepo WebComponent + Flutter client ❌ REJETÉ

```
Avantages:
+ Separation of concerns (frontend/backend)

Inconvénients:
- ❌ Même problèmes que Option B
- ❌ Flutter devient "client lourd" = performance
- ❌ Pas de sync avec Web UI
- ❌ Versioning nightmare

Conclusion: Plus compliqué que Option A
```

---

## 🔄 Workflow Développement

### Setup Initial
```bash
git clone kibei.git
cd kibei

# 1. Node dependencies
npm install

# 2. Flutter dependencies (séparé)
cd apps/mobile-flutter
flutter pub get
cd ../..

# 3. Configure environment
cp .env.example .env.local

# 4. Database
npm run db:push
npm run db:seed
```

### Développement
```bash
# Terminal 1: API + Web
npm run dev

# Terminal 2: Flutter
cd apps/mobile-flutter
flutter run
```

### Release
```bash
# 1. Bump version (une seule fois!)
npm run version 1.2.3

# 2. Build tout
npm run build              # API + Web
flutter build apk --release  # Android
flutter build ipa --release  # iOS

# 3. Deploy
npm run deploy-api         # Railway
npm run deploy-web         # Vercel
# Google Play & App Store → Manuel ou via fastlane
```

---

## ⚠️ Points d'Attention et Mitigations

### 1. Taille du repo
**Problème:** build/ folders flutter font gros

**Mitigation:**
```gitignore
# .gitignore additions
build/
.dart_tool/
coverage/
# Existing Node.js ignores
node_modules/
dist/
.next/
```

**Impact:** Minimal, .gitignore fait le job

---

### 2. Setup machine complex
**Problème:** Développeur doit installer Node + Flutter

**Mitigation:**
```bash
# setup.sh automatise tout
#!/bin/bash
curl -fsSL https://raw.githubusercontent.com/flutter/flutter/main/bin/internal/install.sh | bash
npm install
cd apps/mobile-flutter && flutter pub get
npm run db:seed
```

**Impact:** Une seule commande pour tout

---

### 3. CI/CD matrix
**Problème:** GitHub Actions + Flutter SDK = compliqué

**Mitigation:**
```yaml
# .github/workflows/ci.yml
jobs:
  api:
    runs-on: ubuntu-latest
    steps: [API tests/build]
  
  web:
    runs-on: ubuntu-latest
    steps: [Web tests/build]
  
  flutter:
    runs-on: ubuntu-latest
    steps:
      - uses: subosito/flutter-action@v2
      - run: flutter pub get
      - run: flutter test
      - run: flutter build apk --release
```

**Impact:** Standard pattern, nombreux exemples en ligne

---

### 4. Node.js vs Dart confusion
**Problème:** Développeurs confonds imports

**Mitigation:**
```
Documentation TRÈS CLAIRE:
├── ARCHITECTURE_MONOREPO.md (ce qu'on peut/ne peut pas faire)
├── FLUTTER_INTEGRATION.md (Flutter dans monorepo)
├── Guides d'imports explicites
└── Code examples TypeScript vs Dart côte à côte
```

**Impact:** Bonne documentation = zéro confusion

---

### 5. Binaires Flutter gros
**Problème:** APK = 50MB+, Git histoire grandit

**Mitigation:**
```
- ✓ Ne JAMAIS committer build/ ou .dart_tool/
- ✓ APK uploadé sur Google Play via Actions (pas Git)
- ✓ LFS optionnel si vraiment besoin
```

**Impact:** Zéro impact si .gitignore correct

---

## 📜 Décision: Approbation Formelle

### Version monorepo APPROUVÉE ✅

**Acceptation** des principes:

1. ✅ **Un repo = One source of truth**
   - Versioning unifié
   - Audit trail complet
   - Gouvernance unique

2. ✅ **Flutter isolé techniquement**
   - Aucune dépendance Node.js
   - Communication HTTP uniquement
   - Cycle de build séparé

3. ✅ **Partage contrôlé**
   - Contracts API (doc)
   - Translations (JSON)
   - Configuration (constants)
   - Documentation

4. ✅ **CI/CD coordonné**
   - Tests parallèles
   - Déploiement atomique
   - Versioning unique

### Dépendances critiques

Pour que ça marche:

- [ ] .gitignore précis (build artifacts)
- [ ] Documentation très claire (ce document!)
- [ ] GitHub Actions workflow robuste
- [ ] Setup script automatisé
- [ ] Path aliases bien configurés
- [ ] Équipe alignée sur les règles

---

## 🚀 Implémentation

### Fichiers créés
- ✅ `apps/mobile-flutter/` (structure complète)
- ✅ `packages/contracts/` (API contracts)
- ✅ `ARCHITECTURE_MONOREPO.md` (ce système)
- ✅ `FLUTTER_INTEGRATION.md` (setup Flutter)
- ✅ `PHASE_1_COMPLETE.md` (checklist)

### Prochaines étapes
1. **Court terme:** Équipe flutter implémente features
2. **Moyen terme:** First release phase 2 mobile
3. **Long terme:** Expansion régionale (autres provinces)

---

## 📞 Questions Fréquentes

### Q: Pourquoi pas REST API séparé?
**R:** L'API Next.js EST le REST API. Flutter l'appelle via HTTP. Parfait.

### Q: Peut-on partager du code TypeScript vers Flutter?
**R:** Non, mais peut partager: contrats (JSON), traductions (JSON), docs.

### Q: Et si on veut backend séparé (Go, Rust)?
**R:** Upgrade futur: remplacer `apps/api` par service externe. Reste compatible.

### Q: Monorepo devient trop gros?
**R:** À 1M lignes de code, considérer mono-repo → poly-repo. Pas avant.

### Q: Comment tester API ↔ Mobile?
**R:** Postman + Flutter integration tests. Même API endpoints.

### Q: Qui gère Flutter dans équipe?
**R:** Développeurs Flutter. Consomment API. Pas besoin de toucher à TypeScript.

---

## ✅ Validation

**Par qui:** Décision architecturale approuvée  
**Date:** 22 Décembre 2025  
**Valide pour:** Phase 1 + Phase 2 + Phase 3  
**Révision:** Q2 2026 (si besoin poly-repo)

---

**Cette architecture servira KiBei pour les 2-3 prochaines années. Bon développement! 🚀**
