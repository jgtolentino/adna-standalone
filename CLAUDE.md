# CLAUDE.md - AI Assistant Guide for TBWA Agency Databank

This document provides comprehensive guidance for AI assistants working with the TBWA Unified Platform (Neural DataBank) codebase.

## Project Overview

**TBWA Unified Platform** is a comprehensive data intelligence system for the TBWA Philippines advertising agency. It combines multiple platforms:

- **Scout Dashboard** - Philippine retail analytics with AI-powered insights
- **CES JamPacked** - Creative operations and document extraction platform
- **Lions Palette Forge** - Campaign palette generation (integration planned)

### Core Architecture

- **Database**: PostgreSQL via Supabase with Medallion Lakehouse architecture (Bronze, Silver, Gold layers)
- **MCP Services**: Centralized Reader on port 8888, Writer services per schema
- **Frontend**: Next.js 14 (Scout Dashboard), Vite + React (CES JamPacked)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Language**: TypeScript (strict mode enabled)

## Repository Structure

```
tbwa-agency-databank/
├── apps/
│   └── scout-dashboard/          # Main analytics dashboard (Next.js 14)
│       ├── src/
│       │   ├── app/              # Next.js App Router pages
│       │   ├── components/       # React components
│       │   ├── contexts/         # React contexts (FilterContext)
│       │   ├── data/hooks/       # Data fetching hooks
│       │   ├── lib/              # Utilities (supabaseClient, env, utils)
│       │   ├── services/         # API services (datasource.ts)
│       │   └── types/            # TypeScript type definitions
│       ├── public/               # Static assets, GeoJSON
│       └── scripts/              # Build scripts (guard-no-csv.mjs)
├── platforms/
│   └── creative-ops/
│       └── ces-jampacked/        # Creative ops platform (Vite + React)
├── infrastructure/
│   ├── database/supabase/migrations/  # SQL migrations (001-053+)
│   ├── mcp-services/             # MCP gateway services
│   ├── scripts/                  # DevOps scripts
│   └── service/                  # Python backend services
├── .github/workflows/            # CI/CD pipelines
└── agents.yaml                   # AI agent registry
```

## Scout Dashboard (Primary App)

### Tech Stack
- **Framework**: Next.js 14.2.15 with App Router
- **Database Client**: @supabase/supabase-js ^2.39.7
- **Charts**: Recharts ^2.12.2
- **Maps**: Mapbox GL, react-map-gl 8.1.0, d3-geo
- **Styling**: Tailwind CSS ^3.3.0, tailwind-merge
- **Validation**: Zod ^3.22.4
- **Icons**: Lucide React ^0.344.0

### Key Pages
| Route | Purpose |
|-------|---------|
| `/` | Home with KPI cards and navigation |
| `/trends` | Transaction trends over time |
| `/product-mix` | Product category analysis |
| `/geography` | Philippines choropleth map |
| `/nlq` | Natural Language Query interface |
| `/data-health` | Data quality monitoring |

### Development Commands

```bash
# Navigate to scout-dashboard
cd apps/scout-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run type-check

# Lint
npm run lint

# Production build (includes CSV guard)
npm run build

# Vercel-specific build
npm run build:vercel
```

### Environment Variables

Required for Scout Dashboard (set in `.env.local` or Vercel):

```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Feature Flags
NEXT_PUBLIC_STRICT_DATASOURCE=true  # Enforces Supabase-only data
NEXT_PUBLIC_USE_MOCK=0              # Disable mock data in production
NEXT_PUBLIC_ENVIRONMENT=production

# Maps (Optional)
NEXT_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### Deployment

- **Platform**: Vercel
- **Production Domain**: `scout-dashboard-*.vercel.app`
- **Region**: IAD1 (US East)
- **Node Version**: 24.x (specified in `.nvmrc` and `package.json`)

## Database Schema

### Scout Schema (`scout.*`)

The dashboard uses PostgreSQL views in the `scout` schema:

| View | Purpose |
|------|---------|
| `scout_stats_summary` | KPI summary for dashboard home |
| `scout_gold_transactions_flat` | Flattened transaction data |
| `v_tx_trends` | Daily transaction trends |
| `v_product_mix` | Product category breakdown |
| `v_geo_regions` | Regional performance metrics |
| `v_consumer_profile` | Consumer demographics |
| `v_brand_performance` | Brand-level analytics |

### Canonical Types (from `src/types/scout.ts`)

```typescript
// Core enums
type Daypart = 'morning' | 'afternoon' | 'evening' | 'night';
type PaymentMethod = 'cash' | 'gcash' | 'maya' | 'card' | 'other';
type IncomeBand = 'low' | 'middle' | 'high' | 'unknown';
type UrbanRural = 'urban' | 'rural' | 'unknown';
type FunnelStage = 'visit' | 'browse' | 'request' | 'accept' | 'purchase';

// Key interfaces: ScoutTransaction, KPISummary, ScoutFilters, etc.
```

## Key Patterns & Conventions

### 1. Supabase Client Usage

```typescript
// Always use the singleton client from lib/supabaseClient.ts
import { getSupabase, isSupabaseConfigured } from '@/lib/supabaseClient';

const supabase = getSupabase();
const { data, error } = await supabase.from('view_name').select('*');
```

### 2. Data Hooks Pattern

Data fetching hooks are in `src/data/hooks/`:

```typescript
// Hook returns: { data, loading, error, refetch }
const { data: kpi, loading, error } = useKPISummary();
```

### 3. Filter Context

Global filters are managed via `FilterContext`:

```typescript
import { useGlobalFilters } from '@/contexts/FilterContext';

const { filters, setFilters, resetFilters, isFiltersActive } = useGlobalFilters();
```

### 4. API Routes

API routes follow Next.js App Router conventions:

```typescript
// src/app/api/kpis/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('scout_stats_summary').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
```

### 5. Path Aliases

Use `@/*` for imports from `src/`:

```typescript
import { cn } from '@/lib/utils';
import { KPISummary } from '@/types/scout';
```

## Build Guards & Production Safety

### CSV Guard Script

The build enforces no CSV dependencies in production (`scripts/guard-no-csv.mjs`):

- Blocks `loadCsvDevOnly()` calls
- Blocks `.csv` file imports
- Blocks `papaparse` usage
- Triggered by `NEXT_PUBLIC_STRICT_DATASOURCE=true`

### Strict Datasource Mode

When `NEXT_PUBLIC_STRICT_DATASOURCE=true`:
- All data must come from Supabase
- CSV fallbacks are disabled
- Build fails if CSV references are found

## CI/CD Workflows

### Main CI Pipeline (`.github/workflows/ci-main.yml`)

Runs on push/PR to `main`:

1. **Frontend Check**: Lint, type-check, build Scout Dashboard
2. **Backend Check**: Python syntax validation
3. **Migration Check**: SQL syntax and dangerous operation scanning
4. **Docs Check**: Markdown validation

### Environment

```yaml
NODE_VERSION: '20'
PYTHON_VERSION: '3.11'
```

## AI Agents

Defined in `agents.yaml`:

| Agent | Purpose |
|-------|---------|
| RetailBot | Conversational retail analytics queries |
| AdsBot | Advertising performance insights |
| Aladdin Insights | Executive summaries, anomaly detection |
| SQL Certifier | Governance - validates SQL queries |

## Styling Guidelines

### Tailwind Theme

Brand colors defined in `tailwind.config.ts`:

```typescript
colors: {
  brand: {
    primary: '#1E40AF',    // Blue
    secondary: '#7C3AED',  // Purple
    accent: '#F59E0B',     // Amber
    success: '#10B981',    // Green
    warning: '#F59E0B',    // Amber
    error: '#EF4444',      // Red
    info: '#3B82F6',       // Blue
  }
}
```

### Component Patterns

- Use `cn()` utility for conditional classes
- Lucide React for icons
- shadcn/ui components in `components/ui/`

## Common Tasks

### Adding a New Dashboard Page

1. Create page in `src/app/[route]/page.tsx`
2. Add to navigation in `src/components/Navigation.tsx`
3. Create data hook in `src/data/hooks/`
4. Add corresponding view/API if needed

### Adding a New Supabase View

1. Create migration in `infrastructure/database/supabase/migrations/`
2. Add TypeScript types in `src/types/scout.ts`
3. Create service function in `src/services/datasource.ts`
4. Create hook in `src/data/hooks/`

### Running Database Migrations

```bash
# Via psql
psql $DATABASE_URL -f infrastructure/database/supabase/migrations/XXX_migration.sql

# Or via Supabase dashboard
```

## Important Notes for AI Assistants

1. **Always read files before editing** - Understand existing patterns first
2. **Use TypeScript strict mode** - All types must be properly defined
3. **Prefer Supabase over CSV** - No CSV in production builds
4. **Follow existing patterns** - Check similar files for conventions
5. **Keep changes minimal** - Don't over-engineer or add unnecessary features
6. **Test locally first** - Run `npm run build` before committing
7. **Node 24.x required** - Check `.nvmrc` for version
8. **Philippine market focus** - Data is specific to PH regions/provinces

## Useful Commands Reference

```bash
# Root level
npm run dev:scout          # Start Scout Dashboard
npm run build:scout        # Build Scout Dashboard
npm run validate:docs      # Validate documentation

# In apps/scout-dashboard
npm run dev               # Development server (port 3000)
npm run build             # Production build with guards
npm run type-check        # TypeScript validation
npm run lint              # ESLint
```

## External Resources

- **Vercel Dashboard**: Project deployed to Vercel
- **Supabase Project**: PostgreSQL + Edge Functions
- **Mapbox**: For choropleth map visualization

---

*Last updated: December 2024*
