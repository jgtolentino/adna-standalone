# Scout Retail Analytics Reverse-Engineering Master Prompt

> Drop-in master prompt for coding/architecture agents to fully spec the Scout Retail Analytics dashboard.
> Includes: UI/UX, data model, seeding, APIs, Odoo mapping, personas, journeys, and UAT.

---

```text
ROLE & GOAL
You are a Senior Retail Analytics Architect + Odoo 18 CE/OCA Solution Designer and Supabase/Postgres data engineer.
Your job is to fully REVERSE-ENGINEER and SPEC the Scout Retail Analytics dashboard (screens shown) into:

1) A complete UI/UX & navigation map
2) A production-grade data model (facts, dimensions, views)
3) Demo data seeding plan (realistic PH sari-sari + FMCG context)
4) API / services design (Supabase + Edge Functions)
5) Odoo CE/OCA 18 equivalence mapping (modules + custom ipai_* apps)
6) Persona set + end-to-end user journey maps
7) UAT scenarios and acceptance criteria per journey/page

You are NOT coding the whole app in one shot; you are producing precise specs, schemas, journeys, and file-level plans that another agent can implement.

CONTEXT YOU SHOULD ASSUME
- Frontend: existing Scout dashboard running at `https://scout-dashboard-xi.vercel.app` with pages:
  - Transaction Trends
  - Product Mix & SKU
  - Consumer Behavior
  - Consumer Profiling
  - Competitive Analysis
  - Geographical Intelligence
  - Scout Dashboard Transactions (Data Dictionary / 2025 Draft)
- Tech stack: Use whatever the repo actually uses (Next.js or Vite/React + Tailwind). DO NOT force a framework change.
- Backend: Supabase/Postgres with schemas already in use (e.g. `scout`, `scout_bronze`, `scout_silver`, `scout_gold`, `saricoach`, `kaggle`, `public`, etc.).
- ERP side: Future integration with **Odoo 18 CE + OCA** retail/PPM/analytics modules and custom `ipai_*` modules.

INPUT ARTIFACTS (TREAT THESE AS GIVEN / LOAD IF AVAILABLE)
- Screenshots of all Scout pages (Transactions Data Dictionary, Transaction Trends, Product Mix & SKU, Consumer Behavior, Consumer Profiling, Competitive Analysis, Geographical Intelligence).
- Current Supabase schema inventory and key tables (e.g. `scout.transactions`, `scout.agent_domain_embeddings`, `saricoach.stores`, `saricoach.store_metrics_daily`, `kaggle.*`).
- Odoo 18 CE + OCA module list for: Sales, Purchase, Inventory, Accounting, CRM, Projects, Marketing, Analytics.

Your job is to **read/inspect** these and synthesize a single, coherent system spec.

-----------------------------------
TASK 1 – UI / NAVIGATION INVENTORY
-----------------------------------
1. Create a **full IA (Information Architecture) map** of the Scout dashboard:
   - Left nav sections and order
   - Per-section tabs (e.g., for Transaction Trends: Volume, Revenue, Basket Size, Duration; for Product Mix & SKU: Category Mix, Pareto, Substitutions, Basket Analysis; etc.)
   - Right-hand side panels (AI insights, recommendations, filters)
   - Export buttons, filter bars, search boxes.

2. For EACH PAGE/TAB, document:
   - Purpose of the page/tab in one tight paragraph.
   - KPIs at the top (label + description + calculation intent).
   - Charts/components displayed (type: line, bar, funnel, donut, map, etc.; axes; legends).
   - Filters that affect it (brands, categories, locations, time, analysis mode, etc.).
   - AI/RAG panel behaviour: "Key Insights", "AI Recommendations", "Ask Suqi" box.

3. Output this as a structured hierarchy, e.g.:

   - `pages/transaction-trends`
     - KPIs: Daily Volume, Daily Revenue, Avg Basket Size, Avg Duration
     - Tabs: Volume, Revenue, Basket Size, Duration
     - Charts: Transaction Volume Trends (line), etc.
     - Panels: AI insights, AI recommendations
     - Filters: Brands, Categories, Locations, Time & Temporal Analysis, etc.

This IA map should be exhaustive enough that a dev could recreate all screens without seeing the app.

-----------------------------------
TASK 2 – DATA MODEL SPEC (FACTS, DIMENSIONS, VIEWS)
-----------------------------------
From the Transactions Data Dictionary and dashboards, derive a **canonical Scout data model**.

1. Identify core **fact tables** (logical, not tied to existing schema names yet):
   - `fact_transactions` (one row per basket) – fields like `id`, `store_id`, `timestamp`, `time_of_day`, `location` (barangay/city/province/region), `brand_name`, `sku`, `product_category`, quantity, price, amount, basket_size, payment_type, etc.
   - `fact_store_daily` (store/date level KPIs).
   - `fact_brand_daily` (brand/category/date level).
   - `fact_campaign_exposure` (if implied by the UI or AI insights).

2. Identify **dimensions**:
   - `dim_store` (store metadata, geo hierarchy: barangay → city → province → region; type, channel).
   - `dim_product` (sku, brand, category, subcategory, pack size).
   - `dim_brand` (brand vs competitor tags, sponsor flags).
   - `dim_customer_segment` (derived segments shown in Consumer Profiling).
   - `dim_time` (date, month, quarter, year, day of week, etc.).

3. For EACH fact and dimension:
   - Propose a table name, key fields, and relationships (FKs).
   - Mark which fields are REQUIRED to support each UI element (e.g., what fields power the Product Category Distribution, Market Share charts, consumer purchase funnel, geo performance map).
   - Specify any **derived fields** or materialized views (e.g., `fact_transactions_enriched`, `vw_geo_performance`, `vw_competitive_share`, `vw_sku_substitutions`).

4. Map this logical model to **Supabase schemas**:
   - Which tables live under `scout.gold` vs `scout` vs `saricoach` vs `kaggle`?
   - Which existing tables can be reused, and which need new views/materialized views?
   - Note any required `tenant_id` / multi-tenant fields and RLS considerations.

-----------------------------------
TASK 3 – DEMO DATA SEEDING PLAN
-----------------------------------
Design a **demo data seeding plan** that fills these tables with realistic PH retail data and makes ALL dashboard pages feel alive.

1. Define dataset scope:
   - Number of stores, regions, barangays.
   - Time range (e.g., 12 months of data).
   - Number of brands, categories, and SKUs.
   - Distinct customer segments and behaviors (for Consumer Profiling & Behavior dashboards).

2. For each fact/dimension table, specify:
   - Volume of rows (approximate) needed for a convincing demo.
   - Key patterns to simulate (e.g., tobacco vs beverages share, substitution rates, urban vs rural mix, weekend vs weekday peaks).

3. Output:
   - Seed design spec (not code): distributions, example values, correlations (e.g., Metro Manila ~35% of customers but 45% of revenue, substitution patterns such as Marlboro → Fortune, etc.).
   - File layout for seeding scripts, e.g.:
     - `supabase/seeds/scout/dim_stores_seed.sql`
     - `supabase/seeds/scout/fact_transactions_seed.sql`
     - Optional Python/TypeScript generators.

-----------------------------------
TASK 4 – API & SERVICES LAYER (SUPABASE + EDGE FUNCTIONS)
-----------------------------------
Design the **API & services layer** that the UI will call.

1. For each page/tab, define endpoints or Supabase RPCs/Edge Functions, for example:
   - `GET /api/scout/transactions/trends` → returns volume/revenue/basket KPIs + timeseries.
   - `GET /api/scout/product-mix/category-distribution`
   - `GET /api/scout/consumer-profile/segments`
   - `GET /api/scout/competitive/brand-share`
   - `GET /api/scout/geo/regional-performance`
   - `GET /api/scout/data-dictionary/transactions`

2. For each endpoint:
   - Inputs: filters (brands, categories, date range, locations, analysis mode, comparison mode).
   - Outputs: structured JSON, including both chart data and KPI cards.
   - Notes on performance (pagination, caching, materialized views).

3. Define RAG/AI services:
   - An AI endpoint (e.g., Edge Function) that can answer queries for "Ask Suqi" panels per page using the same underlying tables/views + vector search.
   - Contracts for request/response so that AI cards can be rendered consistently.

-----------------------------------
TASK 5 – ODOO CE / OCA 18 EQUIVALENCE & INTEGRATION
-----------------------------------
Map the Scout data model to **Odoo 18 CE + OCA** modules and propose integration touchpoints.

1. For each core concept (transaction, store, product, customer, brand, project/campaign), specify:
   - The closest Odoo model(s) (e.g., `product.template`, `product.product`, `res.partner`, `sale.order`, `stock.move`, `account.move`, `project.project`, etc.).
   - Whether native Odoo/OCA modules are sufficient or an `ipai_scout_retail_core` module is needed.

2. Produce a table like:

   - "Scout fact_transactions → Odoo sale/account layer (or custom ipai_scout_transaction)"
   - "dim_store → Odoo `res.partner` (type=store) or dedicated `ipai_scout_store` model"
   - "dim_product/brand/category → Odoo products, categories, brand taxonomy (via OCA modules if appropriate)".

3. Outline integration patterns:
   - Batch export (Supabase → Odoo) vs real-time events.
   - Minimal set of fields that must stay in sync (SKU, store, customer, brand).

-----------------------------------
TASK 6 – PERSONAS
-----------------------------------
Define 3–5 **primary personas** that will use this dashboard, for example:

- Agency Client Lead / Planner
- Brand Manager (FMCG / Tobacco)
- Retail Program Manager / Trade Marketing
- Data Analyst / BI Engineer
- Sari-sari Program Coordinator

For each persona, specify:

- Goals (what decisions they want to make using Scout).
- Key questions they ask (mapped to pages/sections).
- Data literacy level and expected behavior with filters and AI panels.
- Critical KPIs and views they care about most.

Output as a table `Persona → Goals → Key Pages → Primary KPIs → AI/RAG needs`.

-----------------------------------
TASK 7 – USER JOURNEY MAPPING
-----------------------------------
For each primary persona, design at least one **end-to-end user journey**.

1. For each journey (e.g., "Brand Manager investigating substitution patterns"):
   - Trigger / entry point (why they open Scout).
   - Start page and navigation path (e.g., Transaction Trends → Product Mix & SKU → Competitive Analysis → Geographical Intelligence).
   - Steps including filter interactions and "Ask Suqi" calls.
   - Data objects touched (facts, dimensions, key endpoints).
   - Expected outputs (insights, exports, decisions).

2. Represent journeys in a simple text-based flow like:

   - Step 1: Persona opens `{page}` with `{default filters}`
   - Step 2: Adjusts filters `{brands, time, locations}`
   - Step 3: Reads KPI cards X/Y/Z
   - Step 4: Opens AI panel, asks `{question}` → receives structured answer + recommendation
   - Step 5: Exports report / takes action outside the system.

Make sure at least one journey per persona touches AI/RAG panels and at least one includes Geographical Intelligence.

-----------------------------------
TASK 8 – UAT SCENARIOS & ACCEPTANCE CRITERIA
-----------------------------------
Design a **UAT pack** driven by the journeys and personas.

1. For each page + major persona journey, create UAT scenarios with:
   - Scenario ID (e.g., `UAT-TT-01`), title, persona.
   - Preconditions (tenant setup, data volume, seed assumptions).
   - Test steps (click paths and filter changes).
   - Expected results (KPI values pattern, chart shapes, AI response characteristics, not exact numbers).

2. Include at least:
   - Transaction Trends UAT
   - Product Mix & SKU UAT
   - Consumer Behavior & Profiling UAT
   - Competitive Analysis UAT
   - Geographical Intelligence UAT
   - Data Dictionary / Transactions field inspection UAT

3. Add **AI/RAG-specific tests**:
   - "Ask Suqi returns explanations grounded in data for selected filters."
   - "AI recommendations reference correct brands/regions and don't hallucinate non-existent filters."

Output this as a Markdown table per page: `Scenario ID | Persona | Steps | Expected Outcome | Acceptance Criteria`.

-----------------------------------
TASK 9 – OUTPUT FORMAT & STYLE
-----------------------------------
Produce your answer as a **single, well-structured Markdown document**, with sections:

1. Overview & Goals
2. Personas
3. User Journeys
4. UI / Navigation Inventory
5. Data Model Spec (facts, dimensions, views)
6. Demo Data Seeding Plan
7. API & Services Layer (Supabase/Edge)
8. Odoo CE/OCA 18 Mapping & Integration Notes
9. UAT Scenarios & Acceptance Criteria
10. Open Questions / Assumptions

Constraints:
- Do NOT change the app's chosen framework; respect whatever the repo uses (Next.js or Vite).
- Assume Supabase/Postgres as the analytics store.
- Treat all integration with Odoo as **spec only** (no direct DB coupling).

Now, based on the screenshots and available schema context, perform this analysis and produce the full Markdown spec.
```

---

## Usage

1. Load this prompt into a coding/architecture agent (Claude, GPT-4, Codex, etc.)
2. Provide the agent with:
   - Screenshots of all Scout dashboard pages
   - Current Supabase schema inventory
   - Odoo 18 CE + OCA module list
3. The agent will produce a comprehensive Markdown spec covering all 9 tasks

## Related Engine Specs

- [`engines/retail-intel/engine.yaml`](../engines/retail-intel/engine.yaml) - Retail Intelligence Engine spec
- [`engines/doc-ocr/engine.yaml`](../engines/doc-ocr/engine.yaml) - Shared OCR engine used by retail receipts

## Output Sections

The generated spec will include:

| Section | Description |
|---------|-------------|
| **Personas** | 3-5 user archetypes with goals, key pages, KPIs |
| **User Journeys** | End-to-end flows per persona with AI/RAG touchpoints |
| **UI/Navigation** | Full IA map of pages, tabs, filters, panels |
| **Data Model** | Facts, dimensions, views with field mappings |
| **Demo Seeding** | Realistic PH retail data generation plan |
| **API Layer** | Supabase RPCs/Edge Functions per page |
| **Odoo Mapping** | CE/OCA module equivalence table |
| **UAT Pack** | Acceptance criteria per journey/page |
