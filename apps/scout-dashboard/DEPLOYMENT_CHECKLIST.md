# Scout Dashboard Deployment Checklist

## Database Preflight – Scout Schema

**CRITICAL**: Before running E2E tests or deploying to Vercel, the Scout database schema MUST be applied to Supabase.

### Required Views

The Scout Dashboard requires these views to function:

- ✅ `scout.v_kpi_summary` - Homepage KPI cards
- ✅ `scout.v_tx_trends` - Transaction trends page
- ✅ `scout.v_product_mix` - Product mix category analytics
- ✅ `scout.v_brand_performance` - Brand performance tab
- ✅ `scout.v_geo_regions` - Geography map data
- ✅ `public.v_data_health_summary` - Data health dashboard (optional)

### Step 1: Apply Database Migrations

**Target Supabase Project**: `ublqmilcjtpnflofprkr`

Navigate to **Supabase → SQL Editor** and run these files in order:

1. **Main Schema** (`supabase/migrations/20251207_scout_transactions.sql`)
   - Creates `scout` schema
   - Creates tables: `regions`, `stores`, `transactions`
   - Creates views: `v_tx_trends`, `v_product_mix`, `v_geo_regions`

2. **Missing Views** (`supabase/migrations/20251208_scout_missing_views.sql`)
   - Creates `scout.v_kpi_summary`
   - Creates `scout.v_brand_performance`
   - Creates `public.v_data_health_summary`
   - Grants RLS permissions

3. **Seed Data** (`supabase/seeds/scout_seed.sql`)
   - Seeds Philippine regions (17 regions)
   - Seeds sample stores (distributed across regions)
   - Generates realistic transaction data

### Step 2: Verify Installation

From the `apps/scout-dashboard` directory, run:

```bash
npm run check:metrics
```

**Expected Output**:

```
🔍 Checking Supabase Scout Dashboard Metrics...

1️⃣  Checking scout.v_kpi_summary...
   ✅ OK: v_kpi_summary (1 row)

2️⃣  Checking scout.v_tx_trends...
   ✅ OK: v_tx_trends (30 rows)

3️⃣  Checking scout.v_product_mix...
   ✅ OK: v_product_mix (8 rows)

4️⃣  Checking scout.v_brand_performance...
   ✅ OK: v_brand_performance (15 rows)

5️⃣  Checking scout.v_geo_regions...
   ✅ OK: v_geo_regions (17 rows)

6️⃣  Checking public.v_data_health_summary (optional)...
   ✅ OK: v_data_health_summary (1 row)

============================================================
✅ SUCCESS: All critical Scout dashboard views are accessible
```

### Step 3: Run E2E Tests

Once metrics check passes:

```bash
npm run test:e2e
```

All 8 tests should pass:
- ✅ Homepage renders with KPIs and navigation cards
- ✅ /trends page renders with chart and data table
- ✅ /product-mix page renders with category visualization
- ✅ /product-mix brands tab switches correctly
- ✅ /geography page renders with choropleth map
- ✅ /nlq page renders with AI query interface
- ✅ /data-health page renders without errors
- ✅ All pages have working navigation

### Step 4: Deploy to Vercel

If both metrics and E2E tests pass, deploy:

```bash
vercel --prod
```

## Troubleshooting

### ❌ "Could not find the table 'scout.v_kpi_summary'"

**Cause**: Migrations not applied to Supabase

**Fix**:
1. Open Supabase SQL Editor
2. Run `supabase/migrations/20251207_scout_transactions.sql`
3. Run `supabase/migrations/20251208_scout_missing_views.sql`
4. Run `supabase/seeds/scout_seed.sql`

### ❌ "The schema must be one of the following: public, graphql_public"

**Cause**: PostgREST schema exposure issue

**Fix**: Views exist but aren't exposed. Grant permissions:

```sql
GRANT USAGE ON SCHEMA scout TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA scout TO anon, authenticated;
GRANT SELECT ON ALL VIEWS IN SCHEMA scout TO anon, authenticated;
```

### ❌ E2E tests showing "Internal Server Error"

**Cause**: Missing database views

**Fix**: Run `npm run check:metrics` to diagnose which views are missing

## CI/CD Integration

The GitHub Actions workflow (`.github/workflows/scout-dashboard-ci.yml`) includes a metrics check before E2E tests.

**Deployment will fail** if Scout views are not accessible on the target Supabase project.

## Maintenance

**Re-seeding Data**: To refresh seed data, re-run `supabase/seeds/scout_seed.sql` in SQL Editor.

**Schema Changes**: All Scout schema changes must be version-controlled in `supabase/migrations/`.

**Vercel Environment Variables**: Ensure these are set in Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL=https://ublqmilcjtpnflofprkr.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=[from Supabase settings]`
- `NEXT_PUBLIC_MAPBOX_TOKEN=[from Mapbox dashboard]`
