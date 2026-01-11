import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, Cloud, FileText, Globe, Zap, Shield, 
  CheckCircle, AlertCircle, Info, Lock, Users 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectorType, ConnectorConfig } from '@/types/connectors';
import { useToast } from '@/components/ui/use-toast';

interface DataConnectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataConnectorModal: React.FC<DataConnectorModalProps> = ({
  open,
  onOpenChange
}) => {
  const { user, currentTenant, hasPermission, canAccessConnector } = useAuth();
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null);
  const [config, setConfig] = useState<ConnectorConfig>({});
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  // Available connectors based on tenant plan and user permissions
  const availableConnectors = [
    {
      type: 'database' as ConnectorType,
      name: 'SQL Database',
      icon: Database,
      description: 'Connect to PostgreSQL, MySQL, SQL Server',
      requiredPlan: 'professional',
      permissions: ['connectors:database:read']
    },
    {
      type: 'cloud_storage' as ConnectorType,
      name: 'Cloud Storage',
      icon: Cloud,
      description: 'Google Drive, Dropbox, OneDrive, S3',
      requiredPlan: 'starter',
      permissions: ['connectors:storage:read']
    },
    {
      type: 'api' as ConnectorType,
      name: 'REST API',
      icon: Globe,
      description: 'Connect to any REST API endpoint',
      requiredPlan: 'professional',
      permissions: ['connectors:api:read']
    },
    {
      type: 'document' as ConnectorType,
      name: 'Document Platform',
      icon: FileText,
      description: 'SharePoint, Confluence, Notion',
      requiredPlan: 'enterprise',
      permissions: ['connectors:document:read']
    },
    {
      type: 'mcp' as ConnectorType,
      name: 'MCP Server',
      icon: Zap,
      description: 'Model Context Protocol connections',
      requiredPlan: 'enterprise',
      permissions: ['connectors:mcp:configure']
    }
  ];

  const canUseConnector = (connector: typeof availableConnectors[0]) => {
    // Check tenant plan
    const tenantPlanLevel = {
      starter: 1,
      professional: 2,
      enterprise: 3,
      custom: 4
    };
    
    const requiredLevel = tenantPlanLevel[connector.requiredPlan as keyof typeof tenantPlanLevel];
    const currentLevel = tenantPlanLevel[currentTenant?.plan || 'starter'];
    
    if (currentLevel < requiredLevel) return false;
    
    // Check user permissions
    return connector.permissions.every(perm => hasPermission(perm));
  };

  const handleTestConnection = async () => {
    if (!selectedType || !config) return;
    
    setTesting(true);
    try {
      // Test connection logic here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: 'Connection successful',
        description: 'Your connector is configured correctly',
      });
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!selectedType || !config) return;
    
    setSaving(true);
    try {
      // Save connector configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Connector saved',
        description: 'Your data connector has been configured',
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <span className="bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise bg-clip-text text-transparent">
              Data Connectors
            </span>
            {currentTenant && (
              <Badge variant="outline" className="ml-2">
                {currentTenant.name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="configure" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
          </TabsList>

          <TabsContent value="configure" className="space-y-6">
            {/* Connector Type Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Select Connector Type
              </Label>
              <div className="grid grid-cols-2 gap-4">
                {availableConnectors.map((connector) => {
                  const isAvailable = canUseConnector(connector);
                  const Icon = connector.icon;
                  
                  return (
                    <button
                      key={connector.type}
                      onClick={() => isAvailable && setSelectedType(connector.type)}
                      disabled={!isAvailable}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${selectedType === connector.type 
                          ? 'border-tbwa-yellow bg-tbwa-yellow/10' 
                          : 'border-border hover:border-muted-foreground/50'
                        }
                        ${!isAvailable && 'opacity-50 cursor-not-allowed'}
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium flex items-center gap-2">
                            {connector.name}
                            {!isAvailable && <Lock className="w-3 h-3" />}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {connector.description}
                          </p>
                          {!isAvailable && (
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                              Requires {connector.requiredPlan} plan
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Connector Configuration */}
            {selectedType && (
              <div className="space-y-4">
                <h3 className="font-semibold">Connection Details</h3>
                
                {selectedType === 'cloud_storage' && (
                  <>
                    <div>
                      <Label htmlFor="provider">Storage Provider</Label>
                      <Select onValueChange={(value) => setConfig({...config, provider: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google_drive">Google Drive</SelectItem>
                          <SelectItem value="dropbox">Dropbox</SelectItem>
                          <SelectItem value="onedrive">OneDrive</SelectItem>
                          <SelectItem value="s3">Amazon S3</SelectItem>
                          <SelectItem value="azure_blob">Azure Blob Storage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="folder">Folder/Bucket Path</Label>
                      <Input
                        id="folder"
                        placeholder="e.g., /campaigns/2024 or s3://my-bucket/data"
                        className="mt-2"
                        onChange={(e) => setConfig({...config, path: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {selectedType === 'api' && (
                  <>
                    <div>
                      <Label htmlFor="endpoint">API Endpoint</Label>
                      <Input
                        id="endpoint"
                        placeholder="https://api.example.com/v1"
                        className="mt-2"
                        onChange={(e) => setConfig({...config, endpoint: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="auth-type">Authentication Type</Label>
                      <Select onValueChange={(value) => setConfig({...config, authType: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select auth type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="api_key">API Key</SelectItem>
                          <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                          <SelectItem value="basic">Basic Auth</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {selectedType === 'database' && (
                  <>
                    <div>
                      <Label htmlFor="db-type">Database Type</Label>
                      <Select onValueChange={(value) => setConfig({...config, dbType: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select database" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="postgresql">PostgreSQL</SelectItem>
                          <SelectItem value="mysql">MySQL</SelectItem>
                          <SelectItem value="sqlserver">SQL Server</SelectItem>
                          <SelectItem value="mongodb">MongoDB</SelectItem>
                          <SelectItem value="bigquery">BigQuery</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="connection-string">Connection String</Label>
                      <Input
                        id="connection-string"
                        type="password"
                        placeholder="postgresql://user:pass@host:5432/db"
                        className="mt-2"
                        onChange={(e) => setConfig({...config, connectionString: e.target.value})}
                      />
                    </div>
                  </>
                )}

                {selectedType === 'mcp' && (
                  <>
                    <Alert className="border-tbwa-yellow/50 bg-tbwa-yellow/10">
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        MCP (Model Context Protocol) enables direct AI model integration
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <Label htmlFor="mcp-endpoint">MCP Server Endpoint</Label>
                      <Input
                        id="mcp-endpoint"
                        placeholder="localhost:3333 or mcp.example.com"
                        className="mt-2"
                        onChange={(e) => setConfig({...config, mcpEndpoint: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="mcp-protocol">Protocol Version</Label>
                      <Select onValueChange={(value) => setConfig({...config, protocol: value})}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select protocol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="v1">MCP v1.0</SelectItem>
                          <SelectItem value="v2">MCP v2.0 (Beta)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Configure who can access this data connector within your organization
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label>Access Level</Label>
                <Select defaultValue="team">
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private (Only me)</SelectItem>
                    <SelectItem value="team">Team Members</SelectItem>
                    <SelectItem value="tenant">All {currentTenant?.name} Users</SelectItem>
                    <SelectItem value="custom">Custom Permissions</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Allowed Operations</Label>
                <div className="space-y-2 mt-2">
                  {['Read Data', 'Write Data', 'Configure Settings', 'Share Access'].map((op) => (
                    <label key={op} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" defaultChecked={op === 'Read Data'} />
                      <span className="text-sm">{op}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="space-y-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Share this connector with other tenants or external partners
              </AlertDescription>
            </Alert>

            {currentTenant?.plan === 'enterprise' || currentTenant?.plan === 'custom' ? (
              <div className="space-y-4">
                <div>
                  <Label>Share With Tenant</Label>
                  <Input
                    placeholder="Enter tenant ID or email domain"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Requires approval from the receiving tenant admin
                  </p>
                </div>

                <div>
                  <Label>Sharing Permissions</Label>
                  <Select defaultValue="read">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read Only</SelectItem>
                      <SelectItem value="read_write">Read & Write</SelectItem>
                      <SelectItem value="custom">Custom Permissions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Expiration</Label>
                  <Input
                    type="date"
                    className="mt-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            ) : (
              <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950">
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  Cross-tenant sharing requires Enterprise plan. 
                  <a href="#" className="underline ml-1">Upgrade now</a>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={!selectedType || testing || saving}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedType || saving}
            className="flex-1 bg-gradient-to-r from-tbwa-yellow to-tbwa-turquoise text-tbwa-black hover:opacity-90"
          >
            {saving ? 'Saving...' : 'Save Connector'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};