-- Scout Dashboard Missing Views
-- Migration: 20251208_scout_missing_views.sql
-- Description: Adds v_kpi_summary and v_brand_performance views that were missing from the main migration

-- =============================================================================
-- KPI SUMMARY VIEW (for homepage cards)
-- =============================================================================

CREATE OR REPLACE VIEW scout.v_kpi_summary AS
SELECT
  COUNT(DISTINCT id) AS total_transactions,
  COALESCE(SUM(net_amount), 0) AS total_revenue,
  COUNT(DISTINCT store_id) AS active_stores,
  COUNT(DISTINCT customer_id) AS unique_customers,
  COALESCE(AVG(net_amount), 0) AS avg_transaction_value,
  COALESCE(AVG(quantity), 0) AS avg_items_per_transaction
FROM scout.transactions
WHERE timestamp >= (CURRENT_DATE - INTERVAL '30 days');

COMMENT ON VIEW scout.v_kpi_summary IS
'Homepage KPI summary - last 30 days of transaction data';

-- =============================================================================
-- BRAND PERFORMANCE VIEW (for /product-mix brands tab)
-- =============================================================================

CREATE OR REPLACE VIEW scout.v_brand_performance AS
WITH brand_stats AS (
  SELECT
    brand_name,
    product_category,
    COUNT(DISTINCT id) AS tx_count,
    SUM(net_amount) AS revenue,
    SUM(quantity) AS units_sold,
    COUNT(DISTINCT store_id) AS store_reach,
    AVG(unit_price) AS avg_unit_price,
    tbwa_client_brand
  FROM scout.transactions
  WHERE timestamp >= (CURRENT_DATE - INTERVAL '30 days')
  GROUP BY brand_name, product_category, tbwa_client_brand
),
total_revenue AS (
  SELECT SUM(revenue) AS total FROM brand_stats
)
SELECT
  bs.brand_name,
  bs.product_category,
  bs.tx_count,
  bs.revenue,
  bs.units_sold,
  bs.store_reach,
  bs.avg_unit_price,
  bs.tbwa_client_brand,
  ROUND((bs.revenue / NULLIF(tr.total, 0) * 100)::numeric, 2) AS revenue_share_pct
FROM brand_stats bs
CROSS JOIN total_revenue tr
ORDER BY bs.revenue DESC;

COMMENT ON VIEW scout.v_brand_performance IS
'Brand-level analytics with revenue share - last 30 days';

-- =============================================================================
-- DATA HEALTH SUMMARY VIEW (for /data-health page)
-- =============================================================================

CREATE OR REPLACE VIEW public.v_data_health_summary AS
SELECT
  CURRENT_DATE AS as_of_date,
  'OK' AS status,
  (SELECT COUNT(*) FROM scout.transactions WHERE timestamp >= CURRENT_DATE - INTERVAL '7 days') AS transactions_last_7_days,
  (SELECT COUNT(DISTINCT store_id) FROM scout.transactions) AS total_stores,
  (SELECT COUNT(*) FROM scout.regions) AS total_regions,
  (SELECT MIN(timestamp) FROM scout.transactions) AS earliest_transaction,
  (SELECT MAX(timestamp) FROM scout.transactions) AS latest_transaction,
  CASE
    WHEN (SELECT COUNT(*) FROM scout.transactions) = 0 THEN 'No data'
    WHEN (SELECT MAX(timestamp) FROM scout.transactions) < CURRENT_DATE - INTERVAL '7 days' THEN 'Stale data'
    ELSE 'Fresh'
  END AS data_freshness;

COMMENT ON VIEW public.v_data_health_summary IS
'Data health metrics for monitoring and quality dashboards';

-- =============================================================================
-- ENABLE RLS (Row-Level Security) on views
-- =============================================================================

-- Grant access to authenticated and anon users
GRANT SELECT ON scout.v_kpi_summary TO anon, authenticated;
GRANT SELECT ON scout.v_brand_performance TO anon, authenticated;
GRANT SELECT ON public.v_data_health_summary TO anon, authenticated;
