// Personalization Service
// Adapts workspace, content, and UI based on user behavior and preferences

import { User, Tenant } from '@/types/auth';

export interface UserPreferences {
  userId: string;
  tenantId: string;
  
  // UI Preferences
  ui: {
    theme: 'light' | 'dark' | 'auto' | 'tbwa-brand';
    density: 'comfortable' | 'compact' | 'spacious';
    language: string;
    timezone: string;
    dateFormat: string;
    firstDayOfWeek: 0 | 1 | 6; // Sunday, Monday, Saturday
    defaultView: 'chat' | 'dashboard' | 'workspace' | 'integrations';
  };
  
  // Workspace Preferences
  workspace: {
    defaultWorkspaceId?: string;
    favoriteWorkspaces: string[];
    recentWorkspaces: WorkspaceVisit[];
    defaultFileView: 'grid' | 'list' | 'timeline' | 'kanban';
    sortPreference: 'name' | 'date' | 'size' | 'relevance';
    groupBy: 'none' | 'type' | 'project' | 'date' | 'classification';
    quickAccessFolders: string[];
  };
  
  // Content Preferences
  content: {
    autoTagging: boolean;
    suggestedTags: string[];
    defaultClassification: 'public' | 'internal' | 'confidential';
    preferredFormats: string[]; // ['pdf', 'docx', 'xlsx']
    autoTranslate: boolean;
    summarizationLevel: 'brief' | 'detailed' | 'executive';
  };
  
  // AI & Automation
  ai: {
    autoSuggestions: boolean;
    contextualHelp: boolean;
    proactiveInsights: boolean;
    automationLevel: 'minimal' | 'balanced' | 'maximum';
    preferredAIModel?: string;
    customPrompts: CustomPrompt[];
  };
  
  // Notification Preferences
  notifications: {
    channels: {
      email: boolean;
      inApp: boolean;
      slack: boolean;
      mobile: boolean;
    };
    frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
    types: {
      fileShared: boolean;
      workspaceUpdates: boolean;
      aiInsights: boolean;
      systemAlerts: boolean;
      collaborationRequests: boolean;
    };
    quietHours: {
      enabled: boolean;
      start: string; // "22:00"
      end: string;   // "08:00"
      timezone: string;
    };
  };
}

export interface WorkspaceVisit {
  workspaceId: string;
  lastVisited: Date;
  visitCount: number;
  averageTimeSpent: number; // minutes
}

export interface CustomPrompt {
  id: string;
  name: string;
  prompt: string;
  category: string;
  shortcut?: string;
  usageCount: number;
}

export interface UserBehavior {
  userId: string;
  patterns: {
    // Time patterns
    activeHours: number[]; // [9, 10, 11, 14, 15, 16] (hours of day)
    activeDays: number[]; // [1, 2, 3, 4, 5] (Mon-Fri)
    peakProductivity: {
      startHour: number;
      endHour: number;
    };
    
    // Usage patterns
    primaryActivities: ActivityPattern[];
    frequentSearches: SearchPattern[];
    collaborationStyle: 'solo' | 'small-team' | 'cross-functional';
    
    // Content patterns
    preferredContentTypes: ContentTypeUsage[];
    averageSessionDuration: number; // minutes
    tasksPerSession: number;
  };
  
  // Learning & Adaptation
  learningProfile: {
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    preferredLearningStyle: 'visual' | 'textual' | 'interactive' | 'video';
    completedTutorials: string[];
    featureAdoption: FeatureAdoption[];
  };
}

export interface ActivityPattern {
  activity: string;
  frequency: number;
  lastPerformed: Date;
  averageDuration: number;
}

export interface SearchPattern {
  query: string;
  frequency: number;
  lastSearched: Date;
  clickedResults: string[];
}

export interface ContentTypeUsage {
  type: string;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
}

export interface FeatureAdoption {
  feature: string;
  firstUsed: Date;
  usageCount: number;
  proficiency: number; // 0-100
}

export interface PersonalizationRecommendation {
  id: string;
  type: 'workspace' | 'feature' | 'content' | 'automation' | 'learning';
  title: string;
  description: string;
  benefit: string;
  priority: 'low' | 'medium' | 'high';
  action: {
    type: 'enable' | 'try' | 'learn' | 'customize';
    target: string;
    params?: Record<string, any>;
  };
  dismissed?: boolean;
  appliedAt?: Date;
}

export class PersonalizationService {
  private userPreferences: Map<string, UserPreferences> = new Map();
  private userBehavior: Map<string, UserBehavior> = new Map();
  
  /**
   * Get personalized workspace layout
   */
  async getPersonalizedWorkspace(user: User, tenant: Tenant): Promise<{
    layout: any;
    widgets: any[];
    shortcuts: any[];
    recommendations: PersonalizationRecommendation[];
  }> {
    const preferences = await this.getUserPreferences(user.id, tenant.id);
    const behavior = await this.getUserBehavior(user.id);
    
    // Generate personalized layout
    const layout = this.generateLayout(preferences, behavior);
    
    // Select relevant widgets
    const widgets = this.selectWidgets(preferences, behavior, tenant);
    
    // Create smart shortcuts
    const shortcuts = this.generateShortcuts(preferences, behavior);
    
    // Get recommendations
    const recommendations = await this.generateRecommendations(user, preferences, behavior);
    
    return { layout, widgets, shortcuts, recommendations };
  }
  
  /**
   * Learn from user actions
   */
  async trackUserAction(
    userId: string,
    action: {
      type: string;
      target: string;
      context: Record<string, any>;
      duration?: number;
      result?: 'success' | 'failure' | 'abandoned';
    }
  ): Promise<void> {
    const behavior = this.userBehavior.get(userId) || this.createDefaultBehavior(userId);
    
    // Update activity patterns
    this.updateActivityPattern(behavior, action);
    
    // Update time patterns
    this.updateTimePatterns(behavior);
    
    // Analyze for insights
    const insights = this.analyzeUserAction(action, behavior);
    
    // Store updated behavior
    this.userBehavior.set(userId, behavior);
    
    // Trigger real-time personalization if needed
    if (insights.requiresImmediateAction) {
      await this.applyRealTimePersonalization(userId, insights);
    }
  }
  
  /**
   * Generate smart recommendations based on behavior
   */
  private async generateRecommendations(
    user: User,
    preferences: UserPreferences,
    behavior: UserBehavior
  ): Promise<PersonalizationRecommendation[]> {
    const recommendations: PersonalizationRecommendation[] = [];
    
    // Workspace recommendations
    if (behavior.patterns.primaryActivities.length > 5) {
      const topActivity = behavior.patterns.primaryActivities[0];
      if (!preferences.workspace.favoriteWorkspaces.includes(topActivity.activity)) {
        recommendations.push({
          id: 'rec_workspace_favorite',
          type: 'workspace',
          title: 'Add to Favorites',
          description: `Add "${topActivity.activity}" to your favorite workspaces for quick access`,
          benefit: 'Save 3 clicks per session',
          priority: 'medium',
          action: {
            type: 'enable',
            target: 'workspace.favorites',
            params: { workspaceId: topActivity.activity }
          }
        });
      }
    }
    
    // Feature recommendations based on experience level
    if (behavior.learningProfile.experienceLevel === 'beginner') {
      recommendations.push({
        id: 'rec_guided_tour',
        type: 'learning',
        title: 'Take a Guided Tour',
        description: 'Learn about advanced features with our interactive tour',
        benefit: 'Increase productivity by 40%',
        priority: 'high',
        action: {
          type: 'learn',
          target: 'tour.advanced_features'
        }
      });
    }
    
    // Automation recommendations
    if (behavior.patterns.frequentSearches.length > 10) {
      const topSearches = behavior.patterns.frequentSearches.slice(0, 3);
      recommendations.push({
        id: 'rec_saved_searches',
        type: 'automation',
        title: 'Save Frequent Searches',
        description: 'Create saved searches for your most common queries',
        benefit: 'Find content 5x faster',
        priority: 'high',
        action: {
          type: 'customize',
          target: 'search.saved',
          params: { searches: topSearches.map(s => s.query) }
        }
      });
    }
    
    // AI recommendations
    if (!preferences.ai.proactiveInsights && behavior.patterns.tasksPerSession > 5) {
      recommendations.push({
        id: 'rec_ai_insights',
        type: 'automation',
        title: 'Enable AI Insights',
        description: 'Get proactive suggestions based on your work patterns',
        benefit: 'Discover insights you might miss',
        priority: 'medium',
        action: {
          type: 'enable',
          target: 'ai.proactiveInsights'
        }
      });
    }
    
    return recommendations.filter(r => !r.dismissed);
  }
  
  /**
   * Generate personalized layout
   */
  private generateLayout(
    preferences: UserPreferences,
    behavior: UserBehavior
  ): any {
    const baseLayout = {
      density: preferences.ui.density,
      theme: preferences.ui.theme,
      defaultFileView: preferences.workspace.defaultFileView
    };
    
    // Adjust based on behavior
    if (behavior.patterns.collaborationStyle === 'cross-functional') {
      baseLayout['showCollaborationPanel'] = true;
      baseLayout['collaborationPanelPosition'] = 'right';
    }
    
    if (behavior.patterns.primaryActivities[0]?.activity.includes('analysis')) {
      baseLayout['showDataPanel'] = true;
      baseLayout['expandedSidebar'] = true;
    }
    
    return baseLayout;
  }
  
  /**
   * Select relevant widgets based on user profile
   */
  private selectWidgets(
    preferences: UserPreferences,
    behavior: UserBehavior,
    tenant: Tenant
  ): any[] {
    const widgets = [];
    
    // Always include favorite workspaces
    if (preferences.workspace.favoriteWorkspaces.length > 0) {
      widgets.push({
        type: 'favorite_workspaces',
        position: { x: 0, y: 0, w: 4, h: 2 },
        config: { workspaceIds: preferences.workspace.favoriteWorkspaces }
      });
    }
    
    // Recent activity widget for active users
    if (behavior.patterns.averageSessionDuration > 30) {
      widgets.push({
        type: 'recent_activity',
        position: { x: 4, y: 0, w: 4, h: 2 },
        config: { limit: 10, groupBy: 'project' }
      });
    }
    
    // AI insights for advanced users
    if (behavior.learningProfile.experienceLevel !== 'beginner' && preferences.ai.proactiveInsights) {
      widgets.push({
        type: 'ai_insights',
        position: { x: 8, y: 0, w: 4, h: 3 },
        config: { 
          insightTypes: ['trends', 'anomalies', 'recommendations'],
          updateFrequency: 'realtime'
        }
      });
    }
    
    // Team collaboration for team players
    if (behavior.patterns.collaborationStyle !== 'solo') {
      widgets.push({
        type: 'team_activity',
        position: { x: 0, y: 2, w: 6, h: 2 },
        config: { 
          showActiveUsers: true,
          showSharedFiles: true
        }
      });
    }
    
    return widgets;
  }
  
  /**
   * Generate smart shortcuts
   */
  private generateShortcuts(
    preferences: UserPreferences,
    behavior: UserBehavior
  ): any[] {
    const shortcuts = [];
    
    // Quick access to frequent activities
    behavior.patterns.primaryActivities.slice(0, 5).forEach((activity, index) => {
      shortcuts.push({
        id: `quick_${activity.activity}`,
        label: activity.activity,
        icon: this.getIconForActivity(activity.activity),
        action: `navigate:${activity.activity}`,
        keyBinding: `cmd+${index + 1}`
      });
    });
    
    // Custom AI prompts
    preferences.ai.customPrompts
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 3)
      .forEach(prompt => {
        shortcuts.push({
          id: `prompt_${prompt.id}`,
          label: prompt.name,
          icon: 'sparkles',
          action: `ai:prompt:${prompt.id}`,
          keyBinding: prompt.shortcut
        });
      });
    
    return shortcuts;
  }
  
  /**
   * Update activity patterns based on user action
   */
  private updateActivityPattern(
    behavior: UserBehavior,
    action: { type: string; duration?: number }
  ): void {
    const existingPattern = behavior.patterns.primaryActivities.find(
      p => p.activity === action.type
    );
    
    if (existingPattern) {
      existingPattern.frequency++;
      existingPattern.lastPerformed = new Date();
      if (action.duration) {
        existingPattern.averageDuration = 
          (existingPattern.averageDuration * (existingPattern.frequency - 1) + action.duration) / 
          existingPattern.frequency;
      }
    } else {
      behavior.patterns.primaryActivities.push({
        activity: action.type,
        frequency: 1,
        lastPerformed: new Date(),
        averageDuration: action.duration || 0
      });
    }
    
    // Sort by frequency
    behavior.patterns.primaryActivities.sort((a, b) => b.frequency - a.frequency);
  }
  
  /**
   * Update time-based patterns
   */
  private updateTimePatterns(behavior: UserBehavior): void {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    if (!behavior.patterns.activeHours.includes(hour)) {
      behavior.patterns.activeHours.push(hour);
    }
    
    if (!behavior.patterns.activeDays.includes(day)) {
      behavior.patterns.activeDays.push(day);
    }
  }
  
  /**
   * Apply real-time personalization
   */
  private async applyRealTimePersonalization(
    userId: string,
    insights: any
  ): Promise<void> {
    // Implementation would apply immediate UI/UX changes
    console.log(`Applying real-time personalization for user ${userId}`, insights);
  }
  
  /**
   * Analyze user action for insights
   */
  private analyzeUserAction(action: any, behavior: UserBehavior): any {
    return {
      requiresImmediateAction: false,
      insights: []
    };
  }
  
  /**
   * Get icon for activity type
   */
  private getIconForActivity(activity: string): string {
    const iconMap: Record<string, string> = {
      'search': 'search',
      'upload': 'upload',
      'analyze': 'chart',
      'share': 'share',
      'archive': 'archive',
      'create': 'plus',
      'edit': 'edit',
      'review': 'eye'
    };
    
    return iconMap[activity.toLowerCase()] || 'file';
  }
  
  /**
   * Get user preferences
   */
  private async getUserPreferences(
    userId: string,
    tenantId: string
  ): Promise<UserPreferences> {
    // In production, fetch from database
    return this.userPreferences.get(userId) || this.createDefaultPreferences(userId, tenantId);
  }
  
  /**
   * Get user behavior data
   */
  private async getUserBehavior(userId: string): Promise<UserBehavior> {
    // In production, fetch from analytics database
    return this.userBehavior.get(userId) || this.createDefaultBehavior(userId);
  }
  
  /**
   * Create default preferences
   */
  private createDefaultPreferences(userId: string, tenantId: string): UserPreferences {
    return {
      userId,
      tenantId,
      ui: {
        theme: 'auto',
        density: 'comfortable',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dateFormat: 'MM/DD/YYYY',
        firstDayOfWeek: 0,
        defaultView: 'chat'
      },
      workspace: {
        favoriteWorkspaces: [],
        recentWorkspaces: [],
        defaultFileView: 'grid',
        sortPreference: 'date',
        groupBy: 'type',
        quickAccessFolders: []
      },
      content: {
        autoTagging: true,
        suggestedTags: [],
        defaultClassification: 'internal',
        preferredFormats: ['pdf', 'docx', 'xlsx'],
        autoTranslate: false,
        summarizationLevel: 'brief'
      },
      ai: {
        autoSuggestions: true,
        contextualHelp: true,
        proactiveInsights: false,
        automationLevel: 'balanced',
        customPrompts: []
      },
      notifications: {
        channels: {
          email: true,
          inApp: true,
          slack: false,
          mobile: false
        },
        frequency: 'realtime',
        types: {
          fileShared: true,
          workspaceUpdates: true,
          aiInsights: true,
          systemAlerts: true,
          collaborationRequests: true
        },
        quietHours: {
          enabled: false,
          start: '22:00',
          end: '08:00',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      }
    };
  }
  
  /**
   * Create default behavior profile
   */
  private createDefaultBehavior(userId: string): UserBehavior {
    return {
      userId,
      patterns: {
        activeHours: [],
        activeDays: [],
        peakProductivity: {
          startHour: 9,
          endHour: 17
        },
        primaryActivities: [],
        frequentSearches: [],
        collaborationStyle: 'small-team',
        preferredContentTypes: [],
        averageSessionDuration: 0,
        tasksPerSession: 0
      },
      learningProfile: {
        experienceLevel: 'beginner',
        preferredLearningStyle: 'interactive',
        completedTutorials: [],
        featureAdoption: []
      }
    };
  }
}

// Export singleton instance
export const personalizationService = new PersonalizationService();