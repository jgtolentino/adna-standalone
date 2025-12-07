/**
 * Scout NLQ Pattern Registry
 * Safe, deterministic query patterns for natural language queries
 * All patterns query whitelisted Gold views only
 */

// ============================================================================
// TYPES
// ============================================================================

export interface NLQPattern {
  name: string;
  description: string;
  keywords: string[];
  view: string;
  select: string;
  orderBy?: string;
  limit?: number;
  chartType: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  chartConfig: {
    xField?: string;
    yField?: string;
    dataKey?: string;
    nameKey?: string;
  };
}

export interface NLQMatch {
  pattern: NLQPattern;
  confidence: number;
  matchedKeywords: string[];
}

// ============================================================================
// WHITELISTED VIEWS
// ============================================================================

export const ALLOWED_VIEWS = [
  'v_tx_trends',
  'v_product_mix',
  'v_brand_performance',
  'v_consumer_profile',
  'v_consumer_age_distribution',
  'v_competitive_analysis',
  'v_geo_regions',
  'v_funnel_analysis',
  'v_daypart_analysis',
  'v_payment_methods',
  'v_store_performance',
  'v_kpi_summary',
] as const;

// ============================================================================
// PATTERN REGISTRY
// ============================================================================

export const PATTERNS: NLQPattern[] = [
  // Transaction Trends
  {
    name: 'daily_trends',
    description: 'Daily transaction trends over time',
    keywords: ['trend', 'daily', 'day', 'date', 'time', 'timeline', 'over time', 'sales by day'],
    view: 'v_tx_trends',
    select: 'tx_date, tx_count, total_revenue, avg_basket_value',
    orderBy: 'tx_date',
    chartType: 'line',
    chartConfig: {
      xField: 'tx_date',
      yField: 'tx_count',
    },
  },
  {
    name: 'revenue_trends',
    description: 'Revenue trends over time',
    keywords: ['revenue', 'sales', 'money', 'income', 'earnings'],
    view: 'v_tx_trends',
    select: 'tx_date, total_revenue, tx_count',
    orderBy: 'tx_date',
    chartType: 'area',
    chartConfig: {
      xField: 'tx_date',
      yField: 'total_revenue',
    },
  },

  // Product Mix
  {
    name: 'category_breakdown',
    description: 'Product category distribution',
    keywords: ['category', 'categories', 'product mix', 'breakdown', 'distribution', 'split'],
    view: 'v_product_mix',
    select: 'product_category, tx_count, revenue, revenue_share_pct',
    orderBy: 'revenue DESC',
    chartType: 'pie',
    chartConfig: {
      dataKey: 'revenue',
      nameKey: 'product_category',
    },
  },
  {
    name: 'category_units',
    description: 'Units sold by category',
    keywords: ['units', 'quantity', 'sold', 'volume'],
    view: 'v_product_mix',
    select: 'product_category, units_sold, tx_count',
    orderBy: 'units_sold DESC',
    chartType: 'bar',
    chartConfig: {
      xField: 'product_category',
      yField: 'units_sold',
    },
  },

  // Brand Performance
  {
    name: 'brand_performance',
    description: 'Brand performance metrics',
    keywords: ['brand', 'brands', 'brand performance', 'top brands'],
    view: 'v_brand_performance',
    select: 'brand_name, product_category, revenue, tx_count, tbwa_client_brand',
    orderBy: 'revenue DESC',
    limit: 15,
    chartType: 'bar',
    chartConfig: {
      xField: 'brand_name',
      yField: 'revenue',
    },
  },
  {
    name: 'tbwa_brands',
    description: 'TBWA client brand performance',
    keywords: ['tbwa', 'client brand', 'our brands', 'client'],
    view: 'v_brand_performance',
    select: 'brand_name, product_category, revenue, tx_count',
    orderBy: 'revenue DESC',
    limit: 20,
    chartType: 'bar',
    chartConfig: {
      xField: 'brand_name',
      yField: 'revenue',
    },
  },

  // Regional Analysis
  {
    name: 'regional_performance',
    description: 'Performance by region',
    keywords: ['region', 'regions', 'geographic', 'geography', 'location', 'area', 'province'],
    view: 'v_geo_regions',
    select: 'region_name, revenue, tx_count, stores_count, growth_rate',
    orderBy: 'revenue DESC',
    chartType: 'bar',
    chartConfig: {
      xField: 'region_name',
      yField: 'revenue',
    },
  },
  {
    name: 'regional_growth',
    description: 'Regional growth rates',
    keywords: ['growth', 'growing', 'fastest', 'increase'],
    view: 'v_geo_regions',
    select: 'region_name, growth_rate, revenue',
    orderBy: 'growth_rate DESC',
    chartType: 'bar',
    chartConfig: {
      xField: 'region_name',
      yField: 'growth_rate',
    },
  },

  // Store Performance
  {
    name: 'store_performance',
    description: 'Store-level performance',
    keywords: ['store', 'stores', 'outlet', 'outlets', 'shop'],
    view: 'v_store_performance',
    select: 'store_name, region_code, city, tx_count, revenue, avg_basket_value',
    orderBy: 'revenue DESC',
    limit: 20,
    chartType: 'bar',
    chartConfig: {
      xField: 'store_name',
      yField: 'revenue',
    },
  },

  // Consumer Demographics
  {
    name: 'consumer_demographics',
    description: 'Consumer demographic breakdown',
    keywords: ['consumer', 'customer', 'demographics', 'profile', 'segment'],
    view: 'v_consumer_profile',
    select: 'income, urban_rural, gender, tx_count, revenue, avg_basket_value',
    chartType: 'bar',
    chartConfig: {
      xField: 'income',
      yField: 'tx_count',
    },
  },
  {
    name: 'age_distribution',
    description: 'Customer age distribution',
    keywords: ['age', 'ages', 'age group', 'young', 'old', 'generation'],
    view: 'v_consumer_age_distribution',
    select: 'age_bracket, tx_count, revenue, unique_customers',
    chartType: 'bar',
    chartConfig: {
      xField: 'age_bracket',
      yField: 'tx_count',
    },
  },

  // Daypart Analysis
  {
    name: 'daypart_analysis',
    description: 'Time of day analysis',
    keywords: ['daypart', 'time of day', 'morning', 'afternoon', 'evening', 'night', 'hour'],
    view: 'v_daypart_analysis',
    select: 'time_of_day, tx_count, revenue, avg_basket_value, tx_share_pct',
    chartType: 'bar',
    chartConfig: {
      xField: 'time_of_day',
      yField: 'tx_count',
    },
  },

  // Payment Methods
  {
    name: 'payment_methods',
    description: 'Payment method distribution',
    keywords: ['payment', 'pay', 'cash', 'gcash', 'maya', 'card', 'credit', 'debit'],
    view: 'v_payment_methods',
    select: 'payment_method, tx_count, revenue, tx_share_pct',
    chartType: 'pie',
    chartConfig: {
      dataKey: 'tx_count',
      nameKey: 'payment_method',
    },
  },

  // Competitive Analysis
  {
    name: 'market_share',
    description: 'Brand market share analysis',
    keywords: ['market share', 'share', 'competitive', 'competition', 'vs', 'compare'],
    view: 'v_competitive_analysis',
    select: 'brand_name, our_brand, tbwa_client_brand, revenue, market_share_pct, category_share_pct',
    orderBy: 'revenue DESC',
    limit: 15,
    chartType: 'bar',
    chartConfig: {
      xField: 'brand_name',
      yField: 'market_share_pct',
    },
  },

  // Purchase Funnel
  {
    name: 'funnel_analysis',
    description: 'Purchase funnel stages',
    keywords: ['funnel', 'conversion', 'stage', 'journey', 'path'],
    view: 'v_funnel_analysis',
    select: 'funnel_stage, tx_count, revenue, stage_pct',
    chartType: 'bar',
    chartConfig: {
      xField: 'funnel_stage',
      yField: 'tx_count',
    },
  },
];

// ============================================================================
// PATTERN MATCHING
// ============================================================================

export function matchPattern(query: string): NLQMatch {
  const lowerQuery = query.toLowerCase().trim();
  let bestMatch: NLQMatch = {
    pattern: PATTERNS[0], // default to daily_trends
    confidence: 0,
    matchedKeywords: [],
  };

  for (const pattern of PATTERNS) {
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const keyword of pattern.keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
        // Longer keywords get more weight
        score += keyword.length;
      }
    }

    // Calculate confidence based on match quality
    const confidence = pattern.keywords.length > 0
      ? (matchedKeywords.length / pattern.keywords.length) * 100
      : 0;

    if (score > 0 && (matchedKeywords.length > bestMatch.matchedKeywords.length ||
        (matchedKeywords.length === bestMatch.matchedKeywords.length && confidence > bestMatch.confidence))) {
      bestMatch = {
        pattern,
        confidence,
        matchedKeywords,
      };
    }
  }

  // If no match found, use default with low confidence
  if (bestMatch.matchedKeywords.length === 0) {
    bestMatch.confidence = 10; // Low confidence fallback
  }

  return bestMatch;
}

// ============================================================================
// CHART TYPE DETECTION
// ============================================================================

const CHART_TYPE_KEYWORDS: Record<string, string[]> = {
  line: ['trend', 'over time', 'timeline', 'history', 'progression'],
  pie: ['distribution', 'breakdown', 'share', 'proportion', 'percentage', 'split'],
  area: ['volume', 'cumulative', 'total', 'stacked'],
  bar: ['compare', 'comparison', 'ranking', 'top', 'best', 'worst'],
  scatter: ['correlation', 'relationship', 'vs', 'against'],
};

export function detectChartType(query: string, defaultType: string = 'bar'): string {
  const lowerQuery = query.toLowerCase();

  for (const [chartType, keywords] of Object.entries(CHART_TYPE_KEYWORDS)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return chartType;
    }
  }

  return defaultType;
}

// ============================================================================
// QUERY SUGGESTIONS
// ============================================================================

export const SUGGESTIONS = [
  'Show daily transaction trends',
  'Brand performance analysis',
  'Category breakdown',
  'Sales by region',
  'Store performance comparison',
  'Payment method distribution',
  'Consumer demographics',
  'Daypart analysis',
  'Market share by brand',
  'Age distribution of customers',
  'Revenue trends over time',
  'Top performing stores',
];
