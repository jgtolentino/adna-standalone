/**
 * Structured Logging Service
 * Production-grade logging with request context and external service integration
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export interface LogContext {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  component: string;
  action: string;
  [key: string]: unknown;
}

interface LogEntry extends LogContext {
  timestamp: string;
  level: LogLevel;
  environment: string;
  version: string;
}

// In-memory buffer for batch sending (Vercel Edge compatible)
const logBuffer: LogEntry[] = [];
const MAX_BUFFER_SIZE = 100;

/**
 * Log a structured event with context
 */
export function logStructured(
  action: string,
  context: Omit<LogContext, 'action'>,
  level: LogLevel = 'info'
): void {
  const entry = {
    ...context,
    timestamp: new Date().toISOString(),
    level,
    action,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
  } as LogEntry;

  // Console output as structured JSON for log aggregation
  const consoleMethod = level === 'critical' ? 'error' : level;
  console[consoleMethod](JSON.stringify(entry));

  // Buffer for external service
  if (process.env.LOGFLARE_API_KEY || process.env.LOG_EXTERNAL) {
    bufferLog(entry);
  }
}

/**
 * Create a logger instance with preset context
 */
export function createLogger(baseContext: Partial<LogContext>) {
  return {
    debug: (action: string, ctx?: Partial<LogContext>) =>
      logStructured(action, { ...baseContext, ...ctx } as LogContext, 'debug'),
    info: (action: string, ctx?: Partial<LogContext>) =>
      logStructured(action, { ...baseContext, ...ctx } as LogContext, 'info'),
    warn: (action: string, ctx?: Partial<LogContext>) =>
      logStructured(action, { ...baseContext, ...ctx } as LogContext, 'warn'),
    error: (action: string, ctx?: Partial<LogContext>) =>
      logStructured(action, { ...baseContext, ...ctx } as LogContext, 'error'),
    critical: (action: string, ctx?: Partial<LogContext>) =>
      logStructured(action, { ...baseContext, ...ctx } as LogContext, 'critical'),
  };
}

/**
 * Buffer logs for batch sending to external service
 */
function bufferLog(entry: LogEntry): void {
  logBuffer.push(entry);

  if (logBuffer.length >= MAX_BUFFER_SIZE) {
    flushLogs().catch(() => {
      // Silent fail - don't break the app for logging issues
    });
  }
}

/**
 * Flush buffered logs to external service
 */
export async function flushLogs(): Promise<void> {
  if (logBuffer.length === 0) return;

  const logs = logBuffer.splice(0, logBuffer.length);

  // Logflare integration
  if (process.env.LOGFLARE_API_KEY && process.env.LOGFLARE_SOURCE_ID) {
    try {
      await fetch(`https://api.logflare.app/logs/json?source=${process.env.LOGFLARE_SOURCE_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': process.env.LOGFLARE_API_KEY,
        },
        body: JSON.stringify({ batch: logs }),
      });
    } catch {
      // Re-buffer on failure (but don't exceed max)
      if (logBuffer.length < MAX_BUFFER_SIZE) {
        logBuffer.push(...logs.slice(0, MAX_BUFFER_SIZE - logBuffer.length));
      }
    }
  }
}

/**
 * Request context helper for API routes
 */
export function getRequestContext(req: Request): Partial<LogContext> {
  const url = new URL(req.url);
  return {
    requestId: req.headers.get('x-request-id') || crypto.randomUUID(),
    path: url.pathname,
    method: req.method,
    userAgent: req.headers.get('user-agent') || undefined,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
  };
}

/**
 * Timing helper for measuring operation duration
 */
export function createTimer() {
  const start = performance.now();
  return {
    elapsed: () => Math.round(performance.now() - start),
    elapsedMs: () => performance.now() - start,
  };
}

// Export singleton logger for convenience
export const logger = createLogger({ component: 'scout-dashboard' });
