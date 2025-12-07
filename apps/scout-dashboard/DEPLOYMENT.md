# Scout Dashboard - Deployment Checklist

## Pre-Deployment Verification

### Build Status
- [x] `npm run build` passes without errors
- [x] Next.js version 14.2.15 (stable)
- [x] Node.js >= 18.x compatible

### Routes Verified
- [x] `/` - Dashboard Home
- [x] `/trends` - Transaction Trends
- [x] `/product-mix` - Product Mix & SKU
- [x] `/geography` - Philippines Choropleth
- [x] `/nlq` - AI Query Interface
- [x] `/data-health` - Data Quality Monitoring

### API Endpoints
- [x] `POST /api/nlq` - Natural language queries
- [x] `GET /api/nlq` - Query suggestions
- [x] `GET /api/kpis` - KPI summary
- [x] `GET /api/health` - System health
- [x] `GET /api/dq/summary` - Data quality
- [x] `GET /api/enriched` - Enriched data

---

## Environment Variables

### Required for Vercel

```
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_MAPBOX_TOKEN=<your-mapbox-token>
NEXT_PUBLIC_STRICT_DATASOURCE=true
```

### Vercel Configuration

1. Go to Vercel Project Settings > Environment Variables
2. Add all variables above for Production environment
3. Optionally add for Preview (with test Supabase)

---

## Supabase Setup

### Required Migrations
Run in order:
```bash
# 1. Regions table
050_scout_regions.sql

# 2. Core schema (stores, transactions, views)
051_scout_transactions_canonical.sql

# 3. Seed data (optional, for demo)
053_scout_full_seed_18k.sql
```

### Verify Schema
```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'scout';

-- Check views exist
SELECT table_name FROM information_schema.views
WHERE table_schema = 'scout';

-- Verify data
SELECT COUNT(*) FROM scout.transactions;
```

---

## Vercel Deployment Steps

### 1. Connect Repository
```bash
vercel link
```

### 2. Set Root Directory
In Vercel Dashboard:
- Settings > General > Root Directory: `apps/scout-dashboard`

### 3. Build Settings
```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### 4. Deploy
```bash
# Production
vercel --prod

# Preview
vercel
```

---

## Post-Deployment Verification

### Health Checks
- [ ] `/api/health` returns 200
- [ ] Home page loads with KPIs
- [ ] Geography map renders
- [ ] NLQ query returns results

### Performance
- [ ] First Contentful Paint < 2s
- [ ] Lighthouse Performance > 70

### Data Connectivity
- [ ] Supabase connection working
- [ ] Scout views returning data
- [ ] No CORS errors

---

## Troubleshooting

### Common Issues

**Build fails with "next not found"**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Supabase connection fails**
- Verify environment variables in Vercel
- Check Supabase project status
- Ensure RLS policies allow anonymous access

**Map not rendering**
- Verify NEXT_PUBLIC_MAPBOX_TOKEN is set
- Check Mapbox usage limits

---

## Rollback Procedure

1. In Vercel Dashboard, go to Deployments
2. Find last working deployment
3. Click "..." > "Promote to Production"

---

*Last updated: 2025-12-07*
