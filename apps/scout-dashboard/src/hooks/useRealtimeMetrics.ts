'use client';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabaseClient';

type Payload = {
  new?: any;
  old?: any;
  eventType: string;
  table: string;
  schema: string;
};

export function useRealtimeMetrics() {
  const [tick, setTick] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    const channel = supabase
      .channel('scout-realtime-metrics')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scout_gold_transactions_flat'
        },
        (payload: Payload) => {
          console.log('Real-time update:', payload);
          setTick((t) => t + 1);
          setLastUpdate(new Date());
        }
      )
      .on('presence', { event: 'sync' }, () => {
        setIsConnected(true);
      })
      .subscribe((status) => {
        console.log('Realtime connection status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, []);

  return {
    tick, // Use this to trigger re-fetches via SWR/React Query
    setTick, // Expose for manual refetch capability
    lastUpdate,
    isConnected,
  };
}

// Alternative hook for specific data refetching
export function useRealtimeData<T>(
  fetcher: () => Promise<T>,
  options: {
    refreshInterval?: number;
    enabled?: boolean;
  } = {}
) {
  const { tick, setTick } = useRealtimeMetrics();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { refreshInterval = 0, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await fetcher();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    // Fetch immediately and on realtime updates
    fetchData();

    // Optional polling fallback
    let interval: NodeJS.Timeout | undefined;
    if (refreshInterval > 0) {
      interval = setInterval(fetchData, refreshInterval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [tick, enabled, refreshInterval]);

  return { data, loading, error, refetch: () => setTick(prev => prev + 1) };
}