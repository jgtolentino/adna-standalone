/**
 * Scout XI Data Hooks
 * Supabase-powered hooks for dashboard pages
 */

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, getSupabaseSchema, isSupabaseConfigured } from '@/lib/supabaseClient';
import type {
  TxTrendsRow,
  ProductMixRow,
  BrandPerformanceRow,
  ConsumerProfileRow,
  AgeDistributionRow,
  CompetitiveRow,
  GeoRegionRow,
  FunnelRow,
  DaypartRow,
  PaymentMethodRow,
  StorePerformanceRow,
  KPISummary,
  UseScoutDataResult,
  ScoutFilters,
} from '@/types/scout';

// ============================================================================
// GENERIC HOOK FACTORY
// ============================================================================

function useScoutView<T>(
  viewName: string,
  options?: {
    schema?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
): UseScoutDataResult<T[]> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { schema = 'scout', orderBy, ascending = true, limit } = options || {};

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = getSupabaseSchema(schema);
      let query = supabase.from(viewName).select('*');

      if (orderBy) {
        query = query.order(orderBy, { ascending });
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setData((result as T[]) || []);
    } catch (err) {
      console.error(`[useScoutView:${viewName}]`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${viewName}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [viewName, schema, orderBy, ascending, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// TRANSACTION TRENDS HOOK
// ============================================================================

export function useTxTrends(): UseScoutDataResult<TxTrendsRow[]> {
  return useScoutView<TxTrendsRow>('v_tx_trends', {
    orderBy: 'tx_date',
    ascending: true,
  });
}

// ============================================================================
// PRODUCT MIX HOOKS
// ============================================================================

export function useProductMix(): UseScoutDataResult<ProductMixRow[]> {
  return useScoutView<ProductMixRow>('v_product_mix', {
    orderBy: 'revenue',
    ascending: false,
  });
}

export function useBrandPerformance(limit?: number): UseScoutDataResult<BrandPerformanceRow[]> {
  return useScoutView<BrandPerformanceRow>('v_brand_performance', {
    orderBy: 'revenue',
    ascending: false,
    limit,
  });
}

// ============================================================================
// CONSUMER PROFILE HOOKS
// ============================================================================

export function useConsumerProfile(): UseScoutDataResult<ConsumerProfileRow[]> {
  return useScoutView<ConsumerProfileRow>('v_consumer_profile');
}

export function useAgeDistribution(): UseScoutDataResult<AgeDistributionRow[]> {
  return useScoutView<AgeDistributionRow>('v_consumer_age_distribution');
}

// ============================================================================
// COMPETITIVE ANALYSIS HOOK
// ============================================================================

export function useCompetitiveAnalysis(limit?: number): UseScoutDataResult<CompetitiveRow[]> {
  return useScoutView<CompetitiveRow>('v_competitive_analysis', {
    orderBy: 'revenue',
    ascending: false,
    limit,
  });
}

// ============================================================================
// GEO REGIONS HOOK
// ============================================================================

export function useGeoRegions(): UseScoutDataResult<GeoRegionRow[]> {
  return useScoutView<GeoRegionRow>('v_geo_regions', {
    orderBy: 'revenue',
    ascending: false,
  });
}

/**
 * Returns geo region data as a map keyed by region_code
 * (compatible with existing PhilippinesChoropleth component)
 */
export function useGeoRegionsMap(): {
  data: GeoRegionRow[];
  dataMap: Record<string, GeoRegionRow>;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const result = useGeoRegions();

  const dataMap = result.data.reduce((acc, row) => {
    acc[row.region_code] = row;
    return acc;
  }, {} as Record<string, GeoRegionRow>);

  return { ...result, dataMap };
}

// ============================================================================
// FUNNEL & BEHAVIOR HOOKS
// ============================================================================

export function useFunnelAnalysis(): UseScoutDataResult<FunnelRow[]> {
  return useScoutView<FunnelRow>('v_funnel_analysis');
}

export function useDaypartAnalysis(): UseScoutDataResult<DaypartRow[]> {
  return useScoutView<DaypartRow>('v_daypart_analysis');
}

export function usePaymentMethods(): UseScoutDataResult<PaymentMethodRow[]> {
  return useScoutView<PaymentMethodRow>('v_payment_methods', {
    orderBy: 'tx_count',
    ascending: false,
  });
}

// ============================================================================
// STORE PERFORMANCE HOOK
// ============================================================================

export function useStorePerformance(limit?: number): UseScoutDataResult<StorePerformanceRow[]> {
  return useScoutView<StorePerformanceRow>('v_store_performance', {
    orderBy: 'revenue',
    ascending: false,
    limit,
  });
}

// ============================================================================
// KPI SUMMARY HOOK
// ============================================================================

export function useKPISummary(): UseScoutDataResult<KPISummary | null> {
  const [data, setData] = useState<KPISummary | null>(null);
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
      const { data: result, error: queryError } = await supabase
        .from('v_kpi_summary')
        .select('*')
        .single();

      if (queryError) {
        throw queryError;
      }

      setData(result as KPISummary);
    } catch (err) {
      console.error('[useKPISummary]', err);
      setError(err instanceof Error ? err.message : 'Failed to load KPI summary');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// FILTERED TRANSACTIONS HOOK (for advanced queries)
// ============================================================================

export function useFilteredTransactions(
  filters: ScoutFilters,
  limit: number = 1000
): UseScoutDataResult<any[]> {
  const [data, setData] = useState<any[]>([]);
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
      let query = supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      // Apply filters
      if (filters.dateRange) {
        query = query
          .gte('timestamp', filters.dateRange.start)
          .lte('timestamp', filters.dateRange.end);
      }

      if (filters.regionCodes && filters.regionCodes.length > 0) {
        query = query.in('region_code', filters.regionCodes);
      }

      if (filters.productCategories && filters.productCategories.length > 0) {
        query = query.in('product_category', filters.productCategories);
      }

      if (filters.brandNames && filters.brandNames.length > 0) {
        query = query.in('brand_name', filters.brandNames);
      }

      if (filters.incomes && filters.incomes.length > 0) {
        query = query.in('income', filters.incomes);
      }

      if (filters.urbanRural && filters.urbanRural.length > 0) {
        query = query.in('urban_rural', filters.urbanRural);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      setData(result || []);
    } catch (err) {
      console.error('[useFilteredTransactions]', err);
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================================================
// REAL-TIME SUBSCRIPTION HOOK
// ============================================================================

export function useRealtimeScoutData<T>(
  viewName: string,
  onDataChange?: (data: T[]) => void
): UseScoutDataResult<T[]> {
  const [data, setData] = useState<T[]>([]);
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
      const { data: result, error: queryError } = await supabase
        .from(viewName)
        .select('*');

      if (queryError) {
        throw queryError;
      }

      const newData = (result as T[]) || [];
      setData(newData);
      onDataChange?.(newData);
    } catch (err) {
      console.error(`[useRealtimeScoutData:${viewName}]`, err);
      setError(err instanceof Error ? err.message : `Failed to load ${viewName}`);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [viewName, onDataChange]);

  useEffect(() => {
    fetchData();

    // Set up realtime subscription to scout.transactions
    if (isSupabaseConfigured()) {
      const supabase = getSupabase();
      const channel = supabase
        .channel('scout-realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'scout', table: 'transactions' },
          () => {
            // Refetch data when transactions change
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
