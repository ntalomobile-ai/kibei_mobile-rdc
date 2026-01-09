# Architecture KiBei - Détails Techniques

## 🏛️ Clean Architecture Layers

```
┌─────────────────────────────┐
│   Presentation Layer        │  (apps/web)
│   - UI Components           │  - Pages
│   - Forms                   │  - Hooks
│   - State Management        │  - API Calls
└────────────┬────────────────┘
             │ HTTP/REST
┌────────────▼────────────────┐
│   Application Layer         │  (apps/api)
│   - API Routes              │  - Auth
│   - Middleware              │  - Validation
│   - Controllers             │  - Error Handling
└────────────┬────────────────┘
             │ Database Calls
┌────────────▼────────────────┐
│   Domain/Business Layer     │  (packages/services)
│   - Services                │  - Business Logic
│   - Entities                │  - Validation
│   - Use Cases               │  - Rules
└────────────┬────────────────┘
             │ ORM
┌────────────▼────────────────┐
│   Data Access Layer         │  (packages/db)
│   - Prisma ORM              │  - Models
│   - Database Queries        │  - Migrations
│   - RLS Policies            │  - Types
└────────────┬────────────────┘
             │ SQL
         PostgreSQL
```

## 🔐 Security Stack

### Authentication Flow

```
User Login
    ↓
[Web] POST /api/auth/login
    ↓
[API] Verify email + password
    ↓
[API] Create JWT Access + Refresh tokens
    ↓
[API] Set HTTP-only cookies
    ↓
[Web] Store user in Zustand store
    ↓
Dashboard Access
```

### Authorization (RBAC)

```
Request
    ↓
[Middleware] Extract token from cookies
    ↓
[Auth] Verify JWT signature & expiry
    ↓
[Auth] Extract payload (role, sub, email)
    ↓
[Middleware] Check role against allowed_roles
    ↓
Proceed or 403 Forbidden
```

### RLS (Row Level Security)

```
Query: SELECT prices WHERE status = 'approved'
    ↓
Supabase RLS Policy
    ↓
public  → only approved prices
collector → approved + own pending
moderator → province-restricted
admin    → all rows
    ↓
Filtered Results
```

## 📡 API Design

### Request/Response Pattern

```
Request:
{
  "method": "POST",
  "url": "/api/collector/prices",
  "headers": {
    "Content-Type": "application/json"
  },
  "cookies": {
    "accessToken": "eyJ..."
  },
  "body": {
    "productId": "uuid",
    "marketId": "uuid",
    "price": 45000,
    "currency": "CDF"
  }
}

Response (Success):
{
  "data": {
    "id": "uuid",
    "price": "450.00",
    "status": "pending",
    "createdAt": "2024-12-22T10:00:00Z"
  }
}

Response (Error):
{
  "error": "Validation failed",
  "details": [
    {
      "field": "price",
      "message": "Must be positive"
    }
  ]
}
```

### Validation avec Zod

```typescript
// Input validation
const submitPriceSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  marketId: z.string().uuid("Invalid market ID"),
  price: z.number().positive("Price must be positive"),
  currency: z.string().default("CDF"),
});

// Usage
const data = submitPriceSchema.parse(body);
// Throws ZodError if invalid
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role role_enum DEFAULT 'user_public',
  province_id UUID REFERENCES provinces(id),
  market_id UUID REFERENCES markets(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policy: Users can only view own profile
CREATE POLICY "Users view own" ON users
  FOR SELECT
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');
```

### Prices Table

```sql
CREATE TABLE prices (
  id UUID PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id),
  market_id UUID NOT NULL REFERENCES markets(id),
  submitted_by_id UUID NOT NULL REFERENCES users(id),
  price DECIMAL(12, 2) NOT NULL,
  status submission_status_enum DEFAULT 'pending',
  validated_by_id UUID REFERENCES users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Policy: Public sees approved only
CREATE POLICY "Public view approved" ON prices
  FOR SELECT
  USING (status = 'approved' OR auth.jwt() ->> 'role' IN ('collector', 'moderator', 'admin'));

-- RLS Policy: Moderator validates only their province
CREATE POLICY "Moderator validate province" ON prices
  FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('moderator', 'admin')
    AND (
      SELECT province_id 
      FROM cities 
      WHERE id = (SELECT city_id FROM markets WHERE id = market_id)
    ) = auth.jwt() ->> 'province_id'
  );
```

## 🌍 Internationalization (i18n)

### Structure

```typescript
// packages/i18n/index.ts
export const translations = {
  fr: {
    common: { welcome: "Bienvenue" },
    prices: { title: "Prix des Produits" }
  },
  sw: {
    common: { welcome: "Karibu" },
    prices: { title: "Bei za Bidhaa" }
  },
  ln: {
    common: { welcome: "Ayobami" },
    prices: { title: "Mibu ya Bilamba" }
  }
};
```

### Usage (React)

```typescript
// Hook personnalisé
function useTranslation() {
  const { language } = useLanguage();
  return {
    t: (key: string) => getTranslation(language, key)
  };
}

// In component
export function Header() {
  const { t } = useTranslation();
  return <h1>{t('nav.home')}</h1>;
}
```

## 🎯 State Management

### Zustand Stores

```typescript
// Auth Store
interface AuthStore {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

// Language Store
interface LanguageStore {
  language: 'fr' | 'sw' | 'ln';
  setLanguage: (lang) => void;
}
```

### Persistence

```typescript
// Automatique avec middleware persist
create<AuthStore>()(
  persist(
    (set) => ({ ... }),
    { name: 'auth-store' }
  )
);

// Sauvegardé dans localStorage
// Restauré au montage du composant
```

## 🚀 Performance Optimizations

### Frontend
- Next.js Image optimization
- Code splitting automatique
- Server components par défaut
- ISR (Incremental Static Regeneration)
- Tailwind CSS purging

### Backend
- Indexes Prisma sur colonnes fréquentes
- Connection pooling Supabase
- Caching des queries RLS
- Pagination (limit + offset)
- Compression gzip

### Database
- Indexes sur: email, role, status, created_at
- Partitioning par date (prices, exchange_rates)
- Connection limits
- Query timeouts
- ANALYZE VERBOSE

## 🧪 Testing Strategy

### À Implémenter
```typescript
// Unit tests (Jest)
describe('PriceService', () => {
  it('should validate positive price', () => {
    const price = new Price(productId, marketId, -100);
    expect(() => price.validate()).toThrow();
  });
});

// Integration tests (Supertest)
describe('POST /api/collector/prices', () => {
  it('should reject unauthorized', async () => {
    const res = await request(app).post('/api/collector/prices');
    expect(res.status).toBe(401);
  });
});

// E2E tests (Playwright)
test('user can login and view dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'user@kibei.cd');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

## 📊 Audit & Compliance

### Audit Logs

```typescript
async function logAudit(
  userId: string,
  action: string,        // CREATE, UPDATE, DELETE, LOGIN
  tableName: string,     // users, prices, etc
  recordId: string,      // UUID of affected record
  oldValues: Json,       // Previous state
  newValues: Json,       // New state
  req: NextRequest       // IP, user-agent
) {
  await prisma.auditLog.create({
    data: { userId, action, tableName, recordId, oldValues, newValues, ... }
  });
}
```

### GDPR Considerations
- [x] User data collection logged
- [x] Soft deletes (deleted_at)
- [ ] Data export endpoint (TO-DO)
- [ ] Right to be forgotten (TO-DO)
- [ ] Privacy policy (TO-DO)

## 🔄 Continuous Integration (CI/CD)

### GitHub Actions (À configurer)

```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

### Deployment (Vercel)
```
Push to main
    ↓
    GitHub Actions
    ├─ Lint
    ├─ Type Check
    ├─ Test
    └─ Build
    ↓
    Auto-deploy to Vercel
    ├─ API: api.kibei.cd
    ├─ Web: kibei.cd
    └─ Database migrations
```

---

**Version:** 0.1.0  
**Status:** 🟩 In Progress
