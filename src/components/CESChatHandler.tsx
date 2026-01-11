import { useEffect, useState } from 'react';
import { cesIntegrationHandlers, CESDataset, CESCampaign } from '@/services/cesIntegration';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, TrendingUp } from 'lucide-react';

interface CESChatHandlerProps {
  query: string;
}

export const CESChatHandler = ({ query }: CESChatHandlerProps) => {
  const [dataset, setDataset] = useState<CESDataset | null>(null);
  const [results, setResults] = useState<CESCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await cesIntegrationHandlers.loadDataset();
      setDataset(data);
      
      // Process query
      const lowerQuery = query.toLowerCase();
      
      if (lowerQuery.includes('sales lift') || lowerQuery.includes('sales uplift')) {
        const campaigns = cesIntegrationHandlers.searchCampaigns(data, {
          hasMetric: 'sales_lift',
          minCESScore: 60
        });
        setResults(campaigns.sort((a, b) => 
          (b.effectiveness_metrics.sales_lift || 0) - (a.effectiveness_metrics.sales_lift || 0)
        ));
      } else if (lowerQuery.includes('roi')) {
        const campaigns = cesIntegrationHandlers.searchCampaigns(data, {
          hasMetric: 'roi'
        });
        setResults(campaigns.sort((a, b) => 
          (b.effectiveness_metrics.roi || 0) - (a.effectiveness_metrics.roi || 0)
        ));
      } else if (lowerQuery.includes('brand')) {
        const brandMatch = lowerQuery.match(/brand[:\s]+(\w+)/);
        if (brandMatch) {
          const campaigns = cesIntegrationHandlers.searchCampaigns(data, {
            brand: brandMatch[1]
          });
          setResults(campaigns);
        }
      } else if (lowerQuery.includes('effective') || lowerQuery.includes('best')) {
        const campaigns = cesIntegrationHandlers.searchCampaigns(data, {
          minCESScore: 70
        });
        setResults(campaigns.sort((a, b) => (b.ces_score || 0) - (a.ces_score || 0)));
      } else {
        // Default: show top campaigns
        setResults(data.campaigns
          .sort((a, b) => (b.ces_score || 0) - (a.ces_score || 0))
          .slice(0, 10));
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [query]);

  if (loading) {
    return <div className="animate-pulse">Loading CES data...</div>;
  }

  if (!dataset) {
    return <div>Error loading CES dataset</div>;
  }

  const getMetricIcon = (value: number, type: string) => {
    if (type === 'roi' && value > 3) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (type === 'sales_lift' && value > 20) return <ArrowUp className="h-4 w-4 text-green-500" />;
    if (type === 'brand_lift' && value > 10) return <ArrowUp className="h-4 w-4 text-green-500" />;
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Found {results.length} campaigns from {dataset.total_campaigns} total
        ({dataset.metrics_coverage.fully_validated} fully validated)
      </div>
      
      {results.map((campaign, idx) => (
        <Card key={idx} className="p-4 hover:shadow-lg transition-shadow">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{campaign.campaign_name}</h4>
                <p className="text-sm text-muted-foreground">
                  {campaign.brand} • {campaign.year} • {campaign.category}
                </p>
              </div>
              <Badge variant={campaign.ces_score! >= 70 ? "default" : "secondary"}>
                CES: {campaign.ces_score}
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-3 text-sm">
              {campaign.effectiveness_metrics.sales_lift && (
                <div className="flex items-center gap-1">
                  {getMetricIcon(campaign.effectiveness_metrics.sales_lift, 'sales_lift')}
                  <span>Sales Lift: {campaign.effectiveness_metrics.sales_lift}%</span>
                </div>
              )}
              {campaign.effectiveness_metrics.roi && (
                <div className="flex items-center gap-1">
                  {getMetricIcon(campaign.effectiveness_metrics.roi, 'roi')}
                  <span>ROI: {campaign.effectiveness_metrics.roi}x</span>
                </div>
              )}
              {campaign.effectiveness_metrics.brand_lift && (
                <div className="flex items-center gap-1">
                  {getMetricIcon(campaign.effectiveness_metrics.brand_lift, 'brand_lift')}
                  <span>Brand Lift: {campaign.effectiveness_metrics.brand_lift}%</span>
                </div>
              )}
              {campaign.effectiveness_metrics.engagement_rate && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Engagement: {campaign.effectiveness_metrics.engagement_rate}%</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="outline">{campaign.data_source}</Badge>
              <span className="text-muted-foreground">{campaign.agency}</span>
            </div>
          </div>
        </Card>
      ))}
      
      {results.length === 0 && (
        <Card className="p-4 text-center text-muted-foreground">
          No campaigns found matching your criteria. Try different search terms.
        </Card>
      )}
    </div>
  );
};