/**
 * Scout Dashboard Data Hooks
 * Provides real-time data fetching from Supabase scout schema views
 */

import { useEffect, useState, useCallback } from 'react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import type {
  TxTrendsRow,
  ProductMixRow,
  ConsumerProfileRow,
  ConsumerBehaviorRow,
  CompetitiveRow,
  GeoRegionRow,
  StorePerformanceRow,
  KPISummary,
  ScoutFilters,
  UseScoutDataResult,
  BrandPerformanceRow,
  FunnelRow,
  DaypartRow,
} from '@/types/scout';

// =============================================================================
// GENERIC HOOK FOR SUPABASE VIEWS
// =============================================================================

function useSupabaseView<T>(
  viewName: string,
  filters?: ScoutFilters
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
      const supabase = getSupabase();
      let query = supabase.from(viewName).select('*');

      // Apply filters if provided
      if (filters?.dateRange) {
        query = query.gte('tx_date', filters.dateRange.start);
        query = query.lte('tx_date', filters.dateRange.end);
      }

      if (filters?.regionCodes?.length) {
        query = query.in('region_code', filters.regionCodes);
      }

      if (filters?.productCategories?.length) {
        query = query.in('product_category', filters.productCategories);
      }

      if (filters?.brandNames?.length) {
        query = query.in('brand_name', filters.brandNames);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) {
        throw new Error(queryError.message);
      }

      setData((result as T[]) || []);
    } catch (err) {
      console.error(`[useSupabaseView:${viewName}]`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [viewName, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// TRANSACTION TRENDS HOOK
// =============================================================================

export function useTxTrends(filters?: ScoutFilters): UseScoutDataResult<TxTrendsRow[]> {
  return useSupabaseView<TxTrendsRow>('scout.v_tx_trends', filters);
}

// =============================================================================
// PRODUCT MIX HOOKS
// =============================================================================

export function useProductMix(filters?: ScoutFilters): UseScoutDataResult<ProductMixRow[]> {
  return useSupabaseView<ProductMixRow>('scout.v_product_mix', filters);
}

export function useBrandPerformance(filters?: ScoutFilters): UseScoutDataResult<BrandPerformanceRow[]> {
  const [data, setData] = useState<BrandPerformanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: result, error: queryError } = await supabase
        .from('scout.v_product_mix')
        .select('brand_name, product_category, our_brand, tbwa_client_brand, tx_count, revenue, total_quantity')
        .order('revenue', { ascending: false })
        .limit(50);

      if (queryError) throw new Error(queryError.message);

      const transformed: BrandPerformanceRow[] = (result || []).map((row: Record<string, unknown>) => ({
        brand_name: row.brand_name as string,
        product_category: row.product_category as string,
        our_brand: row.our_brand as boolean,
        tbwa_client_brand: row.tbwa_client_brand as boolean,
        tx_count: row.tx_count as number,
        revenue: row.revenue as number,
        units_sold: row.total_quantity as number,
        avg_transaction_value: (row.revenue as number) / (row.tx_count as number),
      }));

      setData(transformed);
    } catch (err) {
      console.error('[useBrandPerformance]', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// CONSUMER PROFILE HOOK
// =============================================================================

export function useConsumerProfile(filters?: ScoutFilters): UseScoutDataResult<ConsumerProfileRow[]> {
  return useSupabaseView<ConsumerProfileRow>('scout.v_consumer_profile', filters);
}

// =============================================================================
// CONSUMER BEHAVIOR HOOK
// =============================================================================

export function useConsumerBehavior(filters?: ScoutFilters): UseScoutDataResult<ConsumerBehaviorRow[]> {
  return useSupabaseView<ConsumerBehaviorRow>('scout.v_consumer_behavior', filters);
}

export function useFunnelData(filters?: ScoutFilters): UseScoutDataResult<FunnelRow[]> {
  const [data, setData] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: result, error: queryError } = await supabase
        .from('scout.v_consumer_behavior')
        .select('funnel_stage, tx_count, revenue');

      if (queryError) throw new Error(queryError.message);

      // Aggregate by funnel stage
      const stageMap = new Map<string, { tx_count: number; revenue: number }>();
      (result || []).forEach((row: Record<string, unknown>) => {
        const stage = row.funnel_stage as string;
        const existing = stageMap.get(stage) || { tx_count: 0, revenue: 0 };
        stageMap.set(stage, {
          tx_count: existing.tx_count + (row.tx_count as number),
          revenue: existing.revenue + (row.revenue as number),
        });
      });

      const totalTx = Array.from(stageMap.values()).reduce((sum, v) => sum + v.tx_count, 0);

      const funnelData: FunnelRow[] = Array.from(stageMap.entries()).map(([stage, vals]) => ({
        funnel_stage: stage as FunnelRow['funnel_stage'],
        tx_count: vals.tx_count,
        revenue: vals.revenue,
        stage_pct: totalTx > 0 ? (vals.tx_count / totalTx) * 100 : 0,
      }));

      setData(funnelData);
    } catch (err) {
      console.error('[useFunnelData]', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// COMPETITIVE ANALYSIS HOOK
// =============================================================================

export function useCompetitiveAnalysis(filters?: ScoutFilters): UseScoutDataResult<CompetitiveRow[]> {
  return useSupabaseView<CompetitiveRow>('scout.v_competitive_analysis', filters);
}

// =============================================================================
// GEO REGIONS HOOK (for choropleth map)
// =============================================================================

export function useGeoRegions(filters?: ScoutFilters): UseScoutDataResult<GeoRegionRow[]> {
  return useSupabaseView<GeoRegionRow>('scout.v_geo_regions', filters);
}

// =============================================================================
// STORE PERFORMANCE HOOK
// =============================================================================

export function useStorePerformance(filters?: ScoutFilters): UseScoutDataResult<StorePerformanceRow[]> {
  return useSupabaseView<StorePerformanceRow>('scout.v_store_performance', filters);
}

// =============================================================================
// DAYPART DISTRIBUTION HOOK
// =============================================================================

export function useDaypartDistribution(): UseScoutDataResult<DaypartRow[]> {
  const [data, setData] = useState<DaypartRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setError('Supabase not configured');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabase();
      const { data: result, error: queryError } = await supabase
        .from('scout.transactions')
        .select('time_of_day, net_amount')
        .limit(10000);

      if (queryError) throw new Error(queryError.message);

      // Aggregate by daypart
      const daypartMap = new Map<string, { tx_count: number; revenue: number }>();
      (result || []).forEach((row: Record<string, unknown>) => {
        const daypart = row.time_of_day as string;
        const existing = daypartMap.get(daypart) || { tx_count: 0, revenue: 0 };
        daypartMap.set(daypart, {
          tx_count: existing.tx_count + 1,
          revenue: existing.revenue + (row.net_amount as number),
        });
      });

      const totalTx = Array.from(daypartMap.values()).reduce((sum, v) => sum + v.tx_count, 0);

      const daypartData: DaypartRow[] = Array.from(daypartMap.entries()).map(([daypart, vals]) => ({
        time_of_day: daypart as DaypartRow['time_of_day'],
        tx_count: vals.tx_count,
        revenue: vals.revenue,
        avg_basket_value: vals.tx_count > 0 ? vals.revenue / vals.tx_count : 0,
        tx_share_pct: totalTx > 0 ? (vals.tx_count / totalTx) * 100 : 0,
      }));

      setData(daypartData);
    } catch (err) {
      console.error('[useDaypartDistribution]', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// KPI SUMMARY HOOK
// =============================================================================

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
    try {
      const supabase = getSupabase();

      // Get aggregate stats from transactions
      const { data: txStats, error: txError } = await supabase
        .from('scout.transactions')
        .select('net_amount, store_id, customer_id, brand_name, sku, product_category, timestamp')
        .limit(50000);

      if (txError) throw new Error(txError.message);

      const transactions = txStats || [];
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const summary: KPISummary = {
        total_transactions: transactions.length,
        total_revenue: transactions.reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0),
        avg_basket_value: transactions.length > 0
          ? transactions.reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0) / transactions.length
          : 0,
        active_stores: new Set(transactions.map((tx: Record<string, unknown>) => tx.store_id)).size,
        unique_customers: new Set(transactions.filter((tx: Record<string, unknown>) => tx.customer_id).map((tx: Record<string, unknown>) => tx.customer_id)).size,
        total_brands: new Set(transactions.map((tx: Record<string, unknown>) => tx.brand_name)).size,
        total_skus: new Set(transactions.map((tx: Record<string, unknown>) => tx.sku)).size,
        total_categories: new Set(transactions.map((tx: Record<string, unknown>) => tx.product_category)).size,
        today_tx_count: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string)?.startsWith(today)).length,
        today_revenue: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string)?.startsWith(today)).reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0),
        yesterday_tx_count: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string)?.startsWith(yesterday)).length,
        yesterday_revenue: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string)?.startsWith(yesterday)).reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0),
        week_tx_count: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string) >= weekAgo).length,
        week_revenue: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string) >= weekAgo).reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0),
        month_tx_count: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string) >= monthAgo).length,
        month_revenue: transactions.filter((tx: Record<string, unknown>) => (tx.timestamp as string) >= monthAgo).reduce((sum, tx: Record<string, unknown>) => sum + ((tx.net_amount as number) || 0), 0),
      };

      setData(summary);
    } catch (err) {
      console.error('[useKPISummary]', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  useSupabaseView,
};
