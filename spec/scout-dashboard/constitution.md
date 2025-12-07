# Scout Dashboard Constitution

## Product Identity

**Name:** Scout XI Dashboard
**Tagline:** Philippine Retail Intelligence Platform
**Owner:** TBWA Enterprise Platform
**Vercel Project:** `scout-dashboard`

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

### 2. Security & Access Control
- **Row-Level Security (RLS)** is mandatory on all tables
- Four distinct user roles with appropriate data access:
  - `executive` - Full access to all data
  - `regional_manager` - Region-scoped access
  - `analyst` - Full read access
  - `store_owner` - Store-scoped access only
- NLQ queries restricted to **whitelisted Gold/Platinum views** only
- Never expose raw transaction data without aggregation

### 3. TBWA Brand Standards
- Dashboard follows TBWA Philippines visual identity
- "Suqi" is the AI assistant persona integrated into insights
- Color palette: Blue (#3B82F6), Purple accents, professional neutrals
- Typography: System fonts with clear hierarchy

### 4. Philippine Context
- Currency: Philippine Peso (PHP / ₱)
- Geographic hierarchy: Barangay → City → Province → Region → Island Group
- 17 administrative regions (NCR to BARMM)
- Time zones: Philippine Standard Time (PST, UTC+8)
- Date formats: `DD/MM/YYYY` or ISO 8601

### 5. Performance Standards
- Initial page load: < 3 seconds
- Filter application: < 500ms
- Chart rendering: < 1 second
- Map interactions: 60fps target
- Auto-refresh intervals: 30s (health), 5min (KPIs)

---

## Technology Principles

### Stack Choices (Locked)
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | **Next.js 24** (App Router) | Server-side capabilities, file-based routing |
| Database | **Supabase (PostgreSQL)** | Real-time subscriptions, RLS, managed hosting |
| Charting | **Recharts** | React-native, composable, performant |
| Maps | **Mapbox GL JS** | High-quality Philippine geography support |
| Styling | **Tailwind CSS** | Design system alignment, utility-first |
| AI/NLQ | **Pattern-matching + Supabase RPC** | Safe, deterministic queries |

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
│  │                    GOLD VIEWS                           │  │
│  │  v_tx_trends | v_product_mix | v_consumer_profile |    │  │
│  │  v_competitive_analysis | v_geo_regions | v_kpi_summary│  │
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
- No `any` types in component props
- Error boundaries required on all route pages

### Data Quality
- All views must handle NULL values gracefully
- Percentage calculations must use `NULLIF` to avoid division by zero
- Growth rate calculations require minimum 7 days of comparison data
- Data freshness indicators required on all live dashboards

### Deployment
- Vercel-first deployment (scout-dashboard project)
- Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRICT_DATASOURCE=true` in production builds
- No CSV fallback data in production

### API Contracts
- All API routes return `{ success: boolean, data?: T, error?: string }`
- NLQ endpoint: POST `/api/nlq` with `{ query: string, limit?: number }`
- KPI endpoint: GET `/api/kpis`
- Health endpoint: GET `/api/health`
- DQ Summary: GET `/api/dq/summary`

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

### Additive Changes
The following can be added without PRD review:
- New Gold views for additional charts
- New filter options (within existing filter types)
- UI component enhancements
- Performance optimizations

---

*Last Updated: 2025-12-07*
*Version: 1.0.0*
