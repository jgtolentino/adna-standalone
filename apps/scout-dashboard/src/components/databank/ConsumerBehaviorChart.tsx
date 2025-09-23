import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, Cell } from 'recharts';
import { Filter, Heart, Sparkles, Loader2 } from 'lucide-react';
import { CSVDataService } from '@/services/csvDataService';

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface ConsumerBehaviorChartProps {
  data?: FunnelData[];
  useRealData?: boolean;
}

const sampleData: FunnelData[] = [
  { name: 'Store Visit', value: 1000, fill: '#3B82F6' },
  { name: 'Product Browse', value: 850, fill: '#10B981' },
  { name: 'Brand Request', value: 650, fill: '#F59E0B' },
  { name: 'Accept Suggestion', value: 480, fill: '#8B5CF6' },
  { name: 'Purchase', value: 420, fill: '#EC4899' }
];

// Custom Funnel Component since Recharts doesn't have a built-in Funnel chart
const CustomFunnel: React.FC<{ data: FunnelData[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="h-full flex flex-col justify-center">
      <svg width="100%" height="246" viewBox="0 0 546 246">
        {data.map((item, index) => {
          const width = (item.value / maxValue) * 440; // Max width of 440px
          const height = 47.2; // Height per section
          const y = index * height + 5;
          const x = (546 - width) / 2; // Center horizontally
          
          // Create trapezoid path for funnel effect
          const nextWidth = index < data.length - 1 ? (data[index + 1].value / maxValue) * 440 : width;
          const topLeft = x;
          const topRight = x + width;
          const bottomLeft = x + (width - nextWidth) / 2;
          const bottomRight = topRight - (width - nextWidth) / 2;
          
          const path = `M ${topLeft},${y}L ${topRight},${y}L ${bottomRight},${y + height}L ${bottomLeft},${y + height}L ${topLeft},${y} Z`;
          
          return (
            <g key={item.name}>
              <path
                d={path}
                fill={item.fill}
                stroke="#fff"
                strokeWidth={2}
              />
              <text
                x={546 / 2}
                y={y + height / 2}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="600"
                dy="0.35em"
              >
                {item.value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const ConsumerBehaviorChart: React.FC<ConsumerBehaviorChartProps> = ({
  data: propData,
  useRealData = true
}) => {
  const [data, setData] = useState<FunnelData[]>(propData || sampleData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'funnel' | 'methods' | 'acceptance' | 'traits'>('funnel');

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
      const behaviorData = await csvService.getConsumerBehavior();
      setData(behaviorData);
    } catch (err) {
      setError('Failed to load consumer behavior data');
      console.error('Error loading real data:', err);
      setData(sampleData); // Fallback to sample data
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'funnel', label: 'Purchase Funnel' },
    { key: 'methods', label: 'Request Methods' },
    { key: 'acceptance', label: 'Acceptance Rates' },
    { key: 'traits', label: 'Behavior Traits' }
  ] as const;

  const conversionRate = data.length > 0 ? ((data[data.length - 1].value / data[0].value) * 100).toFixed(0) : '0';
  const suggestionAcceptRate = data.length > 3 ? ((data[3].value / data[2].value) * 100).toFixed(1) : '0.0';

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading consumer behavior data...</span>
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
          Consumer Behavior & Preferences {useRealData && <span className="text-sm text-green-600">(Real Data)</span>}
        </h2>
        <Filter className="h-4 w-4 text-gray-400" />
      </div>

      <div className="space-y-4">
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-xl font-bold text-gray-900">{conversionRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Suggestion Accept</p>
            <p className="text-xl font-bold text-green-600">{suggestionAcceptRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500">Brand Loyalty</p>
            <p className="text-xl font-bold text-blue-600">68%</p>
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
            <div className="w-full h-full">
              <CustomFunnel data={data} />
            </div>
          </ResponsiveContainer>
        </div>

        {/* Behavior Insights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">High Brand Affinity</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">68% repeat purchase rate</p>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Discovery Oriented</span>
            </div>
            <p className="text-xs text-green-700 mt-1">23% try new products</p>
          </div>
        </div>
      </div>
    </div>
  );
};