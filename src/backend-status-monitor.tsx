import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, WifiOff, Wifi } from 'lucide-react';

interface BackendStatus {
  isConnected: boolean;
  dataSource: 'LIVE_API' | 'MOCK_DATA' | 'CHECKING';
  lastChecked: Date;
  apiEndpoint?: string;
  responseTime?: number;
}

export const BackendStatusMonitor: React.FC = () => {
  const [status, setStatus] = useState<BackendStatus>({
    isConnected: false,
    dataSource: 'CHECKING',
    lastChecked: new Date(),
  });

  useEffect(() => {
    const checkBackendStatus = async () => {
      const startTime = Date.now();
      
      try {
        // Check if we're using mock API
        const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
        
        if (useMockApi) {
          setStatus({
            isConnected: false,
            dataSource: 'MOCK_DATA',
            lastChecked: new Date(),
          });
          return;
        }

        // Try to reach the actual API
        const apiUrl = import.meta.env.VITE_MCP_HTTP_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000),
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
          setStatus({
            isConnected: true,
            dataSource: 'LIVE_API',
            lastChecked: new Date(),
            apiEndpoint: apiUrl,
            responseTime,
          });
        } else {
          throw new Error('API health check failed');
        }
      } catch (error) {
        // If API fails, check if mock fallback is active
        setStatus({
          isConnected: false,
          dataSource: 'MOCK_DATA',
          lastChecked: new Date(),
        });
      }
    };

    // Check immediately
    checkBackendStatus();

    // Check every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    switch (status.dataSource) {
      case 'LIVE_API':
        return 'text-green-600';
      case 'MOCK_DATA':
        return 'text-yellow-600';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = () => {
    switch (status.dataSource) {
      case 'LIVE_API':
        return <Wifi className="w-4 h-4" />;
      case 'MOCK_DATA':
        return <WifiOff className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (status.dataSource) {
      case 'LIVE_API':
        return `Live API (${status.responseTime}ms)`;
      case 'MOCK_DATA':
        return 'Mock Data (Offline Mode)';
      default:
        return 'Checking...';
    }
  };

  if (process.env.NODE_ENV === 'production' && status.dataSource === 'MOCK_DATA') {
    console.error('WARNING: Production build is using mock data!');
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md bg-gray-100 ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="text-sm font-medium">
        Data Source: {getStatusText()}
      </span>
      {status.dataSource === 'MOCK_DATA' && (
        <span className="text-xs text-red-600 ml-2">
          ⚠️ Not connected to backend
        </span>
      )}
    </div>
  );
};

// Export a hook for programmatic access
export const useBackendStatus = () => {
  const [isRealBackend, setIsRealBackend] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const useMockApi = import.meta.env.VITE_USE_MOCK_API === 'true';
        if (useMockApi) {
          setIsRealBackend(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_MCP_HTTP_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        });

        setIsRealBackend(response.ok);
      } catch {
        setIsRealBackend(false);
      }
    };

    checkBackend();
  }, []);

  return isRealBackend;
};