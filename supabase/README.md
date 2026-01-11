# ⚠️ DEPRECATED: Schema Migrations Moved to odoo-ce

**DO NOT ADD NEW MIGRATIONS HERE**

## Canonical Source of Truth

As of January 11, 2026, this repository **NO LONGER** defines database schema or migrations.

**All schema changes must be made in:** `/Users/tbwa/odoo-ce/supabase/migrations/`

**Canonical Supabase Project:** `spdtwktxdalcfigzeqrz`

## Architecture

```
odoo-ce (SOURCE OF TRUTH)
├── Odoo 18 CE/OCA ERP Runtime
├── Supabase PostgreSQL Schema (migrations/)
└── Row-Level Security Policies

        ↓ (consumes via REST API)

tbwa-agency-databank (CONSUMER ONLY)
├── Vite Frontend (React)
├── Supabase Client (read/write data)
└── NO schema definitions
```

## Migration History

The following migrations in this directory are **DEPRECATED** and exist only for historical reference:

- `001_scout_dashboard_schema.sql` - MOVED to odoo-ce
- `20251208_scout_missing_views.sql` - MOVED to odoo-ce
- `add_warc_cases_table.sql` - MOVED to odoo-ce
- `create_creative_ops_schema.sql` - MOVED to odoo-ce

## How to Add Schema Changes

1. **Navigate to odoo-ce repository:**
   ```bash
   cd /Users/tbwa/odoo-ce
   ```

2. **Create new migration file:**
   ```bash
   cd supabase/migrations
   touch YYYYMMDDHHMMSS_your_migration_name.sql
   ```

3. **Write SQL migration** (tables, views, RLS policies, functions)

4. **Apply migration to Supabase:**
   ```bash
   npx supabase db push
   ```

5. **Verify in app:**
   ```bash
   cd /Users/tbwa/tbwa-agency-databank
   npm run dev
   # App will automatically see new schema via Supabase client
   ```

## Configuration

This app is configured to consume from the canonical Supabase project in `.env.local`:

```bash
VITE_SUPABASE_URL=https://spdtwktxdalcfigzeqrz.supabase.co
VITE_SUPABASE_ANON_KEY=<from odoo-ce/.env>
```

## CI/CD Guard

GitHub Actions workflow **`.github/workflows/guard-schema-changes.yml`** will fail builds if:

1. New `.sql` files are added to `supabase/migrations/`
2. Existing migration files are modified
3. `supabase/config.toml` is changed

All schema changes MUST go through odoo-ce repository.

## Questions?

See: `/Users/tbwa/odoo-ce/SUPABASE_ERP_INTEGRATION.md`

---

**Last Updated:** 2026-01-11
**Migration Status:** Canonical source established in odoo-ce
