/**
 * Auth Module Exports
 * Centralized export for authentication, authorization, and audit
 */

export {
  getSession,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requireAuth,
  requirePermission,
  canAccessTenant,
  Permissions,
  type UserSession,
  type Permission,
} from './session';

export {
  logAuditEvent,
  createAuditLogger,
  withAudit,
  getAuditLogs,
  AuditActions,
  type AuditEvent,
  type AuditAction,
} from './audit';
