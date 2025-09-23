import React, { useState, useEffect } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Filter, TrendingUp, Loader2 } from 'lucide-react';
import { CSVDataService } from '@/services/csvDataService';

interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

interface ProductMixChartProps {
  data?: CategoryData[];
  useRealData?: boolean;
}

const sampleData: CategoryData[] = [
  { name: 'Beverages', value: 35, fill: '#3B82F6' },
  { name: 'Snacks', value: 25, fill: '#10B981' },
  { name: 'Personal Care', value: 20, fill: '#F59E0B' },
  { name: 'Household', value: 15, fill: '#EF4444' },
  { name: 'Others', value: 5, fill: '#8B5CF6' }
];

export const ProductMixChart: React.FC<ProductMixChartProps> = ({
  data: propData,
  useRealData = true
}) => {
  const [data, setData] = useState<CategoryData[]>(propData || sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'categoryMix' | 'pareto' | 'substitutions' | 'basket'>('categoryMix');

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
      const productMixData = await csvService.getProductMix();
      setData(productMixData);
    } catch (err) {
      setError('Failed to load product mix data');
      console.error('Error loading real data:', err);
      setData(sampleData); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'categoryMix', label: 'Category Mix' },
    { key: 'pareto', label: 'Pareto Analysis' },
    { key: 'substitutions', label: 'Substitutions' },
    { key: 'basket', label: 'Basket Analysis' }
  ] as const;

  const renderLabel = (entry: CategoryData) => {
    return `${entry.name}: ${entry.value}%`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading product mix data...</span>
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
          Product Mix & SKU Analytics {useRealData && <span className="text-sm text-green-600">(Real Data)</span>}
        </h2>
        <Filter className="h-4 w-4 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* SKU Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total SKUs</p>
            <p className="text-xl font-bold text-gray-900">369</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Active SKUs</p>
            <p className="text-xl font-bold text-green-600">342</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">New SKUs</p>
            <p className="text-xl font-bold text-blue-600">12</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={renderLabel}
                labelLine={false}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Key Insight */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Key Insight</p>
              <p className="text-sm text-blue-700">
                Top 20% of SKUs generate 80% of revenue. Consider optimizing inventory for high-performing items.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};