/**
 * Environment variable validation using Zod
 * This file validates all required environment variables at build/runtime
 * and provides type-safe access to configuration values.
 *
 * Fail-fast approach: If required env vars are missing, the app won't build or start.
 * Exception: During CI builds, validation is relaxed to allow builds with placeholder values.
 */

import { z } from 'zod';

// =============================================================================
// CI/Build Detection
// =============================================================================

/**
 * Check if we're in a CI build environment where strict validation should be skipped
 */
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const isBuildPhase = process.env.npm_lifecycle_event === 'build' ||
                     process.env.NEXT_PHASE === 'phase-production-build';
const skipValidation = process.env.SKIP_ENV_VALIDATION === 'true';

// In CI/build, allow placeholder URLs
const shouldRelaxValidation = isCI || isBuildPhase || skipValidation;

// =============================================================================
// Schema Definition
// =============================================================================

/**
 * Server-side environment variables (not exposed to client)
 * These are only available in Server Components, API Routes, and Server Actions
 */
const serverEnvSchema = z.object({
  // Service role key should NEVER be exposed to the client
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  // Internal API tokens
  CES_API_TOKEN: z.string().optional(),
});

/**
 * Client-side environment variables (prefixed with NEXT_PUBLIC_)
 * These are bundled into the client JavaScript and visible to users
 */
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: shouldRelaxValidation
    ? z.string().min(1, 'NEXT_PUBLIC_SUPABASE_URL is required').default('https://placeholder.supabase.co')
    : z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL').min(1, 'NEXT_PUBLIC_SUPABASE_URL is required'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: shouldRelaxValidation
    ? z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required').default('placeholder-anon-key')
    : z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  // Feature flags
  NEXT_PUBLIC_USE_MOCK: z
    .enum(['0', '1', 'true', 'false'])
    .optional()
    .default('0'),
  NEXT_PUBLIC_STRICT_DATASOURCE: z
    .enum(['true', 'false'])
    .optional()
    .default('false'),
  // Environment identifier
  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(['development', 'preview', 'production'])
    .optional()
    .default('development'),
});

// Combined schema for full validation
const envSchema = serverEnvSchema.merge(clientEnvSchema);

// =============================================================================
// Validation and Export
// =============================================================================

type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Called at module load time to fail fast on missing config
 */
function validateEnv(): EnvConfig {
  // Skip validation entirely if explicitly requested (useful for CI)
  if (skipValidation) {
    console.log('ℹ️ Environment validation skipped (SKIP_ENV_VALIDATION=true)');
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key',
      NEXT_PUBLIC_USE_MOCK: (process.env.NEXT_PUBLIC_USE_MOCK as '0' | '1' | 'true' | 'false') || '0',
      NEXT_PUBLIC_STRICT_DATASOURCE: (process.env.NEXT_PUBLIC_STRICT_DATASOURCE as 'true' | 'false') || 'false',
      NEXT_PUBLIC_ENVIRONMENT: (process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'preview' | 'production') || 'development',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      CES_API_TOKEN: process.env.CES_API_TOKEN,
    } as EnvConfig;
  }

  // Only validate on server or at build time
  if (typeof window !== 'undefined') {
    // On client, only validate client env vars
    const clientEnv = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
      NEXT_PUBLIC_STRICT_DATASOURCE: process.env.NEXT_PUBLIC_STRICT_DATASOURCE,
      NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    };

    const result = clientEnvSchema.safeParse(clientEnv);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      // In CI, just warn instead of failing
      if (shouldRelaxValidation) {
        console.warn('⚠️ Client environment validation issues (CI mode - continuing):');
        Object.entries(errors).forEach(([key, messages]) => {
          console.warn(`  ${key}: ${messages?.join(', ')}`);
        });
        return {
          NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
          NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
          NEXT_PUBLIC_USE_MOCK: '0',
          NEXT_PUBLIC_STRICT_DATASOURCE: 'false',
          NEXT_PUBLIC_ENVIRONMENT: 'development',
        } as EnvConfig;
      }
      console.error('❌ Client environment validation failed:');
      Object.entries(errors).forEach(([key, messages]) => {
        console.error(`  ${key}: ${messages?.join(', ')}`);
      });
      throw new Error(
        `Missing or invalid environment variables: ${Object.keys(errors).join(', ')}`
      );
    }
    return result.data as EnvConfig;
  }

  // On server, validate all env vars
  const serverEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_USE_MOCK: process.env.NEXT_PUBLIC_USE_MOCK,
    NEXT_PUBLIC_STRICT_DATASOURCE: process.env.NEXT_PUBLIC_STRICT_DATASOURCE,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    CES_API_TOKEN: process.env.CES_API_TOKEN,
  };

  const result = envSchema.safeParse(serverEnv);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    // In CI, just warn instead of failing
    if (shouldRelaxValidation) {
      console.warn('⚠️ Server environment validation issues (CI mode - continuing):');
      Object.entries(errors).forEach(([key, messages]) => {
        console.warn(`  ${key}: ${messages?.join(', ')}`);
      });
      return {
        NEXT_PUBLIC_SUPABASE_URL: 'https://placeholder.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'placeholder-anon-key',
        NEXT_PUBLIC_USE_MOCK: '0',
        NEXT_PUBLIC_STRICT_DATASOURCE: 'false',
        NEXT_PUBLIC_ENVIRONMENT: 'development',
        SUPABASE_SERVICE_ROLE_KEY: undefined,
        CES_API_TOKEN: undefined,
      } as EnvConfig;
    }
    console.error('❌ Server environment validation failed:');
    Object.entries(errors).forEach(([key, messages]) => {
      console.error(`  ${key}: ${messages?.join(', ')}`);
    });
    throw new Error(
      `Missing or invalid environment variables: ${Object.keys(errors).join(', ')}`
    );
  }

  return result.data;
}

// =============================================================================
// Export validated env object
// =============================================================================

export const env = validateEnv();

// =============================================================================
// Helper functions
// =============================================================================

/**
 * Check if we're in production environment
 */
export function isProduction(): boolean {
  return env.NEXT_PUBLIC_ENVIRONMENT === 'production';
}

/**
 * Check if mock data is enabled (only allowed in non-production)
 */
export function isMockEnabled(): boolean {
  if (isProduction()) {
    return false; // Never allow mocks in production
  }
  return env.NEXT_PUBLIC_USE_MOCK === '1' || env.NEXT_PUBLIC_USE_MOCK === 'true';
}

/**
 * Check if strict datasource mode is enabled
 */
export function isStrictDatasource(): boolean {
  return env.NEXT_PUBLIC_STRICT_DATASOURCE === 'true';
}

/**
 * Runtime assertion that we're not using mocks in production
 */
export function assertNoMockInProd(): void {
  if (isProduction() && isMockEnabled()) {
    throw new Error(
      'FATAL: Mock data is enabled in production! ' +
        'Set NEXT_PUBLIC_USE_MOCK=0 for production builds.'
    );
  }
}
