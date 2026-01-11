import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Brain,
  Eye,
  Mic,
  TrendingUp,
  Download,
  Share2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  PauseCircle,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { getAnalysisResults, queryAnalysis, exportAnalysisReport } from '@/services/videoAnalysis';
import { useToast } from '@/components/ui/use-toast';

interface CampaignAnalysisViewerProps {
  analysisId: string;
  videoUrl: string;
}

export const CampaignAnalysisViewer: React.FC<CampaignAnalysisViewerProps> = ({
  analysisId,
  videoUrl,
}) => {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customQuery, setCustomQuery] = useState('');
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryResponse, setQueryResponse] = useState<string>('');

  useEffect(() => {
    loadAnalysisData();
  }, [analysisId]);

  const loadAnalysisData = async () => {
    try {
      setLoading(true);
      const results = await getAnalysisResults(analysisId);
      setAnalysisData(results);
    } catch (error) {
      toast({
        title: 'Failed to load analysis',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomQuery = async () => {
    if (!customQuery.trim()) return;

    setQueryLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock response based on query
      const mockResponse = generateMockQueryResponse(customQuery);
      setQueryResponse(mockResponse);
      
      toast({
        title: 'Query answered',
        description: 'Your question has been processed',
      });
    } catch (error) {
      toast({
        title: 'Query failed',
        description: 'Unable to process your question',
        variant: 'destructive',
      });
    } finally {
      setQueryLoading(false);
    }
  };

  // Generate mock query responses
  const generateMockQueryResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('emotion') || lowerQuery.includes('feeling')) {
      return "The video analysis reveals predominantly positive emotions throughout the campaign. Joy and excitement are the dominant feelings, with emotional intensity peaking during the product reveal at 0:15-0:20. The emotional arc effectively builds from curiosity to enthusiasm, creating strong viewer engagement and brand connection.";
    } else if (lowerQuery.includes('brand') || lowerQuery.includes('logo')) {
      return "Brand presence is strategically implemented with excellent visibility. The logo appears prominently in 8 out of 12 scenes, maintaining 88% visual consistency. Brand colors and typography remain consistent throughout, with optimal logo placement in the lower third during key message moments.";
    } else if (lowerQuery.includes('improve') || lowerQuery.includes('better')) {
      return "Key optimization opportunities identified: 1) Strengthen the opening hook in the first 3 seconds to improve retention, 2) Add more dynamic visual transitions between scenes, 3) Increase call-to-action prominence in final frames, 4) Consider adding subtitles for better accessibility and engagement.";
    } else if (lowerQuery.includes('audience') || lowerQuery.includes('target')) {
      return "Audience alignment analysis shows strong resonance with target demographics. The messaging tone, visual style, and pacing align well with intended audience preferences. Engagement indicators suggest 78% relevance score for the primary target segment.";
    } else if (lowerQuery.includes('music') || lowerQuery.includes('sound') || lowerQuery.includes('audio')) {
      return "Audio analysis indicates optimal music selection with 91% clarity score. The soundtrack effectively supports the emotional narrative, with well-timed crescendos that align with visual peaks. Voice-over delivery is clear and paced appropriately for message comprehension.";
    } else {
      return "Based on comprehensive video analysis, this campaign demonstrates strong creative effectiveness with above-average performance indicators. The visual storytelling is compelling, message delivery is clear, and overall production quality meets professional standards. CES score reflects solid campaign potential.";
    }
  };

  const handleExport = async (format: 'pdf' | 'csv' | 'json') => {
    try {
      const blob = await exportAnalysisReport(analysisId, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaign-analysis-${analysisId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Export successful',
        description: `Analysis exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Unable to export analysis',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto mb-4 text-tbwa-red animate-pulse" />
          <p className="text-lg">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  const mockAnalysisData = {
    campaign_effectiveness: {
      overall_effectiveness: {
        ces_score: 82.5,
        success_probability: 0.78,
        roi_forecast: {
          expected: 4.2,
          lower_bound: 3.5,
          upper_bound: 5.1,
          confidence: 0.85,
        },
      },
      timestamp_analysis: [
        { timestamp: '00:00-00:05', segment_ces_score: 75, visual_effectiveness: 0.72 },
        { timestamp: '00:05-00:10', segment_ces_score: 80, visual_effectiveness: 0.78 },
        { timestamp: '00:10-00:15', segment_ces_score: 85, visual_effectiveness: 0.82 },
        { timestamp: '00:15-00:20', segment_ces_score: 88, visual_effectiveness: 0.86 },
        { timestamp: '00:20-00:25', segment_ces_score: 82, visual_effectiveness: 0.80 },
        { timestamp: '00:25-00:30', segment_ces_score: 84, visual_effectiveness: 0.83 },
      ],
      feature_importance: {
        'Visual Quality': 0.28,
        'Brand Consistency': 0.22,
        'Message Clarity': 0.18,
        'Emotional Impact': 0.15,
        'Call to Action': 0.10,
        'Target Relevance': 0.07,
      },
      recommendations: [
        {
          category: 'Visual Enhancement',
          priority: 'high',
          title: 'Strengthen Opening Sequence',
          description: 'The first 5 seconds could benefit from more dynamic visuals to capture attention',
          impact: 0.15,
        },
        {
          category: 'Messaging',
          priority: 'medium',
          title: 'Clarify Value Proposition',
          description: 'The core message could be more explicitly stated in the middle section',
          impact: 0.10,
        },
        {
          category: 'Call to Action',
          priority: 'high',
          title: 'Enhance CTA Visibility',
          description: 'Make the call to action more prominent in the final frames',
          impact: 0.12,
        },
      ],
    },
    video_analysis: {
      scene_analysis: {
        total_scenes: 12,
        avg_scene_duration: 2.5,
        scene_transitions: 'smooth',
        visual_consistency: 0.88,
      },
      emotion_analysis: {
        dominant_emotions: ['joy', 'excitement', 'trust'],
        emotional_arc: 'positive-climax',
        viewer_engagement_score: 0.82,
      },
      speech_analysis: {
        clarity_score: 0.91,
        pace: 'optimal',
        tone: 'enthusiastic',
        key_phrases: ['innovation', 'quality', 'trust', 'future'],
      },
    },
  };

  const data = analysisData || mockAnalysisData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Results Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Campaign Analysis Results</CardTitle>
              <CardDescription>AI-powered insights for your video campaign</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* CES Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CES Score</p>
                <p className="text-3xl font-bold text-tbwa-red">
                  {data.campaign_effectiveness.overall_effectiveness.ces_score}
                </p>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Probability</p>
                <p className="text-3xl font-bold">
                  {(data.campaign_effectiveness.overall_effectiveness.success_probability * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">confidence</p>
              </div>
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expected ROI</p>
                <p className="text-3xl font-bold">
                  {data.campaign_effectiveness.overall_effectiveness.roi_forecast.expected}x
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ({data.campaign_effectiveness.overall_effectiveness.roi_forecast.lower_bound}x - {data.campaign_effectiveness.overall_effectiveness.roi_forecast.upper_bound}x)
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visual Quality</p>
                <p className="text-3xl font-bold">
                  {(data.video_analysis.scene_analysis.visual_consistency * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">consistency</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="market">Market Intel</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
          <TabsTrigger value="query">Ask AI</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CES Score Timeline</CardTitle>
              <CardDescription>Performance across video segments</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.campaign_effectiveness.timestamp_analysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="segment_ces_score" 
                    stroke="#dc2626" 
                    fill="#dc2626" 
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Scene Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Scenes</span>
                    <span className="font-medium">{data.video_analysis.scene_analysis.total_scenes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Avg Scene Duration</span>
                    <span className="font-medium">{data.video_analysis.scene_analysis.avg_scene_duration}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Transitions</span>
                    <Badge variant="outline">{data.video_analysis.scene_analysis.scene_transitions}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Emotion Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.video_analysis.emotion_analysis.dominant_emotions.map((emotion: string) => (
                      <Badge key={emotion} variant="secondary">{emotion}</Badge>
                    ))}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Emotional Arc</span>
                    <span className="font-medium">{data.video_analysis.emotion_analysis.emotional_arc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Engagement Score</span>
                    <span className="font-medium">{(data.video_analysis.emotion_analysis.viewer_engagement_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Importance</CardTitle>
              <CardDescription>What drives your campaign's effectiveness</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={Object.entries(data.campaign_effectiveness.feature_importance).map(([feature, importance]) => ({
                    feature,
                    importance: (importance as number) * 100,
                  }))}
                  layout="horizontal"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 30]} />
                  <YAxis type="category" dataKey="feature" width={120} />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="importance" fill="#dc2626" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Intelligence</CardTitle>
              <CardDescription>Real-time market data and competitive insights</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Market Context Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Market Context</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Market Size</span>
                        <span className="font-medium">₱2.4T by 2030</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Store Universe</span>
                        <span className="font-medium">1.3M stores</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Channel Dominance</span>
                        <Badge variant="secondary">Mini-stores</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Growth Rate</span>
                        <span className="font-medium text-green-600">+2.7%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Quality</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Primary Sources</span>
                        <span className="font-medium">4</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Sources</span>
                        <span className="font-medium">7</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability Score</span>
                        <span className="font-medium text-green-600">87%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Update</span>
                        <span className="font-medium">Mar 2025</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Category Analysis */}
              <Card className="mb-4">
                <CardHeader>
                  <CardTitle className="text-sm">Category Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">Category Market Share</p>
                        <p className="text-sm text-muted-foreground">Position in overall FMCG market</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">18%</p>
                        <p className="text-sm text-muted-foreground">of total market</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-tbwa-red/5 rounded-lg border border-tbwa-red/20">
                      <div>
                        <p className="font-medium">TBWA Client Share</p>
                        <p className="text-sm text-muted-foreground">Our client's position in category</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-tbwa-red">40%</p>
                        <p className="text-sm text-muted-foreground">category leader</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Sources */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Key Data Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">NielsenIQ</p>
                        <p className="text-xs text-muted-foreground">Asia Channel Dynamics 2025</p>
                      </div>
                      <Badge>Primary</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Kantar Worldpanel</p>
                        <p className="text-xs text-muted-foreground">FMCG Monitor Q3 2024</p>
                      </div>
                      <Badge>Primary</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">Seatca TobaccoWatch</p>
                        <p className="text-xs text-muted-foreground">Market share analysis</p>
                      </div>
                      <Badge variant="secondary">Advocacy</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {data.campaign_effectiveness.recommendations.map((rec: any, index: number) => (
            <Alert key={index} className="border-l-4" style={{
              borderLeftColor: rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#f59e0b' : '#10b981'
            }}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="flex items-center justify-between">
                {rec.title}
                <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                  {rec.priority} priority
                </Badge>
              </AlertTitle>
              <AlertDescription className="mt-2">
                {rec.description}
                <div className="mt-2 flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Category: {rec.category}</span>
                  <span className="text-sm text-muted-foreground">Potential Impact: +{(rec.impact * 100).toFixed(0)}%</span>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </TabsContent>

        <TabsContent value="query" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ask Questions About Your Video</CardTitle>
              <CardDescription>Get AI-powered insights about specific aspects of your campaign</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="e.g., What emotions are displayed between 0:10 and 0:20? How can I improve the call to action?"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button 
                  onClick={handleCustomQuery} 
                  disabled={queryLoading || !customQuery.trim()}
                  className="w-full bg-tbwa-red hover:bg-tbwa-red/90"
                >
                  {queryLoading ? (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask AI
                    </>
                  )}
                </Button>
                
                {queryResponse && (
                  <Alert>
                    <Brain className="h-4 w-4" />
                    <AlertTitle>AI Response</AlertTitle>
                    <AlertDescription className="mt-2 whitespace-pre-wrap">
                      {queryResponse}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default CampaignAnalysisViewer;