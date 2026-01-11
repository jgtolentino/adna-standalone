// Connector types and configurations

export type ConnectorType = 
  | 'database' 
  | 'cloud_storage' 
  | 'api' 
  | 'document' 
  | 'mcp'
  | 'webhook'
  | 'streaming';

export interface ConnectorConfig {
  // Common fields
  id?: string;
  name?: string;
  type?: ConnectorType;
  tenantId?: string;
  createdBy?: string;
  createdAt?: Date;
  
  // Connection specifics
  provider?: string;
  endpoint?: string;
  path?: string;
  authType?: string;
  dbType?: string;
  connectionString?: string;
  mcpEndpoint?: string;
  protocol?: string;
  
  // Auth credentials (encrypted)
  credentials?: {
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
    username?: string;
    password?: string;
    certificate?: string;
  };
  
  // Advanced settings
  options?: {
    ssl?: boolean;
    timeout?: number;
    retryPolicy?: {
      maxRetries: number;
      backoffMs: number;
    };
    rateLimit?: {
      requestsPerMinute: number;
      burstSize: number;
    };
    proxy?: {
      host: string;
      port: number;
      auth?: {
        username: string;
        password: string;
      };
    };
  };
  
  // Data processing
  transformation?: {
    enabled: boolean;
    script?: string;
    mapping?: Record<string, string>;
  };
  
  // Monitoring
  monitoring?: {
    healthCheckUrl?: string;
    alertEmail?: string;
    metricsEnabled?: boolean;
  };
}

export interface ConnectorInstance {
  id: string;
  config: ConnectorConfig;
  status: ConnectorStatus;
  lastSync?: Date;
  nextSync?: Date;
  metrics: ConnectorMetrics;
  permissions: ConnectorPermissions;
}

export interface ConnectorStatus {
  state: 'active' | 'inactive' | 'error' | 'syncing' | 'configuring';
  message?: string;
  lastError?: {
    code: string;
    message: string;
    timestamp: Date;
    details?: any;
  };
  health: {
    status: 'healthy' | 'degraded' | 'unhealthy';
    latencyMs?: number;
    lastChecked: Date;
  };
}

export interface ConnectorMetrics {
  totalRecords: number;
  recordsProcessed: number;
  bytesTransferred: number;
  errors: number;
  successRate: number;
  avgProcessingTimeMs: number;
  lastSyncDurationMs?: number;
}

export interface ConnectorPermissions {
  tenantId: string;
  owner: string;
  accessLevel: 'private' | 'team' | 'tenant' | 'shared';
  allowedUsers?: string[];
  allowedRoles?: string[];
  allowedOperations: ConnectorOperation[];
  sharedWith?: {
    tenantId: string;
    permissions: ConnectorOperation[];
    expiresAt?: Date;
  }[];
}

export type ConnectorOperation = 
  | 'read'
  | 'write'
  | 'configure'
  | 'delete'
  | 'share'
  | 'execute';

// Specific connector configurations
export interface DatabaseConnector extends ConnectorConfig {
  dbType: 'postgresql' | 'mysql' | 'sqlserver' | 'mongodb' | 'bigquery' | 'snowflake';
  schema?: string;
  tables?: string[];
  queryTimeout?: number;
  poolSize?: number;
}

export interface CloudStorageConnector extends ConnectorConfig {
  provider: 'google_drive' | 'dropbox' | 'onedrive' | 's3' | 'azure_blob' | 'gcs';
  bucket?: string;
  prefix?: string;
  filePatterns?: string[];
  syncMode?: 'full' | 'incremental' | 'realtime';
}

export interface APIConnector extends ConnectorConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
  pagination?: {
    type: 'offset' | 'cursor' | 'page';
    limitParam: string;
    offsetParam?: string;
    pageParam?: string;
    cursorParam?: string;
    maxPages?: number;
  };
}

export interface MCPConnector extends ConnectorConfig {
  protocol: 'v1' | 'v2';
  capabilities: string[];
  modelConfig?: {
    provider: string;
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  tools?: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];
}

// Connector templates for common integrations
export const CONNECTOR_TEMPLATES: Record<string, Partial<ConnectorConfig>> = {
  'google_drive_documents': {
    type: 'cloud_storage',
    provider: 'google_drive',
    options: {
      ssl: true,
      timeout: 30000
    }
  },
  'salesforce_api': {
    type: 'api',
    authType: 'oauth2',
    endpoint: 'https://[instance].salesforce.com/services/data/v58.0',
    options: {
      ssl: true,
      rateLimit: {
        requestsPerMinute: 100,
        burstSize: 10
      }
    }
  },
  'postgresql_analytics': {
    type: 'database',
    dbType: 'postgresql',
    options: {
      ssl: true,
      timeout: 60000
    }
  },
  'claude_mcp': {
    type: 'mcp',
    protocol: 'v1',
    mcpEndpoint: 'localhost:3333'
  }
};