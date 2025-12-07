/**
 * Scout XI Data Hooks - Barrel Export
 */

// Scout data hooks (new canonical views)
export {
  useTxTrends,
  useProductMix,
  useBrandPerformance,
  useConsumerProfile,
  useAgeDistribution,
  useCompetitiveAnalysis,
  useGeoRegions,
  useGeoRegionsMap,
  useFunnelAnalysis,
  useDaypartAnalysis,
  usePaymentMethods,
  useStorePerformance,
  useKPISummary,
  useFilteredTransactions,
  useRealtimeScoutData,
} from './useScoutData';

// Legacy region metrics hook (for backwards compatibility)
export { useRegionMetrics } from './useRegionMetrics';
export type { RegionMetric, UseRegionMetricsResult } from './useRegionMetrics';
