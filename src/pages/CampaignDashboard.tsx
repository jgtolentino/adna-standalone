import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Database,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Activity,
  DollarSign,
  Users,
  Zap,
  Brain,
  Video,
  FileText,
  ChevronRight,
  Eye,
  Award,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useToast } from '@/components/ui/use-toast';
import { getCampaignAnalytics, getCampaignBenchmarks } from '@/services/campaignService';

const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('last30days');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCampaignType, setSelectedCampaignType] = useState('all');
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Fetch dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeRange, selectedIndustry, selectedCampaignType]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await getCampaignAnalytics({
        timeRange: selectedTimeRange,
        industry: selectedIndustry,
        campaignType: selectedCampaignType,
      });
      setDashboardData(data);
    } catch (error) {
      toast({
        title: 'Failed to load dashboard',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalCampaigns: 156,
      avgCesScore: 72.5,
      totalBudget: 4.2,
      avgRoi: 3.8,
      topPerformers: 28,
      needsImprovement: 12,
    },
    cesDistribution: [
      { range: '0-20', count: 5, percentage: 3.2 },
      { range: '21-40', count: 12, percentage: 7.7 },
      { range: '41-60', count: 34, percentage: 21.8 },
      { range: '61-80', count: 78, percentage: 50.0 },
      { range: '81-100', count: 27, percentage: 17.3 },
    ],
    trendData: [
      { month: 'Jan', avgCes: 68, campaigns: 12, roi: 3.2 },
      { month: 'Feb', avgCes: 70, campaigns: 15, roi: 3.5 },
      { month: 'Mar', avgCes: 69, campaigns: 18, roi: 3.4 },
      { month: 'Apr', avgCes: 72, campaigns: 22, roi: 3.7 },
      { month: 'May', avgCes: 74, campaigns: 20, roi: 3.9 },
      { month: 'Jun', avgCes: 76, campaigns: 24, roi: 4.1 },
    ],
    featureImportance: [
      { feature: 'Visual Quality', weight: 0.34, category: 'creative' },
      { feature: 'Brand Consistency', weight: 0.28, category: 'brand' },
      { feature: 'Message Clarity', weight: 0.22, category: 'messaging' },
      { feature: 'Emotional Impact', weight: 0.19, category: 'creative' },
      { feature: 'Target Precision', weight: 0.17, category: 'strategy' },
      { feature: 'Channel Mix', weight: 0.15, category: 'media' },
    ],
    industryBenchmarks: [
      { industry: 'Technology', avgCes: 74, topQuartile: 85, campaigns: 32 },
      { industry: 'Retail', avgCes: 71, topQuartile: 82, campaigns: 45 },
      { industry: 'Finance', avgCes: 69, topQuartile: 80, campaigns: 28 },
      { industry: 'Healthcare', avgCes: 73, topQuartile: 84, campaigns: 21 },
      { industry: 'Automotive', avgCes: 75, topQuartile: 86, campaigns: 30 },
    ],
    recentCampaigns: [
      {
        id: 1,
        name: 'Summer Product Launch',
        brand: 'Nike',
        cesScore: 85,
        roi: 4.2,
        status: 'completed',
        type: 'brand',
        date: '2024-06-15',
      },
      {
        id: 2,
        name: 'Back to School',
        brand: 'Apple',
        cesScore: 78,
        roi: 3.8,
        status: 'active',
        type: 'performance',
        date: '2024-06-20',
      },
      {
        id: 3,
        name: 'Sustainability Initiative',
        brand: 'Patagonia',
        cesScore: 82,
        roi: 3.5,
        status: 'completed',
        type: 'csr',
        date: '2024-06-10',
      },
    ],
  };

  const data = dashboardData || mockData;

  const categoryColors = {
    creative: '#3b82f6',
    brand: '#8b5cf6',
    messaging: '#f59e0b',
    strategy: '#10b981',
    media: '#ef4444',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'active': return 'secondary';
      case 'pending': return 'outline';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brand': return <Award className="w-4 h-4" />;
      case 'performance': return <Target className="w-4 h-4" />;
      case 'csr': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold flex items-center gap-3">
                <BarChart3 className="w-10 h-10 text-tbwa-red" />
                Campaign Intelligence Dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time insights across your campaign portfolio
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/video-analysis')}>
                <Video className="w-4 h-4 mr-2" />
                Analyze Video
              </Button>
              <Button variant="outline" onClick={() => navigate('/insights')}>
                <Brain className="w-4 h-4 mr-2" />
                Ask Ces
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="last12months">Last 12 Months</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCampaignType} onValueChange={setSelectedCampaignType}>
              <SelectTrigger className="w-40">
                <Target className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="brand">Brand</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="csr">CSR</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={loadDashboardData}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </motion.div>

        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{data.overview.totalCampaigns}</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg CES Score</p>
                  <p className="text-2xl font-bold">{data.overview.avgCesScore}</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${data.overview.totalBudget}M</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg ROI</p>
                  <p className="text-2xl font-bold">{data.overview.avgRoi}x</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Performers</p>
                  <p className="text-2xl font-bold">{data.overview.topPerformers}</p>
                </div>
                <Award className="w-8 h-8 text-tbwa-red" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Need Attention</p>
                  <p className="text-2xl font-bold">{data.overview.needsImprovement}</p>
                </div>
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CES Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>CES Score Distribution</CardTitle>
                  <CardDescription>Campaign performance breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.cesDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]}>
                        {data.cesDistribution.map((entry: any, index: number) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              index === 0 ? '#ef4444' :
                              index === 1 ? '#f97316' :
                              index === 2 ? '#eab308' :
                              index === 3 ? '#22c55e' :
                              '#10b981'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>CES and ROI over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="avgCes" 
                        stroke="#dc2626" 
                        strokeWidth={2}
                        name="Avg CES"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="roi" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="ROI"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Feature Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { dimension: 'Visual Quality', score: 85 },
                    { dimension: 'Brand Consistency', score: 78 },
                    { dimension: 'Message Clarity', score: 82 },
                    { dimension: 'Emotional Impact', score: 75 },
                    { dimension: 'Target Precision', score: 88 },
                    { dimension: 'Channel Mix', score: 72 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Current" dataKey="score" stroke="#dc2626" fill="#dc2626" fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            {/* Feature Importance */}
            <Card>
              <CardHeader>
                <CardTitle>Feature Importance Analysis</CardTitle>
                <CardDescription>What drives campaign success</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.featureImportance.map((feature: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{feature.feature}</span>
                        <Badge variant="outline" style={{ 
                          borderColor: categoryColors[feature.category as keyof typeof categoryColors],
                          color: categoryColors[feature.category as keyof typeof categoryColors]
                        }}>
                          {feature.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={feature.weight * 100} 
                          className="flex-1"
                          style={{
                            '--progress-foreground': categoryColors[feature.category as keyof typeof categoryColors]
                          } as any}
                        />
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {(feature.weight * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-6">
            {/* Industry Benchmarks */}
            <Card>
              <CardHeader>
                <CardTitle>Industry Benchmarks</CardTitle>
                <CardDescription>Compare performance across industries</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.industryBenchmarks} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis type="category" dataKey="industry" width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgCes" fill="#dc2626" name="Average CES" />
                    <Bar dataKey="topQuartile" fill="#10b981" name="Top Quartile" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Recent Campaigns */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Campaigns</CardTitle>
                <CardDescription>Latest campaign performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.recentCampaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {getTypeIcon(campaign.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold">{campaign.name}</h4>
                            <p className="text-sm text-muted-foreground">{campaign.brand}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">CES Score</p>
                            <p className="text-xl font-bold">{campaign.cesScore}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">ROI</p>
                            <p className="text-xl font-bold">{campaign.roi}x</p>
                          </div>
                          <Badge variant={getStatusColor(campaign.status)}>
                            {campaign.status}
                          </Badge>
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CampaignDashboard;