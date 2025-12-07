'use client';

import { useState } from 'react';
import { useProductMix, useBrandPerformance } from '@/data/hooks/useScoutData';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Treemap
} from 'recharts';
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Tag,
  RefreshCw,
  Award
} from 'lucide-react';

type TabType = 'category' | 'brands' | 'pareto' | 'treemap';

const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

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

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
  loading?: boolean;
}

function KPICard({ title, value, subtitle, icon: Icon, color = 'blue', loading }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

// Custom tooltip for Pie chart
const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900">{data.product_category}</p>
        <p className="text-sm text-gray-600">Revenue: {formatCurrency(data.revenue)}</p>
        <p className="text-sm text-gray-600">Transactions: {formatNumber(data.tx_count)}</p>
        <p className="text-sm text-gray-600">Share: {formatPercent(data.revenue_share_pct)}</p>
      </div>
    );
  }
  return null;
};

// Custom label for Pie chart
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show labels for small slices

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function ProductMixPage() {
  const [activeTab, setActiveTab] = useState<TabType>('category');
  const { data: productMix, loading: mixLoading, error: mixError, refetch: refetchMix } = useProductMix();
  const { data: brandData, loading: brandLoading, error: brandError, refetch: refetchBrand } = useBrandPerformance(20);

  const loading = mixLoading || brandLoading;
  const error = mixError || brandError;

  const refetch = () => {
    refetchMix();
    refetchBrand();
  };

  // Calculate KPI summaries
  const totalRevenue = productMix.reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalTransactions = productMix.reduce((sum, d) => sum + (d.tx_count || 0), 0);
  const totalUnits = productMix.reduce((sum, d) => sum + (d.units_sold || 0), 0);
  const totalCategories = productMix.length;
  const totalBrands = productMix.reduce((sum, d) => sum + (d.brand_count || 0), 0);
  const totalSKUs = productMix.reduce((sum, d) => sum + (d.sku_count || 0), 0);

  // Transform data for charts
  const categoryChartData = productMix.map((row, index) => ({
    ...row,
    name: row.product_category,
    value: row.revenue,
    fill: COLORS[index % COLORS.length],
  }));

  // Prepare Pareto data (cumulative)
  const sortedForPareto = [...productMix].sort((a, b) => (b.revenue || 0) - (a.revenue || 0));
  let cumulativeRevenue = 0;
  const paretoData = sortedForPareto.map((row) => {
    cumulativeRevenue += row.revenue || 0;
    return {
      ...row,
      name: row.product_category,
      revenue: row.revenue,
      cumulativePercent: totalRevenue > 0 ? (cumulativeRevenue / totalRevenue) * 100 : 0,
    };
  });

  // Brand data for bar chart
  const brandChartData = brandData
    .slice(0, 15)
    .map((row, index) => ({
      ...row,
      name: row.brand_name?.length > 12 ? row.brand_name.slice(0, 12) + '...' : row.brand_name,
      fullName: row.brand_name,
      fill: row.tbwa_client_brand ? '#3B82F6' : '#94A3B8',
    }));

  // Treemap data
  const treemapData = productMix.map((row, index) => ({
    name: row.product_category,
    size: row.revenue,
    fill: COLORS[index % COLORS.length],
  }));

  const tabs = [
    { key: 'category' as TabType, label: 'Category Mix', icon: Package },
    { key: 'brands' as TabType, label: 'Top Brands', icon: Award },
    { key: 'pareto' as TabType, label: 'Pareto Analysis', icon: TrendingUp },
    { key: 'treemap' as TabType, label: 'Revenue Map', icon: ShoppingBag },
  ];

  const renderChart = () => {
    if (productMix.length === 0) {
      return (
        <div className="flex items-center justify-center h-96 text-gray-500">
          No product mix data available
        </div>
      );
    }

    switch (activeTab) {
      case 'category':
        return (
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value, entry: any) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'brands':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={brandChartData} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                type="number"
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6B7280"
                fontSize={11}
                width={80}
              />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number, name: string, props: any) => [
                  formatCurrency(value),
                  props.payload.tbwa_client_brand ? `${props.payload.fullName} (TBWA Client)` : props.payload.fullName
                ]}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[0, 4, 4, 0]}
              >
                {brandChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pareto':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={paretoData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#6B7280" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis
                yAxisId="left"
                stroke="#3B82F6"
                fontSize={12}
                tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={12}
                tickFormatter={(v) => `${v.toFixed(0)}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px' }}
                formatter={(value: number, name: string) => [
                  name === 'Revenue' ? formatCurrency(value) : `${value.toFixed(1)}%`,
                  name
                ]}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="revenue"
                name="Revenue"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="cumulativePercent"
                name="Cumulative %"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'treemap':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <Treemap
              data={treemapData}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              fill="#8884d8"
              content={({ x, y, width, height, name, size }: any) => {
                if (width < 50 || height < 30) return null;
                return (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={treemapData.find(d => d.name === name)?.fill || '#ccc'}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                    <text
                      x={x + width / 2}
                      y={y + height / 2 - 8}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={width > 100 ? 14 : 11}
                      fontWeight="bold"
                    >
                      {name}
                    </text>
                    <text
                      x={x + width / 2}
                      y={y + height / 2 + 10}
                      textAnchor="middle"
                      fill="#fff"
                      fontSize={width > 100 ? 12 : 10}
                    >
                      {formatCurrency(size)}
                    </text>
                  </g>
                );
              }}
            />
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
              <div className="p-2 bg-purple-50 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Product Mix & SKU Analytics</h1>
                <p className="text-sm text-gray-600">Category distribution and brand performance</p>
              </div>
            </div>
            <button
              onClick={refetch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Error loading data: {error}</p>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <KPICard
            icon={DollarSign}
            title="Total Revenue"
            value={formatCurrency(totalRevenue)}
            color="green"
            loading={loading}
          />
          <KPICard
            icon={ShoppingBag}
            title="Transactions"
            value={formatNumber(totalTransactions)}
            color="blue"
            loading={loading}
          />
          <KPICard
            icon={Package}
            title="Units Sold"
            value={formatNumber(totalUnits)}
            color="purple"
            loading={loading}
          />
          <KPICard
            icon={Tag}
            title="Categories"
            value={formatNumber(totalCategories)}
            color="orange"
            loading={loading}
          />
          <KPICard
            icon={Award}
            title="Brands"
            value={formatNumber(totalBrands)}
            color="blue"
            loading={loading}
          />
          <KPICard
            icon={Package}
            title="SKUs"
            value={formatNumber(totalSKUs)}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-6 pt-4">
            <div className="flex gap-1 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-600'
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
                <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
                <span className="ml-2 text-gray-600">Loading product data...</span>
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>

        {/* Category Details Table */}
        {!loading && productMix.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Category Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Sold</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rev Share</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Brands</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">SKUs</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productMix.map((row, index) => (
                    <tr key={row.product_category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-medium text-gray-900">{row.product_category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                        {formatCurrency(row.revenue || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatNumber(row.tx_count || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatNumber(row.units_sold || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {formatPercent(row.revenue_share_pct || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatNumber(row.brand_count || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">
                        {formatNumber(row.sku_count || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TBWA Client Brands Note */}
        {activeTab === 'brands' && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-blue-700">TBWA Client Brand</span>
              <span className="mx-2 text-blue-400">|</span>
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              <span className="text-sm text-blue-700">Other Brand</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
