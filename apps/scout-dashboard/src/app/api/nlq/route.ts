import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

// Whitelisted Gold/Platinum views for safe querying
const ALLOWED_VIEWS = [
  'scout_gold_transactions_flat',
  'scout_gold_facial_demographics',
  'scout_stats_summary',
  'dq_health_summary'
];

// Chart type mapping
const CHART_TYPES = {
  'bar': ['compare', 'category', 'brand', 'store', 'breakdown'],
  'line': ['trend', 'time', 'date', 'over time', 'timeline'],
  'pie': ['distribution', 'split', 'proportion', 'share'],
  'area': ['volume', 'amount', 'revenue', 'sales'],
  'scatter': ['correlation', 'relationship', 'vs']
};

// NLQ to SQL mapping patterns
const QUERY_PATTERNS = {
  // Time-based patterns
  'sales by day': {
    sql: `SELECT DATE(effective_ts) as date, SUM(amount) as total_sales, COUNT(*) as transactions
           FROM scout_gold_transactions_flat
           WHERE effective_ts >= NOW() - INTERVAL '30 days'
           GROUP BY DATE(effective_ts)
           ORDER BY date`,
    chartType: 'line',
    xField: 'date',
    yField: 'total_sales'
  },

  'transactions by store': {
    sql: `SELECT store_name, COUNT(*) as transaction_count, SUM(amount) as total_revenue
           FROM scout_gold_transactions_flat
           GROUP BY store_name, store_id
           ORDER BY transaction_count DESC`,
    chartType: 'bar',
    xField: 'store_name',
    yField: 'transaction_count'
  },

  'brand performance': {
    sql: `SELECT brand, COUNT(*) as transactions, SUM(amount) as revenue
           FROM scout_gold_transactions_flat
           WHERE brand IS NOT NULL
           GROUP BY brand
           ORDER BY revenue DESC
           LIMIT 10`,
    chartType: 'bar',
    xField: 'brand',
    yField: 'revenue'
  },

  'category breakdown': {
    sql: `SELECT category, COUNT(*) as count, SUM(amount) as total
           FROM scout_gold_transactions_flat
           WHERE category IS NOT NULL
           GROUP BY category
           ORDER BY total DESC`,
    chartType: 'pie',
    dataKey: 'count',
    nameKey: 'category'
  },

  'daypart analysis': {
    sql: `SELECT daypart, COUNT(*) as transactions, AVG(amount) as avg_amount
           FROM scout_gold_transactions_flat
           WHERE daypart IS NOT NULL
           GROUP BY daypart
           ORDER BY CASE daypart
             WHEN 'Morning' THEN 1
             WHEN 'Afternoon' THEN 2
             WHEN 'Evening' THEN 3
             WHEN 'Night' THEN 4
           END`,
    chartType: 'bar',
    xField: 'daypart',
    yField: 'transactions'
  }
};

function detectChartType(query: string): string {
  const lowerQuery = query.toLowerCase();

  for (const [chartType, keywords] of Object.entries(CHART_TYPES)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return chartType;
    }
  }

  return 'bar'; // default
}

function matchQueryPattern(query: string) {
  const lowerQuery = query.toLowerCase();

  // Exact pattern matching
  for (const [pattern, config] of Object.entries(QUERY_PATTERNS)) {
    if (lowerQuery.includes(pattern.toLowerCase())) {
      return config;
    }
  }

  // Keyword-based matching for dynamic queries
  if (lowerQuery.includes('store') && lowerQuery.includes('sales')) {
    return QUERY_PATTERNS['transactions by store'];
  }

  if (lowerQuery.includes('brand')) {
    return QUERY_PATTERNS['brand performance'];
  }

  if (lowerQuery.includes('category')) {
    return QUERY_PATTERNS['category breakdown'];
  }

  if (lowerQuery.includes('time') || lowerQuery.includes('day')) {
    return QUERY_PATTERNS['sales by day'];
  }

  if (lowerQuery.includes('daypart') || lowerQuery.includes('hour')) {
    return QUERY_PATTERNS['daypart analysis'];
  }

  // Default fallback
  return QUERY_PATTERNS['sales by day'];
}

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 100 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Match query to pattern
    const queryConfig = matchQueryPattern(query);
    const chartType = detectChartType(query);

    // Execute safe SQL query
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc('execute_safe_query', {
      query_sql: queryConfig.sql,
      row_limit: limit
    } as any);

    if (error) {
      // Fallback to direct query if RPC fails
      const viewName = 'scout_gold_transactions_flat';
      const { data: fallbackData, error: fallbackError } = await supabase
        .from(viewName)
        .select('*')
        .limit(limit);

      if (fallbackError) {
        return NextResponse.json(
          { success: false, error: 'Query execution failed' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: fallbackData || [],
        chartConfig: {
          type: chartType,
          ...queryConfig
        },
        query: query,
        executedSql: 'Fallback: SELECT * FROM scout_gold_transactions_flat'
      });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      chartConfig: {
        type: chartType,
        ...queryConfig
      },
      query: query,
      executedSql: queryConfig.sql
    });

  } catch (error) {
    console.error('NLQ API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint for query suggestions
export async function GET() {
  const suggestions = [
    "Show sales by day",
    "Compare transactions by store",
    "Brand performance analysis",
    "Category breakdown pie chart",
    "Daypart analysis",
    "Top performing stores",
    "Revenue trends over time",
    "Average basket size by store"
  ];

  return NextResponse.json({
    success: true,
    suggestions,
    patterns: Object.keys(QUERY_PATTERNS)
  });
}