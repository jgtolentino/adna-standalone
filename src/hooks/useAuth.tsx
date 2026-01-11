import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Tenant, AuthContext as AuthContextType, TenantSettings } from '@/types/auth';

// Mock auth context for development
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  
  // Initialize with mock data in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      // Mock user
      setUser({
        id: 'user_123',
        email: 'demo@tbwa.com',
        name: 'Demo User',
        tenantId: 'tbwa_main',
        tenants: [
          {
            tenantId: 'tbwa_main',
            tenantName: 'TBWA Worldwide',
            role: 'tenant_admin',
            permissions: [],
            joinedAt: new Date('2024-01-01'),
            isDefault: true
          },
          {
            tenantId: 'client_abc',
            tenantName: 'Client ABC',
            role: 'analyst',
            permissions: [],
            joinedAt: new Date('2024-02-01'),
            isDefault: false
          }
        ],
        role: 'tenant_admin',
        permissions: [],
        dataSourceAccess: [],
        createdAt: new Date('2024-01-01'),
        lastActive: new Date()
      });
      
      // Mock tenant
      setCurrentTenant({
        id: 'tbwa_main',
        name: 'TBWA Worldwide',
        slug: 'tbwa',
        type: 'agency',
        plan: 'enterprise',
        settings: {
          features: {
            maxUsers: 1000,
            maxDataSources: 100,
            maxStorageGB: 5000,
            customConnectors: true,
            apiAccess: true,
            mcpEnabled: true,
            ssoEnabled: true,
            auditLog: true,
            dataRetentionDays: 365
          },
          security: {
            mfaRequired: false,
            sessionTimeoutMinutes: 480,
            passwordPolicy: 'strong'
          }
        },
        dataResidency: 'us',
        createdAt: new Date('2024-01-01'),
        isActive: true
      });
    }
  }, []);
  
  const hasPermission = useCallback((permission: string, tenantId?: string) => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check tenant-specific permissions
    const targetTenantId = tenantId || currentTenant?.id;
    if (!targetTenantId) return false;
    
    const tenantMembership = user.tenants.find(t => t.tenantId === targetTenantId);
    if (!tenantMembership) return false;
    
    // Tenant admin has all permissions within their tenant
    if (tenantMembership.role === 'tenant_admin' && permission.includes(':tenant')) {
      return true;
    }
    
    // Check specific permissions
    return tenantMembership.permissions.some(p => 
      p.resource === permission.split(':')[0] && 
      p.actions.includes(permission.split(':')[1] as any)
    );
  }, [user, currentTenant]);
  
  const hasDataSourceAccess = useCallback((sourceId: string, operation: string, tenantId?: string) => {
    if (!user) return false;
    
    const targetTenantId = tenantId || currentTenant?.id;
    const access = user.dataSourceAccess.find(
      a => a.sourceId === sourceId && a.tenantId === targetTenantId
    );
    
    if (!access) return false;
    
    return access.allowedOperations.includes(operation);
  }, [user, currentTenant]);
  
  const canAccessConnector = useCallback((connectorType: string, tenantId?: string) => {
    if (!currentTenant) return false;
    
    // Check tenant features
    const { features } = currentTenant.settings;
    
    switch (connectorType) {
      case 'mcp':
        return features.mcpEnabled && hasPermission('connectors:mcp:configure', tenantId);
      case 'api':
        return features.apiAccess && hasPermission('connectors:api:read', tenantId);
      case 'custom':
        return features.customConnectors && hasPermission('connectors:custom:create', tenantId);
      default:
        return hasPermission(`connectors:${connectorType}:read`, tenantId);
    }
  }, [currentTenant, hasPermission]);
  
  const switchTenant = useCallback(async (tenantId: string) => {
    if (!user) return;
    
    const membership = user.tenants.find(t => t.tenantId === tenantId);
    if (!membership) {
      throw new Error('User is not a member of this tenant');
    }
    
    // In real implementation, this would make an API call
    // For now, just update the mock tenant
    setCurrentTenant({
      id: tenantId,
      name: membership.tenantName,
      slug: tenantId,
      type: 'agency',
      plan: 'enterprise',
      settings: {
        features: {
          maxUsers: 1000,
          maxDataSources: 100,
          maxStorageGB: 5000,
          customConnectors: true,
          apiAccess: true,
          mcpEnabled: true,
          ssoEnabled: true,
          auditLog: true,
          dataRetentionDays: 365
        },
        security: {
          mfaRequired: false,
          sessionTimeoutMinutes: 480,
          passwordPolicy: 'strong'
        }
      },
      dataResidency: 'us',
      createdAt: new Date('2024-01-01'),
      isActive: true
    });
  }, [user]);
  
  const getTenantSettings = useCallback(() => {
    return currentTenant?.settings || null;
  }, [currentTenant]);
  
  const value: AuthContextType = {
    user,
    currentTenant,
    isAuthenticated: !!user,
    hasPermission,
    hasDataSourceAccess,
    canAccessConnector,
    switchTenant,
    getTenantSettings
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};