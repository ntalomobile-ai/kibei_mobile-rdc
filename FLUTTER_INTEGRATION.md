# 🔗 Integration Guide: Flutter + Next.js Monorepo

## Vue d'ensemble

Ce guide explique comment Flutter s'intègre dans le monorepo Turborepo tout en restant complètement isolé techniquement.

## 📊 Diagramme d'Intégration

```
┌──────────────────────────────────────────────────────────────┐
│                     MONOREPO KIBEI                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐   ┌──────────────┐   ┌───────────────────┐│
│  │  apps/api    │   │  apps/web    │   │ apps/mobile-      ││
│  │ (Next.js)    │   │ (Next.js)    │   │ flutter (Flutter) ││
│  │ TypeScript   │   │ React/TS     │   │ Dart              ││
│  └──────┬───────┘   └──────┬───────┘   └─────────┬─────────┘│
│         └────────────────────┴────────────────────┘           │
│                      🔌 SHARED VIA HTTP                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SHARED PACKAGES (packages/)                           │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                        │ │
│  │  📄 @kibei/contracts  ← Types API (TS doc)            │ │
│  │     └─ Dart models générés automatiquement             │ │
│  │                                                        │ │
│  │  🌍 @kibei/i18n       ← JSON translations             │ │
│  │     └─ Copié dans assets/translations/                │ │
│  │                                                        │ │
│  │  ⚙️  @kibei/config    ← Configuration centrale        │ │
│  │     └─ Réimplémenté en Dart (ApiConfig)              │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  🗄️  PostgreSQL + RLS (Supabase)                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup Initial

### 1. Clone & Installation

```bash
# Cloner le repo
git clone <kibei-repo>
cd kibei

# Installer Node dependencies
npm install

# Installer Flutter (en tant que développeur)
# macOS
brew install flutter
export PATH="$PATH:$HOME/flutter/bin"

# Linux
# Voir https://flutter.dev/docs/get-started/install/linux

# Windows
# Télécharger depuis https://flutter.dev/docs/get-started/install/windows
# Ajouter C:\flutter\bin au PATH
```

### 2. Vérifier les installations

```bash
# Node
node --version    # ≥18
npm --version     # ≥9

# Flutter
flutter --version
flutter doctor    # Doit montrer ✓ Android SDK, iOS SDK (Mac/iOS)
```

### 3. Setup Flutter spécifique

```bash
cd apps/mobile-flutter

# Obtenir les dépendances Dart
flutter pub get

# (Optionnel) Build runner pour génération code
flutter pub global activate build_runner
flutter pub run build_runner build

# Tester l'installation
flutter run
```

---

## 📦 Synchronisation de Ressources

### A. Traductions (i18n)

**Source:** `packages/i18n/`  
**Destination:** `apps/mobile-flutter/assets/translations/`

#### Option 1: Script automatisé

```bash
# À la racine du monorepo
#!/bin/bash
# scripts/sync-i18n.sh

cp packages/i18n/index.ts /tmp/i18n.ts
node -e "
const i18n = require('/tmp/i18n.ts').default;
const fs = require('fs');

Object.entries(i18n).forEach(([lang, translations]) => {
  fs.writeFileSync(
    \`apps/mobile-flutter/assets/translations/\${lang}.json\`,
    JSON.stringify(translations, null, 2)
  );
});
"
```

Ajouter à `package.json`:
```json
{
  "scripts": {
    "sync:i18n": "bash scripts/sync-i18n.sh"
  }
}
```

#### Option 2: Traduction manuelle

Ajouter dans `apps/mobile-flutter/lib/l10n/` :
```dart
// l10n/app_fr.arb
{
  "welcomeTitle": "Bienvenue dans KiBei",
  "priceTracker": "Suivi des prix",
  ...
}
```

### B. Configuration API

**Source:** `packages/config/`  
**Destination:** `apps/mobile-flutter/lib/config/api_config.dart`

Le fichier `apps/mobile-flutter/lib/config/api_config.dart` est déjà créé et contient:

```dart
class ApiConfig {
  static const String baseUrl = /* dev/staging/prod */;
  static const String authLogin = '/api/auth/login';
  // ... autres endpoints
}
```

À synchroniser quand vous changez les endpoints dans le backend.

### C. Contrats API

**Source:** `packages/contracts/index.ts`  
**Destination:** Dart models générés

#### Approche recommandée: Freezed + json_serializable

1. **Ajouter dépendances** (déjà dans `pubspec.yaml`):
   ```yaml
   dev_dependencies:
     build_runner: ^2.4.0
     freezed: ^2.4.0
     json_serializable: ^6.7.0
   ```

2. **Créer modèle Dart**:
   ```dart
   // lib/models/price.dart
   import 'package:freezed_annotation/freezed_annotation.dart';
   
   part 'price.freezed.dart';
   part 'price.g.dart';
   
   @freezed
   class Price with _$Price {
     const factory Price({
       required String id,
       required String productId,
       required double price,
       required String currency,
       required String status,
     }) = _Price;
   
     factory Price.fromJson(Map<String, dynamic> json) =>
       _$PriceFromJson(json);
   }
   ```

3. **Générer code**:
   ```bash
   cd apps/mobile-flutter
   flutter pub run build_runner build
   ```

#### Alternative: OpenAPI Generator

```bash
# Générer depuis contrat OpenAPI
npx openapi-generator-cli generate \
  -i docs/openapi.json \
  -g dart \
  -o apps/mobile-flutter/lib/generated
```

---

## 🔐 Authentification

### Flow Login (Web → Mobile identique)

```
1. User submit login form
   ↓
2. POST /api/auth/login
   ↓
3. API response: { access_token, refresh_token, user }
   ↓
4. Store tokens:
   - Web: Zustand store + HttpOnly cookies
   - Flutter: SharedPreferences
   ↓
5. Use in subsequent requests:
   Authorization: Bearer <access_token>
```

### Code Flutter

```dart
// lib/services/auth_service.dart

class AuthService {
  final ApiService _api = ApiService();
  final SharedPreferences _prefs;

  Future<User> login(String email, String password) async {
    try {
      final response = await _api.post(
        ApiConfig.authLogin,
        body: {'email': email, 'password': password},
      );
      
      final accessToken = response['access_token'];
      final refreshToken = response['refresh_token'];
      final user = User.fromJson(response['user']);
      
      // Sauvegarder tokens
      await _prefs.setString(ApiConfig.accessTokenKey, accessToken);
      await _prefs.setString(ApiConfig.refreshTokenKey, refreshToken);
      await _prefs.setString(ApiConfig.userKey, jsonEncode(user.toJson()));
      
      return user;
    } on ApiException catch (e) {
      throw AuthException(e.message);
    }
  }

  Future<void> logout() async {
    // POST /api/auth/logout si besoin
    await _prefs.remove(ApiConfig.accessTokenKey);
    await _prefs.remove(ApiConfig.refreshTokenKey);
    await _prefs.remove(ApiConfig.userKey);
  }

  String? getAccessToken() => _prefs.getString(ApiConfig.accessTokenKey);

  bool isLoggedIn() => getAccessToken() != null;
}
```

---

## 🌐 API Calls

### Pattern: Riverpod Provider

```dart
// lib/providers/auth_provider.dart

final authServiceProvider = Provider((ref) => AuthService());

final currentUserProvider = StateNotifierProvider<
  CurrentUserNotifier,
  AsyncValue<User?>
>((ref) => CurrentUserNotifier(ref.watch(authServiceProvider)));

class CurrentUserNotifier extends StateNotifier<AsyncValue<User?>> {
  final AuthService _authService;

  CurrentUserNotifier(this._authService) : super(const AsyncValue.data(null)) {
    _loadUser();
  }

  Future<void> _loadUser() async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      final token = _authService.getAccessToken();
      if (token == null) return null;
      // Fetch user details if needed
      return null;
    });
  }

  Future<void> login(String email, String password) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => _authService.login(email, password));
  }

  Future<void> logout() async {
    await _authService.logout();
    state = const AsyncValue.data(null);
  }
}

// lib/providers/prices_provider.dart

final pricesProvider = FutureProvider<List<Price>>((ref) async {
  final apiService = ApiService();
  final response = await apiService.get('/api/public/prices');
  return (response['data'] as List)
    .map((json) => Price.fromJson(json))
    .toList();
});

// Avec authentification:
final collectedPricesProvider = FutureProvider<List<Price>>((ref) async {
  final authService = ref.watch(authServiceProvider);
  final token = authService.getAccessToken();
  final apiService = ApiService();
  
  final response = await apiService.post(
    '/api/collector/prices',
    body: {'/*...*/ '},
    token: token,
  );
  
  return Price.fromJson(response['data']);
});
```

### Usage dans les widgets

```dart
// lib/screens/prices_screen.dart

class PricesScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final pricesAsync = ref.watch(pricesProvider);

    return pricesAsync.when(
      data: (prices) => ListView.builder(
        itemCount: prices.length,
        itemBuilder: (context, index) {
          final price = prices[index];
          return PriceCard(price: price);
        },
      ),
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, stack) => Center(child: Text('Error: $error')),
    );
  }
}
```

---

## 🧪 Développement Local

### Terminal 1: Backend + Web

```bash
cd kibei
npm run dev
# API on http://localhost:3000
# Web on http://localhost:3001
```

### Terminal 2: Flutter (iOS Simulator)

```bash
cd apps/mobile-flutter
open -a Simulator  # Lance le simulator iOS
flutter run       # Build + run
```

### Terminal 3: Flutter (Android Emulator)

```bash
cd apps/mobile-flutter
flutter emulators --launch Pixel_4_API_30  # Ou tout autre device
flutter run
```

---

## 🏗️ Build & Deployment

### Build Local

```bash
# APK (Android)
cd apps/mobile-flutter
flutter build apk --release

# App Bundle (Google Play - recommandé)
flutter build appbundle --release

# IPA (iOS)
flutter build ipa --release

# Fichiers output:
# Android: build/app/outputs/flutter-apk/
# iOS:     build/ios/iphoneos/
```

### Deployment

```bash
# Créer/mettre à jour une clé de signature
keytool -genkey -v -keystore ~/kibei.jks -keyalg RSA -keysize 2048 -validity 10000 -alias kibei

# Signer APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore ~/kibei.jks \
  build/app/outputs/flutter-apk/app-release-unsigned.apk kibei

# Vérifier
jarsigner -verify -verbose build/app/outputs/flutter-apk/app-release-unsigned.apk

# Zipalign (optimisation)
zipalign -v 4 \
  build/app/outputs/flutter-apk/app-release-unsigned.apk \
  kibei-mobile.apk

# Uploader sur Google Play Console
# 1. Google Play Console → Create Release
# 2. Upload kibei-mobile.apk
# 3. Remplir store listing
# 4. Publish
```

---

## 🔄 CI/CD Integration

### Ajouter à `.github/workflows/build.yml`

```yaml
name: Build & Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  # Existing jobs for API + Web...

  build_flutter:
    name: Build Flutter App
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Flutter
        uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.13.0'
      
      - name: Get dependencies
        run: |
          cd apps/mobile-flutter
          flutter pub get
      
      - name: Run tests
        run: |
          cd apps/mobile-flutter
          flutter test
      
      - name: Build APK
        run: |
          cd apps/mobile-flutter
          flutter build apk --release
      
      - name: Upload APK to Play Store
        if: github.event_name == 'push' && github.ref == 'refs/heads/main'
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_STORE_KEY }}
          packageName: com.kibei.mobile
          releaseFiles: 'apps/mobile-flutter/build/app/outputs/flutter-apk/*.apk'
          track: internal
```

---

## 📋 Checklist Développement

- [ ] `flutter doctor` passe tous les checks
- [ ] `flutter pub get` dans `apps/mobile-flutter`
- [ ] `flutter run` lance l'app sur device/simulator
- [ ] Tokens stockés correctement dans SharedPreferences
- [ ] Requests HTTP incluent Authorization header
- [ ] Gestion d'erreurs pour timeouts/offline
- [ ] Tests unitaires (+70% coverage)
- [ ] Tests d'intégration pour critical paths
- [ ] Lint checks passent (`flutter analyze`)
- [ ] Build APK/IPA sans erreurs
- [ ] Testé sur android 8+ et iOS 12+

---

## 🚨 Troubleshooting

### "Pod install" échoue (iOS)

```bash
cd apps/mobile-flutter/ios
rm Podfile.lock
cd ../..
flutter clean
flutter pub get
flutter run
```

### Erreur "ANDROID_HOME not set"

```bash
# Ajouter à ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Emulator très lent

```bash
# Utiliser accélération hardware
# macOS: Utiliser iOS Simulator (plus rapide que Android Emulator)
# Linux/Windows: Réduire résolution dans device settings
```

### Tokens expirent constamment

```dart
// Ajouter refresh automatique dans ApiService
class ApiService {
  Future<Response> _makeRequest(Future<Response> Function() request) async {
    try {
      return await request();
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        // Token expiré → refresh et retry
        await _authService.refreshToken();
        return await request();
      }
      rethrow;
    }
  }
}
```

---

## 📚 Ressources

- [Flutter Documentation](https://flutter.dev/docs)
- [Riverpod Docs](https://riverpod.dev)
- [Freezed](https://pub.dev/packages/freezed)
- [Dio HTTP Client](https://pub.dev/packages/dio)
- [Monorepo Architecture](./ARCHITECTURE_MONOREPO.md)
- [API Documentation](./API.md)

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines Flutter.
