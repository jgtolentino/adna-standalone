# Backend Requirements & Environment Variables

## Required Environment Variables

### Frontend (Client-side)
```bash
# Supabase Public Configuration
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<public-anon-key>

# Application Settings
VITE_APP_TIMEZONE=Asia/Manila
VITE_FEATURE_AI_INSIGHTS=true
VITE_FEATURE_EXPORT_PDF=true
```

### Backend (Server/Edge Functions)
```bash
# Supabase Service Configuration
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=<public-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
SUPABASE_JWT_SECRET=<jwt-secret>

# Database Connection (Direct, for migrations)
DATABASE_URL=postgresql://postgres:<password>@db.<project>.supabase.co:5432/postgres

# Export Storage
EXPORT_BUCKET=exports
EXPORT_URL_TTL_SECONDS=3600
```

### Optional (AI Insights)
```bash
# OpenAI API (for LLM-powered insights)
FEATURE_AI_INSIGHTS=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo
INSIGHTS_CACHE_TTL_SECONDS=21600  # 6 hours
```

### Optional (Rate Limiting)
```bash
RATE_LIMIT_ENABLED=true
RATE_LIMIT_EXPORT_PER_HOUR=5
RATE_LIMIT_DASHBOARD_PER_MIN=60
```

---

## Infrastructure Requirements

### Supabase Project
- **Tier**: Pro or Enterprise (recommended for production)
- **Database**: PostgreSQL 15+
- **Storage**: 8 GB minimum, scales as needed
- **Backups**: Daily automated, 30-day retention
- **Connection Pooling**: PgBouncer (included)

### Redis Cache (Optional but Recommended)
- **Service**: Redis 6.2+ (AWS ElastiCache, Upstash, or self-hosted)
- **Memory**: 2 GB minimum
- **Configuration**:
```bash
REDIS_URL=redis://username:password@cache.example.com:6379
REDIS_KEY_PREFIX=scout:
REDIS_TTL_KPI=3600         # 1 hour
REDIS_TTL_TRENDS=3600      # 1 hour
REDIS_TTL_INSIGHTS=21600   # 6 hours
```

### S3 or Cloud Storage (for Exports)
- **Service**: AWS S3, Google Cloud Storage, or Supabase Storage
- **Bucket**: 1 bucket for exports
- **Lifecycle Policy**: Delete objects after 7 days
- **Access**: Signed URLs with 1-hour expiry

---

## Aggregate Refresh Jobs

### Daily Summary Refresh
- **Schedule**: 2:00 AM daily (org timezone)
- **Table**: `transaction_daily_summary`
- **Duration**: ~5 minutes for 100k transactions/day

### Hourly Summary Refresh
- **Schedule**: Every 15 minutes
- **Table**: `transaction_hourly_summary`
- **Duration**: ~1 minute

### Weekly Summary Refresh
- **Schedule**: Every Monday 3:00 AM
- **Table**: `transaction_weekly_summary`
- **Duration**: ~2 minutes

### Implementation Options
1. **Supabase Scheduled Edge Function** (recommended)
2. **pg_cron** (if enabled on Supabase)
3. **External cron** (GitHub Actions, AWS Lambda, etc.)

```sql
-- Example pg_cron setup
SELECT cron.schedule('refresh-daily-summary', '0 2 * * *',
  $$SELECT refresh_transaction_daily_summary()$$
);

SELECT cron.schedule('refresh-hourly-summary', '*/15 * * * *',
  $$SELECT refresh_transaction_hourly_summary()$$
);
```

---

## Performance Targets

| Operation | Target | SLA |
|-----------|--------|-----|
| `get_dashboard_summary` | < 500ms | p95 |
| `get_transaction_trends` | < 800ms | p95 |
| `get_insights` | < 1500ms | p95 (cached) |
| `export_dashboard_data` | < 10s | Async job ready |
| Cache hit rate (KPI tiles) | > 85% | Business hours |
| API availability | > 99.9% | Monthly |

---

## Compute Requirements

### API Instances (if running custom API layer)
- **Size**: 2 vCPU, 4 GB RAM (t3.medium equivalent)
- **Replicas**: 3 (for high availability)
- **Auto-scaling**: 2-10 replicas based on CPU

### Database
- **Size**: 2 vCPU, 8 GB RAM minimum
- **Storage**: 100 GB SSD (scales with data)
- **Read replicas**: 1 (for analytics queries)

---

## Monitoring & Alerting

### Metrics to Track
- Request latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database query time
- Cache hit rate
- Export file generation time
- LLM API latency (if enabled)

### Recommended Tools
- **Prometheus**: Metrics collection
- **Grafana**: Dashboarding
- **Sentry**: Error tracking
- **DataDog**: APM (alternative)

### Sample Prometheus Metrics
```
scout_api_request_duration_seconds{endpoint="/rpc/get_dashboard_summary", method="POST"}
scout_api_db_query_duration_seconds{query="get_transaction_trends"}
scout_api_cache_hits_total{cache="kpi_tiles"}
scout_api_export_jobs_total{format="csv"}
```

### Alerting Rules
- **High latency**: p95 > 2s for 5 minutes
- **High error rate**: 5xx rate > 1% for 5 minutes
- **Cache miss rate**: > 50% for 1 hour
- **Export queue backlog**: > 10 jobs pending for 10 minutes

---

## Cost Estimation (Monthly)

| Component | Tier | Cost |
|-----------|------|------|
| Supabase (Pro) | 100GB DB, HA | $500 |
| Redis Cache | 2GB, Standard | $30 |
| S3 Storage | 100GB archives | $50 |
| API Servers (if custom) | 3× t3.medium | $150 |
| CDN (Cloudflare) | Pro plan | $200 |
| Monitoring (DataDog) | APM + Logs | $300 |
| **Total** | | **~$1,230** |

**Per Organization (100 orgs):** ~$12/org/month

---

## Deployment Checklist

- [ ] Supabase project provisioned (PostgreSQL 15+)
- [ ] Schema migrations applied (001_init.sql, 002_rls_policies.sql)
- [ ] RPC functions deployed (5 core endpoints)
- [ ] Environment variables set (Supabase URL, keys)
- [ ] Aggregate refresh jobs scheduled
- [ ] S3/Storage bucket created with lifecycle policies
- [ ] SSL certificates configured (if custom domain)
- [ ] Health check endpoints operational (/health, /ready)
- [ ] Monitoring dashboards created
- [ ] Alerting rules configured
- [ ] Load testing completed (target: 100 req/s)
- [ ] Disaster recovery runbook documented
- [ ] RLS policies validated in staging
