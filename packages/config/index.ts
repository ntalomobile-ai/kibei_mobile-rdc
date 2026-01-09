export const config = {
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || '',
    accessExpiry: parseInt(process.env.JWT_EXPIRY || '900', 10),
    refreshExpiry: parseInt(process.env.JWT_REFRESH_EXPIRY || '604800', 10),
  },
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    webUrl: process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001',
  },
  app: {
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },
};

export const roles = ['user_public', 'collector', 'moderator', 'admin'] as const;
export type RoleType = typeof roles[number];

export const rbac = {
  user_public: ['view_public_data'],
  collector: ['view_public_data', 'submit_prices', 'submit_rates'],
  moderator: ['view_public_data', 'submit_prices', 'validate_submissions'],
  admin: ['*'],
};

export const pilotRegion = {
  province: 'Lualaba',
  city: 'Kolwezi',
};

export const currencies = ['CDF', 'USD', 'EUR', 'ZMW'];
export const languages = ['fr', 'sw', 'ln'];

export const productCategories = [
  'Food',
  'Energy',
  'Health',
  'Agriculture',
  'Minerals',
];

export const defaultPageSize = 20;
export const defaultTimeout = 5000;
