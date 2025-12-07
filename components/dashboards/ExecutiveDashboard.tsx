'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Users, Package, Activity } from 'lucide-react'

interface KPIData {
  totalRevenue: number
  revenueChange: number
  avgTransactionValue: number
  totalTransactions: number
  activeStores: number
}

interface TrendData {
  date: string
  revenue: number
  transactions: number
  avgTransactionValue: number
}

interface CategoryData {
  name: string
  value: number
}

export default function ExecutiveDashboard() {
  const [kpiData, setKpiData] = useState<KPIData | null>(null)
  const [trendData, setTrendData] = useState<TrendData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiSummary, setAiSummary] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    setLoading(true)
    setError(null)

    try {
      // Load daily metrics for KPIs
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: metrics, error: metricsError } = await supabase
        .from('daily_metrics')
        .select('*')
        .gte('date', thirtyDaysAgo.toISOString())
        .order('date', { ascending: true })

      if (metricsError) {
        throw metricsError
      }

      let revenueChange = 0
      let rollingRevenue = 0
      let derivedKpis: KPIData | null = null

      if (metrics && metrics.length > 0) {
        // Calculate KPIs
        const totalRevenue = metrics.reduce((sum, m) => sum + Number(m.total_revenue), 0)
        const totalTransactions = metrics.reduce((sum, m) => sum + Number(m.total_transactions), 0)
        const previousRevenue = metrics
          .slice(0, 15)
          .reduce((sum, m) => sum + Number(m.total_revenue), 0)
        const currentRevenue = metrics
          .slice(15)
          .reduce((sum, m) => sum + Number(m.total_revenue), 0)

        revenueChange = previousRevenue > 0
          ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
          : 0

        rollingRevenue = totalRevenue
        derivedKpis = {
          totalRevenue,
          revenueChange,
          avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
          totalTransactions,
          activeStores: 0
        }

        // Prepare trend data
        const trends = metrics.map(m => ({
          date: new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: Number(m.total_revenue),
          transactions: m.total_transactions,
          avgTransactionValue: Number(m.avg_transaction_value || 0)
        }))
        setTrendData(trends)
      }

      // Load executive-level KPI overview (live seed data)
      const { data: kpiOverview, error: kpiError } = await supabase
        .from('gold_kpi_overview')
        .select('*')
        .single()

      if (kpiError) {
        throw kpiError
      }

      setKpiData(
        kpiOverview
          ? {
              totalRevenue: rollingRevenue || Number(kpiOverview.total_revenue) || 0,
              revenueChange,
              avgTransactionValue: Number(kpiOverview.avg_transaction_value) || 0,
              totalTransactions: Number(kpiOverview.total_transactions) || 0,
              activeStores: Number(kpiOverview.total_stores) || 0
            }
          : derivedKpis
      )

      // Category distribution (30-day window)
      const { data: categoryRows, error: categoryError } = await supabase
        .from('transactions')
        .select('category, peso_value')
        .gte('timestamp', thirtyDaysAgo.toISOString())

      if (categoryError) {
        throw categoryError
      }

      if (categoryRows) {
        const aggregated = categoryRows.reduce<Record<string, number>>((acc, row) => {
          const key = row.category || 'Uncategorized'
          const value = Number(row.peso_value) || 0
          acc[key] = (acc[key] || 0) + value
          return acc
        }, {})

        const distribution = Object.entries(aggregated)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8)

        setCategoryData(distribution)
      }

      // Load AI summary
      const { data: insights, error: insightsError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('insight_type', 'executive_summary')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (insightsError) {
        throw insightsError
      }

      if (insights) {
        setAiSummary(insights.content)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load executive dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading executive insights...</div>
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-700/40 bg-red-900/20 p-6 text-red-200">
        <p className="font-semibold text-red-100">Unable to load executive dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          className="mt-4 rounded bg-red-600 px-3 py-1 text-sm font-semibold text-white hover:bg-red-500"
          onClick={loadDashboardData}
        >
          Retry loading data
        </button>
      </div>
    )
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="space-y-6">
      {/* KPI Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">
                ₱{(kpiData?.totalRevenue ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                {kpiData?.revenueChange && kpiData.revenueChange > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-500 text-sm">+{(kpiData?.revenueChange ?? 0).toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-500 text-sm">{(kpiData?.revenueChange ?? 0).toFixed(1)}%</span>
                  </>
                )}
              </div>
          </div>
          <DollarSign className="h-8 w-8 text-blue-500" />
        </div>
      </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Transaction Value</p>
              <p className="text-3xl font-bold mt-1">₱{(kpiData?.avgTransactionValue ?? 0).toLocaleString()}</p>
              <p className="text-gray-400 text-sm mt-2">Based on latest Supabase seed</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold mt-1">{(kpiData?.totalTransactions ?? 0).toLocaleString()}</p>
              <p className="text-yellow-500 text-sm mt-2">90-day seed window</p>
            </div>
            <Package className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Stores</p>
              <p className="text-3xl font-bold mt-1">{(kpiData?.activeStores ?? 0).toLocaleString()}</p>
              <p className="text-purple-500 text-sm mt-2">Seeded in Supabase</p>
            </div>
            <Activity className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
            Executive AI Summary
          </h3>
          <p className="text-gray-300 leading-relaxed">{aiSummary}</p>
        </div>
      )}

      {/* Revenue Trend Chart */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-xl font-semibold mb-4">Revenue Trend (30 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#F3F4F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Transaction Volume</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData.slice(-7)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#F3F4F6' }}
                />
                <Bar dataKey="transactions" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Category Distribution</h3>
          <div className="h-64">
            {categoryData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}