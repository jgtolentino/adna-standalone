-- Scout XI Canonical Data Model
-- Migration: 051_scout_transactions_canonical.sql
-- Purpose: Create comprehensive schema for Scout XI dashboard with all required views
-- Author: TBWA Enterprise Platform
-- Date: 2025-12-07

-- Ensure scout schema exists
CREATE SCHEMA IF NOT EXISTS scout;

-------------------------------------------------------------------------------
-- ENUMS
-------------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'daypart' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'scout')) THEN
    CREATE TYPE scout.daypart AS ENUM ('morning', 'afternoon', 'evening', 'night');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'scout')) THEN
    CREATE TYPE scout.payment_method AS ENUM ('cash', 'gcash', 'maya', 'card', 'other');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'income_band' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'scout')) THEN
    CREATE TYPE scout.income_band AS ENUM ('low', 'middle', 'high', 'unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urban_rural' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'scout')) THEN
    CREATE TYPE scout.urban_rural AS ENUM ('urban', 'rural', 'unknown');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'funnel_stage' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'scout')) THEN
    CREATE TYPE scout.funnel_stage AS ENUM ('visit', 'browse', 'request', 'accept', 'purchase');
  END IF;
END $$;

-------------------------------------------------------------------------------
-- STORES TABLE (extended from regions)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scout.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code text NOT NULL UNIQUE,          -- "ST000284"
  store_name text NOT NULL,
  region_code text NOT NULL REFERENCES scout.regions(region_code),
  province text NOT NULL,
  city text NOT NULL,
  barangay text NOT NULL,
  latitude numeric(10, 6),
  longitude numeric(10, 6),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scout_stores_region ON scout.stores(region_code);
CREATE INDEX IF NOT EXISTS idx_scout_stores_active ON scout.stores(is_active) WHERE is_active = true;

-------------------------------------------------------------------------------
-- CANONICAL TRANSACTIONS TABLE
-- This is the single source of truth for all Scout XI dashboard data
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scout.transactions (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Store reference
  store_id uuid NOT NULL REFERENCES scout.stores(id),

  -- Temporal
  timestamp timestamptz NOT NULL,
  time_of_day scout.daypart NOT NULL,

  -- Location snapshot (denormalized for fast filtering)
  region_code text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  barangay text NOT NULL,

  -- Product data
  brand_name text NOT NULL,
  sku text NOT NULL,
  product_category text NOT NULL,           -- "Snacks", "Tobacco", "Beverages"
  product_subcategory text,                 -- Optional detail
  our_brand boolean NOT NULL DEFAULT false, -- TBWA client brand flag
  tbwa_client_brand boolean NOT NULL DEFAULT false,

  -- Transaction amounts
  quantity integer NOT NULL CHECK (quantity >= 1),
  unit_price numeric(12, 2) NOT NULL,
  gross_amount numeric(12, 2) NOT NULL,
  discount_amount numeric(12, 2) NOT NULL DEFAULT 0,
  net_amount numeric(12, 2) GENERATED ALWAYS AS (gross_amount - discount_amount) STORED,
  payment_method scout.payment_method NOT NULL,

  -- Customer profiling
  customer_id text,
  age integer CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
  gender text CHECK (gender IS NULL OR gender IN ('M', 'F', 'Other', 'Unknown')),
  income scout.income_band NOT NULL DEFAULT 'unknown',
  urban_rural scout.urban_rural NOT NULL DEFAULT 'unknown',

  -- Behavior & funnel
  funnel_stage scout.funnel_stage,
  basket_size integer CHECK (basket_size IS NULL OR basket_size >= 0),
  repeated_customer boolean,

  -- Audit
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_scout_tx_store_date ON scout.transactions(store_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_region_date ON scout.transactions(region_code, timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_timestamp ON scout.transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_category ON scout.transactions(product_category);
CREATE INDEX IF NOT EXISTS idx_scout_tx_brand ON scout.transactions(brand_name);
CREATE INDEX IF NOT EXISTS idx_scout_tx_our_brand ON scout.transactions(our_brand) WHERE our_brand = true;

-------------------------------------------------------------------------------
-- VIEW: v_tx_trends - Transaction Trends page
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_tx_trends AS
SELECT
  date_trunc('day', timestamp)::date AS tx_date,
  count(*) AS tx_count,
  sum(net_amount) AS total_revenue,
  round(avg(net_amount)::numeric, 2) AS avg_basket_value,
  count(DISTINCT store_id) AS active_stores,
  count(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  round(avg(quantity)::numeric, 2) AS avg_items_per_tx
FROM scout.transactions
GROUP BY 1
ORDER BY 1;

COMMENT ON VIEW scout.v_tx_trends IS 'Daily transaction trends for the Transaction Trends dashboard page';

-------------------------------------------------------------------------------
-- VIEW: v_product_mix - Product Mix & SKU page
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_product_mix AS
SELECT
  product_category,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  sum(quantity) AS units_sold,
  round((100.0 * count(*) / sum(count(*)) OVER ())::numeric, 2) AS tx_share_pct,
  round((100.0 * sum(net_amount) / sum(sum(net_amount)) OVER ())::numeric, 2) AS revenue_share_pct,
  count(DISTINCT brand_name) AS brand_count,
  count(DISTINCT sku) AS sku_count
FROM scout.transactions
GROUP BY product_category
ORDER BY revenue DESC;

COMMENT ON VIEW scout.v_product_mix IS 'Product category mix for Product Mix dashboard page';

-------------------------------------------------------------------------------
-- VIEW: v_brand_performance - Brand-level analysis
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_brand_performance AS
SELECT
  brand_name,
  product_category,
  our_brand,
  tbwa_client_brand,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  sum(quantity) AS units_sold,
  round(avg(net_amount)::numeric, 2) AS avg_transaction_value
FROM scout.transactions
GROUP BY brand_name, product_category, our_brand, tbwa_client_brand
ORDER BY revenue DESC;

COMMENT ON VIEW scout.v_brand_performance IS 'Brand-level performance metrics';

-------------------------------------------------------------------------------
-- VIEW: v_consumer_profile - Consumer Profiling page
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_consumer_profile AS
SELECT
  income,
  urban_rural,
  gender,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  count(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  round(avg(age) FILTER (WHERE age IS NOT NULL)::numeric, 1) AS avg_age,
  round(avg(net_amount)::numeric, 2) AS avg_basket_value
FROM scout.transactions
GROUP BY income, urban_rural, gender;

COMMENT ON VIEW scout.v_consumer_profile IS 'Consumer demographic breakdown for Consumer Profiling page';

-------------------------------------------------------------------------------
-- VIEW: v_consumer_age_distribution - Age bracket analysis
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_consumer_age_distribution AS
SELECT
  CASE
    WHEN age < 18 THEN 'Under 18'
    WHEN age BETWEEN 18 AND 24 THEN '18-24'
    WHEN age BETWEEN 25 AND 34 THEN '25-34'
    WHEN age BETWEEN 35 AND 44 THEN '35-44'
    WHEN age BETWEEN 45 AND 54 THEN '45-54'
    WHEN age BETWEEN 55 AND 64 THEN '55-64'
    WHEN age >= 65 THEN '65+'
    ELSE 'Unknown'
  END AS age_bracket,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  count(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers
FROM scout.transactions
GROUP BY 1
ORDER BY
  CASE
    WHEN age < 18 THEN 1
    WHEN age BETWEEN 18 AND 24 THEN 2
    WHEN age BETWEEN 25 AND 34 THEN 3
    WHEN age BETWEEN 35 AND 44 THEN 4
    WHEN age BETWEEN 45 AND 54 THEN 5
    WHEN age BETWEEN 55 AND 64 THEN 6
    WHEN age >= 65 THEN 7
    ELSE 8
  END;

COMMENT ON VIEW scout.v_consumer_age_distribution IS 'Age bracket distribution for consumer analysis';

-------------------------------------------------------------------------------
-- VIEW: v_competitive_analysis - Competitive Analysis page
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_competitive_analysis AS
SELECT
  brand_name,
  our_brand,
  tbwa_client_brand,
  product_category,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  sum(quantity) AS units_sold,
  round((100.0 * sum(net_amount) / sum(sum(net_amount)) OVER ())::numeric, 2) AS market_share_pct,
  round((100.0 * sum(net_amount) / sum(sum(net_amount)) OVER (PARTITION BY product_category))::numeric, 2) AS category_share_pct
FROM scout.transactions
GROUP BY brand_name, our_brand, tbwa_client_brand, product_category
ORDER BY revenue DESC;

COMMENT ON VIEW scout.v_competitive_analysis IS 'Brand competitive analysis with market share calculations';

-------------------------------------------------------------------------------
-- VIEW: v_geo_regions - Geo Regional Performance (for choropleth)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_geo_regions AS
SELECT
  t.region_code,
  r.region_name,
  count(DISTINCT t.store_id) AS stores_count,
  count(*) AS tx_count,
  sum(t.net_amount) AS revenue,
  count(DISTINCT t.customer_id) FILTER (WHERE t.customer_id IS NOT NULL) AS unique_customers,
  round(avg(t.net_amount)::numeric, 2) AS avg_basket_value,
  -- Growth rate: compare last 7 days vs previous 7 days
  CASE
    WHEN sum(t.net_amount) FILTER (WHERE t.timestamp >= now() - interval '14 days' AND t.timestamp < now() - interval '7 days') > 0
    THEN round(
      ((sum(t.net_amount) FILTER (WHERE t.timestamp >= now() - interval '7 days') -
        sum(t.net_amount) FILTER (WHERE t.timestamp >= now() - interval '14 days' AND t.timestamp < now() - interval '7 days')) /
       sum(t.net_amount) FILTER (WHERE t.timestamp >= now() - interval '14 days' AND t.timestamp < now() - interval '7 days') * 100
      )::numeric, 2
    )
    ELSE 0
  END AS growth_rate
FROM scout.transactions t
JOIN scout.regions r ON t.region_code = r.region_code
GROUP BY t.region_code, r.region_name
ORDER BY revenue DESC;

COMMENT ON VIEW scout.v_geo_regions IS 'Regional performance metrics for choropleth map visualization';

-------------------------------------------------------------------------------
-- VIEW: v_funnel_analysis - Behavior funnel page
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_funnel_analysis AS
SELECT
  funnel_stage,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  round((100.0 * count(*) / sum(count(*)) OVER ())::numeric, 2) AS stage_pct
FROM scout.transactions
WHERE funnel_stage IS NOT NULL
GROUP BY funnel_stage
ORDER BY
  CASE funnel_stage
    WHEN 'visit' THEN 1
    WHEN 'browse' THEN 2
    WHEN 'request' THEN 3
    WHEN 'accept' THEN 4
    WHEN 'purchase' THEN 5
  END;

COMMENT ON VIEW scout.v_funnel_analysis IS 'Customer behavior funnel analysis';

-------------------------------------------------------------------------------
-- VIEW: v_daypart_analysis - Time of day analysis
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_daypart_analysis AS
SELECT
  time_of_day,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  round(avg(net_amount)::numeric, 2) AS avg_basket_value,
  round((100.0 * count(*) / sum(count(*)) OVER ())::numeric, 2) AS tx_share_pct
FROM scout.transactions
GROUP BY time_of_day
ORDER BY
  CASE time_of_day
    WHEN 'morning' THEN 1
    WHEN 'afternoon' THEN 2
    WHEN 'evening' THEN 3
    WHEN 'night' THEN 4
  END;

COMMENT ON VIEW scout.v_daypart_analysis IS 'Transaction patterns by time of day';

-------------------------------------------------------------------------------
-- VIEW: v_payment_methods - Payment method distribution
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_payment_methods AS
SELECT
  payment_method,
  count(*) AS tx_count,
  sum(net_amount) AS revenue,
  round((100.0 * count(*) / sum(count(*)) OVER ())::numeric, 2) AS tx_share_pct
FROM scout.transactions
GROUP BY payment_method
ORDER BY tx_count DESC;

COMMENT ON VIEW scout.v_payment_methods IS 'Payment method distribution analysis';

-------------------------------------------------------------------------------
-- VIEW: v_store_performance - Store-level metrics
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_store_performance AS
SELECT
  s.id AS store_id,
  s.store_code,
  s.store_name,
  s.region_code,
  s.city,
  count(t.id) AS tx_count,
  sum(t.net_amount) AS revenue,
  count(DISTINCT t.customer_id) FILTER (WHERE t.customer_id IS NOT NULL) AS unique_customers,
  round(avg(t.net_amount)::numeric, 2) AS avg_basket_value
FROM scout.stores s
LEFT JOIN scout.transactions t ON s.id = t.store_id
WHERE s.is_active = true
GROUP BY s.id, s.store_code, s.store_name, s.region_code, s.city
ORDER BY revenue DESC NULLS LAST;

COMMENT ON VIEW scout.v_store_performance IS 'Store-level performance metrics';

-------------------------------------------------------------------------------
-- VIEW: v_kpi_summary - Executive KPI summary
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW scout.v_kpi_summary AS
SELECT
  -- Overall metrics
  count(*) AS total_transactions,
  sum(net_amount) AS total_revenue,
  round(avg(net_amount)::numeric, 2) AS avg_basket_value,
  count(DISTINCT store_id) AS active_stores,
  count(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  count(DISTINCT brand_name) AS total_brands,
  count(DISTINCT sku) AS total_skus,
  count(DISTINCT product_category) AS total_categories,

  -- Today vs Yesterday comparison
  count(*) FILTER (WHERE timestamp::date = current_date) AS today_tx_count,
  sum(net_amount) FILTER (WHERE timestamp::date = current_date) AS today_revenue,
  count(*) FILTER (WHERE timestamp::date = current_date - 1) AS yesterday_tx_count,
  sum(net_amount) FILTER (WHERE timestamp::date = current_date - 1) AS yesterday_revenue,

  -- Last 7 days
  count(*) FILTER (WHERE timestamp >= now() - interval '7 days') AS week_tx_count,
  sum(net_amount) FILTER (WHERE timestamp >= now() - interval '7 days') AS week_revenue,

  -- Last 30 days
  count(*) FILTER (WHERE timestamp >= now() - interval '30 days') AS month_tx_count,
  sum(net_amount) FILTER (WHERE timestamp >= now() - interval '30 days') AS month_revenue
FROM scout.transactions;

COMMENT ON VIEW scout.v_kpi_summary IS 'Executive KPI summary for dashboard header';

-------------------------------------------------------------------------------
-- GRANTS
-------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA scout TO anon, authenticated;
GRANT SELECT ON scout.stores TO anon, authenticated;
GRANT SELECT ON scout.transactions TO anon, authenticated;
GRANT SELECT ON scout.v_tx_trends TO anon, authenticated;
GRANT SELECT ON scout.v_product_mix TO anon, authenticated;
GRANT SELECT ON scout.v_brand_performance TO anon, authenticated;
GRANT SELECT ON scout.v_consumer_profile TO anon, authenticated;
GRANT SELECT ON scout.v_consumer_age_distribution TO anon, authenticated;
GRANT SELECT ON scout.v_competitive_analysis TO anon, authenticated;
GRANT SELECT ON scout.v_geo_regions TO anon, authenticated;
GRANT SELECT ON scout.v_funnel_analysis TO anon, authenticated;
GRANT SELECT ON scout.v_daypart_analysis TO anon, authenticated;
GRANT SELECT ON scout.v_payment_methods TO anon, authenticated;
GRANT SELECT ON scout.v_store_performance TO anon, authenticated;
GRANT SELECT ON scout.v_kpi_summary TO anon, authenticated;

-------------------------------------------------------------------------------
-- MIGRATION COMPLETE
-------------------------------------------------------------------------------
COMMENT ON TABLE scout.transactions IS 'Canonical transactions table for Scout XI dashboard - single source of truth for all dashboard views';
COMMENT ON TABLE scout.stores IS 'Store master data for Scout XI with geographic information';
