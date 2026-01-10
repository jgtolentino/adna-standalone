# Scout Dashboard - Task List

## Overview

This document contains all actionable tasks for Scout Dashboard production readiness, organized by priority and domain. Each task includes an ID, summary, files touched, acceptance criteria, and dependencies.

**Current Status:** 🟡 85% Production-Ready (Schema complete, database empty, frontend ready)
**Remaining Work:** **DATABASE SEEDING (BLOCKING)**, Export UI, AI Panel, Testing, Security

---

## CRITICAL BLOCKER: Empty Database

| Component | Status | Details |
|-----------|--------|---------|
| Schema | ✅ Complete | 29 scout.* tables exist (bronze, silver, gold, views) |
| Data | 🔴 **EMPTY** | scout_bronze_transactions: 0 rows; scout_silver_transactions: 0 rows |
| Views | ✅ Exist | Prepared but returning empty result sets (no source data) |
| ETL Pipeline | ✅ Ready | `infrastructure/etl/odoo-sync/` scripts available |

**ALL TASKS BLOCKED** until database is populated via:
1. **Demo/Testing:** Run `053_scout_full_seed_18k.sql`
2. **Production:** Configure Odoo sync from `jgtolentino/odoo-ce`

---

## Priority Matrix

| Priority | Description | Tasks |
|----------|-------------|-------|
| **P-1 - BLOCKING** | Must complete first | SEED-001 (Database Seeding) |
| **P0 - Critical** | Blocking production | FIX-001, UI-008 |
| **P1 - High** | Core functionality | UI-001 through UI-007, API-001 through API-004 |
| **P2 - Medium** | Important features | TEST-001 through TEST-003, SEC-001 through SEC-003 |
| **P3 - Low** | Nice-to-have | PERF-001 through PERF-003, DOC-001 |

---

## P-1 - BLOCKING (Must Complete First)

### SEED-001: Populate Empty Database
**Summary:** Database is currently empty. Must populate with transaction data before any other work.

**CRITICAL:** Dashboard displays hardcoded mock data because database is unpopulated.

#### Option A: Seed Script (Demo/Testing)

**Files Touched:**
- `infrastructure/database/supabase/migrations/053_scout_full_seed_18k.sql`
- Supabase project: `spdtwktxdalcfigzeqrz` (superset)

**Commands:**
```bash
# Set connection string
export SUPABASE_DATABASE_URL="postgresql://postgres:PASSWORD@db.spdtwktxdalcfigzeqrz.supabase.co:5432/postgres"

# Run seeding script
psql "$SUPABASE_DATABASE_URL" -f infrastructure/database/supabase/migrations/053_scout_full_seed_18k.sql

# Verify data loaded
psql "$SUPABASE_DATABASE_URL" -c "SELECT COUNT(*) FROM scout.scout_bronze_transactions;"
# Expected output: 18000+
```

#### Option B: Odoo ETL Sync (Production)

**Files Touched:**
- `infrastructure/etl/odoo-sync/sync.py`
- `infrastructure/etl/odoo-sync/odoo_client.py`
- `infrastructure/etl/odoo-sync/transformers.py`

**Backend Repository:** `jgtolentino/odoo-ce`

**Commands:**
```bash
# Set Odoo credentials
export ODOO_BASE_URL="https://your-odoo-instance.com"
export ODOO_DB="your-database"
export ODOO_USERNAME="api-user"
export ODOO_PASSWORD="***"
export SUPABASE_URL="https://spdtwktxdalcfigzeqrz.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="***"

# Run full sync
cd infrastructure/etl/odoo-sync
pip install -r requirements.txt
python sync.py --full

# Or dry-run first
python sync.py --full --dry-run
```

**Acceptance Criteria:**
- [ ] scout_bronze_transactions: ≥18,000 rows
- [ ] scout_silver_transactions: ≥17,000 rows (after dedup)
- [ ] v_tx_trends: ~90 rows (last 90 days)
- [ ] v_product_mix: ~12 categories
- [ ] v_brand_performance: ≥8 brands
- [ ] v_geo_regions: 17 Philippines regions
- [ ] Each dashboard page shows real data (not mock)

**Dependencies:** None (this is the first task)
**Estimated Effort:** 1-2 hours (depending on data source)
**Blocks:** ALL OTHER TASKS

---

### ETL-001: Configure Scheduled Odoo Sync
**Summary:** Set up automated sync from Odoo to Supabase

**Files Touched:**
- `.github/workflows/odoo-sync.yml` (new)
- Or Supabase Edge Function configuration

**Acceptance Criteria:**
- [ ] Sync runs every 15 minutes (or configured schedule)
- [ ] Incremental sync using checkpoints
- [ ] Error alerts on sync failures
- [ ] Sync logs visible in `scout.sync_logs`

**Dependencies:** SEED-001 (Option B)
**Estimated Effort:** 2-4 hours

---

## P0 - Critical Tasks

### FIX-001: Verify Vercel Production Deployment
**Summary:** Ensure production deployment at scout-dashboard-xi.vercel.app is stable with no 500 errors

**Files Touched:**
- `apps/scout-dashboard/vercel.json`
- Vercel project settings

**Acceptance Criteria:**
- [ ] All 6 pages load without 500 errors
- [ ] Supabase connection works (no "Supabase not configured" errors)
- [ ] Mapbox map renders with 17 regions
- [ ] KPI cards show real data (not placeholders)
- [ ] Console has no critical errors

**Dependencies:** None
**Estimated Effort:** 2 hours

---

## P1 - High Priority Tasks

### Frontend/UI

#### UI-001: Wire Export Button to Trends Page
**Summary:** Add visible Export button to /trends page that triggers CSV download

**Files Touched:**
- `src/app/trends/page.tsx`
- `src/components/ExportButton.tsx` (new)

**Acceptance Criteria:**
- [ ] Export button visible in page header
- [ ] Click triggers POST to `/api/export/trends`
- [ ] File downloads with name `scout-trends-YYYY-MM-DD.csv`
- [ ] Includes current filter state in request
- [ ] Loading spinner during export

**Dependencies:** API-001

---

#### UI-002: Wire Export Button to Product Mix Page
**Summary:** Add Export button to /product-mix page

**Files Touched:**
- `src/app/product-mix/page.tsx`
- `src/components/ExportButton.tsx`

**Acceptance Criteria:**
- [ ] Export button visible in page header
- [ ] Downloads `scout-product-mix-YYYY-MM-DD.csv`
- [ ] Includes filtered category/brand data

**Dependencies:** API-002

---

#### UI-003: Wire Export Button to Geography Page
**Summary:** Add Export button to /geography page

**Files Touched:**
- `src/app/geography/page.tsx`
- `src/components/ExportButton.tsx`

**Acceptance Criteria:**
- [ ] Export button visible in page header
- [ ] Downloads `scout-geography-YYYY-MM-DD.csv`
- [ ] Includes regional metrics

**Dependencies:** API-003

---

#### UI-004: Add "Ask Suqi" Button to All Pages
**Summary:** Add AI query CTA button to page headers that opens NLQ modal

**Files Touched:**
- `src/app/trends/page.tsx`
- `src/app/product-mix/page.tsx`
- `src/app/geography/page.tsx`
- `src/components/AskSuqiButton.tsx` (new)
- `src/components/NLQModal.tsx` (new)

**Acceptance Criteria:**
- [ ] "Ask Suqi" button visible on all dashboard pages
- [ ] Click opens modal overlay
- [ ] Modal contains NLQ input + suggestions
- [ ] Pre-fills context from current page
- [ ] Close button works

**Dependencies:** None

---

#### UI-005: Implement Dynamic Insights Panel
**Summary:** Generate insights dynamically from current page data

**Files Touched:**
- `src/components/InsightsPanel.tsx` (new)
- `src/hooks/useInsights.ts` (new)
- `src/app/trends/page.tsx`
- `src/app/product-mix/page.tsx`
- `src/app/geography/page.tsx`

**Acceptance Criteria:**
- [ ] Insights panel visible on each dashboard
- [ ] 3-5 bullet points generated from data
- [ ] Updates when filters change
- [ ] Shows loading state during generation
- [ ] Empty state when no insights available

**Dependencies:** None

---

#### UI-006: Add Consumer Behavior Page
**Summary:** Create /consumer-behavior page with funnel chart

**Files Touched:**
- `src/app/consumer-behavior/page.tsx` (new)
- `src/components/FunnelChart.tsx` (new)
- `src/components/Navigation.tsx`

**Acceptance Criteria:**
- [ ] Route `/consumer-behavior` accessible
- [ ] Sidebar nav item added
- [ ] Funnel chart renders with stages
- [ ] 4 KPI cards (Conversion, Acceptance, Loyalty, Discovery)
- [ ] Filters work

**Dependencies:** DATA-001

---

#### UI-007: Add Consumer Profiling Page
**Summary:** Create /consumer-profiling page with demographic charts

**Files Touched:**
- `src/app/consumer-profiling/page.tsx` (new)
- `src/components/DemographicsChart.tsx` (new)
- `src/components/Navigation.tsx`

**Acceptance Criteria:**
- [ ] Route `/consumer-profiling` accessible
- [ ] Age distribution bar chart
- [ ] Gender pie chart
- [ ] Income breakdown
- [ ] Urban/Rural split

**Dependencies:** DATA-002

---

#### UI-008: Add Data Freshness Indicator
**Summary:** Show last-updated timestamp on all dashboard pages

**Files Touched:**
- `src/components/DataFreshnessIndicator.tsx` (new)
- All page components

**Acceptance Criteria:**
- [ ] Shows "Last updated: X minutes ago"
- [ ] Refreshes on data fetch
- [ ] Yellow warning if > 30 min stale
- [ ] Red warning if > 2 hours stale

**Dependencies:** None

---

### API/Backend

#### API-001: Implement CSV Export for Trends
**Summary:** POST `/api/export/trends` returns CSV file

**Files Touched:**
- `src/app/api/export/trends/route.ts`

**Acceptance Criteria:**
- [ ] Accepts `{ filters, format }` body
- [ ] Returns CSV with headers
- [ ] Includes all TxTrendsRow fields
- [ ] Respects filter parameters
- [ ] Filename includes date

**Implementation:**
```typescript
export async function POST(request: Request) {
  const { filters, format } = await request.json();
  const supabase = getSupabaseSchema('scout');

  let query = supabase.from('v_tx_trends').select('*');
  if (filters?.dateRange) {
    query = query.gte('tx_date', filters.dateRange.start)
                 .lte('tx_date', filters.dateRange.end);
  }

  const { data, error } = await query;
  if (error) throw error;

  const csv = convertToCSV(data);
  const date = new Date().toISOString().split('T')[0];

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="scout-trends-${date}.csv"`
    }
  });
}
```

---

#### API-002: Implement CSV Export for Product Mix
**Summary:** POST `/api/export/product-mix` returns CSV file

**Files Touched:**
- `src/app/api/export/product-mix/route.ts`

**Acceptance Criteria:**
- [ ] Returns category + brand data as CSV
- [ ] Includes revenue, tx_count, market_share
- [ ] Respects brand/category filters

---

#### API-003: Implement CSV Export for Geography
**Summary:** POST `/api/export/geography` returns CSV file

**Files Touched:**
- `src/app/api/export/geography/route.ts`

**Acceptance Criteria:**
- [ ] Returns all 17 regions
- [ ] Includes revenue, tx_count, active_stores, growth_rate
- [ ] Sorted by revenue descending

---

#### API-004: Add Audit Logging for Exports
**Summary:** Log export events to audit_logs table

**Files Touched:**
- `src/app/api/export/trends/route.ts`
- `src/app/api/export/product-mix/route.ts`
- `src/app/api/export/geography/route.ts`
- `src/lib/auditLog.ts` (new)

**Acceptance Criteria:**
- [ ] Each export creates audit log entry
- [ ] Includes: user_id, action, filters, row_count, timestamp
- [ ] Works asynchronously (doesn't block response)

---

### Data/ETL

#### DATA-001: Verify v_funnel_metrics View
**Summary:** Confirm funnel analysis view exists and returns data

**Files Touched:**
- SQL migrations (if view missing)

**Acceptance Criteria:**
- [ ] View exists in scout schema
- [ ] Returns stages: visit, browse, request, accept, purchase
- [ ] Includes count and conversion_rate per stage

---

#### DATA-002: Verify Consumer Profile Views
**Summary:** Confirm consumer profile views exist and return data

**Files Touched:**
- SQL migrations (if views missing)

**Acceptance Criteria:**
- [ ] `v_consumer_profile` exists with income/urban-rural breakdown
- [ ] `v_consumer_age_distribution` exists with age_group, gender, count

---

## P2 - Medium Priority Tasks

### Testing

#### TEST-001: Create Playwright Smoke Tests
**Summary:** E2E tests for all 6 dashboard pages

**Files Touched:**
- `tests/e2e/smoke.spec.ts` (new)
- `playwright.config.ts` (new)
- `package.json` (add scripts)

**Test Scenarios:**
```typescript
test.describe('Smoke Tests', () => {
  test('Home dashboard loads with KPIs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="kpi-transactions"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-stores"]')).toBeVisible();
    await expect(page.locator('[data-testid="kpi-customers"]')).toBeVisible();
  });

  test('Trends page loads chart', async ({ page }) => {
    await page.goto('/trends');
    await expect(page.locator('[data-testid="trends-chart"]')).toBeVisible();
    await expect(page.locator('text=Daily Volume')).toBeVisible();
  });

  test('Geography page loads map', async ({ page }) => {
    await page.goto('/geography');
    await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
  });

  test('Filters persist across navigation', async ({ page }) => {
    await page.goto('/trends?brands=coca-cola');
    await page.goto('/product-mix');
    await expect(page).toHaveURL(/brands=coca-cola/);
  });

  test('NLQ query returns chart', async ({ page }) => {
    await page.goto('/nlq');
    await page.fill('[data-testid="nlq-input"]', 'sales by day');
    await page.click('[data-testid="nlq-submit"]');
    await expect(page.locator('[data-testid="nlq-chart"]')).toBeVisible();
  });

  test('Export downloads file', async ({ page }) => {
    await page.goto('/trends');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('[data-testid="export-csv"]')
    ]);
    expect(download.suggestedFilename()).toMatch(/scout-trends.*\.csv/);
  });
});
```

**Acceptance Criteria:**
- [ ] 24 test scenarios (6 pages × 4 combos)
- [ ] All tests pass in CI
- [ ] < 2 minute total run time

---

#### TEST-002: Add Component Unit Tests
**Summary:** Jest tests for hooks and utility functions

**Files Touched:**
- `src/data/hooks/__tests__/useScoutData.test.ts` (new)
- `src/contexts/__tests__/FilterContext.test.ts` (new)
- `src/lib/__tests__/utils.test.ts` (new)
- `jest.config.js` (new)

**Acceptance Criteria:**
- [ ] >80% coverage on hooks
- [ ] Filter context state management tested
- [ ] Date range preset calculation tested
- [ ] CSV conversion tested

---

#### TEST-003: Test Error States
**Summary:** Verify graceful degradation on network failures

**Files Touched:**
- Test files

**Acceptance Criteria:**
- [ ] "Failed to load" message appears on API error
- [ ] Retry button functional
- [ ] No blank screens
- [ ] Console logs helpful error info

---

### Security

#### SEC-001: Enable RLS on Transactions Table
**Summary:** Add row-level security policies

**Files Touched:**
- SQL migration file

**Implementation:**
```sql
-- Enable RLS
ALTER TABLE scout.scout_silver_transactions ENABLE ROW LEVEL SECURITY;

-- Anon can read all (for demo)
CREATE POLICY "anon_read_all" ON scout.scout_silver_transactions
  FOR SELECT TO anon USING (true);

-- Authenticated users by workspace
CREATE POLICY "workspace_isolation" ON scout.scout_silver_transactions
  FOR SELECT TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );
```

**Acceptance Criteria:**
- [ ] RLS enabled on table
- [ ] Anon role can read (for demo)
- [ ] Authenticated users scoped by workspace (future)

---

#### SEC-002: Create Audit Logs Table
**Summary:** Table for tracking user actions

**Files Touched:**
- SQL migration file

**Implementation:**
```sql
CREATE TABLE public.audit_logs (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  workspace_id TEXT
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

**Acceptance Criteria:**
- [ ] Table exists in public schema
- [ ] Indexes for query performance
- [ ] RLS enabled (users see own logs only)

---

#### SEC-003: Implement API Rate Limiting
**Summary:** Prevent abuse of NLQ and export endpoints

**Files Touched:**
- `src/middleware.ts` (new or update)
- `src/lib/rateLimit.ts` (new)

**Acceptance Criteria:**
- [ ] NLQ: max 30 requests/minute per IP
- [ ] Export: max 10 requests/minute per IP
- [ ] 429 response on limit exceeded
- [ ] Headers include rate limit info

---

## P3 - Low Priority Tasks

### Performance

#### PERF-001: Add SWR Cache Tuning
**Summary:** Optimize stale-while-revalidate settings

**Files Touched:**
- `src/data/hooks/useScoutData.ts`

**Acceptance Criteria:**
- [ ] KPI summary: 5 min revalidate
- [ ] Trends: 2 min revalidate
- [ ] Geography: 5 min revalidate
- [ ] Reduce unnecessary refetches

---

#### PERF-002: Implement Request Deduplication
**Summary:** Prevent duplicate API calls on rapid clicks

**Files Touched:**
- `src/data/hooks/useScoutData.ts`

**Acceptance Criteria:**
- [ ] Pending request prevents new request
- [ ] Works with filter changes
- [ ] No race conditions

---

#### PERF-003: Add Bundle Size Monitoring
**Summary:** Track JS bundle size in CI

**Files Touched:**
- `.github/workflows/scout-dashboard-ci.yml`
- `package.json`

**Acceptance Criteria:**
- [ ] Bundle size reported in PR comments
- [ ] Alert if > 10% increase
- [ ] Target: < 500KB gzipped

---

### Documentation

#### DOC-001: Update README with Setup Instructions
**Summary:** Document local development setup

**Files Touched:**
- `apps/scout-dashboard/README.md`

**Acceptance Criteria:**
- [ ] Environment variables documented
- [ ] Local setup steps
- [ ] Database seeding instructions
- [ ] Deployment process

---

## Go-Live Checklist

### Database
- [x] All migrations applied to production
- [ ] **BLOCKING: Seed data loaded (18,000+ transactions)** ← REQUIRED FIRST
- [ ] 11 Gold views return non-empty data (blocked by seeding)
- [ ] RLS policies active and verified (blocked by seeding)
- [ ] Indexes created and analyzed (blocked by seeding)

### Application
- [x] All 6 routes accessible without errors
- [x] All charts render with data
- [x] Filters work correctly
- [x] Mobile responsive
- [x] Error boundaries in place
- [ ] Export buttons functional
- [ ] AI panel wired

### Infrastructure
- [x] Vercel deployment successful
- [x] Environment variables configured
- [ ] Domain/SSL configured (if custom domain)
- [x] Health check passing
- [ ] Sentry error tracking enabled

### Security
- [ ] RLS policies tested
- [ ] API rate limiting enabled
- [x] No secrets in client bundle
- [x] NLQ query sanitization active

### Monitoring
- [ ] Error tracking active (Sentry)
- [ ] Performance monitoring enabled (Vercel Analytics)
- [ ] Alerting configured

---

## Task Status Summary

| Domain | Total | Completed | In Progress | Pending | Blocked By |
|--------|-------|-----------|-------------|---------|------------|
| **Database Seeding** | **1** | **0** | **0** | **1** | **None** |
| Frontend/UI | 8 | 0 | 0 | 8 | SEED-001 |
| API/Backend | 4 | 0 | 0 | 4 | SEED-001 |
| Data/ETL | 2 | 0 | 0 | 2 | SEED-001 |
| Testing | 3 | 0 | 0 | 3 | SEED-001 |
| Security | 3 | 0 | 0 | 3 | SEED-001 |
| Performance | 3 | 0 | 0 | 3 | SEED-001 |
| Documentation | 1 | 0 | 0 | 1 | None |
| **Total** | **25** | **0** | **0** | **25** | — |

**NOTE:** All tasks except SEED-001 and DOC-001 are blocked until database is seeded.

---

## Quick Reference: Remaining Work

### Week 0 (BLOCKING - Must Do First)
1. **SEED-001: Populate Empty Database** ← START HERE

### Week 1 (Verification - After Seeding)
1. FIX-001: Verify production deployment

### Week 2 (Export + AI)
1. API-001, API-002, API-003: Export endpoints
2. UI-001, UI-002, UI-003: Export buttons
3. UI-004, UI-005: AI panel

### Week 3 (Testing + Security)
1. TEST-001, TEST-002, TEST-003: Playwright + Jest
2. SEC-001, SEC-002: RLS + Audit logs
3. UI-006, UI-007: Consumer pages

### Week 4 (Polish + Deploy)
1. PERF-001, PERF-002: Performance tuning
2. SEC-003, API-004: Rate limiting + Audit logging
3. DOC-001: Documentation
4. Final QA + production deploy

---

*Task List Version: 1.0.0*
*Last Updated: 2025-12-18*
