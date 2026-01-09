/// Service API Flutter
/// 🎯 Couche unique de communication HTTP avec l'API Next.js
/// Gère: authentification, requêtes, tokens, erreurs

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'api_config.dart';

class ApiService {
  late Dio _dio;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConfig.baseUrl,
        connectTimeout: ApiConfig.connectTimeout,
        receiveTimeout: ApiConfig.receiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Intercepteurs
    _dio.interceptors.add(_LoggingInterceptor());
    _dio.interceptors.add(_ErrorInterceptor());
  }

  /// GET - Récupérer données publiques
  Future<Map<String, dynamic>> get(String endpoint) async {
    try {
      final response = await _dio.get(endpoint);
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// POST - Soumettre données (avec auth token)
  Future<Map<String, dynamic>> post(
    String endpoint, {
    required Map<String, dynamic> body,
    String? token,
  }) async {
    try {
      final headers = _buildHeaders(token);
      final response = await _dio.post(
        endpoint,
        data: body,
        options: Options(headers: headers),
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// PUT - Mettre à jour (avec auth token)
  Future<Map<String, dynamic>> put(
    String endpoint, {
    required Map<String, dynamic> body,
    String? token,
  }) async {
    try {
      final headers = _buildHeaders(token);
      final response = await _dio.put(
        endpoint,
        data: body,
        options: Options(headers: headers),
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Construire headers avec token JWT
  Map<String, dynamic> _buildHeaders(String? token) {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  /// Traiter réponse réussie
  Map<String, dynamic> _handleResponse(Response response) {
    if (response.statusCode == 200 || response.statusCode == 201) {
      return response.data as Map<String, dynamic>;
    }
    throw ApiException('Erreur API: ${response.statusCode}');
  }

  /// Traiter erreurs
  ApiException _handleError(DioException error) {
    String message = 'Erreur réseau';
    int? statusCode;

    if (error.response != null) {
      statusCode = error.response!.statusCode;
      message = error.response!.data?['error'] ?? 'Erreur serveur';
    } else if (error.type == DioExceptionType.connectionTimeout) {
      message = 'Timeout de connexion';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      message = 'Timeout de réception';
    }

    return ApiException(message, statusCode: statusCode);
  }
}

/// Intercepteur de logging (développement)
class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('🚀 [${options.method}] ${options.path}');
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('✅ [${response.statusCode}] ${response.requestOptions.path}');
    }
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (kDebugMode) {
      debugPrint('❌ [${err.response?.statusCode}] ${err.requestOptions.path}');
      debugPrint('   Message: ${err.message}');
    }
    handler.next(err);
  }
}

/// Intercepteur de gestion d'erreurs
class _ErrorInterceptor extends Interceptor {
  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    // Les erreurs HTTP (4xx, 5xx) sont gérées par Dio automatiquement
    handler.next(response);
  }
}

/// Exception personnalisée
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic originalError;

  ApiException(
    this.message, {
    this.statusCode,
    this.originalError,
  });

  @override
  String toString() => 'ApiException: $message';
}
