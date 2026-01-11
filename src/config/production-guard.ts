/**
 * Production Guard - Ensures no mock data in production builds
 */

export const isProduction = import.meta.env.PROD;
export const isDevelopment = import.meta.env.DEV;
export const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';

// Strict production check - fail loudly if mocks are enabled in production
if (isProduction && useMockApi) {
  console.error('❌ CRITICAL: Mock API is enabled in production build!');
  throw new Error('Mock API cannot be used in production');
}

// Helper to conditionally import mock modules
export async function importIfDevelopment<T>(
  importFn: () => Promise<T>
): Promise<T | null> {
  if (isDevelopment || useMockApi) {
    return importFn();
  }
  return null;
}

// Backend status checker
export function getBackendStatus() {
  return {
    mode: isProduction ? 'production' : 'development',
    dataSource: useMockApi ? 'MOCK_DATA' : 'LIVE_API',
    apiUrl: import.meta.env.VITE_MCP_HTTP_URL || 'http://localhost:3000',
    timestamp: new Date().toISOString()
  };
}

// Log backend configuration on startup
if (typeof window !== 'undefined') {
  console.log('🔍 Backend Configuration:', getBackendStatus());
}