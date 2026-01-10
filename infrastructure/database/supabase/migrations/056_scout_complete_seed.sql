-- Scout Dashboard Complete Seed Migration
-- Migration: 056_scout_complete_seed.sql
-- Purpose: Complete schema setup and seed data for Scout Dashboard (18,000+ transactions)
-- Author: TBWA Enterprise Platform
-- Date: 2026-01-09
--
-- This script is IDEMPOTENT - safe to run multiple times.
-- Generates 365 days of realistic Philippine retail transaction data.

-- =============================================================================
-- SCHEMA SETUP
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS scout;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- ENUMS (Create if not exist)
-- =============================================================================

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

-- =============================================================================
-- REGIONS TABLE (17 Philippine administrative regions)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scout.regions (
  region_code TEXT PRIMARY KEY,
  region_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert all 17 Philippine regions
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

-- =============================================================================
-- STORES TABLE (250+ retail outlets across Philippines)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scout.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_code TEXT NOT NULL UNIQUE,
  store_name TEXT NOT NULL,
  region_code TEXT NOT NULL REFERENCES scout.regions(region_code),
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  barangay TEXT NOT NULL,
  latitude NUMERIC(10, 6),
  longitude NUMERIC(10, 6),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scout_stores_region ON scout.stores(region_code);
CREATE INDEX IF NOT EXISTS idx_scout_stores_active ON scout.stores(is_active) WHERE is_active = true;

-- Insert stores (130 stores across all 17 regions)
INSERT INTO scout.stores (store_code, store_name, region_code, province, city, barangay, latitude, longitude)
SELECT * FROM (VALUES
  -- NCR (Metro Manila) - 30 stores (~23%)
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

  -- CALABARZON (Region IV-A) - 25 stores (~19%)
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
  ('ST0051', 'Tagaytay Cavite', 'REGION_IV_A', 'Cavite', 'Tagaytay', 'Mahogany', 14.1000, 120.9333),
  ('ST0052', 'Carmona Cavite', 'REGION_IV_A', 'Cavite', 'Carmona', 'Poblacion', 14.3167, 121.0500),
  ('ST0053', 'Silang Cavite', 'REGION_IV_A', 'Cavite', 'Silang', 'Poblacion', 14.2333, 120.9833),
  ('ST0054', 'Tanay Rizal', 'REGION_IV_A', 'Rizal', 'Tanay', 'Poblacion', 14.4833, 121.2833),
  ('ST0055', 'Tayabas Quezon', 'REGION_IV_A', 'Quezon', 'Tayabas', 'Poblacion', 14.0333, 121.5833),

  -- Central Luzon (Region III) - 20 stores (~15%)
  ('ST0056', 'San Fernando Pampanga', 'REGION_III', 'Pampanga', 'San Fernando', 'Dolores', 15.0286, 120.6850),
  ('ST0057', 'Angeles City Balibago', 'REGION_III', 'Pampanga', 'Angeles', 'Balibago', 15.1450, 120.5887),
  ('ST0058', 'Malolos Bulacan', 'REGION_III', 'Bulacan', 'Malolos', 'Catmon', 14.8527, 120.8108),
  ('ST0059', 'Cabanatuan Nueva Ecija', 'REGION_III', 'Nueva Ecija', 'Cabanatuan', 'Sumacab', 15.4860, 120.9640),
  ('ST0060', 'Meycauayan Bulacan', 'REGION_III', 'Bulacan', 'Meycauayan', 'Malhacan', 14.7333, 120.9500),
  ('ST0061', 'Olongapo Zambales', 'REGION_III', 'Zambales', 'Olongapo', 'Gordon Heights', 14.8333, 120.2833),
  ('ST0062', 'Tarlac City Central', 'REGION_III', 'Tarlac', 'Tarlac City', 'San Nicolas', 15.4833, 120.5833),
  ('ST0063', 'Guagua Pampanga', 'REGION_III', 'Pampanga', 'Guagua', 'San Agustin', 14.9667, 120.6333),
  ('ST0064', 'Marilao Bulacan', 'REGION_III', 'Bulacan', 'Marilao', 'Saog', 14.7583, 120.9500),
  ('ST0065', 'Bocaue Bulacan', 'REGION_III', 'Bulacan', 'Bocaue', 'Wakas', 14.8000, 120.9333),
  ('ST0066', 'Santa Maria Bulacan', 'REGION_III', 'Bulacan', 'Santa Maria', 'Bagbaguin', 14.8167, 121.0000),
  ('ST0067', 'San Jose del Monte', 'REGION_III', 'Bulacan', 'San Jose del Monte', 'Tungkong Mangga', 14.8000, 121.0500),
  ('ST0068', 'Plaridel Bulacan', 'REGION_III', 'Bulacan', 'Plaridel', 'Poblacion', 14.8833, 120.8583),
  ('ST0069', 'Baliwag Bulacan', 'REGION_III', 'Bulacan', 'Baliwag', 'Poblacion', 14.9500, 120.9000),
  ('ST0070', 'Concepcion Tarlac', 'REGION_III', 'Tarlac', 'Concepcion', 'Poblacion', 15.3333, 120.6500),
  ('ST0071', 'Subic Zambales', 'REGION_III', 'Zambales', 'Subic', 'Calapandayan', 14.8833, 120.2333),
  ('ST0072', 'San Jose Nueva Ecija', 'REGION_III', 'Nueva Ecija', 'San Jose', 'Poblacion', 15.7833, 120.9833),
  ('ST0073', 'Apalit Pampanga', 'REGION_III', 'Pampanga', 'Apalit', 'San Juan', 14.9500, 120.7667),
  ('ST0074', 'Magalang Pampanga', 'REGION_III', 'Pampanga', 'Magalang', 'San Bartolome', 15.2167, 120.6667),
  ('ST0075', 'Porac Pampanga', 'REGION_III', 'Pampanga', 'Porac', 'Poblacion', 15.0667, 120.5333),

  -- Central Visayas (Region VII) - 15 stores
  ('ST0076', 'Cebu City Lahug', 'REGION_VII', 'Cebu', 'Cebu City', 'Lahug', 10.3157, 123.8854),
  ('ST0077', 'Cebu City Guadalupe', 'REGION_VII', 'Cebu', 'Cebu City', 'Guadalupe', 10.3157, 123.9067),
  ('ST0078', 'Mandaue City Centro', 'REGION_VII', 'Cebu', 'Mandaue', 'Centro', 10.3236, 123.9223),
  ('ST0079', 'Tagbilaran Bohol', 'REGION_VII', 'Bohol', 'Tagbilaran', 'Poblacion', 9.6500, 123.8500),
  ('ST0080', 'Lapu-Lapu City', 'REGION_VII', 'Cebu', 'Lapu-Lapu', 'Mactan', 10.3103, 123.9494),
  ('ST0081', 'Talisay Cebu', 'REGION_VII', 'Cebu', 'Talisay', 'San Roque', 10.2500, 123.8500),
  ('ST0082', 'Dumaguete Negros', 'REGION_VII', 'Negros Oriental', 'Dumaguete', 'Poblacion', 9.3103, 123.3081),
  ('ST0083', 'Cebu City Mabolo', 'REGION_VII', 'Cebu', 'Cebu City', 'Mabolo', 10.3167, 123.9000),
  ('ST0084', 'Carcar Cebu', 'REGION_VII', 'Cebu', 'Carcar', 'Poblacion', 10.1000, 123.6333),
  ('ST0085', 'Toledo Cebu', 'REGION_VII', 'Cebu', 'Toledo', 'Poblacion', 10.3833, 123.6333),
  ('ST0086', 'Danao Cebu', 'REGION_VII', 'Cebu', 'Danao', 'Poblacion', 10.5333, 124.0167),
  ('ST0087', 'Naga Cebu', 'REGION_VII', 'Cebu', 'Naga', 'Poblacion', 10.2167, 123.7667),
  ('ST0088', 'Minglanilla Cebu', 'REGION_VII', 'Cebu', 'Minglanilla', 'Poblacion', 10.2333, 123.8000),
  ('ST0089', 'Consolacion Cebu', 'REGION_VII', 'Cebu', 'Consolacion', 'Poblacion', 10.3833, 123.9500),
  ('ST0090', 'Liloan Cebu', 'REGION_VII', 'Cebu', 'Liloan', 'Poblacion', 10.4000, 123.9833),

  -- Davao Region (Region XI) - 12 stores
  ('ST0091', 'Davao City Matina', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Matina', 7.0731, 125.6128),
  ('ST0092', 'Davao City Lanang', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Lanang', 7.1167, 125.6403),
  ('ST0093', 'Davao City Buhangin', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Buhangin', 7.1028, 125.6231),
  ('ST0094', 'Tagum Davao Norte', 'REGION_XI', 'Davao del Norte', 'Tagum', 'Poblacion', 7.4478, 125.8078),
  ('ST0095', 'Davao City Bajada', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Bajada', 7.0833, 125.6167),
  ('ST0096', 'Panabo Davao Norte', 'REGION_XI', 'Davao del Norte', 'Panabo', 'Poblacion', 7.3083, 125.6833),
  ('ST0097', 'Digos Davao Sur', 'REGION_XI', 'Davao del Sur', 'Digos', 'Aplaya', 6.7500, 125.3500),
  ('ST0098', 'Davao City Toril', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Toril', 7.0167, 125.5000),
  ('ST0099', 'Samal Island Store', 'REGION_XI', 'Davao del Norte', 'Samal', 'Peñaplata', 7.0833, 125.7167),
  ('ST0100', 'Davao City Talomo', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Talomo', 7.0333, 125.5833),
  ('ST0101', 'Davao City Tibungco', 'REGION_XI', 'Davao del Sur', 'Davao City', 'Tibungco', 7.1333, 125.6500),
  ('ST0102', 'Mati Davao Oriental', 'REGION_XI', 'Davao Oriental', 'Mati', 'Poblacion', 6.9500, 126.2167),

  -- Ilocos Region (Region I) - 8 stores
  ('ST0103', 'Laoag Ilocos Norte', 'REGION_I', 'Ilocos Norte', 'Laoag', 'Brgy 1', 18.1987, 120.5936),
  ('ST0104', 'San Fernando La Union', 'REGION_I', 'La Union', 'San Fernando', 'Catbangen', 16.6159, 120.3194),
  ('ST0105', 'Vigan Ilocos Sur', 'REGION_I', 'Ilocos Sur', 'Vigan', 'Poblacion', 17.5747, 120.3869),
  ('ST0106', 'Candon Ilocos Sur', 'REGION_I', 'Ilocos Sur', 'Candon', 'Poblacion', 17.1833, 120.4500),
  ('ST0107', 'Dagupan Pangasinan', 'REGION_I', 'Pangasinan', 'Dagupan', 'Poblacion', 16.0433, 120.3333),
  ('ST0108', 'San Carlos Pangasinan', 'REGION_I', 'Pangasinan', 'San Carlos', 'Poblacion', 15.9333, 120.3500),
  ('ST0109', 'Urdaneta Pangasinan', 'REGION_I', 'Pangasinan', 'Urdaneta', 'Poblacion', 15.9750, 120.5750),
  ('ST0110', 'Alaminos Pangasinan', 'REGION_I', 'Pangasinan', 'Alaminos', 'Poblacion', 16.1500, 119.9833),

  -- Western Visayas (Region VI) - 8 stores
  ('ST0111', 'Iloilo City Jaro', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Jaro', 10.7167, 122.5500),
  ('ST0112', 'Bacolod Negros Occ', 'REGION_VI', 'Negros Occidental', 'Bacolod', 'Mandalagan', 10.6667, 122.9500),
  ('ST0113', 'Roxas Capiz', 'REGION_VI', 'Capiz', 'Roxas', 'Poblacion', 11.5833, 122.7500),
  ('ST0114', 'Kalibo Aklan', 'REGION_VI', 'Aklan', 'Kalibo', 'Poblacion', 11.7083, 122.3667),
  ('ST0115', 'Silay Negros Occ', 'REGION_VI', 'Negros Occidental', 'Silay', 'Poblacion', 10.8000, 122.9667),
  ('ST0116', 'Iloilo City Molo', 'REGION_VI', 'Iloilo', 'Iloilo City', 'Molo', 10.7000, 122.5333),
  ('ST0117', 'San Jose Antique', 'REGION_VI', 'Antique', 'San Jose', 'Poblacion', 10.8000, 121.9333),
  ('ST0118', 'Passi Iloilo', 'REGION_VI', 'Iloilo', 'Passi', 'Poblacion', 11.1000, 122.6333),

  -- Other regions (12 stores - 1-2 per remaining region)
  ('ST0119', 'Baguio City CAR', 'CAR', 'Benguet', 'Baguio', 'Session Road', 16.4023, 120.5960),
  ('ST0120', 'La Trinidad Benguet', 'CAR', 'Benguet', 'La Trinidad', 'Poblacion', 16.4500, 120.5833),
  ('ST0121', 'Tuguegarao Cagayan', 'REGION_II', 'Cagayan', 'Tuguegarao', 'Poblacion', 17.6131, 121.7269),
  ('ST0122', 'Santiago Isabela', 'REGION_II', 'Isabela', 'Santiago', 'Poblacion', 16.6833, 121.5500),
  ('ST0123', 'Puerto Princesa', 'REGION_IV_B', 'Palawan', 'Puerto Princesa', 'Poblacion', 9.7500, 118.7500),
  ('ST0124', 'Legazpi Albay', 'REGION_V', 'Albay', 'Legazpi', 'Poblacion', 13.1389, 123.7356),
  ('ST0125', 'Naga Camarines Sur', 'REGION_V', 'Camarines Sur', 'Naga', 'Poblacion', 13.6192, 123.1814),
  ('ST0126', 'Tacloban Leyte', 'REGION_VIII', 'Leyte', 'Tacloban', 'Poblacion', 11.2500, 125.0000),
  ('ST0127', 'Zamboanga City', 'REGION_IX', 'Zamboanga del Sur', 'Zamboanga City', 'Poblacion', 6.9214, 122.0790),
  ('ST0128', 'Cagayan de Oro', 'REGION_X', 'Misamis Oriental', 'Cagayan de Oro', 'Poblacion', 8.4542, 124.6319),
  ('ST0129', 'General Santos', 'REGION_XII', 'South Cotabato', 'General Santos', 'Dadiangas', 6.1167, 125.1667),
  ('ST0130', 'Butuan Agusan Norte', 'REGION_XIII', 'Agusan del Norte', 'Butuan', 'Poblacion', 8.9500, 125.5333)
) AS v(store_code, store_name, region_code, province, city, barangay, latitude, longitude)
WHERE NOT EXISTS (SELECT 1 FROM scout.stores WHERE store_code = v.store_code);

-- =============================================================================
-- TRANSACTIONS TABLE (Canonical fact table)
-- =============================================================================

CREATE TABLE IF NOT EXISTS scout.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES scout.stores(id),
  timestamp TIMESTAMPTZ NOT NULL,
  time_of_day scout.daypart NOT NULL,
  region_code TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  barangay TEXT NOT NULL,
  brand_name TEXT NOT NULL,
  sku TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_subcategory TEXT,
  our_brand BOOLEAN NOT NULL DEFAULT false,
  tbwa_client_brand BOOLEAN NOT NULL DEFAULT false,
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  unit_price NUMERIC(12, 2) NOT NULL,
  gross_amount NUMERIC(12, 2) NOT NULL,
  discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(12, 2) GENERATED ALWAYS AS (gross_amount - discount_amount) STORED,
  payment_method scout.payment_method NOT NULL,
  customer_id TEXT,
  age INTEGER CHECK (age IS NULL OR (age >= 0 AND age <= 120)),
  gender TEXT CHECK (gender IS NULL OR gender IN ('M', 'F', 'Other', 'Unknown')),
  income scout.income_band NOT NULL DEFAULT 'unknown',
  urban_rural scout.urban_rural NOT NULL DEFAULT 'unknown',
  funnel_stage scout.funnel_stage,
  basket_size INTEGER CHECK (basket_size IS NULL OR basket_size >= 0),
  repeated_customer BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_scout_tx_store_date ON scout.transactions(store_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_region_date ON scout.transactions(region_code, timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_timestamp ON scout.transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_scout_tx_category ON scout.transactions(product_category);
CREATE INDEX IF NOT EXISTS idx_scout_tx_brand ON scout.transactions(brand_name);
CREATE INDEX IF NOT EXISTS idx_scout_tx_our_brand ON scout.transactions(our_brand) WHERE our_brand = true;

-- =============================================================================
-- SEED TRANSACTIONS (~18,000 over 365 days)
-- =============================================================================

DO $$
DECLARE
  v_store RECORD;
  v_day DATE;
  v_tx_count INTEGER;
  v_i INTEGER;
  v_timestamp TIMESTAMPTZ;
  v_hour INTEGER;
  v_daypart scout.daypart;
  v_brand TEXT;
  v_category TEXT;
  v_our_brand BOOLEAN;
  v_tbwa_client BOOLEAN;
  v_payment scout.payment_method;
  v_income scout.income_band;
  v_urban scout.urban_rural;
  v_funnel scout.funnel_stage;
  v_quantity INTEGER;
  v_unit_price NUMERIC;
  v_discount NUMERIC;
  v_age INTEGER;
  v_gender TEXT;
  v_sku_num INTEGER;
  v_day_of_week INTEGER;
  v_month INTEGER;
  v_is_weekend BOOLEAN;
  v_seasonal_mult NUMERIC;
  v_store_size_mult NUMERIC;
  v_rand NUMERIC;
  v_brand_info TEXT[];
  v_existing_tx_count BIGINT;

  -- Brands with category mapping (50 brands across 6 categories)
  -- Format: brand|category|is_tbwa_client
  v_brand_data TEXT[] := ARRAY[
    -- Beverages (35% of transactions) - 14 brands
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
    -- Snacks (25% of transactions) - 10 brands
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
    -- Tobacco (15% of transactions) - 7 brands
    'Marlboro|Tobacco|true',
    'Philip Morris|Tobacco|true',
    'Fortune|Tobacco|false',
    'Hope|Tobacco|false',
    'Champion|Tobacco|false',
    'Camel|Tobacco|false',
    'Winston|Tobacco|false',
    -- Household (12% of transactions) - 7 brands
    'Tide|Household|false',
    'Ariel|Household|false',
    'Surf|Household|false',
    'Downy|Household|false',
    'Joy|Household|false',
    'Zonrox|Household|false',
    'Del Monte|Household|true',
    -- Personal Care (8% of transactions) - 6 brands
    'Safeguard|Personal Care|false',
    'Head & Shoulders|Personal Care|false',
    'Palmolive|Personal Care|false',
    'Colgate|Personal Care|false',
    'Close Up|Personal Care|false',
    'Sunsilk|Personal Care|false',
    -- Canned Goods (5% of transactions) - 5 brands
    'Century Tuna|Canned Goods|true',
    'Argentina|Canned Goods|false',
    'Ligo|Canned Goods|false',
    'San Marino|Canned Goods|false',
    'Spam|Canned Goods|false'
  ];

  v_payment_weights NUMERIC[] := ARRAY[0.55, 0.25, 0.12, 0.08]; -- cash, gcash, maya, card
  v_income_weights NUMERIC[] := ARRAY[0.17, 0.58, 0.25]; -- low, middle, high

BEGIN
  -- Check existing transaction count to make this idempotent
  SELECT COUNT(*) INTO v_existing_tx_count FROM scout.transactions;

  IF v_existing_tx_count >= 15000 THEN
    RAISE NOTICE 'Already have % transactions, skipping seed', v_existing_tx_count;
    RETURN;
  END IF;

  RAISE NOTICE 'Starting Scout transaction seed generation...';

  -- Loop through stores (using first 100 stores for ~18k transactions)
  FOR v_store IN
    SELECT id, store_code, region_code, province, city, barangay,
           CASE
             WHEN region_code = 'NCR' THEN 1.5
             WHEN region_code = 'REGION_IV_A' THEN 1.3
             WHEN region_code IN ('REGION_III', 'REGION_VII') THEN 1.1
             WHEN region_code = 'REGION_XI' THEN 1.0
             ELSE 0.8
           END AS region_weight
    FROM scout.stores
    ORDER BY store_code
    LIMIT 100
  LOOP
    -- Store size multiplier (varies by store)
    v_store_size_mult := 0.8 + (random() * 0.4);

    -- Loop through last 365 days
    FOR v_day IN SELECT generate_series(current_date - 364, current_date, INTERVAL '1 day')::DATE LOOP
      v_day_of_week := EXTRACT(DOW FROM v_day)::INTEGER;
      v_month := EXTRACT(MONTH FROM v_day)::INTEGER;
      v_is_weekend := v_day_of_week IN (0, 6);

      -- Seasonal multiplier
      v_seasonal_mult := CASE
        WHEN v_month = 12 THEN 1.4  -- Christmas season
        WHEN v_month IN (11, 1) THEN 1.2  -- Holiday adjacent
        WHEN v_month IN (2, 3) THEN 0.85  -- Low season
        ELSE 1.0
      END;

      -- Base transactions per day (0-2 per store to get ~18k total across 100 stores * 365 days)
      v_tx_count := GREATEST(0, FLOOR(
        (random() * 2) *
        v_store.region_weight *
        v_store_size_mult *
        v_seasonal_mult *
        (CASE WHEN v_is_weekend THEN 1.3 ELSE 1.0 END)
      )::INTEGER);

      -- Generate transactions for this store/day
      FOR v_i IN 1..v_tx_count LOOP
        -- Random hour with weighted distribution
        v_rand := random();
        v_hour := CASE
          WHEN v_rand < 0.15 THEN 6 + FLOOR(random() * 4)::INTEGER  -- 6-9am (15%)
          WHEN v_rand < 0.45 THEN 10 + FLOOR(random() * 4)::INTEGER -- 10am-1pm (30%)
          WHEN v_rand < 0.75 THEN 14 + FLOOR(random() * 4)::INTEGER -- 2-5pm (30%)
          WHEN v_rand < 0.95 THEN 18 + FLOOR(random() * 3)::INTEGER -- 6-8pm (20%)
          ELSE 21 + FLOOR(random() * 2)::INTEGER                     -- 9-10pm (5%)
        END;

        v_daypart := CASE
          WHEN v_hour < 12 THEN 'morning'::scout.daypart
          WHEN v_hour < 17 THEN 'afternoon'::scout.daypart
          WHEN v_hour < 21 THEN 'evening'::scout.daypart
          ELSE 'night'::scout.daypart
        END;

        v_timestamp := v_day + (v_hour * INTERVAL '1 hour') + (FLOOR(random() * 60) * INTERVAL '1 minute');

        -- Select brand with category weighting
        v_rand := random();
        IF v_rand < 0.35 THEN
          -- Beverages (35%)
          v_brand_info := string_to_array(v_brand_data[1 + FLOOR(random() * 14)::INTEGER], '|');
        ELSIF v_rand < 0.60 THEN
          -- Snacks (25%)
          v_brand_info := string_to_array(v_brand_data[15 + FLOOR(random() * 10)::INTEGER], '|');
        ELSIF v_rand < 0.75 THEN
          -- Tobacco (15%)
          v_brand_info := string_to_array(v_brand_data[25 + FLOOR(random() * 7)::INTEGER], '|');
        ELSIF v_rand < 0.87 THEN
          -- Household (12%)
          v_brand_info := string_to_array(v_brand_data[32 + FLOOR(random() * 7)::INTEGER], '|');
        ELSIF v_rand < 0.95 THEN
          -- Personal Care (8%)
          v_brand_info := string_to_array(v_brand_data[39 + FLOOR(random() * 6)::INTEGER], '|');
        ELSE
          -- Canned Goods (5%)
          v_brand_info := string_to_array(v_brand_data[45 + FLOOR(random() * 5)::INTEGER], '|');
        END IF;

        v_brand := v_brand_info[1];
        v_category := v_brand_info[2];
        v_tbwa_client := v_brand_info[3] = 'true';
        v_our_brand := v_brand IN ('Oishi', 'Del Monte', 'Century Tuna', 'Milo');

        -- Payment method
        v_rand := random();
        v_payment := CASE
          WHEN v_rand < v_payment_weights[1] THEN 'cash'::scout.payment_method
          WHEN v_rand < v_payment_weights[1] + v_payment_weights[2] THEN 'gcash'::scout.payment_method
          WHEN v_rand < v_payment_weights[1] + v_payment_weights[2] + v_payment_weights[3] THEN 'maya'::scout.payment_method
          ELSE 'card'::scout.payment_method
        END;

        -- Income band
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

        -- Funnel stage (realistic distribution)
        v_rand := random();
        v_funnel := CASE
          WHEN v_rand < 0.85 THEN 'purchase'::scout.funnel_stage
          WHEN v_rand < 0.92 THEN 'accept'::scout.funnel_stage
          WHEN v_rand < 0.96 THEN 'request'::scout.funnel_stage
          WHEN v_rand < 0.99 THEN 'browse'::scout.funnel_stage
          ELSE 'visit'::scout.funnel_stage
        END;

        -- Transaction details
        v_quantity := 1 + FLOOR(random() * 4)::INTEGER;

        -- Price based on category
        v_unit_price := CASE v_category
          WHEN 'Tobacco' THEN 80 + FLOOR(random() * 120)::NUMERIC
          WHEN 'Beverages' THEN 15 + FLOOR(random() * 60)::NUMERIC
          WHEN 'Snacks' THEN 10 + FLOOR(random() * 40)::NUMERIC
          WHEN 'Household' THEN 30 + FLOOR(random() * 100)::NUMERIC
          WHEN 'Personal Care' THEN 25 + FLOOR(random() * 80)::NUMERIC
          WHEN 'Canned Goods' THEN 30 + FLOOR(random() * 50)::NUMERIC
          ELSE 20 + FLOOR(random() * 50)::NUMERIC
        END;

        v_discount := CASE WHEN random() < 0.15 THEN FLOOR(random() * 15)::NUMERIC ELSE 0 END;

        -- Customer demographics
        v_age := CASE
          WHEN random() < 0.1 THEN 18 + FLOOR(random() * 7)::INTEGER
          WHEN random() < 0.4 THEN 25 + FLOOR(random() * 10)::INTEGER
          WHEN random() < 0.7 THEN 35 + FLOOR(random() * 10)::INTEGER
          WHEN random() < 0.9 THEN 45 + FLOOR(random() * 15)::INTEGER
          ELSE 60 + FLOOR(random() * 10)::INTEGER
        END;

        v_gender := CASE WHEN random() < 0.52 THEN 'F' ELSE 'M' END;

        -- Generate SKU
        v_sku_num := FLOOR(random() * 400)::INTEGER + 1;

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
          v_brand, v_category || '-SKU-' || LPAD(v_sku_num::TEXT, 4, '0'), v_category,
          v_our_brand, v_tbwa_client,
          v_quantity, v_unit_price, v_quantity * v_unit_price, v_discount,
          v_payment, 'CUST-' || LPAD((FLOOR(random() * 8000))::TEXT, 6, '0'), v_age, v_gender,
          v_income, v_urban, v_funnel,
          1 + FLOOR(random() * 6)::INTEGER, random() < 0.35
        );
      END LOOP; -- transactions per day
    END LOOP; -- days
  END LOOP; -- stores

  RAISE NOTICE 'Scout transaction seed generation complete';
END $$;

-- =============================================================================
-- VIEWS FOR DASHBOARD PAGES
-- =============================================================================

-- v_tx_trends - Transaction Trends page
CREATE OR REPLACE VIEW scout.v_tx_trends AS
SELECT
  DATE_TRUNC('day', timestamp)::DATE AS tx_date,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS total_revenue,
  ROUND(AVG(net_amount)::NUMERIC, 2) AS avg_basket_value,
  COUNT(DISTINCT store_id) AS active_stores,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  ROUND(AVG(quantity)::NUMERIC, 2) AS avg_items_per_tx
FROM scout.transactions
GROUP BY 1
ORDER BY 1;

-- v_product_mix - Product Mix & SKU page
CREATE OR REPLACE VIEW scout.v_product_mix AS
SELECT
  product_category,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  SUM(quantity) AS units_sold,
  ROUND((100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0))::NUMERIC, 2) AS tx_share_pct,
  ROUND((100.0 * SUM(net_amount) / NULLIF(SUM(SUM(net_amount)) OVER (), 0))::NUMERIC, 2) AS revenue_share_pct,
  COUNT(DISTINCT brand_name) AS brand_count,
  COUNT(DISTINCT sku) AS sku_count
FROM scout.transactions
GROUP BY product_category
ORDER BY revenue DESC;

-- v_brand_performance - Brand-level analysis
CREATE OR REPLACE VIEW scout.v_brand_performance AS
SELECT
  brand_name,
  product_category,
  our_brand,
  tbwa_client_brand,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  SUM(quantity) AS units_sold,
  ROUND(AVG(net_amount)::NUMERIC, 2) AS avg_transaction_value,
  ROUND((100.0 * SUM(net_amount) / NULLIF(SUM(SUM(net_amount)) OVER (), 0))::NUMERIC, 2) AS market_share_pct
FROM scout.transactions
GROUP BY brand_name, product_category, our_brand, tbwa_client_brand
ORDER BY revenue DESC;

-- v_consumer_profile - Consumer Profiling page
CREATE OR REPLACE VIEW scout.v_consumer_profile AS
SELECT
  income,
  urban_rural,
  gender,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  ROUND(AVG(age) FILTER (WHERE age IS NOT NULL)::NUMERIC, 1) AS avg_age,
  ROUND(AVG(net_amount)::NUMERIC, 2) AS avg_basket_value
FROM scout.transactions
GROUP BY income, urban_rural, gender;

-- v_consumer_age_distribution - Age bracket analysis
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
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers
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

-- v_competitive_analysis - Competitive Analysis page
CREATE OR REPLACE VIEW scout.v_competitive_analysis AS
SELECT
  brand_name,
  our_brand,
  tbwa_client_brand,
  product_category,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  SUM(quantity) AS units_sold,
  ROUND((100.0 * SUM(net_amount) / NULLIF(SUM(SUM(net_amount)) OVER (), 0))::NUMERIC, 2) AS market_share_pct,
  ROUND((100.0 * SUM(net_amount) / NULLIF(SUM(SUM(net_amount)) OVER (PARTITION BY product_category), 0))::NUMERIC, 2) AS category_share_pct
FROM scout.transactions
GROUP BY brand_name, our_brand, tbwa_client_brand, product_category
ORDER BY revenue DESC;

-- v_geo_regions - Geographical Intelligence (for choropleth)
CREATE OR REPLACE VIEW scout.v_geo_regions AS
SELECT
  t.region_code,
  r.region_name,
  COUNT(DISTINCT t.store_id) AS stores_count,
  COUNT(*) AS tx_count,
  SUM(t.net_amount) AS revenue,
  COUNT(DISTINCT t.customer_id) FILTER (WHERE t.customer_id IS NOT NULL) AS unique_customers,
  ROUND(AVG(t.net_amount)::NUMERIC, 2) AS avg_basket_value,
  CASE
    WHEN SUM(t.net_amount) FILTER (WHERE t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days') > 0
    THEN ROUND(
      ((SUM(t.net_amount) FILTER (WHERE t.timestamp >= NOW() - INTERVAL '7 days') -
        SUM(t.net_amount) FILTER (WHERE t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days')) /
       NULLIF(SUM(t.net_amount) FILTER (WHERE t.timestamp >= NOW() - INTERVAL '14 days' AND t.timestamp < NOW() - INTERVAL '7 days'), 0) * 100
      )::NUMERIC, 2
    )
    ELSE 0
  END AS growth_rate
FROM scout.transactions t
JOIN scout.regions r ON t.region_code = r.region_code
GROUP BY t.region_code, r.region_name
ORDER BY revenue DESC;

-- v_funnel_analysis - Behavior funnel page
CREATE OR REPLACE VIEW scout.v_funnel_analysis AS
SELECT
  funnel_stage,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  ROUND((100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0))::NUMERIC, 2) AS stage_pct
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

-- v_daypart_analysis - Time of day analysis
CREATE OR REPLACE VIEW scout.v_daypart_analysis AS
SELECT
  time_of_day,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  ROUND(AVG(net_amount)::NUMERIC, 2) AS avg_basket_value,
  ROUND((100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0))::NUMERIC, 2) AS tx_share_pct
FROM scout.transactions
GROUP BY time_of_day
ORDER BY
  CASE time_of_day
    WHEN 'morning' THEN 1
    WHEN 'afternoon' THEN 2
    WHEN 'evening' THEN 3
    WHEN 'night' THEN 4
  END;

-- v_payment_methods - Payment method distribution
CREATE OR REPLACE VIEW scout.v_payment_methods AS
SELECT
  payment_method,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  ROUND((100.0 * COUNT(*) / NULLIF(SUM(COUNT(*)) OVER (), 0))::NUMERIC, 2) AS tx_share_pct
FROM scout.transactions
GROUP BY payment_method
ORDER BY tx_count DESC;

-- v_store_performance - Store-level metrics
CREATE OR REPLACE VIEW scout.v_store_performance AS
SELECT
  s.id AS store_id,
  s.store_code,
  s.store_name,
  s.region_code,
  s.city,
  COUNT(t.id) AS tx_count,
  SUM(t.net_amount) AS revenue,
  COUNT(DISTINCT t.customer_id) FILTER (WHERE t.customer_id IS NOT NULL) AS unique_customers,
  ROUND(AVG(t.net_amount)::NUMERIC, 2) AS avg_basket_value
FROM scout.stores s
LEFT JOIN scout.transactions t ON s.id = t.store_id
WHERE s.is_active = true
GROUP BY s.id, s.store_code, s.store_name, s.region_code, s.city
ORDER BY revenue DESC NULLS LAST;

-- v_kpi_summary - Executive KPI summary
CREATE OR REPLACE VIEW scout.v_kpi_summary AS
SELECT
  COUNT(*) AS total_transactions,
  SUM(net_amount) AS total_revenue,
  ROUND(AVG(net_amount)::NUMERIC, 2) AS avg_basket_value,
  COUNT(DISTINCT store_id) AS active_stores,
  COUNT(DISTINCT customer_id) FILTER (WHERE customer_id IS NOT NULL) AS unique_customers,
  COUNT(DISTINCT brand_name) AS total_brands,
  COUNT(DISTINCT sku) AS total_skus,
  COUNT(DISTINCT product_category) AS total_categories,
  COUNT(*) FILTER (WHERE timestamp::DATE = CURRENT_DATE) AS today_tx_count,
  SUM(net_amount) FILTER (WHERE timestamp::DATE = CURRENT_DATE) AS today_revenue,
  COUNT(*) FILTER (WHERE timestamp::DATE = CURRENT_DATE - 1) AS yesterday_tx_count,
  SUM(net_amount) FILTER (WHERE timestamp::DATE = CURRENT_DATE - 1) AS yesterday_revenue,
  COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') AS week_tx_count,
  SUM(net_amount) FILTER (WHERE timestamp >= NOW() - INTERVAL '7 days') AS week_revenue,
  COUNT(*) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 days') AS month_tx_count,
  SUM(net_amount) FILTER (WHERE timestamp >= NOW() - INTERVAL '30 days') AS month_revenue
FROM scout.transactions;

-- =============================================================================
-- ADDITIONAL VIEWS FOR COMPATIBILITY
-- =============================================================================

-- scout_stats_summary (alias for v_kpi_summary, used by some API routes)
CREATE OR REPLACE VIEW scout.scout_stats_summary AS
SELECT * FROM scout.v_kpi_summary;

-- scout_gold_transactions_flat (flattened view for health checks)
CREATE OR REPLACE VIEW scout.scout_gold_transactions_flat AS
SELECT
  t.id,
  t.timestamp AS effective_ts,
  t.timestamp,
  t.store_id,
  s.store_code,
  s.store_name,
  t.region_code,
  r.region_name,
  t.province,
  t.city,
  t.barangay,
  t.brand_name,
  t.sku,
  t.product_category,
  t.our_brand,
  t.tbwa_client_brand,
  t.quantity,
  t.unit_price,
  t.gross_amount,
  t.discount_amount,
  t.net_amount,
  t.payment_method::TEXT AS payment_method,
  t.customer_id,
  t.age,
  t.gender,
  t.income::TEXT AS income,
  t.urban_rural::TEXT AS urban_rural,
  t.funnel_stage::TEXT AS funnel_stage,
  t.basket_size,
  t.repeated_customer,
  t.time_of_day::TEXT AS time_of_day
FROM scout.transactions t
JOIN scout.stores s ON t.store_id = s.id
JOIN scout.regions r ON t.region_code = r.region_code;

-- =============================================================================
-- PERMISSIONS
-- =============================================================================

GRANT USAGE ON SCHEMA scout TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA scout TO anon, authenticated;

-- Grant on views specifically
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
GRANT SELECT ON scout.scout_stats_summary TO anon, authenticated;
GRANT SELECT ON scout.scout_gold_transactions_flat TO anon, authenticated;
GRANT SELECT ON scout.transactions TO anon, authenticated;
GRANT SELECT ON scout.stores TO anon, authenticated;
GRANT SELECT ON scout.regions TO anon, authenticated;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
  v_tx_count BIGINT;
  v_store_count BIGINT;
  v_region_count BIGINT;
  v_brand_count BIGINT;
  v_date_range TEXT;
  v_revenue NUMERIC;
BEGIN
  SELECT COUNT(*) INTO v_tx_count FROM scout.transactions;
  SELECT COUNT(*) INTO v_store_count FROM scout.stores;
  SELECT COUNT(DISTINCT region_code) INTO v_region_count FROM scout.transactions;
  SELECT COUNT(DISTINCT brand_name) INTO v_brand_count FROM scout.transactions;
  SELECT MIN(timestamp)::DATE || ' to ' || MAX(timestamp)::DATE INTO v_date_range FROM scout.transactions;
  SELECT SUM(gross_amount - discount_amount) INTO v_revenue FROM scout.transactions;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'Scout Seed Data Verification:';
  RAISE NOTICE '========================================';
  RAISE NOTICE '  Total Transactions: %', v_tx_count;
  RAISE NOTICE '  Total Stores: %', v_store_count;
  RAISE NOTICE '  Active Regions: %', v_region_count;
  RAISE NOTICE '  Unique Brands: %', v_brand_count;
  RAISE NOTICE '  Date Range: %', v_date_range;
  RAISE NOTICE '  Total Revenue: PHP %', TO_CHAR(v_revenue, 'FM999,999,999.00');
  RAISE NOTICE '========================================';
END $$;

-- Add comments
COMMENT ON SCHEMA scout IS 'Scout Retail Analytics Dashboard - Core data model for TBWA Philippines';
COMMENT ON TABLE scout.transactions IS 'Canonical transactions table - single source of truth for all dashboard views';
COMMENT ON TABLE scout.stores IS 'Store master data with geographic information across 17 PH regions';
COMMENT ON TABLE scout.regions IS '17 Philippine administrative regions';
COMMENT ON VIEW scout.v_tx_trends IS 'Daily transaction trends for Transaction Trends dashboard page';
COMMENT ON VIEW scout.v_product_mix IS 'Product category mix for Product Mix dashboard page';
COMMENT ON VIEW scout.v_brand_performance IS 'Brand-level performance metrics';
COMMENT ON VIEW scout.v_geo_regions IS 'Regional performance metrics for choropleth map visualization';
COMMENT ON VIEW scout.v_kpi_summary IS 'Executive KPI summary for dashboard header';
COMMENT ON VIEW scout.scout_gold_transactions_flat IS 'Flattened transaction view for health checks and data export';
