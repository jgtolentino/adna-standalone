-- Scout Dashboard Canonical Data Model
-- Migration: 20251207_scout_transactions.sql
-- Description: Creates the production-ready Scout analytics schema with
--              transactions, stores, regions, and optimized views for dashboard pages

-- Create scout schema
CREATE SCHEMA IF NOT EXISTS scout;

-- =============================================================================
-- ENUMS
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'daypart') THEN
    CREATE TYPE scout.daypart AS ENUM ('morning', 'afternoon', 'evening', 'night');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE scout.payment_method AS ENUM ('cash', 'gcash', 'maya', 'card', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'income_band') THEN
    CREATE TYPE scout.income_band AS ENUM ('low', 'middle', 'high', 'unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urban_rural') THEN
    CREATE TYPE scout.urban_rural AS ENUM ('urban', 'rural', 'unknown');
  END IF;
END $$;

-- =============================================================================
-- DIMENSION TABLES
-- =============================================================================

-- Regions (PH administrative regions)
CREATE TABLE IF NOT EXISTS scout.regions (
  code TEXT PRIMARY KEY,                    -- "NCR", "CENTRAL", etc.
  name TEXT NOT NULL,                       -- "Metro Manila", "Central Luzon"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Stores (sari-sari stores and retail locations)
CREATE TABLE IF NOT EXISTS scout.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code TEXT NOT NULL UNIQUE,          -- "ST000284"
  store_name TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES scout.regions(code),
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  store_type TEXT DEFAULT 'sari-sari',      -- sari-sari, convenience, supermarket
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stores_region ON scout.stores(region_code);
CREATE INDEX IF NOT EXISTS idx_stores_city ON scout.stores(city);

-- =============================================================================
-- FACT TABLE: TRANSACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS scout.transactions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Store Reference
  store_id UUID NOT NULL REFERENCES scout.stores(id),

  -- Temporal
  timestamp TIMESTAMPTZ NOT NULL,
  time_of_day scout.daypart NOT NULL,

  -- Location (denormalized for fast filtering)
  region_code TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  barangay TEXT NOT NULL,

  -- Product Data
  brand_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_category TEXT NOT NULL,           -- "Snacks", "Tobacco", "Beverages"
  product_subcategory TEXT,
  our_brand BOOLEAN NOT NULL DEFAULT FALSE, -- Is this a TBWA client brand?
  tbwa_client_brand BOOLEAN NOT NULL DEFAULT FALSE,

  -- Transaction Amounts
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL,
  gross_amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) GENERATED ALWAYS AS (gross_amount - discount_amount) STORED,
  payment_method scout.payment_method NOT NULL,

  -- Customer Demographics (for Consumer Profiling)
  customer_id TEXT,
  age INTEGER,
  gender TEXT,                              -- "M", "F", "Other", "Unknown"
  income scout.income_band NOT NULL DEFAULT 'unknown',
  urban_rural scout.urban_rural NOT NULL DEFAULT 'unknown',

  -- Behavior / Funnel Tracking
  funnel_stage TEXT,                        -- "visit", "browse", "request", "accept", "purchase"
  basket_size INTEGER,                      -- Number of items in basket
  repeated_customer BOOLEAN,
  request_type TEXT,                        -- "branded", "generic", "indirect"
  suggestion_accepted BOOLEAN,
  substitution_occurred BOOLEAN,

  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tx_store_date ON scout.transactions(store_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tx_region_date ON scout.transactions(region_code, timestamp);
CREATE INDEX IF NOT EXISTS idx_tx_category ON scout.transactions(product_category);
CREATE INDEX IF NOT EXISTS idx_tx_brand ON scout.transactions(brand_name);
CREATE INDEX IF NOT EXISTS idx_tx_timestamp ON scout.transactions(timestamp DESC);

-- =============================================================================
-- VIEWS FOR DASHBOARD PAGES
-- =============================================================================

-- 1. Transaction Trends View (for Transaction Trends page)
CREATE OR REPLACE VIEW scout.v_tx_trends AS
SELECT
  DATE_TRUNC('day', timestamp)::DATE AS tx_date,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS total_revenue,
  AVG(net_amount) AS avg_basket_value,
  AVG(basket_size) AS avg_basket_size,
  COUNT(DISTINCT store_id) AS active_stores
FROM scout.transactions
GROUP BY 1
ORDER BY 1;

-- 2. Product Mix View (for Product Mix & SKU page)
CREATE OR REPLACE VIEW scout.v_product_mix AS
SELECT
  product_category,
  brand_name,
  COUNT(*) AS tx_count,
  SUM(quantity) AS total_quantity,
  SUM(net_amount) AS revenue,
  100.0 * COUNT(*) / SUM(COUNT(*)) OVER () AS tx_share_pct,
  100.0 * SUM(net_amount) / SUM(SUM(net_amount)) OVER () AS revenue_share_pct
FROM scout.transactions
GROUP BY product_category, brand_name;

-- 3. Consumer Profile View (for Consumer Profiling page)
CREATE OR REPLACE VIEW scout.v_consumer_profile AS
SELECT
  income,
  urban_rural,
  gender,
  CASE
    WHEN age < 18 THEN 'Under 18'
    WHEN age BETWEEN 18 AND 24 THEN '18-24'
    WHEN age BETWEEN 25 AND 34 THEN '25-34'
    WHEN age BETWEEN 35 AND 44 THEN '35-44'
    WHEN age BETWEEN 45 AND 54 THEN '45-54'
    WHEN age >= 55 THEN '55+'
    ELSE 'Unknown'
  END AS age_bracket,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  AVG(net_amount) AS avg_spend
FROM scout.transactions
GROUP BY income, urban_rural, gender,
  CASE
    WHEN age < 18 THEN 'Under 18'
    WHEN age BETWEEN 18 AND 24 THEN '18-24'
    WHEN age BETWEEN 25 AND 34 THEN '25-34'
    WHEN age BETWEEN 35 AND 44 THEN '35-44'
    WHEN age BETWEEN 45 AND 54 THEN '45-54'
    WHEN age >= 55 THEN '55+'
    ELSE 'Unknown'
  END;

-- 4. Consumer Behavior View (for Consumer Behavior page)
CREATE OR REPLACE VIEW scout.v_consumer_behavior AS
SELECT
  funnel_stage,
  request_type,
  suggestion_accepted,
  substitution_occurred,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  COUNT(DISTINCT customer_id) AS unique_customers
FROM scout.transactions
WHERE funnel_stage IS NOT NULL
GROUP BY funnel_stage, request_type, suggestion_accepted, substitution_occurred;

-- 5. Competitive Analysis View (for Competitive Analysis page)
CREATE OR REPLACE VIEW scout.v_competitive_analysis AS
SELECT
  brand_name,
  product_category,
  our_brand,
  tbwa_client_brand,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  SUM(quantity) AS total_quantity,
  100.0 * SUM(net_amount) / SUM(SUM(net_amount)) OVER (PARTITION BY product_category) AS category_revenue_share
FROM scout.transactions
GROUP BY brand_name, product_category, our_brand, tbwa_client_brand;

-- 6. Geo Regions View (for Geographical Intelligence page / Choropleth)
CREATE OR REPLACE VIEW scout.v_geo_regions AS
SELECT
  t.region_code,
  r.name AS region_name,
  COUNT(DISTINCT t.store_id) AS stores_count,
  COUNT(*) AS tx_count,
  SUM(t.net_amount) AS revenue,
  AVG(t.net_amount) AS avg_transaction_value,
  COUNT(DISTINCT DATE_TRUNC('day', t.timestamp)) AS active_days
FROM scout.transactions t
JOIN scout.regions r ON t.region_code = r.code
GROUP BY t.region_code, r.name;

-- 7. Store Performance View
CREATE OR REPLACE VIEW scout.v_store_performance AS
SELECT
  s.id AS store_id,
  s.store_code,
  s.store_name,
  s.region_code,
  s.city,
  s.barangay,
  COUNT(*) AS tx_count,
  SUM(t.net_amount) AS revenue,
  AVG(t.net_amount) AS avg_transaction_value,
  AVG(t.basket_size) AS avg_basket_size
FROM scout.stores s
LEFT JOIN scout.transactions t ON s.id = t.store_id
GROUP BY s.id, s.store_code, s.store_name, s.region_code, s.city, s.barangay;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE scout.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.transactions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data (adjust for multi-tenant later)
CREATE POLICY "Allow authenticated read on regions" ON scout.regions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on stores" ON scout.stores
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on transactions" ON scout.transactions
  FOR SELECT TO authenticated USING (true);

-- Grant usage on schema
GRANT USAGE ON SCHEMA scout TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA scout TO authenticated;

COMMENT ON SCHEMA scout IS 'Scout Retail Analytics Dashboard - Core data model';
COMMENT ON TABLE scout.transactions IS 'Canonical fact table for retail transactions';
COMMENT ON VIEW scout.v_tx_trends IS 'Aggregated daily transaction trends for Transaction Trends page';
COMMENT ON VIEW scout.v_product_mix IS 'Product category and brand mix for Product Mix & SKU page';
COMMENT ON VIEW scout.v_consumer_profile IS 'Customer demographics for Consumer Profiling page';
COMMENT ON VIEW scout.v_competitive_analysis IS 'Brand competition analysis for Competitive Analysis page';
COMMENT ON VIEW scout.v_geo_regions IS 'Regional performance metrics for Geographical Intelligence page';
