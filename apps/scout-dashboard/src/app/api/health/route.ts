import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseClient';

export async function GET() {
  try {
    const db = getSupabase();

    // Try to get DQ health summary
    const { data: dqData, error: dqError } = await db
      .from('dq_health_summary')
      .select('*')
      .maybeSingle();

    // Fallback to basic connection test if DQ view doesn't exist
    if (dqError) {
      const { data: testData, error: testError } = await db
        .from('scout_gold_transactions_flat')
        .select('count')
        .limit(1)
        .maybeSingle();

      if (testError) {
        return NextResponse.json(
          {
            status: 'error',
            error: testError.message,
            lastCheck: new Date().toISOString(),
            activeIssues: 1
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        status: 'ok',
        lastCheck: new Date().toISOString(),
        activeIssues: 0,
        detail: { connection: 'verified', fallback: true },
      });
    }

    return NextResponse.json({
      status: (dqData as any)?.overall_health ?? 'unknown',
      lastCheck: (dqData as any)?.last_check ?? new Date().toISOString(),
      activeIssues: (dqData as any)?.active_issues ?? 0,
      detail: dqData ?? null,
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date().toISOString(),
        activeIssues: 1
      },
      { status: 500 }
    );
  }
}