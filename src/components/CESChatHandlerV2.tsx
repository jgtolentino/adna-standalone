import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { 
  askCesApi, 
  parseCommand, 
  type ChatMessage, 
  type ChatResponse,
  type CampaignAnalysisResponse,
  type CreativeBriefResponse,
  type MarketInsightsResponse,
  type CompetitorAnalysisResponse
} from '@/services/askCesApi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CESChatHandlerProps {
  onClose?: () => void;
}

// Suggested prompts for quick actions
const SUGGESTED_PROMPTS = [
  {
    category: 'Campaign Analysis',
    prompts: [
      'Analyze campaign performance for Q1 2024',
      'Show me the top performing campaigns this month',
      'What\'s the ROI for our latest digital campaign?'
    ]
  },
  {
    category: 'Creative Brief',
    prompts: [
      'Generate a creative brief for summer campaign',
      'Create brief for Gen Z audience targeting',
      'Draft brief for product launch campaign'
    ]
  },
  {
    category: 'Market Research',
    prompts: [
      'What are the latest market trends in retail?',
      'Show competitive landscape analysis',
      'Identify growth opportunities in APAC'
    ]
  },
  {
    category: 'Competitor Analysis',
    prompts: [
      'Compare our performance vs top 3 competitors',
      'Analyze competitor campaign strategies',
      'Show competitor share of voice trends'
    ]
  }
];

export const CESChatHandlerV2: React.FC<CESChatHandlerProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your CES assistant. I can help you analyze campaigns, generate creative briefs, provide market insights, and analyze competitors. What would you like to explore today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAgent, setActiveAgent] = useState<'general' | 'creative' | 'analytics' | 'market'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Parse the command from the message
      const { command, params } = parseCommand(input);

      let response: any;
      let assistantContent: string = '';
      let visualizations: any[] = [];

      // Route to appropriate API based on command
      switch (command) {
        case 'analyze-campaign':
          const campaignData = await askCesApi.analyzeCampaign(params);
          assistantContent = formatCampaignAnalysis(campaignData);
          visualizations = campaignData.visualizations || [];
          break;

        case 'generate-brief':
          const briefData = await askCesApi.generateCreativeBrief(params);
          assistantContent = formatCreativeBrief(briefData);
          break;

        case 'market-insights':
          const marketData = await askCesApi.getMarketInsights(params);
          assistantContent = formatMarketInsights(marketData);
          break;

        case 'competitor-analysis':
          const competitorData = await askCesApi.analyzeCompetitors(params);
          assistantContent = formatCompetitorAnalysis(competitorData);
          visualizations = generateCompetitorCharts(competitorData);
          break;

        default:
          // General chat
          const chatResponse = await askCesApi.sendChatMessage({
            message: input,
            agent: activeAgent,
            context: {
              previousMessages: messages.slice(-5), // Last 5 messages for context
              currentTab: 'chat'
            }
          });
          assistantContent = chatResponse.response.content;
          visualizations = chatResponse.response.visualizations || [];
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
        metadata: {
          command,
          visualizations
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show success toast for completed actions
      if (command !== 'chat') {
        toast({
          title: 'Analysis Complete',
          description: `${command.replace('-', ' ')} has been processed successfully.`,
        });
      }

    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: 'Error',
        description: 'Failed to process your request. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setInput(prompt);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Handle file upload for document analysis
    toast({
      title: 'File Upload',
      description: `Uploading ${file.name}...`,
    });

    // TODO: Implement file upload logic
  };

  // Formatting functions for different response types
  const formatCampaignAnalysis = (data: CampaignAnalysisResponse): string => {
    const { performance, insights, recommendations } = data;
    
    let content = `📊 **Campaign Performance Analysis**\n\n`;
    content += `**Key Metrics:**\n`;
    content += `• Impressions: ${performance.impressions.toLocaleString()}\n`;
    content += `• Clicks: ${performance.clicks.toLocaleString()} (CTR: ${(performance.ctr * 100).toFixed(2)}%)\n`;
    content += `• Conversions: ${performance.conversions.toLocaleString()} (CVR: ${(performance.cvr * 100).toFixed(2)}%)\n`;
    content += `• ROI: ${performance.roi.toFixed(2)}x\n\n`;
    
    content += `**Key Insights:**\n`;
    insights.forEach(insight => {
      content += `• ${insight.title}: ${insight.description}\n`;
    });
    
    content += `\n**Recommendations:**\n`;
    recommendations.forEach((rec, idx) => {
      content += `${idx + 1}. ${rec.action}\n`;
    });
    
    return content;
  };

  const formatCreativeBrief = (data: CreativeBriefResponse): string => {
    const { brief } = data;
    
    let content = `📝 **Creative Brief**\n\n`;
    content += `**Executive Summary:**\n${brief.executiveSummary}\n\n`;
    content += `**Strategic Direction:**\n${brief.strategicDirection}\n\n`;
    content += `**Key Messages:**\n`;
    brief.keyMessages.forEach((msg, idx) => {
      content += `${idx + 1}. ${msg}\n`;
    });
    
    content += `\n**Deliverables:**\n`;
    brief.deliverables.forEach(del => {
      content += `• ${del.type}: ${del.specifications} (Due: ${del.deadline})\n`;
    });
    
    return content;
  };

  const formatMarketInsights = (data: MarketInsightsResponse): string => {
    const { trends, opportunities, competitiveLandscape } = data;
    
    let content = `🔍 **Market Insights**\n\n`;
    content += `**Market Overview:**\n`;
    content += `• Market Size: $${(competitiveLandscape.marketSize / 1000000).toFixed(1)}M\n`;
    content += `• Growth Rate: ${competitiveLandscape.growthRate}%\n\n`;
    
    content += `**Key Trends:**\n`;
    trends.forEach(trend => {
      content += `• ${trend.name}: ${trend.description}\n`;
    });
    
    content += `\n**Opportunities:**\n`;
    opportunities.forEach((opp, idx) => {
      content += `${idx + 1}. ${opp.title} - ${opp.potentialValue}\n`;
    });
    
    return content;
  };

  const formatCompetitorAnalysis = (data: CompetitorAnalysisResponse): string => {
    const { comparison, recommendations } = data;
    
    let content = `🏆 **Competitor Analysis**\n\n`;
    content += `**Performance Comparison:**\n`;
    
    Object.entries(comparison).forEach(([competitor, metrics]) => {
      content += `\n${competitor}:\n`;
      Object.entries(metrics).forEach(([metric, value]) => {
        content += `• ${metric}: ${value}\n`;
      });
    });
    
    content += `\n**Strategic Recommendations:**\n`;
    recommendations.forEach((rec, idx) => {
      content += `${idx + 1}. ${rec.strategy}\n   ${rec.rationale}\n`;
    });
    
    return content;
  };

  const generateCompetitorCharts = (data: CompetitorAnalysisResponse): any[] => {
    // Generate chart data from competitor comparison
    const chartData = Object.entries(data.comparison).map(([competitor, metrics]) => ({
      name: competitor,
      ...metrics
    }));

    return [{
      type: 'bar',
      data: chartData,
      config: {
        dataKey: 'market_share',
        title: 'Market Share Comparison'
      }
    }];
  };

  const renderVisualization = (viz: any, index: number) => {
    if (viz.type === 'chart' || viz.type === 'bar') {
      return (
        <Card key={index} className="mt-4">
          <CardContent className="p-4">
            <h4 className="text-sm font-semibold mb-2">{viz.config?.title || 'Data Visualization'}</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={viz.data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey={viz.config?.dataKey || 'value'} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Ask CES</h2>
          <div className="flex items-center gap-2">
            <Badge variant={isLoading ? "secondary" : "default"}>
              {activeAgent === 'general' ? 'General' : 
               activeAgent === 'creative' ? 'Creative' :
               activeAgent === 'analytics' ? 'Analytics' : 'Market'}
            </Badge>
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                
                {/* Render visualizations if any */}
                {message.metadata?.visualizations?.map((viz, idx) => 
                  renderVisualization(viz, idx)
                )}
                
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="p-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">Try asking:</p>
          <div className="space-y-2">
            {SUGGESTED_PROMPTS.map((category) => (
              <div key={category.category}>
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  {category.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {category.prompts.map((prompt) => (
                    <Button
                      key={prompt}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePromptClick(prompt)}
                      className="text-xs"
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask anything about campaigns, creative briefs, market insights..."
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            variant="outline"
            size="icon"
            disabled={isLoading}
          >
            <Mic className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CESChatHandlerV2;