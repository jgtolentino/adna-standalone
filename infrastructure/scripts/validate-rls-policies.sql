-- =============================================================================
-- RLS Policy Validation Script
-- =============================================================================
-- This script validates that Row Level Security is properly configured
-- Run this against your Supabase database to audit RLS status
--
-- Usage:
--   psql $DATABASE_URL -f validate-rls-policies.sql
-- =============================================================================

-- Create a results table if it doesn't exist (for storing audit results)
CREATE TEMP TABLE IF NOT EXISTS rls_audit_results (
    schema_name TEXT,
    table_name TEXT,
    rls_enabled BOOLEAN,
    has_policies BOOLEAN,
    policy_count INTEGER,
    status TEXT,
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- Check RLS Status for All Tables
-- =============================================================================

DO $$
DECLARE
    r RECORD;
    policy_count INTEGER;
    rls_enabled BOOLEAN;
    status_text TEXT;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RLS Policy Validation Report';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';

    -- Check public schema tables
    RAISE NOTICE 'Checking PUBLIC schema tables...';
    FOR r IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename NOT LIKE 'pg_%'
        AND tablename NOT LIKE '_prisma_%'
        ORDER BY tablename
    LOOP
        -- Check if RLS is enabled
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = r.schemaname
        AND c.relname = r.tablename;

        -- Count policies
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = r.schemaname
        AND tablename = r.tablename;

        -- Determine status
        IF rls_enabled AND policy_count > 0 THEN
            status_text := 'OK - RLS enabled with policies';
        ELSIF rls_enabled AND policy_count = 0 THEN
            status_text := 'WARN - RLS enabled but NO policies (blocks all access!)';
        ELSIF NOT rls_enabled THEN
            status_text := 'FAIL - RLS NOT enabled';
        END IF;

        -- Insert result
        INSERT INTO rls_audit_results (schema_name, table_name, rls_enabled, has_policies, policy_count, status)
        VALUES (r.schemaname, r.tablename, rls_enabled, policy_count > 0, policy_count, status_text);

        -- Output
        IF rls_enabled THEN
            RAISE NOTICE '  [OK] %.%: % policies', r.schemaname, r.tablename, policy_count;
        ELSE
            RAISE WARNING '  [!!] %.%: RLS NOT ENABLED', r.schemaname, r.tablename;
        END IF;
    END LOOP;

    RAISE NOTICE '';

    -- Check creative_ops schema tables
    RAISE NOTICE 'Checking CREATIVE_OPS schema tables...';
    FOR r IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'creative_ops'
        ORDER BY tablename
    LOOP
        -- Check if RLS is enabled
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = r.schemaname
        AND c.relname = r.tablename;

        -- Count policies
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = r.schemaname
        AND tablename = r.tablename;

        -- Determine status
        IF rls_enabled AND policy_count > 0 THEN
            status_text := 'OK - RLS enabled with policies';
        ELSIF rls_enabled AND policy_count = 0 THEN
            status_text := 'WARN - RLS enabled but NO policies (blocks all access!)';
        ELSIF NOT rls_enabled THEN
            status_text := 'FAIL - RLS NOT enabled';
        END IF;

        -- Insert result
        INSERT INTO rls_audit_results (schema_name, table_name, rls_enabled, has_policies, policy_count, status)
        VALUES (r.schemaname, r.tablename, rls_enabled, policy_count > 0, policy_count, status_text);

        -- Output
        IF rls_enabled THEN
            RAISE NOTICE '  [OK] %.%: % policies', r.schemaname, r.tablename, policy_count;
        ELSE
            RAISE WARNING '  [!!] %.%: RLS NOT ENABLED', r.schemaname, r.tablename;
        END IF;
    END LOOP;

    RAISE NOTICE '';

    -- Check scout schema tables
    RAISE NOTICE 'Checking SCOUT schema tables...';
    FOR r IN
        SELECT schemaname, tablename
        FROM pg_tables
        WHERE schemaname = 'scout'
        ORDER BY tablename
    LOOP
        -- Check if RLS is enabled
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = r.schemaname
        AND c.relname = r.tablename;

        -- Count policies
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies
        WHERE schemaname = r.schemaname
        AND tablename = r.tablename;

        -- Determine status
        IF rls_enabled AND policy_count > 0 THEN
            status_text := 'OK - RLS enabled with policies';
        ELSIF rls_enabled AND policy_count = 0 THEN
            status_text := 'WARN - RLS enabled but NO policies (blocks all access!)';
        ELSIF NOT rls_enabled THEN
            status_text := 'FAIL - RLS NOT enabled';
        END IF;

        -- Insert result
        INSERT INTO rls_audit_results (schema_name, table_name, rls_enabled, has_policies, policy_count, status)
        VALUES (r.schemaname, r.tablename, rls_enabled, policy_count > 0, policy_count, status_text);

        -- Output
        IF rls_enabled THEN
            RAISE NOTICE '  [OK] %.%: % policies', r.schemaname, r.tablename, policy_count;
        ELSE
            RAISE WARNING '  [!!] %.%: RLS NOT ENABLED', r.schemaname, r.tablename;
        END IF;
    END LOOP;

END $$;

-- =============================================================================
-- Summary Report
-- =============================================================================

SELECT '' AS " ";
SELECT '============================================' AS "RLS AUDIT SUMMARY";
SELECT '============================================' AS " ";

-- Tables without RLS
SELECT 'CRITICAL: Tables WITHOUT RLS enabled:' AS "Security Issues";
SELECT schema_name || '.' || table_name AS "Table", status
FROM rls_audit_results
WHERE rls_enabled = FALSE
ORDER BY schema_name, table_name;

-- Tables with RLS but no policies (completely blocked!)
SELECT '' AS " ";
SELECT 'WARNING: Tables with RLS but NO policies (all access blocked!):' AS "Potential Issues";
SELECT schema_name || '.' || table_name AS "Table", status
FROM rls_audit_results
WHERE rls_enabled = TRUE AND has_policies = FALSE
ORDER BY schema_name, table_name;

-- Tables properly configured
SELECT '' AS " ";
SELECT 'OK: Tables with RLS and policies:' AS "Properly Configured";
SELECT schema_name || '.' || table_name AS "Table", policy_count AS "Policies"
FROM rls_audit_results
WHERE rls_enabled = TRUE AND has_policies = TRUE
ORDER BY schema_name, table_name;

-- Final summary
SELECT '' AS " ";
SELECT '============================================' AS "FINAL SUMMARY";
SELECT
    COUNT(*) FILTER (WHERE rls_enabled = TRUE AND has_policies = TRUE) AS "OK",
    COUNT(*) FILTER (WHERE rls_enabled = FALSE) AS "FAIL (No RLS)",
    COUNT(*) FILTER (WHERE rls_enabled = TRUE AND has_policies = FALSE) AS "WARN (No Policies)",
    COUNT(*) AS "Total Tables"
FROM rls_audit_results;

-- Exit code guidance
SELECT '' AS " ";
SELECT CASE
    WHEN EXISTS (SELECT 1 FROM rls_audit_results WHERE rls_enabled = FALSE) THEN
        'AUDIT RESULT: FAIL - Some tables do not have RLS enabled!'
    WHEN EXISTS (SELECT 1 FROM rls_audit_results WHERE rls_enabled = TRUE AND has_policies = FALSE) THEN
        'AUDIT RESULT: WARN - Some tables have RLS but no policies'
    ELSE
        'AUDIT RESULT: PASS - All tables have RLS with policies'
END AS "Overall Status";

-- =============================================================================
-- Detailed Policy List
-- =============================================================================

SELECT '' AS " ";
SELECT '============================================' AS "DETAILED POLICY LIST";
SELECT schemaname AS "Schema", tablename AS "Table", policyname AS "Policy", cmd AS "Command", roles::text AS "Roles"
FROM pg_policies
WHERE schemaname IN ('public', 'creative_ops', 'scout')
ORDER BY schemaname, tablename, policyname;
