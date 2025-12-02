{
    "name": "IPAI AI Recommendations",
    "summary": "Generic AI recommendations for stores, regions, transactions, and products.",
    "version": "18.0.1.0.0",
    "author": "InsightPulseAI",
    "website": "https://insightpulseai.net",
    "license": "LGPL-3",
    "category": "Tools/AI",
    "depends": [
        "base",
        "mail",
        "sale_management",
        "product",
        "ipai_scout_retail_core",
        "ipai_scout_consumer",
    ],
    "data": [
        "security/ipai_ai_recommendation_security.xml",
        "security/ir.model.access.csv",
        "views/ipai_ai_recommendation_views.xml",
    ],
    "installable": True,
    "application": False,
}
