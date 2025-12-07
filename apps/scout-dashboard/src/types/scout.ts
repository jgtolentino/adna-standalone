/**
 * Scout XI TypeScript Types
 * Canonical type definitions matching the scout schema in Supabase
 */

// ============================================================================
// ENUMS (matching PostgreSQL enums in scout schema)
// ============================================================================

export type Daypart = 'morning' | 'afternoon' | 'evening' | 'night';
export type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card' | 'other';
export type IncomeBand = 'low' | 'middle' | 'high' | 'unknown';
export type UrbanRural = 'urban' | 'rural' | 'unknown';
export type FunnelStage = 'visit' | 'browse' | 'request' | 'accept' | 'purchase';

// ============================================================================
// BASE TABLES
// ============================================================================

export interface ScoutRegion {
  region_code: string;
  region_name: string;
  region_type: string;
  created_at: string;
}

export interface ScoutStore {
  id: string;
  store_code: string;
  store_name: string;
  region_code: string;
  province: string;
  city: string;
  barangay: string;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScoutTransaction {
  id: string;
  store_id: string;
  timestamp: string;
  time_of_day: Daypart;
  region_code: string;
  province: string;
  city: string;
  barangay: string;
  brand_name: string;
  sku: string;
  product_category: string;
  product_subcategory: string | null;
  our_brand: boolean;
  tbwa_client_brand: boolean;
  quantity: number;
  unit_price: number;
  gross_amount: number;
  discount_amount: number;
  net_amount: number;
  payment_method: PaymentMethod;
  customer_id: string | null;
  age: number | null;
  gender: string | null;
  income: IncomeBand;
  urban_rural: UrbanRural;
  funnel_stage: FunnelStage | null;
  basket_size: number | null;
  repeated_customer: boolean | null;
  created_at: string;
}

// ============================================================================
// VIEW TYPES - Transaction Trends
// ============================================================================

export interface TxTrendsRow {
  tx_date: string;
  tx_count: number;
  total_revenue: number;
  avg_basket_value: number;
  active_stores: number;
  unique_customers: number;
  avg_items_per_tx: number;
}

// ============================================================================
// VIEW TYPES - Product Mix
// ============================================================================

export interface ProductMixRow {
  product_category: string;
  tx_count: number;
  revenue: number;
  units_sold: number;
  tx_share_pct: number;
  revenue_share_pct: number;
  brand_count: number;
  sku_count: number;
}

export interface BrandPerformanceRow {
  brand_name: string;
  product_category: string;
  our_brand: boolean;
  tbwa_client_brand: boolean;
  tx_count: number;
  revenue: number;
  units_sold: number;
  avg_transaction_value: number;
}

// ============================================================================
// VIEW TYPES - Consumer Profile
// ============================================================================

export interface ConsumerProfileRow {
  income: IncomeBand;
  urban_rural: UrbanRural;
  gender: string | null;
  tx_count: number;
  revenue: number;
  unique_customers: number;
  avg_age: number | null;
  avg_basket_value: number;
}

export interface AgeDistributionRow {
  age_bracket: string;
  tx_count: number;
  revenue: number;
  unique_customers: number;
}

// ============================================================================
// VIEW TYPES - Competitive Analysis
// ============================================================================

export interface CompetitiveRow {
  brand_name: string;
  our_brand: boolean;
  tbwa_client_brand: boolean;
  product_category: string;
  tx_count: number;
  revenue: number;
  units_sold: number;
  market_share_pct: number;
  category_share_pct: number;
}

// ============================================================================
// VIEW TYPES - Geographic Performance
// ============================================================================

export interface GeoRegionRow {
  region_code: string;
  region_name: string;
  stores_count: number;
  tx_count: number;
  revenue: number;
  unique_customers: number;
  avg_basket_value: number;
  growth_rate: number;
}

// ============================================================================
// VIEW TYPES - Funnel & Behavior
// ============================================================================

export interface FunnelRow {
  funnel_stage: FunnelStage;
  tx_count: number;
  revenue: number;
  stage_pct: number;
}

export interface DaypartRow {
  time_of_day: Daypart;
  tx_count: number;
  revenue: number;
  avg_basket_value: number;
  tx_share_pct: number;
}

export interface PaymentMethodRow {
  payment_method: PaymentMethod;
  tx_count: number;
  revenue: number;
  tx_share_pct: number;
}

// ============================================================================
// VIEW TYPES - Store Performance
// ============================================================================

export interface StorePerformanceRow {
  store_id: string;
  store_code: string;
  store_name: string;
  region_code: string;
  city: string;
  tx_count: number;
  revenue: number;
  unique_customers: number;
  avg_basket_value: number;
}

// ============================================================================
// VIEW TYPES - KPI Summary
// ============================================================================

export interface KPISummary {
  total_transactions: number;
  total_revenue: number;
  avg_basket_value: number;
  active_stores: number;
  unique_customers: number;
  total_brands: number;
  total_skus: number;
  total_categories: number;
  today_tx_count: number;
  today_revenue: number;
  yesterday_tx_count: number;
  yesterday_revenue: number;
  week_tx_count: number;
  week_revenue: number;
  month_tx_count: number;
  month_revenue: number;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

export interface UseScoutDataResult<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface ScoutFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  regionCodes?: string[];
  productCategories?: string[];
  brandNames?: string[];
  incomes?: IncomeBand[];
  urbanRural?: UrbanRural[];
}

// ============================================================================
// CHART DATA TYPES (transformed for Recharts)
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface MultiSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}
