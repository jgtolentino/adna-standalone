-- Scout Dashboard Production Hardening
-- Migration: 054_audit_log.sql
-- Purpose: Create immutable audit log table for compliance and debugging
-- Author: TBWA Enterprise Platform
-- Date: 2024-12-16

-------------------------------------------------------------------------------
-- AUDIT LOG TABLE
-- Immutable, append-only log of all significant system events
-------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Actor information
  user_id UUID,
  tenant_id TEXT,
  session_id TEXT,

  -- Event details
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT,

  -- Context
  metadata JSONB DEFAULT '{}',

  -- Request context
  ip INET,
  user_agent TEXT,
  request_id TEXT,

  -- Source system
  source TEXT DEFAULT 'scout-dashboard',
  environment TEXT DEFAULT 'production'
);

-- Comment for documentation
COMMENT ON TABLE public.audit_log IS 'Immutable audit log for compliance and debugging. No updates or deletes allowed.';
COMMENT ON COLUMN public.audit_log.action IS 'The action performed (e.g., nlq_query, data_export, login, logout)';
COMMENT ON COLUMN public.audit_log.resource IS 'The resource type affected (e.g., transactions, reports, users)';
COMMENT ON COLUMN public.audit_log.metadata IS 'Additional context as JSON (query params, response status, etc.)';

-------------------------------------------------------------------------------
-- IMMUTABILITY TRIGGER
-- Prevents any modification or deletion of audit records
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries cannot be modified or deleted. This is a compliance requirement.';
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists (idempotent)
DROP TRIGGER IF EXISTS audit_log_immutable_update ON public.audit_log;
DROP TRIGGER IF EXISTS audit_log_immutable_delete ON public.audit_log;

CREATE TRIGGER audit_log_immutable_update
  BEFORE UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_log_immutable_delete
  BEFORE DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-------------------------------------------------------------------------------
-- INDEXES FOR COMMON QUERIES
-------------------------------------------------------------------------------

-- User activity lookup
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON public.audit_log(user_id) WHERE user_id IS NOT NULL;

-- Time-based queries (most common)
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_log(timestamp DESC);

-- Action filtering
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_log(action);

-- Resource filtering
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_log(resource);

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_audit_user_time ON public.audit_log(user_id, timestamp DESC) WHERE user_id IS NOT NULL;

-- Tenant-based lookup
CREATE INDEX IF NOT EXISTS idx_audit_tenant ON public.audit_log(tenant_id) WHERE tenant_id IS NOT NULL;

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Users can only see their own audit logs, admins see all
-------------------------------------------------------------------------------

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Service role can insert (for server-side logging)
CREATE POLICY "Service role can insert audit logs"
  ON public.audit_log
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

-- Users can view their own logs
CREATE POLICY "Users can view own audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all logs in their tenant (requires user_profiles table)
-- This policy will be updated after user_profiles migration

-------------------------------------------------------------------------------
-- GRANTS
-------------------------------------------------------------------------------

GRANT INSERT ON public.audit_log TO authenticated, anon;
GRANT SELECT ON public.audit_log TO authenticated;

-------------------------------------------------------------------------------
-- RETENTION POLICY HELPER
-- Function to clean old audit logs (run via cron, not automatic deletion)
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION archive_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- This function moves old logs to an archive table rather than deleting
  -- Actual deletion should be a manual, documented process for compliance

  WITH moved AS (
    SELECT id FROM public.audit_log
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL
    LIMIT 10000  -- Process in batches
  )
  SELECT COUNT(*) INTO archived_count FROM moved;

  -- In production, you would INSERT INTO audit_log_archive SELECT ...
  -- and then have a separate process to delete from audit_log
  -- For now, just return count of what would be archived

  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_old_audit_logs IS 'Returns count of audit logs older than retention_days. Actual archival should be handled by a separate ETL process.';

-------------------------------------------------------------------------------
-- MIGRATION COMPLETE
-------------------------------------------------------------------------------
