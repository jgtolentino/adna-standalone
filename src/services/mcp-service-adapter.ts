/**
 * MCP Service Adapter
 * Bridges Lions Palette Forge services to MCP backend
 */

import { mcpIntegration, MCP_ENDPOINTS } from '../config/mcp-integration';

// Types for MCP requests/responses
export interface MCPAnalysisRequest {
  type: 'video' | 'campaign' | 'document';
  data: any;
  options?: {
    priority?: 'low' | 'medium' | 'high';
    callback_url?: string;
    metadata?: Record<string, any>;
  };
}

export interface MCPAnalysisResponse {
  success: boolean;
  task_id?: string;
  results?: any;
  error?: string;
  estimated_time?: number;
}

export interface MCPTask {
  id: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  results?: any;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

export class MCPServiceAdapter {
  
  /**
   * Video Analysis Service Adapter
   */
  async analyzeVideo(videoData: any, options: any = {}): Promise<MCPAnalysisResponse> {
    try {
      const request: MCPAnalysisRequest = {
        type: 'video',
        data: {
          video_url: videoData.url,
          video_file: videoData.file,
          analysis_type: options.analysisType || 'comprehensive',
          ces_enabled: true,
          features: {
            visual_analysis: true,
            audio_analysis: true,
            text_extraction: true,
            emotion_detection: true,
            scene_detection: true,
            brand_recognition: true
          }
        },
        options: {
          priority: options.priority || 'medium',
          metadata: {
            campaign_id: options.campaignId,
            user_id: options.userId,
            source: 'lions-palette-forge'
          }
        }
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.creative.analyze,
        request
      );

      return {
        success: true,
        task_id: response.task_id,
        estimated_time: response.estimated_time || 300
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Campaign Analysis Service Adapter
   */
  async analyzeCampaign(campaignData: any, options: any = {}): Promise<MCPAnalysisResponse> {
    try {
      const request: MCPAnalysisRequest = {
        type: 'campaign',
        data: {
          campaign_materials: campaignData.materials,
          campaign_context: campaignData.context,
          analysis_depth: options.depth || 'standard',
          ces_scoring: true,
          benchmark_comparison: true,
          features: {
            creative_effectiveness: true,
            visual_complexity: true,
            emotional_resonance: true,
            brand_consistency: true,
            cultural_sensitivity: true,
            award_prediction: true
          }
        },
        options: {
          priority: options.priority || 'high',
          metadata: {
            campaign_id: campaignData.id,
            brand: campaignData.brand,
            source: 'lions-palette-forge'
          }
        }
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.creative.analyze,
        request
      );

      return {
        success: true,
        task_id: response.task_id,
        estimated_time: response.estimated_time || 600
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Document Processing Service Adapter
   */
  async processDocument(documentData: any, options: any = {}): Promise<MCPAnalysisResponse> {
    try {
      const request = {
        document_url: documentData.url,
        document_file: documentData.file,
        extraction_type: options.extractionType || 'full',
        processing_options: {
          ocr_enabled: true,
          text_extraction: true,
          image_analysis: true,
          metadata_extraction: true,
          embeddings_generation: true
        },
        workspace_route: options.workspaceRoute || 'default'
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.documents.extract,
        request
      );

      return {
        success: true,
        task_id: response.task_id,
        results: response.results
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Task Status
   */
  async getTaskStatus(taskId: string): Promise<MCPTask | null> {
    try {
      const response = await mcpIntegration.request(
        `${MCP_ENDPOINTS.tasks.status}/${taskId}`,
        null,
        'GET'
      );

      return {
        id: response.id,
        type: response.type,
        status: response.status,
        progress: response.progress || 0,
        results: response.results,
        error: response.error,
        created_at: new Date(response.created_at),
        updated_at: new Date(response.updated_at)
      };
    } catch (error) {
      console.error('Failed to get task status:', error);
      return null;
    }
  }

  /**
   * Get Task Results
   */
  async getTaskResults(taskId: string): Promise<any> {
    try {
      const response = await mcpIntegration.request(
        `${MCP_ENDPOINTS.tasks.results}/${taskId}`,
        null,
        'GET'
      );

      return response.results;
    } catch (error) {
      console.error('Failed to get task results:', error);
      throw error;
    }
  }

  /**
   * Search Documents
   */
  async searchDocuments(query: string, filters: any = {}): Promise<any> {
    try {
      const request = {
        query,
        filters: {
          workspace_id: filters.workspaceId,
          document_type: filters.documentType,
          date_range: filters.dateRange,
          tags: filters.tags
        },
        limit: filters.limit || 20,
        offset: filters.offset || 0
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.documents.search,
        request
      );

      return response.results;
    } catch (error) {
      console.error('Document search failed:', error);
      throw error;
    }
  }

  /**
   * Get Campaign Analytics
   */
  async getCampaignAnalytics(filters: any = {}): Promise<any> {
    try {
      const request = {
        time_range: filters.timeRange || '30d',
        campaign_types: filters.campaignTypes,
        brands: filters.brands,
        metrics: filters.metrics || ['ces_score', 'effectiveness', 'engagement'],
        include_benchmarks: true
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.creative.campaigns,
        request
      );

      return response.analytics;
    } catch (error) {
      console.error('Failed to get campaign analytics:', error);
      throw error;
    }
  }

  /**
   * Get Creative Insights
   */
  async getCreativeInsights(analysisId: string): Promise<any> {
    try {
      const response = await mcpIntegration.request(
        `${MCP_ENDPOINTS.creative.insights}/${analysisId}`,
        null,
        'GET'
      );

      return response.insights;
    } catch (error) {
      console.error('Failed to get creative insights:', error);
      throw error;
    }
  }

  /**
   * Route File to Workspace
   */
  async routeFileToWorkspace(fileMetadata: any, userContext: any): Promise<any> {
    try {
      const request = {
        file_metadata: fileMetadata,
        user_context: userContext,
        routing_preferences: {
          auto_route: true,
          apply_policies: true,
          notify_on_archive: true
        }
      };

      const response = await mcpIntegration.request(
        MCP_ENDPOINTS.workspaces.route,
        request
      );

      return response.workspace_route;
    } catch (error) {
      console.error('File routing failed:', error);
      throw error;
    }
  }

  /**
   * Sync with Claude Desktop/Code
   */
  async syncWithClaudeInterfaces(syncData: any): Promise<boolean> {
    try {
      const request = {
        sync_target: 'all', // or 'claude_desktop', 'claude_code', 'webapp'
        data: syncData,
        timestamp: Date.now()
      };

      await mcpIntegration.request(
        MCP_ENDPOINTS.sync.webapp,
        request
      );

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }

  /**
   * Export Analysis Results
   */
  async exportResults(taskId: string, format: 'pdf' | 'csv' | 'json' = 'pdf'): Promise<Blob> {
    try {
      const response = await fetch(
        `${mcpIntegration.request}${MCP_ENDPOINTS.tasks.results}/${taskId}/export?format=${format}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.VITE_MCP_API_KEY || ''}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }

  /**
   * Start Real-time Monitoring
   */
  startRealtimeMonitoring(taskId: string, onUpdate: (update: any) => void): void {
    // Listen for WebSocket updates
    window.addEventListener('mcp:task_update', (event: CustomEvent) => {
      if (event.detail.task_id === taskId) {
        onUpdate(event.detail);
      }
    });

    window.addEventListener('mcp:analysis_complete', (event: CustomEvent) => {
      if (event.detail.task_id === taskId) {
        onUpdate(event.detail);
      }
    });
  }

  /**
   * Stop Real-time Monitoring
   */
  stopRealtimeMonitoring(): void {
    window.removeEventListener('mcp:task_update', () => {});
    window.removeEventListener('mcp:analysis_complete', () => {});
  }
}

// Export singleton instance
export const mcpServiceAdapter = new MCPServiceAdapter();
