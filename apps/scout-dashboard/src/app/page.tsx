'use client';

import Link from 'next/link';
import { useKPISummary } from '@/data/hooks/useScoutData';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { TrendingUp, TrendingDown, Store, Users, ShoppingCart, Package, MapPin, MessageSquare, Activity } from 'lucide-react';

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

function KPICard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  loading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; direction: 'up' | 'down' };
  icon: React.ElementType;
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Icon className="w-6 h-6 text-blue-600" />
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

function NavigationCard({
  href,
  title,
  description,
  icon: Icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group"
    >
      <div className={`p-3 ${color} rounded-lg w-fit mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Link>
  );
}

export default function HomePage() {
  const { data: kpi, loading, error } = useKPISummary();
  const configured = isSupabaseConfigured();

  // Calculate trends
  const getTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down',
    } as const;
  };

  const revenueTrend = kpi ? getTrend(kpi.today_revenue || 0, kpi.yesterday_revenue || 0) : null;
  const txTrend = kpi ? getTrend(kpi.today_tx_count || 0, kpi.yesterday_tx_count || 0) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Scout XI Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Philippine Retail Intelligence Platform
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${configured ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-500">
                {configured ? 'Connected to Supabase' : 'Demo Mode'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading KPIs: {error}</p>
          </div>
        )}

        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={ShoppingCart}
            title="Total Transactions"
            value={kpi ? formatNumber(kpi.total_transactions) : '—'}
            subtitle="All time"
            loading={loading}
          />
          <KPICard
            icon={Package}
            title="Total Revenue"
            value={kpi ? formatCurrency(kpi.total_revenue) : '—'}
            subtitle="All time"
            trend={revenueTrend || undefined}
            loading={loading}
          />
          <KPICard
            icon={Store}
            title="Active Stores"
            value={kpi ? formatNumber(kpi.active_stores) : '—'}
            subtitle={`${kpi?.total_brands || 0} brands`}
            loading={loading}
          />
          <KPICard
            icon={Users}
            title="Unique Customers"
            value={kpi ? formatNumber(kpi.unique_customers) : '—'}
            subtitle={`Avg basket: ${kpi ? formatCurrency(kpi.avg_basket_value) : '—'}`}
            loading={loading}
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">Today</div>
            <div className="text-xl font-bold text-gray-900">
              {loading ? '...' : formatNumber(kpi?.today_tx_count || 0)} tx
            </div>
            {txTrend && (
              <div className={`text-xs ${txTrend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {txTrend.direction === 'up' ? '+' : '-'}{txTrend.value.toFixed(1)}% vs yesterday
              </div>
            )}
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">This Week</div>
            <div className="text-xl font-bold text-gray-900">
              {loading ? '...' : formatNumber(kpi?.week_tx_count || 0)} tx
            </div>
            <div className="text-xs text-gray-400">
              {kpi ? formatCurrency(kpi.week_revenue) : '—'} revenue
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">This Month</div>
            <div className="text-xl font-bold text-gray-900">
              {loading ? '...' : formatNumber(kpi?.month_tx_count || 0)} tx
            </div>
            <div className="text-xs text-gray-400">
              {kpi ? formatCurrency(kpi.month_revenue) : '—'} revenue
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-500">SKU Coverage</div>
            <div className="text-xl font-bold text-gray-900">
              {loading ? '...' : formatNumber(kpi?.total_skus || 0)} SKUs
            </div>
            <div className="text-xs text-gray-400">
              {kpi?.total_categories || 0} categories
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Explore Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavigationCard
            href="/geography"
            icon={MapPin}
            title="Geographical Intelligence"
            description="Interactive Philippines choropleth map with regional performance metrics and growth rates."
            color="bg-blue-600"
          />
          <NavigationCard
            href="/nlq"
            icon={MessageSquare}
            title="AI Query Interface"
            description="Ask questions in natural language and get instant visualizations of your data."
            color="bg-purple-600"
          />
          <NavigationCard
            href="/data-health"
            icon={Activity}
            title="Data Health Dashboard"
            description="Monitor data quality, ETL activity, and system health in real-time."
            color="bg-green-600"
          />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Scout XI - TBWA Philippine Retail Intelligence Platform</p>
          <p className="mt-1">Real-time data from Supabase scout schema</p>
        </div>
      </div>
    </div>
  );
}
