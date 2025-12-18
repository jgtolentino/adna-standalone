-- Scout Dashboard Production Hardening
-- Migration: 055_user_profiles_rbac.sql
-- Purpose: User profiles with Role-Based Access Control
-- Author: TBWA Enterprise Platform
-- Date: 2024-12-16

-------------------------------------------------------------------------------
-- USER PROFILES TABLE
-- Extends Supabase auth.users with application-specific data
-------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_profiles (
  -- Primary key references Supabase auth user
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Multi-tenancy
  tenant_id TEXT NOT NULL DEFAULT 'default',

  -- Role-based access
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('viewer', 'analyst', 'admin', 'super_admin')),

  -- Granular permissions (array of permission strings)
  permissions TEXT[] DEFAULT '{}',

  -- Profile metadata
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,

  -- Feature flags per user
  feature_flags JSONB DEFAULT '{}',

  -- Usage tracking
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
COMMENT ON TABLE public.user_profiles IS 'User profiles with RBAC and multi-tenancy support';
COMMENT ON COLUMN public.user_profiles.role IS 'User role: viewer (read-only), analyst (can query), admin (full access), super_admin (cross-tenant)';
COMMENT ON COLUMN public.user_profiles.permissions IS 'Array of granular permissions like [nlq:query, export:csv, admin:users]';
COMMENT ON COLUMN public.user_profiles.feature_flags IS 'Per-user feature toggles as JSON object';

-------------------------------------------------------------------------------
-- ROLE DEFINITIONS
-- Reference documentation for what each role can do
-------------------------------------------------------------------------------

COMMENT ON COLUMN public.user_profiles.role IS E'Role definitions:\n- viewer: Read dashboards, no exports\n- analyst: Query data, use NLQ, export\n- admin: Manage users in tenant, all analyst permissions\n- super_admin: Cross-tenant access, system configuration';

-------------------------------------------------------------------------------
-- INDEXES
-------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant ON public.user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email) WHERE email IS NOT NULL;

-------------------------------------------------------------------------------
-- AUTO-UPDATE TIMESTAMP TRIGGER
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_user_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_user_profile_timestamp();

-------------------------------------------------------------------------------
-- AUTO-CREATE PROFILE ON USER SIGNUP
-------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, display_name, tenant_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tenant_id', 'default')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-------------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-------------------------------------------------------------------------------

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    -- Prevent self-role escalation
    AND (
      role = (SELECT role FROM public.user_profiles WHERE user_id = auth.uid())
      OR (SELECT role FROM public.user_profiles WHERE user_id = auth.uid()) IN ('admin', 'super_admin')
    )
  );

-- Admins can view all profiles in their tenant
CREATE POLICY "Admins can view tenant profiles"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Admins can update profiles in their tenant (except super_admins)
CREATE POLICY "Admins can update tenant profiles"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE user_id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
    -- Cannot modify super_admins
    AND role != 'super_admin'
  );

-- Super admins can see everything
CREATE POLICY "Super admins can view all"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND role = 'super_admin'
    )
  );

-------------------------------------------------------------------------------
-- HELPER FUNCTIONS
-------------------------------------------------------------------------------

-- Check if user has a specific permission
CREATE OR REPLACE FUNCTION has_permission(user_uuid UUID, permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  user_permissions TEXT[];
BEGIN
  SELECT role, permissions INTO user_role, user_permissions
  FROM public.user_profiles
  WHERE user_id = user_uuid;

  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Admin has most permissions
  IF user_role = 'admin' AND permission NOT LIKE 'super_%' THEN
    RETURN TRUE;
  END IF;

  -- Check explicit permissions
  RETURN permission = ANY(user_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's role
CREATE OR REPLACE FUNCTION get_user_role(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.user_profiles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's tenant
CREATE OR REPLACE FUNCTION get_user_tenant(user_uuid UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT tenant_id FROM public.user_profiles WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-------------------------------------------------------------------------------
-- UPDATE AUDIT LOG RLS FOR ADMIN ACCESS
-------------------------------------------------------------------------------

-- Admins can view all audit logs in their tenant
CREATE POLICY "Admins can view tenant audit logs"
  ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.role IN ('admin', 'super_admin')
      AND (
        up.role = 'super_admin'
        OR up.tenant_id = audit_log.tenant_id
      )
    )
  );

-------------------------------------------------------------------------------
-- GRANTS
-------------------------------------------------------------------------------

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT UPDATE (display_name, avatar_url, feature_flags) ON public.user_profiles TO authenticated;

-- Allow service role full access for admin operations
GRANT ALL ON public.user_profiles TO service_role;

-- Function grants
GRANT EXECUTE ON FUNCTION has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenant TO authenticated;

-------------------------------------------------------------------------------
-- SEED DEFAULT ADMIN (optional, run manually)
-------------------------------------------------------------------------------

-- To create an admin user after signup:
-- UPDATE public.user_profiles SET role = 'admin' WHERE email = 'admin@example.com';

-------------------------------------------------------------------------------
-- MIGRATION COMPLETE
-------------------------------------------------------------------------------
