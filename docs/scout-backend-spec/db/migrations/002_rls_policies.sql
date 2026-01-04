-- Scout Dashboard - RLS Policies (002_rls_policies.sql)
-- Tenant isolation: org_id
-- Role gating: users.role (admin|analyst|viewer)
-- Generated: January 2026

BEGIN;

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_hourly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_weekly_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helpers
CREATE OR REPLACE FUNCTION get_current_org_id()
RETURNS uuid
LANGUAGE plpgsql STABLE
AS $$
DECLARE v_org uuid;
BEGIN
  -- Prefer JWT claim org_id when present (recommended)
  BEGIN
    v_org := (auth.jwt() ->> 'org_id')::uuid;
  EXCEPTION WHEN others THEN
    v_org := NULL;
  END;

  IF v_org IS NOT NULL THEN
    RETURN v_org;
  END IF;

  -- Fallback: resolve from users table
  SELECT u.org_id INTO v_org
  FROM users u
  WHERE u.auth_id = auth.uid()
  LIMIT 1;

  RETURN v_org;
END;
$$;

CREATE OR REPLACE FUNCTION get_current_role()
RETURNS user_role
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    (SELECT u.role FROM users u WHERE u.auth_id = auth.uid() LIMIT 1),
    'viewer'::user_role
  );
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
SELECT get_current_role() = 'admin'::user_role;
$$;

CREATE OR REPLACE FUNCTION is_analyst_or_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
SELECT get_current_role() IN ('admin'::user_role,'analyst'::user_role);
$$;

-- Organizations
DROP POLICY IF EXISTS org_select ON organizations;
CREATE POLICY org_select ON organizations
FOR SELECT USING (id = get_current_org_id());

DROP POLICY IF EXISTS org_update_admin ON organizations;
CREATE POLICY org_update_admin ON organizations
FOR UPDATE USING (id = get_current_org_id() AND is_admin())
WITH CHECK (id = get_current_org_id() AND is_admin());

-- Users
DROP POLICY IF EXISTS users_select_org ON users;
CREATE POLICY users_select_org ON users
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS users_update_self ON users;
CREATE POLICY users_update_self ON users
FOR UPDATE USING (auth_id = auth.uid())
WITH CHECK (auth_id = auth.uid());

-- Dimension tables (brands/categories/regions/stores/products) - select for all org members
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['brands','categories','regions','stores','products'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_select ON %I FOR SELECT USING (org_id = get_current_org_id());', t, t);

    EXECUTE format('DROP POLICY IF EXISTS %I_write ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_write ON %I FOR INSERT WITH CHECK (org_id = get_current_org_id() AND is_analyst_or_admin());', t, t);

    EXECUTE format('DROP POLICY IF EXISTS %I_update_admin ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_update_admin ON %I FOR UPDATE USING (org_id = get_current_org_id() AND is_admin()) WITH CHECK (org_id = get_current_org_id() AND is_admin());', t, t);
  END LOOP;
END $$;

-- Transactions (read for all org members; inserts for analyst/admin)
DROP POLICY IF EXISTS tx_select ON transactions;
CREATE POLICY tx_select ON transactions
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS tx_insert ON transactions;
CREATE POLICY tx_insert ON transactions
FOR INSERT WITH CHECK (org_id = get_current_org_id() AND is_analyst_or_admin());

-- Line items
DROP POLICY IF EXISTS tli_select ON transaction_line_items;
CREATE POLICY tli_select ON transaction_line_items
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS tli_insert ON transaction_line_items;
CREATE POLICY tli_insert ON transaction_line_items
FOR INSERT WITH CHECK (org_id = get_current_org_id() AND is_analyst_or_admin());

-- Aggregate tables: select only (populated by service_role jobs)
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['transaction_daily_summary','transaction_hourly_summary','transaction_weekly_summary'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I;', t, t);
    EXECUTE format('CREATE POLICY %I_select ON %I FOR SELECT USING (org_id = get_current_org_id());', t, t);
  END LOOP;
END $$;

-- Insights cache (select for all; insert/update by service_role OR admin/analyst if you want)
DROP POLICY IF EXISTS insights_select ON dashboard_insights_cache;
CREATE POLICY insights_select ON dashboard_insights_cache
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS insights_write ON dashboard_insights_cache;
CREATE POLICY insights_write ON dashboard_insights_cache
FOR INSERT WITH CHECK (org_id = get_current_org_id() AND is_analyst_or_admin());

-- Exports
DROP POLICY IF EXISTS exports_select ON dashboard_exports;
CREATE POLICY exports_select ON dashboard_exports
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS exports_insert ON dashboard_exports;
CREATE POLICY exports_insert ON dashboard_exports
FOR INSERT WITH CHECK (org_id = get_current_org_id());

-- Audit logs (insert by all; select org members)
DROP POLICY IF EXISTS audit_select ON audit_logs;
CREATE POLICY audit_select ON audit_logs
FOR SELECT USING (org_id = get_current_org_id());

DROP POLICY IF EXISTS audit_insert ON audit_logs;
CREATE POLICY audit_insert ON audit_logs
FOR INSERT WITH CHECK (org_id = get_current_org_id());

COMMIT;
