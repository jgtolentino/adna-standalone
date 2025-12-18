# Scout Dashboard Constitution

## Product Identity

**Name:** Suqi Analytics - Scout Dashboard
**Tagline:** Philippine Retail Intelligence Platform
**Owner:** TBWA Enterprise Platform
**Vercel Project:** `scout-dashboard`
**Deployment URL:** https://scout-dashboard-xi.vercel.app/
**Supabase Project:** `spdtwktxdalcfigzeqrz` (superset)
**Version:** 2.0.0

---

## CRITICAL BLOCKER: Database State

| Component | Status | Details |
|-----------|--------|---------|
| Schema | ✅ Complete | 29 scout.* tables exist (bronze, silver, gold, views) |
| Data | 🔴 **EMPTY** | scout_bronze_transactions: 0 rows; scout_silver_transactions: 0 rows |
| Views | ✅ Exist | Prepared but returning empty result sets (no source data) |
| Functions | ✅ Ready | 26 edge functions in Supabase |
| Frontend | ✅ Live | Running on Vercel (displays mock data until seeded) |

**BLOCKER:** Dashboard displays hardcoded mock data because database is unpopulated.
**ACTION REQUIRED:** Run `053_scout_full_seed_18k.sql` before production launch.

---

## Core Purpose

Scout Dashboard is a real-time retail intelligence platform that transforms point-of-sale transaction data from Philippine sari-sari stores, mini-marts, and retail outlets into actionable business insights. It serves as the primary analytics interface for TBWA Philippines clients to understand market dynamics, consumer behavior, and competitive positioning.

---

## Non-Negotiables

### 1. Data Sovereignty
- **Odoo CE/OCA 18 is the system of record** for finance, jobs, clients, and brands
- Supabase `scout.*` schema serves as the **read-only analytics layer** (Bronze/Silver/Gold medallion architecture)
- All transaction data originates from Odoo and flows through ETL pipelines
- No direct writes to production data from the dashboard
- **Zero mock data in production** - Every metric must fetch from Supabase views

### 2. Data Integrity
- **Zero Mock Data in Prod:** Every metric fetches from Supabase views. No hard-coded arrays in shipped code.
- **RLS Enforcement:** All queries filtered by workspace_id + user permissions (once auth is live).
- **Audit Trail:** Every export, filter change, and data access logged with timestamp + user ID.
- All views must handle NULL values gracefully
- Percentage calculations must use `NULLIF` to avoid division by zero
- Growth rate calculations require minimum 7 days of comparison data
- Data freshness indicators required on all live dashboards

### 3. Security & Access Control
- **Row-Level Security (RLS)** is mandatory on all tables
- Four distinct user roles with appropriate data access:
  - `executive` - Full access to all data
  - `regional_manager` - Region-scoped access
  - `analyst` - Full read access, export privileges
  - `store_owner` - Store-scoped access only
- NLQ queries restricted to **whitelisted Gold/Platinum views** only
- Never expose raw transaction data without aggregation
- JWT-based authentication with workspace isolation (planned)
- HTTPS only - All traffic encrypted in transit
- Secrets in .env.local or Vercel Secrets (never in code)

### 4. TBWA Brand Standards
- Dashboard follows TBWA Philippines visual identity
- "Suqi" is the AI assistant persona integrated into insights
- Color palette: Blue (#3B82F6), Gold (#F59E0B), Purple accents, professional neutrals
- Typography: Inter font family with clear hierarchy
- KPI trend indicators: Green for positive, Red for negative

### 5. Philippine Context
- Currency: Philippine Peso (PHP / ₱)
- Geographic hierarchy: Barangay → City/Municipality → Province → Region → Island Group
- 17 administrative regions (NCR to BARMM)
- Time zones: Philippine Standard Time (PST, UTC+8)
- Date formats: `YYYY-MM-DD` (ISO 8601) for data, `DD/MM/YYYY` for display

### 6. Performance Standards
- Initial page load: < 3 seconds
- API Response (P95): ≤ 500ms for single-page queries
- Chart Render: ≤ 200ms after data arrives
- Filter application: < 500ms
- Export Latency: ≤ 2s for CSV, ≤ 5s for XLSX (up to 10K rows)
- Map interactions: 60fps target
- Auto-refresh intervals: 30s (health), 5min (KPIs)
- Bundle Size: < 500KB JS + 150KB CSS (gzip)

---

## Technology Principles

### Stack Choices (Locked)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 14.2.15** (App Router) | Server-side capabilities, file-based routing |
| Runtime | **Node.js 24.x** | Vercel compatibility, modern features |
| Database | **Supabase (PostgreSQL)** | Real-time subscriptions, RLS, managed hosting |
| Charting | **Recharts** | React-native, composable, performant |
| Maps | **Mapbox GL JS 3.x** | High-quality Philippine geography support |
| Styling | **Tailwind CSS** | Design system alignment, utility-first |
| AI/NLQ | **Pattern-matching + Supabase RPC** | Safe, deterministic queries |
| Type System | **TypeScript (strict mode)** | Type safety, better DX |

### Schema Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         PUBLIC SCHEMA                         │
│  (auth, profiles, dashboard_configs, user_dashboards)        │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         SCOUT SCHEMA                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │   regions   │  │   stores    │  │    transactions      │  │
│  │  (17 PH)    │  │  (250+)     │  │  (canonical grain)   │  │
│  └─────────────┘  └─────────────┘  └──────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    BRONZE/SILVER/GOLD                   │  │
│  │  scout_bronze_transactions → scout_silver_transactions  │  │
│  │  → scout_gold_* (pre-aggregated metrics)               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    GOLD VIEWS (11)                      │  │
│  │  v_tx_trends | v_product_mix | v_brand_performance |    │  │
│  │  v_consumer_profile | v_consumer_age_distribution |     │  │
│  │  v_competitive_analysis | v_geo_regions | v_kpi_summary│  │
│  │  v_funnel_metrics | v_daypart_analysis | v_payment_*   │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────┐
│                         DQ SCHEMA                             │
│  (v_data_health_summary, v_data_health_issues,               │
│   v_etl_activity_stream)                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Governance Rules

### Code Quality
- TypeScript strict mode enabled
- All data hooks must be typed with `UseScoutDataResult<T>`
- No `any` types in component props (without justification)
- Error boundaries required on all route pages
- All async operations have error handlers
- Loading + error + empty states implemented on all pages

### Data Quality
- All views must handle NULL values gracefully
- Percentage calculations must use `NULLIF` to avoid division by zero
- Growth rate calculations require minimum 7 days of comparison data
- Data freshness indicators required on all live dashboards

### Deployment
- Vercel-first deployment (scout-dashboard project)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_MAPBOX_TOKEN`
- `NEXT_PUBLIC_STRICT_DATASOURCE=true` in production builds
- No CSV fallback data in production
- Build command: `npm run build:vercel`

### API Contracts
- All API routes return `{ success: boolean, data?: T, error?: string }`
- NLQ endpoint: POST `/api/nlq` with `{ query: string, limit?: number }`
- KPI endpoint: GET `/api/kpis`
- Health endpoint: GET `/api/health`
- DQ Summary: GET `/api/dq/summary`
- Export endpoints: POST `/api/export/{trends,product-mix,geography}`

---

## Definition of Done (Per Feature)

1. ✅ Feature coded in feature branch
2. ✅ Zero console warnings/errors
3. ✅ TypeScript strict mode passes (`npm run type-check`)
4. ✅ Unit tests written + passing (jest)
5. ✅ Integration test with Supabase (verified data returns)
6. ✅ Playwright smoke test for happy path
7. ✅ Error case tested (network failure, empty data, invalid filters)
8. ✅ Code review approved
9. ✅ Deployed to staging (vercel preview)
10. ✅ QA sign-off
11. ✅ Merged to main + deployed to production

---

## Code Review Checklist

- [ ] No mock data leaked to production
- [ ] All data from Supabase (no localStorage, sessionStorage as source of truth)
- [ ] Error messages are user-friendly, not stack traces
- [ ] Loading states present (skeleton loaders or spinners, no "loading..." text alone)
- [ ] Accessibility: keyboard nav (Tab/Enter/Escape) + screen reader labels (ARIA)
- [ ] Bundle size didn't increase > 10%
- [ ] API calls cached appropriately (SWR TTL set or reasoning provided)
- [ ] Secrets not in diff (env vars, API keys, tokens)
- [ ] Console is clean (no warnings, no debug logs in production)

---

## Integration Requirements

### Suqi AI Integration
- NLQ queries processed through pattern-matching engine
- Fallback to whitelisted view queries on pattern miss
- Chart type auto-detected from query keywords
- Response includes `executedSql` for transparency

### Odoo Source Mapping
Every Scout fact/dimension maps back to Odoo CE/OCA 18:
- `scout.transactions` ← `account.move.line`, `pos.order`, `pos.order.line`
- `scout.stores` ← `res.partner` (type=store)
- `scout.products` ← `product.template`, `product.product`
- `scout.brands` ← `product.brand` (OCA module)
- `scout.customers` ← `res.partner` (type=customer)

---

## Change Management

### Breaking Changes
Changes to the following require PRD review:
- `scout.transactions` table schema
- RLS policy modifications
- User role definitions
- API route contracts
- Filter context structure

### Additive Changes
The following can be added without PRD review:
- New Gold views for additional charts
- New filter options (within existing filter types)
- UI component enhancements
- Performance optimizations

---

## When to Escalate

- 🚨 Database unavailable > 5min → Page on-call immediately
- 🚨 Console errors in prod → Create P1 bug ticket
- 🚨 Performance regression > 50% → Investigate CDN/Vercel config
- 🚨 >10% error rate in Sentry → Stop deploys, investigate
- ⚠️ RLS policy broken (queries failing) → Disable RLS, investigate
- ⚠️ Export > 10min to generate → Add pagination, alert team

---

## Accessibility Requirements (WCAG 2.1 AA)

- All interactive elements keyboard-navigable
- Color contrast ≥ 4.5:1
- Screen readers: aria-labels on buttons, icons, KPI cards
- Error messages: Clear, descriptive, not color-only
- Focus indicators visible on all interactive elements

---

*Last Updated: 2025-12-18*
*Version: 1.0.0*
