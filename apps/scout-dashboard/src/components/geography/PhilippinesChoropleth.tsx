'use client';

/**
 * Philippines Regional Performance Map
 *
 * Real choropleth map of Philippine regions with database-backed metrics.
 * Uses:
 * - Mapbox GL JS for rendering
 * - GeoJSON file: /geo/philippines_regions_v1.geojson (17 regions, simplified boundaries)
 * - Database view: scout.gold_region_metrics (region_code → revenue, transactions, customers, growth)
 *
 * Region Codes:
 * - NCR, REGION_I, CAR, REGION_II, REGION_III, REGION_IV_A, REGION_IV_B,
 *   REGION_V, REGION_VI, REGION_VII, REGION_VIII, REGION_IX, REGION_X,
 *   REGION_XI, REGION_XII, REGION_XIII, BARMM
 *
 * Metrics Flow: Database → useRegionMetrics hook → Map paint properties
 */

import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRegionMetrics, RegionMetric } from '@/data/hooks/useRegionMetrics';

// Mapbox access token (from env)
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoiamd0b2xlbnRpbm8iLCJhIjoiY21jMmNycWRiMDc0ajJqcHZoaDYyeTJ1NiJ9.Dns6WOql16BUQ4l7otaeww';

type MetricType = 'revenue' | 'transactions' | 'customers' | 'growth';

interface PhilippinesChoroplethProps {
  height?: string;
  initialMetric?: MetricType;
}

export const PhilippinesChoropleth: React.FC<PhilippinesChoroplethProps> = ({
  height = '600px',
  initialMetric = 'revenue'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [activeMetric, setActiveMetric] = useState<MetricType>(initialMetric);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const { data: regionMetrics, loading, error } = useRegionMetrics();

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [122.5, 12.5], // Philippines center
      zoom: 5.5,
      minZoom: 5,
      maxZoom: 10
    });

    map.current.on('load', async () => {
      if (!map.current) return;

      // Load Philippine regions GeoJSON
      try {
        const response = await fetch('/geo/philippines_regions_v1.geojson');
        const geojson = await response.json();

        // Add source
        map.current.addSource('philippines-regions', {
          type: 'geojson',
          data: geojson
        });

        // Add fill layer (choropleth)
        map.current.addLayer({
          id: 'regions-fill',
          type: 'fill',
          source: 'philippines-regions',
          paint: {
            'fill-color': '#888888', // Will be updated dynamically
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'hover'], false],
              0.85,
              0.65
            ]
          }
        });

        // Add outline layer
        map.current.addLayer({
          id: 'regions-outline',
          type: 'line',
          source: 'philippines-regions',
          paint: {
            'line-color': '#ffffff',
            'line-width': 2
          }
        });

        // Add selected region highlight
        map.current.addLayer({
          id: 'regions-selected',
          type: 'line',
          source: 'philippines-regions',
          paint: {
            'line-color': '#000000',
            'line-width': [
              'case',
              ['==', ['get', 'region_code'], ''],
              4,
              0
            ]
          }
        });

        // Hover state
        let hoveredRegionId: string | null = null;

        map.current.on('mousemove', 'regions-fill', (e) => {
          if (!map.current) return;
          if (e.features && e.features.length > 0) {
            if (hoveredRegionId) {
              map.current.setFeatureState(
                { source: 'philippines-regions', id: hoveredRegionId },
                { hover: false }
              );
            }
            hoveredRegionId = e.features[0].properties?.region_code || null;
            if (hoveredRegionId) {
              map.current.setFeatureState(
                { source: 'philippines-regions', id: hoveredRegionId },
                { hover: true }
              );
            }
          }
        });

        map.current.on('mouseleave', 'regions-fill', () => {
          if (!map.current) return;
          if (hoveredRegionId) {
            map.current.setFeatureState(
              { source: 'philippines-regions', id: hoveredRegionId },
              { hover: false }
            );
          }
          hoveredRegionId = null;
        });

        // Click handler
        map.current.on('click', 'regions-fill', (e) => {
          if (e.features && e.features.length > 0) {
            const regionCode = e.features[0].properties?.region_code;
            setSelectedRegion(regionCode || null);
          }
        });

        // Cursor
        map.current.on('mouseenter', 'regions-fill', () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current.on('mouseleave', 'regions-fill', () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });

      } catch (err) {
        console.error('Error loading GeoJSON:', err);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update choropleth colors when metrics or activeMetric change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || loading) return;

    const metricKey = activeMetric === 'revenue' ? 'total_revenue' :
                       activeMetric === 'transactions' ? 'total_transactions' :
                       activeMetric === 'customers' ? 'unique_customers' :
                       'growth_rate';

    // Get values for color scale
    const values = Object.values(regionMetrics).map(m => (m as any)[metricKey] || 0);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);

    // Create color expression
    const colorExpression: any[] = ['interpolate', ['linear'], ['get', metricKey]];

    // Color scale: low (blue) → medium (green) → high (red)
    const steps = [
      [minValue, '#3B82F6'],          // Blue (low)
      [minValue + (maxValue - minValue) * 0.33, '#10B981'],  // Green (medium-low)
      [minValue + (maxValue - minValue) * 0.66, '#F59E0B'],  // Orange (medium-high)
      [maxValue, '#EF4444']            // Red (high)
    ];

    steps.forEach(([value, color]) => {
      colorExpression.push(value, color);
    });

    // Update paint property
    map.current.setPaintProperty('regions-fill', 'fill-color', colorExpression);

  }, [regionMetrics, activeMetric, loading]);

  // Update selected region highlight
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    map.current.setPaintProperty('regions-selected', 'line-width', [
      'case',
      ['==', ['get', 'region_code'], selectedRegion || ''],
      4,
      0
    ]);
  }, [selectedRegion]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Error loading region metrics: {error}</p>
      </div>
    );
  }

  const selectedMetric = selectedRegion ? regionMetrics[selectedRegion] : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Metric Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveMetric('revenue')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeMetric === 'revenue'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ₱ Revenue
        </button>
        <button
          onClick={() => setActiveMetric('transactions')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeMetric === 'transactions'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveMetric('customers')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeMetric === 'customers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Customers
        </button>
        <button
          onClick={() => setActiveMetric('growth')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeMetric === 'growth'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Growth %
        </button>
      </div>

      {/* Map Container */}
      <div className="relative rounded-lg overflow-hidden shadow-lg">
        <div ref={mapContainer} style={{ height }} />

        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-gray-700">Loading region metrics...</div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
          <div className="text-sm font-semibold mb-2">
            {activeMetric === 'revenue' ? 'Revenue (₱)' :
             activeMetric === 'transactions' ? 'Transactions' :
             activeMetric === 'customers' ? 'Customers' :
             'Growth Rate (%)'}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#3B82F6] rounded"></div>
              <span className="text-xs">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#10B981] rounded"></div>
              <span className="text-xs">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#F59E0B] rounded"></div>
              <span className="text-xs">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#EF4444] rounded"></div>
              <span className="text-xs">Highest</span>
            </div>
          </div>
        </div>

        {/* Selected Region Info */}
        {selectedMetric && (
          <div className="absolute top-4 right-4 bg-white rounded-lg p-4 shadow-lg max-w-xs">
            <h3 className="font-bold text-lg mb-2">{selectedMetric.region_name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-gray-500">Stores</div>
                <div className="font-semibold">{selectedMetric.total_stores}</div>
              </div>
              <div>
                <div className="text-gray-500">Revenue</div>
                <div className="font-semibold">₱{selectedMetric.total_revenue.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Transactions</div>
                <div className="font-semibold">{selectedMetric.total_transactions.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">Customers</div>
                <div className="font-semibold">{selectedMetric.unique_customers.toLocaleString()}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Growth Rate</div>
                <div className={`font-semibold ${
                  selectedMetric.growth_rate > 0 ? 'text-green-600' :
                  selectedMetric.growth_rate < 0 ? 'text-red-600' :
                  'text-gray-700'
                }`}>
                  {selectedMetric.growth_rate > 0 ? '+' : ''}{selectedMetric.growth_rate}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
