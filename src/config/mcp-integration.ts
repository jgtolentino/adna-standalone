/**
 * MCP Backend Integration Configuration
 */

// MCP Backend URLs
export const MCP_CONFIG = {
  // Local MCP SQLite Server
  local: {
    http: 'http://localhost:3000',
    mcp: 'stdio:/Users/tbwa/Documents/GitHub/mcp-sqlite-server/build/index.js',
    database: '/Users/tbwa/Documents/GitHub/mcp-sqlite-server/data/database.sqlite'
  },
  
  // Cloud MCP PostgreSQL Server
  cloud: {
    http: process.env.VITE_MCP_HTTP_URL || 'https://your-render-app.onrender.com',
    database: process.env.VITE_DATABASE_URL || 'postgresql://...',
    apiKey: process.env.VITE_MCP_API_KEY || ''
  }
};

// Environment detection
export const isProduction = import.meta.env.MODE === 'production';
export const currentMCPConfig = isProduction ? MCP_CONFIG.cloud : MCP_CONFIG.local;

// MCP API Endpoints
export const MCP_ENDPOINTS = {
  // JamPacked Creative Intelligence
  creative: {
    analyze: '/api/jampacked/analyze',
    results: '/api/jampacked/results',
    campaigns: '/api/jampacked/campaigns',
    insights: '/api/jampacked/insights'
  },
  
  // Task Management
  tasks: {
    create: '/api/tasks',
    status: '/api/tasks/status',
    results: '/api/tasks/results',
    history: '/api/tasks/history'
  },
  
  // Document Processing
  documents: {
    upload: '/api/documents/upload',
    extract: '/api/documents/extract',
    search: '/api/documents/search',
    embeddings: '/api/documents/embeddings'
  },
  
  // Workspace Management
  workspaces: {
    list: '/api/workspaces',
    create: '/api/workspaces',
    route: '/api/workspaces/route',
    archive: '/api/workspaces/archive'
  },
  
  // Data Sync
  sync: {
    claude_desktop: '/api/sync/claude-desktop',
    claude_code: '/api/sync/claude-code',
    webapp: '/api/sync/webapp'
  }
};

// MCP Request Configuration
export const MCP_REQUEST_CONFIG = {
  timeout: 30000,
  retries: 3,
  backoff: 1000,
  headers: {
    'Content-Type': 'application/json',
    'X-Client': 'lions-palette-forge',
    'X-Version': '1.0.0'
  }
};

// WebSocket Configuration for Real-time Updates
export const MCP_WS_CONFIG = {
  url: currentMCPConfig.http.replace('http', 'ws') + '/ws',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatInterval: 30000
};

// Integration Status
export interface MCPIntegrationStatus {
  connected: boolean;
  lastSync: Date | null;
  activeConnections: {
    claude_desktop: boolean;
    claude_code: boolean;
    webapp: boolean;
  };
  pendingTasks: number;
  errorCount: number;
}

export class MCPIntegration {
  private wsConnection: WebSocket | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempts = 0;

  /**
   * Initialize MCP connection
   */
  async connect(): Promise<MCPIntegrationStatus> {
    try {
      // Test HTTP connection
      const response = await fetch(`${currentMCPConfig.http}/health`, {
        method: 'GET',
        headers: {
          ...MCP_REQUEST_CONFIG.headers,
          'Authorization': `Bearer ${'apiKey' in currentMCPConfig ? currentMCPConfig.apiKey : ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`MCP Server unavailable: ${response.status}`);
      }

      // Initialize WebSocket
      this.initializeWebSocket();

      return {
        connected: true,
        lastSync: new Date(),
        activeConnections: {
          claude_desktop: true,
          claude_code: true,
          webapp: true
        },
        pendingTasks: 0,
        errorCount: 0
      };
    } catch (error) {
      console.error('MCP Connection failed:', error);
      return {
        connected: false,
        lastSync: null,
        activeConnections: {
          claude_desktop: false,
          claude_code: false,
          webapp: false
        },
        pendingTasks: 0,
        errorCount: 1
      };
    }
  }

  /**
   * Send request to MCP backend
   */
  async request(endpoint: string, data?: any, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST') {
    const url = `${currentMCPConfig.http}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...MCP_REQUEST_CONFIG.headers,
          'Authorization': `Bearer ${'apiKey' in currentMCPConfig ? currentMCPConfig.apiKey : ''}`
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: AbortSignal.timeout(MCP_REQUEST_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`MCP Request failed [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Initialize WebSocket connection for real-time updates
   */
  private initializeWebSocket() {
    this.wsConnection = new WebSocket(MCP_WS_CONFIG.url);
    
    this.wsConnection.onopen = () => {
      console.log('MCP WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
    };

    this.wsConnection.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    this.wsConnection.onclose = () => {
      console.log('MCP WebSocket disconnected');
      this.stopHeartbeat();
      this.handleReconnect();
    };

    this.wsConnection.onerror = (error) => {
      console.error('MCP WebSocket error:', error);
    };
  }

  /**
   * Handle WebSocket messages
   */
  private handleWebSocketMessage(message: any) {
    switch (message.type) {
      case 'task_update':
        // Handle task status updates
        window.dispatchEvent(new CustomEvent('mcp:task_update', { detail: message.data }));
        break;
      case 'analysis_complete':
        // Handle analysis completion
        window.dispatchEvent(new CustomEvent('mcp:analysis_complete', { detail: message.data }));
        break;
      case 'sync_update':
        // Handle sync updates from other Claude interfaces
        window.dispatchEvent(new CustomEvent('mcp:sync_update', { detail: message.data }));
        break;
      default:
        console.log('Unknown WebSocket message type:', message.type);
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat() {
    this.heartbeatTimer = window.setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'ping' }));
      }
    }, MCP_WS_CONFIG.heartbeatInterval);
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect() {
    if (this.reconnectAttempts < MCP_WS_CONFIG.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting to MCP WebSocket (attempt ${this.reconnectAttempts})`);
        this.initializeWebSocket();
      }, MCP_WS_CONFIG.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  /**
   * Disconnect from MCP
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

// Export singleton instance
export const mcpIntegration = new MCPIntegration();
