import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSchema, isSupabaseConfigured } from '@/lib/supabaseClient';
import { matchPattern, detectChartType, SUGGESTIONS, PATTERNS } from '@/lib/nlq/patterns';

/**
 * Scout NLQ API
 * Safe, pattern-based natural language queries against whitelisted Gold views
 */

// ============================================================================
// POST - Execute NLQ Query
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 100 } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Match query to pattern
    const match = matchPattern(query);
    const { pattern, confidence, matchedKeywords } = match;

    // Override chart type if query explicitly mentions one
    const chartType = detectChartType(query, pattern.chartType);

    // Build the query
    const supabase = getSupabaseSchema('scout');
    let queryBuilder = supabase.from(pattern.view).select(pattern.select);

    // Apply ordering if specified
    if (pattern.orderBy) {
      const [field, direction] = pattern.orderBy.split(' ');
      queryBuilder = queryBuilder.order(field, { ascending: direction !== 'DESC' });
    }

    // Apply limit
    const rowLimit = pattern.limit || limit;
    queryBuilder = queryBuilder.limit(rowLimit);

    // Execute query
    const { data, error } = await queryBuilder;

    if (error) {
      console.error('[NLQ API] Query error:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Query failed: ${error.message}`,
          pattern: pattern.name,
          view: pattern.view
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      chartConfig: {
        type: chartType,
        ...pattern.chartConfig,
      },
      query: query,
      pattern: {
        name: pattern.name,
        description: pattern.description,
        confidence: Math.round(confidence),
        matchedKeywords,
      },
      view: pattern.view,
      rowCount: data?.length || 0,
    });

  } catch (error) {
    console.error('[NLQ API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// GET - Query Suggestions and Available Patterns
// ============================================================================

export async function GET() {
  return NextResponse.json({
    success: true,
    suggestions: SUGGESTIONS,
    patterns: PATTERNS.map(p => ({
      name: p.name,
      description: p.description,
      keywords: p.keywords.slice(0, 3), // First 3 keywords
      chartType: p.chartType,
    })),
    totalPatterns: PATTERNS.length,
  });
}
