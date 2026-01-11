import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Lightbulb, ArrowRight, Calendar } from "lucide-react";

const InsightCards = () => {
  const insights = [
    {
      id: 1,
      title: "Campaign Performance Analysis",
      description: "Q3 digital campaigns show 23% increase in engagement with video content",
      type: "Performance",
      trend: "+23%",
      icon: TrendingUp,
      color: "text-green-600",
      date: "2 hours ago"
    },
    {
      id: 2,
      title: "Audience Segmentation Update",
      description: "New demographic insights reveal untapped millennial market opportunities",
      type: "Audience",
      trend: "New",
      icon: Users,
      color: "text-tbwa-turquoise",
      date: "4 hours ago"
    },
    {
      id: 3,
      title: "Creative Brief Generator",
      description: "AI-powered brief creation based on brand guidelines and market research",
      type: "Creative",
      trend: "AI",
      icon: Lightbulb,
      color: "text-tbwa-yellow",
      date: "6 hours ago"
    },
    {
      id: 4,
      title: "Market Research Synthesis",
      description: "Competitive landscape analysis with actionable recommendations",
      type: "Research",
      trend: "Updated",
      icon: Target,
      color: "text-purple-600",
      date: "1 day ago"
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Intelligence Hub</h2>
            <p className="text-muted-foreground">Latest insights and AI-powered analysis</p>
          </div>
          <Button variant="tbwa-outline">
            View All Insights
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((insight) => {
            const IconComponent = insight.icon;
            return (
              <Card key={insight.id} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform`}>
                    <IconComponent className={`h-5 w-5 ${insight.color}`} />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {insight.trend}
                  </Badge>
                </div>
                
                <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {insight.title}
                </h3>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {insight.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {insight.type}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {insight.date}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InsightCards;