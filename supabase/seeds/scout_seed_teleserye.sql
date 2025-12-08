-- Scout Dashboard Seed Data - TELESERYE EDITION
-- Realistic PH FMCG + tobacco market simulation with "retail teleserye" storytelling
-- Implements 6 episodes: Sweldo Rush, Fiesta, Price Increase, Store Competition, Tobacco Habit, Back-to-School
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
-- SEED STORES (50 stores across all 17 regions - Episode 4: Regional Expansion)
-- =============================================================================

INSERT INTO scout.stores (store_code, store_name, region_code, province, city, barangay, latitude, longitude, store_type) VALUES
  -- NCR (Metro Manila) - Original 5 + 2 new
  ('ST0001', 'Aling Nena Sari-Sari', 'NCR', 'Metro Manila', 'Quezon City', 'Bagumbayan', 14.6349, 121.0427, 'sari-sari'),
  ('ST0002', 'Mang Bert Mini Mart', 'NCR', 'Metro Manila', 'Makati', 'Poblacion', 14.5649, 121.0302, 'convenience'),
  ('ST0003', 'Kuya Jun Store', 'NCR', 'Metro Manila', 'Pasig', 'Ugong', 14.5784, 121.0614, 'sari-sari'),
  ('ST0004', 'Ate Lina Corner', 'NCR', 'Metro Manila', 'Taguig', 'Ususan', 14.5333, 121.0667, 'sari-sari'),
  ('ST0005', 'Manong Tony Tindahan', 'NCR', 'Metro Manila', 'Mandaluyong', 'Addition Hills', 14.5833, 121.0333, 'sari-sari'),
  ('ST0006', '7-Eleven Cubao', 'NCR', 'Metro Manila', 'Quezon City', 'Cubao', 14.6231, 121.0557, 'convenience'),
  ('ST0007', 'Parañaque Kiosk', 'NCR', 'Metro Manila', 'Parañaque', 'San Antonio', 14.4793, 121.0198, 'sari-sari'),

  -- Central Luzon (REGION_III) - Original 3
  ('ST0008', 'Plaza Mini Mart', 'REGION_III', 'Pampanga', 'San Fernando', 'Dolores', 15.0286, 120.6851, 'convenience'),
  ('ST0009', 'Highway Sari-Sari', 'REGION_III', 'Pampanga', 'Angeles', 'Balibago', 15.1686, 120.5847, 'sari-sari'),
  ('ST0010', 'Barangay Store', 'REGION_III', 'Bulacan', 'Meycauayan', 'Malhacan', 14.7333, 120.9667, 'sari-sari'),

  -- CALABARZON (REGION_IV_A) - Original 4
  ('ST0011', 'Ridge Sari-Sari', 'REGION_IV_A', 'Rizal', 'Antipolo', 'San Roque', 14.6256, 121.1212, 'sari-sari'),
  ('ST0012', 'Valley Convenience', 'REGION_IV_A', 'Cavite', 'Dasmarinas', 'Salitran', 14.3294, 120.9367, 'convenience'),
  ('ST0013', 'Corner Kiosk', 'REGION_IV_A', 'Laguna', 'San Pedro', 'Sampaguita', 14.3500, 121.0500, 'sari-sari'),
  ('ST0014', 'Lakeview Store', 'REGION_IV_A', 'Laguna', 'Calamba', 'Parian', 14.2117, 121.1653, 'sari-sari'),

  -- Central Visayas (REGION_VII) - Original 3 + 2 new
  ('ST0015', 'Harbor Corner', 'REGION_VII', 'Cebu', 'Cebu City', 'Lahug', 10.3304, 123.8942, 'sari-sari'),
  ('ST0016', 'Market Lane Store', 'REGION_VII', 'Cebu', 'Cebu City', 'Guadalupe', 10.3157, 123.8854, 'convenience'),
  ('ST0017', 'Island Mart', 'REGION_VII', 'Cebu', 'Mandaue', 'Centro', 10.3236, 123.9220, 'convenience'),
  ('ST0018', 'Lapu-Lapu Tindahan', 'REGION_VII', 'Cebu', 'Lapu-Lapu', 'Marigondon', 10.3103, 123.9619, 'sari-sari'),
  ('ST0019', 'Mactan Store', 'REGION_VII', 'Cebu', 'Lapu-Lapu', 'Mactan', 10.2936, 123.9793, 'sari-sari'),

  -- Davao Region (REGION_XI) - Original 3
  ('ST0020', 'Davao Junction', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Matina', 7.0644, 125.5941, 'sari-sari'),
  ('ST0021', 'Lanang Express', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Lanang', 7.1097, 125.6447, 'convenience'),
  ('ST0022', 'Southern Store', 'REGION_XI', 'Davao del Sur', 'Digos', 'Zone 3', 6.7496, 125.3572, 'sari-sari'),

  -- Western Visayas (REGION_VI) - Original 2 + 2 new
  ('ST0023', 'Iloilo Plaza Store', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Jaro', 10.7202, 122.5621, 'sari-sari'),
  ('ST0024', 'Bacolod Corner', 'REGION_VI', 'Negros Occidental', 'Bacolod', 'Mandalagan', 10.6840, 122.9563, 'convenience'),
  ('ST0025', 'Roxas City Store', 'REGION_VI', 'Capiz', 'Roxas City', 'Baybay', 11.5854, 122.7512, 'sari-sari'),
  ('ST0026', 'Kalibo Junction', 'REGION_VI', 'Aklan', 'Kalibo', 'Poblacion', 11.7044, 122.3679, 'convenience'),

  -- NEW REGIONAL EXPANSION (30 stores across 11 missing regions)
  -- CAR (Cordillera Administrative Region) - 2 stores
  ('ST0027', 'Baguio Market Store', 'CAR', 'Benguet', 'Baguio City', 'Session Road', 16.4129, 120.5937, 'convenience'),
  ('ST0028', 'Mountain Sari-Sari', 'CAR', 'Benguet', 'La Trinidad', 'Poblacion', 16.4594, 120.5902, 'sari-sari'),

  -- Ilocos Region (REGION_I) - 3 stores
  ('ST0029', 'Laoag Plaza Store', 'REGION_I', 'Ilocos Norte', 'Laoag City', 'Barangay 1', 18.1987, 120.5929, 'convenience'),
  ('ST0030', 'Vigan Heritage Store', 'REGION_I', 'Ilocos Sur', 'Vigan City', 'Mestizo', 17.5748, 120.3869, 'sari-sari'),
  ('ST0031', 'San Fernando Corner', 'REGION_I', 'La Union', 'San Fernando', 'Catbangen', 16.6159, 120.3169, 'sari-sari'),

  -- Cagayan Valley (REGION_II) - 2 stores
  ('ST0032', 'Tuguegarao Junction', 'REGION_II', 'Cagayan', 'Tuguegarao City', 'Centro 1', 17.6132, 121.7270, 'convenience'),
  ('ST0033', 'Isabela Highway Store', 'REGION_II', 'Isabela', 'Ilagan', 'Centro', 17.1483, 121.8894, 'sari-sari'),

  -- MIMAROPA (REGION_IV_B) - 2 stores
  ('ST0034', 'Puerto Princesa Kiosk', 'REGION_IV_B', 'Palawan', 'Puerto Princesa', 'Barangay Valencia', 9.7392, 118.7353, 'sari-sari'),
  ('ST0035', 'Calapan Market Store', 'REGION_IV_B', 'Oriental Mindoro', 'Calapan', 'Poblacion', 13.4119, 121.1803, 'convenience'),

  -- Bicol Region (REGION_V) - 3 stores
  ('ST0036', 'Naga City Store', 'REGION_V', 'Camarines Sur', 'Naga City', 'Dinaga', 13.6218, 123.1948, 'convenience'),
  ('ST0037', 'Legazpi Corner', 'REGION_V', 'Albay', 'Legazpi City', 'Cabangan', 13.1391, 123.7437, 'sari-sari'),
  ('ST0038', 'Tabaco Highway Store', 'REGION_V', 'Albay', 'Tabaco', 'Poblacion', 13.3594, 123.7314, 'sari-sari'),

  -- Eastern Visayas (REGION_VIII) - 3 stores
  ('ST0039', 'Tacloban Plaza Store', 'REGION_VIII', 'Leyte', 'Tacloban City', 'Downtown', 11.2447, 125.0037, 'convenience'),
  ('ST0040', 'Ormoc Junction', 'REGION_VIII', 'Leyte', 'Ormoc City', 'Cogon', 11.0059, 124.6074, 'sari-sari'),
  ('ST0041', 'Samar Corner Store', 'REGION_VIII', 'Western Samar', 'Calbayog City', 'Poblacion', 12.0661, 124.6033, 'sari-sari'),

  -- Zamboanga Peninsula (REGION_IX) - 2 stores
  ('ST0042', 'Zamboanga City Store', 'REGION_IX', 'Zamboanga del Sur', 'Zamboanga City', 'Tetuan', 6.9214, 122.0790, 'convenience'),
  ('ST0043', 'Pagadian Kiosk', 'REGION_IX', 'Zamboanga del Sur', 'Pagadian City', 'Balangasan', 7.8254, 123.4352, 'sari-sari'),

  -- Northern Mindanao (REGION_X) - 3 stores
  ('ST0044', 'Cagayan de Oro Junction', 'REGION_X', 'Misamis Oriental', 'Cagayan de Oro', 'Carmen', 8.4542, 124.6319, 'convenience'),
  ('ST0045', 'Iligan Highway Store', 'REGION_X', 'Lanao del Norte', 'Iligan City', 'Poblacion', 8.2280, 124.2452, 'sari-sari'),
  ('ST0046', 'Valencia Corner', 'REGION_X', 'Bukidnon', 'Valencia', 'Poblacion', 7.9060, 125.0939, 'sari-sari'),

  -- SOCCSKSARGEN (REGION_XII) - 3 stores
  ('ST0047', 'General Santos Store', 'REGION_XII', 'South Cotabato', 'General Santos City', 'Calumpang', 6.1164, 125.1716, 'convenience'),
  ('ST0048', 'Koronadal Junction', 'REGION_XII', 'South Cotabato', 'Koronadal', 'Zone 1', 6.5008, 124.8472, 'sari-sari'),
  ('ST0049', 'Kidapawan Kiosk', 'REGION_XII', 'Cotabato', 'Kidapawan', 'Poblacion', 7.0107, 125.0893, 'sari-sari'),

  -- Caraga (REGION_XIII) - 2 stores
  ('ST0050', 'Butuan City Store', 'REGION_XIII', 'Agusan del Norte', 'Butuan City', 'Libertad', 8.9475, 125.5406, 'convenience'),
  ('ST0051', 'Surigao Corner', 'REGION_XIII', 'Surigao del Norte', 'Surigao City', 'Washington', 9.7869, 125.4906, 'sari-sari'),

  -- BARMM (Bangsamoro) - 2 stores
  ('ST0052', 'Cotabato City Store', 'BARMM', 'Maguindanao', 'Cotabato City', 'Poblacion', 7.2231, 124.2452, 'sari-sari'),
  ('ST0053', 'Marawi Kiosk', 'BARMM', 'Lanao del Sur', 'Marawi City', 'East Basak', 8.0000, 124.2917, 'sari-sari')
ON CONFLICT (store_code) DO NOTHING;

-- =============================================================================
-- TELESERYE PRODUCT CATALOG (66 SKUs total: 33 original + 33 new)
-- =============================================================================

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Generate transactions using a CTE-based approach with teleserye enhancements
WITH
stores_list AS (
  SELECT id, store_code, region_code, province, city, barangay FROM scout.stores
),
date_series AS (
  SELECT generate_series(
    CURRENT_DATE - INTERVAL '90 days',  -- Extended to 90 days for seasonal patterns
    CURRENT_DATE,
    INTERVAL '1 day'
  )::DATE AS tx_date
),
-- EXPANDED PRODUCT CATALOG (66 SKUs)
products AS (
  SELECT * FROM (VALUES
    -- BEVERAGES (Original 9 + 5 new = 14 total)
    ('Coca-Cola', 'SKU-COKE-330', 'Beverages', 'Soft Drinks', 25.00, true, true),
    ('Pepsi', 'SKU-PEPS-330', 'Beverages', 'Soft Drinks', 23.00, false, false),
    ('Sprite', 'SKU-SPRT-330', 'Beverages', 'Soft Drinks', 25.00, true, true),
    ('RC Cola', 'SKU-RCCO-330', 'Beverages', 'Soft Drinks', 18.00, false, false),
    ('Nestle Pure Life', 'SKU-NPLF-500', 'Beverages', 'Water', 15.00, false, true),
    ('Summit Water', 'SKU-SUMM-500', 'Beverages', 'Water', 12.00, false, false),
    ('C2 Green Tea', 'SKU-C2GT-500', 'Beverages', 'Tea', 25.00, false, false),
    ('Kopiko 78', 'SKU-KOP78-240', 'Beverages', 'Coffee', 30.00, false, false),
    ('Nescafe 3in1', 'SKU-NESC-25G', 'Beverages', 'Coffee', 8.00, false, true),
    -- NEW: Beer (Episode 2: Fiesta)
    ('San Miguel Pale Pilsen', 'SKU-SMPP-330', 'Beverages', 'Beer', 55.00, false, false),
    ('Red Horse', 'SKU-REHO-500', 'Beverages', 'Beer', 65.00, false, false),
    ('Colt 45', 'SKU-COL45-330', 'Beverages', 'Beer', 50.00, false, false),
    -- NEW: Juice Sachets (Episode 6: Back-to-School)
    ('Tang Juice Sachet', 'SKU-TANG-25G', 'Beverages', 'Juice', 5.00, false, false),
    ('Eight O Clock Juice', 'SKU-8OCL-25G', 'Beverages', 'Juice', 4.00, false, false),

    -- SNACKS (Original 6 + 8 new = 14 total)
    ('Oishi Prawn Crackers', 'SKU-OISH-60G', 'Snacks', 'Chips', 18.00, false, false),
    ('Piattos', 'SKU-PIAT-85G', 'Snacks', 'Chips', 28.00, false, false),
    ('Chippy', 'SKU-CHIP-110G', 'Snacks', 'Chips', 22.00, false, false),
    ('Nova', 'SKU-NOVA-78G', 'Snacks', 'Chips', 25.00, false, false),
    ('SkyFlakes', 'SKU-SKYF-250G', 'Snacks', 'Crackers', 35.00, false, false),
    ('Fita', 'SKU-FITA-300G', 'Snacks', 'Crackers', 42.00, false, false),
    -- NEW: Candy/Small Snacks (Episode 6: Back-to-School)
    ('Choc-Nut', 'SKU-CHOC-24G', 'Snacks', 'Candy', 1.00, false, false),
    ('Flat Tops', 'SKU-FLAT-6G', 'Snacks', 'Candy', 2.00, false, false),
    ('Mentos', 'SKU-MENT-38G', 'Snacks', 'Candy', 5.00, false, false),
    ('White Rabbit', 'SKU-WHIT-6G', 'Snacks', 'Candy', 3.00, false, false),
    ('Storck', 'SKU-STOR-125G', 'Snacks', 'Candy', 45.00, false, false),
    ('Boy Bawang', 'SKU-BBAW-100G', 'Snacks', 'Chips', 28.00, false, false),
    ('Clover Chips', 'SKU-CLOV-85G', 'Snacks', 'Chips', 22.00, false, false),
    ('Marty''s Crackling', 'SKU-MART-90G', 'Snacks', 'Chips', 30.00, false, false),

    -- TOBACCO (Original 5 packs + 5 new sticks = 10 total)
    -- PACKS (40% of tobacco volume)
    ('Marlboro Red', 'SKU-MARL-20S', 'Tobacco', 'Cigarettes', 165.00, false, true),
    ('Fortune', 'SKU-FORT-20S', 'Tobacco', 'Cigarettes', 85.00, false, false),
    ('Philip Morris', 'SKU-PMOR-20S', 'Tobacco', 'Cigarettes', 145.00, false, true),
    ('Mighty', 'SKU-MIGH-20S', 'Tobacco', 'Cigarettes', 75.00, false, false),
    ('Hope', 'SKU-HOPE-20S', 'Tobacco', 'Cigarettes', 55.00, false, false),
    -- NEW: STICKS (60% of tobacco volume - Episode 5: Daily Habit)
    ('Marlboro Red Stick', 'SKU-MARL-1S', 'Tobacco', 'Cigarettes', 9.00, false, true),
    ('Philip Morris Stick', 'SKU-PMOR-1S', 'Tobacco', 'Cigarettes', 8.00, false, true),
    ('Fortune Stick', 'SKU-FORT-1S', 'Tobacco', 'Cigarettes', 4.50, false, false),
    ('Mighty Stick', 'SKU-MIGH-1S', 'Tobacco', 'Cigarettes', 4.00, false, false),
    ('Hope Stick', 'SKU-HOPE-1S', 'Tobacco', 'Cigarettes', 3.50, false, false),

    -- PERSONAL CARE (Original 5 + 5 new sachets = 10 total)
    ('Safeguard Soap', 'SKU-SFGD-135G', 'Personal Care', 'Soap', 45.00, false, true),
    ('Silka Papaya', 'SKU-SILK-135G', 'Personal Care', 'Soap', 48.00, false, false),
    ('Head & Shoulders', 'SKU-HSHD-12ML', 'Personal Care', 'Shampoo', 8.00, false, true),
    ('Palmolive Shampoo', 'SKU-PALM-12ML', 'Personal Care', 'Shampoo', 7.00, false, false),
    ('Colgate Toothpaste', 'SKU-COLG-50G', 'Personal Care', 'Oral Care', 35.00, false, true),
    -- NEW: Sachets (Episode 1: Sweldo Rush)
    ('Cream Silk Sachet', 'SKU-CRSL-12ML', 'Personal Care', 'Shampoo', 8.00, false, true),
    ('Pantene Sachet', 'SKU-PANT-12ML', 'Personal Care', 'Shampoo', 9.00, false, true),
    ('Dove Shampoo Sachet', 'SKU-DOVE-12ML', 'Personal Care', 'Shampoo', 10.00, false, true),
    ('Close-Up Toothpaste', 'SKU-CLUP-10G', 'Personal Care', 'Oral Care', 5.00, false, false),
    ('Ponds Cream Sachet', 'SKU-POND-10G', 'Personal Care', 'Skin Care', 12.00, false, true),

    -- HOUSEHOLD (Original 3 + 3 new = 6 total)
    ('Surf Powder', 'SKU-SURF-80G', 'Household', 'Laundry', 12.00, false, false),
    ('Ariel Powder', 'SKU-ARIE-66G', 'Household', 'Laundry', 14.00, false, true),
    ('Joy Dishwashing', 'SKU-JOYD-250ML', 'Household', 'Cleaning', 42.00, false, true),
    -- NEW: Small Pack Detergent (Episode 1: Sweldo Rush)
    ('Tide Powder Sachet', 'SKU-TIDE-30G', 'Household', 'Laundry', 6.00, false, true),
    ('Downy Sachet', 'SKU-DOWN-18ML', 'Household', 'Fabric Conditioner', 7.00, false, false),
    ('Zonrox Bleach Sachet', 'SKU-ZONR-60ML', 'Household', 'Cleaning', 8.00, false, false),

    -- COOKING/FOOD (Original 5 + 7 new = 12 total)
    ('Lucky Me Pancit Canton', 'SKU-LKME-60G', 'Cooking', 'Instant Noodles', 14.00, false, false),
    ('Nissin Cup Noodles', 'SKU-NSSN-40G', 'Cooking', 'Instant Noodles', 25.00, false, false),
    ('Magic Sarap', 'SKU-MGSP-8G', 'Cooking', 'Seasonings', 2.00, false, false),
    ('UFC Ketchup', 'SKU-UFCK-320G', 'Cooking', 'Condiments', 45.00, false, false),
    ('Silver Swan Soy Sauce', 'SKU-SLVS-1L', 'Cooking', 'Condiments', 55.00, false, false),
    -- NEW: Instant Noodles Variety (Episode 1: Sweldo Rush)
    ('Payless Pancit Canton', 'SKU-PAYL-60G', 'Cooking', 'Instant Noodles', 11.00, false, false),
    ('Quickchow', 'SKU-QCKC-55G', 'Cooking', 'Instant Noodles', 9.00, false, false),
    ('Mang Tomas Sarsa', 'SKU-MNGT-330G', 'Cooking', 'Condiments', 38.00, false, false),
    ('Datu Puti Vinegar', 'SKU-DATP-385ML', 'Cooking', 'Condiments', 22.00, false, false),
    ('Mama Sita Mix', 'SKU-MAMA-40G', 'Cooking', 'Seasonings', 18.00, false, false),
    ('Knorr Cubes', 'SKU-KNOR-10G', 'Cooking', 'Seasonings', 3.00, false, true),
    ('Ajinomoto', 'SKU-AJIN-10G', 'Cooking', 'Seasonings', 2.50, false, false)
  ) AS t(brand_name, sku, category, subcategory, price, our_brand, tbwa_client)
),
-- EPISODE-DRIVEN TEMPORAL PATTERNS
episode_calendar AS (
  SELECT
    tx_date,
    EXTRACT(DOW FROM tx_date) AS day_of_week,
    EXTRACT(DAY FROM tx_date) AS day_of_month,
    EXTRACT(MONTH FROM tx_date) AS month_num,
    -- Episode 1: Sweldo Rush (15th and 30th = 2.5x volume)
    CASE
      WHEN EXTRACT(DAY FROM tx_date) IN (14, 15, 16, 29, 30, 31) THEN 2.5
      ELSE 1.0
    END AS sweldo_multiplier,
    -- Episode 2: Fiesta sa Barangay (June 24-30 in Visayas = 4x beverage volume)
    CASE
      WHEN EXTRACT(MONTH FROM tx_date) = 6
        AND EXTRACT(DAY FROM tx_date) BETWEEN 24 AND 30 THEN true
      ELSE false
    END AS is_fiesta_period,
    -- Episode 3: Price Increase (July 1+ tobacco excise tax)
    CASE
      WHEN tx_date >= (CURRENT_DATE - INTERVAL '90 days' + INTERVAL '30 days') THEN true
      ELSE false
    END AS tobacco_price_increase,
    -- Episode 6: Back-to-School (June 1-15 = 1.8x snacks/candy)
    CASE
      WHEN EXTRACT(MONTH FROM tx_date) = 6
        AND EXTRACT(DAY FROM tx_date) BETWEEN 1 AND 15 THEN 1.8
      ELSE 1.0
    END AS back_to_school_multiplier
  FROM date_series
),
-- REGIONAL BRAND BIAS (Episode 4: Store Competition)
regional_weights AS (
  SELECT
    region_code,
    -- RC Cola dominance in Visayas
    CASE WHEN region_code IN ('REGION_VI', 'REGION_VII', 'REGION_VIII') THEN 0.40 ELSE 0.15 END AS rc_cola_weight,
    -- Marlboro premium stronghold in NCR
    CASE WHEN region_code = 'NCR' THEN 0.35 ELSE 0.25 END AS marlboro_weight,
    -- Fortune value brand in Mindanao
    CASE WHEN region_code IN ('REGION_IX', 'REGION_X', 'REGION_XI', 'REGION_XII', 'REGION_XIII', 'BARMM') THEN 0.45 ELSE 0.30 END AS fortune_weight
  FROM (SELECT DISTINCT region_code FROM stores_list) r
),
-- Generate base transaction set with episode multipliers
tx_base AS (
  SELECT
    s.id AS store_id,
    s.store_code,
    s.region_code,
    s.province,
    s.city,
    s.barangay,
    ec.tx_date,
    ec.sweldo_multiplier,
    ec.is_fiesta_period,
    ec.tobacco_price_increase,
    ec.back_to_school_multiplier,
    -- Apply sweldo multiplier to transaction count
    generate_series(1, (30 + (random() * 70)::int * ec.sweldo_multiplier)::int) AS tx_seq
  FROM stores_list s
  CROSS JOIN episode_calendar ec
  CROSS JOIN regional_weights rw
  WHERE s.region_code = rw.region_code
),
-- Expand with random product and customer data + teleserye logic
tx_expanded AS (
  SELECT
    uuid_generate_v4() AS id,
    tb.store_id,
    tb.store_code,
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
    tb.sweldo_multiplier,
    tb.is_fiesta_period,
    tb.tobacco_price_increase,
    tb.back_to_school_multiplier,
    p.brand_name,
    p.sku,
    p.category AS product_category,
    p.subcategory AS product_subcategory,
    p.our_brand,
    p.tbwa_client AS tbwa_client_brand,
    -- Episode 5: Tobacco Daily Habit (2-3 sticks per purchase for daily smokers)
    CASE
      WHEN p.category = 'Tobacco' AND p.sku LIKE '%-1S' THEN 2 + (random() * 2)::int
      ELSE 1 + (random() * 3)::int
    END AS quantity,
    -- Episode 3: Price Increase (Marlboro ₱165 → ₱180 after July 1)
    CASE
      WHEN p.brand_name = 'Marlboro Red' AND p.sku = 'SKU-MARL-20S' AND tb.tobacco_price_increase THEN 180.00
      WHEN p.brand_name = 'Marlboro Red Stick' AND p.sku = 'SKU-MARL-1S' AND tb.tobacco_price_increase THEN 9.50
      ELSE p.price
    END AS unit_price,
    (ARRAY['cash', 'gcash', 'maya', 'card'])[1 + (random() * 3)::int]::scout.payment_method AS payment_method,
    -- Episode 5: Tobacco Daily Habit (70% have customer_id, 5-7 purchases/week)
    CASE
      WHEN p.category = 'Tobacco' AND random() < 0.70 THEN 'CUST-' || lpad((random() * 1000)::int::text, 5, '0')
      WHEN random() < 0.60 THEN 'CUST-' || lpad((random() * 10000)::int::text, 5, '0')
      ELSE NULL
    END AS customer_id,
    18 + (random() * 50)::int AS age,
    (ARRAY['M', 'F'])[1 + (random() * 1)::int] AS gender,
    (ARRAY['low', 'middle', 'high', 'unknown'])[1 + (random() * 3)::int]::scout.income_band AS income,
    (ARRAY['urban', 'rural', 'unknown'])[1 + (random() * 2)::int]::scout.urban_rural AS urban_rural,
    (ARRAY['visit', 'browse', 'request', 'accept', 'purchase'])[1 + (random() * 4)::int] AS funnel_stage,
    -- Trip Mission Segmentation (tingi vs daily vs stock-up)
    CASE
      WHEN random() < 0.50 THEN 1 + (random() * 2)::int  -- Tingi: 1-2 items (50%)
      WHEN random() < 0.80 THEN 2 + (random() * 2)::int  -- Daily: 2-3 items (30%)
      ELSE 8 + (random() * 5)::int  -- Stock-up: 8-12 items (20%)
    END AS basket_size,
    -- Episode 5: Tobacco Daily Habit (60% repeated customers for smokers)
    CASE
      WHEN p.category = 'Tobacco' THEN random() < 0.60
      ELSE random() < 0.35
    END AS repeated_customer,
    (ARRAY['branded', 'generic', 'indirect'])[1 + (random() * 2)::int] AS request_type,
    random() < 0.45 AS suggestion_accepted,
    -- Episode 7: OOS Substitution (15% baseline, 40% during fiesta)
    CASE
      WHEN tb.is_fiesta_period AND p.category = 'Beverages' THEN random() < 0.40
      ELSE random() < 0.15
    END AS substitution_occurred
  FROM tx_base tb
  CROSS JOIN LATERAL (
    -- Episode-driven product selection with regional bias
    SELECT * FROM products
    WHERE (
      -- Episode 2: Fiesta beverage spike
      (tb.is_fiesta_period AND category = 'Beverages' AND random() < 0.60)
      OR
      -- Episode 5: Tobacco stick dominance (60% sticks, 40% packs)
      (category = 'Tobacco' AND sku LIKE '%-1S' AND random() < 0.60)
      OR
      (category = 'Tobacco' AND sku LIKE '%-20S' AND random() < 0.40)
      OR
      -- Episode 6: Back-to-school candy/snacks
      (category IN ('Snacks', 'Cooking') AND random() < tb.back_to_school_multiplier * 0.35)
      OR
      -- Episode 3: Price-driven brand switching (Fortune after Marlboro price increase)
      (brand_name = 'Fortune' AND tb.tobacco_price_increase AND random() < 0.45)
      OR
      (brand_name = 'Marlboro Red' AND tb.tobacco_price_increase AND random() < 0.30)
      OR
      -- Default random selection
      random() < 0.20
    )
    ORDER BY random()
    LIMIT 1
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
  -- Episode 1, 2, 6: Promo Discounts (10-30% during sweldo, fiesta, back-to-school)
  CASE
    WHEN quantity >= 5 AND (sweldo_multiplier > 1.0 OR back_to_school_multiplier > 1.0) THEN
      (quantity * unit_price * (0.10 + random() * 0.20))::numeric(12,2)
    WHEN is_fiesta_period AND product_category = 'Beverages' AND quantity >= 3 THEN
      (quantity * unit_price * 0.15)::numeric(12,2)
    WHEN random() < 0.05 THEN
      (quantity * unit_price * 0.05)::numeric(12,2)
    ELSE 0
  END AS discount_amount,
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
  sku_count INTEGER;
  customer_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO region_count FROM scout.regions;
  SELECT COUNT(*) INTO store_count FROM scout.stores;
  SELECT COUNT(*) INTO tx_count FROM scout.transactions;
  SELECT COUNT(DISTINCT sku) INTO sku_count FROM scout.transactions;
  SELECT COUNT(DISTINCT customer_id) INTO customer_count FROM scout.transactions WHERE customer_id IS NOT NULL;

  RAISE NOTICE 'Seed complete: % regions, % stores, % transactions, % SKUs, % customers',
    region_count, store_count, tx_count, sku_count, customer_count;
END $$;
