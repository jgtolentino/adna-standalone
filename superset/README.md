# TBWA Agency Databank - Apache Superset Analytics

Production-ready Apache Superset deployment for TBWA Agency Databank.

## Quick Start

### 1. Apply the analytics migration

```bash
psql -h <your-supabase-host> -U postgres -d postgres \
  -f infrastructure/database/supabase/migrations/040_superset_analytics_views.sql
```

This creates the `analytics.*` views that Superset will bind to.

### 2. Configure environment

Copy and edit the environment file:

```bash
cp .env.superset.example .env.superset
# Edit .env.superset with your actual values
```

### 3. Start the Superset stack

```bash
./superset/bootstrap/superset_bootstrap.sh start
# or:
docker compose -f superset/docker-compose.superset.yml up -d
```

### 4. Access Superset

- **Local**: http://localhost:8088
- **Production**: https://superset.insightpulseai.net (when deployed)

Default credentials: `admin` / `admin`

### 5. Add the analytics database

In the Superset UI:

1. **Data → Databases → + Database**
2. Choose **PostgreSQL**
3. Use your `ANALYTICS_DB_URI` as the SQLAlchemy URI
4. Test connection and save

### 6. Register datasets

For each view, go to **Data → Datasets → + Dataset**:

| Dataset Name | Schema/View |
|--------------|-------------|
| Agency – Store Performance | `analytics.vw_store_performance` |
| Agency – Brand Performance | `analytics.vw_brand_performance` |
| Agency – Daily Transactions | `analytics.vw_daily_transactions` |
| Client Portfolio | `analytics.vw_client_portfolio` |
| Customer Demographics | `analytics.vw_customer_demographics` |
| Campaign WARC Effectiveness | `analytics.vw_warc_effectiveness` |

### 7. Build dashboards

Create three dashboards:

1. **TBWA Agency Overview** — store performance, daily transactions, brand performance
2. **TBWA Client Portfolio Health** — brand performance + client portfolio
3. **TBWA Campaign Performance** — WARC effectiveness

## Analytics Views

| View | Description |
|------|-------------|
| `analytics.vw_store_performance` | Store-level transaction metrics |
| `analytics.vw_brand_performance` | Brand metrics (TBWA vs non-TBWA) |
| `analytics.vw_daily_transactions` | Time-series / seasonality |
| `analytics.vw_client_portfolio` | TBWA client health / revenue share |
| `analytics.vw_customer_demographics` | Gender / age segmentation |
| `analytics.vw_warc_effectiveness` | Campaign ROI and effectiveness |

## Environment Variables

See `.env.superset.example`:

```env
# Superset metadata DB (internal Postgres)
SUPERSET_DB_URI=postgresql://superset:superset@superset-db:5432/superset

# Superset secret key
SUPERSET_SECRET_KEY=change-this-to-a-long-random-string

# Admin user bootstrap
SUPERSET_ADMIN_USER=admin
SUPERSET_ADMIN_PASSWORD=admin
SUPERSET_ADMIN_EMAIL=admin@example.com

# Analytics database (your Supabase / Postgres)
ANALYTICS_DB_URI=postgresql://USER:PASSWORD@HOST:5432/DBNAME
```

## Directory Structure

```
superset/
├── docker-compose.superset.yml    # Docker stack
├── config/
│   └── superset_config.py         # Superset configuration
├── bootstrap/
│   └── superset_bootstrap.sh      # Start/stop helper
└── assets/
    ├── dashboards/                # Dashboard JSON exports
    └── datasets/                  # Dataset YAML definitions
```

## Commands

```bash
# Start
./superset/bootstrap/superset_bootstrap.sh start

# Stop
./superset/bootstrap/superset_bootstrap.sh stop

# Logs
./superset/bootstrap/superset_bootstrap.sh logs
```

## Next Steps

After basic setup, consider:

1. **TBWA branding** — custom colors/logo in `superset_config.py`
2. **RLS by office** — row-level security so executives see only their region
3. **SSO integration** — LDAP/OAuth for production auth
4. **Scheduled reports** — email dashboards to stakeholders
