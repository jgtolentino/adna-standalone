/**
 * API Configuration
 */

// Base URL for API endpoints - using mock API server for development
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

// Video Analysis API endpoints (MCP-compatible)
export const VIDEO_API_ENDPOINTS = {
  analyze: '/api/jampacked/analyze',
  results: '/api/jampacked/results',
  query: '/api/jampacked/insights',
  export: '/api/tasks/results',
  batch: '/api/tasks/create',
  history: '/api/tasks/history',
};

// Campaign API endpoints (MCP-compatible)
export const CAMPAIGN_API_ENDPOINTS = {
  analytics: '/api/jampacked/campaigns',
  benchmarks: '/api/jampacked/insights',
  details: '/api/jampacked/campaigns',
  search: '/api/jampacked/campaigns',
};

// Document API endpoints (MCP-compatible)
export const DOCUMENT_API_ENDPOINTS = {
  upload: '/api/documents/upload',
  extract: '/api/documents/extract',
  search: '/api/documents/search',
  insights: '/api/documents/embeddings',
};

// Authentication configuration
export const AUTH_CONFIG = {
  tokenKey: 'auth_token',
  refreshTokenKey: 'refresh_token',
  tokenExpiry: 3600, // 1 hour in seconds
};

// Request timeout configuration
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// File upload configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 500 * 1024 * 1024, // 500MB
  acceptedVideoFormats: ['.mp4', '.mov', '.avi', '.webm'],
  acceptedDocumentFormats: ['.pdf', '.ppt', '.pptx', '.doc', '.docx'],
};

// WebSocket configuration for real-time updates (MCP-compatible)
export const WS_CONFIG = {
  url: API_BASE_URL.replace('http', 'ws') + '/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
};

// MCP Integration exports
export type { MCPIntegrationStatus } from './mcp-integration';
export { mcpIntegration, MCP_ENDPOINTS } from './mcp-integration';