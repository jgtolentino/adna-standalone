import { useState, useEffect } from 'react'
import { dataService } from '../services/dataService'

interface StoreLocation {
  id: number
  name: string
  lat: number
  lng: number
  revenue: number
  transactions: number
  performance: number
  analyzed: boolean
  revenue_share: number
  avg_transaction_value: number
  performance_tier: 'Top' | 'Medium' | 'Low'
  morning_revenue_est: number
  single_item_txns_est: number
  bundle_opportunity: number
}

interface GeographicInsights {
  concentration_risk: {
    store_108_dominance: number
    top_3_stores_share: number
    geographic_spread: string
    recommendation: string
  }
  performance_clusters: {
    high_performance_zone: string
    underperforming_areas: string[]
    expansion_opportunities: string[]
  }
  analyzed_vs_network: {
    analyzed_avg_revenue: number
    network_avg_revenue: number
    performance_gap: number
  }
  optimization_priorities: Array<{
    area: string
    action: string
    impact: string
  }>
}

interface UseStoreDataReturn {
  stores: StoreLocation[]
  insights: GeographicInsights
  loading: boolean
  error: string | null
}

function buildInsights(stores: StoreLocation[]): GeographicInsights {
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0)
  const sortedByRevenue = [...stores].sort((a, b) => b.revenue - a.revenue)
  const topStore = sortedByRevenue[0]
  const topThree = sortedByRevenue.slice(0, 3)
  const uniqueLocations = new Set(stores.map(store => store.name)).size

  const topShare = totalRevenue > 0 && topStore
    ? (topStore.revenue / totalRevenue) * 100
    : 0

  const topThreeShare = totalRevenue > 0
    ? (topThree.reduce((sum, store) => sum + store.revenue, 0) / totalRevenue) * 100
    : 0

  const underperformingAreas = sortedByRevenue.slice(-3).map(store => store.name)
  const expansionOpportunities = sortedByRevenue
    .filter(store => store.performance_tier === 'Medium')
    .slice(0, 3)
    .map(store => store.name)

  const avgRevenue = stores.length ? totalRevenue / stores.length : 0

  return {
    concentration_risk: {
      store_108_dominance: Number(topShare.toFixed(1)),
      top_3_stores_share: Number(topThreeShare.toFixed(1)),
      geographic_spread: `${uniqueLocations} active stores`,
      recommendation: topShare > 40
        ? 'Diversify revenue across more locations to reduce concentration risk.'
        : 'Revenue is balanced across the network; continue monitoring emerging stores.'
    },
    performance_clusters: {
      high_performance_zone: topStore?.name || 'No data',
      underperforming_areas: underperformingAreas,
      expansion_opportunities: expansionOpportunities
    },
    analyzed_vs_network: {
      analyzed_avg_revenue: Number(avgRevenue.toFixed(2)),
      network_avg_revenue: Number(avgRevenue.toFixed(2)),
      performance_gap: 0
    },
    optimization_priorities: [
      topStore
        ? {
            area: topStore.name,
            action: 'Protect and extend leadership with targeted inventory and staffing',
            impact: `₱${Math.round(topStore.revenue * 0.1).toLocaleString()}`
          }
        : {
            area: 'Network',
            action: 'Awaiting live store performance data',
            impact: '₱0'
          },
      ...underperformingAreas.slice(0, 2).map(area => ({
        area,
        action: 'Lift performance with local promos and CX fixes',
        impact: 'Revenue upside once stabilized'
      }))
    ]
  }
}

export function useStoreData(): UseStoreDataReturn {
  const [stores, setStores] = useState<StoreLocation[]>([])
  const [insights, setInsights] = useState<GeographicInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchStoreData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch store performance from Supabase (live seed data)
        const storePerformance = await dataService.fetchStorePerformance(1000)

        const aggregated = new Map<string, StoreLocation>()

        storePerformance.forEach((store, index) => {
          const key = String(store.storeid || index + 1)
          const current = aggregated.get(key)

          const revenue = Number(store.total_price) || 0
          const lat = store.geolatitude ?? null
          const lng = store.geolongitude ?? null

          const base: StoreLocation = current || {
            id: store.storeid || index + 1,
            name: store.storename || `Store ${store.storeid || index + 1}`,
            lat: lat || 0,
            lng: lng || 0,
            revenue: 0,
            transactions: 0,
            performance: 0,
            analyzed: true,
            revenue_share: 0,
            avg_transaction_value: 0,
            performance_tier: 'Low',
            morning_revenue_est: 0,
            single_item_txns_est: 0,
            bundle_opportunity: 0
          }

          const updatedRevenue = (base.revenue || 0) + revenue
          const updatedTransactions = (base.transactions || 0) + 1

          aggregated.set(key, {
            ...base,
            lat: base.lat || lat || 0,
            lng: base.lng || lng || 0,
            revenue: updatedRevenue,
            transactions: updatedTransactions,
            avg_transaction_value: updatedRevenue / Math.max(updatedTransactions, 1)
          })
        })

        const totalRevenue = Array.from(aggregated.values()).reduce(
          (sum, store) => sum + store.revenue,
          0
        )

        const transformedStores: StoreLocation[] = Array.from(aggregated.values()).map(store => {
          const performanceScore = totalRevenue > 0
            ? (store.revenue / totalRevenue) * 100
            : 0
          const performanceTier = performanceScore >= 50
            ? 'Top'
            : performanceScore >= 20
              ? 'Medium'
              : 'Low'

          return {
            ...store,
            performance: Number(performanceScore.toFixed(1)),
            performance_tier: performanceTier,
            revenue_share: totalRevenue > 0 ? store.revenue / totalRevenue : 0,
            morning_revenue_est: store.revenue * 0.35,
            single_item_txns_est: store.transactions * 0.65,
            bundle_opportunity: store.revenue * 0.2
          }
        })

        const derivedInsights = buildInsights(transformedStores)

        if (isMounted) {
          setStores(transformedStores)
          setInsights(derivedInsights)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to fetch store data from Supabase:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch store data')
          setLoading(false)
        }
      }
    }

    fetchStoreData()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    stores,
    insights: insights || buildInsights([]),
    loading,
    error
  }
}