// Market Intelligence Service for Campaign Analysis Enrichment
export interface MarketDataSource {
  id: string;
  name: string;
  url: string;
  description: string;
  lastUpdated: string;
  category: 'primary' | 'secondary' | 'advocacy';
  methodology: string;
  granularity: string;
  refreshCadence: string;
}

export interface CategoryShare {
  category: string;
  marketShare: number;
  tbwaClientShare: number;
  dominantBrands: string[];
  growthTrend: number;
}

export interface CompetitorIntelligence {
  competitorName: string;
  marketShare: number;
  keyBrands: string[];
  recentCampaigns: string[];
  strengths: string[];
  weaknesses: string[];
}

// Primary data sources for market intelligence
export const MARKET_DATA_SOURCES: MarketDataSource[] = [
  {
    id: 'nielseniq-asia-2025',
    name: 'NielsenIQ – Asia Channel Dynamics 2025',
    url: 'https://nielseniq.com/global/en/insights/analysis/2025/asia-channel-dynamics/',
    description: 'Latest 2024 growth trends and basket mix for sari-sari stores in the Philippines, confirming mini-stores remain the dominant FMCG channel.',
    lastUpdated: '2025-01-15',
    category: 'primary',
    methodology: 'Consumer panels, EPOS read-outs, retail audits with sample sizes and error margins documented',
    granularity: 'Weekly store-scan, drillable to SKU, price tier, region',
    refreshCadence: 'Weekly'
  },
  {
    id: 'kantar-fmcg-q3-2024',
    name: 'Kantar Worldpanel – FMCG Monitor: Q3 2024 – Philippines',
    url: 'https://www.kantarworldpanel.com/ph/Latest-Insights/FMCG-Monitor-Q3-2024',
    description: 'Unit-growth breakdown by mega-category (food, beverage, home & personal care) and by region.',
    lastUpdated: '2024-10-15',
    category: 'primary',
    methodology: 'Household panel data with documented weighting and coverage',
    granularity: 'SKU-level, regional breakdown',
    refreshCadence: 'Quarterly'
  },
  {
    id: 'kantar-asia-2024',
    name: 'Kantar – FMCG in Asia ends 2024 on a strong footing',
    url: 'https://www.kantar.com/inspiration/fmcg/fmcg-in-asia-ends-2024-on-a-strong-footing-growing-2-7',
    description: 'Relative weight of powdered/RTD beverages and salty snacks in small-format stores.',
    lastUpdated: '2025-03-01',
    category: 'primary',
    methodology: 'Multi-market FMCG panel analysis',
    granularity: 'Category-level across Asia markets',
    refreshCadence: 'Annual'
  },
  {
    id: 'philstar-sarisari-2025',
    name: 'Philstar Business – Sari-sari store sales forecast',
    url: 'https://www.philstar.com/business/2025/06/18/2451288/sari-sari-store-sales-hit-p24-trillion-2030',
    description: 'Total sari-sari universe size citing 1.3 million stores, ₱2.4 trillion sales by 2030.',
    lastUpdated: '2025-06-18',
    category: 'secondary',
    methodology: 'Industry reporting and analysis',
    granularity: 'Market-level totals',
    refreshCadence: 'As published'
  },
  {
    id: 'seatca-tobacco-2024',
    name: 'Seatca TobaccoWatch – Big Tobacco market analysis',
    url: 'https://tobaccowatch.seatca.org/index.php/2024/05/27/big-tobacco-dependent-on-cigarettes-for-profits/',
    description: 'JTI controlled ≈37% of Philippine cigarette market in 2024.',
    lastUpdated: '2024-05-27',
    category: 'advocacy',
    methodology: 'Industry analysis and advocacy research',
    granularity: 'Brand-level market shares',
    refreshCadence: 'Periodic reports'
  },
  {
    id: 'veriff-jti-case-2024',
    name: 'Veriff Case Study – JTI Philippines',
    url: 'https://www.veriff.com/case-studies/veriff-and-jti',
    description: 'JTI\'s 43.6% market share corroborating high-30s/low-40s dominance range.',
    lastUpdated: '2024-01-15',
    category: 'secondary',
    methodology: 'Corporate case study analysis',
    granularity: 'Company-specific metrics',
    refreshCadence: 'Case study updates'
  },
  {
    id: 'tobacco-tactics-ph',
    name: 'TobaccoTactics Country Profile – Philippines',
    url: 'https://www.tobaccotactics.org/article/philippines-country-profile/',
    description: 'Brand-level cigarette shares (Marlboro 33%, Winston 14%, etc.).',
    lastUpdated: '2024-12-01',    
    category: 'advocacy',
    methodology: 'Industry watchdog analysis',
    granularity: 'Brand-level competitive landscape',
    refreshCadence: 'Updated as new data available'
  }
];

// Sample category data for Philippines FMCG market
export const CATEGORY_MARKET_DATA: CategoryShare[] = [
  {
    category: 'Cigarettes',
    marketShare: 0.18,
    tbwaClientShare: 0.40, // JTI dominance
    dominantBrands: ['Winston', 'Mevius', 'LD'],
    growthTrend: -0.02
  },
  {
    category: 'Beverages (RTD)',
    marketShare: 0.25,
    tbwaClientShare: 0.15,
    dominantBrands: ['Coca-Cola', 'Pepsi', 'Kopiko'],
    growthTrend: 0.05
  },
  {
    category: 'Salty Snacks',
    marketShare: 0.12,
    tbwaClientShare: 0.25,
    dominantBrands: ['Jack n Jill', 'Oishi', 'Ricoa'],
    growthTrend: 0.08
  },
  {
    category: 'Personal Care',
    marketShare: 0.15,
    tbwaClientShare: 0.20,
    dominantBrands: ['Unilever brands', 'P&G brands'],
    growthTrend: 0.03
  },
  {
    category: 'Food (Packaged)',
    marketShare: 0.30,
    tbwaClientShare: 0.18,
    dominantBrands: ['Nestle', 'Monde Nissin', 'URC'],
    growthTrend: 0.04
  }
];

// Market intelligence enrichment functions
export const enrichCampaignWithMarketData = async (campaignCategory: string) => {
  const relevantSources = MARKET_DATA_SOURCES.filter(source => 
    source.description.toLowerCase().includes(campaignCategory.toLowerCase()) ||
    source.category === 'primary'
  );
  
  const categoryData = CATEGORY_MARKET_DATA.find(cat => 
    cat.category.toLowerCase().includes(campaignCategory.toLowerCase())
  );

  return {
    marketContext: {
      totalMarketSize: '₱2.4 trillion by 2030 (sari-sari channel)',
      storeUniverse: '1.3 million stores',
      channelDominance: 'Mini-stores remain dominant FMCG channel',
      growthRate: '2.7% regional FMCG growth'
    },
    categoryIntelligence: categoryData || {
      category: campaignCategory,
      marketShare: 0.10,
      tbwaClientShare: 0.22, // Overall TBWA share
      dominantBrands: ['Market Leader 1', 'Market Leader 2'],
      growthTrend: 0.025
    },
    competitiveContext: generateCompetitiveContext(campaignCategory),
    dataSources: relevantSources,
    dataQuality: {
      primarySourcesUsed: relevantSources.filter(s => s.category === 'primary').length,
      totalSourcesUsed: relevantSources.length,
      methodologyTransparency: 'High - using primary measurement companies',
      lastUpdate: new Date().toISOString()
    }
  };
};

export const generateCompetitiveContext = (category: string): CompetitorIntelligence[] => {
  // Generate competitive intelligence based on category
  if (category.toLowerCase().includes('tobacco') || category.toLowerCase().includes('cigarette')) {
    return [
      {
        competitorName: 'Philip Morris International',
        marketShare: 0.33,
        keyBrands: ['Marlboro', 'Parliament'],
        recentCampaigns: ['Marlboro Red Campaign', 'IQOS Heat-not-burn'],
        strengths: ['Strong brand recognition', 'Premium positioning'],
        weaknesses: ['Declining category', 'Regulatory pressure']
      },
      {
        competitorName: 'British American Tobacco',
        marketShare: 0.15,
        keyBrands: ['Lucky Strike', 'Pall Mall'],
        recentCampaigns: ['Lucky Strike Social', 'BAT Next Generation'],
        strengths: ['International presence', 'Innovation pipeline'],
        weaknesses: ['Lower market share', 'Brand awareness gaps']
      }
    ];
  }
  
  return [
    {
      competitorName: 'Market Leader',
      marketShare: 0.35,
      keyBrands: ['Leading Brand A', 'Leading Brand B'],
      recentCampaigns: ['Digital First Campaign', 'Regional Expansion'],
      strengths: ['Market dominance', 'Strong distribution'],
      weaknesses: ['Premium pricing', 'Limited innovation']
    }
  ];
};

// Data source reliability scoring
export const scoreDataSourceReliability = (source: MarketDataSource): number => {
  let score = 0;
  
  // Primary sources get higher scores
  if (source.category === 'primary') score += 40;
  else if (source.category === 'secondary') score += 25;
  else score += 15; // advocacy
  
  // Methodology transparency
  if (source.methodology.includes('sample sizes')) score += 20;
  if (source.methodology.includes('documented')) score += 10;
  
  // Refresh frequency
  if (source.refreshCadence.includes('Weekly')) score += 15;
  else if (source.refreshCadence.includes('Monthly')) score += 10;
  else if (source.refreshCadence.includes('Quarterly')) score += 8;
  else score += 5;
  
  // Granularity
  if (source.granularity.includes('SKU')) score += 15;
  else if (source.granularity.includes('Brand')) score += 10;
  else score += 5;
  
  return Math.min(score, 100);
};

export const getMarketIntelligenceSummary = () => {
  const primarySources = MARKET_DATA_SOURCES.filter(s => s.category === 'primary').length;
  const totalSources = MARKET_DATA_SOURCES.length;
  const avgReliability = MARKET_DATA_SOURCES.reduce((acc, source) => 
    acc + scoreDataSourceReliability(source), 0) / totalSources;
  
  return {
    totalSources,
    primarySources,
    secondarySources: MARKET_DATA_SOURCES.filter(s => s.category === 'secondary').length,
    advocacySources: MARKET_DATA_SOURCES.filter(s => s.category === 'advocacy').length,
    averageReliabilityScore: Math.round(avgReliability),
    overallTbwaShare: 0.22,
    marketCoverage: 'Philippines FMCG',
    lastEnrichmentUpdate: new Date().toISOString()
  };
};