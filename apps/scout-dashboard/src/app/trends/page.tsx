'use client';

import { useState } from 'react';
import { useTxTrends } from '@/data/hooks/useScoutData';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Calendar,
  RefreshCw
} from 'lucide-react';

type TabType = 'volume' | 'revenue' | 'basket' | 'stores';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-PH').format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: React.ElementType;
  loading?: boolean;
}

function KPICard({ title, value, subtitle, trend, icon: Icon, loading }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend.value.toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      <div className="text-sm text-gray-500">{title}</div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('volume');
  const { data: trendsData, loading, error, refetch } = useTxTrends();

  // Calculate KPI summaries
  const totalVolume = trendsData.reduce((sum, d) => sum + (d.tx_count || 0), 0);
  const totalRevenue = trendsData.reduce((sum, d) => sum + (d.total_revenue || 0), 0);
  const avgBasketValue = trendsData.length > 0
    ? trendsData.reduce((sum, d) => sum + (d.avg_basket_value || 0), 0) / trendsData.length
    : 0;
  const avgActiveStores = trendsData.length > 0
    ? Math.round(trendsData.reduce((sum, d) => sum + (d.active_stores || 0), 0) / trendsData.length)
    : 0;
  const uniqueCustomers = trendsData.reduce((sum, d) => sum + (d.unique_customers || 0), 0);

  // Calculate trends (compare last 7 days vs previous 7 days)
  const last7Days = trendsData.slice(-7);
  const prev7Days = trendsData.slice(-14, -7);

  const calcTrend = (current: number[], previous: number[]) => {
    const currSum = current.reduce((a, b) => a + b, 0);
    const prevSum = previous.reduce((a, b) => a + b, 0);
    if (prevSum === 0) return null;
    const change = ((currSum - prevSum) / prevSum) * 100;
    return { value: Math.abs(change), direction: change >= 0 ? 'up' : 'down' } as const;
  };

  const volumeTrend = calcTrend(
    last7Days.map(d => d.tx_count || 0),
    prev7Days.map(d => d.tx_count || 0)
  );
  const revenueTrend = calcTrend(
    last7Days.map(d => d.total_revenue || 0),
    prev7Days.map(d => d.total_revenue || 0)
  );

  // Transform data for charts
  const chartData = trendsData.map(row => ({
    date: formatDate(row.tx_date),
    fullDate: row.tx_date,
    volume: row.tx_count || 0,
    revenue: row.total_revenue || 0,
    avgBasket: row.avg_basket_value || 0,
    stores: row.active_stores || 0,
    customers: row.unique_customers || 0,
    avgItems: row.avg_items_per_tx || 0,
  }));

  const tabs = [
    { key: 'volume' as TabType, label: 'Transaction Volume', icon: ShoppingCart },
    { key: 'revenue' as TabType, label: 'Revenue', icon: DollarSign },
    { key: 'basket' as TabType, label: 'Basket Size', icon: Users },
    { key: 'stores' as TabType, label: 'Active Stores', icon: Store },
  ];

  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          No data available for the selected period
        </div>
      );
    }

    switch (activeTab) {
      case 'volume':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [formatNumber(value), 'Transactions']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="volume"
                name="Transactions"
                stroke="#3B82F6"
                fill="url(#volumeGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue (PHP)"
                stroke="#10B981"
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'basket':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} tickFormatter={(v) => `₱${v}`} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [formatCurrency(value), 'Avg Basket']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="avgBasket"
                name="Avg Basket Value"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'stores':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number) => [formatNumber(value), 'Active Stores']}
              />
              <Legend />
              <Bar
                dataKey="stores"
                name="Active Stores"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction Trends</h1>
                <p className="text-sm text-gray-600">Daily transaction performance over time</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Last {trendsData.length} days</span>
              </div>
              <button
                onClick={() => refetch()}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading trends: {error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <KPICard
            icon={ShoppingCart}
            title="Total Transactions"
            value={formatNumber(totalVolume)}
            subtitle="Selected period"
            trend={volumeTrend || undefined}
            loading={loading}
          />
          <KPICard
            icon={DollarSign}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            subtitle="Selected period"
            trend={revenueTrend || undefined}
            loading={loading}
          />
          <KPICard
            icon={Users}
            title="Avg Basket Value"
            value={formatCurrency(avgBasketValue)}
            subtitle="Per transaction"
            loading={loading}
          />
          <KPICard
            icon={Store}
            title="Active Stores"
            value={formatNumber(avgActiveStores)}
            subtitle="Daily average"
            loading={loading}
          />
          <KPICard
            icon={Users}
            title="Unique Customers"
            value={formatNumber(uniqueCustomers)}
            subtitle="Selected period"
            loading={loading}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === tab.key
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading trends data...</span>
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>

        {/* Data Summary */}
        {!loading && chartData.length > 0 && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Data Points:</span>
                <span className="ml-1 font-medium">{chartData.length} days</span>
              </div>
              <div>
                <span className="text-blue-600">Date Range:</span>
                <span className="ml-1 font-medium">
                  {chartData.length > 0 ? `${chartData[0].date} - ${chartData[chartData.length - 1].date}` : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-blue-600">Peak Volume:</span>
                <span className="ml-1 font-medium">
                  {formatNumber(Math.max(...chartData.map(d => d.volume)))} tx
                </span>
              </div>
              <div>
                <span className="text-blue-600">Peak Revenue:</span>
                <span className="ml-1 font-medium">
                  {formatCurrency(Math.max(...chartData.map(d => d.revenue)))}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
