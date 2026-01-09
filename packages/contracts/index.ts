/// API Contracts pour KiBei
/// Source unique de vérité pour les structures de données API
/// Utilisable par Web (TypeScript) et Flutter (Dart)
///
/// À noter: Ces types sont définis ici pour documentation.
/// En pratique:
/// - Web importe depuis @kibei/db
/// - Flutter réimplémente en Dart (génération possible avec openapi-generator)

// ============================================================================
// AUTH CONTRACTS
// ============================================================================

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: UserDTO;
}

interface RefreshTokenRequest {
  refresh_token: string;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  provinceId?: string;
  marketId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PRICES CONTRACTS
// ============================================================================

interface PriceDTO {
  id: string;
  productId: string;
  product: ProductDTO;
  marketId: string;
  market: MarketDTO;
  price: number;
  currency: string;
  status: SubmissionStatus;
  submittedById: string;
  submittedBy?: UserDTO;
  submittedAt: string;
  validatedById?: string;
  validatedBy?: UserDTO;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePriceRequest {
  productId: string;
  marketId: string;
  price: number;
  currency?: string; // default: "USD"
}

interface ValidatePriceRequest {
  approved: boolean;
  rejectionReason?: string;
}

// ============================================================================
// EXCHANGE RATES CONTRACTS
// ============================================================================

interface ExchangeRateDTO {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  status: SubmissionStatus;
  submittedById: string;
  submittedBy?: UserDTO;
  submittedAt: string;
  validatedById?: string;
  validatedBy?: UserDTO;
  validatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateExchangeRateRequest {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

interface ValidateExchangeRateRequest {
  approved: boolean;
  rejectionReason?: string;
}

// ============================================================================
// LOCATION CONTRACTS
// ============================================================================

interface ProvinceDTO {
  id: string;
  code: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  capitalCity: string;
  population: number;
  isPilot: boolean;
  cities: CityDTO[];
  createdAt: string;
  updatedAt: string;
}

interface CityDTO {
  id: string;
  provinceId: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  markets: MarketDTO[];
  createdAt: string;
  updatedAt: string;
}

interface MarketDTO {
  id: string;
  cityId: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  prices: PriceDTO[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// PRODUCT CONTRACTS
// ============================================================================

interface ProductDTO {
  id: string;
  code: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  category: string;
  unit: string;
  prices: PriceDTO[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

enum Role {
  USER_PUBLIC = "user_public",
  COLLECTOR = "collector",
  MODERATOR = "moderator",
  ADMIN = "admin",
}

enum SubmissionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

enum ReportStatus {
  PENDING = "pending",
  RESOLVED = "resolved",
  IGNORED = "ignored",
}

// ============================================================================
// ERROR RESPONSES
// ============================================================================

interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path: string;
}

// Exemples de codes d'erreur:
// 400 - Bad Request (validation failed)
// 401 - Unauthorized (no token or invalid)
// 403 - Forbidden (token valid but insufficient permissions)
// 404 - Not Found
// 409 - Conflict (e.g., duplicate email)
// 500 - Internal Server Error

// ============================================================================
// PAGINATION CONTRACTS (Future)
// ============================================================================

interface PaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*

// Example 1: Web Login (TypeScript)
import { apiClient } from '@/lib/api'
import type { LoginRequest, LoginResponse } from '@kibei/contracts'

const handleLogin = async (email: string, password: string) => {
  const payload: LoginRequest = { email, password }
  const response = await apiClient.post<LoginResponse>('/api/auth/login', payload)
  return response.data
}

// Example 2: Flutter Login (Dart)
import 'package:kibei_mobile/config/api_config.dart'
import 'package:kibei_mobile/services/api_service.dart'

Future<void> handleLogin(String email, String password) async {
  final body = {
    'email': email,
    'password': password,
  }
  final response = await apiService.post(
    ApiConfig.authLogin,
    body: body,
  )
  // response['access_token'], response['refresh_token'], response['user']
}

// Example 3: Web Fetch Prices (TypeScript)
import { apiClient } from '@/lib/api'
import type { PriceDTO } from '@kibei/contracts'

const fetchPrices = async () => {
  const response = await apiClient.get<PriceDTO[]>('/api/public/prices')
  return response.data
}

// Example 4: Flutter Fetch Prices (Dart)
import 'package:kibei_mobile/services/api_service.dart'
import 'package:kibei_mobile/models/price.dart'

Future<List<Price>> fetchPrices() async {
  final response = await apiService.get('/api/public/prices')
  return (response['data'] as List)
    .map((item) => Price.fromJson(item))
    .toList()
}

// Example 5: Web Submit Price (TypeScript)
import { apiClient } from '@/lib/api'
import type { CreatePriceRequest, PriceDTO } from '@kibei/contracts'

const submitPrice = async (
  productId: string,
  marketId: string,
  price: number
) => {
  const payload: CreatePriceRequest = {
    productId,
    marketId,
    price,
  }
  const response = await apiClient.post<PriceDTO>(
    '/api/collector/prices',
    payload
  )
  return response.data
}

// Example 6: Flutter Submit Price (Dart)
import 'package:kibei_mobile/services/api_service.dart'

Future<void> submitPrice(
  String productId,
  String marketId,
  double price,
  String token,
) async {
  final body = {
    'productId': productId,
    'marketId': marketId,
    'price': price,
  }
  final response = await apiService.post(
    '/api/collector/prices',
    body: body,
    token: token,
  )
  // Handle response
}

*/

// ============================================================================
// NOTES IMPORTANTES POUR FLUTTER
// ============================================================================

/*

1. TRADUCTION DES TYPES
   TypeScript → Dart:
   - string → String
   - number → double (prices, rates)
   - enum Role {} → enum Role {}
   - interface → class with fromJson
   - Optional<T> → T?

2. GENERATION CODE
   Option A: Freezed + json_serializable
   Option B: OpenAPI Generator (openapi-generator-cli)
   
   Commande:
   npx openapi-generator-cli generate \
     -i apps/api/openapi.json \
     -g dart \
     -o apps/mobile-flutter/lib/generated

3. MODEL EXEMPLE (FREEZED)
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

4. SERIALIZATION
   Web (TypeScript):
   - Automatic avec JSON.stringify / JSON.parse
   - Types checked au compile time
   
   Flutter (Dart):
   - Manual avec fromJson / toJson
   - Freezed génère automatiquement

5. API CALLS
   Web:
   const response = await fetch('/api/prices')
   const data: PriceDTO[] = await response.json()
   
   Flutter:
   final response = await dio.get('/api/prices')
   final data = response.data as List
   final prices = data.map((json) => Price.fromJson(json)).toList()

*/
