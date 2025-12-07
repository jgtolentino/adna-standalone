'use client';

import { NLQChart } from '@/components/databank';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function NLQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Scout Analytics AI
                </h1>
                <p className="text-sm text-gray-600">
                  Natural Language Query Interface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                AI-Powered
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ask Questions About Your Data
          </h2>
          <p className="text-gray-600 max-w-3xl">
            Use natural language to explore your Scout transaction data. Ask questions like
            "Show me sales by store" or "What's the trend over time" and get instant visualizations.
          </p>
        </div>

        {/* NLQ Component */}
        <div className="mb-8">
          <NLQChart />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="p-2 bg-blue-50 rounded-lg w-fit mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Natural Language
            </h3>
            <p className="text-gray-600 text-sm">
              Ask questions in plain English. No need to learn SQL or complex query syntax.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="p-2 bg-green-50 rounded-lg w-fit mb-4">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Instant Visualizations
            </h3>
            <p className="text-gray-600 text-sm">
              Get immediate charts and graphs based on your queries. Multiple chart types supported.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="p-2 bg-purple-50 rounded-lg w-fit mb-4">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Secure & Fast
            </h3>
            <p className="text-gray-600 text-sm">
              Queries only access whitelisted Gold/Platinum views. Fast execution with intelligent caching.
            </p>
          </div>
        </div>

        {/* Example Queries */}
        <div className="bg-white rounded-lg border border-gray-200 mt-8 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Example Queries You Can Try
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Time-based Analysis</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• "Show sales by day"</li>
                <li>• "Revenue trends over time"</li>
                <li>• "Daypart analysis"</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Performance Analysis</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• "Compare transactions by store"</li>
                <li>• "Brand performance analysis"</li>
                <li>• "Category breakdown"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}