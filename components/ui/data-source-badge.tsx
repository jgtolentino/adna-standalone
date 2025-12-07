"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Database, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataSourceStatus {
  source_status: string;
  trusted_datasets: number;
  total_datasets: number;
  last_validation: string;
}

interface DataSourceBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  refreshInterval?: number; // in seconds
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  className,
  size = 'md',
  showDetails = false,
  refreshInterval = 300 // 5 minutes default
}) => {
  const [status, setStatus] = useState<DataSourceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const supabase = createClient();

  const fetchDataSourceStatus = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .rpc('get_data_source_status');

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setStatus(data[0]);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching data source status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSourceStatus();

    // Set up refresh interval
    const interval = setInterval(fetchDataSourceStatus, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getBadgeVariant = () => {
    if (!status) return 'secondary';

    switch (status.source_status) {
      case 'Trusted':
        return 'default'; // Green
      case 'Mock/Sample':
        return 'destructive'; // Red
      default:
        return 'secondary'; // Gray
    }
  };

  const getBadgeIcon = () => {
    if (loading) {
      return <Clock className="w-3 h-3 animate-spin" />;
    }

    if (error) {
      return <AlertTriangle className="w-3 h-3" />;
    }

    if (!status) {
      return <Database className="w-3 h-3" />;
    }

    switch (status.source_status) {
      case 'Trusted':
        return <Shield className="w-3 h-3" />;
      case 'Mock/Sample':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Database className="w-3 h-3" />;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-sm px-3 py-2';
      default:
        return 'text-xs px-2.5 py-1.5';
    }
  };

  const getDisplayText = () => {
    if (loading) return 'Checking...';
    if (error) return 'Error';
    if (!status) return 'Unknown';

    return status.source_status;
  };

  const getTooltipText = () => {
    if (loading) return 'Validating data source...';
    if (error) return `Error: ${error}`;
    if (!status) return 'Data source status unknown';

    const lastValidation = new Date(status.last_validation).toLocaleString();
    const lastRefreshTime = lastRefresh.toLocaleString();

    return `Data Source: ${status.source_status}
Trusted Datasets: ${status.trusted_datasets}/${status.total_datasets}
Last Validation: ${lastValidation}
Last Refresh: ${lastRefreshTime}`;
  };

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Badge
        variant={getBadgeVariant()}
        className={cn(
          "inline-flex items-center gap-1.5 font-medium border transition-all duration-200",
          getSizeClasses(),
          loading && "opacity-75",
          error && "border-destructive/50"
        )}
        title={getTooltipText()}
      >
        {getBadgeIcon()}
        <span>{getDisplayText()}</span>
      </Badge>

      {showDetails && status && !loading && (
        <div className="text-xs text-muted-foreground">
          {status.trusted_datasets}/{status.total_datasets} datasets
        </div>
      )}
    </div>
  );
};

// Hook for programmatic access to data source status
export const useDataSourceStatus = (refreshInterval: number = 300) => {
  const [status, setStatus] = useState<DataSourceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchStatus = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .rpc('get_data_source_status');

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        setStatus(data[0]);
      }
    } catch (err) {
      console.error('Error fetching data source status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return {
    status,
    loading,
    error,
    refresh: fetchStatus,
    isTrusted: status?.source_status === 'Trusted'
  };
};

export default DataSourceBadge;