import { NextResponse } from 'next/server';
import { logStructured, type LogLevel } from '@/lib/observability';

/**
 * Client-side logging endpoint
 * Receives logs from browser and forwards to observability system
 */

interface ClientLogEntry {
  level: LogLevel;
  component: string;
  action: string;
  error?: string;
  stack?: string;
  componentStack?: string;
  componentName?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    const entry: ClientLogEntry = await req.json();

    // Validate required fields
    if (!entry.component || !entry.action) {
      return NextResponse.json(
        { error: 'Missing required fields: component, action' },
        { status: 400 }
      );
    }

    // Add client context
    const clientContext = {
      ...entry,
      source: 'client',
      userAgent: req.headers.get('user-agent') || undefined,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined,
    };

    // Forward to structured logging
    logStructured(
      entry.action,
      clientContext,
      entry.level || 'info'
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log the logging failure (meta!)
    console.error('Failed to process client log:', error);

    return NextResponse.json(
      { error: 'Failed to process log entry' },
      { status: 500 }
    );
  }
}
