/**
 * Ask CES API Service
 * Handles all backend communication for the Ask CES dashboard
 */

import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '@/config/api';

// Types for API requests and responses
export interface CampaignAnalysisRequest {
  campaignId?: string;
  campaignName?: string;
  dateRange: {
    start: string;
    end: string;
  };
  metrics: string[];
  filters?: {
    market?: string;
    channel?: string;
    audience?: string;
  };
}

export interface CampaignAnalysisResponse {
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
    roi: number;
    ctr: number;
    cvr: number;
  };
  insights: Array<{
    type: 'opportunity' | 'risk' | 'trend';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    confidence: number;
  }>;
  recommendations: Array<{
    action: string;
    expectedImpact: string;
    priority: number;
  }>;
  visualizations?: Array<{
    type: 'chart' | 'table' | 'metric';
    data: any;
  }>;
}

export interface CreativeBriefRequest {
  brand: string;
  objective: string;
  targetAudience: {
    demographics: string[];
    psychographics: string[];
    behaviors: string[];
  };
  budget?: number;
  timeline?: string;
  mandatories?: string[];
  tone?: string;
}

export interface CreativeBriefResponse {
  brief: {
    executiveSummary: string;
    strategicDirection: string;
    creativeTerritory: string;
    keyMessages: string[];
    mandatories: string[];
    deliverables: Array<{
      type: string;
      specifications: string;
      deadline: string;
    }>;
  };
  references: Array<{
    title: string;
    description: string;
    url?: string;
  }>;
  moodboard?: {
    images: string[];
    colorPalette: string[];
    typography: string[];
  };
}

export interface MarketInsightsRequest {
  industry: string;
  market?: string;
  timeframe: {
    start: string;
    end: string;
  };
  focusAreas?: string[];
}

export interface MarketInsightsResponse {
  trends: Array<{
    name: string;
    description: string;
    impact: number;
    timeHorizon: string;
    evidence: string[];
  }>;
  opportunities: Array<{
    title: string;
    description: string;
    potentialValue: string;
    requiredCapabilities: string[];
  }>;
  threats: Array<{
    risk: string;
    likelihood: number;
    impact: number;
    mitigation: string;
  }>;
  competitiveLandscape: {
    marketSize: number;
    growthRate: number;
    keyPlayers: Array<{
      name: string;
      marketShare: number;
      strengths: string[];
    }>;
  };
}

export interface CompetitorAnalysisRequest {
  competitors: string[];
  metrics: string[];
  period: {
    start: string;
    end: string;
  };
  channels?: string[];
}

export interface CompetitorAnalysisResponse {
  comparison: {
    [competitor: string]: {
      [metric: string]: number | string;
    };
  };
  strengths: {
    [competitor: string]: string[];
  };
  weaknesses: {
    [competitor: string]: string[];
  };
  opportunities: string[];
  recommendations: Array<{
    strategy: string;
    rationale: string;
    expectedOutcome: string;
  }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    command?: string;
    visualizations?: any[];
    sources?: string[];
  };
}

export interface ChatRequest {
  message: string;
  context?: {
    previousMessages?: ChatMessage[];
    activeFilters?: any;
    currentTab?: string;
  };
  agent?: 'general' | 'creative' | 'analytics' | 'market';
}

export interface ChatResponse {
  response: {
    content: string;
    type: 'text' | 'analysis' | 'visualization' | 'error';
    visualizations?: Array<{
      type: string;
      data: any;
      config?: any;
    }>;
    suggestedActions?: string[];
  };
  metadata: {
    processingTime: number;
    confidence: number;
    sources: string[];
    tokens?: {
      prompt: number;
      completion: number;
    };
  };
}

// API Client Class
class AskCesApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          console.error('Authentication error');
        }
        return Promise.reject(error);
      }
    );
  }

  // Campaign Analysis
  async analyzeCampaign(request: CampaignAnalysisRequest): Promise<CampaignAnalysisResponse> {
    const response = await this.client.post('/api/analyze-campaign', request);
    return response.data;
  }

  // Creative Brief Generation
  async generateCreativeBrief(request: CreativeBriefRequest): Promise<CreativeBriefResponse> {
    const response = await this.client.post('/api/generate-brief', request);
    return response.data;
  }

  // Market Insights
  async getMarketInsights(request: MarketInsightsRequest): Promise<MarketInsightsResponse> {
    const response = await this.client.post('/api/market-insights', request);
    return response.data;
  }

  // Competitor Analysis
  async analyzeCompetitors(request: CompetitorAnalysisRequest): Promise<CompetitorAnalysisResponse> {
    const response = await this.client.post('/api/competitor-analysis', request);
    return response.data;
  }

  // Chat Interface
  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await this.client.post('/api/chat', request);
    return response.data;
  }

  // Dashboard Data
  async getDashboardData(filters?: any): Promise<any> {
    const response = await this.client.get('/api/dashboard', { params: filters });
    return response.data;
  }

  // Insights
  async getInsights(filters?: any): Promise<any> {
    const response = await this.client.get('/api/insights', { params: filters });
    return response.data;
  }

  // Audience Data
  async getAudienceData(filters?: any): Promise<any> {
    const response = await this.client.get('/api/audience', { params: filters });
    return response.data;
  }

  // Video Analysis
  async analyzeVideo(formData: FormData, onProgress?: (progress: number) => void): Promise<any> {
    const response = await this.client.post('/api/video-analysis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  // Get video analysis status
  async getVideoAnalysisStatus(analysisId: string): Promise<any> {
    const response = await this.client.get(`/api/video-analysis/${analysisId}/status`);
    return response.data;
  }

  // Export data
  async exportData(type: 'csv' | 'pdf' | 'xlsx', data: any): Promise<Blob> {
    const response = await this.client.post(
      '/api/export',
      { type, data },
      { responseType: 'blob' }
    );
    return response.data;
  }
}

// Export singleton instance
export const askCesApi = new AskCesApiClient();

// Helper functions for command parsing
export function parseCommand(message: string): { command: string; params: any } {
  const lowerMessage = message.toLowerCase();
  
  // Campaign analysis patterns
  if (lowerMessage.includes('analyze') && lowerMessage.includes('campaign')) {
    const campaignMatch = message.match(/campaign[:\s]+([^\s,]+)/i);
    const dateMatch = message.match(/from\s+(\S+)\s+to\s+(\S+)/i);
    
    return {
      command: 'analyze-campaign',
      params: {
        campaignName: campaignMatch?.[1],
        dateRange: dateMatch ? {
          start: dateMatch[1],
          end: dateMatch[2]
        } : undefined,
        metrics: ['all'] // Default to all metrics
      }
    };
  }
  
  // Creative brief patterns
  if (lowerMessage.includes('generate') && lowerMessage.includes('brief')) {
    const brandMatch = message.match(/for\s+([^\s,]+)/i);
    
    return {
      command: 'generate-brief',
      params: {
        brand: brandMatch?.[1] || 'Unknown Brand',
        objective: 'brand awareness', // Extract from message
        targetAudience: {
          demographics: ['25-34'],
          psychographics: ['tech-savvy'],
          behaviors: ['online shoppers']
        }
      }
    };
  }
  
  // Market insights patterns
  if (lowerMessage.includes('market') && (lowerMessage.includes('insight') || lowerMessage.includes('research'))) {
    return {
      command: 'market-insights',
      params: {
        industry: 'retail', // Extract from context
        timeframe: {
          start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    };
  }
  
  // Competitor analysis patterns
  if (lowerMessage.includes('competitor') || lowerMessage.includes('competitive')) {
    return {
      command: 'competitor-analysis',
      params: {
        competitors: ['Competitor A', 'Competitor B'], // Extract from message
        metrics: ['market_share', 'campaigns', 'spend'],
        period: {
          start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      }
    };
  }
  
  // Default to general chat
  return {
    command: 'chat',
    params: { message }
  };
}

// Note: askCesApi already exported above