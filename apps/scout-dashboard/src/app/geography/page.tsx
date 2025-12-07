/**
 * Geographical Intelligence Page
 *
 * Real Philippine choropleth map with database-backed regional performance metrics.
 * Route: /geography
 */

import { PhilippinesChoropleth } from '@/components/geography/PhilippinesChoropleth';

export default function GeographyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Geographical Intelligence
        </h1>
        <p className="text-gray-600">
          Philippines Regional Performance Map - Real-time data from Supabase
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Philippines Regional Performance Map
        </h2>

        <PhilippinesChoropleth height="700px" />
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Total Regions</div>
          <div className="text-2xl font-bold">17</div>
          <div className="text-xs text-gray-400 mt-1">Administrative regions of the Philippines</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Data Source</div>
          <div className="text-2xl font-bold">scout.gold_region_metrics</div>
          <div className="text-xs text-gray-400 mt-1">Supabase OPEX database view</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">GeoJSON Boundaries</div>
          <div className="text-2xl font-bold">Simplified</div>
          <div className="text-xs text-gray-400 mt-1">Philippines admin boundaries v1</div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 mb-1">Update Frequency</div>
          <div className="text-2xl font-bold">Real-time</div>
          <div className="text-xs text-gray-400 mt-1">Auto-refreshes on data changes</div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">About This Map</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>17 Philippine Regions</strong> - Official administrative boundaries from NCR to BARMM</li>
          <li>• <strong>Database-Backed Metrics</strong> - Live data from scout.gold_region_metrics view</li>
          <li>• <strong>Interactive Choropleth</strong> - Color-coded by Revenue, Transactions, Customers, or Growth</li>
          <li>• <strong>Click to Explore</strong> - Select any region to view detailed metrics and 7-day growth rate</li>
          <li>• <strong>Demo Region Mapping</strong> - NCR → NCR, North Luzon → Region I, Visayas → Region VII</li>
        </ul>
      </div>
    </div>
  );
}
