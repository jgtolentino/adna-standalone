/**
 * Error Handling Utilities
 * Production-grade error handling with logging and graceful degradation
 */

import { logStructured } from '@/lib/observability';

/**
 * Custom API Error with metadata for graceful handling
 */
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public recoverable: boolean = false,
    public fallbackData?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      statusCode: this.statusCode,
      recoverable: this.recoverable,
    };
  }
}

/**
 * Common error codes for consistent error handling
 */
export const ErrorCodes = {
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',

  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Business logic errors
  DATA_STALE: 'DATA_STALE',
  QUERY_TOO_COMPLEX: 'QUERY_TOO_COMPLEX',
  EXPORT_TOO_LARGE: 'EXPORT_TOO_LARGE',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Create a typed API error
 */
export function createAPIError(
  code: ErrorCode,
  message: string,
  options?: {
    statusCode?: number;
    recoverable?: boolean;
    fallbackData?: unknown;
  }
): APIError {
  const statusMap: Record<ErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    VALIDATION_FAILED: 422,
    INTERNAL_ERROR: 500,
    DATABASE_ERROR: 500,
    AI_SERVICE_ERROR: 503,
    TIMEOUT: 504,
    SERVICE_UNAVAILABLE: 503,
    DATA_STALE: 200, // Still return data, just warn
    QUERY_TOO_COMPLEX: 400,
    EXPORT_TOO_LARGE: 413,
  };

  return new APIError(
    message,
    options?.statusCode ?? statusMap[code],
    code,
    options?.recoverable ?? false,
    options?.fallbackData
  );
}

/**
 * Wrap an async operation with error handling and optional fallback
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  options: {
    fallback?: T;
    logContext?: Record<string, unknown>;
    rethrow?: boolean;
    timeout?: number;
  } = {}
): Promise<T> {
  try {
    if (options.timeout) {
      return await withTimeout(operation(), options.timeout);
    }
    return await operation();
  } catch (error) {
    logStructured('error_caught', {
      component: 'error_handler',
      action: 'handle',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 3).join('\n') : undefined,
      ...options.logContext,
    }, 'error');

    if (options.rethrow) {
      throw error;
    }

    if (options.fallback !== undefined) {
      return options.fallback;
    }

    throw error;
  }
}

/**
 * Wrap a promise with a timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError?: Error
): Promise<T> {
  let timeoutId: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(timeoutError || createAPIError('TIMEOUT', `Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result;
  } catch (error) {
    clearTimeout(timeoutId!);
    throw error;
  }
}

/**
 * Retry an operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = () => true,
    onRetry,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt >= maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);

      onRetry?.(attempt + 1, error);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Extract a safe error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Check if an error is a specific type
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

export function isTimeoutError(error: unknown): boolean {
  return isAPIError(error) && error.code === 'TIMEOUT';
}

export function isRecoverableError(error: unknown): boolean {
  return isAPIError(error) && error.recoverable;
}
