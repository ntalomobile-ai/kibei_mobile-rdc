-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum types
CREATE TYPE role_enum AS ENUM ('user_public', 'collector', 'moderator', 'admin');
CREATE TYPE submission_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE report_status_enum AS ENUM ('open', 'resolved', 'dismissed');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'user_public',
  province_id UUID,
  market_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_province_id ON users(province_id);

-- Provinces table
CREATE TABLE provinces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  name_sw VARCHAR(255) NOT NULL,
  name_ln VARCHAR(255) NOT NULL,
  description_fr TEXT,
  description_sw TEXT,
  description_ln TEXT,
  capital_city VARCHAR(255),
  population INTEGER,
  region VARCHAR(100),
  is_pilot BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provinces_code ON provinces(code);
CREATE INDEX idx_provinces_is_pilot ON provinces(is_pilot);

-- Cities table
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  province_id UUID NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
  name_fr VARCHAR(255) NOT NULL,
  name_sw VARCHAR(255) NOT NULL,
  name_ln VARCHAR(255) NOT NULL,
  image_url VARCHAR(500),
  image_storage_path VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  population INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cities_province_id ON cities(province_id);

-- Markets table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name_fr VARCHAR(255) NOT NULL,
  name_sw VARCHAR(255) NOT NULL,
  name_ln VARCHAR(255) NOT NULL,
  description_fr TEXT,
  description_sw TEXT,
  description_ln TEXT,
  location_gps VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_markets_city_id ON markets(city_id);
CREATE INDEX idx_markets_is_active ON markets(is_active);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  name_sw VARCHAR(255) NOT NULL,
  name_ln VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  unit_fr VARCHAR(50) NOT NULL,
  unit_sw VARCHAR(50) NOT NULL,
  unit_ln VARCHAR(50) NOT NULL,
  image_url VARCHAR(500),
  image_storage_path VARCHAR(500),
  description_fr TEXT,
  description_sw TEXT,
  description_ln TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active);

-- Prices table
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  submitted_by_id UUID NOT NULL REFERENCES users(id),
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'CDF',
  status submission_status_enum DEFAULT 'pending',
  validated_by_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_prices_product_id ON prices(product_id);
CREATE INDEX idx_prices_market_id ON prices(market_id);
CREATE INDEX idx_prices_status ON prices(status);
CREATE INDEX idx_prices_created_at ON prices(created_at DESC);

-- Exchange rates table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(15, 4) NOT NULL,
  source VARCHAR(100),
  submitted_by_id UUID NOT NULL REFERENCES users(id),
  status submission_status_enum DEFAULT 'pending',
  validated_by_id UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  validated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(from_currency, to_currency, DATE(created_at))
);

CREATE INDEX idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency);
CREATE INDEX idx_exchange_rates_status ON exchange_rates(status);
CREATE INDEX idx_exchange_rates_created_at ON exchange_rates(created_at DESC);

-- Price reports/submissions table
CREATE TABLE price_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id UUID REFERENCES prices(id) ON DELETE CASCADE,
  reported_by_id UUID NOT NULL REFERENCES users(id),
  reason_fr TEXT NOT NULL,
  reason_sw TEXT NOT NULL,
  reason_ln TEXT NOT NULL,
  status report_status_enum DEFAULT 'open',
  resolved_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_price_reports_price_id ON price_reports(price_id);
CREATE INDEX idx_price_reports_status ON price_reports(status);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile" ON users FOR SELECT
  USING (auth.uid()::text = id::text OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can manage users" ON users
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for prices
CREATE POLICY "Public can view approved prices" ON prices FOR SELECT
  USING (status = 'approved' OR auth.jwt() ->> 'role' IN ('collector', 'moderator', 'admin'));

CREATE POLICY "Collector can submit prices" ON prices FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('collector', 'moderator', 'admin'));

CREATE POLICY "Moderator can validate prices in their province" ON prices FOR UPDATE
  USING (auth.jwt() ->> 'role' IN ('moderator', 'admin'))
  WITH CHECK (auth.jwt() ->> 'role' IN ('moderator', 'admin'));

-- RLS Policies for exchange_rates (similar to prices)
CREATE POLICY "Public can view approved exchange rates" ON exchange_rates FOR SELECT
  USING (status = 'approved' OR auth.jwt() ->> 'role' IN ('collector', 'moderator', 'admin'));

CREATE POLICY "Collector can submit exchange rates" ON exchange_rates FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' IN ('collector', 'moderator', 'admin'));

-- RLS Policies for audit logs
CREATE POLICY "Admin can view audit logs" ON audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');
