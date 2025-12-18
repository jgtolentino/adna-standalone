import os

# Metadata DB (for Superset itself)
SQLALCHEMY_DATABASE_URI = (
    os.environ.get("SQLALCHEMY_DATABASE_URI")
    or os.environ.get("SUPERSET_DB_URI")
)

# Secret key
SECRET_KEY = os.environ.get("SUPERSET_SECRET_KEY", "CHANGE_ME_SUPERSET_SECRET")

# Basic tuning
ROW_LIMIT = 5000
SUPERSET_WEBSERVER_TIMEOUT = 120
SUPERSET_WEBSERVER_PORT = 8088

# Behind reverse proxy? (optional but usually safe)
ENABLE_PROXY_FIX = True

# Feature flags: enable embed if you plan to iframe dashboards later
FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
}

# TBWA theming can be added later here (colors, logo paths, etc.)
