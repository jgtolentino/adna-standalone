/**
 * Audit Logging
 * Immutable audit trail for compliance and security
 */

import { getSupabase } from '@/lib/supabaseClient';
import { logStructured } from '@/lib/observability';
import type { UserSession } from './session';

/**
 * Audit event structure
 */
export interface AuditEvent {
  timestamp: string;
  userId: string;
  tenantId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Common audit actions
 */
export const AuditActions = {
  // Authentication
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  LOGIN_FAILED: 'auth.login_failed',

  // Data access
  DATA_VIEW: 'data.view',
  DATA_QUERY: 'data.query',
  DATA_EXPORT: 'data.export',

  // NLQ/AI
  NLQ_QUERY: 'nlq.query',
  NLQ_RESULT: 'nlq.result',

  // Admin
  USER_CREATE: 'admin.user_create',
  USER_UPDATE: 'admin.user_update',
  USER_DELETE: 'admin.user_delete',
  ROLE_CHANGE: 'admin.role_change',

  // System
  SETTING_CHANGE: 'system.setting_change',
  API_ERROR: 'system.api_error',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

/**
 * Log an audit event
 */
export async function logAuditEvent(
  event: Omit<AuditEvent, 'timestamp'>
): Promise<void> {
  const entry: AuditEvent = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  // Always log to structured logging (synchronous, fast)
  logStructured('audit', {
    component: 'audit',
    action: event.action,
    resource: event.resource,
    resourceId: event.resourceId,
    userId: event.userId,
    tenantId: event.tenantId,
    ...event.metadata,
  });

  // Persist to database (async, fire and forget)
  persistAuditEvent(entry).catch(error => {
    logStructured('audit_persist_failed', {
      component: 'audit',
      action: 'persist',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, 'error');
  });
}

/**
 * Persist audit event to database
 */
async function persistAuditEvent(event: AuditEvent): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('audit_log').insert({
    user_id: event.userId,
    tenant_id: event.tenantId,
    action: event.action,
    resource: event.resource,
    resource_id: event.resourceId,
    metadata: event.metadata,
    ip: event.ip,
    user_agent: event.userAgent,
    request_id: event.requestId,
    timestamp: event.timestamp,
  });

  if (error) {
    throw error;
  }
}

/**
 * Create audit logger for a specific session
 */
export function createAuditLogger(session: UserSession, requestContext?: {
  requestId?: string;
  ip?: string;
  userAgent?: string;
}) {
  return {
    log: (
      action: AuditAction,
      resource: string,
      options?: {
        resourceId?: string;
        metadata?: Record<string, unknown>;
      }
    ) => {
      return logAuditEvent({
        userId: session.userId,
        tenantId: session.tenantId,
        action,
        resource,
        resourceId: options?.resourceId,
        metadata: options?.metadata,
        requestId: requestContext?.requestId,
        ip: requestContext?.ip,
        userAgent: requestContext?.userAgent,
      });
    },
  };
}

/**
 * Middleware wrapper for API routes with audit logging
 */
export function withAudit<T>(
  handler: (req: Request, session: UserSession) => Promise<Response>,
  options: {
    action: AuditAction;
    resource: string;
    getResourceId?: (req: Request) => string | undefined;
  }
) {
  return async (req: Request, session: UserSession): Promise<Response> => {
    const startTime = performance.now();
    const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

    try {
      const response = await handler(req, session);

      // Log successful operation
      await logAuditEvent({
        userId: session.userId,
        tenantId: session.tenantId,
        action: options.action,
        resource: options.resource,
        resourceId: options.getResourceId?.(req),
        metadata: {
          method: req.method,
          path: new URL(req.url).pathname,
          status: response.status,
          durationMs: Math.round(performance.now() - startTime),
        },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        requestId,
      });

      return response;
    } catch (error) {
      // Log failed operation
      await logAuditEvent({
        userId: session.userId,
        tenantId: session.tenantId,
        action: AuditActions.API_ERROR,
        resource: options.resource,
        resourceId: options.getResourceId?.(req),
        metadata: {
          method: req.method,
          path: new URL(req.url).pathname,
          error: error instanceof Error ? error.message : 'Unknown error',
          originalAction: options.action,
          durationMs: Math.round(performance.now() - startTime),
        },
        ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
        userAgent: req.headers.get('user-agent') || undefined,
        requestId,
      });

      throw error;
    }
  };
}

/**
 * Query audit logs for a user
 */
export async function getAuditLogs(options: {
  userId?: string;
  tenantId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<AuditEvent[]> {
  const supabase = getSupabase();

  let query = supabase
    .from('audit_log')
    .select('*')
    .order('timestamp', { ascending: false });

  if (options.userId) {
    query = query.eq('user_id', options.userId);
  }

  if (options.tenantId) {
    query = query.eq('tenant_id', options.tenantId);
  }

  if (options.action) {
    query = query.eq('action', options.action);
  }

  if (options.resource) {
    query = query.eq('resource', options.resource);
  }

  if (options.startDate) {
    query = query.gte('timestamp', options.startDate.toISOString());
  }

  if (options.endDate) {
    query = query.lte('timestamp', options.endDate.toISOString());
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []).map(row => ({
    timestamp: row.timestamp,
    userId: row.user_id,
    tenantId: row.tenant_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    metadata: row.metadata,
    ip: row.ip,
    userAgent: row.user_agent,
    requestId: row.request_id,
  }));
}
