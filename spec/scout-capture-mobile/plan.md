# Implementation Plan — Scout Capture Mobile

## Repo Layout (tbwa-agency-databank)
- `apps/scout-dashboard/` (existing Next.js)
- `apps/scout-capture/` (new mobile app)
- `supabase/migrations/` (schema + RLS + RPCs)
- `supabase/functions/` (device-register, device-config, events-ingest)
- `docs/scout/` (contracts, mappings, runbooks)
- `spec/scout-capture-mobile/` (this spec kit)

## Milestones

### M0 — Spec + Schema First (day 0–1)
- Add `scout.device`, `scout.capture_session`
- Add bronze event table + enums
- Add RLS for device role + admin role
- Add minimal gold RPC returning daily metrics
- Edge functions scaffolding

### M1 — Mobile MVP (day 1–3)
- Capture session start (store select/QR)
- STT transcript capture
- Request mode/type toggles
- Suggestion accepted toggle
- Demographics staff-input chips
- Offline queue + retry
- Batch ingest to edge function

### M2 — Enrichment + Analytics (day 3–5)
- Silver normalization jobs (SQL views + scheduled function)
- Substitution event capture
- Handshake score heuristics (time-to-resolve + acceptance + edits proxy)
- Gold rollups and RPCs for:
  - interaction summary
  - acceptance by category/store/region
  - demographics rollups

### M3 — Odoo Sync (day 5–7)
- Odoo → Supabase master sync (stores/products/brands/categories)
- Optional POS transaction sync
- Mapping docs + deterministic ETL scripts

### M4 — Market-Ready Hardening (day 7–10)
- Fleet controls: device status, config policies, forced update minimum version
- Rate limiting + replay protection
- Data retention job (purge media/events based on policy)
- Observability + alerting hooks

## CLI / Automation (cloud-agent friendly)

### Supabase
- Migrations apply:
```bash
supabase db push
supabase functions deploy device-register
supabase functions deploy device-config
supabase functions deploy events-ingest
```

### App
- Build (Expo example):
```bash
pnpm -C apps/scout-capture install
pnpm -C apps/scout-capture test
pnpm -C apps/scout-capture build
```

### CI Gates
- Lint/typecheck mobile + dashboard
- Migration check (dry run)
- Contract validator (YAML/JSON schema)
- RPC smoke tests (seed tiny dataset, call RPCs)

## Operational Policies
- Default retention: 14–30 days for bronze events (configurable)
- Gold aggregates retained long-term
- Media retention disabled by default

## Pulser SDK
- Add Pulser SDK install to repo docs and CI steps so agents can execute:
  - schema validation
  - edge deploy
  - smoke tests
