# Scout Dashboard - Task List

## Overview

This document contains all actionable tasks for Scout Dashboard implementation, organized by domain. Each task includes an ID, summary, files touched, and dependencies.

---

## Task Domains

1. [Frontend/UI](#frontendui)
2. [Data/ETL](#dataetl)
3. [API/Backend](#apibackend)
4. [Odoo/OCA Delta](#odoooca-delta)
5. [AI/NLQ](#ainlq)
6. [Infrastructure/CI-CD](#infrastructureci-cd)

---

## Frontend/UI

### UI-001: Create Transaction Trends Page
**Summary:** Build the Transaction Trends page with Volume, Revenue, Basket Size, and Duration tabs.

**Files Touched:**
- `src/app/trends/page.tsx` (new)
- `src/components/trends/TrendsChart.tsx` (new)
- `src/components/trends/TrendsKPICards.tsx` (new)
- `src/components/Navigation.tsx` (update routes)

**Dependencies:** DATA-001, API-002

**Acceptance Criteria:**
- [ ] Page accessible at `/trends`
- [ ] 4 tabs: Volume, Revenue, Basket Size, Duration
- [ ] Line charts render with date on X-axis
- [ ] KPI cards show totals and trends
- [ ] Filters apply to chart data

---

### UI-002: Create Product Mix & SKU Page
**Summary:** Build the Product Mix page with Category Mix, Pareto, Substitutions, and Basket Analysis views.

**Files Touched:**
- `src/app/product-mix/page.tsx` (new)
- `src/components/product-mix/CategoryPieChart.tsx` (new)
- `src/components/product-mix/ParetoChart.tsx` (new)
- `src/components/product-mix/BasketAnalysis.tsx` (new)

**Dependencies:** DATA-002

**Acceptance Criteria:**
- [ ] Page accessible at `/product-mix`
- [ ] Pie chart shows category distribution
- [ ] Pareto chart shows 80/20 analysis
- [ ] Basket analysis shows cross-sell patterns

---

### UI-003: Create Consumer Behavior Page
**Summary:** Build Consumer Behavior page with Purchase Funnel, Request Methods, Acceptance Rates.

**Files Touched:**
- `src/app/behavior/page.tsx` (new)
- `src/components/behavior/FunnelChart.tsx` (new)
- `src/components/behavior/AcceptanceRateChart.tsx` (new)

**Dependencies:** DATA-003

**Acceptance Criteria:**
- [ ] Page accessible at `/behavior`
- [ ] Funnel chart shows visit → browse → request → accept → purchase
- [ ] Acceptance rates visualized as bar chart

---

### UI-004: Create Consumer Profiling Page
**Summary:** Build Consumer Profiling page with Demographics, Age & Gender, Location, Segments.

**Files Touched:**
- `src/app/profiling/page.tsx` (new)
- `src/components/profiling/DemographicsChart.tsx` (new)
- `src/components/profiling/AgeGenderChart.tsx` (new)
- `src/components/profiling/SegmentBehavior.tsx` (new)

**Dependencies:** DATA-004

**Acceptance Criteria:**
- [ ] Page accessible at `/profiling`
- [ ] Demographics breakdown by income band
- [ ] Age distribution histogram
- [ ] Gender split visualization
- [ ] Urban vs Rural comparison

---

### UI-005: Create Competitive Analysis Page
**Summary:** Build Competitive Analysis page with Market Share, Brand Comparison.

**Files Touched:**
- `src/app/competitive/page.tsx` (new)
- `src/components/competitive/MarketShareChart.tsx` (new)
- `src/components/competitive/BrandComparisonTable.tsx` (new)

**Dependencies:** DATA-005

**Acceptance Criteria:**
- [ ] Page accessible at `/competitive`
- [ ] Market share pie chart
- [ ] Brand ranking table with sorting
- [ ] TBWA client brand highlighting

---

### UI-006: Create Data Dictionary Page
**Summary:** Build Data Dictionary page showing schema documentation.

**Files Touched:**
- `src/app/dictionary/page.tsx` (new)
- `src/components/dictionary/TableExplorer.tsx` (new)
- `src/components/dictionary/FieldDefinitions.tsx` (new)

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Page accessible at `/dictionary`
- [ ] Lists all scout.* tables
- [ ] Shows column names, types, descriptions
- [ ] Searchable/filterable

---

### UI-007: Implement Global Filter Persistence
**Summary:** Add filter state management that persists across page navigation.

**Files Touched:**
- `src/context/FilterContext.tsx` (new)
- `src/app/layout.tsx` (wrap with provider)
- All page components (use context)

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Filters persist when navigating between pages
- [ ] URL params reflect current filter state
- [ ] Reset button clears all filters

---

### UI-008: Add Export Functionality
**Summary:** Implement CSV/PDF export buttons on dashboard pages.

**Files Touched:**
- `src/components/common/ExportButton.tsx` (new)
- `src/utils/exportUtils.ts` (new)
- All dashboard pages (add button)

**Dependencies:** API-005

**Acceptance Criteria:**
- [ ] CSV export downloads data file
- [ ] Filename includes date and page name
- [ ] Filtered data exports (not all data)

---

### UI-009: Enhance Mobile Responsiveness
**Summary:** Optimize all pages for mobile viewports (375px+).

**Files Touched:**
- `src/app/globals.css`
- All page and component files

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Navigation collapses to hamburger menu
- [ ] Charts stack vertically on mobile
- [ ] Filters accessible via sheet/modal
- [ ] Touch-friendly interactions

---

### UI-010: Add Loading Skeletons
**Summary:** Replace spinner loading states with skeleton placeholders.

**Files Touched:**
- `src/components/common/Skeleton.tsx` (new)
- All page components

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Skeleton matches final layout shape
- [ ] Smooth transition to loaded content
- [ ] Consistent skeleton style across pages

---

## Data/ETL

### DATA-001: Create v_tx_trends View
**Summary:** Create/update the transaction trends view for daily aggregations.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** None

**SQL Output:**
```sql
CREATE OR REPLACE VIEW scout.v_tx_trends AS
SELECT
  date_trunc('day', timestamp)::date AS tx_date,
  count(*) AS tx_count,
  sum(net_amount) AS total_revenue,
  round(avg(net_amount)::numeric, 2) AS avg_basket_value,
  count(DISTINCT store_id) AS active_stores,
  count(DISTINCT customer_id) AS unique_customers
FROM scout.transactions
GROUP BY 1
ORDER BY 1;
```

**Acceptance Criteria:**
- [ ] View returns daily aggregations
- [ ] Covers last 365 days of data
- [ ] Indexes support efficient queries

---

### DATA-002: Create v_product_mix View
**Summary:** Create product category mix view for Product Mix page.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Shows category distribution percentages
- [ ] Includes brand count per category
- [ ] Supports filtering by date range

---

### DATA-003: Create v_funnel_analysis View
**Summary:** Create purchase funnel view for Consumer Behavior page.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Shows funnel stage counts
- [ ] Calculates conversion rates
- [ ] Orders stages correctly

---

### DATA-004: Create v_consumer_profile Views
**Summary:** Create consumer demographic views for Profiling page.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] v_consumer_profile shows income/urban-rural splits
- [ ] v_consumer_age_distribution shows age brackets
- [ ] Supports gender breakdown

---

### DATA-005: Create v_competitive_analysis View
**Summary:** Create market share view for Competitive Analysis page.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Shows brand market share percentages
- [ ] Flags TBWA client brands
- [ ] Category-level share calculations

---

### DATA-006: Generate Demo Seed Data
**Summary:** Create script to generate 18,000+ realistic Philippine retail transactions.

**Files Touched:**
- `scripts/seed_scout_demo_data.sql` (new)
- `package.json` (add db:seed:scout script)

**Dependencies:** DATA-001 through DATA-005

**Acceptance Criteria:**
- [ ] 250+ stores across 17 regions
- [ ] 18,000+ transactions over 365 days
- [ ] Realistic category distribution
- [ ] Demographic variety in customers
- [ ] Idempotent (can re-run safely)

---

### DATA-007: Create RLS Policies
**Summary:** Implement Row-Level Security for all scout tables.

**Files Touched:**
- `infrastructure/database/supabase/migrations/001_scout_dashboard_schema.sql`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Executives see all data
- [ ] Regional managers see their region only
- [ ] Store owners see their store only
- [ ] Analysts see all data

---

### DATA-008: Create Performance Indexes
**Summary:** Add indexes for common query patterns.

**Files Touched:**
- `infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql`

**Dependencies:** DATA-001 through DATA-005

**Indexes Required:**
- [ ] `idx_scout_tx_timestamp` on (timestamp)
- [ ] `idx_scout_tx_region_date` on (region_code, timestamp)
- [ ] `idx_scout_tx_brand` on (brand_name)
- [ ] `idx_scout_tx_category` on (product_category)
- [ ] `idx_scout_tx_customer` on (customer_id)

---

## API/Backend

### API-001: Enhance NLQ Pattern Matching
**Summary:** Add more query patterns to NLQ endpoint.

**Files Touched:**
- `src/app/api/nlq/route.ts`

**Dependencies:** None

**New Patterns:**
- [ ] "top stores" → Store performance ranking
- [ ] "growth rate" → Week-over-week growth
- [ ] "customer profile" → Demographics summary
- [ ] "market share" → Brand share analysis

---

### API-002: Create Trends API
**Summary:** Create dedicated trends API with filter support.

**Files Touched:**
- `src/app/api/trends/route.ts` (new)

**Dependencies:** DATA-001

**Endpoint Spec:**
```
GET /api/trends?period=daily&start=2025-01-01&end=2025-12-31&region=NCR
Response: { success: true, data: TxTrendsRow[] }
```

**Acceptance Criteria:**
- [ ] Supports date range filtering
- [ ] Supports region filtering
- [ ] Returns correctly typed data

---

### API-003: Create Filter Options API
**Summary:** Create API to return dynamic filter dropdown options.

**Files Touched:**
- `src/app/api/filters/options/route.ts` (new)

**Dependencies:** None

**Endpoint Spec:**
```
GET /api/filters/options
Response: { brands: string[], categories: string[], regions: string[], stores: Store[] }
```

**Acceptance Criteria:**
- [ ] Returns distinct values from database
- [ ] Sorted alphabetically
- [ ] Cached for 5 minutes

---

### API-004: Create Insights API
**Summary:** Create AI insights endpoint for Suqi recommendations.

**Files Touched:**
- `src/app/api/ai/insights/route.ts` (new)

**Dependencies:** None

**Endpoint Spec:**
```
POST /api/ai/insights
Body: { context: 'dashboard', filters: {...} }
Response: { insights: Insight[], confidence: number }
```

**Acceptance Criteria:**
- [ ] Returns contextual insights
- [ ] Based on current filter state
- [ ] Rate limited

---

### API-005: Create Export API
**Summary:** Create data export endpoint for CSV/PDF generation.

**Files Touched:**
- `src/app/api/export/route.ts` (new)

**Dependencies:** None

**Endpoint Spec:**
```
POST /api/export
Body: { format: 'csv' | 'pdf', view: string, filters: {...} }
Response: Binary file or { url: string }
```

**Acceptance Criteria:**
- [ ] CSV export with headers
- [ ] Respects current filters
- [ ] Filename includes date

---

### API-006: Add API Error Handling
**Summary:** Implement consistent error handling across all APIs.

**Files Touched:**
- `src/lib/apiUtils.ts` (new)
- All `src/app/api/**/route.ts` files

**Dependencies:** None

**Acceptance Criteria:**
- [ ] All errors return `{ success: false, error: string }`
- [ ] Appropriate HTTP status codes
- [ ] Error logging to console

---

## Odoo/OCA Delta

### ODOO-001: Document Odoo Model Mapping
**Summary:** Create documentation mapping Scout fields to Odoo CE models.

**Files Touched:**
- `docs/odoo/SCOUT_ODOO_MAPPING.md` (new)

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Maps all Scout tables to Odoo models
- [ ] Lists required OCA modules
- [ ] Identifies delta modules needed

---

### ODOO-002: Define ipai_scout_integration Module
**Summary:** Design Odoo delta module for Scout-specific fields.

**Files Touched:**
- `docs/odoo/ipai_scout_integration/README.md` (new)

**Dependencies:** ODOO-001

**Module Fields:**
- [ ] `res.partner.x_income_band` (Selection)
- [ ] `res.partner.x_urban_rural` (Selection)
- [ ] `product.template.x_tbwa_client` (Boolean)

---

### ODOO-003: ETL Pipeline Design
**Summary:** Design Bronze→Silver→Gold ETL pipeline from Odoo.

**Files Touched:**
- `docs/odoo/ETL_PIPELINE_DESIGN.md` (new)

**Dependencies:** ODOO-001

**Acceptance Criteria:**
- [ ] Bronze layer: raw Odoo replicas
- [ ] Silver layer: cleaned, normalized
- [ ] Gold layer: analytics-ready views
- [ ] Incremental update strategy

---

## AI/NLQ

### NLQ-001: Improve Chart Type Detection
**Summary:** Enhance automatic chart type selection based on query semantics.

**Files Touched:**
- `src/app/api/nlq/route.ts`

**Dependencies:** None

**Improvements:**
- [ ] Multi-word keyword matching
- [ ] Query intent classification
- [ ] Default chart fallback logic

---

### NLQ-002: Add Query Suggestions Engine
**Summary:** Implement dynamic query suggestions based on available data.

**Files Touched:**
- `src/app/api/nlq/route.ts`
- `src/components/databank/NLQChart.tsx`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Suggestions based on available dimensions
- [ ] Recently used queries
- [ ] Popular queries

---

### NLQ-003: Implement Query Validation
**Summary:** Add input validation and sanitization for NLQ queries.

**Files Touched:**
- `src/app/api/nlq/route.ts`
- `src/lib/nlqValidator.ts` (new)

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Reject SQL injection attempts
- [ ] Whitelist allowed table/view names
- [ ] Rate limit queries per user

---

### NLQ-004: Add Query Explanation
**Summary:** Show users what SQL was executed and why.

**Files Touched:**
- `src/components/databank/NLQChart.tsx`

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Display executed SQL (sanitized)
- [ ] Show matched pattern
- [ ] Explain chart type choice

---

## Infrastructure/CI-CD

### INFRA-001: Set Up GitHub Actions Workflow
**Summary:** Create CI workflow for linting, type-checking, and testing.

**Files Touched:**
- `.github/workflows/scout-dashboard-ci.yml` (new)

**Dependencies:** None

**Workflow Steps:**
- [ ] npm install
- [ ] npm run lint
- [ ] npm run type-check
- [ ] npm run test (when tests exist)
- [ ] npm run build

---

### INFRA-002: Add Seed Verification Job
**Summary:** Add CI job to verify seed script runs without errors.

**Files Touched:**
- `.github/workflows/scout-seed-check.yml` (new)

**Dependencies:** DATA-006

**Acceptance Criteria:**
- [ ] Runs against temp database
- [ ] Verifies row counts
- [ ] Fails on seed errors

---

### INFRA-003: Configure Vercel Deployment
**Summary:** Ensure Vercel project settings are correct.

**Files Touched:**
- `apps/scout-dashboard/vercel.json`

**Dependencies:** None

**Settings:**
- [ ] Root directory: `apps/scout-dashboard`
- [ ] Build command: `npm run build:vercel`
- [ ] Framework: Next.js
- [ ] Region: sin1 (Singapore)

---

### INFRA-004: Add Environment Variable Documentation
**Summary:** Document all required environment variables.

**Files Touched:**
- `apps/scout-dashboard/.env.example` (new)
- `apps/scout-dashboard/DEPLOYMENT_README.md` (update)

**Dependencies:** None

**Variables:**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN`
- [ ] `NEXT_PUBLIC_STRICT_DATASOURCE`

---

### INFRA-005: Add Health Check Endpoint
**Summary:** Create comprehensive health check for monitoring.

**Files Touched:**
- `src/app/api/health/route.ts` (enhance)

**Dependencies:** None

**Health Checks:**
- [ ] Database connectivity
- [ ] View accessibility
- [ ] Response time
- [ ] Last data update time

---

### INFRA-006: Set Up Error Monitoring
**Summary:** Integrate error tracking (Sentry or similar).

**Files Touched:**
- `src/lib/errorTracking.ts` (new)
- `src/app/layout.tsx` (add provider)

**Dependencies:** None

**Acceptance Criteria:**
- [ ] Errors captured with stack trace
- [ ] User context attached
- [ ] Environment tagged (dev/prod)

---

## Priority Matrix

| Priority | Tasks |
|----------|-------|
| **P0 - Critical** | DATA-006, UI-001, UI-002, API-002, INFRA-003 |
| **P1 - High** | DATA-001, DATA-002, UI-003, UI-004, UI-007, API-001 |
| **P2 - Medium** | UI-005, UI-008, DATA-007, API-003, API-004, NLQ-001 |
| **P3 - Low** | UI-006, UI-009, UI-010, ODOO-*, NLQ-002, NLQ-003 |

---

## Go-Live Checklist

### Database
- [ ] All migrations applied to production
- [ ] Seed data loaded (or production data connected)
- [ ] RLS policies active and verified
- [ ] Indexes created and analyzed

### Application
- [ ] All routes accessible without errors
- [ ] All charts render with data
- [ ] Filters work correctly
- [ ] Mobile responsive
- [ ] Error boundaries in place

### Infrastructure
- [ ] Vercel deployment successful
- [ ] Environment variables configured
- [ ] Domain/SSL configured
- [ ] Health check passing

### Security
- [ ] RLS policies tested
- [ ] API rate limiting enabled
- [ ] No secrets in client bundle
- [ ] NLQ query sanitization active

### Monitoring
- [ ] Error tracking active
- [ ] Performance monitoring enabled
- [ ] Alerting configured

---

*Task List Version: 1.0.0*
*Last Updated: 2025-12-07*
