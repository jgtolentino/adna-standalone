'use client';

import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

export default function DebugPage() {
  // Hooks must be called unconditionally at the top
  const [envCheck, setEnvCheck] = useState<Record<string, unknown> | null>(null);
  const [apiTest, setApiTest] = useState<Record<string, unknown> | null>(null);
  const [dbTest, setDbTest] = useState<Record<string, unknown> | null>(null);
  const isProduction = process.env.NODE_ENV === 'production';

  useEffect(() => {
    // Skip data fetching in production
    if (isProduction) return;
    // Check environment variables
    setEnvCheck({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      strict: process.env.NEXT_PUBLIC_STRICT_DATASOURCE,
      config: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      }
    });

    // Test API endpoint
    fetch('/api/dq/summary')
      .then(res => res.json())
      .then(data => setApiTest({ success: true, data }))
      .catch(err => setApiTest({ success: false, error: err.message }));

    // Test direct Supabase connection
    const supabase = getSupabase();
    supabase
      .from('v_data_health_summary')
      .select('*')
      .limit(1)
      .then(({ data, error }) => {
        setDbTest({
          success: !error,
          data: data,
          error: error?.message
        });
      });
  }, [isProduction]);

  // Production safety: only show debug in development
  if (isProduction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Debug Not Available</h1>
          <p className="text-gray-600 mt-2">Debug information is only available in development mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Debug Dashboard</h1>

        {/* Environment Check */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(envCheck, null, 2)}
          </pre>
        </div>

        {/* API Test */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">API Test (/api/dq/summary)</h2>
          <div className={`p-4 rounded ${apiTest?.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-medium">
              {apiTest?.success ? '✅ SUCCESS' : '❌ FAILED'}
            </p>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          </div>
        </div>

        {/* Database Test */}
        <div className="bg-white rounded-lg p-6 border">
          <h2 className="text-xl font-semibold mb-4">Direct Database Test</h2>
          <div className={`p-4 rounded ${dbTest?.success ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className="font-medium">
              {dbTest?.success ? '✅ SUCCESS' : '❌ FAILED'}
            </p>
            <pre className="text-sm mt-2 overflow-auto">
              {JSON.stringify(dbTest, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}