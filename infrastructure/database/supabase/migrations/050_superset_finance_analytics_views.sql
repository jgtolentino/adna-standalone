-- ============================================================================
-- 050_superset_finance_analytics_views.sql
-- Analytics views for TBWA Finance / OPEX control room in Superset
-- Depends on:
--   - public.bir_filing, public.bir_forms, public.bir_filing_schedule
--   - public.closing_task, public.finance_closing_snapshots
--   - public.finance_people, public.finance_monthly_tasks
--   - public.rag_queries, public.rag_logs
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS analytics_finance;

-- --------------------------------------------------------------------------
-- 1) BIR filing status (one row per BIR filing instance)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_bir_filing_status AS
SELECT
  f.id,
  f.form                         AS form_code,
  bf.description                 AS form_description,
  f.period_covered,
  f.bir_deadline,
  f.prep_due_date,
  f.report_approval_due_date,
  f.payment_approval_due_date,
  f.filing_status::text          AS filing_status,
  f.finance_supervisor_email,
  f.finance_manager_email,
  f.finance_director_email,
  f.created_at,
  f.updated_at,
  f.last_reminder_sent,
  (f.bir_deadline::date   - CURRENT_DATE) AS days_to_bir_deadline,
  (f.prep_due_date::date  - CURRENT_DATE) AS days_to_prep_due,
  (f.report_approval_due_date::date - CURRENT_DATE) AS days_to_report_approval_due,
  (f.payment_approval_due_date::date - CURRENT_DATE) AS days_to_payment_approval_due
FROM public.bir_filing f
LEFT JOIN public.bir_forms bf
  ON bf.form_code = f.form;

-- --------------------------------------------------------------------------
-- 2) BIR filing calendar (schedule of all periods per form)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_bir_filing_calendar AS
SELECT
  s.id,
  bf.form_code,
  bf.description           AS form_description,
  s.period_label,
  s.period_start,
  s.period_end,
  s.filing_deadline,
  s.prep_due               AS prep_due_date,
  s.report_approval_due    AS report_approval_due_date,
  s.payment_approval_due   AS payment_approval_due_date,
  (s.filing_deadline::date - CURRENT_DATE) AS days_to_deadline,
  s.created_at
FROM public.bir_filing_schedule s
JOIN public.bir_forms bf
  ON bf.id = s.bir_form_id;

-- --------------------------------------------------------------------------
-- 3) Month-end closing tasks (task-level view)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_closing_tasks AS
SELECT
  t.id,
  t.month,
  t.cluster::text                AS cluster,
  t.relative_due,
  t.due_date,
  t.task_name,
  t.description,
  t.owner_code,
  t.owner_email,
  t.status::text                 AS status,
  t.erp_id,
  t.created_at,
  t.updated_at,
  t.attachments,
  (t.due_date::date - CURRENT_DATE) AS days_to_due,
  u.role::text                   AS user_role,
  u.cluster::text                AS user_cluster
FROM public.closing_task t
LEFT JOIN public.users u
  ON u.owner_code = t.owner_code;

-- Aggregated view by cluster/status for KPI tiles
CREATE OR REPLACE VIEW analytics_finance.vw_closing_tasks_summary AS
SELECT
  date_trunc('month', t.month)::date AS period_month,
  t.cluster::text                    AS cluster,
  t.status::text                     AS status,
  COUNT(*)                           AS task_count
FROM public.closing_task t
GROUP BY date_trunc('month', t.month), t.cluster, t.status;

-- --------------------------------------------------------------------------
-- 4) Finance closing snapshots (use almost as-is)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_finance_closing_snapshots AS
SELECT
  s.id,
  s.captured_at,
  s.source,
  s.odoo_db,
  s.period_label,
  s.total_tasks,
  s.open_tasks,
  s.blocked_tasks,
  s.done_tasks,
  s.cluster_a_open,
  s.cluster_b_open,
  s.cluster_c_open,
  s.cluster_d_open,
  s.raw_payload,
  s.created_at,
  s.updated_at
FROM public.finance_closing_snapshots s;

-- --------------------------------------------------------------------------
-- 5) Finance monthly task capacity (per person)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_finance_monthly_capacity AS
SELECT
  t.id,
  p.code                      AS employee_code,
  p.full_name,
  p.email,
  p.role,
  t.task_category,
  t.detailed_monthly_tasks,
  t.reviewed_by_code,
  t.approved_by_code,
  t.prep_days,
  t.review_days,
  t.approval_days,
  (COALESCE(t.prep_days, 0)
   + COALESCE(t.review_days, 0)
   + COALESCE(t.approval_days, 0)) AS total_days,
  t.created_at
FROM public.finance_monthly_tasks t
JOIN public.finance_people p
  ON p.code = t.employee_code;

-- --------------------------------------------------------------------------
-- 6) RAG / OPEX usage (assistant activity over time)
-- --------------------------------------------------------------------------
CREATE OR REPLACE VIEW analytics_finance.vw_rag_usage_daily AS
SELECT
  date_trunc('day', q.created_at)::date AS query_date,
  q.assistant,
  COUNT(*)                              AS query_count,
  SUM(CASE WHEN q.has_response THEN 1 ELSE 0 END) AS response_count,
  SUM(CASE WHEN q.has_error THEN 1 ELSE 0 END)    AS error_count
FROM public.rag_queries q
GROUP BY date_trunc('day', q.created_at), q.assistant
ORDER BY query_date;

CREATE OR REPLACE VIEW analytics_finance.vw_rag_logs_by_event AS
SELECT
  date_trunc('day', l.created_at)::date AS event_date,
  l.event_type,
  l.source_table,
  COUNT(*) AS event_count
FROM public.rag_logs l
GROUP BY date_trunc('day', l.created_at), l.event_type, l.source_table
ORDER BY event_date;

-- --------------------------------------------------------------------------
-- Grant permissions for Superset service account (if using dedicated user)
-- --------------------------------------------------------------------------
-- Example: GRANT SELECT ON ALL TABLES IN SCHEMA analytics_finance TO superset_service;
-- Adjust based on your actual Supabase service role configuration
