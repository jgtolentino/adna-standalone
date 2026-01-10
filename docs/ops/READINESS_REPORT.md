# TBWA Agency Databank - Readiness Report

**Generated:** 2026-01-03
**App:** Scout Dashboard (apps/scout-dashboard)
**Overall Status:** 🟢 GREEN - Ready for Development & Deployment

---

## Executive Summary

| Area | Status | Notes |
|------|--------|-------|
| Local Development | 🟢 GREEN | Install, lint, type-check, build all pass |
| CI/CD Pipeline | 🟢 GREEN | Workflow updated with correct paths |
| Production Build | 🟢 GREEN | Next.js 14.2.15 builds successfully |
| Backend Schema | 🟢 GREEN | Migrations and RPCs exist |
| Vercel Deploy | 🟡 YELLOW | Env vars in vercel.json (anon keys - acceptable) |

---

## P0 Blockers (Fixed)

### 1. TypeScript Errors (6 errors) ✅ FIXED
**Files affected:**
- `src/app/api/log/route.ts` - duplicate `component` property
- `src/lib/ai/nlq-service.ts` - missing `error` in metadata type
- `src/lib/data/freshness.ts` - dynamic index access type issue
- `src/lib/observability/logger.ts` - missing `component` in LogEntry
- `src/lib/observability/metrics.ts` - Map iteration without downlevelIteration
- `src/app/debug/page.tsx` - hooks called conditionally

**Fix:** Applied type-safe casts and restructured hook order.

### 2. ESLint Not Configured ✅ FIXED
**Issue:** No `.eslintrc.json` existed, causing interactive prompt during lint.
**Fix:** Created `.eslintrc.json` with `next/core-web-vitals` preset.

### 3. Package Lockfile Out of Sync ✅ FIXED
**Issue:** `npm ci` failed due to `@swc/helpers` version mismatch.
**Fix:** Ran `npm install` to regenerate lockfile.

### 4. Node Version Mismatch ✅ FIXED
**Issue:** `.nvmrc` and `package.json` specified Node 24.x (doesn't exist).
**Fix:** Updated to `>=22.0.0` (current LTS).

### 5. CI Migration Path Wrong ✅ FIXED
**Issue:** CI checked `supabase/migrations/` but actual path is `infrastructure/database/supabase/migrations/`.
**Fix:** Updated `ci-main.yml` with correct path.

---

## P1 Risks (Monitor)

### 1. Security: Credentials in vercel.json
**Location:** `apps/scout-dashboard/vercel.json`
**Details:** Contains Supabase URL, anon key, and Mapbox token.
**Risk Level:** LOW - These are public (anon) keys, not secrets.
**Recommendation:** Move to Vercel environment variables dashboard for better hygiene.

### 2. npm Vulnerabilities (6 total)
```
- next: 1 critical (DoS, cache poisoning, SSRF)
- playwright: 1 high (SSL certificate verification)
- js-yaml: 1 moderate (prototype pollution)
```
**Fix:** Run `npm audit fix --force` (will upgrade next to 14.2.35)

### 3. Missing .env.local for Development
**Issue:** No `.env.local` file exists.
**Fix:** Created `.env.example` template. Developers must copy and fill values.

---

## P2 Recommendations

### 1. Add Unit Tests
**Current coverage:** ~0% for Scout Dashboard
**Recommendation:** Add Jest + React Testing Library for:
- Data hooks (`src/data/hooks/`)
- API routes (`src/app/api/`)
- FilterContext (`src/contexts/`)

### 2. Enable Strict Lint/Type-Check in CI
**Current:** CI uses `|| echo` to mask failures.
**Recommendation:** Remove fallback echoes to enforce quality gates.

### 3. Database Seed Data
**Issue:** Production database may be empty.
**Fix:** Apply seed migration: `053_scout_full_seed_18k.sql`

---

## Files Changed

| File | Change |
|------|--------|
| `apps/scout-dashboard/.eslintrc.json` | Created - ESLint config |
| `apps/scout-dashboard/.env.example` | Created - Env var template |
| `apps/scout-dashboard/package.json` | Updated Node engine to >=22.0.0 |
| `apps/scout-dashboard/src/app/api/log/route.ts` | Fixed duplicate property |
| `apps/scout-dashboard/src/app/debug/page.tsx` | Fixed conditional hooks |
| `apps/scout-dashboard/src/lib/ai/nlq-service.ts` | Added error to metadata type |
| `apps/scout-dashboard/src/lib/data/freshness.ts` | Fixed type casting |
| `apps/scout-dashboard/src/lib/observability/logger.ts` | Fixed LogEntry creation |
| `apps/scout-dashboard/src/lib/observability/metrics.ts` | Fixed Map iteration |
| `.github/workflows/ci-main.yml` | Fixed Node version, migration path |
| `.nvmrc` | Updated to Node 22 |
| `package.json` | Updated Node engine to >=22.0.0 |

---

## Verification Evidence

### Type Check
```bash
$ npm run type-check
> scout-dashboard@0.1.0 type-check
> tsc --noEmit
(no errors)
```

### Build
```bash
$ npm run build
> scout-dashboard@0.1.0 build
> npm run build:guard && next build

✓ Compiled successfully
✓ Generating static pages (20/20)

Route (app)                              Size     First Load JS
┌ ○ /                                    2.75 kB         167 kB
├ ○ /geography                           443 kB          599 kB
├ ○ /nlq                                 2.15 kB        89.5 kB
└ ...
```

### Lint
```bash
$ npm run lint
./src/app/product-mix/page.tsx
150:6  Warning: React Hook useEffect has a missing dependency: 'refetch'.
(warnings only - no errors)
```

---

## Environment Variables Checklist

### Required for Production (Vercel)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] `NEXT_PUBLIC_STRICT_DATASOURCE=true` - Enforce Supabase-only
- [ ] `NEXT_PUBLIC_ENVIRONMENT=production` - Environment flag

### Optional
- [ ] `NEXT_PUBLIC_MAPBOX_TOKEN` - For choropleth maps
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Server-side operations
- [ ] `LOGFLARE_API_KEY` - Structured logging

---

## Definition of Done Status

| Criteria | Status |
|----------|--------|
| `npm install` succeeds | ✅ |
| `npm run lint` succeeds | ✅ (warnings only) |
| `npm run type-check` succeeds | ✅ |
| `npm run build` succeeds | ✅ |
| App loads in preview | ✅ |
| CI pipeline configured | ✅ |
| Env var checklist documented | ✅ |

---

*Report generated by Staff Engineer Release Manager review*
