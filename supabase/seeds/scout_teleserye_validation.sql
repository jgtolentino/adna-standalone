-- Scout Teleserye Seed Validation Queries
-- Run these after executing scout_seed_teleserye.sql to verify correct implementation
-- Expected outputs and pass/fail criteria included

-- =============================================================================
-- VALIDATION 1: Sweldo/Fiesta Temporal Spikes
-- =============================================================================

-- Query: Check volume spikes on sweldo days (15th, 30th)
SELECT
  EXTRACT(DAY FROM timestamp) AS day_of_month,
  COUNT(*) AS tx_count,
  ROUND(COUNT(*)::numeric / AVG(COUNT(*)) OVER (), 2) AS multiplier_vs_avg
FROM scout.transactions
WHERE timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY 1
ORDER BY 1;

-- Expected: Days 14-16, 29-31 should show 2-3x multiplier vs average
-- Pass Criteria: Days 15 and 30 have multiplier >= 2.0

-- =============================================================================
-- VALIDATION 2: Promo Discount Activity
-- =============================================================================

-- Query: Check discount distribution
SELECT
  CASE
    WHEN discount_amount = 0 THEN '0% (No Promo)'
    WHEN discount_amount / gross_amount BETWEEN 0.01 AND 0.10 THEN '1-10%'
    WHEN discount_amount / gross_amount BETWEEN 0.11 AND 0.20 THEN '11-20%'
    WHEN discount_amount / gross_amount BETWEEN 0.21 AND 0.30 THEN '21-30%'
    ELSE '>30%'
  END AS discount_bracket,
  COUNT(*) AS tx_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct_of_total
FROM scout.transactions
GROUP BY 1
ORDER BY 1;

-- Expected: 70-75% no promo, 20-25% with 10-30% discounts, 5% with 1-10% discounts
-- Pass Criteria: Discount rate (non-zero) should be 25-30% of total transactions

-- =============================================================================
-- VALIDATION 3: Tobacco Stick vs Pack Split
-- =============================================================================

-- Query: Check cigarette form factor split
SELECT
  CASE
    WHEN sku LIKE '%-1S' THEN 'Stick'
    WHEN sku LIKE '%-20S' THEN 'Pack'
    ELSE 'Other'
  END AS tobacco_type,
  COUNT(*) AS tx_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS volume_share_pct,
  ROUND(AVG(quantity), 2) AS avg_quantity
FROM scout.transactions
WHERE product_category = 'Tobacco'
GROUP BY 1;

-- Expected: Sticks 55-65% volume, Packs 35-45% volume, Avg quantity: Sticks 2-3, Packs 1-2
-- Pass Criteria: Stick volume >= 55% AND Pack volume <= 45%

-- =============================================================================
-- VALIDATION 4: Sachet/Tingi Economy Price Points
-- =============================================================================

-- Query: Check price distribution across categories
SELECT
  product_category,
  CASE
    WHEN unit_price <= 5 THEN '₱1-5 (Tingi)'
    WHEN unit_price BETWEEN 5.01 AND 10 THEN '₱5-10 (Sachet)'
    WHEN unit_price BETWEEN 10.01 AND 30 THEN '₱10-30 (Daily)'
    WHEN unit_price BETWEEN 30.01 AND 50 THEN '₱30-50 (Stock-up)'
    ELSE '>₱50'
  END AS price_bracket,
  COUNT(*) AS tx_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY product_category), 2) AS pct_within_category
FROM scout.transactions
GROUP BY 1, 2
ORDER BY 1, 2;

-- Expected: 30-40% of transactions in ₱1-10 range (tingi/sachet), especially Personal Care and Snacks
-- Pass Criteria: At least 30% of total transactions in ₱1-10 price bracket

-- =============================================================================
-- VALIDATION 5: Regional Store Coverage
-- =============================================================================

-- Query: Check store distribution across regions
SELECT
  r.code AS region_code,
  r.name AS region_name,
  COUNT(DISTINCT s.id) AS store_count,
  COUNT(t.id) AS tx_count
FROM scout.regions r
LEFT JOIN scout.stores s ON r.code = s.region_code
LEFT JOIN scout.transactions t ON s.id = t.store_id
GROUP BY 1, 2
ORDER BY 3 DESC, 4 DESC;

-- Expected: All 17 regions should have at least 2 stores, NCR and Visayas with most transactions
-- Pass Criteria: Zero regions with 0 stores, all regions >= 1 store

-- =============================================================================
-- VALIDATION 6: Tobacco Daily Habit Patterns
-- =============================================================================

-- Query: Check tobacco customer purchase frequency
WITH tobacco_customers AS (
  SELECT
    customer_id,
    COUNT(*) AS purchase_count,
    COUNT(DISTINCT DATE(timestamp)) AS unique_days,
    ROUND(AVG(quantity), 2) AS avg_qty_per_tx,
    COUNT(*) FILTER (WHERE sku LIKE '%-1S') AS stick_purchases,
    COUNT(*) FILTER (WHERE sku LIKE '%-20S') AS pack_purchases
  FROM scout.transactions
  WHERE product_category = 'Tobacco'
    AND customer_id IS NOT NULL
    AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY 1
)
SELECT
  CASE
    WHEN purchase_count >= 20 THEN '5-7x/week (Daily Habit)'
    WHEN purchase_count BETWEEN 10 AND 19 THEN '2-4x/week'
    WHEN purchase_count BETWEEN 5 AND 9 THEN 'Weekly'
    ELSE 'Occasional'
  END AS purchase_frequency,
  COUNT(*) AS customer_count,
  ROUND(AVG(avg_qty_per_tx), 2) AS avg_qty,
  ROUND(100.0 * AVG(stick_purchases) / NULLIF(AVG(stick_purchases + pack_purchases), 0), 2) AS stick_pct
FROM tobacco_customers
GROUP BY 1
ORDER BY 2 DESC;

-- Expected: 40-50% of tobacco customers are daily habit (20+ purchases/month), stick pct 60-70%
-- Pass Criteria: At least 40% of tobacco customers with >=20 purchases/month

-- =============================================================================
-- VALIDATION 7: OOS Substitution Behavior
-- =============================================================================

-- Query: Check substitution occurrence by category
SELECT
  product_category,
  COUNT(*) AS total_tx,
  COUNT(*) FILTER (WHERE substitution_occurred = TRUE) AS substitution_tx,
  ROUND(100.0 * COUNT(*) FILTER (WHERE substitution_occurred = TRUE) / COUNT(*), 2) AS substitution_rate_pct
FROM scout.transactions
GROUP BY 1
ORDER BY 4 DESC;

-- Expected: Beverages 15-25% (higher during fiesta), Tobacco 10-15%, others 5-15%
-- Pass Criteria: Beverage substitution rate 15-40% (accounting for fiesta spike)

-- =============================================================================
-- VALIDATION 8: Trip Mission Segmentation
-- =============================================================================

-- Query: Check basket size distribution (tingi vs daily vs stock-up)
SELECT
  CASE
    WHEN basket_size <= 2 THEN 'Tingi (1-2 items)'
    WHEN basket_size BETWEEN 3 AND 5 THEN 'Daily (3-5 items)'
    WHEN basket_size BETWEEN 6 AND 8 THEN 'Weekly (6-8 items)'
    ELSE 'Stock-up (8+ items)'
  END AS trip_mission,
  COUNT(*) AS tx_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS pct_of_total,
  ROUND(AVG(net_amount), 2) AS avg_spend
FROM scout.transactions
GROUP BY 1
ORDER BY 4 ASC;

-- Expected: Tingi 50-60%, Daily 25-35%, Stock-up 10-15%, avg spend: Tingi ₱20-50, Stock-up ₱500-1000
-- Pass Criteria: Tingi mission >= 50% of transactions AND avg spend ₱20-60

-- =============================================================================
-- SUMMARY REPORT
-- =============================================================================

-- Query: Overall seed health metrics
WITH metrics AS (
  SELECT
    COUNT(*) AS total_tx,
    COUNT(DISTINCT store_id) AS total_stores,
    COUNT(DISTINCT sku) AS total_skus,
    COUNT(DISTINCT customer_id) AS total_customers,
    COUNT(DISTINCT region_code) AS total_regions,
    ROUND(AVG(net_amount), 2) AS avg_tx_value,
    ROUND(100.0 * COUNT(*) FILTER (WHERE discount_amount > 0) / COUNT(*), 2) AS promo_rate_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE repeated_customer = TRUE) / COUNT(*), 2) AS repeat_customer_pct,
    ROUND(100.0 * COUNT(*) FILTER (WHERE substitution_occurred = TRUE) / COUNT(*), 2) AS substitution_rate_pct
  FROM scout.transactions
)
SELECT
  'Total Transactions' AS metric, total_tx::text AS value FROM metrics
UNION ALL SELECT 'Total Stores', total_stores::text FROM metrics
UNION ALL SELECT 'Total SKUs', total_skus::text FROM metrics
UNION ALL SELECT 'Total Customers', total_customers::text FROM metrics
UNION ALL SELECT 'Total Regions', total_regions::text FROM metrics
UNION ALL SELECT 'Avg Transaction Value', '₱' || avg_tx_value::text FROM metrics
UNION ALL SELECT 'Promo Rate', promo_rate_pct::text || '%' FROM metrics
UNION ALL SELECT 'Repeat Customer Rate', repeat_customer_pct::text || '%' FROM metrics
UNION ALL SELECT 'Substitution Rate', substitution_rate_pct::text || '%' FROM metrics;

-- Expected:
-- - Total Transactions: 120,000-180,000 (90 days × 50 stores × ~40 tx/day with multipliers)
-- - Total Stores: 53
-- - Total SKUs: 60-66
-- - Total Customers: 5,000-15,000
-- - Total Regions: 17
-- - Avg Transaction Value: ₱35-55
-- - Promo Rate: 25-30%
-- - Repeat Customer Rate: 40-50%
-- - Substitution Rate: 15-20%

-- =============================================================================
-- ACCEPTANCE GATES CHECKLIST
-- =============================================================================

-- Run this after all validation queries
DO $$
DECLARE
  v_total_tx INTEGER;
  v_total_stores INTEGER;
  v_total_regions INTEGER;
  v_sweldo_spike NUMERIC;
  v_promo_rate NUMERIC;
  v_stick_pct NUMERIC;
  v_tingi_pct NUMERIC;
  pass_count INTEGER := 0;
  fail_count INTEGER := 0;
BEGIN
  -- Gate 1: Sufficient transaction volume
  SELECT COUNT(*) INTO v_total_tx FROM scout.transactions;
  IF v_total_tx >= 100000 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Transaction Volume: % (>= 100K)', v_total_tx;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Transaction Volume: % (< 100K)', v_total_tx;
  END IF;

  -- Gate 2: All regions have stores
  SELECT COUNT(DISTINCT region_code) INTO v_total_regions FROM scout.stores;
  IF v_total_regions >= 17 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Regional Coverage: % regions (>= 17)', v_total_regions;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Regional Coverage: % regions (< 17)', v_total_regions;
  END IF;

  -- Gate 3: Sweldo spike exists
  SELECT MAX(daily_tx)::numeric / AVG(daily_tx)::numeric INTO v_sweldo_spike
  FROM (
    SELECT DATE(timestamp) AS tx_date, COUNT(*) AS daily_tx
    FROM scout.transactions
    GROUP BY 1
  ) d;
  IF v_sweldo_spike >= 2.0 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Sweldo Spike: %.2fx (>= 2.0x)', v_sweldo_spike;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Sweldo Spike: %.2fx (< 2.0x)', v_sweldo_spike;
  END IF;

  -- Gate 4: Promo activity exists
  SELECT 100.0 * COUNT(*) FILTER (WHERE discount_amount > 0) / COUNT(*) INTO v_promo_rate
  FROM scout.transactions;
  IF v_promo_rate >= 20.0 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Promo Rate: %.2f%% (>= 20%%)', v_promo_rate;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Promo Rate: %.2f%% (< 20%%)', v_promo_rate;
  END IF;

  -- Gate 5: Tobacco sticks dominate
  SELECT 100.0 * COUNT(*) FILTER (WHERE sku LIKE '%-1S') / COUNT(*) INTO v_stick_pct
  FROM scout.transactions WHERE product_category = 'Tobacco';
  IF v_stick_pct >= 55.0 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Tobacco Stick Share: %.2f%% (>= 55%%)', v_stick_pct;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Tobacco Stick Share: %.2f%% (< 55%%)', v_stick_pct;
  END IF;

  -- Gate 6: Tingi economy represented
  SELECT 100.0 * COUNT(*) FILTER (WHERE unit_price <= 10) / COUNT(*) INTO v_tingi_pct
  FROM scout.transactions;
  IF v_tingi_pct >= 30.0 THEN
    pass_count := pass_count + 1;
    RAISE NOTICE '✅ PASS - Tingi Economy: %.2f%% (>= 30%%)', v_tingi_pct;
  ELSE
    fail_count := fail_count + 1;
    RAISE NOTICE '❌ FAIL - Tingi Economy: %.2f%% (< 30%%)', v_tingi_pct;
  END IF;

  -- Final verdict
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════';
  IF fail_count = 0 THEN
    RAISE NOTICE '✅ ALL GATES PASSED (% / %)', pass_count, pass_count + fail_count;
    RAISE NOTICE 'Scout Teleserye seed is production-ready!';
  ELSE
    RAISE NOTICE '❌ % GATE(S) FAILED (% passed, % failed)', fail_count, pass_count, fail_count;
    RAISE NOTICE 'Review validation queries above for details';
  END IF;
  RAISE NOTICE '═══════════════════════════════════════════';
END $$;
