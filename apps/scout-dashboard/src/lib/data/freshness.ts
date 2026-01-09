/**
 * Data Freshness Monitoring
 * Tracks SLAs for data views and alerts on staleness
 */

import { getSupabase } from '@/lib/supabaseClient';
import { logStructured } from '@/lib/observability';

/**
 * Configuration for freshness checks
 */
interface FreshnessConfig {
  view: string;
  maxAgeMinutes: number;
  timestampColumn: string;
  alertThreshold: 'warn' | 'error';
  description: string;
}

/**
 * Result of a freshness check
 */
interface FreshnessCheckResult {
  view: string;
  status: 'ok' | 'warn' | 'error';
  lastUpdate: string | null;
  ageMinutes: number;
  slaMinutes: number;
  message?: string;
}

/**
 * Overall freshness report
 */
export interface FreshnessReport {
  overallStatus: 'ok' | 'warn' | 'error';
  checkedAt: string;
  views: FreshnessCheckResult[];
}

/**
 * SLA definitions for Scout Dashboard views
 */
export const FRESHNESS_SLAS: FreshnessConfig[] = [
  {
    view: 'scout_gold_transactions_flat',
    maxAgeMinutes: 15,
    timestampColumn: 'timestamp',
    alertThreshold: 'error',
    description: 'Transaction data - core dashboard source',
  },
  {
    view: 'scout_stats_summary',
    maxAgeMinutes: 60,
    timestampColumn: 'updated_at',
    alertThreshold: 'warn',
    description: 'KPI summary statistics',
  },
];

/**
 * Check freshness of a single view
 */
async function checkViewFreshness(config: FreshnessConfig): Promise<FreshnessCheckResult> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from(config.view)
      .select(config.timestampColumn)
      .order(config.timestampColumn, { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return {
        view: config.view,
        status: 'error',
        lastUpdate: null,
        ageMinutes: -1,
        slaMinutes: config.maxAgeMinutes,
        message: error.message,
      };
    }

    const record = data as unknown as Record<string, unknown>;
    if (!record || !record[config.timestampColumn]) {
      return {
        view: config.view,
        status: 'error',
        lastUpdate: null,
        ageMinutes: -1,
        slaMinutes: config.maxAgeMinutes,
        message: 'No data found in view',
      };
    }

    const lastUpdate = new Date(record[config.timestampColumn] as string);
    const ageMinutes = (Date.now() - lastUpdate.getTime()) / 60000;
    const isStale = ageMinutes > config.maxAgeMinutes;

    return {
      view: config.view,
      status: isStale ? config.alertThreshold : 'ok',
      lastUpdate: lastUpdate.toISOString(),
      ageMinutes: Math.round(ageMinutes),
      slaMinutes: config.maxAgeMinutes,
      message: isStale
        ? `Data is ${Math.round(ageMinutes)} minutes old (SLA: ${config.maxAgeMinutes} min)`
        : undefined,
    };
  } catch (error) {
    return {
      view: config.view,
      status: 'error',
      lastUpdate: null,
      ageMinutes: -1,
      slaMinutes: config.maxAgeMinutes,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check freshness of all configured views
 */
export async function checkDataFreshness(): Promise<FreshnessReport> {
  const results = await Promise.all(FRESHNESS_SLAS.map(checkViewFreshness));

  const hasErrors = results.some(r => r.status === 'error');
  const hasWarnings = results.some(r => r.status === 'warn');

  const report: FreshnessReport = {
    overallStatus: hasErrors ? 'error' : hasWarnings ? 'warn' : 'ok',
    checkedAt: new Date().toISOString(),
    views: results,
  };

  // Log freshness check results
  logStructured('data_freshness_check', {
    component: 'data_quality',
    action: 'check_freshness',
    overallStatus: report.overallStatus,
    viewsChecked: results.length,
    staleViews: results.filter(r => r.status !== 'ok').map(r => r.view),
  });

  return report;
}

/**
 * Check if data is fresh enough for a specific use case
 */
export async function isDataFresh(
  view: string,
  maxAgeMinutes?: number
): Promise<boolean> {
  const config = FRESHNESS_SLAS.find(c => c.view === view);

  if (!config) {
    // Unknown view - assume fresh
    return true;
  }

  const result = await checkViewFreshness({
    ...config,
    maxAgeMinutes: maxAgeMinutes ?? config.maxAgeMinutes,
  });

  return result.status === 'ok';
}

/**
 * Get freshness metadata for UI display
 */
export async function getFreshnessMetadata(view: string): Promise<{
  lastUpdate: Date | null;
  ageMinutes: number;
  isFresh: boolean;
  slaMinutes: number;
}> {
  const config = FRESHNESS_SLAS.find(c => c.view === view) || {
    view,
    maxAgeMinutes: 60,
    timestampColumn: 'updated_at',
    alertThreshold: 'warn' as const,
    description: 'Unknown view',
  };

  const result = await checkViewFreshness(config);

  return {
    lastUpdate: result.lastUpdate ? new Date(result.lastUpdate) : null,
    ageMinutes: result.ageMinutes,
    isFresh: result.status === 'ok',
    slaMinutes: result.slaMinutes,
  };
}
