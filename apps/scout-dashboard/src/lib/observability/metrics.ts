/**
 * Lightweight Metrics Collector
 * In-memory metrics for Vercel serverless environment
 * Provides percentile calculations and summaries
 */

interface MetricBucket {
  values: number[];
  timestamps: number[];
}

// In-memory storage (resets on cold start - acceptable for Vercel)
const metrics = new Map<string, MetricBucket>();
const counters = new Map<string, number>();

const MAX_VALUES = 1000; // Keep last 1000 values per metric
const MAX_AGE_MS = 3600000; // 1 hour

/**
 * Record a timing or value metric
 */
export function recordMetric(name: string, value: number): void {
  if (!metrics.has(name)) {
    metrics.set(name, { values: [], timestamps: [] });
  }

  const bucket = metrics.get(name)!;
  bucket.values.push(value);
  bucket.timestamps.push(Date.now());

  // Trim old values
  trimBucket(bucket);
}

/**
 * Increment a counter
 */
export function incrementCounter(name: string, delta: number = 1): void {
  const current = counters.get(name) || 0;
  counters.set(name, current + delta);
}

/**
 * Get counter value
 */
export function getCounter(name: string): number {
  return counters.get(name) || 0;
}

/**
 * Reset a counter
 */
export function resetCounter(name: string): void {
  counters.delete(name);
}

/**
 * Calculate percentile from sorted array
 */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Trim old values from bucket
 */
function trimBucket(bucket: MetricBucket): void {
  const cutoff = Date.now() - MAX_AGE_MS;

  // Remove old entries
  while (bucket.timestamps.length > 0 && bucket.timestamps[0] < cutoff) {
    bucket.values.shift();
    bucket.timestamps.shift();
  }

  // Enforce max size
  while (bucket.values.length > MAX_VALUES) {
    bucket.values.shift();
    bucket.timestamps.shift();
  }
}

/**
 * Get summary statistics for a metric
 */
export function getMetricSummary(name: string): {
  count: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
} | null {
  const bucket = metrics.get(name);
  if (!bucket || bucket.values.length === 0) {
    return null;
  }

  trimBucket(bucket);

  const sorted = [...bucket.values].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    count: sorted.length,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: Math.round((sum / sorted.length) * 100) / 100,
    p50: percentile(sorted, 50),
    p95: percentile(sorted, 95),
    p99: percentile(sorted, 99),
  };
}

/**
 * Get all metrics summaries
 */
export function getAllMetricsSummary(): Record<
  string,
  {
    count: number;
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  }
> {
  const summary: Record<string, ReturnType<typeof getMetricSummary> & object> = {};

  for (const name of Array.from(metrics.keys())) {
    const metricSummary = getMetricSummary(name);
    if (metricSummary) {
      summary[name] = metricSummary;
    }
  }

  return summary;
}

/**
 * Get all counter values
 */
export function getAllCounters(): Record<string, number> {
  return Object.fromEntries(counters);
}

/**
 * Clear all metrics (useful for testing)
 */
export function clearAllMetrics(): void {
  metrics.clear();
  counters.clear();
}

/**
 * Metric names constants for consistency
 */
export const MetricNames = {
  // API latencies
  API_LATENCY_MS: 'api_latency_ms',
  DB_QUERY_MS: 'db_query_ms',
  NLQ_LATENCY_MS: 'nlq_latency_ms',

  // AI/NLQ specific
  NLQ_TOKENS_USED: 'nlq_tokens_used',
  NLQ_CONFIDENCE: 'nlq_confidence',

  // Counters
  API_REQUESTS_TOTAL: 'api_requests_total',
  API_ERRORS_TOTAL: 'api_errors_total',
  NLQ_CACHE_HITS: 'nlq_cache_hits',
  NLQ_CACHE_MISSES: 'nlq_cache_misses',
  NLQ_FALLBACKS: 'nlq_fallbacks',
  NLQ_TIMEOUTS: 'nlq_timeouts',
} as const;

/**
 * Timer helper that auto-records metric on completion
 */
export function createMetricTimer(metricName: string) {
  const start = performance.now();
  return {
    stop: () => {
      const duration = performance.now() - start;
      recordMetric(metricName, Math.round(duration));
      return Math.round(duration);
    },
  };
}
