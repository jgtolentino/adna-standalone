# Scout Dashboard - Architecture & Implementation Plan

## Executive Summary

**Product:** Suqi Analytics - Scout Dashboard
**Status:** 🟡 85% Production-Ready (Schema complete, database empty, frontend ready)
**Supabase Project:** `spdtwktxdalcfigzeqrz` (superset)
**Target:** Full production readiness by end of Q4 2025

This document provides the complete architecture overview and phased implementation plan for achieving 100% production readiness, including **critical database seeding**, export functionality, AI panel integration, and security hardening.

---

## CRITICAL BLOCKER: Empty Database

| Component | Status | Details |
|-----------|--------|---------|
| Schema | ✅ Complete | 29 scout.* tables exist (bronze, silver, gold, views) |
| Data | 🔴 **EMPTY** | scout_bronze_transactions: 0 rows; scout_silver_transactions: 0 rows |
| Views | ✅ Exist | Prepared but returning empty result sets (no source data) |

**BLOCKER:** Dashboard displays hardcoded mock data because database is unpopulated.
**ACTION REQUIRED:** Run seed script before any other work.

---

## Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Scout Dashboard (Next.js 14.2.15)                 │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │Dashboard │ │ Trends   │ │Product   │ │Geography │ │   NLQ    │  │    │
│  │  │  Home    │ │          │ │ Mix      │ │   Map    │ │          │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Data Hooks Layer (11 hooks)                  │    │
│  │  useTxTrends | useProductMix | useBrandPerformance | useGeoRegions  │    │
│  │  useConsumerProfile | useAgeDistribution | useFunnelMetrics |        │    │
│  │  useDaypartAnalysis | usePaymentMethods | useStorePerformance |      │    │
│  │  useKPISummary | useGeoRegionsMap                                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       Global Filter Context                          │    │
│  │  FilterProvider | useGlobalFilters | URL Sync | Date Presets        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js API Routes                                │    │
│  │   /api/nlq | /api/kpis | /api/health | /api/dq/summary              │    │
│  │   /api/export/trends | /api/export/product-mix | /api/export/geo    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Supabase Client                                   │    │
│  │   getSupabase() | getSupabaseSchema('scout') | RPC calls            │    │
│  │   Built-in: Connection pooling, query building, error handling      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Supabase PostgreSQL                               │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │ scout schema                                                   │  │    │
│  │  │  ├── regions (17 PH administrative regions)                   │  │    │
│  │  │  ├── stores (250+ retail outlets)                             │  │    │
│  │  │  ├── scout_bronze_transactions (raw, 18K+ rows)               │  │    │
│  │  │  ├── scout_silver_transactions (cleaned, normalized)          │  │    │
│  │  │  ├── scout_gold_* (pre-aggregated metrics)                    │  │    │
│  │  │  └── v_* (11 Gold views for analytics)                        │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │ dq schema (data quality)                                      │  │    │
│  │  │  ├── v_data_health_summary                                    │  │    │
│  │  │  ├── v_data_health_issues                                     │  │    │
│  │  │  └── v_etl_activity_stream                                    │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │ public schema (auth/profiles)                                 │  │    │
│  │  │  ├── profiles (user roles)                                    │  │    │
│  │  │  ├── dashboard_configs                                        │  │    │
│  │  │  └── user_dashboards                                          │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            SOURCE SYSTEMS                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────────┐   │
│  │   Odoo CE/OCA 18 │  │   Azure IoT/Edge │  │   PS2 (Legacy POS)       │   │
│  │   (Master Data)  │  │   (Real-time)    │  │   (Batch)                │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    ETL Pipeline (Bronze → Silver → Gold)             │    │
│  │  Airbyte | dbt | Supabase Edge Functions | Scheduled Jobs           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 14.2.15 | React framework with App Router |
| **Runtime** | Node.js | 24.x | Vercel serverless runtime |
| **UI Components** | React | 18.x | Component library |
| **Styling** | Tailwind CSS | 3.3.x | Utility-first CSS |
| **Charts** | Recharts | 2.12.x | Data visualization |
| **Maps** | Mapbox GL JS | 3.16.x | Geographic visualization |
| **Icons** | Lucide React | 0.344.x | Icon library |
| **Database** | Supabase (PostgreSQL) | Latest | Managed Postgres + Auth |
| **Hosting** | Vercel | Latest | Edge deployment |
| **CI/CD** | GitHub Actions | N/A | Automated workflows |

---

## Directory Structure

```
apps/scout-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Dashboard Home (/)
│   │   ├── layout.tsx                # Root layout with Navigation
│   │   ├── globals.css               # Global styles
│   │   ├── trends/
│   │   │   └── page.tsx              # Transaction Trends (/trends)
│   │   ├── product-mix/
│   │   │   └── page.tsx              # Product Mix (/product-mix)
│   │   ├── geography/
│   │   │   └── page.tsx              # Map (/geography)
│   │   ├── nlq/
│   │   │   └── page.tsx              # AI Query (/nlq)
│   │   ├── data-health/
│   │   │   └── page.tsx              # DQ Dashboard (/data-health)
│   │   ├── debug/
│   │   │   └── page.tsx              # Debug (/debug)
│   │   └── api/                      # API Routes
│   │       ├── nlq/route.ts          # NLQ endpoint
│   │       ├── kpis/route.ts         # KPI summary
│   │       ├── health/route.ts       # System health
│   │       ├── dq/summary/route.ts   # Data quality
│   │       ├── enriched/route.ts     # Enriched data
│   │       └── export/
│   │           ├── trends/route.ts   # Export trends
│   │           ├── product-mix/route.ts
│   │           └── geography/route.ts
│   │
│   ├── components/
│   │   ├── Navigation.tsx            # Sidebar navigation
│   │   ├── GlobalFilterBar.tsx       # Filter drawer
│   │   ├── HealthBadge.tsx           # Health indicator
│   │   ├── Providers.tsx             # Context providers
│   │   ├── databank/
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── NLQChart.tsx          # Natural language query UI
│   │   │   ├── FilterControls.tsx    # Filter dropdowns
│   │   │   ├── ConsumerProfilingChart.tsx
│   │   │   ├── ComparativeAnalytics.tsx
│   │   │   └── DatabankHeader.tsx
│   │   └── geography/
│   │       └── PhilippinesChoropleth.tsx  # Mapbox map
│   │
│   ├── contexts/
│   │   └── FilterContext.tsx         # Global filter state + URL sync
│   │
│   ├── data/
│   │   └── hooks/
│   │       ├── index.ts              # Barrel export
│   │       ├── useScoutData.ts       # All 11 Scout data hooks
│   │       └── useRegionMetrics.ts   # Region-specific hook
│   │
│   ├── hooks/
│   │   └── useRealtimeMetrics.ts     # Real-time subscriptions
│   │
│   ├── lib/
│   │   ├── env.ts                    # Environment validation
│   │   ├── supabaseClient.ts         # Supabase singleton
│   │   ├── utils.ts                  # cn() helper
│   │   └── nlq/
│   │       └── patterns.ts           # NLQ pattern registry
│   │
│   ├── services/
│   │   ├── analytics.ts              # Analytics helpers
│   │   ├── datasource.ts             # Data source utils
│   │   └── unifiedDataService.ts     # Unified data layer
│   │
│   ├── types/
│   │   ├── index.ts                  # Re-exports
│   │   ├── scout.ts                  # Scout domain types
│   │   └── databank.ts               # Databank types
│   │
│   └── utils/
│       └── databankUtils.ts          # Utility functions
│
├── public/
│   ├── data/                         # Static data files (fallback)
│   ├── geo/
│   │   └── philippines_regions_v1.geojson  # 17-region GeoJSON
│   └── tbwasmp-logo.webp
│
├── scripts/
│   └── guard-no-csv.mjs              # Build guard (no CSV in prod)
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## Implementation Phases

### Phase 0: DATABASE SEEDING (BLOCKING - Week 0)

**Objective:** Populate empty database before any other work

**CRITICAL:** Database is currently empty. All views return 0 rows.

**Tasks:**
1. ⬜ Connect to Supabase PostgreSQL (`spdtwktxdalcfigzeqrz`)
2. ⬜ Run seed script: `053_scout_full_seed_18k.sql`
3. ⬜ Verify row counts after seeding
4. ⬜ Test each view returns non-empty results

**Seeding Commands:**
```bash
# Set connection string
export SUPABASE_DATABASE_URL="postgresql://postgres:PASSWORD@db.spdtwktxdalcfigzeqrz.supabase.co:5432/postgres"

# Run seeding script
psql "$SUPABASE_DATABASE_URL" -f infrastructure/database/supabase/migrations/053_scout_full_seed_18k.sql

# Verify data loaded
psql "$SUPABASE_DATABASE_URL" -c "SELECT COUNT(*) FROM scout.scout_bronze_transactions;"
# Expected output: 18000+
```

**Expected Post-Seed State:**
- scout_bronze_transactions: 18,000+ rows
- scout_silver_transactions: 17,000+ rows (after dedup)
- v_tx_trends: 90 rows (last 90 days)
- v_product_mix: 12 categories
- v_brand_performance: 8+ brands
- v_geo_regions: 17 Philippines regions

**Exit Criteria:** All views return non-empty results

---

### Phase 1: Current State Verification (Week 1)

**Objective:** Verify all existing functionality works in production (AFTER seeding)

**Tasks:**
1. ⬜ Verify Supabase connection in production
2. ⬜ Confirm all 11 Gold views return data
3. ⬜ Test all 6 dashboard routes render correctly
4. ⬜ Validate filter context URL persistence
5. ⬜ Fix any Vercel deployment errors

**Verification Checklist:**
- [x] All enums created in scout schema
- [x] regions table has 17 rows
- [ ] scout_bronze_transactions has 18,000+ rows (AFTER SEEDING)
- [ ] All views return data when queried (AFTER SEEDING)
- [ ] Production deployment stable (no 500 errors)

### Phase 2: Filter Integration Completion (Week 1-2)

**Objective:** Ensure filters work end-to-end on all pages

**Tasks:**
1. ✅ GlobalFilterBar component implemented
2. ✅ FilterContext with URL sync implemented
3. ✅ Date range presets (today, 7d, 30d, 90d, custom)
4. ✅ useScoutView() accepts filters parameter
5. ⬜ Wire GlobalFilterBar to remaining pages (consumer-behavior, profiling)
6. ⬜ Test 6 pages × 4 filter combinations = 24 test scenarios

**Filter Flow Verification:**
```
User selects brands → Local state updates → "Brands: 2" badge shows
User clicks "Apply" → All hooks refetch → Charts update → URL persists
User navigates away → URL params preserved → Returns with filters intact
User clicks "Reset" → Defaults restored → URL cleared
```

### Phase 3: Export Functionality (Week 2)

**Objective:** Implement data export for all pages

**Tasks:**
1. ✅ `/api/export/trends` endpoint created
2. ✅ `/api/export/product-mix` endpoint created
3. ✅ `/api/export/geography` endpoint created
4. ⬜ Add "Export" button to page headers
5. ⬜ Implement CSV format with headers
6. ⬜ Implement XLSX format
7. ⬜ Add audit logging for exports

**Export Endpoint Pattern:**
```typescript
// POST /api/export/trends
export async function POST(request: Request) {
  const { filters, format } = await request.json();
  const data = await fetchTrendsData(filters);

  if (format === 'csv') {
    const csv = convertToCSV(data);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="scout-trends-${date}.csv"`
      }
    });
  }
  // ... xlsx, json
}
```

### Phase 4: AI Panel Integration (Week 2-3)

**Objective:** Wire Suqi AI insights to all dashboard pages

**Tasks:**
1. ⬜ Create `useInsights(pageType, metrics)` hook
2. ⬜ Implement dynamic insight generation from metrics
3. ⬜ Add "Ask Suqi" button to page headers
4. ⬜ Create NLQ modal overlay component
5. ⬜ Pre-fill context from current page/filters

**Insight Generation Pattern:**
```typescript
function generateInsights(data: TxTrendsRow[]): string[] {
  const insights: string[] = [];

  const avgGrowth = calculateGrowth(data);
  if (avgGrowth > 10) {
    insights.push(`Strong growth of ${avgGrowth.toFixed(1)}% over the period`);
  }

  const peakHours = findPeakHours(data);
  insights.push(`Peak hours: ${peakHours.join(', ')} drive 60% of daily volume`);

  return insights;
}
```

### Phase 5: Testing & Quality Assurance (Week 3)

**Objective:** Comprehensive testing coverage

**Tasks:**
1. ⬜ Write Playwright smoke tests (6 pages × 4 combos = 24 tests)
2. ⬜ Add component unit tests (hooks, filters, export)
3. ⬜ Test error boundaries with network failures
4. ⬜ Test empty states with no data
5. ⬜ Mobile responsiveness testing (375px, 768px, 1024px)

**E2E Test Scenarios:**
```typescript
// tests/e2e/smoke.spec.ts
test('Dashboard home loads with KPIs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="kpi-transactions"]')).toBeVisible();
  await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();
});

test('Filters persist across navigation', async ({ page }) => {
  await page.goto('/trends');
  await page.click('[data-testid="brand-coca-cola"]');
  await page.click('[data-testid="apply-filters"]');
  await expect(page).toHaveURL(/brands=coca-cola/);

  await page.goto('/product-mix');
  await expect(page).toHaveURL(/brands=coca-cola/);
});

test('Export downloads CSV', async ({ page }) => {
  await page.goto('/trends');
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('[data-testid="export-csv"]')
  ]);
  expect(download.suggestedFilename()).toMatch(/scout-trends.*\.csv/);
});
```

### Phase 6: Security & RLS (Week 3-4)

**Objective:** Implement row-level security and audit logging

**Tasks:**
1. ⬜ Enable RLS on scout.scout_silver_transactions
2. ⬜ Create workspace isolation policy
3. ⬜ Create role-based access policies
4. ⬜ Test RLS with different user roles
5. ⬜ Implement audit_logs table
6. ⬜ Log export events

**RLS Policy Example:**
```sql
-- Enable RLS
ALTER TABLE scout.scout_silver_transactions ENABLE ROW LEVEL SECURITY;

-- Workspace isolation policy
CREATE POLICY "workspace_isolation" ON scout.scout_silver_transactions
  FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Executive: full access
CREATE POLICY "executive_full_access" ON scout.scout_silver_transactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'executive'
    )
  );
```

### Phase 7: Production Deployment (Week 4)

**Objective:** Full production deployment with monitoring

**Pre-Deployment Checklist:**
- [ ] All migrations applied to production Supabase
- [ ] Seed data verified (18,000+ transactions)
- [ ] Environment variables configured in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_MAPBOX_TOKEN`
  - `NEXT_PUBLIC_STRICT_DATASOURCE=true`
- [ ] RLS policies enabled and tested
- [ ] Build passes with no warnings
- [ ] All Playwright tests green

**Vercel Configuration:**
```json
// vercel.json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"],
  "env": {
    "NEXT_PUBLIC_STRICT_DATASOURCE": "true"
  }
}
```

**Post-Deployment Verification:**
1. Load each page and verify data renders
2. Execute 5 NLQ queries and verify responses
3. Test all filter interactions
4. Verify map loads with 17 regions
5. Check data health dashboard accuracy
6. Mobile responsiveness check (iPad, iPhone)
7. Export CSV and verify contents

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Supabase connection failure | Low | High | Graceful degradation, cached last-known-good data |
| Large dataset performance | Medium | Medium | Materialized views, pagination, LIMIT clauses |
| NLQ pattern mismatch | Medium | Low | Fallback to default query, user feedback loop |
| Map tile loading slow | Low | Low | Mapbox CDN, offline fallback GeoJSON |
| RLS policy bypass | Low | Critical | Regular security audit, penetration testing |
| Filter state corruption | Low | Medium | URL validation, reset button, error boundary |
| Export timeout | Medium | Medium | Background job queue, progress indicator |

---

## Performance Optimization

### Database Level
- ✅ Indexes on frequently filtered columns (timestamp, region_code, brand_name)
- ✅ Materialized views for heavy aggregations (gold_region_metrics)
- ✅ Connection pooling via Supabase
- ⬜ Query plan analysis for slow queries

### Application Level
- ✅ React.memo for expensive components
- ✅ useMemo/useCallback for derived data
- ✅ Lazy loading for route code splitting
- ✅ Image optimization via Next.js (WebP)
- ⬜ SWR cache tuning (stale-while-revalidate)

### Network Level
- ✅ Edge caching for static assets (Vercel)
- ✅ API response caching (SWR pattern)
- ✅ Gzip compression enabled
- ⬜ CDN for Mapbox tiles

---

## Monitoring & Observability

### Metrics to Track

| Metric | Tool | Target | Alert Threshold |
|--------|------|--------|-----------------|
| Page load time (LCP) | Vercel Analytics | < 2.5s | > 4s |
| API response time (P95) | Supabase logs | < 500ms | > 1s |
| Error rate | Sentry | < 0.1% | > 1% |
| Active users (daily) | Custom analytics | 50+ | < 10 |
| NLQ success rate | Custom logs | > 85% | < 70% |
| Database connections | Supabase dashboard | < 80% | > 90% |

### Alerting Rules
- Error rate > 1% for 5 minutes → Slack + PagerDuty
- P95 latency > 3 seconds → Slack
- Database connection failures → PagerDuty
- Supabase quota > 80% → Email warning

---

## CI/CD Pipeline

```yaml
# .github/workflows/scout-dashboard-ci.yml
name: Scout Dashboard CI

on:
  push:
    branches: [main, 'claude/*']
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run test:unit
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run build:vercel
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Timeline Summary

| Week | Phase | Deliverables | Status |
|------|-------|--------------|--------|
| **Week 0** | **DATABASE SEEDING** | **Seed 18K+ transactions, verify views** | 🔴 **BLOCKING** |
| Week 1 | Verification + Filters | Production stable, filters complete | ⬜ Blocked |
| Week 2 | Export + AI Panel | Export buttons, AI insights | ⬜ Blocked |
| Week 3 | Testing + Security | Playwright tests, RLS policies | ⬜ Blocked |
| Week 4 | Production Deploy | Full deployment, monitoring | ⬜ Blocked |

**NOTE:** All phases after Week 0 are blocked until database is seeded.

---

*Plan Version: 1.0.0*
*Created: 2025-12-18*
*Last Updated: 2025-12-18*
