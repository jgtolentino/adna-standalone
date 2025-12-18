import { NextResponse } from 'next/server';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { logStructured, createTimer } from '@/lib/observability';

/**
 * Production Health Check Endpoint
 * Returns detailed status of all system components
 *
 * Status codes:
 * - 200: healthy or degraded (some non-critical services down)
 * - 503: unhealthy (critical services down)
 */

interface ServiceCheck {
  status: 'ok' | 'degraded' | 'error';
  latencyMs: number;
  message?: string;
  lastSuccess?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: ServiceCheck;
    supabaseConfig: ServiceCheck;
    dataFreshness: ServiceCheck;
  };
}

export async function GET() {
  const requestTimer = createTimer();

  const checks = await Promise.allSettled([
    checkDatabase(),
    checkSupabaseConfig(),
    checkDataFreshness(),
  ]);

  const [dbResult, configResult, freshnessResult] = checks;

  const database: ServiceCheck =
    dbResult.status === 'fulfilled'
      ? dbResult.value
      : { status: 'error', latencyMs: -1, message: String(dbResult.reason) };

  const supabaseConfig: ServiceCheck =
    configResult.status === 'fulfilled'
      ? configResult.value
      : { status: 'error', latencyMs: 0, message: String(configResult.reason) };

  const dataFreshness: ServiceCheck =
    freshnessResult.status === 'fulfilled'
      ? freshnessResult.value
      : { status: 'error', latencyMs: -1, message: String(freshnessResult.reason) };

  // Determine overall status
  // - Database down = unhealthy
  // - Config issues = unhealthy
  // - Data freshness issues = degraded (still usable)
  const overallStatus: HealthResponse['status'] =
    database.status === 'error' || supabaseConfig.status === 'error'
      ? 'unhealthy'
      : dataFreshness.status === 'error'
        ? 'degraded'
        : 'healthy';

  const response: HealthResponse = {
    status: overallStatus,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0,
    checks: {
      database,
      supabaseConfig,
      dataFreshness,
    },
  };

  // Log health check result
  logStructured('health_check', {
    component: 'health',
    action: 'check',
    status: overallStatus,
    latencyMs: requestTimer.elapsed(),
    dbStatus: database.status,
    dbLatencyMs: database.latencyMs,
  });

  return NextResponse.json(response, {
    status: overallStatus === 'unhealthy' ? 503 : 200,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * Check database connectivity and basic query performance
 */
async function checkDatabase(): Promise<ServiceCheck> {
  const timer = createTimer();

  try {
    const supabase = getSupabase();

    // Simple query to verify connectivity
    const { error } = await supabase
      .from('scout_gold_transactions_flat')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        status: 'error',
        latencyMs: timer.elapsed(),
        message: error.message,
      };
    }

    const latency = timer.elapsed();

    // Warn if database is slow (> 1 second for simple query)
    if (latency > 1000) {
      return {
        status: 'degraded',
        latencyMs: latency,
        message: 'Database responding slowly',
      };
    }

    return {
      status: 'ok',
      latencyMs: latency,
      lastSuccess: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: timer.elapsed(),
      message: error instanceof Error ? error.message : 'Database check failed',
    };
  }
}

/**
 * Check Supabase configuration
 */
async function checkSupabaseConfig(): Promise<ServiceCheck> {
  const timer = createTimer();

  const configured = isSupabaseConfigured();

  if (!configured) {
    return {
      status: 'error',
      latencyMs: timer.elapsed(),
      message: 'Supabase not configured - using placeholder credentials',
    };
  }

  return {
    status: 'ok',
    latencyMs: timer.elapsed(),
  };
}

/**
 * Check data freshness by querying latest transaction timestamp
 */
async function checkDataFreshness(): Promise<ServiceCheck> {
  const timer = createTimer();

  try {
    const supabase = getSupabase();

    // Check if we have recent data (within last 24 hours)
    const { data, error } = await supabase
      .from('scout_gold_transactions_flat')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        status: 'error',
        latencyMs: timer.elapsed(),
        message: error.message,
      };
    }

    if (!data?.timestamp) {
      return {
        status: 'degraded',
        latencyMs: timer.elapsed(),
        message: 'No transaction data found',
      };
    }

    const lastUpdate = new Date(data.timestamp);
    const ageHours = (Date.now() - lastUpdate.getTime()) / 3600000;

    // Data older than 24 hours is considered stale
    if (ageHours > 24) {
      return {
        status: 'degraded',
        latencyMs: timer.elapsed(),
        message: `Data is ${Math.round(ageHours)} hours old`,
        lastSuccess: lastUpdate.toISOString(),
      };
    }

    return {
      status: 'ok',
      latencyMs: timer.elapsed(),
      lastSuccess: lastUpdate.toISOString(),
    };
  } catch (error) {
    return {
      status: 'error',
      latencyMs: timer.elapsed(),
      message: error instanceof Error ? error.message : 'Freshness check failed',
    };
  }
}

/**
 * Liveness probe - minimal check for container orchestration
 * Always returns 200 if the service is running
 */
export async function HEAD() {
  return new Response(null, { status: 200 });
}
