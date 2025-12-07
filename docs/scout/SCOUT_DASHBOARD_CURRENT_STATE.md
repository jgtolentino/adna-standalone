# Scout Dashboard - Current State

*Last Updated: 2025-12-07*

## Overview

This document captures the current implementation state of Scout Dashboard, aligned with the Spec Kit at `spec/scout-dashboard/`.

---

## Technology Stack (Verified)

| Layer | Technology | Version | Status |
|-------|-----------|---------|--------|
| Framework | Next.js | 14.2.15 | Active |
| Router | App Router | `src/app/` | Active |
| Database | Supabase PostgreSQL | Latest | Active |
| Schema | `scout.*` | 12 Gold Views | Active |
| Charts | Recharts | 2.12.x | Active |
| Maps | Mapbox GL JS | 3.16.x | Active |
| Styling | Tailwind CSS | 3.3.x | Active |
| Icons | Lucide React | 0.344.x | Active |

---

## Current Routes

| Route | File | Status | Description |
|-------|------|--------|-------------|
| `/` | `src/app/page.tsx` | Live | Dashboard Home with KPIs |
| `/nlq` | `src/app/nlq/page.tsx` | Live | AI Query Interface |
| `/geography` | `src/app/geography/page.tsx` | Live | Philippines Choropleth Map |
| `/data-health` | `src/app/data-health/page.tsx` | Live | Data Quality Monitoring |
| `/debug` | `src/app/debug/page.tsx` | Dev Only | Diagnostics |
| `/trends` | `src/app/trends/page.tsx` | **Live** | Transaction Trends |
| `/product-mix` | `src/app/product-mix/page.tsx` | **Live** | Product Mix & SKU |
| `/behavior` | - | Planned | Consumer Behavior |
| `/profiling` | - | Planned | Consumer Profiling |
| `/competitive` | - | Planned | Competitive Analysis |

---

## API Routes

| Endpoint | Method | File | Purpose |
|----------|--------|------|---------|
| `/api/nlq` | POST/GET | `src/app/api/nlq/route.ts` | Natural language queries |
| `/api/kpis` | GET | `src/app/api/kpis/route.ts` | KPI summary from `scout_stats_summary` |
| `/api/health` | GET | `src/app/api/health/route.ts` | System health check |
| `/api/dq/summary` | GET | `src/app/api/dq/summary/route.ts` | Data quality metrics |
| `/api/enriched` | GET | `src/app/api/enriched/route.ts` | Enriched transaction data |

---

## Data Hooks

| Hook | File | Source View | Used By |
|------|------|-------------|---------|
| `useKPISummary()` | `useScoutData.ts` | `scout.v_kpi_summary` | Dashboard Home |
| `useTxTrends()` | `useScoutData.ts` | `scout.v_tx_trends` | /trends |
| `useProductMix()` | `useScoutData.ts` | `scout.v_product_mix` | /product-mix |
| `useBrandPerformance()` | `useScoutData.ts` | `scout.v_brand_performance` | /product-mix, NLQ |
| `useConsumerProfile()` | `useScoutData.ts` | `scout.v_consumer_profile` | (Planned) /profiling |
| `useAgeDistribution()` | `useScoutData.ts` | `scout.v_consumer_age_distribution` | (Planned) /profiling |
| `useCompetitiveAnalysis()` | `useScoutData.ts` | `scout.v_competitive_analysis` | (Planned) /competitive |
| `useGeoRegions()` | `useScoutData.ts` | `scout.v_geo_regions` | /geography |
| `useRegionMetrics()` | `useRegionMetrics.ts` | `scout.v_geo_regions` | PhilippinesChoropleth |
| `useFunnelAnalysis()` | `useScoutData.ts` | `scout.v_funnel_analysis` | (Planned) /behavior |
| `useDaypartAnalysis()` | `useScoutData.ts` | `scout.v_daypart_analysis` | NLQ |
| `usePaymentMethods()` | `useScoutData.ts` | `scout.v_payment_methods` | NLQ |
| `useStorePerformance()` | `useScoutData.ts` | `scout.v_store_performance` | NLQ |
| `useFilteredTransactions()` | `useScoutData.ts` | `scout.transactions` | Advanced queries |
| `useGlobalFilters()` | `FilterContext.tsx` | URL state | All pages |

---

## Database Schema

### scout.* Tables
- `scout.regions` - 17 Philippine regions
- `scout.stores` - Retail outlet master (130 stores)
- `scout.transactions` - Canonical fact table (~18k transactions)

### scout.* Gold Views
1. `scout.v_tx_trends` - Daily transaction trends
2. `scout.v_product_mix` - Category distribution
3. `scout.v_brand_performance` - Brand metrics
4. `scout.v_consumer_profile` - Demographics
5. `scout.v_consumer_age_distribution` - Age brackets
6. `scout.v_competitive_analysis` - Market share
7. `scout.v_geo_regions` - Regional metrics
8. `scout.v_funnel_analysis` - Purchase funnel
9. `scout.v_daypart_analysis` - Time of day patterns
10. `scout.v_payment_methods` - Payment distribution
11. `scout.v_store_performance` - Store metrics
12. `scout.v_kpi_summary` - Executive KPIs

### dq.* Views (Data Quality)
- `dq.v_data_health_summary`
- `dq.v_data_health_issues`
- `dq.v_etl_activity_stream`

---

## Components

### Core Components
| Component | File | Purpose |
|-----------|------|---------|
| Navigation | `src/components/Navigation.tsx` | Top nav bar |
| Providers | `src/components/Providers.tsx` | Context providers wrapper |
| GlobalFilterBar | `src/components/GlobalFilterBar.tsx` | Global filter controls with URL sync |
| NLQChart | `src/components/databank/NLQChart.tsx` | NLQ query UI |
| PhilippinesChoropleth | `src/components/geography/PhilippinesChoropleth.tsx` | Map visualization |
| FilterControls | `src/components/databank/FilterControls.tsx` | Legacy filter dropdowns |
| ConsumerProfilingChart | `src/components/databank/ConsumerProfilingChart.tsx` | Demographics |
| ComparativeAnalytics | `src/components/databank/ComparativeAnalytics.tsx` | Comparative metrics |
| HealthBadge | `src/components/HealthBadge.tsx` | Health indicator |

### Context Providers
| Context | File | Purpose |
|---------|------|---------|
| FilterContext | `src/contexts/FilterContext.tsx` | Global filter state with URL persistence |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Yes | Mapbox access token |
| `NEXT_PUBLIC_STRICT_DATASOURCE` | Prod | Disable CSV fallback |

---

## Completed Items

### P0 - Critical (Done)
- [x] Generate demo seed data (~18,000 transactions) - `053_scout_full_seed_18k.sql`
- [x] Create Transaction Trends page (`/trends`)
- [x] Create Product Mix page (`/product-mix`)
- [x] Fix Next.js version (14.2.15)
- [x] Build passes successfully

### P1 - High (Done)
- [x] Implement global filter persistence (FilterContext with URL sync)
- [x] Add GlobalFilterBar component

---

## Remaining Items

### P1 - High
- [ ] Add stub pages for Behavior, Profiling, Competitive
- [ ] Integrate GlobalFilterBar into Trends and Product Mix pages
- [ ] Lay NLQ pattern foundations

### P2 - Medium
- [ ] Export functionality (CSV/Excel)
- [ ] Advanced filter combinations
- [ ] Date range custom picker

---

*Reference: spec/scout-dashboard/*
