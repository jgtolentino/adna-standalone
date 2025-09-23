import React, { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Filter, ShoppingCart, Clock, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { CSVDataService } from '@/services/csvDataService';

interface TransactionData {
  date: string;
  volume: number;
  revenue: number;
  basketSize: number;
  duration: number;
}

interface TransactionTrendsChartProps {
  data?: TransactionData[];
  useRealData?: boolean;
}

const sampleData: TransactionData[] = [
  { date: '2025-08-19', volume: 450, revenue: 150000, basketSize: 3.2, duration: 12.5 },
  { date: '2025-08-20', volume: 380, revenue: 145000, basketSize: 3.0, duration: 11.8 },
  { date: '2025-08-21', volume: 520, revenue: 175000, basketSize: 3.5, duration: 13.2 },
  { date: '2025-08-22', volume: 690, revenue: 220000, basketSize: 3.8, duration: 15.1 },
  { date: '2025-08-23', volume: 410, revenue: 160000, basketSize: 2.9, duration: 10.5 },
  { date: '2025-08-24', volume: 580, revenue: 190000, basketSize: 3.4, duration: 12.8 },
  { date: '2025-09-15', volume: 506, revenue: 173695, basketSize: 3.2, duration: 11.9 }
];

export const TransactionTrendsChart: React.FC<TransactionTrendsChartProps> = ({
  data: propData,
  useRealData = true
}) => {
  const [data, setData] = useState<TransactionData[]>(propData || sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'volume' | 'revenue' | 'basketSize' | 'duration'>('volume');
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    if (useRealData && !propData) {
      loadRealData();
    } else if (propData) {
      setData(propData);
    }
  }, [useRealData, propData]);

  const loadRealData = async () => {
    setLoading(true);
    setError(null);
    try {
      const csvService = CSVDataService.getInstance();
      const trendsData = await csvService.getTransactionTrends();
      setData(trendsData);
    } catch (err) {
      setError('Failed to load transaction data');
      console.error('Error loading real data:', err);
      setData(sampleData); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'volume', label: 'Volume', icon: ShoppingCart },
    { key: 'revenue', label: '₱ Revenue', icon: null },
    { key: 'basketSize', label: 'Basket Size', icon: null },
    { key: 'duration', label: 'Duration', icon: Clock }
  ] as const;

  const currentData = data[data.length - 1];
  const previousData = data[data.length - 2];

  const getMetricValue = (item: TransactionData, metric: string) => {
    switch (metric) {
      case 'volume': return item.volume;
      case 'revenue': return item.revenue;
      case 'basketSize': return item.basketSize;
      case 'duration': return item.duration;
      default: return item.volume;
    }
  };

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'volume': return value.toString();
      case 'revenue': return `₱${value.toLocaleString()}`;
      case 'basketSize': return value.toFixed(1);
      case 'duration': return `${value.toFixed(1)}min`;
      default: return value.toString();
    }
  };

  const calculateTrend = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down'
    };
  };

  const volumeTrend = calculateTrend(currentData.volume, previousData.volume);
  const revenueTrend = calculateTrend(currentData.revenue, previousData.revenue);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading transaction data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64 text-red-600">
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Transaction Trends {useRealData && <span className="text-sm text-green-600">(Real Data)</span>}
        </h2>
        <Filter className="h-4 w-4 text-gray-400" />
      </div>

      {/* Metrics Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Daily Volume</p>
                <p className="text-2xl font-bold text-gray-900">{currentData.volume}</p>
              </div>
              <div className={`flex items-center ${volumeTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {volumeTrend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium ml-1">{volumeTrend.value.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Daily Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₱{currentData.revenue.toLocaleString()}</p>
              </div>
              <div className={`flex items-center ${revenueTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {revenueTrend.direction === 'up' ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium ml-1">{revenueTrend.value.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {IconComponent && <IconComponent className="h-4 w-4 inline mr-1" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Compare Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={compareMode}
              onChange={(e) => setCompareMode(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Compare with previous period
          </label>
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#93BBFC" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#666' }}
                tickFormatter={(value) => formatValue(value, activeTab)}
              />
              <Tooltip
                formatter={(value: number) => [formatValue(value, activeTab), tabs.find(t => t.key === activeTab)?.label]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey={activeTab}
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};