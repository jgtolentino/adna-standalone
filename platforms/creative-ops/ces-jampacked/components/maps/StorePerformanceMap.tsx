import React, { useMemo } from 'react'
import { MapPin, TrendingUp, DollarSign, BarChart3, Users } from 'lucide-react'
import { useStoreData } from '../../hooks/useStoreData'
import { useRealAnalytics } from '../../hooks/useRealAnalytics'
import StoreMap from './StoreMap'

interface StorePerformanceMapProps {
  className?: string
}

const StorePerformanceMap: React.FC<StorePerformanceMapProps> = ({ className = '' }) => {
  const { stores, loading, error } = useStoreData()
  const { data: realData, loading: realLoading } = useRealAnalytics()

  const topStore = useMemo(() => {
    return [...stores].sort((a, b) => b.revenue - a.revenue)[0]
  }, [stores])

  const averageRevenue = useMemo(() => {
    if (!stores.length) return 0
    return stores.reduce((sum, store) => sum + store.revenue, 0) / stores.length
  }, [stores])

  // Performance summary calculations
  const performanceStats = useMemo(() => {
    if (!stores.length) return { top: 0, medium: 0, low: 0, analyzed: 0 }

    return {
      top: stores.filter(s => s.performance_tier === 'Top').length,
      medium: stores.filter(s => s.performance_tier === 'Medium').length,
      low: stores.filter(s => s.performance_tier === 'Low').length,
      analyzed: stores.filter(s => s.analyzed).length
    }
  }, [stores])

  if (loading || realLoading) {
    return (
      <div className={`scout-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-scout-secondary" />
          <h3 className="text-lg font-semibold text-scout-text">Store Performance Map</h3>
        </div>
        <div className="h-96 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500">Loading store locations...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`scout-card p-6 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-scout-secondary" />
          <h3 className="text-lg font-semibold text-scout-text">Store Performance Map</h3>
        </div>
        <div className="h-96 flex items-center justify-center bg-red-50 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-red-600">Error loading map: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-scout-secondary" />
          <h3 className="text-lg font-semibold text-scout-text">Interactive Store Performance Map</h3>
        </div>
        <div className="text-sm text-gray-500">
          {stores.length} stores • {performanceStats.analyzed} analyzed
        </div>
      </div>

      {/* Interactive Map */}
      {realData && realData.geographicalIntelligence && (
        <StoreMap
          geographicalData={realData.geographicalIntelligence}
          className="mb-6"
        />
      )}

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-xl font-bold text-green-600">
            {performanceStats.top}
          </div>
          <div className="text-green-700">Top Performers</div>
        </div>

        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-xl font-bold text-yellow-600">
            {performanceStats.medium}
          </div>
          <div className="text-yellow-700">Medium Performance</div>
        </div>

        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-xl font-bold text-red-600">
            {performanceStats.low}
          </div>
          <div className="text-red-700">Need Improvement</div>
        </div>

        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xl font-bold text-blue-600">
            {performanceStats.analyzed}
          </div>
          <div className="text-blue-700">Analyzed Stores</div>
        </div>
      </div>

      {/* Key Store Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h4 className="font-medium text-green-800 mb-2">Top Performing Store</h4>
          {topStore ? (
            <p className="text-sm text-green-700">
              {topStore.name} leads with ₱{topStore.revenue.toLocaleString()} in the latest seed data,
              contributing {(topStore.revenue / Math.max(averageRevenue * stores.length, 1) * 100).toFixed(1)}% of network
              revenue.
            </p>
          ) : (
            <p className="text-sm text-green-700">No store performance data available yet.</p>
          )}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-medium text-blue-800 mb-2">Analytics Impact</h4>
          <p className="text-sm text-blue-700">
            Live Supabase seeds show an average of ₱{Math.round(averageRevenue).toLocaleString()} per store.
            Use regional filters to direct enablement where revenue trails the network average.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StorePerformanceMap