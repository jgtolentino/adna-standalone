/**
 * CES (Creative Effectiveness Score) Integration Service
 * Integrates validated CES campaigns and effectiveness metrics
 */

export interface CESCampaign {
  campaign_name: string;
  brand: string;
  agency: string;
  year: number;
  category: string;
  effectiveness_metrics: {
    brand_lift?: number;
    sales_lift?: number;
    roi?: number;
    engagement_rate?: number;
    recall?: number;
    market_share_change?: number;
  };
  creative_elements: {
    format: string;
    duration?: number;
    channels: string[];
    key_message: string;
  };
  ces_score?: number;
  data_source: 'ph_awards' | 'warc' | 'validated';
}

export interface CESDataset {
  campaigns: CESCampaign[];
  total_campaigns: number;
  validation_date: string;
  metrics_coverage: {
    with_brand_lift: number;
    with_sales_lift: number;
    with_roi: number;
    fully_validated: number;
  };
}

// Load and merge all CES datasets
export const loadCESDataset = async (): Promise<CESDataset> => {
  try {
    // Load multiple data sources
    const [cesResponse, warcResponse] = await Promise.all([
      fetch('/data/CES_Integrated_Dataset_20250705_202845.json'),
      fetch('/data/campaigns_corpus.json')
    ]);

    const cesData = await cesResponse.json();
    const warcData = await warcResponse.json();
    
    // Process CES campaigns
    const cesCampaigns = (cesData.campaigns || []).map((campaign: any) => ({
      ...campaign,
      data_source: campaign.data_source || 'ph_awards',
      ces_score: calculateCESScore(campaign.effectiveness_metrics)
    }));

    // Process WARC campaigns
    const warcCampaigns = warcData.map((campaign: any) => {
      const effectiveness_metrics: any = {};
      
      // Extract metrics from WARC data
      if (campaign.results?.sales_uplift) {
        const salesMatch = campaign.results.sales_uplift.match(/(\d+)/);
        if (salesMatch) effectiveness_metrics.sales_lift = parseInt(salesMatch[1]);
      }
      
      if (campaign.results?.brand_awareness) {
        const brandMatch = campaign.results.brand_awareness.match(/(\d+\.?\d*)/);
        if (brandMatch) effectiveness_metrics.brand_lift = parseFloat(brandMatch[1]);
      }
      
      if (campaign.results?.roi) {
        if (typeof campaign.results.roi === 'string' && campaign.results.roi.includes('million')) {
          const roiMatch = campaign.results.roi.match(/(\d+\.?\d*)/);
          if (roiMatch) effectiveness_metrics.roi = parseFloat(roiMatch[1]);
        }
      }

      // Parse other KPIs for engagement metrics
      if (campaign.results?.other_kpis) {
        const engagementMatch = campaign.results.other_kpis.match(/(\d+)%\s*increase.*enquiries/);
        if (engagementMatch) effectiveness_metrics.engagement_rate = parseInt(engagementMatch[1]);
      }

      return {
        campaign_name: campaign.title,
        brand: campaign.brand,
        agency: Array.isArray(campaign.agency) ? campaign.agency.join(', ') : campaign.agency,
        year: campaign.year,
        category: campaign.category,
        effectiveness_metrics,
        creative_elements: {
          format: campaign.creative_assets?.video ? 'Video' : 'Mixed',
          channels: ['Digital', 'TV', 'Social'],
          key_message: campaign.challenge
        },
        ces_score: calculateCESScore(effectiveness_metrics),
        data_source: 'warc' as const,
        warc_id: campaign.campaign_id,
        url: campaign.url
      };
    });

    // Combine all campaigns
    const allCampaigns = [...cesCampaigns, ...warcCampaigns];

    return {
      campaigns: allCampaigns,
      total_campaigns: allCampaigns.length,
      validation_date: new Date().toISOString(),
      metrics_coverage: calculateMetricsCoverage(allCampaigns)
    };
  } catch (error) {
    console.error('Error loading CES dataset:', error);
    return {
      campaigns: [],
      total_campaigns: 0,
      validation_date: new Date().toISOString(),
      metrics_coverage: {
        with_brand_lift: 0,
        with_sales_lift: 0,
        with_roi: 0,
        fully_validated: 0
      }
    };
  }
};

// Calculate CES score based on available metrics
export const calculateCESScore = (metrics: CESCampaign['effectiveness_metrics']): number => {
  let score = 50; // Base score
  let factorsCount = 0;

  if (metrics.brand_lift && metrics.brand_lift > 0) {
    score += Math.min(metrics.brand_lift * 0.5, 20);
    factorsCount++;
  }

  if (metrics.sales_lift && metrics.sales_lift > 0) {
    score += Math.min(metrics.sales_lift * 0.3, 15);
    factorsCount++;
  }

  if (metrics.roi && metrics.roi > 0) {
    score += Math.min(metrics.roi * 2, 10);
    factorsCount++;
  }

  if (metrics.engagement_rate && metrics.engagement_rate > 0) {
    score += Math.min(metrics.engagement_rate * 0.1, 5);
    factorsCount++;
  }

  // Confidence adjustment based on data completeness
  const confidenceMultiplier = factorsCount >= 3 ? 1.0 : (factorsCount / 3);
  
  return Math.round(score * confidenceMultiplier);
};

// Calculate metrics coverage statistics
const calculateMetricsCoverage = (campaigns: CESCampaign[]) => {
  const coverage = {
    with_brand_lift: 0,
    with_sales_lift: 0,
    with_roi: 0,
    fully_validated: 0
  };

  campaigns.forEach(campaign => {
    const metrics = campaign.effectiveness_metrics;
    if (metrics.brand_lift !== undefined) coverage.with_brand_lift++;
    if (metrics.sales_lift !== undefined) coverage.with_sales_lift++;
    if (metrics.roi !== undefined) coverage.with_roi++;
    
    // Fully validated = has at least 3 key metrics
    const metricsCount = [
      metrics.brand_lift,
      metrics.sales_lift,
      metrics.roi,
      metrics.engagement_rate,
      metrics.recall
    ].filter(m => m !== undefined).length;
    
    if (metricsCount >= 3) coverage.fully_validated++;
  });

  return coverage;
};

// Search CES campaigns by various criteria
export const searchCESCampaigns = (
  dataset: CESDataset,
  criteria: {
    brand?: string;
    category?: string;
    minCESScore?: number;
    hasMetric?: keyof CESCampaign['effectiveness_metrics'];
    year?: number;
  }
): CESCampaign[] => {
  return dataset.campaigns.filter(campaign => {
    if (criteria.brand && !campaign.brand.toLowerCase().includes(criteria.brand.toLowerCase())) {
      return false;
    }
    if (criteria.category && !campaign.category.toLowerCase().includes(criteria.category.toLowerCase())) {
      return false;
    }
    if (criteria.minCESScore && (!campaign.ces_score || campaign.ces_score < criteria.minCESScore)) {
      return false;
    }
    if (criteria.hasMetric && campaign.effectiveness_metrics[criteria.hasMetric] === undefined) {
      return false;
    }
    if (criteria.year && campaign.year !== criteria.year) {
      return false;
    }
    return true;
  });
};

// Get campaign insights and benchmarks
export const getCampaignBenchmarks = (campaign: CESCampaign, dataset: CESDataset) => {
  const categoryPeers = dataset.campaigns.filter(c => 
    c.category === campaign.category && c.campaign_name !== campaign.campaign_name
  );
  
  const brandPeers = dataset.campaigns.filter(c => 
    c.brand === campaign.brand && c.campaign_name !== campaign.campaign_name
  );

  const calculateAverage = (campaigns: CESCampaign[], metric: keyof CESCampaign['effectiveness_metrics']) => {
    const values = campaigns
      .map(c => c.effectiveness_metrics[metric])
      .filter(v => v !== undefined) as number[];
    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;
  };

  return {
    campaign_performance: {
      ces_score: campaign.ces_score || 0,
      percentile: calculatePercentile(campaign.ces_score || 0, dataset.campaigns.map(c => c.ces_score || 0))
    },
    category_benchmarks: {
      avg_brand_lift: calculateAverage(categoryPeers, 'brand_lift'),
      avg_sales_lift: calculateAverage(categoryPeers, 'sales_lift'),
      avg_roi: calculateAverage(categoryPeers, 'roi'),
      sample_size: categoryPeers.length
    },
    brand_benchmarks: {
      avg_brand_lift: calculateAverage(brandPeers, 'brand_lift'),
      avg_sales_lift: calculateAverage(brandPeers, 'sales_lift'),
      avg_roi: calculateAverage(brandPeers, 'roi'),
      sample_size: brandPeers.length
    },
    effectiveness_rating: getEffectivenessRating(campaign.ces_score || 0)
  };
};

// Calculate percentile rank
const calculatePercentile = (value: number, allValues: number[]): number => {
  const sorted = allValues.sort((a, b) => a - b);
  const index = sorted.indexOf(value);
  return Math.round((index / sorted.length) * 100);
};

// Get effectiveness rating
const getEffectivenessRating = (cesScore: number): string => {
  if (cesScore >= 80) return 'Exceptional';
  if (cesScore >= 70) return 'Highly Effective';
  if (cesScore >= 60) return 'Effective';
  if (cesScore >= 50) return 'Moderately Effective';
  return 'Needs Improvement';
};

// Export functions for chat integration
export const cesIntegrationHandlers = {
  loadDataset: loadCESDataset,
  searchCampaigns: searchCESCampaigns,
  getBenchmarks: getCampaignBenchmarks,
  calculateScore: calculateCESScore
};