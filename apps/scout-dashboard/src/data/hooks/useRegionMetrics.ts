/**
 * useRegionMetrics - Fetch Philippine region metrics for choropleth map
 *
 * Supports both legacy view (gold_region_metrics) and new view (v_geo_regions).
 * Falls back gracefully if the new view doesn't exist yet.
 */
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseSchema, isSupabaseConfigured } from '@/lib/supabaseClient';

export interface RegionMetric {
  region_code: string;
  region_name: string;
  total_stores: number;
  total_revenue: number;
  total_transactions: number;
  unique_customers: number;
  growth_rate: number;
}

export interface UseRegionMetricsResult {
  data: Record<string, RegionMetric>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRegionMetrics(): UseRegionMetricsResult {
  const [data, setData] = useState<Record<string, RegionMetric>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseSchema('scout');

      // Try new v_geo_regions view first, fall back to gold_region_metrics
      let metrics = null;
      let queryError = null;

      // Try new view first
      const newViewResult = await supabase
        .from('v_geo_regions')
        .select('*');

      if (!newViewResult.error && newViewResult.data && newViewResult.data.length > 0) {
        // Map new view fields to expected format
        metrics = newViewResult.data.map((row: any) => ({
          region_code: row.region_code,
          region_name: row.region_name,
          total_stores: row.stores_count || 0,
          total_revenue: row.revenue || 0,
          total_transactions: row.tx_count || 0,
          unique_customers: row.unique_customers || 0,
          growth_rate: row.growth_rate || 0,
        }));
      } else {
        // Fall back to legacy view
        const legacyResult = await supabase
          .from('gold_region_metrics')
          .select('*');

        if (legacyResult.error) {
          queryError = legacyResult.error;
        } else {
          metrics = legacyResult.data;
        }
      }

      if (queryError) throw queryError;

      // Convert array to dictionary keyed by region_code
      const metricsMap: Record<string, RegionMetric> = {};
      metrics?.forEach((metric: RegionMetric) => {
        metricsMap[metric.region_code] = metric;
      });

      setData(metricsMap);
    } catch (err) {
      console.error('Error fetching region metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load region metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
