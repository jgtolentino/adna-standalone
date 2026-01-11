// Workspace Router Service
// Automatically routes files and content to appropriate tenant workspaces

import { User, Tenant, TenantMembership } from '@/types/auth';

export interface WorkspaceRoute {
  tenantId: string;
  workspacePath: string;
  archivePolicy: ArchivePolicy;
  accessLevel: 'private' | 'team' | 'tenant' | 'shared';
  autoRoute: boolean;
}

export interface ArchivePolicy {
  enabled: boolean;
  retentionDays: number;
  autoArchiveAfterDays: number;
  archiveLocation: 'cold_storage' | 'warm_storage' | 'hot_storage';
  compressionEnabled: boolean;
  encryptionRequired: boolean;
}

export interface FileMetadata {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdBy: string;
  createdAt: Date;
  tenantId: string;
  workspaceId: string;
  tags: string[];
  classification: 'public' | 'internal' | 'confidential' | 'restricted';
  source: 'user_upload' | 'generated' | 'extracted' | 'imported';
}

export interface WorkspaceConfig {
  id: string;
  tenantId: string;
  name: string;
  type: 'project' | 'department' | 'client' | 'archive' | 'shared';
  routingRules: RoutingRule[];
  storageQuota: number;
  usedStorage: number;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
}

export interface RoutingRule {
  id: string;
  name: string;
  priority: number;
  conditions: RouteCondition[];
  action: RouteAction;
  enabled: boolean;
}

export interface RouteCondition {
  field: 'filename' | 'mimeType' | 'size' | 'tags' | 'source' | 'creator';
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'in' | 'gt' | 'lt';
  value: any;
}

export interface RouteAction {
  type: 'move' | 'copy' | 'archive' | 'tag' | 'notify';
  destination?: string;
  tags?: string[];
  notification?: {
    channels: ('email' | 'slack' | 'in_app')[];
    recipients: string[];
    message: string;
  };
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  permissions: string[];
  joinedAt: Date;
}

export interface WorkspaceSettings {
  autoArchive: boolean;
  archiveAfterDays: number;
  allowExternalSharing: boolean;
  requireApproval: boolean;
  defaultClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  versioningEnabled: boolean;
  auditLogEnabled: boolean;
}

export class WorkspaceRouter {
  private routingCache: Map<string, WorkspaceRoute> = new Map();

  /**
   * Determine the best workspace for a file based on user context and routing rules
   */
  async routeFile(
    file: FileMetadata,
    user: User,
    currentTenant: Tenant
  ): Promise<WorkspaceRoute> {
    // Check cache first
    const cacheKey = `${user.id}-${currentTenant.id}-${file.mimeType}`;
    if (this.routingCache.has(cacheKey)) {
      return this.routingCache.get(cacheKey)!;
    }

    // Get user's workspaces for current tenant
    const workspaces = await this.getUserWorkspaces(user.id, currentTenant.id);
    
    // Apply routing rules
    const matchedWorkspace = await this.findBestWorkspace(file, workspaces);
    
    // Create route
    const route: WorkspaceRoute = {
      tenantId: currentTenant.id,
      workspacePath: this.generateWorkspacePath(matchedWorkspace, file),
      archivePolicy: this.getArchivePolicy(matchedWorkspace, file),
      accessLevel: this.determineAccessLevel(matchedWorkspace, user),
      autoRoute: true
    };

    // Cache the route
    this.routingCache.set(cacheKey, route);
    
    return route;
  }

  /**
   * Generate workspace path based on file metadata and workspace config
   */
  private generateWorkspacePath(
    workspace: WorkspaceConfig,
    file: FileMetadata
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    // Pattern: /tenant/workspace/year/month/classification/source/
    const pathSegments = [
      workspace.tenantId,
      workspace.type,
      workspace.name.toLowerCase().replace(/\s+/g, '-'),
      year.toString(),
      month,
      file.classification,
      file.source
    ];

    // Add tags as subdirectories if present
    if (file.tags.length > 0) {
      pathSegments.push(file.tags[0].toLowerCase().replace(/\s+/g, '-'));
    }

    return `/${pathSegments.join('/')}/`;
  }

  /**
   * Determine archive policy based on workspace and file type
   */
  private getArchivePolicy(
    workspace: WorkspaceConfig,
    file: FileMetadata
  ): ArchivePolicy {
    // Default policies by file classification
    const policies: Record<string, Partial<ArchivePolicy>> = {
      'public': {
        retentionDays: 365,
        autoArchiveAfterDays: 90,
        archiveLocation: 'cold_storage',
        compressionEnabled: true,
        encryptionRequired: false
      },
      'internal': {
        retentionDays: 730, // 2 years
        autoArchiveAfterDays: 180,
        archiveLocation: 'warm_storage',
        compressionEnabled: true,
        encryptionRequired: false
      },
      'confidential': {
        retentionDays: 2555, // 7 years
        autoArchiveAfterDays: 365,
        archiveLocation: 'warm_storage',
        compressionEnabled: false,
        encryptionRequired: true
      },
      'restricted': {
        retentionDays: 3650, // 10 years
        autoArchiveAfterDays: 730,
        archiveLocation: 'hot_storage',
        compressionEnabled: false,
        encryptionRequired: true
      }
    };

    const basePolicy = policies[file.classification] || policies['internal'];
    
    return {
      enabled: workspace.settings.autoArchive,
      ...basePolicy
    } as ArchivePolicy;
  }

  /**
   * Find the best matching workspace based on routing rules
   */
  private async findBestWorkspace(
    file: FileMetadata,
    workspaces: WorkspaceConfig[]
  ): Promise<WorkspaceConfig> {
    let bestMatch: WorkspaceConfig | null = null;
    let highestPriority = -1;

    for (const workspace of workspaces) {
      for (const rule of workspace.routingRules) {
        if (!rule.enabled) continue;
        
        if (this.evaluateRule(rule, file) && rule.priority > highestPriority) {
          bestMatch = workspace;
          highestPriority = rule.priority;
        }
      }
    }

    // Default to first available workspace if no rules match
    return bestMatch || workspaces[0];
  }

  /**
   * Evaluate if a file matches a routing rule
   */
  private evaluateRule(rule: RoutingRule, file: FileMetadata): boolean {
    return rule.conditions.every(condition => {
      const fileValue = file[condition.field as keyof FileMetadata];
      
      switch (condition.operator) {
        case 'equals':
          return fileValue === condition.value;
        case 'contains':
          return String(fileValue).includes(condition.value);
        case 'startsWith':
          return String(fileValue).startsWith(condition.value);
        case 'endsWith':
          return String(fileValue).endsWith(condition.value);
        case 'regex':
          return new RegExp(condition.value).test(String(fileValue));
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fileValue);
        case 'gt':
          return Number(fileValue) > Number(condition.value);
        case 'lt':
          return Number(fileValue) < Number(condition.value);
        default:
          return false;
      }
    });
  }

  /**
   * Determine access level based on workspace membership
   */
  private determineAccessLevel(
    workspace: WorkspaceConfig,
    user: User
  ): 'private' | 'team' | 'tenant' | 'shared' {
    const member = workspace.members.find(m => m.userId === user.id);
    
    if (!member) return 'private';
    
    switch (member.role) {
      case 'owner':
      case 'admin':
        return 'tenant';
      case 'member':
        return 'team';
      case 'viewer':
      default:
        return 'private';
    }
  }

  /**
   * Get user's workspaces for a specific tenant
   */
  private async getUserWorkspaces(
    userId: string,
    tenantId: string
  ): Promise<WorkspaceConfig[]> {
    // In production, this would fetch from API/database
    // Mock implementation for demo
    return [
      {
        id: 'ws_001',
        tenantId,
        name: 'Creative Campaigns',
        type: 'project',
        routingRules: [
          {
            id: 'rule_001',
            name: 'Campaign Assets',
            priority: 10,
            conditions: [
              {
                field: 'tags',
                operator: 'contains',
                value: 'campaign'
              }
            ],
            action: {
              type: 'move',
              destination: '/campaigns/active/'
            },
            enabled: true
          }
        ],
        storageQuota: 100 * 1024 * 1024 * 1024, // 100GB
        usedStorage: 45 * 1024 * 1024 * 1024, // 45GB
        members: [],
        settings: {
          autoArchive: true,
          archiveAfterDays: 90,
          allowExternalSharing: false,
          requireApproval: true,
          defaultClassification: 'internal',
          versioningEnabled: true,
          auditLogEnabled: true
        }
      }
    ];
  }

  /**
   * Archive files based on policy
   */
  async archiveFiles(
    files: FileMetadata[],
    policy: ArchivePolicy
  ): Promise<{ success: boolean; archivedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let archivedCount = 0;

    for (const file of files) {
      try {
        // Check if file should be archived
        const fileAge = Date.now() - file.createdAt.getTime();
        const daysOld = fileAge / (1000 * 60 * 60 * 24);
        
        if (daysOld >= policy.autoArchiveAfterDays) {
          // Archive the file
          await this.archiveFile(file, policy);
          archivedCount++;
        }
      } catch (error) {
        errors.push(`Failed to archive ${file.filename}: ${error.message}`);
      }
    }

    return {
      success: errors.length === 0,
      archivedCount,
      errors
    };
  }

  /**
   * Archive a single file
   */
  private async archiveFile(
    file: FileMetadata,
    policy: ArchivePolicy
  ): Promise<void> {
    // Implementation would:
    // 1. Compress if enabled
    // 2. Encrypt if required
    // 3. Move to archive storage
    // 4. Update file metadata
    // 5. Log the archive action
    
    console.log(`Archiving file ${file.filename} to ${policy.archiveLocation}`);
  }
}

// Export singleton instance
export const workspaceRouter = new WorkspaceRouter();