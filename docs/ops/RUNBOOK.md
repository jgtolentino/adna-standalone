# TBWA Agency Databank - Operations Runbook

**App:** Scout Dashboard
**Framework:** Next.js 14.2.15
**Deploy Target:** Vercel
**Database:** Supabase (PostgreSQL)

---

## 1. Local Development Setup

### Prerequisites
- Node.js >= 22.0.0 (LTS)
- npm >= 9.0.0
- Git

### Quick Start
```bash
# Clone repository
git clone https://github.com/jgtolentino/tbwa-agency-databank.git
cd tbwa-agency-databank

# Install dependencies (from root - uses npm workspaces)
npm install

# Navigate to Scout Dashboard
cd apps/scout-dashboard

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start development server
npm run dev

# Open http://localhost:3000
```

### Available Scripts
```bash
# Development
npm run dev          # Start dev server (hot reload)

# Quality Checks
npm run lint         # ESLint check
npm run type-check   # TypeScript validation

# Build
npm run build        # Production build with CSV guard
npm run build:vercel # Build with STRICT_DATASOURCE=true

# Production
npm run start        # Start production server (requires build first)
```

---

## 2. CI Pipeline

### Workflow: `.github/workflows/ci-main.yml`

**Triggers:**
- Push to `main` branch
- Pull requests to `main` branch

**Jobs:**
1. **frontend-verification** - Lint, type-check, build Scout Dashboard
2. **backend-verification** - Python syntax check
3. **migration-check** - SQL validation
4. **docs-check** - README validation

### Running CI Locally
```bash
# Simulate CI environment
export CI=true
export SKIP_ENV_VALIDATION=true
export NEXT_PUBLIC_SUPABASE_URL=https://mock.supabase.co
export NEXT_PUBLIC_SUPABASE_ANON_KEY=mock-key

cd apps/scout-dashboard
npm ci
npm run lint
npm run type-check
npm run build
```

---

## 3. Vercel Deployment

### Environment Variables (Set in Vercel Dashboard)

**Required:**
| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | `eyJhbG...` |
| `NEXT_PUBLIC_STRICT_DATASOURCE` | Enforce Supabase data | `true` |
| `NEXT_PUBLIC_ENVIRONMENT` | Environment name | `production` |

**Optional:**
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token for maps |
| `NEXT_PUBLIC_USE_MOCK` | Enable mock data (set to `0` in prod) |

### Deployment Verification
```bash
# After deploy, verify these endpoints:
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/kpis

# Expected: JSON response with data or health status
```

### Root Directory Configuration
- **Framework:** Next.js
- **Root Directory:** `apps/scout-dashboard`
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

---

## 4. Supabase Database

### Migration Location
```
infrastructure/database/supabase/migrations/
```

### Key Migrations
| Migration | Purpose |
|-----------|---------|
| `001_scout_dashboard_schema.sql` | Core tables, RBAC, RLS |
| `033_gold_flat_effective.sql` | Dashboard views |
| `051_scout_transactions_canonical.sql` | Scout schema with enums |
| `052_scout_seed_data.sql` | Sample seed data |
| `053_scout_full_seed_18k.sql` | Full 18k transaction seed |
| `20250918050001_dashboard_compatibility_package_fixed.sql` | RPCs |

### Apply Migrations
```bash
# Option 1: Via psql
psql $DATABASE_URL -f infrastructure/database/supabase/migrations/051_scout_transactions_canonical.sql

# Option 2: Via Supabase Dashboard
# Go to SQL Editor > New Query > Paste migration content > Run
```

### Seed Database
```bash
# Apply the full seed (18k transactions)
psql $DATABASE_URL -f infrastructure/database/supabase/migrations/053_scout_full_seed_18k.sql
```

### Verify Schema
```sql
-- Check scout schema exists
SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'scout';

-- Check key views exist
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name LIKE 'scout%';

-- Check RPC functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'scout'
AND routine_type = 'FUNCTION';
```

---

## 5. Troubleshooting

### Build Failures

**Issue: "CSV references not allowed"**
```
❌ CSV references not allowed in production builds
```
**Fix:** Remove any `.csv` imports, `papaparse` usage, or `loadCsvDevOnly()` calls.

**Issue: ESLint rule not found**
```
Error: Definition for rule '@typescript-eslint/no-explicit-any' was not found.
```
**Fix:** Don't use `// eslint-disable-next-line @typescript-eslint/*` comments without the plugin.

**Issue: Dynamic server usage errors**
```
Route /api/export/trends couldn't be rendered statically
```
**Note:** This is expected - API routes using `searchParams` are dynamic.

### Runtime Errors

**Issue: Supabase not configured**
```
Error: Supabase not configured
```
**Fix:** Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables.

**Issue: fetch failed (DNS)**
```
getaddrinfo EAI_AGAIN placeholder.supabase.co
```
**Fix:** Replace placeholder values with real Supabase credentials.

### Database Issues

**Issue: Empty dashboard data**
```sql
-- Check if data exists
SELECT COUNT(*) FROM scout.transactions;
SELECT COUNT(*) FROM public.scout_gold_transactions_flat;
```
**Fix:** Apply seed migration `053_scout_full_seed_18k.sql`.

**Issue: Permission denied**
```
permission denied for schema scout
```
**Fix:** Grant permissions or check RLS policies:
```sql
GRANT USAGE ON SCHEMA scout TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA scout TO anon, authenticated;
```

---

## 6. Monitoring

### Health Check Endpoint
```bash
curl https://your-app.vercel.app/api/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-03T...",
  "database": "connected",
  "version": "0.1.0"
}
```

### Key Metrics Endpoint
```bash
curl https://your-app.vercel.app/api/metrics
```

### Logs
- **Vercel:** Dashboard > Functions > Logs
- **Supabase:** Dashboard > Logs > Postgres / API

---

## 7. Rollback Procedures

### Vercel
1. Go to Vercel Dashboard > Deployments
2. Find previous successful deployment
3. Click "..." > "Promote to Production"

### Database
```sql
-- Create backup before changes
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

-- Rollback migration (if reversible)
-- Apply inverse SQL statements manually
```

---

## 8. Contact & Escalation

| Role | Contact |
|------|---------|
| Project Owner | TBWA Philippines |
| Repository | github.com/jgtolentino/tbwa-agency-databank |
| Vercel Project | scout-dashboard |
| Supabase Project | ublqmilcjtpnflofprkr |

---

*Last updated: 2026-01-03*
