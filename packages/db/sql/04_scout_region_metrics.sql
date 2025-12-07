-- Scout Region Metrics View and Master Table
-- Maps transaction data to Philippine administrative regions for choropleth visualization

-- 0. Create scout schema if not exists
CREATE SCHEMA IF NOT EXISTS scout;

-- 1. Create master regions table
CREATE TABLE IF NOT EXISTS scout.regions (
    region_code text PRIMARY KEY,
    region_name text NOT NULL,
    region_type text NOT NULL DEFAULT 'administrative',
    created_at timestamptz DEFAULT NOW()
);

-- 2. Seed master regions (17 Philippine regions)
INSERT INTO scout.regions (region_code, region_name) VALUES
    ('NCR', 'National Capital Region'),
    ('REGION_I', 'Ilocos Region (Region I)'),
    ('CAR', 'Cordillera Administrative Region'),
    ('REGION_II', 'Cagayan Valley (Region II)'),
    ('REGION_III', 'Central Luzon (Region III)'),
    ('REGION_IV_A', 'CALABARZON (Region IV-A)'),
    ('REGION_IV_B', 'MIMAROPA (Region IV-B)'),
    ('REGION_V', 'Bicol Region (Region V)'),
    ('REGION_VI', 'Western Visayas (Region VI)'),
    ('REGION_VII', 'Central Visayas (Region VII)'),
    ('REGION_VIII', 'Eastern Visayas (Region VIII)'),
    ('REGION_IX', 'Zamboanga Peninsula (Region IX)'),
    ('REGION_X', 'Northern Mindanao (Region X)'),
    ('REGION_XI', 'Davao Region (Region XI)'),
    ('REGION_XII', 'SOCCSKSARGEN (Region XII)'),
    ('REGION_XIII', 'Caraga (Region XIII)'),
    ('BARMM', 'Bangsamoro Autonomous Region in Muslim Mindanao')
ON CONFLICT (region_code) DO NOTHING;

-- 3. Create region mapping table (maps our 3 demo regions to official codes)
CREATE TABLE IF NOT EXISTS scout.region_mapping (
    demo_region text PRIMARY KEY,
    region_code text NOT NULL REFERENCES scout.regions(region_code),
    created_at timestamptz DEFAULT NOW()
);

-- Map our demo regions to official codes
INSERT INTO scout.region_mapping (demo_region, region_code) VALUES
    ('NCR', 'NCR'),                    -- NCR stores map to NCR
    ('North Luzon', 'REGION_I'),       -- North Luzon → Ilocos Region
    ('Visayas', 'REGION_VII')          -- Visayas → Central Visayas
ON CONFLICT (demo_region) DO NOTHING;

-- 4. Create gold-level region metrics view
CREATE OR REPLACE VIEW scout.gold_region_metrics AS
SELECT
    rm.region_code,
    r.region_name,
    COUNT(DISTINCT t.store_id) AS total_stores,
    SUM(t.peso_value) AS total_revenue,
    COUNT(t.id) AS total_transactions,
    COUNT(DISTINCT t.transaction_id) AS unique_customers,
    -- Growth rate (compare last 7 days vs previous 7 days)
    CASE
        WHEN SUM(CASE WHEN t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days' THEN t.peso_value ELSE 0 END) > 0
        THEN ROUND(
            ((SUM(CASE WHEN t.timestamp >= NOW() - INTERVAL '7 days' THEN t.peso_value ELSE 0 END) -
              SUM(CASE WHEN t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days' THEN t.peso_value ELSE 0 END)) /
             SUM(CASE WHEN t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days' THEN t.peso_value ELSE 0 END) * 100
            )::numeric, 2
        )
        ELSE 0
    END AS growth_rate
FROM
    transactions t
    INNER JOIN scout.region_mapping rm ON t.region = rm.demo_region
    INNER JOIN scout.regions r ON rm.region_code = r.region_code
WHERE
    t.store_id::INTEGER BETWEEN 101 AND 115  -- Demo stores only
GROUP BY
    rm.region_code, r.region_name;

-- 5. Grant permissions
GRANT USAGE ON SCHEMA scout TO anon, authenticated;
GRANT SELECT ON scout.regions TO anon, authenticated;
GRANT SELECT ON scout.region_mapping TO anon, authenticated;
GRANT SELECT ON scout.gold_region_metrics TO anon, authenticated;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_region_timestamp
    ON transactions(region, timestamp)
    WHERE store_id::INTEGER BETWEEN 101 AND 115;

CREATE INDEX IF NOT EXISTS idx_transactions_store_timestamp
    ON transactions(store_id, timestamp)
    WHERE store_id::INTEGER BETWEEN 101 AND 115;

COMMENT ON VIEW scout.gold_region_metrics IS
'Gold-level aggregated metrics by Philippine administrative region.
Maps demo regions (NCR, North Luzon, Visayas) to official region codes for choropleth visualization.
Calculates: stores, revenue, transactions, customers, 7-day growth rate.';
