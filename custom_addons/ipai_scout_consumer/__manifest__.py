{
    "name": "IPAI Scout Consumer Profiles",
    "summary": "Anonymous consumer profiling for Scout transactions (gender, age bracket, location).",
    "version": "18.0.1.0.0",
    "author": "InsightPulseAI",
    "website": "https://insightpulseai.net",
    "license": "LGPL-3",
    "category": "Sales/Analytics",
    "depends": [
        "base",
        "mail",
        "ipai_scout_retail_core",
    ],
    "data": [
        "security/ipai_scout_consumer_security.xml",
        "security/ir.model.access.csv",
        "views/ipai_consumer_profile_views.xml",
    ],
    "installable": True,
    "application": False,
}
