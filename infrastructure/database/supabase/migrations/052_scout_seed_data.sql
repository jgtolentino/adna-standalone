-- Scout XI Seed Data
-- Migration: 052_scout_seed_data.sql
-- Purpose: Generate realistic synthetic data for Scout XI dashboard
-- Author: TBWA Enterprise Platform
-- Date: 2025-12-07

-- Note: This script requires uuid-ossp extension for uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- SEED REGIONS (17 Philippine regions - only add if not exists)
-------------------------------------------------------------------------------
INSERT INTO scout.regions (region_code, region_name)
SELECT * FROM (VALUES
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
  ('BARMM', 'Bangsamoro Autonomous Region')
) AS v(region_code, region_name)
WHERE NOT EXISTS (
  SELECT 1 FROM scout.regions WHERE region_code = v.region_code
);

-------------------------------------------------------------------------------
-- SEED STORES (24 stores across key regions)
-------------------------------------------------------------------------------
INSERT INTO scout.stores (store_code, store_name, region_code, province, city, barangay, latitude, longitude)
SELECT * FROM (VALUES
  -- NCR (Metro Manila) - 6 stores
  ('ST0001', 'Shoreline Sari-Sari', 'NCR', 'Metro Manila', 'Quezon City', 'Bagumbayan', 14.6488, 121.0509),
  ('ST0002', 'Highway Sari-Sari', 'NCR', 'Metro Manila', 'Makati', 'Poblacion', 14.5547, 121.0244),
  ('ST0003', 'Village Grocer', 'NCR', 'Metro Manila', 'Pasig', 'Ugong', 14.5764, 121.0851),
  ('ST0004', 'Corner Kiosk', 'NCR', 'Metro Manila', 'Taguig', 'BGC', 14.5547, 121.0503),
  ('ST0005', 'Metro Mart', 'NCR', 'Metro Manila', 'Mandaluyong', 'Barangka', 14.5794, 121.0359),
  ('ST0006', 'City Express', 'NCR', 'Metro Manila', 'San Juan', 'Little Baguio', 14.6019, 121.0355),

  -- Region III (Central Luzon) - 4 stores
  ('ST0007', 'Plaza Mini Mart', 'REGION_III', 'Pampanga', 'San Fernando', 'Dolores', 15.0286, 120.6850),
  ('ST0008', 'Crossroad Store', 'REGION_III', 'Pampanga', 'Angeles', 'Balibago', 15.1450, 120.5887),
  ('ST0009', 'Luzon Convenience', 'REGION_III', 'Bulacan', 'Malolos', 'Catmon', 14.8527, 120.8108),
  ('ST0010', 'Central Market', 'REGION_III', 'Nueva Ecija', 'Cabanatuan', 'Sumacab', 15.4860, 120.9640),

  -- Region IV-A (CALABARZON) - 4 stores
  ('ST0011', 'Ridge Sari-Sari', 'REGION_IV_A', 'Rizal', 'Antipolo', 'San Roque', 14.5862, 121.1761),
  ('ST0012', 'Valley Convenience', 'REGION_IV_A', 'Cavite', 'Dasmariñas', 'Salitran', 14.3294, 120.9367),
  ('ST0013', 'Laguna Express', 'REGION_IV_A', 'Laguna', 'San Pedro', 'Sampaguita', 14.3595, 121.0472),
  ('ST0014', 'South Store', 'REGION_IV_A', 'Batangas', 'Lipa', 'Marawoy', 13.9411, 121.1633),

  -- Region VII (Central Visayas) - 4 stores
  ('ST0015', 'Harbor Corner', 'REGION_VII', 'Cebu', 'Cebu City', 'Lahug', 10.3157, 123.8854),
  ('ST0016', 'Market Lane Store', 'REGION_VII', 'Cebu', 'Cebu City', 'Guadalupe', 10.3157, 123.9067),
  ('ST0017', 'Island Mart', 'REGION_VII', 'Cebu', 'Mandaue', 'Centro', 10.3236, 123.9223),
  ('ST0018', 'Visayan Grocer', 'REGION_VII', 'Bohol', 'Tagbilaran', 'Poblacion', 9.6500, 123.8500),

  -- Region XI (Davao) - 4 stores
  ('ST0019', 'Davao Junction', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Matina', 7.0731, 125.6128),
  ('ST0020', 'Lanang Express', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Lanang', 7.1167, 125.6403),
  ('ST0021', 'Mindanao Mart', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Buhangin', 7.1028, 125.6231),
  ('ST0022', 'Southern Store', 'REGION_XI', 'Davao del Norte', 'Tagum', 'Poblacion', 7.4478, 125.8078),

  -- Region I (Ilocos) - 2 stores
  ('ST0023', 'Ilocos Sari-Sari', 'REGION_I', 'Ilocos Norte', 'Laoag', 'Brgy 1', 18.1987, 120.5936),
  ('ST0024', 'Northern Mart', 'REGION_I', 'La Union', 'San Fernando', 'Catbangen', 16.6159, 120.3194)
) AS v(store_code, store_name, region_code, province, city, barangay, latitude, longitude)
WHERE NOT EXISTS (
  SELECT 1 FROM scout.stores WHERE store_code = v.store_code
);

-------------------------------------------------------------------------------
-- SEED TRANSACTIONS (~3000 transactions over last 30 days)
-------------------------------------------------------------------------------
DO $$
DECLARE
  v_store record;
  v_day date;
  v_tx_count integer;
  v_i integer;
  v_timestamp timestamptz;
  v_hour integer;
  v_daypart scout.daypart;
  v_brand text;
  v_category text;
  v_our_brand boolean;
  v_tbwa_client boolean;
  v_payment scout.payment_method;
  v_income scout.income_band;
  v_urban scout.urban_rural;
  v_funnel scout.funnel_stage;
  v_quantity integer;
  v_unit_price numeric;
  v_discount numeric;
  v_age integer;
  v_gender text;

  -- Arrays for random selection
  v_brands text[] := ARRAY['Coca-Cola', 'Pepsi', 'Sprite', 'Fortune', 'Marlboro', 'Oishi', 'Lucky Me', 'Nescafe', 'Bear Brand', 'Alaska', 'San Miguel', 'Knorr', 'Del Monte', 'Century Tuna', 'Argentina'];
  v_categories text[] := ARRAY['Beverages', 'Snacks', 'Personal Care', 'Household', 'Tobacco', 'Canned Goods', 'Dairy', 'Instant Noodles', 'Condiments'];
  v_payments scout.payment_method[] := ARRAY['cash', 'gcash', 'maya', 'card']::scout.payment_method[];
  v_incomes scout.income_band[] := ARRAY['low', 'middle', 'high', 'unknown']::scout.income_band[];
  v_urbans scout.urban_rural[] := ARRAY['urban', 'rural', 'unknown']::scout.urban_rural[];
  v_funnels scout.funnel_stage[] := ARRAY['visit', 'browse', 'request', 'accept', 'purchase']::scout.funnel_stage[];
  v_genders text[] := ARRAY['M', 'F', 'Unknown'];

BEGIN
  -- Loop through each store
  FOR v_store IN SELECT id, region_code, province, city, barangay FROM scout.stores LOOP
    -- Loop through last 30 days
    FOR v_day IN SELECT generate_series(current_date - 29, current_date, interval '1 day')::date LOOP
      -- Determine transactions per day (varies by store size/region)
      v_tx_count := 20 + floor(random() * 80)::integer;  -- 20-100 tx per day per store

      -- Generate transactions for this store/day
      FOR v_i IN 1..v_tx_count LOOP
        -- Random hour and daypart
        v_hour := floor(random() * 18)::integer + 6;  -- 6am to midnight
        v_daypart := CASE
          WHEN v_hour < 12 THEN 'morning'::scout.daypart
          WHEN v_hour < 17 THEN 'afternoon'::scout.daypart
          WHEN v_hour < 21 THEN 'evening'::scout.daypart
          ELSE 'night'::scout.daypart
        END;
        v_timestamp := v_day + (v_hour * interval '1 hour') + (floor(random() * 60) * interval '1 minute');

        -- Random brand and category
        v_brand := v_brands[1 + floor(random() * array_length(v_brands, 1))::integer];
        v_category := v_categories[1 + floor(random() * array_length(v_categories, 1))::integer];

        -- TBWA client brands (some brands are TBWA clients)
        v_our_brand := v_brand IN ('Oishi', 'Del Monte', 'Fortune');
        v_tbwa_client := v_brand IN ('Oishi', 'Del Monte', 'Fortune', 'Coca-Cola', 'Nescafe', 'Bear Brand');

        -- Random payment, demographics
        v_payment := v_payments[1 + floor(random() * array_length(v_payments, 1))::integer];
        v_income := v_incomes[1 + floor(random() * array_length(v_incomes, 1))::integer];
        v_urban := CASE
          WHEN v_store.region_code IN ('NCR', 'REGION_VII') THEN 'urban'::scout.urban_rural
          WHEN random() < 0.6 THEN 'urban'::scout.urban_rural
          ELSE 'rural'::scout.urban_rural
        END;
        v_funnel := v_funnels[1 + floor(random() * array_length(v_funnels, 1))::integer];

        -- Transaction details
        v_quantity := 1 + floor(random() * 5)::integer;
        v_unit_price := 15 + floor(random() * 200)::numeric;
        v_discount := CASE WHEN random() < 0.2 THEN floor(random() * 20)::numeric ELSE 0 END;

        -- Customer demographics
        v_age := 18 + floor(random() * 50)::integer;
        v_gender := v_genders[1 + floor(random() * array_length(v_genders, 1))::integer];

        -- Insert transaction
        INSERT INTO scout.transactions (
          store_id, timestamp, time_of_day,
          region_code, province, city, barangay,
          brand_name, sku, product_category,
          our_brand, tbwa_client_brand,
          quantity, unit_price, gross_amount, discount_amount,
          payment_method, customer_id, age, gender,
          income, urban_rural, funnel_stage,
          basket_size, repeated_customer
        ) VALUES (
          v_store.id, v_timestamp, v_daypart,
          v_store.region_code, v_store.province, v_store.city, v_store.barangay,
          v_brand, 'SKU-' || lpad((floor(random() * 500) + 1)::text, 4, '0'), v_category,
          v_our_brand, v_tbwa_client,
          v_quantity, v_unit_price, v_quantity * v_unit_price, v_discount,
          v_payment, 'C' || lpad((floor(random() * 10000))::text, 6, '0'), v_age, v_gender,
          v_income, v_urban, v_funnel,
          1 + floor(random() * 8)::integer, random() < 0.4
        );
      END LOOP;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Seed data generation complete';
END $$;

-------------------------------------------------------------------------------
-- VERIFICATION
-------------------------------------------------------------------------------
DO $$
DECLARE
  v_tx_count bigint;
  v_store_count bigint;
  v_region_count bigint;
BEGIN
  SELECT count(*) INTO v_tx_count FROM scout.transactions;
  SELECT count(*) INTO v_store_count FROM scout.stores;
  SELECT count(DISTINCT region_code) INTO v_region_count FROM scout.transactions;

  RAISE NOTICE 'Seed verification:';
  RAISE NOTICE '  Transactions: %', v_tx_count;
  RAISE NOTICE '  Stores: %', v_store_count;
  RAISE NOTICE '  Active regions: %', v_region_count;
END $$;
