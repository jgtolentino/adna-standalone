'use client';

import React, { useState, useCallback } from 'react';
import { Search, Loader2, TrendingUp, BarChart3, PieChart, Area, Scatter } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area as RechartsArea,
  ScatterChart,
  Scatter as RechartsScatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface NLQResponse {
  success: boolean;
  data: any[];
  chartConfig: {
    type: string;
    xField?: string;
    yField?: string;
    dataKey?: string;
    nameKey?: string;
  };
  query: string;
  executedSql: string;
  error?: string;
}

interface NLQChartProps {
  className?: string;
}

const CHART_ICONS = {
  bar: BarChart3,
  line: TrendingUp,
  pie: PieChart,
  area: Area,
  scatter: Scatter
};

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
];

export default function NLQChart({ className = '' }: NLQChartProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<NLQResponse | null>(null);
  const [suggestions] = useState([
    "Show sales by day",
    "Compare transactions by store",
    "Brand performance analysis",
    "Category breakdown",
    "Daypart analysis"
  ]);

  const executeQuery = useCallback(async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/nlq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText, limit: 100 })
      });

      const data: NLQResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        data: [],
        chartConfig: { type: 'bar' },
        query: queryText,
        executedSql: '',
        error: 'Failed to execute query'
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeQuery(query);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    executeQuery(suggestion);
  };

  const renderChart = () => {
    if (!result?.data || result.data.length === 0) return null;

    const { data, chartConfig } = result;
    const { type, xField, yField, dataKey, nameKey } = chartConfig;

    const commonProps = {
      width: '100%',
      height: 400,
      data: data
    };

    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={yField}
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer {...commonProps}>
            <RechartsPieChart>
              <Tooltip />
              <Legend />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey={dataKey || 'value'}
                nameKey={nameKey || 'name'}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <RechartsArea
                type="monotone"
                dataKey={yField}
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis dataKey={yField} />
              <Tooltip />
              <Legend />
              <RechartsScatter
                data={data}
                fill="#3B82F6"
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xField} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey={yField}
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getChartIcon = () => {
    if (!result?.chartConfig?.type) return Search;
    return CHART_ICONS[result.chartConfig.type as keyof typeof CHART_ICONS] || BarChart3;
  };

  const ChartIcon = getChartIcon();

  return (
    <div className={`bg-white rounded-lg shadow-lg border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Natural Language Query
            </h3>
            <p className="text-sm text-gray-600">
              Ask questions about your Scout data in plain English
            </p>
          </div>
        </div>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me sales by store this month"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="absolute right-2 top-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Query
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isLoading}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Processing your query...</span>
          </div>
        )}

        {result && !isLoading && (
          <>
            {result.success ? (
              <div className="space-y-6">
                {/* Chart Header */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <ChartIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">
                      Results for: "{result.query}"
                    </h4>
                    <p className="text-sm text-gray-600">
                      {result.data.length} records • {result.chartConfig.type} chart
                    </p>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderChart()}
                </div>

                {/* Data Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">Data Summary</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Records:</span>
                      <span className="ml-1 font-medium">{result.data.length}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Chart Type:</span>
                      <span className="ml-1 font-medium capitalize">{result.chartConfig.type}</span>
                    </div>
                    {result.chartConfig.xField && (
                      <div>
                        <span className="text-blue-600">X-Axis:</span>
                        <span className="ml-1 font-medium">{result.chartConfig.xField}</span>
                      </div>
                    )}
                    {result.chartConfig.yField && (
                      <div>
                        <span className="text-blue-600">Y-Axis:</span>
                        <span className="ml-1 font-medium">{result.chartConfig.yField}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="p-3 bg-red-50 rounded-lg inline-block mb-4">
                  <Search className="w-8 h-8 text-red-600" />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">Query Failed</h4>
                <p className="text-gray-600">
                  {result.error || 'Unable to process your query. Please try a different question.'}
                </p>
              </div>
            )}
          </>
        )}

        {!result && !isLoading && (
          <div className="text-center py-12">
            <div className="p-3 bg-gray-50 rounded-lg inline-block mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Start Exploring</h4>
            <p className="text-gray-600">
              Enter a question above or click one of the example queries to begin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}