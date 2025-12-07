# Scout Dashboard - Product Requirements Document

## Executive Summary

Scout Dashboard is a comprehensive retail intelligence platform for the Philippine market. It transforms point-of-sale transaction data into actionable insights through interactive visualizations, AI-powered natural language queries, and geographic intelligence maps.

---

## Problem Statement

TBWA Philippines clients need a unified platform to:
1. Monitor retail transaction performance across Philippine regions
2. Understand consumer behavior and demographic patterns
3. Analyze competitive brand positioning and market share
4. Make data-driven decisions about product placement and marketing
5. Access insights through natural language without SQL knowledge

**Current Gaps:**
- Data scattered across multiple Odoo instances
- Manual Excel-based reporting with 48-72 hour latency
- No real-time visibility into regional performance
- Limited consumer profiling capabilities
- No AI-assisted insight generation

---

## Goals & Success Metrics

### Primary Goals
| Goal | Success Metric | Target |
|------|---------------|--------|
| Real-time visibility | Data freshness | < 1 hour latency |
| Self-service analytics | NLQ query success rate | > 85% |
| Regional coverage | Geographic completeness | All 17 PH regions |
| User adoption | Weekly active users | 100+ within 90 days |
| Decision impact | Report exports/week | 50+ |

### Secondary Goals
- Reduce manual reporting effort by 80%
- Enable mobile-responsive access for field teams
- Integrate with TBWA Suqi AI ecosystem

---

## User Personas

### 1. Executive / Managing Director
**Profile:** C-suite at TBWA client companies
**Goals:** High-level KPIs, portfolio health, competitive landscape
**Key Journeys:**
- Check weekly revenue performance by region
- Monitor brand portfolio market share trends
- Review executive summary before board meetings

**Required Views:**
- Dashboard home with KPI cards
- Geographical Intelligence map
- Competitive Analysis summary

### 2. Brand Manager / Account Lead
**Profile:** Mid-level marketing/brand management
**Goals:** Brand performance, campaign effectiveness, regional focus
**Key Journeys:**
- Analyze why brand share dropped in specific region
- Compare promotional periods vs baseline
- Identify top-performing store clusters

**Required Views:**
- Transaction Trends with brand filter
- Product Mix & SKU analytics
- Consumer Profiling demographics

### 3. Data / Strategy Analyst
**Profile:** Analytics team member
**Goals:** Deep data exploration, custom queries, report generation
**Key Journeys:**
- Build custom analysis using NLQ
- Export data for further modeling
- Validate data quality before presentations

**Required Views:**
- AI Query Interface (NLQ)
- Data Health Dashboard
- All pages with advanced filters

### 4. Field / Store Stakeholder
**Profile:** Regional managers, store operators
**Goals:** Local performance, inventory signals, customer patterns
**Key Journeys:**
- Check store-level daily performance
- Understand local customer demographics
- Identify underperforming SKUs

**Required Views:**
- Store-filtered dashboard
- Consumer Behavior patterns
- Product Mix at store level

---

## Phase 1: UI & Routes Inventory

### Current Application Stack
- **Framework:** Next.js 24 (App Router)
- **Routing:** File-based (`src/app/**/page.tsx`)
- **State:** React hooks with Supabase real-time
- **Styling:** Tailwind CSS

### Route Map

| Section | Route | Layout Zone | Component File | Description |
|---------|-------|-------------|----------------|-------------|
| Dashboard Home | `/` | main-content | `src/app/page.tsx` | KPI overview, navigation cards |
| AI Query | `/nlq` | main-content | `src/app/nlq/page.tsx` | Natural language query interface |
| Geography | `/geography` | main-content | `src/app/geography/page.tsx` | Philippines choropleth map |
| Data Health | `/data-health` | main-content | `src/app/data-health/page.tsx` | ETL monitoring, DQ metrics |
| Data Sources | `/data-sources` | main-content | (planned) | Connection status, source info |
| Settings | `/settings` | main-content | (planned) | User preferences, notifications |
| Debug | `/debug` | main-content | `src/app/debug/page.tsx` | Development diagnostics |

### Navigation Structure
```
Navigation (src/components/Navigation.tsx)
├── Dashboard (/)
├── AI Query (/nlq)
├── Data Health (/data-health)
├── Data Sources (/data-sources)
└── Settings (/settings)
```

### Component Inventory

| Component | File | Charts Used | Filters | Export |
|-----------|------|-------------|---------|--------|
| KPICard | `src/app/page.tsx` (inline) | None | None | No |
| NavigationCard | `src/app/page.tsx` (inline) | None | None | No |
| NLQChart | `src/components/databank/NLQChart.tsx` | Bar, Line, Pie, Area, Scatter | Query-driven | No |
| PhilippinesChoropleth | `src/components/geography/PhilippinesChoropleth.tsx` | Mapbox GL | Revenue, Transactions, Customers, Growth | No |
| FilterControls | `src/components/databank/FilterControls.tsx` | None | Date, Location, Category, Brand | No |
| ConsumerProfilingChart | `src/components/databank/ConsumerProfilingChart.tsx` | Custom bars, circles | Demographics tabs | No |
| ComparativeAnalytics | `src/components/databank/ComparativeAnalytics.tsx` | None | None | No |
| HealthBadge | `src/components/HealthBadge.tsx` | None | None | No |

### Planned Routes (from original Scout design)

| Section | Route | Tabs | Status |
|---------|-------|------|--------|
| Transaction Trends | `/trends` | Volume, Revenue, Basket Size, Duration | Planned |
| Product Mix & SKU | `/product-mix` | Category Mix, Pareto, Substitutions, Basket Analysis | Planned |
| Consumer Behavior | `/behavior` | Purchase Funnel, Request Methods, Acceptance Rates | Planned |
| Consumer Profiling | `/profiling` | Demographics, Age & Gender, Location, Segments | Planned |
| Competitive Analysis | `/competitive` | Market Share, Brand Comparison, Category Share | Planned |
| Data Dictionary | `/dictionary` | Schema Explorer, Field Definitions | Planned |

---

## Phase 2: User Journeys

### Journey 1: Executive Weekly Performance Check
**Persona:** Executive / Managing Director
**Goal:** Understand weekly business health in 5 minutes

```
START: Dashboard Home (/)
  │
  ├─→ View KPI cards (Total Transactions, Revenue, Stores, Customers)
  │   └─ Data: scout.v_kpi_summary
  │
  ├─→ Check Today vs Yesterday trends
  │   └─ Compare: today_tx_count vs yesterday_tx_count
  │
  ├─→ Click "Geographical Intelligence" card
  │   └─ Navigate: /geography
  │
  ├─→ View Philippines choropleth (Revenue metric)
  │   └─ Data: scout.v_geo_regions
  │
  ├─→ Click NCR region for details
  │   └─ View: Store count, revenue, transactions, growth rate
  │
  └─→ Switch metric to "Growth %"
      └─ Identify fastest-growing regions

SUCCESS METRIC: Time to insight < 5 minutes
```

### Journey 2: Brand Manager Diagnostic Analysis
**Persona:** Brand Manager / Account Lead
**Goal:** Diagnose why brand share dropped in specific region

```
START: Dashboard Home (/)
  │
  ├─→ Navigate: /nlq (AI Query Interface)
  │
  ├─→ Enter query: "Brand performance analysis"
  │   └─ API: POST /api/nlq
  │
  ├─→ View bar chart of top brands by revenue
  │   └─ Chart: Recharts BarChart
  │
  ├─→ Refine: "Compare transactions by store"
  │   └─ See store-level breakdown
  │
  ├─→ Navigate: /geography
  │
  ├─→ Filter by region (if filters exist)
  │   └─ Compare NCR vs CALABARZON
  │
  └─→ Export findings (future: CSV/PDF)

SUCCESS METRIC: Root cause identified within 15 minutes
```

### Journey 3: Analyst Custom Data Exploration
**Persona:** Data / Strategy Analyst
**Goal:** Build custom analysis for client presentation

```
START: AI Query Interface (/nlq)
  │
  ├─→ Click suggestion: "Show sales by day"
  │   └─ Auto-executes query
  │
  ├─→ View line chart with 30-day trend
  │   └─ Data: scout.v_tx_trends
  │
  ├─→ Enter custom: "Category breakdown"
  │   └─ See pie chart of product categories
  │
  ├─→ Enter: "Daypart analysis"
  │   └─ See time-of-day transaction patterns
  │
  ├─→ Navigate: /data-health
  │
  ├─→ Verify data quality grade: "EXCELLENT"
  │   └─ Data: dq.v_data_health_summary
  │
  └─→ Confirm no critical issues before presentation

SUCCESS METRIC: Data validated and query completed in 20 minutes
```

### Journey 4: Operations Data Quality Check
**Persona:** Data / Strategy Analyst
**Goal:** Monitor ETL health and data quality

```
START: Data Health Dashboard (/data-health)
  │
  ├─→ View overall grade card
  │   └─ Data: v_data_health_summary.overall_grade
  │
  ├─→ Check quality scores (Timestamps, Stores, Amounts)
  │   └─ Green = 95%+, Yellow = 80-95%, Red = <80%
  │
  ├─→ Review Data Sources breakdown
  │   └─ Azure, PS2, Edge record counts
  │
  ├─→ Scan Data Quality Issues table
  │   └─ Data: v_data_health_issues (sorted by severity)
  │
  ├─→ Review ETL Activity Stream
  │   └─ Data: v_etl_activity_stream
  │
  └─→ Click Refresh to get latest status

SUCCESS METRIC: Quality assessment completed in 3 minutes
```

---

## Phase 3: Data Models & Odoo/OCA Mapping

### Dimensional Model Overview

```
                        ┌──────────────────┐
                        │   dim_time       │
                        │  (date, daypart) │
                        └────────┬─────────┘
                                 │
┌──────────────┐    ┌────────────┴────────────┐    ┌──────────────┐
│  dim_store   │────│     fact_transaction    │────│  dim_brand   │
│  (stores)    │    │   (canonical grain)     │    │  (brands)    │
└──────────────┘    └────────────┬────────────┘    └──────────────┘
                                 │
┌──────────────┐                 │                  ┌──────────────┐
│ dim_location │─────────────────┼──────────────────│ dim_customer │
│ (geo hier.)  │                 │                  │ (profiles)   │
└──────────────┘                 │                  └──────────────┘
                        ┌────────┴─────────┐
                        │   dim_product    │
                        │  (SKU, category) │
                        └──────────────────┘
```

### Fact Tables

#### fact_transaction (`scout.transactions`)
**Grain:** One row per transaction line item
**Primary Key:** `id` (UUID)

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| id | uuid | Primary key | `a1b2c3d4-...` |
| store_id | uuid | FK to scout.stores | |
| timestamp | timestamptz | Transaction time (UTC) | `2025-12-07 14:30:00+08` |
| time_of_day | enum | Daypart | `afternoon` |
| region_code | text | Region code (denorm) | `NCR` |
| province | text | Province (denorm) | `Metro Manila` |
| city | text | City (denorm) | `Makati` |
| barangay | text | Barangay (denorm) | `Poblacion` |
| brand_name | text | Brand | `Lucky Me` |
| sku | text | Stock Keeping Unit | `LM-PANCIT-55G` |
| product_category | text | Category | `Snacks` |
| product_subcategory | text | Subcategory | `Instant Noodles` |
| our_brand | boolean | TBWA client brand | `true` |
| tbwa_client_brand | boolean | JTI/client flag | `true` |
| quantity | integer | Units purchased | `2` |
| unit_price | numeric(12,2) | Price per unit | `15.00` |
| gross_amount | numeric(12,2) | Before discount | `30.00` |
| discount_amount | numeric(12,2) | Discount applied | `0.00` |
| net_amount | numeric(12,2) | Final amount (computed) | `30.00` |
| payment_method | enum | Payment type | `gcash` |
| customer_id | text | Customer identifier | `CUST-12345` |
| age | integer | Customer age | `32` |
| gender | text | Customer gender | `F` |
| income | enum | Income band | `middle` |
| urban_rural | enum | Location type | `urban` |
| funnel_stage | enum | Purchase funnel | `purchase` |
| basket_size | integer | Items in basket | `4` |
| repeated_customer | boolean | Repeat purchase | `true` |
| created_at | timestamptz | Record created | |

### Dimension Tables

#### dim_store (`scout.stores`)
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| store_code | text | Store identifier |
| store_name | text | Store name |
| region_code | text | FK to scout.regions |
| province | text | Province |
| city | text | City |
| barangay | text | Barangay |
| latitude | numeric(10,6) | Geo coordinate |
| longitude | numeric(10,6) | Geo coordinate |
| is_active | boolean | Active flag |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### dim_region (`scout.regions`)
| Column | Type | Description |
|--------|------|-------------|
| region_code | text | Primary key (e.g., `NCR`, `REGION_I`) |
| region_name | text | Full name |
| region_type | text | Administrative type |
| created_at | timestamptz | |

### Enums

```sql
scout.daypart: 'morning' | 'afternoon' | 'evening' | 'night'
scout.payment_method: 'cash' | 'gcash' | 'maya' | 'card' | 'other'
scout.income_band: 'low' | 'middle' | 'high' | 'unknown'
scout.urban_rural: 'urban' | 'rural' | 'unknown'
scout.funnel_stage: 'visit' | 'browse' | 'request' | 'accept' | 'purchase'
```

### Gold Views (Analytics Layer)

| View | Purpose | Powers |
|------|---------|--------|
| `scout.v_tx_trends` | Daily transaction trends | Transaction Trends page |
| `scout.v_product_mix` | Category distribution | Product Mix page |
| `scout.v_brand_performance` | Brand-level metrics | Brand comparison |
| `scout.v_consumer_profile` | Demographic breakdown | Consumer Profiling |
| `scout.v_consumer_age_distribution` | Age brackets | Age/Gender charts |
| `scout.v_competitive_analysis` | Market share | Competitive Analysis |
| `scout.v_geo_regions` | Regional metrics | Choropleth map |
| `scout.v_funnel_analysis` | Purchase funnel | Consumer Behavior |
| `scout.v_daypart_analysis` | Time-of-day patterns | Daypart charts |
| `scout.v_payment_methods` | Payment distribution | Payment analysis |
| `scout.v_store_performance` | Store-level metrics | Store ranking |
| `scout.v_kpi_summary` | Executive KPIs | Dashboard home |

### Odoo CE/OCA 18 Mapping

| Scout Entity | Odoo Model | OCA Module | Notes |
|--------------|-----------|------------|-------|
| `scout.transactions` | `pos.order.line` | `pos_*` | POS order lines |
| `scout.transactions.net_amount` | `pos.order.amount_total` | | Computed |
| `scout.stores` | `res.partner` | `l10n_ph` | type='store' |
| `scout.stores.region_code` | `res.partner.state_id.code` | `l10n_ph` | Philippines localization |
| `scout.products` | `product.product` | `product_brand` | Product variant |
| `scout.products.brand_name` | `product.template.brand_id` | `product_brand` | OCA brand module |
| `scout.products.category` | `product.category` | | Hierarchy |
| `scout.customers` | `res.partner` | | type='customer' |
| `scout.customers.income` | `res.partner.x_income_band` | Custom | ipai_* delta module |

### Bronze/Silver/Gold Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│ BRONZE (Raw Replicas)                                               │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐ │
│ │ bronze.pos_order│ │bronze.pos_line  │ │bronze.res_partner       │ │
│ │ (raw Odoo)      │ │(raw Odoo)       │ │(raw Odoo)               │ │
│ └─────────────────┘ └─────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ SILVER (Cleaned, Normalized)                                        │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ silver.sales_interactions                                       │ │
│ │ - canonical_tx_id generated                                     │ │
│ │ - effective_ts normalized                                       │ │
│ │ - store_id mapped                                               │ │
│ │ - amount calculated                                             │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│ GOLD (Analytics Ready)                                              │
│ ┌────────────────┐ ┌────────────────┐ ┌────────────────────────┐   │
│ │scout.transactions│ │scout.v_tx_trends│ │scout.v_geo_regions    │   │
│ │(fact table)     │ │(materialized)  │ │(real-time view)       │   │
│ └────────────────┘ └────────────────┘ └────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 4: API & Integration Surface

### Current API Endpoints

| Endpoint | Method | Input | Output | Used By |
|----------|--------|-------|--------|---------|
| `/api/nlq` | POST | `{ query: string, limit?: number }` | `{ success, data[], chartConfig, executedSql }` | NLQChart |
| `/api/nlq` | GET | None | `{ suggestions[], patterns[] }` | NLQChart suggestions |
| `/api/kpis` | GET | None | `{ data: scout_stats_summary[] }` | (legacy) |
| `/api/health` | GET | None | `{ status, lastCheck, activeIssues, detail }` | HealthBadge |
| `/api/dq/summary` | GET | None | `{ summary, issues[], activity[], timestamp }` | Data Health page |
| `/api/enriched` | GET | None | `{ data[] }` | (legacy enriched data) |

### Data Hooks

| Hook | Return Type | Source View |
|------|-------------|-------------|
| `useKPISummary()` | `KPISummary` | `scout.v_kpi_summary` |
| `useTxTrends()` | `TxTrendsRow[]` | `scout.v_tx_trends` |
| `useProductMix()` | `ProductMixRow[]` | `scout.v_product_mix` |
| `useBrandPerformance(limit)` | `BrandPerformanceRow[]` | `scout.v_brand_performance` |
| `useConsumerProfile()` | `ConsumerProfileRow[]` | `scout.v_consumer_profile` |
| `useAgeDistribution()` | `AgeDistributionRow[]` | `scout.v_consumer_age_distribution` |
| `useCompetitiveAnalysis(limit)` | `CompetitiveRow[]` | `scout.v_competitive_analysis` |
| `useGeoRegions()` | `GeoRegionRow[]` | `scout.v_geo_regions` |
| `useRegionMetrics()` | `Record<string, RegionMetric>` | `scout.v_geo_regions` / `gold_region_metrics` |
| `useFunnelAnalysis()` | `FunnelRow[]` | `scout.v_funnel_analysis` |
| `useDaypartAnalysis()` | `DaypartRow[]` | `scout.v_daypart_analysis` |
| `usePaymentMethods()` | `PaymentMethodRow[]` | `scout.v_payment_methods` |
| `useStorePerformance(limit)` | `StorePerformanceRow[]` | `scout.v_store_performance` |
| `useFilteredTransactions(filters)` | `any[]` | `scout.transactions` |
| `useRealtimeScoutData(view)` | `T[]` | Any scout view + subscriptions |

### NLQ Pattern Mapping

| Natural Language Pattern | SQL Query | Chart Type |
|-------------------------|-----------|------------|
| "sales by day" | Daily SUM(amount), COUNT(*) | Line |
| "transactions by store" | GROUP BY store_name | Bar |
| "brand performance" | GROUP BY brand, ORDER BY revenue | Bar |
| "category breakdown" | GROUP BY category | Pie |
| "daypart analysis" | GROUP BY daypart | Bar |

### Missing APIs (Required for Full Feature Set)

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/export/csv` | POST | Export filtered data as CSV | High |
| `/api/export/pdf` | POST | Generate PDF report | Medium |
| `/api/filters/options` | GET | Dynamic filter values | High |
| `/api/ai/insights` | POST | Suqi AI recommendations | Medium |
| `/api/trends/compare` | GET | Period-over-period | High |

---

## Phase 5: Success Metrics

### Technical Metrics
- [ ] All 17 Philippine regions visible on choropleth
- [ ] NLQ responds to 5+ predefined patterns
- [ ] Data health grade displays correctly
- [ ] KPI cards populate from live data
- [ ] Page load < 3 seconds on 4G connection

### Business Metrics
- [ ] Users can identify top region by revenue in < 30 seconds
- [ ] Brand comparison available through NLQ
- [ ] Daily transaction volume trend visible
- [ ] Data freshness indicator shows last update time

### Quality Gates
- [ ] No console errors in production
- [ ] Mobile responsive on 375px width
- [ ] Graceful degradation when Supabase unavailable
- [ ] RLS policies prevent unauthorized data access

---

*Document Version: 1.0.0*
*Last Updated: 2025-12-07*
*Authors: TBWA Enterprise Platform*
