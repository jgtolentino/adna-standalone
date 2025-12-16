/**
 * Session Management
 * Server-side session handling with Supabase Auth
 */

import { getSupabase } from '@/lib/supabaseClient';
import { logStructured } from '@/lib/observability';

/**
 * User session with role and permissions
 */
export interface UserSession {
  userId: string;
  email: string;
  role: 'viewer' | 'analyst' | 'admin' | 'super_admin';
  tenantId: string;
  permissions: string[];
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Permission definitions
 */
export const Permissions = {
  // Data access
  DATA_READ: 'data:read',
  DATA_EXPORT: 'data:export',

  // NLQ/AI
  NLQ_QUERY: 'nlq:query',
  NLQ_ADVANCED: 'nlq:advanced',

  // Admin
  ADMIN_USERS: 'admin:users',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_AUDIT: 'admin:audit',

  // Super admin
  SUPER_TENANTS: 'super:tenants',
  SUPER_SYSTEM: 'super:system',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

/**
 * Role to permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserSession['role'], Permission[]> = {
  viewer: [Permissions.DATA_READ],
  analyst: [
    Permissions.DATA_READ,
    Permissions.DATA_EXPORT,
    Permissions.NLQ_QUERY,
  ],
  admin: [
    Permissions.DATA_READ,
    Permissions.DATA_EXPORT,
    Permissions.NLQ_QUERY,
    Permissions.NLQ_ADVANCED,
    Permissions.ADMIN_USERS,
    Permissions.ADMIN_SETTINGS,
    Permissions.ADMIN_AUDIT,
  ],
  super_admin: Object.values(Permissions),
};

/**
 * Get current user session from Supabase
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const supabase = getSupabase();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, tenant_id, permissions, display_name, avatar_url')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      // Profile might not exist yet - create with defaults
      logStructured('session_profile_missing', {
        component: 'auth',
        action: 'get_session',
        userId: user.id,
      }, 'warn');

      return {
        userId: user.id,
        email: user.email || '',
        role: 'viewer',
        tenantId: 'default',
        permissions: ROLE_PERMISSIONS.viewer,
      };
    }

    return {
      userId: user.id,
      email: user.email || '',
      role: profile.role || 'viewer',
      tenantId: profile.tenant_id || 'default',
      permissions: [
        ...ROLE_PERMISSIONS[profile.role as UserSession['role']] || [],
        ...(profile.permissions || []),
      ],
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    logStructured('session_error', {
      component: 'auth',
      action: 'get_session',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');

    return null;
  }
}

/**
 * Check if session has a specific permission
 */
export function hasPermission(session: UserSession | null, permission: Permission): boolean {
  if (!session) {
    return false;
  }

  // Super admin has all permissions
  if (session.role === 'super_admin') {
    return true;
  }

  return session.permissions.includes(permission);
}

/**
 * Check if session has any of the specified permissions
 */
export function hasAnyPermission(session: UserSession | null, permissions: Permission[]): boolean {
  if (!session) {
    return false;
  }

  return permissions.some(p => hasPermission(session, p));
}

/**
 * Check if session has all of the specified permissions
 */
export function hasAllPermissions(session: UserSession | null, permissions: Permission[]): boolean {
  if (!session) {
    return false;
  }

  return permissions.every(p => hasPermission(session, p));
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    throw new Error('Authentication required');
  }

  return session;
}

/**
 * Require specific permission - throws if not authorized
 */
export async function requirePermission(permission: Permission): Promise<UserSession> {
  const session = await requireAuth();

  if (!hasPermission(session, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }

  return session;
}

/**
 * Check if user can access a specific tenant
 */
export function canAccessTenant(session: UserSession | null, tenantId: string): boolean {
  if (!session) {
    return false;
  }

  // Super admin can access any tenant
  if (session.role === 'super_admin') {
    return true;
  }

  return session.tenantId === tenantId;
}
