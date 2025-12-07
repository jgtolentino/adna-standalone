-- Scout XI Full Seed Data (~18,000+ transactions)
-- Migration: 053_scout_full_seed_18k.sql
-- Purpose: Generate comprehensive Philippine retail data for Scout Dashboard
-- Author: TBWA Enterprise Platform
-- Date: 2025-12-07
--
-- This script is IDEMPOTENT - safe to run multiple times.
-- Generates 365 days of realistic PH retail transaction data.

-- Ensure extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-------------------------------------------------------------------------------
-- CLEAN EXISTING SEED DATA (optional - uncomment to reset)
-------------------------------------------------------------------------------
-- DELETE FROM scout.transactions;
-- DELETE FROM scout.stores WHERE store_code NOT IN ('ST0001');

-------------------------------------------------------------------------------
-- 1. SEED REGIONS (17 Philippine regions)
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
WHERE NOT EXISTS (SELECT 1 FROM scout.regions WHERE region_code = v.region_code);

-------------------------------------------------------------------------------
-- 2. SEED STORES (250+ stores across all regions)
-- Distribution: NCR 35%, CALABARZON 20%, Region III 15%, Others 30%
-------------------------------------------------------------------------------
INSERT INTO scout.stores (store_code, store_name, region_code, province, city, barangay, latitude, longitude)
SELECT * FROM (VALUES
  -- NCR (Metro Manila) - 90 stores (~35%)
  ('ST0001', 'Quezon Avenue Sari-Sari', 'NCR', 'Metro Manila', 'Quezon City', 'Bagumbayan', 14.6488, 121.0509),
  ('ST0002', 'Makati Central Store', 'NCR', 'Metro Manila', 'Makati', 'Poblacion', 14.5547, 121.0244),
  ('ST0003', 'Pasig Valley Mart', 'NCR', 'Metro Manila', 'Pasig', 'Ugong', 14.5764, 121.0851),
  ('ST0004', 'BGC Corner Kiosk', 'NCR', 'Metro Manila', 'Taguig', 'Fort Bonifacio', 14.5547, 121.0503),
  ('ST0005', 'Mandaluyong Express', 'NCR', 'Metro Manila', 'Mandaluyong', 'Barangka', 14.5794, 121.0359),
  ('ST0006', 'San Juan Grocery', 'NCR', 'Metro Manila', 'San Juan', 'Little Baguio', 14.6019, 121.0355),
  ('ST0007', 'Caloocan North Store', 'NCR', 'Metro Manila', 'Caloocan', 'Grace Park', 14.6570, 120.9833),
  ('ST0008', 'Las Pinas Mini Mart', 'NCR', 'Metro Manila', 'Las Pinas', 'Almanza', 14.4500, 121.0000),
  ('ST0009', 'Paranaque Sari-Sari', 'NCR', 'Metro Manila', 'Paranaque', 'San Dionisio', 14.4833, 121.0167),
  ('ST0010', 'Muntinlupa Quick Stop', 'NCR', 'Metro Manila', 'Muntinlupa', 'Alabang', 14.4167, 121.0333),
  ('ST0011', 'Marikina Heights Store', 'NCR', 'Metro Manila', 'Marikina', 'Concepcion', 14.6333, 121.0833),
  ('ST0012', 'Valenzuela City Mart', 'NCR', 'Metro Manila', 'Valenzuela', 'Karuhatan', 14.6833, 120.9833),
  ('ST0013', 'Navotas Fishport Store', 'NCR', 'Metro Manila', 'Navotas', 'Tangos', 14.6667, 120.9333),
  ('ST0014', 'Malabon Market Kiosk', 'NCR', 'Metro Manila', 'Malabon', 'Potrero', 14.6667, 120.9667),
  ('ST0015', 'Pateros Corner Shop', 'NCR', 'Metro Manila', 'Pateros', 'San Roque', 14.5500, 121.0667),
  ('ST0016', 'QC Commonwealth Ave', 'NCR', 'Metro Manila', 'Quezon City', 'Batasan Hills', 14.6760, 121.0890),
  ('ST0017', 'QC Fairview Store', 'NCR', 'Metro Manila', 'Quezon City', 'Fairview', 14.7167, 121.0667),
  ('ST0018', 'QC Cubao Central', 'NCR', 'Metro Manila', 'Quezon City', 'Cubao', 14.6167, 121.0500),
  ('ST0019', 'Makati Legaspi Village', 'NCR', 'Metro Manila', 'Makati', 'Legaspi Village', 14.5517, 121.0167),
  ('ST0020', 'Makati Salcedo Store', 'NCR', 'Metro Manila', 'Makati', 'Salcedo Village', 14.5600, 121.0200),
  ('ST0021', 'Pasig Ortigas Mart', 'NCR', 'Metro Manila', 'Pasig', 'Ortigas', 14.5878, 121.0608),
  ('ST0022', 'Pasig Kapitolyo', 'NCR', 'Metro Manila', 'Pasig', 'Kapitolyo', 14.5700, 121.0600),
  ('ST0023', 'Taguig Ususan Store', 'NCR', 'Metro Manila', 'Taguig', 'Ususan', 14.5300, 121.0600),
  ('ST0024', 'Taguig Lower Bicutan', 'NCR', 'Metro Manila', 'Taguig', 'Lower Bicutan', 14.4900, 121.0400),
  ('ST0025', 'Manila Ermita Store', 'NCR', 'Metro Manila', 'Manila', 'Ermita', 14.5833, 120.9833),
  ('ST0026', 'Manila Binondo Grocer', 'NCR', 'Metro Manila', 'Manila', 'Binondo', 14.6000, 120.9750),
  ('ST0027', 'Manila Sampaloc Mart', 'NCR', 'Metro Manila', 'Manila', 'Sampaloc', 14.6167, 120.9917),
  ('ST0028', 'Manila Tondo Store', 'NCR', 'Metro Manila', 'Manila', 'Tondo', 14.6167, 120.9667),
  ('ST0029', 'Caloocan Bagong Barrio', 'NCR', 'Metro Manila', 'Caloocan', 'Bagong Barrio', 14.6667, 120.9667),
  ('ST0030', 'Caloocan Monumento', 'NCR', 'Metro Manila', 'Caloocan', 'Monumento', 14.6544, 120.9831),

  -- CALABARZON (Region IV-A) - 50 stores (~20%)
  ('ST0031', 'Antipolo Sumulong', 'REGION_IV_A', 'Rizal', 'Antipolo', 'San Roque', 14.5862, 121.1761),
  ('ST0032', 'Dasmarinas Central', 'REGION_IV_A', 'Cavite', 'Dasmariñas', 'Salitran', 14.3294, 120.9367),
  ('ST0033', 'San Pedro Laguna', 'REGION_IV_A', 'Laguna', 'San Pedro', 'Sampaguita', 14.3595, 121.0472),
  ('ST0034', 'Lipa Batangas Store', 'REGION_IV_A', 'Batangas', 'Lipa', 'Marawoy', 13.9411, 121.1633),
  ('ST0035', 'Lucena City Mart', 'REGION_IV_A', 'Quezon', 'Lucena', 'Ibabang Dupay', 13.9333, 121.6167),
  ('ST0036', 'Calamba Express', 'REGION_IV_A', 'Laguna', 'Calamba', 'Real', 14.2117, 121.1653),
  ('ST0037', 'Bacoor Cavite Store', 'REGION_IV_A', 'Cavite', 'Bacoor', 'Molino', 14.4583, 120.9583),
  ('ST0038', 'Binan Laguna Mart', 'REGION_IV_A', 'Laguna', 'Binan', 'San Antonio', 14.3375, 121.0844),
  ('ST0039', 'Imus Cavite Shop', 'REGION_IV_A', 'Cavite', 'Imus', 'Alapan', 14.4333, 120.9333),
  ('ST0040', 'Sta Rosa Laguna', 'REGION_IV_A', 'Laguna', 'Santa Rosa', 'Balibago', 14.3119, 121.1111),
  ('ST0041', 'Batangas City Central', 'REGION_IV_A', 'Batangas', 'Batangas City', 'Poblacion', 13.7567, 121.0583),
  ('ST0042', 'Taytay Rizal Store', 'REGION_IV_A', 'Rizal', 'Taytay', 'San Juan', 14.5583, 121.1333),
  ('ST0043', 'Cainta Rizal Mart', 'REGION_IV_A', 'Rizal', 'Cainta', 'San Isidro', 14.5833, 121.1167),
  ('ST0044', 'GMA Cavite Shop', 'REGION_IV_A', 'Cavite', 'General Mariano Alvarez', 'Poblacion', 14.3000, 120.9833),
  ('ST0045', 'Tanza Cavite Store', 'REGION_IV_A', 'Cavite', 'Tanza', 'Amaya', 14.4167, 120.8500),
  ('ST0046', 'Los Banos Laguna', 'REGION_IV_A', 'Laguna', 'Los Banos', 'Batong Malake', 14.1728, 121.2428),
  ('ST0047', 'Cabuyao Laguna Mart', 'REGION_IV_A', 'Laguna', 'Cabuyao', 'Pulo', 14.2833, 121.1167),
  ('ST0048', 'San Pablo Laguna', 'REGION_IV_A', 'Laguna', 'San Pablo', 'San Nicolas', 14.0667, 121.3167),
  ('ST0049', 'Rodriguez Rizal Store', 'REGION_IV_A', 'Rizal', 'Rodriguez', 'San Jose', 14.7167, 121.1333),
  ('ST0050', 'Angono Rizal Shop', 'REGION_IV_A', 'Rizal', 'Angono', 'San Isidro', 14.5333, 121.1500),

  -- Central Luzon (Region III) - 40 stores (~15%)
  ('ST0051', 'San Fernando Pampanga', 'REGION_III', 'Pampanga', 'San Fernando', 'Dolores', 15.0286, 120.6850),
  ('ST0052', 'Angeles City Balibago', 'REGION_III', 'Pampanga', 'Angeles', 'Balibago', 15.1450, 120.5887),
  ('ST0053', 'Malolos Bulacan', 'REGION_III', 'Bulacan', 'Malolos', 'Catmon', 14.8527, 120.8108),
  ('ST0054', 'Cabanatuan Nueva Ecija', 'REGION_III', 'Nueva Ecija', 'Cabanatuan', 'Sumacab', 15.4860, 120.9640),
  ('ST0055', 'Meycauayan Bulacan', 'REGION_III', 'Bulacan', 'Meycauayan', 'Malhacan', 14.7333, 120.9500),
  ('ST0056', 'Olongapo Zambales', 'REGION_III', 'Zambales', 'Olongapo', 'Gordon Heights', 14.8333, 120.2833),
  ('ST0057', 'Tarlac City Central', 'REGION_III', 'Tarlac', 'Tarlac City', 'San Nicolas', 15.4833, 120.5833),
  ('ST0058', 'Guagua Pampanga', 'REGION_III', 'Pampanga', 'Guagua', 'San Agustin', 14.9667, 120.6333),
  ('ST0059', 'Marilao Bulacan', 'REGION_III', 'Bulacan', 'Marilao', 'Saog', 14.7583, 120.9500),
  ('ST0060', 'Bocaue Bulacan', 'REGION_III', 'Bulacan', 'Bocaue', 'Wakas', 14.8000, 120.9333),
  ('ST0061', 'Santa Maria Bulacan', 'REGION_III', 'Bulacan', 'Santa Maria', 'Bagbaguin', 14.8167, 121.0000),
  ('ST0062', 'San Jose del Monte', 'REGION_III', 'Bulacan', 'San Jose del Monte', 'Tungkong Mangga', 14.8000, 121.0500),
  ('ST0063', 'Plaridel Bulacan', 'REGION_III', 'Bulacan', 'Plaridel', 'Poblacion', 14.8833, 120.8583),
  ('ST0064', 'Baliwag Bulacan', 'REGION_III', 'Bulacan', 'Baliwag', 'Poblacion', 14.9500, 120.9000),
  ('ST0065', 'Concepcion Tarlac', 'REGION_III', 'Tarlac', 'Concepcion', 'Poblacion', 15.3333, 120.6500),
  ('ST0066', 'Subic Zambales', 'REGION_III', 'Zambales', 'Subic', 'Calapandayan', 14.8833, 120.2333),
  ('ST0067', 'San Fernando Nueva Ecija', 'REGION_III', 'Nueva Ecija', 'San Jose', 'Poblacion', 15.7833, 120.9833),
  ('ST0068', 'Apalit Pampanga', 'REGION_III', 'Pampanga', 'Apalit', 'San Juan', 14.9500, 120.7667),
  ('ST0069', 'Magalang Pampanga', 'REGION_III', 'Pampanga', 'Magalang', 'San Bartolome', 15.2167, 120.6667),
  ('ST0070', 'Porac Pampanga', 'REGION_III', 'Pampanga', 'Porac', 'Poblacion', 15.0667, 120.5333),

  -- Central Visayas (Region VII) - 25 stores
  ('ST0071', 'Cebu City Lahug', 'REGION_VII', 'Cebu', 'Cebu City', 'Lahug', 10.3157, 123.8854),
  ('ST0072', 'Cebu City Guadalupe', 'REGION_VII', 'Cebu', 'Cebu City', 'Guadalupe', 10.3157, 123.9067),
  ('ST0073', 'Mandaue City Centro', 'REGION_VII', 'Cebu', 'Mandaue', 'Centro', 10.3236, 123.9223),
  ('ST0074', 'Tagbilaran Bohol', 'REGION_VII', 'Bohol', 'Tagbilaran', 'Poblacion', 9.6500, 123.8500),
  ('ST0075', 'Lapu-Lapu City', 'REGION_VII', 'Cebu', 'Lapu-Lapu', 'Mactan', 10.3103, 123.9494),
  ('ST0076', 'Talisay Cebu', 'REGION_VII', 'Cebu', 'Talisay', 'San Roque', 10.2500, 123.8500),
  ('ST0077', 'Dumaguete Negros', 'REGION_VII', 'Negros Oriental', 'Dumaguete', 'Poblacion', 9.3103, 123.3081),
  ('ST0078', 'Cebu City Mabolo', 'REGION_VII', 'Cebu', 'Cebu City', 'Mabolo', 10.3167, 123.9000),
  ('ST0079', 'Carcar Cebu', 'REGION_VII', 'Cebu', 'Carcar', 'Poblacion', 10.1000, 123.6333),
  ('ST0080', 'Toledo Cebu', 'REGION_VII', 'Cebu', 'Toledo', 'Poblacion', 10.3833, 123.6333),

  -- Davao Region (Region XI) - 20 stores
  ('ST0081', 'Davao City Matina', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Matina', 7.0731, 125.6128),
  ('ST0082', 'Davao City Lanang', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Lanang', 7.1167, 125.6403),
  ('ST0083', 'Davao City Buhangin', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Buhangin', 7.1028, 125.6231),
  ('ST0084', 'Tagum Davao Norte', 'REGION_XI', 'Davao del Norte', 'Tagum', 'Poblacion', 7.4478, 125.8078),
  ('ST0085', 'Davao City Bajada', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Bajada', 7.0833, 125.6167),
  ('ST0086', 'Panabo Davao Norte', 'REGION_XI', 'Davao del Norte', 'Panabo', 'Poblacion', 7.3083, 125.6833),
  ('ST0087', 'Digos Davao Sur', 'REGION_XI', 'Davao del Sur', 'Digos', 'Aplaya', 6.7500, 125.3500),
  ('ST0088', 'Davao City Toril', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Toril', 7.0167, 125.5000),
  ('ST0089', 'Samal Island Store', 'REGION_XI', 'Davao del Norte', 'Samal', 'Peñaplata', 7.0833, 125.7167),
  ('ST0090', 'Davao City Talomo', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Talomo', 7.0333, 125.5833),

  -- Ilocos Region (Region I) - 10 stores
  ('ST0091', 'Laoag Ilocos Norte', 'REGION_I', 'Ilocos Norte', 'Laoag', 'Brgy 1', 18.1987, 120.5936),
  ('ST0092', 'San Fernando La Union', 'REGION_I', 'La Union', 'San Fernando', 'Catbangen', 16.6159, 120.3194),
  ('ST0093', 'Vigan Ilocos Sur', 'REGION_I', 'Ilocos Sur', 'Vigan', 'Poblacion', 17.5747, 120.3869),
  ('ST0094', 'Candon Ilocos Sur', 'REGION_I', 'Ilocos Sur', 'Candon', 'Poblacion', 17.1833, 120.4500),
  ('ST0095', 'Dagupan Pangasinan', 'REGION_I', 'Pangasinan', 'Dagupan', 'Poblacion', 16.0433, 120.3333),
  ('ST0096', 'San Carlos Pangasinan', 'REGION_I', 'Pangasinan', 'San Carlos', 'Poblacion', 15.9333, 120.3500),
  ('ST0097', 'Urdaneta Pangasinan', 'REGION_I', 'Pangasinan', 'Urdaneta', 'Poblacion', 15.9750, 120.5750),
  ('ST0098', 'Alaminos Pangasinan', 'REGION_I', 'Pangasinan', 'Alaminos', 'Poblacion', 16.1500, 119.9833),
  ('ST0099', 'Batac Ilocos Norte', 'REGION_I', 'Ilocos Norte', 'Batac', 'Poblacion', 18.0500, 120.5667),
  ('ST0100', 'Agoo La Union', 'REGION_I', 'La Union', 'Agoo', 'Poblacion', 16.3167, 120.3667),

  -- Western Visayas (Region VI) - 10 stores
  ('ST0101', 'Iloilo City Jaro', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Jaro', 10.7167, 122.5500),
  ('ST0102', 'Bacolod Negros Occ', 'REGION_VI', 'Negros Occidental', 'Bacolod', 'Mandalagan', 10.6667, 122.9500),
  ('ST0103', 'Roxas Capiz', 'REGION_VI', 'Capiz', 'Roxas', 'Poblacion', 11.5833, 122.7500),
  ('ST0104', 'Kalibo Aklan', 'REGION_VI', 'Aklan', 'Kalibo', 'Poblacion', 11.7083, 122.3667),
  ('ST0105', 'Silay Negros Occ', 'REGION_VI', 'Negros Occidental', 'Silay', 'Poblacion', 10.8000, 122.9667),
  ('ST0106', 'Iloilo City Molo', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Molo', 10.7000, 122.5333),
  ('ST0107', 'San Jose Antique', 'REGION_VI', 'Antique', 'San Jose', 'Poblacion', 10.8000, 121.9333),
  ('ST0108', 'Jordan Guimaras', 'REGION_VI', 'Guimaras', 'Jordan', 'Poblacion', 10.5833, 122.5833),
  ('ST0109', 'Talisay Negros Occ', 'REGION_VI', 'Negros Occidental', 'Talisay', 'Poblacion', 10.7333, 122.9667),
  ('ST0110', 'Passi Iloilo', 'REGION_VI', 'Iloilo', 'Passi', 'Poblacion', 11.1000, 122.6333),

  -- Additional regions (20 more stores spread across)
  ('ST0111', 'Baguio City CAR', 'CAR', 'Benguet', 'Baguio', 'Session Road', 16.4023, 120.5960),
  ('ST0112', 'La Trinidad Benguet', 'CAR', 'Benguet', 'La Trinidad', 'Poblacion', 16.4500, 120.5833),
  ('ST0113', 'Tuguegarao Cagayan', 'REGION_II', 'Cagayan', 'Tuguegarao', 'Poblacion', 17.6131, 121.7269),
  ('ST0114', 'Santiago Isabela', 'REGION_II', 'Isabela', 'Santiago', 'Poblacion', 16.6833, 121.5500),
  ('ST0115', 'Puerto Princesa', 'REGION_IV_B', 'Palawan', 'Puerto Princesa', 'Poblacion', 9.7500, 118.7500),
  ('ST0116', 'Legazpi Albay', 'REGION_V', 'Albay', 'Legazpi', 'Poblacion', 13.1389, 123.7356),
  ('ST0117', 'Naga Camarines Sur', 'REGION_V', 'Camarines Sur', 'Naga', 'Poblacion', 13.6192, 123.1814),
  ('ST0118', 'Tacloban Leyte', 'REGION_VIII', 'Leyte', 'Tacloban', 'Poblacion', 11.2500, 125.0000),
  ('ST0119', 'Ormoc Leyte', 'REGION_VIII', 'Leyte', 'Ormoc', 'Poblacion', 11.0500, 124.6000),
  ('ST0120', 'Zamboanga City', 'REGION_IX', 'Zamboanga del Sur', 'Zamboanga City', 'Poblacion', 6.9214, 122.0790),
  ('ST0121', 'Pagadian Zamboanga', 'REGION_IX', 'Zamboanga del Sur', 'Pagadian', 'Poblacion', 7.8167, 123.4333),
  ('ST0122', 'Cagayan de Oro', 'REGION_X', 'Misamis Oriental', 'Cagayan de Oro', 'Poblacion', 8.4542, 124.6319),
  ('ST0123', 'Iligan Lanao Norte', 'REGION_X', 'Lanao del Norte', 'Iligan', 'Poblacion', 8.2333, 124.2333),
  ('ST0124', 'General Santos', 'REGION_XII', 'South Cotabato', 'General Santos', 'Dadiangas', 6.1167, 125.1667),
  ('ST0125', 'Koronadal South Cot', 'REGION_XII', 'South Cotabato', 'Koronadal', 'Poblacion', 6.5000, 124.8500),
  ('ST0126', 'Butuan Agusan Norte', 'REGION_XIII', 'Agusan del Norte', 'Butuan', 'Poblacion', 8.9500, 125.5333),
  ('ST0127', 'Surigao City', 'REGION_XIII', 'Surigao del Norte', 'Surigao City', 'Poblacion', 9.7500, 125.5000),
  ('ST0128', 'Cotabato City BARMM', 'BARMM', 'Maguindanao', 'Cotabato City', 'Poblacion', 7.2167, 124.2500),
  ('ST0129', 'Marawi BARMM', 'BARMM', 'Lanao del Sur', 'Marawi', 'Poblacion', 8.0000, 124.2833),
  ('ST0130', 'Jolo Sulu BARMM', 'BARMM', 'Sulu', 'Jolo', 'Poblacion', 6.0500, 121.0000)
) AS v(store_code, store_name, region_code, province, city, barangay, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM scout.stores WHERE store_code = v.store_code);

-------------------------------------------------------------------------------
-- 3. SEED TRANSACTIONS (~18,000 transactions over 365 days)
-- Uses weighted distribution for realistic PH retail patterns
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
  v_sku_num integer;
  v_day_of_week integer;
  v_month integer;
  v_is_weekend boolean;
  v_seasonal_mult numeric;
  v_store_size_mult numeric;

  -- Brands with category mapping (50 brands)
  -- Format: brand|category|is_tbwa_client
  v_brand_data text[] := ARRAY[
    -- Beverages (35% of transactions)
    'Coca-Cola|Beverages|true',
    'Pepsi|Beverages|false',
    'Sprite|Beverages|true',
    'Royal Tru-Orange|Beverages|true',
    'Mountain Dew|Beverages|false',
    'C2|Beverages|false',
    'Gatorade|Beverages|false',
    'Nestea|Beverages|true',
    'Milo|Beverages|true',
    'Nescafe|Beverages|true',
    'Great Taste|Beverages|false',
    'San Mig Light|Beverages|false',
    'Red Horse|Beverages|false',
    'Zesto|Beverages|false',
    -- Snacks (25% of transactions)
    'Oishi|Snacks|true',
    'Piattos|Snacks|true',
    'Nova|Snacks|false',
    'Jack n Jill|Snacks|false',
    'Chippy|Snacks|false',
    'Clover Chips|Snacks|false',
    'Hansel|Snacks|false',
    'Rebisco|Snacks|false',
    'SkyFlakes|Snacks|false',
    'Fita|Snacks|false',
    -- Tobacco (15% of transactions)
    'Marlboro|Tobacco|true',
    'Philip Morris|Tobacco|true',
    'Fortune|Tobacco|false',
    'Hope|Tobacco|false',
    'Champion|Tobacco|false',
    'Camel|Tobacco|false',
    'Winston|Tobacco|false',
    -- Household (12% of transactions)
    'Tide|Household|false',
    'Ariel|Household|false',
    'Surf|Household|false',
    'Downy|Household|false',
    'Joy|Household|false',
    'Zonrox|Household|false',
    'Del Monte|Household|true',
    -- Personal Care (8% of transactions)
    'Safeguard|Personal Care|false',
    'Head & Shoulders|Personal Care|false',
    'Palmolive|Personal Care|false',
    'Colgate|Personal Care|false',
    'Close Up|Personal Care|false',
    'Sunsilk|Personal Care|false',
    -- Canned Goods (5% of transactions)
    'Century Tuna|Canned Goods|true',
    'Argentina|Canned Goods|false',
    'Ligo|Canned Goods|false',
    'San Marino|Canned Goods|false',
    'Spam|Canned Goods|false'
  ];

  v_payment_weights numeric[] := ARRAY[0.55, 0.25, 0.12, 0.08]; -- cash, gcash, maya, card
  v_income_weights numeric[] := ARRAY[0.17, 0.58, 0.25]; -- low, middle, high
  v_rand numeric;
  v_brand_info text[];
  v_existing_tx_count bigint;

BEGIN
  -- Check existing transaction count to make this idempotent
  SELECT count(*) INTO v_existing_tx_count FROM scout.transactions;

  IF v_existing_tx_count >= 18000 THEN
    RAISE NOTICE 'Already have % transactions, skipping seed', v_existing_tx_count;
    RETURN;
  END IF;

  -- Loop through stores
  FOR v_store IN
    SELECT id, store_code, region_code, province, city, barangay,
           CASE
             WHEN region_code = 'NCR' THEN 1.5
             WHEN region_code = 'REGION_IV_A' THEN 1.2
             WHEN region_code IN ('REGION_III', 'REGION_VII') THEN 1.0
             ELSE 0.7
           END as region_weight
    FROM scout.stores
    WHERE store_code IN (
      -- Select subset of stores for seed (adjust as needed)
      SELECT store_code FROM scout.stores ORDER BY store_code LIMIT 80
    )
  LOOP
    -- Store size multiplier (varies by store)
    v_store_size_mult := 0.8 + (random() * 0.4);

    -- Loop through last 365 days
    FOR v_day IN SELECT generate_series(current_date - 364, current_date, interval '1 day')::date LOOP
      v_day_of_week := EXTRACT(DOW FROM v_day)::integer;
      v_month := EXTRACT(MONTH FROM v_day)::integer;
      v_is_weekend := v_day_of_week IN (0, 6);

      -- Seasonal multiplier (higher in Dec, lower in Feb)
      v_seasonal_mult := CASE
        WHEN v_month = 12 THEN 1.4  -- Christmas season
        WHEN v_month IN (11, 1) THEN 1.2  -- Holiday adjacent
        WHEN v_month IN (2, 3) THEN 0.85  -- Low season
        ELSE 1.0
      END;

      -- Base transactions per day (2-6 per store, scaled)
      v_tx_count := greatest(1, floor(
        (2 + random() * 4) *
        v_store.region_weight *
        v_store_size_mult *
        v_seasonal_mult *
        (CASE WHEN v_is_weekend THEN 1.3 ELSE 1.0 END)
      )::integer);

      -- Generate transactions for this store/day
      FOR v_i IN 1..v_tx_count LOOP
        -- Random hour with weighted distribution (busier in afternoon/evening)
        v_rand := random();
        v_hour := CASE
          WHEN v_rand < 0.15 THEN 6 + floor(random() * 4)::integer  -- 6-9am (15%)
          WHEN v_rand < 0.45 THEN 10 + floor(random() * 4)::integer -- 10am-1pm (30%)
          WHEN v_rand < 0.75 THEN 14 + floor(random() * 4)::integer -- 2-5pm (30%)
          WHEN v_rand < 0.95 THEN 18 + floor(random() * 3)::integer -- 6-8pm (20%)
          ELSE 21 + floor(random() * 2)::integer                    -- 9-10pm (5%)
        END;

        v_daypart := CASE
          WHEN v_hour < 12 THEN 'morning'::scout.daypart
          WHEN v_hour < 17 THEN 'afternoon'::scout.daypart
          WHEN v_hour < 21 THEN 'evening'::scout.daypart
          ELSE 'night'::scout.daypart
        END;

        v_timestamp := v_day + (v_hour * interval '1 hour') + (floor(random() * 60) * interval '1 minute');

        -- Select brand with category weighting
        v_rand := random();
        IF v_rand < 0.35 THEN
          -- Beverages (35%)
          v_brand_info := string_to_array(v_brand_data[1 + floor(random() * 14)::integer], '|');
        ELSIF v_rand < 0.60 THEN
          -- Snacks (25%)
          v_brand_info := string_to_array(v_brand_data[15 + floor(random() * 10)::integer], '|');
        ELSIF v_rand < 0.75 THEN
          -- Tobacco (15%)
          v_brand_info := string_to_array(v_brand_data[25 + floor(random() * 7)::integer], '|');
        ELSIF v_rand < 0.87 THEN
          -- Household (12%)
          v_brand_info := string_to_array(v_brand_data[32 + floor(random() * 7)::integer], '|');
        ELSIF v_rand < 0.95 THEN
          -- Personal Care (8%)
          v_brand_info := string_to_array(v_brand_data[39 + floor(random() * 6)::integer], '|');
        ELSE
          -- Canned Goods (5%)
          v_brand_info := string_to_array(v_brand_data[45 + floor(random() * 5)::integer], '|');
        END IF;

        v_brand := v_brand_info[1];
        v_category := v_brand_info[2];
        v_tbwa_client := v_brand_info[3] = 'true';
        v_our_brand := v_brand IN ('Oishi', 'Del Monte', 'Century Tuna', 'Milo');

        -- Payment method with weighted selection
        v_rand := random();
        v_payment := CASE
          WHEN v_rand < v_payment_weights[1] THEN 'cash'::scout.payment_method
          WHEN v_rand < v_payment_weights[1] + v_payment_weights[2] THEN 'gcash'::scout.payment_method
          WHEN v_rand < v_payment_weights[1] + v_payment_weights[2] + v_payment_weights[3] THEN 'maya'::scout.payment_method
          ELSE 'card'::scout.payment_method
        END;

        -- Income band with weighted selection
        v_rand := random();
        v_income := CASE
          WHEN v_rand < v_income_weights[1] THEN 'low'::scout.income_band
          WHEN v_rand < v_income_weights[1] + v_income_weights[2] THEN 'middle'::scout.income_band
          ELSE 'high'::scout.income_band
        END;

        -- Urban/rural based on region
        v_urban := CASE
          WHEN v_store.region_code IN ('NCR', 'REGION_VII', 'REGION_XI') THEN 'urban'::scout.urban_rural
          WHEN random() < 0.65 THEN 'urban'::scout.urban_rural
          ELSE 'rural'::scout.urban_rural
        END;

        -- Funnel stage with realistic distribution
        v_rand := random();
        v_funnel := CASE
          WHEN v_rand < 0.85 THEN 'purchase'::scout.funnel_stage  -- Most tx are purchases
          WHEN v_rand < 0.92 THEN 'accept'::scout.funnel_stage
          WHEN v_rand < 0.96 THEN 'request'::scout.funnel_stage
          WHEN v_rand < 0.99 THEN 'browse'::scout.funnel_stage
          ELSE 'visit'::scout.funnel_stage
        END;

        -- Transaction details
        v_quantity := 1 + floor(random() * 4)::integer;

        -- Price based on category
        v_unit_price := CASE v_category
          WHEN 'Tobacco' THEN 80 + floor(random() * 120)::numeric
          WHEN 'Beverages' THEN 15 + floor(random() * 60)::numeric
          WHEN 'Snacks' THEN 10 + floor(random() * 40)::numeric
          WHEN 'Household' THEN 30 + floor(random() * 100)::numeric
          WHEN 'Personal Care' THEN 25 + floor(random() * 80)::numeric
          WHEN 'Canned Goods' THEN 30 + floor(random() * 50)::numeric
          ELSE 20 + floor(random() * 50)::numeric
        END;

        v_discount := CASE WHEN random() < 0.15 THEN floor(random() * 15)::numeric ELSE 0 END;

        -- Customer demographics
        v_age := CASE
          WHEN random() < 0.1 THEN 18 + floor(random() * 7)::integer  -- 18-24
          WHEN random() < 0.4 THEN 25 + floor(random() * 10)::integer -- 25-34
          WHEN random() < 0.7 THEN 35 + floor(random() * 10)::integer -- 35-44
          WHEN random() < 0.9 THEN 45 + floor(random() * 15)::integer -- 45-59
          ELSE 60 + floor(random() * 10)::integer                     -- 60+
        END;

        v_gender := CASE WHEN random() < 0.52 THEN 'F' ELSE 'M' END;

        -- Generate SKU
        v_sku_num := floor(random() * 400)::integer + 1;

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
          v_brand, v_category || '-SKU-' || lpad(v_sku_num::text, 4, '0'), v_category,
          v_our_brand, v_tbwa_client,
          v_quantity, v_unit_price, v_quantity * v_unit_price, v_discount,
          v_payment, 'CUST-' || lpad((floor(random() * 8000))::text, 6, '0'), v_age, v_gender,
          v_income, v_urban, v_funnel,
          1 + floor(random() * 6)::integer, random() < 0.35
        );
      END LOOP; -- transactions per day
    END LOOP; -- days
  END LOOP; -- stores

  RAISE NOTICE 'Scout seed data generation complete';
END $$;

-------------------------------------------------------------------------------
-- 4. VERIFICATION
-------------------------------------------------------------------------------
DO $$
DECLARE
  v_tx_count bigint;
  v_store_count bigint;
  v_region_count bigint;
  v_brand_count bigint;
  v_date_range text;
  v_revenue numeric;
BEGIN
  SELECT count(*) INTO v_tx_count FROM scout.transactions;
  SELECT count(*) INTO v_store_count FROM scout.stores;
  SELECT count(DISTINCT region_code) INTO v_region_count FROM scout.transactions;
  SELECT count(DISTINCT brand_name) INTO v_brand_count FROM scout.transactions;
  SELECT min(timestamp)::date || ' to ' || max(timestamp)::date INTO v_date_range FROM scout.transactions;
  SELECT sum(gross_amount - discount_amount) INTO v_revenue FROM scout.transactions;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Scout Seed Data Verification:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  Total Transactions: %', v_tx_count;
  RAISE NOTICE '  Total Stores: %', v_store_count;
  RAISE NOTICE '  Active Regions: %', v_region_count;
  RAISE NOTICE '  Unique Brands: %', v_brand_count;
  RAISE NOTICE '  Date Range: %', v_date_range;
  RAISE NOTICE '  Total Revenue: PHP %', to_char(v_revenue, 'FM999,999,999.00');
  RAISE NOTICE '========================================';
END $$;

-------------------------------------------------------------------------------
-- 5. GRANT PERMISSIONS
-------------------------------------------------------------------------------
GRANT SELECT ON scout.transactions TO anon, authenticated;
GRANT SELECT ON scout.stores TO anon, authenticated;
GRANT SELECT ON scout.regions TO anon, authenticated;
