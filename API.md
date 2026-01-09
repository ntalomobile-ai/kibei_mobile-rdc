# API Documentation - KiBei Mobile RDC

## Base URL
- **Development:** http://localhost:3000
- **Production:** https://api.kibei.cd (TBD)

## Authentication

All protected routes require an `accessToken` cookie with a valid JWT.

### JWT Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "collector",
  "provinceId": "province-uuid",
  "iat": 1703250000,
  "exp": 1703250900
}
```

### Token Refresh
```
Access Token expires in 15 minutes
Refresh Token expires in 7 days
Auto-refresh endpoint: POST /api/auth/refresh
```

---

## 🔓 Public Endpoints

### GET /api/public/prices
Get all approved prices

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "price": "450.00",
      "currency": "CDF",
      "product": {
        "id": "uuid",
        "nameFr": "Maïs"
      },
      "market": {
        "id": "uuid",
        "nameFr": "Marché Central",
        "city": {
          "nameFr": "Kolwezi",
          "province": {
            "nameFr": "Lualaba"
          }
        }
      },
      "submittedBy": {
        "id": "uuid",
        "fullName": "Collecteur RDC"
      },
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

---

### GET /api/public/exchange-rates
Get all approved exchange rates

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "fromCurrency": "CDF",
      "toCurrency": "USD",
      "rate": "2750.5",
      "source": "Banque Centrale",
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

---

## 🔐 Authentication Endpoints

### POST /api/auth/login
User login

**Request:**
```json
{
  "email": "user@kibei.cd",
  "password": "SecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@kibei.cd",
    "fullName": "User Full Name",
    "role": "collector"
  }
}
```

**Cookies Set:**
- `accessToken` (httpOnly, 15 min)
- `refreshToken` (httpOnly, 7 days)

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### POST /api/auth/refresh
Refresh access token

**Response:**
```json
{
  "success": true
}
```

**Cookies Updated:**
- `accessToken` (new token, 15 min)

---

### POST /api/auth/logout
Clear authentication cookies

**Response:**
```json
{
  "success": true
}
```

---

## 👤 Collector Endpoints

### POST /api/collector/prices
Submit a price (role: collector, moderator, admin)

**Request:**
```json
{
  "productId": "uuid",
  "marketId": "uuid",
  "price": 45000,
  "currency": "CDF",
  "notes": "Optional notes"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "price": "450.00",
    "currency": "CDF",
    "status": "pending",
    "product": { ... },
    "market": { ... },
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

**Errors:**
- `400` - Validation failed
- `401` - Unauthorized
- `403` - Forbidden (wrong role)

---

### POST /api/collector/exchange-rates
Submit an exchange rate (role: collector, moderator, admin)

**Request:**
```json
{
  "fromCurrency": "CDF",
  "toCurrency": "USD",
  "rate": 2750.5,
  "source": "Banque Centrale",
  "notes": "Optional notes"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "fromCurrency": "CDF",
    "toCurrency": "USD",
    "rate": "2750.5",
    "status": "pending",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}
```

---

## ✅ Moderator Endpoints

### GET /api/moderator/prices
Get pending prices to validate (role: moderator, admin)

**Query Parameters:**
- None required

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "price": "450.00",
      "status": "pending",
      "product": { ... },
      "market": { ... },
      "submittedBy": { ... },
      "createdAt": "2024-12-22T10:00:00Z"
    }
  ]
}
```

**Note:** Moderators see only pending prices from their province

---

### PUT /api/moderator/prices?id=<priceId>
Validate or reject a price (role: moderator, admin)

**Request:**
```json
{
  "approved": true,
  "notes": "Price looks correct"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "validatedBy": { ... },
    "validatedAt": "2024-12-22T10:05:00Z"
  }
}
```

**Errors:**
- `404` - Price not found
- `403` - Price not in moderator's province

---

### GET /api/moderator/exchange-rates
Get pending exchange rates to validate (role: moderator, admin)

**Response:** Same structure as GET /api/moderator/prices

---

### PUT /api/moderator/exchange-rates?id=<rateId>
Validate or reject an exchange rate (role: moderator, admin)

**Request:**
```json
{
  "approved": true,
  "notes": "Rate confirmed"
}
```

**Response:** Same structure as price validation

---

## 👨‍💼 Admin Endpoints

### GET /api/admin/users
List all users (role: admin only)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@kibei.cd",
      "fullName": "Full Name",
      "role": "collector",
      "isActive": true,
      "createdAt": "2024-12-22T10:00:00Z",
      "province": { "id": "uuid", "nameFr": "Lualaba" }
    }
  ]
}
```

---

### POST /api/admin/users
Create a new user (role: admin only)

**Request:**
```json
{
  "email": "newuser@kibei.cd",
  "fullName": "New User",
  "password": "SecurePass123",
  "role": "collector",
  "provinceId": "uuid (optional)",
  "marketId": "uuid (optional)"
}
```

**Response (201):**
```json
{
  "data": {
    "id": "uuid",
    "email": "newuser@kibei.cd",
    "fullName": "New User",
    "role": "collector"
  }
}
```

---

### GET /api/admin/provinces
List all provinces (role: admin only)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "LBA",
      "nameFr": "Lualaba",
      "nameSw": "Lualaba",
      "nameLn": "Lualaba",
      "capitalCity": "Kolwezi",
      "population": 1600000,
      "isPilot": true,
      "_count": {
        "cities": 2,
        "users": 5
      }
    }
  ]
}
```

---

### POST /api/admin/provinces
Create a new province (role: admin only)

**Request:**
```json
{
  "code": "KTG",
  "nameFr": "Katanga",
  "nameSw": "Katanga",
  "nameLn": "Katanga",
  "capitalCity": "Lubumbashi",
  "population": 2000000,
  "isPilot": false
}
```

**Response (201):**
```json
{
  "data": { ... province object }
}
```

---

### GET /api/admin/products
List all products (role: admin only)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "code": "MAIZE",
      "nameFr": "Maïs",
      "nameSw": "Mahindi",
      "nameLn": "Liwa",
      "category": "Agriculture",
      "unitFr": "kg",
      "isActive": true
    }
  ]
}
```

---

### POST /api/admin/products
Create a new product (role: admin only)

**Request:**
```json
{
  "code": "RICE",
  "nameFr": "Riz",
  "nameSw": "Wali",
  "nameLn": "Mbengo",
  "category": "Agriculture",
  "unitFr": "kg",
  "unitSw": "kg",
  "unitLn": "kg"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "price",
      "message": "Must be a positive number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error"
}
```

---

## 🔄 Rate Limiting

- **Public endpoints:** 100 req/min per IP
- **Authenticated:** 1000 req/min per user
- **Admin:** No limit

---

## 📝 Changelog

### v0.1.0 (Current)
- Initial API release
- All core endpoints
- JWT authentication
- RLS policies

---

**Last Updated:** December 22, 2024  
**Status:** 🟩 Production Ready
