// useRegionMetrics - Fetch Philippine region metrics for choropleth map
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: metrics, error: queryError } = await supabase
        .schema('scout')
        .from('gold_region_metrics')
        .select('*');

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
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}
