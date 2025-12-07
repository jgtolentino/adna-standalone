# Scout Dashboard - Architecture & Implementation Plan

## Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Scout Dashboard (Next.js 24)                      │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │Dashboard │ │ NLQ/AI   │ │Geography │ │  Data    │ │ Settings │  │    │
│  │  │  Home    │ │  Query   │ │   Map    │ │ Health   │ │          │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Data Hooks Layer                             │    │
│  │  useKPISummary │ useGeoRegions │ useTxTrends │ useRegionMetrics     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js API Routes                                │    │
│  │   /api/nlq │ /api/kpis │ /api/health │ /api/dq/summary │ /api/*    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Supabase Client                                   │    │
│  │   getSupabase() │ getSupabaseSchema('scout') │ RPC calls            │    │
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
│  │  │  ├── regions (17 PH regions)                                  │  │    │
│  │  │  ├── stores (retail outlets)                                  │  │    │
│  │  │  ├── transactions (canonical fact table)                      │  │    │
│  │  │  └── v_* (gold views for analytics)                           │  │    │
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
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Frontend** | Next.js | 24.0.0 | React framework with App Router |
| **UI Components** | React | 18.x | Component library |
| **Styling** | Tailwind CSS | 3.3.x | Utility-first CSS |
| **Charts** | Recharts | 2.12.x | Data visualization |
| **Maps** | Mapbox GL JS | 3.16.x | Geographic visualization |
| **Icons** | Lucide React | 0.344.x | Icon library |
| **Database** | Supabase (PostgreSQL) | Latest | Managed Postgres + Auth |
| **Hosting** | Vercel | Latest | Edge deployment |
| **CI/CD** | GitHub Actions | N/A | Automated workflows |

### Directory Structure

```
apps/scout-dashboard/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Dashboard Home (/)
│   │   ├── layout.tsx                # Root layout with Navigation
│   │   ├── globals.css               # Global styles
│   │   ├── nlq/
│   │   │   └── page.tsx              # AI Query (/nlq)
│   │   ├── geography/
│   │   │   └── page.tsx              # Map (/geography)
│   │   ├── data-health/
│   │   │   └── page.tsx              # DQ Dashboard (/data-health)
│   │   ├── debug/
│   │   │   └── page.tsx              # Debug (/debug)
│   │   └── api/                      # API Routes
│   │       ├── nlq/
│   │       │   └── route.ts          # NLQ endpoint
│   │       ├── kpis/
│   │       │   └── route.ts          # KPI summary
│   │       ├── health/
│   │       │   └── route.ts          # System health
│   │       ├── dq/
│   │       │   └── summary/
│   │       │       └── route.ts      # Data quality
│   │       └── enriched/
│   │           └── route.ts          # Enriched data
│   │
│   ├── components/
│   │   ├── Navigation.tsx            # Top nav bar
│   │   ├── HealthBadge.tsx           # Health indicator
│   │   ├── databank/
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── NLQChart.tsx          # Natural language query UI
│   │   │   ├── FilterControls.tsx    # Filter dropdowns
│   │   │   ├── ConsumerProfilingChart.tsx
│   │   │   ├── ComparativeAnalytics.tsx
│   │   │   └── DatabankHeader.tsx
│   │   └── geography/
│   │       └── PhilippinesChoropleth.tsx
│   │
│   ├── data/
│   │   └── hooks/
│   │       ├── index.ts              # Barrel export
│   │       ├── useScoutData.ts       # All Scout data hooks
│   │       └── useRegionMetrics.ts   # Region-specific hook
│   │
│   ├── hooks/
│   │   └── useRealtimeMetrics.ts     # Real-time subscriptions
│   │
│   ├── lib/
│   │   ├── env.ts                    # Environment validation
│   │   ├── supabaseClient.ts         # Supabase singleton
│   │   └── utils.ts                  # cn() helper
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
│   ├── data/                         # Static data files
│   └── geo/
│       └── philippines_regions_v1.geojson
│
├── scripts/
│   └── guard-no-csv.mjs              # Build guard
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## Implementation Phases

### Phase 1: Database Foundation (Week 1)

**Objective:** Establish complete schema with all tables, views, and RLS policies.

```
Sequence:
1. Create scout schema
2. Create enums (daypart, payment_method, income_band, urban_rural, funnel_stage)
3. Create regions table + seed 17 Philippine regions
4. Create stores table with geo columns
5. Create transactions table (canonical grain)
6. Create all gold views (v_tx_trends, v_product_mix, etc.)
7. Apply RLS policies
8. Grant permissions to anon, authenticated
```

**Migrations Order:**
1. `001_scout_dashboard_schema.sql` - Base tables, roles
2. `051_scout_transactions_canonical.sql` - Canonical model + views
3. `052_scout_seed_data.sql` - Demo data (18,000+ transactions)

**Verification:**
- [ ] All enums created
- [ ] regions table has 17 rows
- [ ] stores table has 250+ rows
- [ ] transactions table ready for inserts
- [ ] All views return data
- [ ] RLS policies active

### Phase 2: Seed Data Generation (Week 1-2)

**Objective:** Generate realistic Philippine retail data for all dashboard surfaces.

**Data Volumes:**
| Entity | Count | Notes |
|--------|-------|-------|
| Regions | 17 | NCR to BARMM |
| Stores | 250+ | Spread across 6-17 regions |
| Brands | 40-50 | Mix of categories |
| Products/SKUs | 300-400 | Realistic FMCG items |
| Customers | 10,000 | Demographic variety |
| Transactions | 18,000+ | 365-day window |

**Distribution Requirements:**
- **Category Split:** Beverages 35%, Snacks 25%, Tobacco 15%, Household 12%, Personal Care 8%, Others 5%
- **Region Split:** NCR 35%, CALABARZON 20%, Central Luzon 15%, Others 30%
- **Time Distribution:** Morning 25%, Afternoon 35%, Evening 30%, Night 10%
- **Income Split:** Middle 58%, High 25%, Low 17%
- **Urban/Rural:** Urban 71%, Rural 29%

**Seed Script Location:**
`scripts/seed_scout_demo_data.sql` or `tools/seed_scout_demo_data.ts`

### Phase 3: Backend API Completion (Week 2)

**Objective:** Implement all required API endpoints.

**New Endpoints to Create:**

```typescript
// /api/trends - Transaction trends with filters
GET /api/trends?period=daily&start=2025-01-01&end=2025-12-31

// /api/filters/options - Dynamic filter values
GET /api/filters/options
Response: { brands: [], categories: [], regions: [], stores: [] }

// /api/export/csv - Data export
POST /api/export/csv
Body: { view: 'transactions', filters: {...} }

// /api/ai/insights - Suqi AI recommendations
POST /api/ai/insights
Body: { context: 'dashboard', currentFilters: {...} }
```

**Enhance Existing:**
- `/api/nlq` - Add more patterns, improve chart type detection
- `/api/dq/summary` - Add trend calculations
- `/api/health` - Add component-level health checks

### Phase 4: Frontend Feature Completion (Week 2-3)

**Objective:** Build out remaining dashboard pages and features.

**New Pages to Create:**

| Page | Route | Priority | Complexity |
|------|-------|----------|------------|
| Transaction Trends | `/trends` | High | Medium |
| Product Mix & SKU | `/product-mix` | High | Medium |
| Consumer Behavior | `/behavior` | Medium | Medium |
| Consumer Profiling | `/profiling` | Medium | Medium |
| Competitive Analysis | `/competitive` | Medium | High |
| Data Dictionary | `/dictionary` | Low | Low |
| Data Sources | `/data-sources` | Low | Low |
| Settings | `/settings` | Low | Low |

**Page Templates:**

```tsx
// Template for new dashboard pages
export default function TrendsPage() {
  const { data, loading, error } = useTxTrends();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  if (error) return <ErrorState message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Transaction Trends" />
      <FilterControls filters={filters} onChange={setFilters} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? <LoadingState /> : (
          <div className="grid gap-6">
            <KPICards data={data} />
            <TabContainer tabs={['Volume', 'Revenue', 'Basket Size', 'Duration']}>
              <TrendsChart data={data} metric="volume" />
              <TrendsChart data={data} metric="revenue" />
              <TrendsChart data={data} metric="basket_size" />
              <TrendsChart data={data} metric="duration" />
            </TabContainer>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Phase 5: Integration & Testing (Week 3)

**Objective:** Wire everything together and ensure quality.

**Integration Tasks:**
1. Connect all pages to live data hooks
2. Implement cross-page filter persistence
3. Add real-time update subscriptions
4. Implement error boundaries
5. Add loading skeletons

**Testing Strategy:**
| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit | Jest | Data hooks, utilities |
| Component | React Testing Library | Critical components |
| E2E | Playwright | Happy paths |
| Visual | Chromatic (optional) | UI regression |

**E2E Test Scenarios:**
```typescript
// tests/e2e/smoke.spec.ts
test('Dashboard home loads with KPIs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-testid="kpi-transactions"]')).toBeVisible();
  await expect(page.locator('[data-testid="kpi-revenue"]')).toBeVisible();
});

test('NLQ query returns chart', async ({ page }) => {
  await page.goto('/nlq');
  await page.fill('[data-testid="nlq-input"]', 'sales by day');
  await page.click('[data-testid="nlq-submit"]');
  await expect(page.locator('[data-testid="chart-container"]')).toBeVisible();
});

test('Geography map renders regions', async ({ page }) => {
  await page.goto('/geography');
  await expect(page.locator('.mapboxgl-canvas')).toBeVisible();
});
```

### Phase 6: Deployment & Go-Live (Week 4)

**Objective:** Production deployment with full verification.

**Pre-Deployment Checklist:**
- [ ] All migrations applied to production Supabase
- [ ] Seed data loaded (or production data connected)
- [ ] Environment variables configured in Vercel
- [ ] `NEXT_PUBLIC_STRICT_DATASOURCE=true` set
- [ ] RLS policies verified
- [ ] Performance baseline established

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
2. Execute NLQ queries and verify responses
3. Test filter interactions
4. Verify map loads with region data
5. Check data health dashboard accuracy
6. Mobile responsiveness check

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase connection failure | High | Graceful degradation, cached data |
| Large dataset performance | Medium | Materialized views, pagination |
| NLQ pattern mismatch | Medium | Fallback queries, user feedback |
| Map tile loading | Low | Mapbox CDN, offline fallback |
| RLS policy bypass | High | Regular audit, penetration testing |

---

## Performance Optimization

### Database Level
- Indexes on frequently filtered columns (timestamp, region_code, brand_name)
- Materialized views for heavy aggregations
- Connection pooling via Supabase

### Application Level
- React.memo for expensive components
- useMemo/useCallback for derived data
- Lazy loading for route code splitting
- Image optimization via Next.js

### Network Level
- Edge caching for static assets
- API response caching (SWR pattern)
- Compression enabled

---

## Monitoring & Observability

### Metrics to Track
- Page load times (Core Web Vitals)
- API response times (p50, p95, p99)
- Error rates by endpoint
- Active users (daily/weekly)
- NLQ query success rate

### Alerting
- Error rate > 1% for 5 minutes
- p95 latency > 3 seconds
- Database connection failures
- Supabase quota warnings

---

*Plan Version: 1.0.0*
*Created: 2025-12-07*
