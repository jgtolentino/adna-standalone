import { AnalysisResults } from '@/services/videoAnalysis';

export function generateMockAnalysisResults(analysisId: string): AnalysisResults {
  return {
    analysis_id: analysisId,
    video_analysis: {
      scene_analysis: {
        total_scenes: 12,
        key_scenes: [
          { timestamp: '00:10', description: 'Brand logo introduction', confidence: 0.95 },
          { timestamp: '00:45', description: 'Product showcase', confidence: 0.92 },
          { timestamp: '01:30', description: 'Call to action', confidence: 0.88 }
        ]
      },
      emotion_analysis: {
        dominant_emotions: ['joy', 'excitement', 'trust'],
        emotion_journey: [
          { timestamp: '00:00-00:15', emotion: 'anticipation', intensity: 0.7 },
          { timestamp: '00:15-00:45', emotion: 'joy', intensity: 0.85 },
          { timestamp: '00:45-01:30', emotion: 'excitement', intensity: 0.9 },
          { timestamp: '01:30-02:00', emotion: 'trust', intensity: 0.8 }
        ],
        overall_sentiment: 'positive',
        sentiment_score: 0.82
      },
      speech_analysis: {
        transcript: 'Mock transcript: Experience the difference with our innovative solution...',
        key_phrases: ['innovative solution', 'experience the difference', 'trusted by millions'],
        clarity_score: 0.88,
        pace: 'moderate'
      },
      unified_frames: 180
    },
    campaign_effectiveness: {
      overall_effectiveness: {
        ces_score: 78,
        success_probability: 0.82,
        roi_forecast: {
          expected: 3.2,
          lower_bound: 2.4,
          upper_bound: 4.1,
          confidence: 0.85
        }
      },
      timestamp_analysis: [
        {
          timestamp: '00:00-00:15',
          segment_ces_score: 72,
          visual_effectiveness: 0.75,
          emotional_impact: {
            score: 0.7,
            dominant_emotion: 'anticipation'
          },
          key_insights: ['Strong opening with brand recognition', 'Sets expectation well']
        },
        {
          timestamp: '00:15-00:45',
          segment_ces_score: 85,
          visual_effectiveness: 0.88,
          emotional_impact: {
            score: 0.85,
            dominant_emotion: 'joy'
          },
          key_insights: ['Peak engagement period', 'Product benefits clearly communicated']
        },
        {
          timestamp: '00:45-01:30',
          segment_ces_score: 80,
          visual_effectiveness: 0.82,
          emotional_impact: {
            score: 0.9,
            dominant_emotion: 'excitement'
          },
          key_insights: ['Maintains high engagement', 'Social proof elements effective']
        },
        {
          timestamp: '01:30-02:00',
          segment_ces_score: 75,
          visual_effectiveness: 0.78,
          emotional_impact: {
            score: 0.8,
            dominant_emotion: 'trust'
          },
          key_insights: ['Clear call to action', 'Brand trust reinforcement']
        }
      ],
      feature_importance: {
        'visual_quality': 0.25,
        'emotional_resonance': 0.22,
        'message_clarity': 0.20,
        'brand_presence': 0.18,
        'call_to_action': 0.15
      },
      recommendations: [
        {
          category: 'Visual Enhancement',
          priority: 'high',
          title: 'Optimize Opening Sequence',
          description: 'Consider adding more dynamic visuals in the first 5 seconds',
          expected_impact: '+5-7% engagement'
        },
        {
          category: 'Messaging',
          priority: 'medium',
          title: 'Strengthen Value Proposition',
          description: 'Make the unique selling point more prominent',
          expected_impact: '+3-5% recall'
        },
        {
          category: 'Call to Action',
          priority: 'medium',
          title: 'Extend CTA Duration',
          description: 'Increase call-to-action visibility from 3 to 5 seconds',
          expected_impact: '+2-4% conversion'
        }
      ],
      comparative_benchmarks: {
        vs_industry_average: {
          ces_score_delta: +8,
          roi_performance: '+15%',
          engagement_rate: '+22%'
        },
        vs_brand_average: {
          ces_score_delta: +5,
          roi_performance: '+10%',
          engagement_rate: '+18%'
        },
        percentile_rank: 82
      }
    },
    competitive_intelligence: {
      share_of_voice: {
        brand_sov: 0.28,
        category_rank: 2,
        trend: 'increasing',
        competitors: [
          { name: 'Competitor A', sov: 0.35 },
          { name: 'Competitor B', sov: 0.22 },
          { name: 'Your Brand', sov: 0.28 },
          { name: 'Others', sov: 0.15 }
        ]
      },
      social_performance: {
        engagement_rate: 0.045,
        vs_industry_avg: '+125%',
        sentiment_score: 0.82,
        virality_potential: 'high'
      },
      digital_presence: {
        online_mentions: 1250,
        trend_direction: 'positive',
        key_topics: ['innovation', 'quality', 'trust']
      },
      market_trends: {
        category_growth: 0.08,
        digital_shift: 0.65,
        consumer_preferences: ['sustainability', 'value', 'convenience']
      }
    },
    enhanced_ces_analysis: {
      enhanced_ces_score: 82,
      adjustment_factors: [
        {
          factor: 'Market Context',
          adjustment: +3,
          reasoning: 'Strong performance in growing category'
        },
        {
          factor: 'Competitive Position',
          adjustment: +1,
          reasoning: 'Above average share of voice'
        },
        {
          factor: 'Digital Optimization',
          adjustment: 0,
          reasoning: 'Already well-optimized for digital channels'
        }
      ]
    }
  };
}

// Additional mock helpers for different scenarios
export function generateMockVideoInsights(videoId: string) {
  return {
    videoId,
    insights: [
      { timestamp: '00:10', insight: 'High engagement spike detected - brand logo appearance' },
      { timestamp: '00:45', insight: 'Key message resonates well - emotional peak observed' },
      { timestamp: '01:30', insight: 'Slight drop in retention - consider shortening this segment' },
      { timestamp: '02:00', insight: 'Strong finish with clear CTA - 85% viewer retention' }
    ],
    summary: 'Video shows positive engagement overall with strong emotional resonance. Key opportunities for optimization in mid-section pacing.',
    effectiveness_score: 78,
    recommendations: [
      'Maintain strong opening sequence approach in future campaigns',
      'Consider A/B testing shorter middle segment',
      'CTA placement is optimal - use as template'
    ]
  };
}

// Mock data for different campaign types
export function getMockCampaignTypeData(campaignType: string) {
  const typeData: Record<string, any> = {
    brand: {
      avg_ces_score: 75,
      key_metrics: ['brand_awareness', 'emotional_connection', 'recall'],
      typical_roi: 2.8
    },
    performance: {
      avg_ces_score: 72,
      key_metrics: ['click_through_rate', 'conversion', 'cost_per_acquisition'],
      typical_roi: 3.5
    },
    hybrid: {
      avg_ces_score: 77,
      key_metrics: ['engagement', 'consideration', 'purchase_intent'],
      typical_roi: 3.2
    },
    awareness: {
      avg_ces_score: 74,
      key_metrics: ['reach', 'frequency', 'message_retention'],
      typical_roi: 2.5
    }
  };

  return typeData[campaignType] || typeData.hybrid;
}