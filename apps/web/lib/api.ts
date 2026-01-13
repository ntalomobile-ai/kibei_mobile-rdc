// In development, use the proxy (same origin) to avoid CORS/cookie issues
// In production, use the full API URL
const API_BASE_URL = 
  process.env.NODE_ENV === 'development' 
    ? '' // Use proxy in development (rewrites in next.config.js)
    : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000');

async function refreshSessionIfPossible() {
  try {
    const r = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!r.ok) {
      // Si 401, le refresh token n'existe pas ou a expiré - c'est normal si pas connecté
      if (r.status === 401) {
        throw new Error('Refresh token expired or missing');
      }
      throw new Error('Refresh failed');
    }
  } catch (error) {
    // Ne pas propager l'erreur si c'est juste un refresh token manquant (normal si pas connecté)
    if (error instanceof Error && error.message.includes('Refresh token expired')) {
      throw error;
    }
    throw new Error('Refresh failed');
  }
}

async function fetchJsonWithAuth(url: string, init: RequestInit = {}) {
  const withCreds: RequestInit = {
    ...init,
    credentials: 'include',
  };

  let res = await fetch(url, withCreds);
  if (res.status === 401) {
    await refreshSessionIfPossible();
    res = await fetch(url, withCreds);
  }

  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function fetchPrices(params?: {
  marketId?: string;
  productId?: string;
  provinceId?: string;
  cityId?: string;
  category?: string;
  search?: string;
  take?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.marketId) qs.set('marketId', params.marketId);
  if (params?.productId) qs.set('productId', params.productId);
  if (params?.provinceId) qs.set('provinceId', params.provinceId);
  if (params?.cityId) qs.set('cityId', params.cityId);
  if (params?.category) qs.set('category', params.category);
  if (params?.search) qs.set('search', params.search);
  if (params?.take) qs.set('take', String(params.take));
  
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const response = await fetch(
    `${API_BASE_URL}/api/public/prices${suffix}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch prices');
  }

  return response.json();
}

export async function fetchExchangeRates(cityId?: string) {
  const params = cityId ? `?cityId=${cityId}` : '';
  const response = await fetch(
    `${API_BASE_URL}/api/public/exchange-rates${params}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates');
  }

  return response.json();
}

export async function fetchExchangeRateHistory(params: {
  fromCurrency: string;
  toCurrency: string;
  cityId?: string;
  take?: number;
}) {
  const qs = new URLSearchParams();
  qs.set('fromCurrency', params.fromCurrency);
  qs.set('toCurrency', params.toCurrency);
  if (params.cityId) qs.set('cityId', params.cityId);
  if (params.take) qs.set('take', String(params.take));

  const response = await fetch(`${API_BASE_URL}/api/public/exchange-rates/history?${qs.toString()}`);
  if (!response.ok) throw new Error('Failed to fetch exchange rate history');
  return response.json();
}

export async function fetchProvinces() {
  const response = await fetch(
    `${API_BASE_URL}/api/public/provinces`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch provinces');
  }

  return response.json();
}

export async function fetchCities(params?: { provinceId?: string }) {
  const qs = new URLSearchParams();
  if (params?.provinceId) qs.set('provinceId', params.provinceId);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';

  const response = await fetch(`${API_BASE_URL}/api/public/cities${suffix}`);

  if (!response.ok) {
    throw new Error('Failed to fetch cities');
  }

  return response.json();
}

export async function fetchCityById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/public/cities/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Failed to fetch city');
  return response.json();
}

export async function fetchProducts() {
  const response = await fetch(
    `${API_BASE_URL}/api/public/products`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
}

export async function fetchMarkets(params?: { cityId?: string; provinceId?: string }) {
  const qs = new URLSearchParams();
  if (params?.cityId) qs.set('cityId', params.cityId);
  if (params?.provinceId) qs.set('provinceId', params.provinceId);

  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const response = await fetch(
    `${API_BASE_URL}/api/public/markets${suffix}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch markets');
  }

  return response.json();
}

export async function fetchMarketById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/public/markets/${encodeURIComponent(id)}`);
  if (!response.ok) throw new Error('Failed to fetch market');
  return response.json();
}

export async function fetchNotifications(take: number = 20) {
  // L'API limite take à 50 maximum
  const validTake = Math.min(Math.max(1, take), 50);
  const qs = new URLSearchParams();
  qs.set('take', String(validTake));
  const response = await fetch(`${API_BASE_URL}/api/public/notifications?${qs.toString()}`);
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to fetch notifications');
  }
  return response.json();
}

export async function submitPublicPrice(
  productId: string,
  marketId: string,
  price: number,
  currency: string = 'CDF',
  notes?: string
) {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/public/price-submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, marketId, price, currency, notes }),
  });
}

export async function fetchPublicPriceById(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/public/prices/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error('Failed to fetch price details');
  }
  return response.json();
}

export async function submitPrice(
  productId: string,
  marketId: string,
  price: number,
  currency: string = 'CDF'
) {
  const response = await fetch(
    `${API_BASE_URL}/api/collector/prices`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, marketId, price, currency }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to submit price');
  }

  return response.json();
}

export async function submitExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  rate: number,
  cityId?: string
) {
  const response = await fetch(
    `${API_BASE_URL}/api/collector/exchange-rates`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fromCurrency, toCurrency, rate, cityId }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to submit exchange rate');
  }

  return response.json();
}

export async function fetchMyPrices(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/collector/prices${qs}`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch my prices');
  }

  return response.json();
}

export async function fetchMyExchangeRates(status?: string) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : '';
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/collector/exchange-rates${qs}`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch my exchange rates');
  }

  return response.json();
}

export async function fetchPendingPricesToValidate() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/moderator/prices`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch prices to validate');
  }

  return response.json();
}

export async function validatePrice(priceId: string, approved: boolean, notes?: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/moderator/prices?id=${encodeURIComponent(priceId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ approved, notes }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to validate price');
  }

  return response.json();
}

export async function fetchPendingExchangeRatesToValidate() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/moderator/exchange-rates`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    throw new Error('Failed to fetch exchange rates to validate');
  }

  return response.json();
}

export async function validateExchangeRate(rateId: string, approved: boolean, notes?: string) {
  const response = await fetch(
    `${API_BASE_URL}/api/moderator/exchange-rates?id=${encodeURIComponent(rateId)}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ approved, notes }),
    }
  );

  if (!response.ok) {
    throw new Error('Failed to validate exchange rate');
  }

  return response.json();
}

export async function fetchAdminUsers() {
  const response = await fetch(
    `${API_BASE_URL}/api/admin/users`,
    { credentials: 'include' }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return response.json();
}

export async function createAdminUser(payload: {
  email: string;
  fullName: string;
  password: string;
  role: 'user_public' | 'collector' | 'moderator' | 'admin';
  provinceId?: string;
  marketId?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to create user');
  }

  return response.json();
}

export async function updateAdminUser(
  id: string,
  payload: Partial<{
    email: string;
    fullName: string;
    password: string;
    role: 'user_public' | 'collector' | 'moderator' | 'admin';
    provinceId: string | null;
    marketId: string | null;
    isActive: boolean;
  }>
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to update user');
  }

  return response.json();
}

export async function disableAdminUser(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/users?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to disable user');
  }

  return response.json();
}

export async function fetchAdminProvinces() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/provinces`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to fetch provinces');
  }

  return response.json();
}

export async function createAdminProvince(payload: {
  code: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  capitalCity?: string;
  population?: number;
  isPilot?: boolean;
}) {
  const response = await fetch(`${API_BASE_URL}/api/admin/provinces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to create province');
  }

  return response.json();
}

export async function fetchAdminProducts() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/products`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to fetch products');
  }

  return response.json();
}

export async function fetchAdminCities() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/cities`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to fetch cities');
  }

  return response.json();
}

export async function createAdminCity(payload: {
  provinceId: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  imageUrl?: string;
}) {
  // Fonction pour faire la requête
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/cities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  };

  let response = await makeRequest();

  // Si 401, essayer de rafraîchir le token et réessayer
  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      // Réessayer la requête après le rafraîchissement
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Gérer les erreurs Zod qui retournent un tableau d'issues
    if (Array.isArray(error.error)) {
      const messages = error.error.map((e: any) => `${e.path?.join('.') || 'champ'}: ${e.message}`).join(', ');
      throw new Error(`Erreur de validation: ${messages}`);
    }
    throw new Error(error.error || error.message || 'Failed to create city');
  }

  return response.json();
}

export async function updateAdminCity(
  id: string,
  payload: Partial<{
    provinceId: string;
    nameFr: string;
    nameSw: string;
    nameLn: string;
    imageUrl: string | null;
  }>
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/cities/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to update city');
  }

  return response.json();
}

export async function deleteAdminCity(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/cities/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to delete city');
  }

  return response.json();
}

export async function fetchAdminMarkets() {
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/markets`, { credentials: 'include' });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to fetch markets');
  }

  return response.json();
}

export async function createAdminMarket(payload: {
  cityId: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  imageUrl?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/admin/markets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to create market');
  }

  return response.json();
}

export async function updateAdminMarket(
  id: string,
  payload: Partial<{
    cityId: string;
    nameFr: string;
    nameSw: string;
    nameLn: string;
    imageUrl: string | null;
    isActive: boolean;
  }>
) {
  // Fonction pour faire la requête
  const makeRequest = async () => {
    return fetch(`${API_BASE_URL}/api/admin/markets/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
  };

  let response = await makeRequest();

  // Si 401, essayer de rafraîchir le token et réessayer
  if (response.status === 401) {
    try {
      await refreshSessionIfPossible();
      // Réessayer la requête après le rafraîchissement
      response = await makeRequest();
    } catch (refreshError) {
      console.error('Erreur lors du rafraîchissement du token:', refreshError);
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Erreur détaillée mise à jour marché:', error);
    // Gérer les erreurs Zod qui retournent un tableau d'issues
    if (Array.isArray(error.error)) {
      const messages = error.error.map((e: any) => `${e.path?.join('.') || 'champ'}: ${e.message}`).join(', ');
      throw new Error(`Erreur de validation: ${messages}`);
    }
    throw new Error(error.error || error.message || 'Failed to update market');
  }

  return response.json();
}

export async function deleteAdminMarket(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/markets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to delete market');
  }

  return response.json();
}

export async function createAdminProduct(payload: {
  code: string;
  nameFr: string;
  nameSw: string;
  nameLn: string;
  category: string;
  unitFr: string;
  unitSw: string;
  unitLn: string;
  imageUrl?: string;
  descriptionFr?: string;
  descriptionSw?: string;
  descriptionLn?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to create product');
  }

  return response.json();
}

export async function updateAdminProduct(
  id: string,
  payload: Partial<{
    code: string;
    nameFr: string;
    nameSw: string;
    nameLn: string;
    category: string;
    unitFr: string;
    unitSw: string;
    unitLn: string;
    imageUrl: string | null;
    descriptionFr: string | null;
    descriptionSw: string | null;
    descriptionLn: string | null;
    isActive: boolean;
  }>
) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to update product');
  }

  return response.json();
}

export async function disableAdminProduct(id: string) {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || 'Failed to disable product');
  }

  return response.json();
}

// ============ USER PROFILE ============

export async function fetchUserStats() {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/public/user-stats`);
}

export async function uploadProfilePhoto(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/public/profile/avatar`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload profile photo');
  }

  return response.json();
}

export async function updateUserProfile(data: { fullName?: string }) {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/public/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// ============ SIGNALEMENTS CITOYENS ============

export async function submitPriceReport(data: {
  productId: string;
  marketId: string;
  observedPrice: number;
  currency?: string;
  reason: string;
}) {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/public/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchAdminReports(params?: {
  status?: string;
  transmitted?: string;
  priority?: string;
}) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.transmitted) qs.set('transmitted', params.transmitted);
  if (params?.priority) qs.set('priority', params.priority);
  
  return fetchJsonWithAuth(`${API_BASE_URL}/api/admin/reports?${qs.toString()}`);
}

export async function updateAdminReport(
  id: string,
  data: {
    status?: 'open' | 'resolved' | 'dismissed';
    resolvedNotes?: string;
    transmittedToAuthorities?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  }
) {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/admin/reports?id=${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

// Récupérer les signalements de l'utilisateur connecté
export async function fetchMyReports() {
  return fetchJsonWithAuth(`${API_BASE_URL}/api/public/my-reports`);
}