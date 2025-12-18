import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseSchema, isSupabaseConfigured } from '@/lib/supabaseClient';
import { matchPattern, detectChartType, SUGGESTIONS, PATTERNS } from '@/lib/nlq/patterns';
import { nlqService } from '@/lib/ai';
import { logStructured, createTimer, getRequestContext } from '@/lib/observability';
import { incrementCounter, MetricNames } from '@/lib/observability/metrics';
import { validateData, NLQQuerySchema } from '@/lib/data';

/**
 * Scout NLQ API
 * Production-hardened natural language queries with fallbacks and observability
 */

// ============================================================================
// POST - Execute NLQ Query
// ============================================================================

export async function POST(request: NextRequest) {
  const timer = createTimer();
  const requestContext = getRequestContext(request);
  const requestId = requestContext.requestId as string;

  incrementCounter(MetricNames.API_REQUESTS_TOTAL);

  try {
    const body = await request.json();

    // Validate input
    const validation = validateData(NLQQuerySchema, body, 'nlq_request');
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: validation.errors },
        { status: 400 }
      );
    }

    const validatedData = validation.data;
    const query = validatedData.query;
    const userId = validatedData.userId;
    const limit = (body.limit as number) || 100;

    // Log query start
    logStructured('nlq_api_request', {
      component: 'nlq_api',
      action: 'request',
      requestId,
      queryLength: query.length,
      userId,
    });

    // Check Supabase configuration
    if (!isSupabaseConfigured()) {
      // Return AI-only response if database not configured
      const aiResponse = await nlqService.query(query, {
        requestId,
        userId,
        timeoutMs: 8000,
      });

      return NextResponse.json({
        success: true,
        data: [],
        answer: aiResponse.answer,
        source: aiResponse.source,
        confidence: aiResponse.confidence,
        query,
        warning: 'Database not configured - showing AI-generated insight only',
      });
    }

    // Match query to pattern for structured data
    const match = matchPattern(query);
    const { pattern, confidence: patternConfidence, matchedKeywords } = match;

    // Override chart type if query explicitly mentions one
    const chartType = detectChartType(query, pattern.chartType);

    // Execute database query
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

    // Execute structured query and AI insight in parallel
    const [dataResult, aiResult] = await Promise.allSettled([
      queryBuilder,
      nlqService.query(query, {
        requestId,
        userId,
        timeoutMs: 5000, // Shorter timeout when running in parallel
      }),
    ]);

    // Handle database result
    let data: unknown[] = [];
    let dbError: string | null = null;

    if (dataResult.status === 'fulfilled') {
      const { data: queryData, error } = dataResult.value;
      if (error) {
        dbError = error.message;
        logStructured('nlq_db_error', {
          component: 'nlq_api',
          action: 'db_query',
          requestId,
          error: error.message,
          view: pattern.view,
        }, 'error');
      } else {
        data = queryData || [];
      }
    } else {
      dbError = dataResult.reason?.message || 'Database query failed';
    }

    // Handle AI result
    let aiAnswer: string | undefined;
    let aiConfidence = 0;
    let aiSource: 'ai' | 'cache' | 'fallback' = 'fallback';

    if (aiResult.status === 'fulfilled') {
      aiAnswer = aiResult.value.answer;
      aiConfidence = aiResult.value.confidence;
      aiSource = aiResult.value.source;
    }

    const latencyMs = timer.elapsed();

    // Log completion
    logStructured('nlq_api_complete', {
      component: 'nlq_api',
      action: 'complete',
      requestId,
      latencyMs,
      rowCount: data.length,
      patternConfidence,
      aiConfidence,
      aiSource,
      hasDbError: !!dbError,
    });

    return NextResponse.json({
      success: true,
      data,
      chartConfig: {
        type: chartType,
        ...pattern.chartConfig,
      },
      query,
      pattern: {
        name: pattern.name,
        description: pattern.description,
        confidence: Math.round(patternConfidence),
        matchedKeywords,
      },
      view: pattern.view,
      rowCount: data.length,
      // AI enhancement
      answer: aiAnswer,
      answerConfidence: aiConfidence,
      answerSource: aiSource,
      // Metadata
      latencyMs,
      requestId,
      ...(dbError && { warning: `Data may be incomplete: ${dbError}` }),
    });
  } catch (error) {
    incrementCounter(MetricNames.API_ERRORS_TOTAL);

    logStructured('nlq_api_error', {
      component: 'nlq_api',
      action: 'error',
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      latencyMs: timer.elapsed(),
    }, 'error');

    // Always return a useful response
    return NextResponse.json(
      {
        success: false,
        error: 'Query processing failed',
        fallbackAnswer:
          "I couldn't process that query right now. Peak hours in Philippine sari-sari stores are typically 7-9 AM and 5-7 PM, driving 60% of daily volume.",
        requestId,
      },
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
    features: {
      aiEnhanced: true,
      caching: true,
      fallbacks: true,
    },
  });
}
