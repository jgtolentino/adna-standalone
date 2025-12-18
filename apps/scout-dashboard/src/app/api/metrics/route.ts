import { NextResponse } from 'next/server';
import { getAllMetricsSummary, getAllCounters } from '@/lib/observability';

/**
 * Metrics Endpoint
 * Returns collected metrics summaries for monitoring dashboards
 *
 * Protected by bearer token in production
 */

export async function GET(req: Request) {
  // Verify authorization in production
  const metricsSecret = process.env.METRICS_SECRET;
  if (metricsSecret) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${metricsSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const metrics = getAllMetricsSummary();
  const counters = getAllCounters();

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'dev',
      environment: process.env.VERCEL_ENV || 'development',
      uptime: process.uptime ? process.uptime() : 0,
      metrics,
      counters,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
