-- Scout Dashboard Backend - Initial Schema Migration (001_init.sql)
-- Postgres/Supabase friendly
-- Generated: January 2026

BEGIN;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin','analyst','viewer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'analysis_mode') THEN
    CREATE TYPE analysis_mode AS ENUM ('single','between','among');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'time_period') THEN
    CREATE TYPE time_period AS ENUM ('realtime','hourly','daily','weekly','monthly','quarterly');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'export_format') THEN
    CREATE TYPE export_format AS ENUM ('csv','xlsx','pdf');
  END IF;
END$$;

-- Tables
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(100) NOT NULL UNIQUE,
  timezone varchar(50) NOT NULL DEFAULT 'Asia/Manila',
  features jsonb NOT NULL DEFAULT jsonb_build_object(
    'export_formats', jsonb_build_array('csv','xlsx','pdf'),
    'ai_insights', true
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  auth_id uuid NOT NULL UNIQUE,
  email varchar(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'viewer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, email)
);

CREATE TABLE IF NOT EXISTS brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  parent_category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  country varchar(100) NOT NULL DEFAULT 'Philippines',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, name)
);

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  region_id uuid NOT NULL REFERENCES regions(id) ON DELETE RESTRICT,
  code varchar(50) NOT NULL,
  name varchar(255) NOT NULL,
  address text,
  latitude numeric(10,8),
  longitude numeric(11,8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  brand_id uuid NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  sku varchar(100) NOT NULL,
  name varchar(255) NOT NULL,
  price numeric(12,2),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (org_id, sku)
);

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  started_at timestamptz NOT NULL,
  completed_at timestamptz NOT NULL,
  transaction_date date NOT NULL,
  duration_seconds int NOT NULL CHECK (duration_seconds >= 0),
  total_amount numeric(12,2) NOT NULL CHECK (total_amount >= 0),
  line_item_count int NOT NULL CHECK (line_item_count >= 0),
  total_quantity int CHECK (total_quantity IS NULL OR total_quantity >= 0),
  customer_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_id uuid NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity int NOT NULL CHECK (quantity > 0),
  unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total numeric(12,2) NOT NULL CHECK (line_total >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Aggregates as tables (refresh jobs populate them)
CREATE TABLE IF NOT EXISTS transaction_daily_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  transaction_count int NOT NULL CHECK (transaction_count >= 0),
  total_revenue numeric(15,2) NOT NULL CHECK (total_revenue >= 0),
  avg_basket_size numeric(10,2),
  avg_duration_seconds int CHECK (avg_duration_seconds IS NULL OR avg_duration_seconds >= 0),
  total_line_items int CHECK (total_line_items IS NULL OR total_line_items >= 0),
  total_quantity int CHECK (total_quantity IS NULL OR total_quantity >= 0),
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_hourly_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  transaction_date date NOT NULL,
  hour_of_day int NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  transaction_count int NOT NULL CHECK (transaction_count >= 0),
  total_revenue numeric(15,2) NOT NULL CHECK (total_revenue >= 0),
  avg_basket_size numeric(10,2),
  avg_duration_seconds int CHECK (avg_duration_seconds IS NULL OR avg_duration_seconds >= 0),
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_weekly_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  region_id uuid REFERENCES regions(id) ON DELETE SET NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  transaction_count int NOT NULL CHECK (transaction_count >= 0),
  total_revenue numeric(15,2) NOT NULL CHECK (total_revenue >= 0),
  avg_basket_size numeric(10,2),
  avg_duration_seconds int CHECK (avg_duration_seconds IS NULL OR avg_duration_seconds >= 0),
  refreshed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard_insights_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  cache_key text NOT NULL,
  payload jsonb NOT NULL,
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  UNIQUE (org_id, cache_key)
);

CREATE TABLE IF NOT EXISTS dashboard_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  format export_format NOT NULL,
  request jsonb NOT NULL,
  storage_path text,
  signed_url text,
  status varchar(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','ready','error')),
  row_count int,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action varchar(100) NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(org_id, role);
CREATE INDEX IF NOT EXISTS idx_brands_org ON brands(org_id);
CREATE INDEX IF NOT EXISTS idx_categories_org ON categories(org_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_regions_org ON regions(org_id);
CREATE INDEX IF NOT EXISTS idx_stores_org_region ON stores(org_id, region_id);
CREATE INDEX IF NOT EXISTS idx_products_org_brand ON products(org_id, brand_id);
CREATE INDEX IF NOT EXISTS idx_products_org_category ON products(org_id, category_id);

CREATE INDEX IF NOT EXISTS idx_tx_org_date ON transactions(org_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_tx_org_store_date ON transactions(org_id, store_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_tx_org_started_at ON transactions(org_id, started_at);

CREATE INDEX IF NOT EXISTS idx_tli_tx ON transaction_line_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_tli_org_product ON transaction_line_items(org_id, product_id);

CREATE INDEX IF NOT EXISTS idx_daily_org_date ON transaction_daily_summary(org_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_hourly_org_date_hour ON transaction_hourly_summary(org_id, transaction_date, hour_of_day);
CREATE INDEX IF NOT EXISTS idx_weekly_org_week ON transaction_weekly_summary(org_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_insights_org_expires ON dashboard_insights_cache(org_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_exports_org_status ON dashboard_exports(org_id, status);
CREATE INDEX IF NOT EXISTS idx_audit_org_created ON audit_logs(org_id, created_at);

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION _set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_org_updated_at') THEN
    CREATE TRIGGER trg_org_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_brands_updated_at') THEN
    CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_categories_updated_at') THEN
    CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_regions_updated_at') THEN
    CREATE TRIGGER trg_regions_updated_at BEFORE UPDATE ON regions
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_stores_updated_at') THEN
    CREATE TRIGGER trg_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_products_updated_at') THEN
    CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tx_updated_at') THEN
    CREATE TRIGGER trg_tx_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION _set_updated_at();
  END IF;
END$$;

COMMIT;
