import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, Plus, Check, AlertCircle, ExternalLink,
  Database, Cloud, FileText, Globe, Zap, Code,
  Github, Chrome, Slack, Mail, Calendar, Table
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'data' | 'productivity' | 'development' | 'communication';
  status: 'available' | 'connected' | 'coming_soon';
  popular?: boolean;
  config?: {
    requiresAuth: boolean;
    authType?: 'oauth' | 'api_key' | 'basic';
  };
}

const integrations: Integration[] = [
  // Data Sources
  {
    id: 'google_drive',
    name: 'Google Drive',
    description: 'Access documents, spreadsheets, and presentations',
    icon: Cloud,
    category: 'data',
    status: 'available',
    popular: true,
    config: { requiresAuth: true, authType: 'oauth' }
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: Database,
    category: 'data',
    status: 'available',
    config: { requiresAuth: true, authType: 'basic' }
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Import pages and databases from Notion',
    icon: FileText,
    category: 'data',
    status: 'available',
    popular: true,
    config: { requiresAuth: true, authType: 'api_key' }
  },
  {
    id: 'airtable',
    name: 'Airtable',
    description: 'Sync with Airtable bases and records',
    icon: Table,
    category: 'data',
    status: 'available',
    config: { requiresAuth: true, authType: 'api_key' }
  },
  
  // Development
  {
    id: 'github',
    name: 'GitHub',
    description: 'Access repositories, issues, and pull requests',
    icon: Github,
    category: 'development',
    status: 'available',
    popular: true,
    config: { requiresAuth: true, authType: 'oauth' }
  },
  {
    id: 'rest_api',
    name: 'REST API',
    description: 'Connect to any REST API endpoint',
    icon: Globe,
    category: 'development',
    status: 'available',
    config: { requiresAuth: false }
  },
  {
    id: 'mcp_server',
    name: 'MCP Server',
    description: 'Model Context Protocol for AI tools',
    icon: Zap,
    category: 'development',
    status: 'available',
    config: { requiresAuth: true, authType: 'api_key' }
  },
  
  // Productivity
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    description: 'Access and manage calendar events',
    icon: Calendar,
    category: 'productivity',
    status: 'coming_soon',
    config: { requiresAuth: true, authType: 'oauth' }
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Read and analyze email data',
    icon: Mail,
    category: 'productivity',
    status: 'coming_soon',
    config: { requiresAuth: true, authType: 'oauth' }
  },
  
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    description: 'Access messages and channels',
    icon: Slack,
    category: 'communication',
    status: 'coming_soon',
    config: { requiresAuth: true, authType: 'oauth' }
  }
];

interface IntegrationHubProps {
  onClose?: () => void;
}

export const IntegrationHub: React.FC<IntegrationHubProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState<Set<string>>(new Set());

  const categories = [
    { id: 'all', name: 'All', count: integrations.length },
    { id: 'data', name: 'Data Sources', count: integrations.filter(i => i.category === 'data').length },
    { id: 'development', name: 'Development', count: integrations.filter(i => i.category === 'development').length },
    { id: 'productivity', name: 'Productivity', count: integrations.filter(i => i.category === 'productivity').length },
    { id: 'communication', name: 'Communication', count: integrations.filter(i => i.category === 'communication').length }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConnect = async (integration: Integration) => {
    // Simulate connection process
    toast({
      title: `Connecting to ${integration.name}...`,
      description: 'Please wait while we set up the connection',
    });

    // In real implementation, this would open OAuth flow or configuration modal
    setTimeout(() => {
      setConnectedIntegrations(prev => new Set(prev).add(integration.id));
      toast({
        title: 'Connected successfully',
        description: `${integration.name} is now available in your workspace`,
      });
    }, 2000);
  };

  const handleDisconnect = (integrationId: string) => {
    setConnectedIntegrations(prev => {
      const newSet = new Set(prev);
      newSet.delete(integrationId);
      return newSet;
    });
    toast({
      title: 'Disconnected',
      description: 'Integration has been removed',
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your favorite tools and data sources to enhance Ask Ces capabilities
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name} ({cat.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Connected Integrations */}
      {connectedIntegrations.size > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Connected</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(connectedIntegrations).map(id => {
              const integration = integrations.find(i => i.id === id);
              if (!integration) return null;
              const Icon = integration.icon;
              
              return (
                <Card key={id} className="p-4 border-green-500/20 bg-green-50/5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {integration.name}
                          <Check className="w-4 h-4 text-green-500" />
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Connected and active
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Integrations */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {selectedCategory === 'all' ? 'All Integrations' : categories.find(c => c.id === selectedCategory)?.name}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map(integration => {
            const Icon = integration.icon;
            const isConnected = connectedIntegrations.has(integration.id);
            
            return (
              <Card 
                key={integration.id} 
                className={`p-4 hover:shadow-md transition-shadow ${
                  integration.status === 'coming_soon' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  {integration.popular && (
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  )}
                </div>
                
                <h4 className="font-medium mb-1">{integration.name}</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {integration.description}
                </p>
                
                {integration.status === 'coming_soon' ? (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Coming Soon
                  </Button>
                ) : isConnected ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      Connected
                    </span>
                    <Button variant="ghost" size="sm" asChild>
                      <a href="#" className="flex items-center gap-1">
                        Manage
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleConnect(integration)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Need help with integrations?</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Check our documentation for detailed setup guides and troubleshooting.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm">
                View Documentation
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};