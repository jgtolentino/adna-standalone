export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: string;
  permissions: string[];
  preferences?: UserPreferences;
  tenantId?: string;
  tenants?: TenantMembership[];
  dataSourceAccess?: DataSourceAccess[];
  createdAt?: Date;
  lastActive?: Date;
}

export interface DataSourceAccess {
  sourceId: string;
  tenantId: string;
  allowedOperations: string[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: boolean;
  defaultWorkspaceId?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain?: string;
  slug?: string;
  type?: string;
  plan?: string;
  settings: TenantSettings;
  dataResidency?: string;
  createdAt?: Date;
  isActive?: boolean;
}

export interface TenantMembership {
  tenantId: string;
  tenantName: string;
  role: 'admin' | 'member' | 'viewer' | 'tenant_admin' | 'analyst';
  permissions: Permission[];
  joinedAt: Date;
  isDefault: boolean;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface TenantSettings {
  branding?: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  features: {
    maxUsers?: number;
    maxDataSources?: number;
    maxStorageGB?: number;
    customConnectors?: boolean;
    apiAccess?: boolean;
    mcpEnabled?: boolean;
    ssoEnabled?: boolean;
    auditLog?: boolean;
    dataRetentionDays?: number;
    [key: string]: any;
  };
  security?: {
    mfaRequired: boolean;
    sessionTimeoutMinutes: number;
    passwordPolicy: string;
  };
}

export interface AuthContext {
  user: User | null;
  currentTenant: Tenant | null;
  isAuthenticated: boolean;
  hasPermission: (permission: string, tenantId?: string) => boolean;
  hasDataSourceAccess: (sourceId: string, operation: string, tenantId?: string) => boolean;
  canAccessConnector: (connectorType: string, tenantId?: string) => boolean;
  switchTenant: (tenantId: string) => Promise<void>;
  getTenantSettings: () => TenantSettings | null;
}