// CES Backend API Integration
// Connects to leon-intel backend for feature extraction and analysis

import { useState, useEffect } from 'react';

const CES_API_URL = import.meta.env.VITE_CES_API_URL || 'http://localhost:8000';
const LAYOUTMIND_URL = import.meta.env.VITE_LAYOUTMIND_URL || 'http://localhost:10000';

export interface CESDocument {
  doc_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  upload_time: Date;
  processed_time?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface CreativeFeature {
  feature_label: string;
  feature_type: string;
  feature_category: string;
  confidence: number;
  importance_score?: number;
  source_chunk_id: string;
  metadata?: Record<string, any>;
}

export interface BusinessMetric {
  metric_type: string;
  metric_value: string;
  numeric_value?: number;
  unit?: string;
  confidence: number;
  context: string;
}

export interface CESSummary {
  doc_id: string;
  campaign_name?: string;
  brand?: string;
  overall_ces_score: number;
  message_clarity_score: number;
  call_to_action_score: number;
  emotional_impact_score: number;
  visual_distinctiveness_score: number;
  cultural_relevance_score: number;
  multi_platform_score: number;
  creative_strength_index: number;
  award_likelihood: number;
  top_features: Record<string, number>;
  top_metrics: BusinessMetric[];
  semantic_tags: string[];
  summary_text: string;
}

export interface ExtractionResult {
  document: CESDocument;
  chunks: any[];
  creative_features: CreativeFeature[];
  business_metrics: BusinessMetric[];
  summary: CESSummary;
}

class CESBackendAPI {
  /**
   * Upload and process a document for CES analysis
   */
  async uploadDocument(file: File): Promise<{ doc_id: string; status: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${LAYOUTMIND_URL}/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(docId: string): Promise<CESDocument> {
    const response = await fetch(`${LAYOUTMIND_URL}/status/${docId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get full extraction results
   */
  async getExtractionResults(docId: string): Promise<ExtractionResult> {
    const response = await fetch(`${LAYOUTMIND_URL}/results/${docId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get results: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Search documents by query
   */
  async searchDocuments(query: string, filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    minCESScore?: number;
    tags?: string[];
    brand?: string;
  }): Promise<CESDocument[]> {
    const params = new URLSearchParams({ q: query });
    
    if (filters) {
      if (filters.dateFrom) params.append('date_from', filters.dateFrom.toISOString());
      if (filters.dateTo) params.append('date_to', filters.dateTo.toISOString());
      if (filters.minCESScore) params.append('min_ces_score', filters.minCESScore.toString());
      if (filters.tags) params.append('tags', filters.tags.join(','));
      if (filters.brand) params.append('brand', filters.brand);
    }

    const response = await fetch(`${CES_API_URL}/api/documents/search?${params}`);
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get aggregated insights across documents
   */
  async getInsights(tenantId: string): Promise<{
    totalDocuments: number;
    averageCESScore: number;
    topFeatures: { feature: string; count: number; avgImportance: number }[];
    topMetrics: { metric: string; avgValue: number; unit: string }[];
    trends: { date: string; avgScore: number; documentCount: number }[];
  }> {
    const response = await fetch(`${CES_API_URL}/api/insights/${tenantId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get insights: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Batch process multiple documents
   */
  async batchProcess(files: File[]): Promise<{ jobId: string; totalFiles: number }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    const response = await fetch(`${CES_API_URL}/api/batch/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Batch upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get batch job status
   */
  async getBatchStatus(jobId: string): Promise<{
    status: string;
    progress: number;
    processedFiles: number;
    totalFiles: number;
    results?: { doc_id: string; status: string; error?: string }[];
  }> {
    const response = await fetch(`${CES_API_URL}/api/batch/status/${jobId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get batch status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Export analysis results
   */
  async exportResults(docIds: string[], format: 'csv' | 'json' | 'pdf'): Promise<Blob> {
    const response = await fetch(`${CES_API_URL}/api/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ doc_ids: docIds, format }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get creative effectiveness benchmarks
   */
  async getBenchmarks(industry?: string, region?: string): Promise<{
    benchmarks: {
      metric: string;
      industry: string;
      region: string;
      percentile_25: number;
      percentile_50: number;
      percentile_75: number;
      percentile_90: number;
    }[];
  }> {
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (region) params.append('region', region);

    const response = await fetch(`${CES_API_URL}/api/benchmarks?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get benchmarks: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const cesAPI = new CESBackendAPI();

// Hook for React components
export const useCESDocument = (docId: string) => {
  const [document, setDocument] = useState<CESDocument | null>(null);
  const [results, setResults] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [doc, res] = await Promise.all([
          cesAPI.getDocumentStatus(docId),
          cesAPI.getExtractionResults(docId)
        ]);
        setDocument(doc);
        setResults(res);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (docId) {
      fetchData();
    }
  }, [docId]);

  return { document, results, loading, error };
};