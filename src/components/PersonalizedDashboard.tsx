import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, TrendingUp, Clock, Users, FileText, 
  Settings, ChevronRight, X, Check, Info
} from 'lucide-react';
import { personalizationService, PersonalizationRecommendation } from '@/services/personalization';
import { workspaceRouter } from '@/services/workspace-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export const PersonalizedDashboard: React.FC = () => {
  const { user, currentTenant } = useAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<PersonalizationRecommendation[]>([]);
  const [widgets, setWidgets] = useState<any[]>([]);
  const [shortcuts, setShortcuts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedContent();
  }, [user, currentTenant]);

  const loadPersonalizedContent = async () => {
    if (!user || !currentTenant) return;
    
    setLoading(true);
    try {
      const personalized = await personalizationService.getPersonalizedWorkspace(user, currentTenant);
      setRecommendations(personalized.recommendations);
      setWidgets(personalized.widgets);
      setShortcuts(personalized.shortcuts);
    } catch (error) {
      console.error('Failed to load personalized content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationAction = async (recommendation: PersonalizationRecommendation) => {
    try {
      // Simulate applying recommendation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update recommendation status
      setRecommendations(prev => 
        prev.map(r => r.id === recommendation.id ? { ...r, appliedAt: new Date() } : r)
      );
      
      toast({
        title: 'Recommendation applied',
        description: recommendation.benefit,
      });
    } catch (error) {
      toast({
        title: 'Failed to apply recommendation',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const dismissRecommendation = (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
    toast({
      title: 'Recommendation dismissed',
      description: 'You can find it later in settings',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="w-8 h-8 animate-pulse text-tbwa-yellow mx-auto mb-2" />
          <p className="text-muted-foreground">Personalizing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personalized Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            Welcome back, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-muted-foreground">
            Your personalized workspace for {currentTenant?.name}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card className="p-4 border-tbwa-yellow/20 bg-gradient-to-r from-tbwa-yellow/5 to-tbwa-turquoise/5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-tbwa-yellow" />
              <h3 className="font-semibold">AI Recommendations</h3>
              <Badge variant="secondary" className="text-xs">
                {recommendations.length} new
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            {recommendations.slice(0, 3).map(rec => (
              <div
                key={rec.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{rec.title}</span>
                    {rec.priority === 'high' && (
                      <Badge variant="destructive" className="text-xs">High Priority</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                  <p className="text-xs text-tbwa-turquoise mt-1">{rec.benefit}</p>
                </div>
                <div className="flex items-center gap-1">
                  {rec.appliedAt ? (
                    <Badge variant="outline" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Applied
                    </Badge>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleRecommendationAction(rec)}
                      >
                        Apply
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => dismissRecommendation(rec.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {recommendations.length > 3 && (
            <Button variant="link" className="mt-2 p-0 h-auto">
              View all {recommendations.length} recommendations
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </Card>
      )}

      {/* Smart Shortcuts */}
      <div>
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {shortcuts.map(shortcut => (
            <Button
              key={shortcut.id}
              variant="outline"
              className="h-auto flex-col py-3 px-4"
              onClick={() => {
                // Handle shortcut action
                toast({
                  title: `Executing: ${shortcut.label}`,
                  description: shortcut.keyBinding ? `Keyboard shortcut: ${shortcut.keyBinding}` : undefined,
                });
              }}
            >
              <div className="mb-1">
                {/* Dynamic icon based on shortcut type */}
                {shortcut.icon === 'sparkles' && <Sparkles className="w-5 h-5" />}
                {shortcut.icon === 'file' && <FileText className="w-5 h-5" />}
                {shortcut.icon === 'users' && <Users className="w-5 h-5" />}
              </div>
              <span className="text-xs text-center">{shortcut.label}</span>
              {shortcut.keyBinding && (
                <kbd className="text-xs text-muted-foreground mt-1">
                  {shortcut.keyBinding}
                </kbd>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Personalized Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">My Activity</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Dynamic Widget Grid */}
          <div className="grid grid-cols-12 gap-4">
            {widgets.map((widget, index) => (
              <Card
                key={widget.type + index}
                className={`p-4 col-span-${widget.position.w} row-span-${widget.position.h}`}
                style={{
                  gridColumn: `span ${widget.position.w}`,
                  gridRow: `span ${widget.position.h}`
                }}
              >
                {widget.type === 'favorite_workspaces' && (
                  <div>
                    <h4 className="font-medium mb-3">Favorite Workspaces</h4>
                    <div className="space-y-2">
                      {widget.config.workspaceIds.map((id: string) => (
                        <Button key={id} variant="ghost" className="w-full justify-start">
                          <FileText className="w-4 h-4 mr-2" />
                          Workspace {id}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                {widget.type === 'recent_activity' && (
                  <div>
                    <h4 className="font-medium mb-3">Recent Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Campaign Analysis</span>
                        <span className="text-xs">2 min ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Report Generated</span>
                        <span className="text-xs">15 min ago</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">File Uploaded</span>
                        <span className="text-xs">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {widget.type === 'ai_insights' && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      AI Insights
                      <Badge variant="outline" className="text-xs">Live</Badge>
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium">Productivity Trend</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You're 23% more productive in the morning. Consider scheduling important tasks before lunch.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium">Time Saved</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automation has saved you 4.5 hours this week.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="p-6">
            <h4 className="font-medium mb-4">Your Activity Heatmap</h4>
            <div className="grid grid-cols-24 gap-1">
              {Array.from({ length: 24 * 7 }, (_, i) => {
                const hour = i % 24;
                const day = Math.floor(i / 24);
                const intensity = Math.random(); // In production, use real data
                
                return (
                  <div
                    key={i}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: `rgba(251, 191, 36, ${intensity})`,
                    }}
                    title={`Day ${day + 1}, Hour ${hour}:00`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Less active</span>
              <span>More active</span>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="grid gap-4">
            <Card className="p-4">
              <h4 className="font-medium mb-3">Personalized Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Content Preference Detected</p>
                    <p className="text-sm text-muted-foreground">
                      You prefer visual content 73% of the time. We've adjusted your default views.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Collaboration Pattern</p>
                    <p className="text-sm text-muted-foreground">
                      You work best with teams of 3-5 people. Consider smaller working groups.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <Card className="p-6">
            <h4 className="font-medium mb-4">Team Activity</h4>
            <p className="text-muted-foreground">
              Your team's collaborative workspace activity
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};