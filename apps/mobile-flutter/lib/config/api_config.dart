/// Configuration API pour Flutter
/// 🎯 Source unique de vérité pour les URLs et endpoints
/// Partagée via le monorepo

import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String appName = 'kibei_mobile';
  static const String version = '1.0.0';

  // Environnements
  static const String _prodUrl = 'https://api.kibei.cd';
  static const String _stagingUrl = 'https://staging-api.kibei.cd';
  static const String _devUrl = 'http://localhost:3000';

  /// Sélectionner URL selon l'environnement
  static String get baseUrl {
    if (kDebugMode) {
      return _devUrl; // Développement local
    }
    // En production, utiliser l'URL d'environnement appropriée
    return _prodUrl;
  }

  // Endpoints publics
  static const String publicPrices = '/api/public/prices';
  static const String publicExchangeRates = '/api/public/exchange-rates';
  static const String publicProvinces = '/api/public/provinces';

  // Endpoints authentifiés
  static const String authLogin = '/api/auth/login';
  static const String authRefresh = '/api/auth/refresh';
  static const String authLogout = '/api/auth/logout';

  // Endpoints collecteurs
  static const String collectorPrices = '/api/collector/prices';
  static const String collectorRates = '/api/collector/rates';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Tokens
  static const String accessTokenKey = 'kibei_access_token';
  static const String refreshTokenKey = 'kibei_refresh_token';
  static const String userKey = 'kibei_user';
}
