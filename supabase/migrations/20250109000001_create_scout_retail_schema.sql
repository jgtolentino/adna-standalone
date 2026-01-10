-- Scout Retail Data Schema (Bronze/Silver/Gold Medallion Architecture)
-- PH FMCG + Tobacco Market Data
-- Author: TBWA Enterprise Platform
-- Date: 2025-01-09

-- Create the scout schema
CREATE SCHEMA IF NOT EXISTS scout;

-- =====================
-- BRONZE LAYER (Raw/Staged Data)
-- =====================

-- Brands catalog
CREATE TABLE IF NOT EXISTS scout.bronze_brands (
    brand_id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand_role TEXT NOT NULL,  -- 'client' or 'competitor'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products catalog
CREATE TABLE IF NOT EXISTS scout.bronze_products (
    product_id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES scout.bronze_brands(brand_id),
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    pack_size TEXT NOT NULL,
    base_price_php NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores (sari-sari stores, mini marts)
CREATE TABLE IF NOT EXISTS scout.bronze_stores (
    store_id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    barangay TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS scout.bronze_customers (
    customer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    sex TEXT,
    age INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (header)
CREATE TABLE IF NOT EXISTS scout.bronze_transactions (
    transaction_id TEXT PRIMARY KEY,
    transaction_date DATE NOT NULL,
    store_id TEXT NOT NULL REFERENCES scout.bronze_stores(store_id),
    customer_id TEXT NOT NULL REFERENCES scout.bronze_customers(customer_id),
    payment_method TEXT,
    receipt_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction line items
CREATE TABLE IF NOT EXISTS scout.bronze_transaction_items (
    transaction_id TEXT NOT NULL REFERENCES scout.bronze_transactions(transaction_id),
    line_no INT NOT NULL,
    product_id TEXT NOT NULL REFERENCES scout.bronze_products(product_id),
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    pack_size TEXT NOT NULL,
    qty INT NOT NULL,
    unit_price_php NUMERIC(10,2) NOT NULL,
    line_total_php NUMERIC(10,2) NOT NULL,
    is_promo INT NOT NULL DEFAULT 0,
    is_noisy INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (transaction_id, line_no)
);

-- =====================
-- SILVER LAYER (Cleaned/Enriched)
-- =====================

-- Silver transactions view (cleaned, with store/customer enrichment)
CREATE OR REPLACE VIEW scout.silver_transactions AS
SELECT
    t.transaction_id,
    t.transaction_date,
    t.store_id,
    s.store_name,
    s.region,
    s.city,
    s.barangay,
    t.customer_id,
    c.full_name AS customer_name,
    c.sex AS customer_sex,
    c.age AS customer_age,
    CASE
        WHEN c.age < 25 THEN '18-24'
        WHEN c.age < 35 THEN '25-34'
        WHEN c.age < 45 THEN '35-44'
        WHEN c.age < 55 THEN '45-54'
        ELSE '55+'
    END AS age_bracket,
    t.payment_method,
    t.receipt_no,
    COUNT(ti.line_no) AS basket_size,
    SUM(ti.line_total_php) AS total_amount_php
FROM scout.bronze_transactions t
JOIN scout.bronze_stores s ON t.store_id = s.store_id
JOIN scout.bronze_customers c ON t.customer_id = c.customer_id
JOIN scout.bronze_transaction_items ti ON t.transaction_id = ti.transaction_id
GROUP BY t.transaction_id, t.transaction_date, t.store_id, s.store_name,
         s.region, s.city, s.barangay, t.customer_id, c.full_name,
         c.sex, c.age, t.payment_method, t.receipt_no;

-- Silver transaction items view (cleaned)
CREATE OR REPLACE VIEW scout.silver_transaction_items AS
SELECT
    ti.transaction_id,
    ti.line_no,
    t.transaction_date,
    ti.product_id,
    p.brand_id,
    ti.brand_name,
    b.brand_role,
    ti.category,
    ti.product_name,
    ti.pack_size,
    ti.qty,
    ti.unit_price_php,
    ti.line_total_php,
    ti.is_promo,
    ti.is_noisy,
    s.region,
    s.city
FROM scout.bronze_transaction_items ti
JOIN scout.bronze_transactions t ON ti.transaction_id = t.transaction_id
JOIN scout.bronze_stores s ON t.store_id = s.store_id
JOIN scout.bronze_products p ON ti.product_id = p.product_id
JOIN scout.bronze_brands b ON p.brand_id = b.brand_id;

-- =====================
-- GOLD LAYER (Aggregated/Analytics-Ready)
-- =====================

-- Gold: Daily KPIs
CREATE OR REPLACE VIEW scout.gold_daily_kpis AS
SELECT
    transaction_date AS date,
    COUNT(DISTINCT transaction_id) AS total_transactions,
    SUM(line_total_php) AS total_revenue_php,
    AVG(line_total_php) AS avg_line_value_php,
    SUM(qty) AS total_units,
    COUNT(DISTINCT store_id) AS active_stores,
    COUNT(DISTINCT customer_id) AS unique_customers
FROM (
    SELECT
        t.transaction_id,
        t.transaction_date,
        t.store_id,
        t.customer_id,
        ti.line_total_php,
        ti.qty
    FROM scout.bronze_transactions t
    JOIN scout.bronze_transaction_items ti ON t.transaction_id = ti.transaction_id
) sub
GROUP BY transaction_date
ORDER BY transaction_date;

-- Gold: Regional performance
CREATE OR REPLACE VIEW scout.gold_regional_performance AS
SELECT
    s.region,
    COUNT(DISTINCT t.transaction_id) AS transactions,
    SUM(ti.line_total_php) AS revenue_php,
    AVG(ti.line_total_php) AS avg_basket_value_php,
    SUM(ti.qty) AS units_sold,
    COUNT(DISTINCT t.store_id) AS stores,
    COUNT(DISTINCT t.customer_id) AS customers
FROM scout.bronze_transactions t
JOIN scout.bronze_stores s ON t.store_id = s.store_id
JOIN scout.bronze_transaction_items ti ON t.transaction_id = ti.transaction_id
GROUP BY s.region
ORDER BY revenue_php DESC;

-- Gold: Category performance
CREATE OR REPLACE VIEW scout.gold_category_performance AS
SELECT
    ti.category,
    COUNT(DISTINCT ti.transaction_id) AS transactions,
    SUM(ti.line_total_php) AS revenue_php,
    SUM(ti.qty) AS units_sold,
    AVG(ti.unit_price_php) AS avg_unit_price_php,
    SUM(CASE WHEN ti.is_promo = 1 THEN ti.line_total_php ELSE 0 END) AS promo_revenue_php,
    ROUND(100.0 * SUM(CASE WHEN ti.is_promo = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS promo_rate_pct
FROM scout.bronze_transaction_items ti
GROUP BY ti.category
ORDER BY revenue_php DESC;

-- Gold: Brand performance (client vs competitor)
CREATE OR REPLACE VIEW scout.gold_brand_performance AS
SELECT
    b.brand_name,
    b.category,
    b.brand_role,
    COUNT(DISTINCT ti.transaction_id) AS transactions,
    SUM(ti.line_total_php) AS revenue_php,
    SUM(ti.qty) AS units_sold,
    AVG(ti.unit_price_php) AS avg_price_php,
    ROUND(100.0 * SUM(CASE WHEN ti.is_promo = 1 THEN 1 ELSE 0 END) / COUNT(*), 2) AS promo_rate_pct
FROM scout.bronze_transaction_items ti
JOIN scout.bronze_products p ON ti.product_id = p.product_id
JOIN scout.bronze_brands b ON p.brand_id = b.brand_id
GROUP BY b.brand_name, b.category, b.brand_role
ORDER BY revenue_php DESC;

-- Gold: Client market share by category
CREATE OR REPLACE VIEW scout.gold_client_market_share AS
WITH category_totals AS (
    SELECT
        ti.category,
        SUM(ti.line_total_php) AS total_revenue
    FROM scout.bronze_transaction_items ti
    GROUP BY ti.category
),
client_totals AS (
    SELECT
        ti.category,
        SUM(ti.line_total_php) AS client_revenue
    FROM scout.bronze_transaction_items ti
    JOIN scout.bronze_products p ON ti.product_id = p.product_id
    JOIN scout.bronze_brands b ON p.brand_id = b.brand_id
    WHERE b.brand_role = 'client'
    GROUP BY ti.category
)
SELECT
    ct.category,
    ct.total_revenue AS total_category_revenue_php,
    COALESCE(clt.client_revenue, 0) AS client_revenue_php,
    ROUND(100.0 * COALESCE(clt.client_revenue, 0) / ct.total_revenue, 2) AS client_market_share_pct
FROM category_totals ct
LEFT JOIN client_totals clt ON ct.category = clt.category
ORDER BY ct.total_revenue DESC;

-- Gold: Payment method analysis
CREATE OR REPLACE VIEW scout.gold_payment_analysis AS
SELECT
    t.payment_method,
    COUNT(DISTINCT t.transaction_id) AS transactions,
    SUM(ti.line_total_php) AS revenue_php,
    AVG(ti.line_total_php) AS avg_transaction_value_php,
    ROUND(100.0 * COUNT(DISTINCT t.transaction_id) /
          (SELECT COUNT(DISTINCT transaction_id) FROM scout.bronze_transactions), 2) AS pct_of_transactions
FROM scout.bronze_transactions t
JOIN scout.bronze_transaction_items ti ON t.transaction_id = ti.transaction_id
GROUP BY t.payment_method
ORDER BY transactions DESC;

-- Gold: Customer demographics
CREATE OR REPLACE VIEW scout.gold_customer_demographics AS
SELECT
    c.sex,
    CASE
        WHEN c.age < 25 THEN '18-24'
        WHEN c.age < 35 THEN '25-34'
        WHEN c.age < 45 THEN '35-44'
        WHEN c.age < 55 THEN '45-54'
        ELSE '55+'
    END AS age_bracket,
    COUNT(DISTINCT t.transaction_id) AS transactions,
    SUM(ti.line_total_php) AS revenue_php,
    AVG(ti.line_total_php) AS avg_spend_php,
    COUNT(DISTINCT c.customer_id) AS unique_customers
FROM scout.bronze_customers c
JOIN scout.bronze_transactions t ON c.customer_id = t.customer_id
JOIN scout.bronze_transaction_items ti ON t.transaction_id = ti.transaction_id
GROUP BY c.sex,
    CASE
        WHEN c.age < 25 THEN '18-24'
        WHEN c.age < 35 THEN '25-34'
        WHEN c.age < 45 THEN '35-44'
        WHEN c.age < 55 THEN '45-54'
        ELSE '55+'
    END
ORDER BY c.sex, age_bracket;

-- =====================
-- RPC FUNCTIONS (Gold-only API)
-- =====================

-- RPC: Get KPI summary
CREATE OR REPLACE FUNCTION scout.rpc_kpis()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT jsonb_build_object(
        'total_revenue', (SELECT COALESCE(SUM(revenue_php), 0) FROM scout.gold_daily_kpis),
        'total_transactions', (SELECT COALESCE(SUM(total_transactions), 0) FROM scout.gold_daily_kpis),
        'total_units', (SELECT COALESCE(SUM(total_units), 0) FROM scout.gold_daily_kpis),
        'unique_stores', (SELECT COUNT(DISTINCT store_id) FROM scout.bronze_stores),
        'unique_customers', (SELECT COUNT(DISTINCT customer_id) FROM scout.bronze_customers),
        'avg_transaction_value', (SELECT ROUND(AVG(total_revenue_php / NULLIF(total_transactions, 0)), 2) FROM scout.gold_daily_kpis)
    );
$$;

-- RPC: Get regional breakdown
CREATE OR REPLACE FUNCTION scout.rpc_regional_summary()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT jsonb_agg(
        jsonb_build_object(
            'region', region,
            'revenue', revenue_php,
            'transactions', transactions,
            'stores', stores
        )
    )
    FROM scout.gold_regional_performance;
$$;

-- RPC: Get category breakdown
CREATE OR REPLACE FUNCTION scout.rpc_category_summary()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'revenue', revenue_php,
            'units', units_sold,
            'promo_rate', promo_rate_pct
        )
    )
    FROM scout.gold_category_performance;
$$;

-- RPC: Get client market share
CREATE OR REPLACE FUNCTION scout.rpc_client_share()
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'client_share_pct', client_market_share_pct,
            'client_revenue', client_revenue_php,
            'total_revenue', total_category_revenue_php
        )
    )
    FROM scout.gold_client_market_share;
$$;

-- =====================
-- INDEXES
-- =====================

CREATE INDEX IF NOT EXISTS idx_bronze_transactions_date
    ON scout.bronze_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bronze_transactions_store
    ON scout.bronze_transactions(store_id);
CREATE INDEX IF NOT EXISTS idx_bronze_transactions_customer
    ON scout.bronze_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_bronze_items_transaction
    ON scout.bronze_transaction_items(transaction_id);
CREATE INDEX IF NOT EXISTS idx_bronze_items_product
    ON scout.bronze_transaction_items(product_id);
CREATE INDEX IF NOT EXISTS idx_bronze_items_category
    ON scout.bronze_transaction_items(category);
CREATE INDEX IF NOT EXISTS idx_bronze_items_brand
    ON scout.bronze_transaction_items(brand_name);
CREATE INDEX IF NOT EXISTS idx_bronze_stores_region
    ON scout.bronze_stores(region);
CREATE INDEX IF NOT EXISTS idx_bronze_products_brand
    ON scout.bronze_products(brand_id);
CREATE INDEX IF NOT EXISTS idx_bronze_products_category
    ON scout.bronze_products(category);

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE scout.bronze_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.bronze_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.bronze_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.bronze_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.bronze_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scout.bronze_transaction_items ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Authenticated users can read brands"
    ON scout.bronze_brands FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read products"
    ON scout.bronze_products FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read stores"
    ON scout.bronze_stores FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read customers"
    ON scout.bronze_customers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read transactions"
    ON scout.bronze_transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can read transaction items"
    ON scout.bronze_transaction_items FOR SELECT
    TO authenticated
    USING (true);

-- Allow anon users to read gold views via RPC only
REVOKE ALL ON FUNCTION scout.rpc_kpis() FROM public;
GRANT EXECUTE ON FUNCTION scout.rpc_kpis() TO authenticated;
GRANT EXECUTE ON FUNCTION scout.rpc_kpis() TO anon;

REVOKE ALL ON FUNCTION scout.rpc_regional_summary() FROM public;
GRANT EXECUTE ON FUNCTION scout.rpc_regional_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION scout.rpc_regional_summary() TO anon;

REVOKE ALL ON FUNCTION scout.rpc_category_summary() FROM public;
GRANT EXECUTE ON FUNCTION scout.rpc_category_summary() TO authenticated;
GRANT EXECUTE ON FUNCTION scout.rpc_category_summary() TO anon;

REVOKE ALL ON FUNCTION scout.rpc_client_share() FROM public;
GRANT EXECUTE ON FUNCTION scout.rpc_client_share() TO authenticated;
GRANT EXECUTE ON FUNCTION scout.rpc_client_share() TO anon;

-- Comments
COMMENT ON SCHEMA scout IS 'Scout Dashboard retail analytics schema - PH FMCG + Tobacco market';
COMMENT ON TABLE scout.bronze_brands IS 'Brand catalog (client and competitor brands)';
COMMENT ON TABLE scout.bronze_products IS 'Product SKU catalog';
COMMENT ON TABLE scout.bronze_stores IS 'Retail store locations (sari-sari stores, mini marts)';
COMMENT ON TABLE scout.bronze_customers IS 'Customer profiles';
COMMENT ON TABLE scout.bronze_transactions IS 'Transaction headers';
COMMENT ON TABLE scout.bronze_transaction_items IS 'Transaction line items';
COMMENT ON VIEW scout.gold_daily_kpis IS 'Daily KPI aggregations for dashboard';
COMMENT ON VIEW scout.gold_regional_performance IS 'Regional performance metrics';
COMMENT ON VIEW scout.gold_category_performance IS 'Category-level analytics';
COMMENT ON VIEW scout.gold_brand_performance IS 'Brand performance comparison';
COMMENT ON VIEW scout.gold_client_market_share IS 'Client market share by category';
