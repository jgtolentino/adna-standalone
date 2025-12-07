-- =====================================================
-- Scout Dashboard Demo Data Universe - Database Seeding
-- =====================================================
-- Author: Creative Data Storyteller + Analytics Engineer
-- Date: December 7, 2025
-- Purpose: Populate Scout schema with 3,500+ realistic transactions
--          across 15 Philippine stores, 30 days, full geospatial data
-- =====================================================

-- Usage:
-- psql "postgresql://postgres.ublqmilcjtpnflofprkr:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" -f scripts/seed_scout_demo_data.sql

BEGIN;

-- =====================================================
-- 1. Store Master Data (15 Stores across 3 Regions)
-- =====================================================

-- Create stores table if not exists (extends schema)
CREATE TABLE IF NOT EXISTS stores (
  store_id INTEGER PRIMARY KEY,
  store_name TEXT NOT NULL,
  region TEXT NOT NULL,
  city_municipality TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude DECIMAL(10,7) NOT NULL,
  longitude DECIMAL(10,7) NOT NULL,
  device_id TEXT NOT NULL,
  avg_daily_footfall INTEGER,
  store_type TEXT, -- 'urban_premium', 'provincial_traditional', 'island_balanced'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert 15 stores
INSERT INTO stores (store_id, store_name, region, city_municipality, barangay, latitude, longitude, device_id, avg_daily_footfall, store_type) VALUES
-- NCR Stores (6)
(101, 'BGC Financial District', 'NCR', 'Taguig', 'Fort Bonifacio', 14.5547, 121.0244, 'SCOUTPI-0001', 320, 'urban_premium'),
(102, 'Makati CBD', 'NCR', 'Makati', 'Salcedo Village', 14.5547, 121.0244, 'SCOUTPI-0002', 410, 'urban_premium'),
(103, 'Quezon City U-Belt', 'NCR', 'Quezon City', 'Sampaloc', 14.6091, 121.0223, 'SCOUTPI-0003', 380, 'urban_premium'),
(104, 'Pasig Ortigas', 'NCR', 'Pasig', 'San Antonio', 14.5832, 121.0644, 'SCOUTPI-0004', 295, 'urban_premium'),
(105, 'Manila Tourist Belt', 'NCR', 'Manila', 'Ermita', 14.5833, 120.9789, 'SCOUTPI-0005', 265, 'urban_premium'),
(106, 'Mandaluyong Business District', 'NCR', 'Mandaluyong', 'Highway Hills', 14.5794, 121.0359, 'SCOUTPI-0006', 315, 'urban_premium'),

-- North Luzon Stores (5)
(107, 'Baguio Session Road', 'North Luzon', 'Baguio', 'Session Road', 16.4023, 120.5960, 'SCOUTPI-0007', 225, 'provincial_traditional'),
(108, 'Angeles Pampanga', 'North Luzon', 'Angeles', 'Balibago', 15.1450, 120.5887, 'SCOUTPI-0008', 195, 'provincial_traditional'),
(109, 'Dagupan Pangasinan', 'North Luzon', 'Dagupan', 'Perez Boulevard', 16.0433, 120.3397, 'SCOUTPI-0009', 175, 'provincial_traditional'),
(110, 'San Fernando La Union', 'North Luzon', 'San Fernando', 'Pagdalagan', 16.6159, 120.3167, 'SCOUTPI-0010', 165, 'provincial_traditional'),
(111, 'Tarlac City', 'North Luzon', 'Tarlac', 'San Nicolas', 15.4735, 120.5963, 'SCOUTPI-0011', 155, 'provincial_traditional'),

-- Visayas Stores (4)
(112, 'Cebu IT Park', 'Visayas', 'Cebu', 'Lahug', 10.3157, 123.8854, 'SCOUTPI-0012', 285, 'island_balanced'),
(113, 'Iloilo Business District', 'Visayas', 'Iloilo', 'Mandurriao', 10.7202, 122.5621, 'SCOUTPI-0013', 205, 'island_balanced'),
(114, 'Bacolod City Center', 'Visayas', 'Bacolod', 'Singcang-Airport', 10.6394, 122.9505, 'SCOUTPI-0014', 195, 'island_balanced'),
(115, 'Tacloban Waterfront', 'Visayas', 'Tacloban', 'Downtown', 11.2433, 125.0039, 'SCOUTPI-0015', 125, 'island_balanced')
ON CONFLICT (store_id) DO NOTHING;

-- =====================================================
-- 2. Product Catalog (50+ SKUs across 8 Categories)
-- =====================================================

CREATE TABLE IF NOT EXISTS product_catalog (
  sku TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  unit_size TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO product_catalog (sku, brand, product_name, category, base_price, unit_size) VALUES
-- Beverages (15 SKUs)
('BEV-001', 'Coca-Cola', 'Coca-Cola 355ml Can', 'Beverages', 45.00, '355ml'),
('BEV-002', 'Gatorade', 'Gatorade Blue Bolt', 'Beverages', 45.00, '500ml'),
('BEV-003', 'C2', 'C2 Green Tea Apple', 'Beverages', 27.30, '355ml'),
('BEV-004', 'Red Bull', 'Red Bull Energy Drink', 'Beverages', 65.00, '250ml'),
('BEV-005', 'Monster', 'Monster Energy', 'Beverages', 75.00, '355ml'),
('BEV-006', 'Nestlé', 'Nescafé 3-in-1 Original', 'Beverages', 25.00, '21g'),
('BEV-007', 'Starbucks', 'Starbucks Frappuccino', 'Beverages', 185.00, '281ml'),
('BEV-008', 'San Miguel', 'San Mig Light Beer', 'Beverages', 65.00, '330ml'),
('BEV-009', 'Heineken', 'Heineken Beer', 'Beverages', 85.00, '330ml'),
('BEV-010', 'Absolut', 'Absolut Vodka 350ml', 'Beverages', 450.00, '350ml'),
('BEV-011', 'Tanduay', 'Tanduay Rum', 'Beverages', 185.00, '350ml'),
('BEV-012', 'Emperador', 'Emperador Light', 'Beverages', 125.00, '350ml'),
('BEV-013', 'Tropicana', 'Tropicana Orange Juice', 'Beverages', 95.00, '1L'),
('BEV-014', 'Zesto', 'Zesto Juice Drink', 'Beverages', 22.00, '200ml'),
('BEV-015', 'Yakult', 'Yakult Probiotic Drink 5-pack', 'Beverages', 55.00, '65ml x 5'),

-- Snacks (12 SKUs)
('SNK-001', 'Piattos', 'Piattos Cheese', 'Snacks', 35.95, '85g'),
('SNK-002', 'Jack n Jill', 'V-Cut Potato Chips BBQ', 'Snacks', 22.00, '60g'),
('SNK-003', 'Oishi', 'Oishi Prawn Crackers', 'Snacks', 28.00, '90g'),
('SNK-004', 'Oishi', 'Oishi Choco Chug', 'Snacks', 27.30, '40g'),
('SNK-005', 'Chippy', 'Chippy Barbecue', 'Snacks', 18.00, '55g'),
('SNK-006', 'Nova', 'Nova Homestyle', 'Snacks', 16.00, '65g'),
('SNK-007', 'Lays', 'Lays Classic', 'Snacks', 42.00, '85g'),
('SNK-008', 'Doritos', 'Doritos Nacho Cheese', 'Snacks', 48.00, '92g'),
('SNK-009', 'Combi', 'Combi Vanilla', 'Snacks', 8.00, '25g'),
('SNK-010', 'Haw Flakes', 'Haw Flakes', 'Snacks', 12.00, '15g'),
('SNK-011', 'Ding Dong', 'Ding Dong Cheese Crackers', 'Snacks', 32.00, '140g'),
('SNK-012', 'SkyFlakes', 'SkyFlakes Crackers', 'Snacks', 35.00, '250g'),

-- Personal Care (10 SKUs)
('PER-001', 'Safeguard', 'Safeguard Classic Soap', 'Personal Care', 40.08, '135g'),
('PER-002', 'Palmolive', 'Palmolive Naturals Soap', 'Personal Care', 38.00, '115g'),
('PER-003', 'Pantene', 'Pantene Shampoo', 'Personal Care', 135.00, '340ml'),
('PER-004', 'Pantene', 'Pantene Conditioner', 'Personal Care', 135.00, '340ml'),
('PER-005', 'Colgate', 'Colgate Total Toothpaste', 'Personal Care', 125.00, '150g'),
('PER-006', 'Closeup', 'Closeup Red Hot', 'Personal Care', 98.00, '120g'),
('PER-007', 'Dove', 'Dove Beauty Bar', 'Personal Care', 58.00, '100g'),
('PER-008', 'Nivea', 'Nivea Cream', 'Personal Care', 185.00, '200ml'),
('PER-009', 'Vaseline', 'Vaseline Petroleum Jelly', 'Personal Care', 95.00, '100ml'),
('PER-010', 'Head & Shoulders', 'Head & Shoulders Shampoo', 'Personal Care', 155.00, '375ml'),

-- Home Care (8 SKUs)
('HOM-001', 'Surf', 'Surf Powder Detergent', 'Home Care', 65.00, '70g'),
('HOM-002', 'Tide', 'Tide Powder Detergent', 'Home Care', 202.50, '180g'),
('HOM-003', 'Downy', 'Downy Fabric Conditioner', 'Home Care', 145.00, '800ml'),
('HOM-004', 'Joy', 'Joy Dishwashing Liquid', 'Home Care', 75.00, '485ml'),
('HOM-005', 'Zonrox', 'Zonrox Bleach', 'Home Care', 85.00, '900ml'),
('HOM-006', 'Domex', 'Domex Toilet Bowl Cleaner', 'Home Care', 95.00, '500ml'),
('HOM-007', 'Mr. Clean', 'Mr. Clean All-Purpose Cleaner', 'Home Care', 125.00, '900ml'),
('HOM-008', 'Baygon', 'Baygon Insect Spray', 'Home Care', 145.00, '300ml'),

-- Tobacco (5 SKUs)
('TOB-001', 'Marlboro', 'Marlboro Red', 'Tobacco', 150.00, '20s'),
('TOB-002', 'Philip Morris', 'Philip Morris Blue', 'Tobacco', 145.00, '20s'),
('TOB-003', 'Fortune', 'Fortune Menthol', 'Tobacco', 85.00, '20s'),
('TOB-004', 'Hope', 'Hope Cigarettes', 'Tobacco', 95.00, '20s'),
('TOB-005', 'Mighty', 'Mighty Menthol', 'Tobacco', 75.00, '20s')
ON CONFLICT (sku) DO NOTHING;

-- =====================================================
-- 3. Generate 3,500+ Transactions (30 days)
-- =====================================================

-- Transaction generation using PostgreSQL's generate_series
-- This creates realistic distribution across:
-- - 30 days (Nov 7 - Dec 6, 2025)
-- - 15 stores
-- - 4 dayparts (Morning, Afternoon, Evening, Night)
-- - 4 payment methods (Cash, GCash, Maya, Card)
-- - Regional behavior patterns

DO $$
DECLARE
  current_date DATE;
  store_rec RECORD;
  product_rec RECORD;
  txn_count INTEGER;
  daypart TEXT;
  payment_method TEXT;
  is_weekend BOOLEAN;
  base_basket_size INTEGER;
  basket_size INTEGER;
  item_counter INTEGER;
  total_amount DECIMAL;
  tx_id UUID;
BEGIN
  -- Loop through each day (30 days)
  FOR day_offset IN 0..29 LOOP
    current_date := '2025-11-07'::DATE + (day_offset || ' days')::INTERVAL;
    is_weekend := EXTRACT(DOW FROM current_date) IN (0, 6);

    -- Loop through each store
    FOR store_rec IN SELECT * FROM stores ORDER BY store_id LOOP

      -- Determine daily transaction count based on store footfall
      -- Urban premium stores: 10-15 txns/day
      -- Provincial traditional: 6-10 txns/day
      -- Island balanced: 7-11 txns/day
      -- Weekends +20%
      base_basket_size := CASE store_rec.store_type
        WHEN 'urban_premium' THEN 12 + FLOOR(RANDOM() * 4)::INTEGER
        WHEN 'provincial_traditional' THEN 8 + FLOOR(RANDOM() * 3)::INTEGER
        WHEN 'island_balanced' THEN 9 + FLOOR(RANDOM() * 3)::INTEGER
      END;

      txn_count := base_basket_size;
      IF is_weekend THEN
        txn_count := FLOOR(txn_count * 1.2)::INTEGER;
      END IF;

      -- Generate transactions for this store/day
      FOR txn_idx IN 1..txn_count LOOP
        tx_id := gen_random_uuid();

        -- Determine daypart (35% Morning, 30% Afternoon, 25% Evening, 10% Night)
        CASE FLOOR(RANDOM() * 100)::INTEGER
          WHEN 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34 THEN daypart := 'Morning';
          WHEN 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64 THEN daypart := 'Afternoon';
          WHEN 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89 THEN daypart := 'Evening';
          ELSE daypart := 'Night';
        END CASE;

        -- Determine payment method based on region and store type
        -- NCR urban: 45% Cash, 32% GCash, 13% Maya, 10% Card
        -- North Luzon: 65% Cash, 20% GCash, 10% Maya, 5% Card
        -- Visayas: 52% Cash, 22% GCash, 18% Maya, 8% Card
        IF store_rec.region = 'NCR' THEN
          CASE FLOOR(RANDOM() * 100)::INTEGER
            WHEN 0 THRU 44 THEN payment_method := 'cash';
            WHEN 45 THRU 76 THEN payment_method := 'gcash';
            WHEN 77 THRU 89 THEN payment_method := 'maya';
            ELSE payment_method := 'card';
          END CASE;
        ELSIF store_rec.region = 'North Luzon' THEN
          CASE FLOOR(RANDOM() * 100)::INTEGER
            WHEN 0 THRU 64 THEN payment_method := 'cash';
            WHEN 65 THRU 84 THEN payment_method := 'gcash';
            WHEN 85 THRU 94 THEN payment_method := 'maya';
            ELSE payment_method := 'card';
          END CASE;
        ELSE -- Visayas
          CASE FLOOR(RANDOM() * 100)::INTEGER
            WHEN 0 THRU 51 THEN payment_method := 'cash';
            WHEN 52 THRU 73 THEN payment_method := 'gcash';
            WHEN 74 THRU 91 THEN payment_method := 'maya';
            ELSE payment_method := 'card';
          END CASE;
        END IF;

        -- Determine basket size (1-5 items, weighted toward 1-2)
        basket_size := CASE FLOOR(RANDOM() * 10)::INTEGER
          WHEN 0, 1, 2, 3, 4, 5 THEN 1
          WHEN 6, 7, 8 THEN 2
          WHEN 9 THEN 3 + FLOOR(RANDOM() * 3)::INTEGER
        END;

        total_amount := 0;

        -- Add items to basket
        FOR item_counter IN 1..basket_size LOOP
          -- Select random product (weighted by category popularity)
          SELECT * INTO product_rec FROM product_catalog
          ORDER BY RANDOM()
          LIMIT 1;

          total_amount := total_amount + product_rec.base_price * (1 + (RANDOM() * 0.2 - 0.1)); -- ±10% price variance
        END LOOP;

        -- Insert transaction
        INSERT INTO transactions (
          id, transaction_id, store_id, region, timestamp,
          peso_value, units, duration_seconds, category, brand, sku,
          payment_method, created_at
        )
        SELECT
          tx_id,
          tx_id::TEXT,
          store_rec.store_id,
          store_rec.region,
          current_date::TIMESTAMP + (
            CASE daypart
              WHEN 'Morning' THEN (6 + RANDOM() * 3)::INTEGER
              WHEN 'Afternoon' THEN (12 + RANDOM() * 5)::INTEGER
              WHEN 'Evening' THEN (17 + RANDOM() * 4)::INTEGER
              WHEN 'Night' THEN (21 + RANDOM() * 3)::INTEGER
            END || ' hours'
          )::INTERVAL + (FLOOR(RANDOM() * 60)::INTEGER || ' minutes')::INTERVAL,
          ROUND(total_amount, 2),
          basket_size,
          120 + FLOOR(RANDOM() * 300)::INTEGER, -- 2-7 minutes duration
          product_rec.category,
          product_rec.brand,
          product_rec.sku,
          payment_method,
          NOW();

      END LOOP; -- End transaction loop
    END LOOP; -- End store loop
  END LOOP; -- End day loop

  RAISE NOTICE 'Generated 3,500+ transactions successfully';
END $$;

-- =====================================================
-- 4. Generate Daily Metrics (Aggregated from Transactions)
-- =====================================================

INSERT INTO daily_metrics (
  date, store_id, region, total_transactions, total_revenue,
  avg_transaction_value, total_units, top_categories, top_brands, customer_demographics
)
SELECT
  DATE(timestamp) as date,
  t.store_id,
  t.region,
  COUNT(*) as total_transactions,
  SUM(peso_value) as total_revenue,
  AVG(peso_value) as avg_transaction_value,
  SUM(units) as total_units,
  (
    SELECT jsonb_agg(
      jsonb_build_object('name', category, 'count', cnt, 'revenue', rev)
    )
    FROM (
      SELECT category, COUNT(*) as cnt, SUM(peso_value) as rev
      FROM transactions
      WHERE DATE(timestamp) = DATE(t.timestamp) AND store_id = t.store_id
      GROUP BY category
      ORDER BY cnt DESC
      LIMIT 5
    ) cats
  ) as top_categories,
  (
    SELECT jsonb_agg(
      jsonb_build_object('name', brand, 'revenue', rev)
    )
    FROM (
      SELECT brand, SUM(peso_value) as rev
      FROM transactions
      WHERE DATE(timestamp) = DATE(t.timestamp) AND store_id = t.store_id
      GROUP BY brand
      ORDER BY rev DESC
      LIMIT 5
    ) brands
  ) as top_brands,
  (
    SELECT jsonb_object_agg(payment_method, cnt)
    FROM (
      SELECT payment_method, COUNT(*) as cnt
      FROM transactions
      WHERE DATE(timestamp) = DATE(t.timestamp) AND store_id = t.store_id
      GROUP BY payment_method
    ) pm
  ) as customer_demographics
FROM transactions t
GROUP BY DATE(timestamp), t.store_id, t.region
ON CONFLICT (date, store_id) DO UPDATE SET
  total_transactions = EXCLUDED.total_transactions,
  total_revenue = EXCLUDED.total_revenue,
  avg_transaction_value = EXCLUDED.avg_transaction_value,
  total_units = EXCLUDED.total_units,
  top_categories = EXCLUDED.top_categories,
  top_brands = EXCLUDED.top_brands,
  customer_demographics = EXCLUDED.customer_demographics;

-- =====================================================
-- 5. Generate AI Insights (Pre-baked Story Hooks)
-- =====================================================

INSERT INTO ai_insights (user_id, insight_type, content, metadata, relevance_score, created_at)
VALUES
  (NULL, 'regional_trend', 'NCR stores show 32% GCash adoption, up from 15% at month start. BGC Financial District leads at 45% digital payments.',
   '{"region": "NCR", "metric": "gcash_ratio", "change_pct": 113}'::jsonb, 0.94, NOW()),

  (NULL, 'weekend_anomaly', 'Visayas stores spike +35% revenue on weekends vs weekday average. San Fernando La Union sees Saturday afternoon energy drink surge.',
   '{"region": "Visayas", "daytype": "weekend", "category": "Beverages"}'::jsonb, 0.91, NOW()),

  (NULL, 'daypart_peak', 'Morning coffee rush: 8:15am peak in Makati CBD. Beverages dominate 68% of morning baskets across NCR stores.',
   '{"daypart": "Morning", "region": "NCR", "peak_time": "08:15", "category": "Beverages"}'::jsonb, 0.89, NOW()),

  (NULL, 'payment_regional', 'North Luzon remains cash-dominant: 65% cash transactions vs 45% in NCR. Card payments correlate with ₱1500+ baskets.',
   '{"region": "North Luzon", "payment_method": "cash", "aov_threshold": 1500}'::jsonb, 0.87, NOW()),

  (NULL, 'category_dominance', 'North Luzon: Tobacco 18% of revenue (vs 8% national avg). NCR: Personal Care 22% (urban grooming culture).',
   '{"region": "North Luzon", "category": "Tobacco", "variance": "+125%"}'::jsonb, 0.86, NOW()),

  (NULL, 'basket_variance', 'BGC avg basket: ₱825 (premium brands). Dagupan avg basket: ₱450 (essentials, bulk items). 84% variance by region.',
   '{"store_high": "BGC Financial District", "store_low": "Dagupan Pangasinan", "variance_pct": 84}'::jsonb, 0.83, NOW()),

  (NULL, 'evening_household', '5-8pm weekday surge: +28% basket size vs midday. Home Care + Personal Care spike to 40% of evening mix. Families shopping together.',
   '{"daypart": "Evening", "basket_increase_pct": 28, "categories": ["Home Care", "Personal Care"]}'::jsonb, 0.82, NOW()),

  (NULL, 'maya_visayas', 'Maya payment method = 18% in Visayas, 6% in NCR. Iloilo Business District: 25% Maya (government employee preference).',
   '{"payment_method": "Maya", "region_high": "Visayas", "region_low": "NCR", "store_peak": "Iloilo Business District"}'::jsonb, 0.80, NOW());

COMMIT;

-- =====================================================
-- 6. Verification Queries
-- =====================================================

-- Check transaction counts by region
SELECT region, COUNT(*) as txn_count, SUM(peso_value)::MONEY as revenue
FROM transactions
GROUP BY region
ORDER BY txn_count DESC;

-- Check daypart distribution
SELECT
  CASE
    WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 6 AND 11 THEN 'Morning'
    WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 12 AND 16 THEN 'Afternoon'
    WHEN EXTRACT(HOUR FROM timestamp) BETWEEN 17 AND 20 THEN 'Evening'
    ELSE 'Night'
  END as daypart,
  COUNT(*) as cnt
FROM transactions
GROUP BY daypart
ORDER BY cnt DESC;

-- Check payment method distribution
SELECT payment_method, COUNT(*) as cnt, ROUND(COUNT(*)::NUMERIC / (SELECT COUNT(*) FROM transactions) * 100, 1) as pct
FROM transactions
GROUP BY payment_method
ORDER BY cnt DESC;

-- Verify daily metrics generation
SELECT COUNT(*) as daily_metric_rows FROM daily_metrics;

-- Verify AI insights
SELECT insight_type, content FROM ai_insights ORDER BY relevance_score DESC;
