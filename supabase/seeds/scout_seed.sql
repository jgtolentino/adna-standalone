-- Scout Dashboard Seed Data
-- Generates realistic PH sari-sari retail transaction data
-- Run this in Supabase SQL Editor after applying the migration

-- =============================================================================
-- SEED REGIONS (Philippine administrative regions)
-- =============================================================================

INSERT INTO scout.regions (code, name) VALUES
  ('NCR', 'Metro Manila'),
  ('CAR', 'Cordillera Administrative Region'),
  ('REGION_I', 'Ilocos Region'),
  ('REGION_II', 'Cagayan Valley'),
  ('REGION_III', 'Central Luzon'),
  ('REGION_IV_A', 'CALABARZON'),
  ('REGION_IV_B', 'MIMAROPA'),
  ('REGION_V', 'Bicol Region'),
  ('REGION_VI', 'Western Visayas'),
  ('REGION_VII', 'Central Visayas'),
  ('REGION_VIII', 'Eastern Visayas'),
  ('REGION_IX', 'Zamboanga Peninsula'),
  ('REGION_X', 'Northern Mindanao'),
  ('REGION_XI', 'Davao Region'),
  ('REGION_XII', 'SOCCSKSARGEN'),
  ('REGION_XIII', 'Caraga'),
  ('BARMM', 'Bangsamoro')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- SEED STORES (sample sari-sari stores across regions)
-- =============================================================================

INSERT INTO scout.stores (store_code, store_name, region_code, province, city, barangay, latitude, longitude, store_type) VALUES
  -- NCR (Metro Manila)
  ('ST0001', 'Aling Nena Sari-Sari', 'NCR', 'Metro Manila', 'Quezon City', 'Bagumbayan', 14.6349, 121.0427, 'sari-sari'),
  ('ST0002', 'Mang Bert Mini Mart', 'NCR', 'Metro Manila', 'Makati', 'Poblacion', 14.5649, 121.0302, 'convenience'),
  ('ST0003', 'Kuya Jun Store', 'NCR', 'Metro Manila', 'Pasig', 'Ugong', 14.5784, 121.0614, 'sari-sari'),
  ('ST0004', 'Ate Lina Corner', 'NCR', 'Metro Manila', 'Taguig', 'Ususan', 14.5333, 121.0667, 'sari-sari'),
  ('ST0005', 'Manong Tony Tindahan', 'NCR', 'Metro Manila', 'Mandaluyong', 'Addition Hills', 14.5833, 121.0333, 'sari-sari'),

  -- Central Luzon
  ('ST0006', 'Plaza Mini Mart', 'REGION_III', 'Pampanga', 'San Fernando', 'Dolores', 15.0286, 120.6851, 'convenience'),
  ('ST0007', 'Highway Sari-Sari', 'REGION_III', 'Pampanga', 'Angeles', 'Balibago', 15.1686, 120.5847, 'sari-sari'),
  ('ST0008', 'Barangay Store', 'REGION_III', 'Bulacan', 'Meycauayan', 'Malhacan', 14.7333, 120.9667, 'sari-sari'),

  -- CALABARZON
  ('ST0009', 'Ridge Sari-Sari', 'REGION_IV_A', 'Rizal', 'Antipolo', 'San Roque', 14.6256, 121.1212, 'sari-sari'),
  ('ST0010', 'Valley Convenience', 'REGION_IV_A', 'Cavite', 'Dasmarinas', 'Salitran', 14.3294, 120.9367, 'convenience'),
  ('ST0011', 'Corner Kiosk', 'REGION_IV_A', 'Laguna', 'San Pedro', 'Sampaguita', 14.3500, 121.0500, 'sari-sari'),
  ('ST0012', 'Lakeview Store', 'REGION_IV_A', 'Laguna', 'Calamba', 'Parian', 14.2117, 121.1653, 'sari-sari'),

  -- Central Visayas
  ('ST0013', 'Harbor Corner', 'REGION_VII', 'Cebu', 'Cebu City', 'Lahug', 10.3304, 123.8942, 'sari-sari'),
  ('ST0014', 'Market Lane Store', 'REGION_VII', 'Cebu', 'Cebu City', 'Guadalupe', 10.3157, 123.8854, 'convenience'),
  ('ST0015', 'Island Mart', 'REGION_VII', 'Cebu', 'Mandaue', 'Centro', 10.3236, 123.9220, 'convenience'),

  -- Davao Region
  ('ST0016', 'Davao Junction', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Matina', 7.0644, 125.5941, 'sari-sari'),
  ('ST0017', 'Lanang Express', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Lanang', 7.1097, 125.6447, 'convenience'),
  ('ST0018', 'Southern Store', 'REGION_XI', 'Davao del Sur', 'Digos', 'Zone 3', 6.7496, 125.3572, 'sari-sari'),

  -- Western Visayas
  ('ST0019', 'Iloilo Plaza Store', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Jaro', 10.7202, 122.5621, 'sari-sari'),
  ('ST0020', 'Bacolod Corner', 'REGION_VI', 'Negros Occidental', 'Bacolod', 'Mandalagan', 10.6840, 122.9563, 'convenience')
ON CONFLICT (store_code) DO NOTHING;

-- =============================================================================
-- SEED TRANSACTIONS (~2000 realistic transactions over last 30 days)
-- =============================================================================

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generate transactions using a CTE-based approach
WITH
stores_list AS (
  SELECT id, region_code, province, city, barangay FROM scout.stores
),
date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '30 days',
    CURRENT_DATE,
    INTERVAL '1 day'
  )::DATE AS tx_date
),
-- Define product catalog with brands
products AS (
  SELECT * FROM (VALUES
    -- Beverages
    ('Coca-Cola', 'SKU-COKE-330', 'Beverages', 'Soft Drinks', 25.00, true, true),
    ('Pepsi', 'SKU-PEPS-330', 'Beverages', 'Soft Drinks', 23.00, false, false),
    ('Sprite', 'SKU-SPRT-330', 'Beverages', 'Soft Drinks', 25.00, true, true),
    ('RC Cola', 'SKU-RCCO-330', 'Beverages', 'Soft Drinks', 18.00, false, false),
    ('Nestle Pure Life', 'SKU-NPLF-500', 'Beverages', 'Water', 15.00, false, true),
    ('Summit Water', 'SKU-SUMM-500', 'Beverages', 'Water', 12.00, false, false),
    ('C2 Green Tea', 'SKU-C2GT-500', 'Beverages', 'Tea', 25.00, false, false),
    ('Kopiko 78', 'SKU-KOP78-240', 'Beverages', 'Coffee', 30.00, false, false),
    ('Nescafe 3in1', 'SKU-NESC-25G', 'Beverages', 'Coffee', 8.00, false, true),

    -- Snacks
    ('Oishi Prawn Crackers', 'SKU-OISH-60G', 'Snacks', 'Chips', 18.00, false, false),
    ('Piattos', 'SKU-PIAT-85G', 'Snacks', 'Chips', 28.00, false, false),
    ('Chippy', 'SKU-CHIP-110G', 'Snacks', 'Chips', 22.00, false, false),
    ('Nova', 'SKU-NOVA-78G', 'Snacks', 'Chips', 25.00, false, false),
    ('SkyFlakes', 'SKU-SKYF-250G', 'Snacks', 'Crackers', 35.00, false, false),
    ('Fita', 'SKU-FITA-300G', 'Snacks', 'Crackers', 42.00, false, false),

    -- Tobacco
    ('Marlboro Red', 'SKU-MARL-20S', 'Tobacco', 'Cigarettes', 165.00, false, true),
    ('Fortune', 'SKU-FORT-20S', 'Tobacco', 'Cigarettes', 85.00, false, false),
    ('Philip Morris', 'SKU-PMOR-20S', 'Tobacco', 'Cigarettes', 145.00, false, true),
    ('Mighty', 'SKU-MIGH-20S', 'Tobacco', 'Cigarettes', 75.00, false, false),
    ('Hope', 'SKU-HOPE-20S', 'Tobacco', 'Cigarettes', 55.00, false, false),

    -- Personal Care
    ('Safeguard Soap', 'SKU-SFGD-135G', 'Personal Care', 'Soap', 45.00, false, true),
    ('Silka Papaya', 'SKU-SILK-135G', 'Personal Care', 'Soap', 48.00, false, false),
    ('Head & Shoulders', 'SKU-HSHD-12ML', 'Personal Care', 'Shampoo', 8.00, false, true),
    ('Palmolive Shampoo', 'SKU-PALM-12ML', 'Personal Care', 'Shampoo', 7.00, false, false),
    ('Colgate Toothpaste', 'SKU-COLG-50G', 'Personal Care', 'Oral Care', 35.00, false, true),

    -- Household
    ('Surf Powder', 'SKU-SURF-80G', 'Household', 'Laundry', 12.00, false, false),
    ('Ariel Powder', 'SKU-ARIE-66G', 'Household', 'Laundry', 14.00, false, true),
    ('Joy Dishwashing', 'SKU-JOYD-250ML', 'Household', 'Cleaning', 42.00, false, true),

    -- Cooking/Food
    ('Lucky Me Pancit Canton', 'SKU-LKME-60G', 'Cooking', 'Instant Noodles', 14.00, false, false),
    ('Nissin Cup Noodles', 'SKU-NSSN-40G', 'Cooking', 'Instant Noodles', 25.00, false, false),
    ('Magic Sarap', 'SKU-MGSP-8G', 'Cooking', 'Seasonings', 2.00, false, false),
    ('UFC Ketchup', 'SKU-UFCK-320G', 'Cooking', 'Condiments', 45.00, false, false),
    ('Silver Swan Soy Sauce', 'SKU-SLVS-1L', 'Cooking', 'Condiments', 55.00, false, false)
  ) AS t(brand_name, sku, category, subcategory, price, our_brand, tbwa_client)
),
-- Generate base transaction set
tx_base AS (
  SELECT
    s.id AS store_id,
    s.region_code,
    s.province,
    s.city,
    s.barangay,
    d.tx_date,
    generate_series(1, (20 + (random() * 80)::int)) AS tx_seq
  FROM stores_list s
  CROSS JOIN date_series d
),
-- Expand with random product and customer data
tx_expanded AS (
  SELECT
    uuid_generate_v4() AS id,
    tb.store_id,
    tb.tx_date + (INTERVAL '1 minute' * (30 + (random() * 840)::int)) AS timestamp,
    (ARRAY['morning', 'afternoon', 'evening', 'night'])[
      CASE
        WHEN EXTRACT(HOUR FROM tb.tx_date + (INTERVAL '1 minute' * (30 + (random() * 840)::int))) BETWEEN 6 AND 11 THEN 1
        WHEN EXTRACT(HOUR FROM tb.tx_date + (INTERVAL '1 minute' * (30 + (random() * 840)::int))) BETWEEN 12 AND 17 THEN 2
        WHEN EXTRACT(HOUR FROM tb.tx_date + (INTERVAL '1 minute' * (30 + (random() * 840)::int))) BETWEEN 18 AND 21 THEN 3
        ELSE 4
      END
    ]::scout.daypart AS time_of_day,
    tb.region_code,
    tb.province,
    tb.city,
    tb.barangay,
    p.brand_name,
    p.sku,
    p.category AS product_category,
    p.subcategory AS product_subcategory,
    p.our_brand,
    p.tbwa_client AS tbwa_client_brand,
    1 + (random() * 3)::int AS quantity,
    p.price AS unit_price,
    (ARRAY['cash', 'gcash', 'maya', 'card'])[1 + (random() * 3)::int]::scout.payment_method AS payment_method,
    CASE WHEN random() < 0.7 THEN 'CUST-' || lpad((random() * 10000)::int::text, 5, '0') ELSE NULL END AS customer_id,
    18 + (random() * 50)::int AS age,
    (ARRAY['M', 'F'])[1 + (random() * 1)::int] AS gender,
    (ARRAY['low', 'middle', 'high', 'unknown'])[1 + (random() * 3)::int]::scout.income_band AS income,
    (ARRAY['urban', 'rural', 'unknown'])[1 + (random() * 2)::int]::scout.urban_rural AS urban_rural,
    (ARRAY['visit', 'browse', 'request', 'accept', 'purchase'])[1 + (random() * 4)::int] AS funnel_stage,
    1 + (random() * 8)::int AS basket_size,
    random() < 0.35 AS repeated_customer,
    (ARRAY['branded', 'generic', 'indirect'])[1 + (random() * 2)::int] AS request_type,
    random() < 0.45 AS suggestion_accepted,
    random() < 0.15 AS substitution_occurred
  FROM tx_base tb
  CROSS JOIN LATERAL (
    SELECT * FROM products ORDER BY random() LIMIT 1
  ) p
)
INSERT INTO scout.transactions (
  id, store_id, timestamp, time_of_day,
  region_code, province, city, barangay,
  brand_name, sku, product_category, product_subcategory,
  our_brand, tbwa_client_brand,
  quantity, unit_price, gross_amount, discount_amount, payment_method,
  customer_id, age, gender, income, urban_rural,
  funnel_stage, basket_size, repeated_customer,
  request_type, suggestion_accepted, substitution_occurred
)
SELECT
  id,
  store_id,
  timestamp,
  time_of_day,
  region_code,
  province,
  city,
  barangay,
  brand_name,
  sku,
  product_category,
  product_subcategory,
  our_brand,
  tbwa_client_brand,
  quantity,
  unit_price,
  quantity * unit_price AS gross_amount,
  CASE WHEN random() < 0.1 THEN (quantity * unit_price * 0.05)::numeric(12,2) ELSE 0 END AS discount_amount,
  payment_method,
  customer_id,
  age,
  gender,
  income,
  urban_rural,
  funnel_stage,
  basket_size,
  repeated_customer,
  request_type,
  suggestion_accepted,
  substitution_occurred
FROM tx_expanded;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify data was inserted
DO $$
DECLARE
  region_count INTEGER;
  store_count INTEGER;
  tx_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO region_count FROM scout.regions;
  SELECT COUNT(*) INTO store_count FROM scout.stores;
  SELECT COUNT(*) INTO tx_count FROM scout.transactions;

  RAISE NOTICE 'Seed complete: % regions, % stores, % transactions',
    region_count, store_count, tx_count;
END $$;
