-- ============================================================================
-- 040_superset_analytics_views.sql
-- Analytics-facing views for Apache Superset
-- Depends on:
--   - scout.fact_transactions
--   - scout.master_brands
--   - creative_ops.warc_cases
-- ============================================================================

-- Create analytics schema
CREATE SCHEMA IF NOT EXISTS analytics;

-- --------------------------------------------------------------------------
-- 1) Store performance (store-level metrics)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_store_performance AS
SELECT
    ft.store_id,
    COUNT(DISTINCT ft.transaction_id)      AS transaction_count,
    COALESCE(SUM(ft.total_amount), 0)      AS total_revenue,
    COALESCE(AVG(ft.total_amount), 0)      AS avg_transaction_value,
    MIN(ft.transaction_date)              AS first_transaction_date,
    MAX(ft.transaction_date)              AS last_transaction_date
FROM scout.fact_transactions ft
GROUP BY ft.store_id;

-- NOTE:
-- If you later confirm columns on scout.master_stores (e.g. store_name, city, region),
-- you can extend this view with a JOIN to add those attributes.

-- --------------------------------------------------------------------------
-- 2) Brand performance (brand metrics, TBWA vs non-TBWA)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_brand_performance AS
SELECT
    mb.brand_id,
    mb.brand_name,
    mb.brand_tier,
    mb.is_tbwa_client,
    COUNT(DISTINCT ft.transaction_id)              AS transaction_count,
    COALESCE(SUM(ft.total_amount), 0)::NUMERIC(18,2) AS total_revenue,
    COALESCE(AVG(ft.total_amount), 0)::NUMERIC(18,2) AS avg_transaction_value
FROM scout.master_brands mb
LEFT JOIN scout.fact_transactions ft
    ON (
        ft.items::text ILIKE '%' || mb.brand_name || '%'
        OR ft.transcript ILIKE '%' || mb.brand_name || '%'
    )
GROUP BY
    mb.brand_id,
    mb.brand_name,
    mb.brand_tier,
    mb.is_tbwa_client;

-- --------------------------------------------------------------------------
-- 3) Daily transactions (time-series / seasonality)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_daily_transactions AS
SELECT
    ft.transaction_date::date                   AS transaction_date,
    COUNT(DISTINCT ft.transaction_id)           AS transaction_count,
    COALESCE(SUM(ft.total_amount), 0)::NUMERIC(18,2) AS total_revenue,
    COALESCE(AVG(ft.total_amount), 0)::NUMERIC(18,2) AS avg_transaction_value
FROM scout.fact_transactions ft
GROUP BY ft.transaction_date::date
ORDER BY transaction_date;

-- --------------------------------------------------------------------------
-- 4) Client portfolio (TBWA client health / share of revenue)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_client_portfolio AS
SELECT
    bp.brand_id,
    bp.brand_name,
    bp.brand_tier,
    bp.is_tbwa_client,
    bp.transaction_count,
    bp.total_revenue,
    CASE
        WHEN SUM(bp.total_revenue) OVER () > 0
            THEN 100.0 * bp.total_revenue / NULLIF(SUM(bp.total_revenue) OVER (), 0)
        ELSE 0
    END AS revenue_share_pct
FROM analytics.vw_brand_performance bp
WHERE bp.is_tbwa_client IS NOT NULL;

-- --------------------------------------------------------------------------
-- 5) Customer demographics (gender / age segmentation)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_customer_demographics AS
SELECT
    ft.customer_gender,
    ft.customer_age_group,
    COUNT(DISTINCT ft.customer_id)            AS customer_count,
    COUNT(DISTINCT ft.transaction_id)         AS transaction_count,
    COALESCE(SUM(ft.total_amount), 0)         AS total_revenue
FROM scout.fact_transactions ft
GROUP BY
    ft.customer_gender,
    ft.customer_age_group
ORDER BY
    ft.customer_gender,
    ft.customer_age_group;

-- --------------------------------------------------------------------------
-- 6) WARC effectiveness (campaign ROI, effectiveness)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics.vw_warc_effectiveness AS
SELECT
    w.case_id,
    w.campaign_name,
    w.brand,
    w.parent_company,
    w.publication_year,
    w.primary_market,
    w.industry_sector,
    -- Heuristic: pull an overall effectiveness score if present in JSON
    COALESCE(
        (w.effectiveness_metrics->>'overall_score')::float,
        (w.effectiveness_metrics->>'ces_score')::float,
        0.0
    ) AS effectiveness_score,
    w.effectiveness_metrics,
    w.business_results
FROM creative_ops.warc_cases w;

-- --------------------------------------------------------------------------
-- PERMISSIONS
-- --------------------------------------------------------------------------
GRANT USAGE ON SCHEMA analytics TO anon, authenticated, service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO anon, authenticated, service_role;
