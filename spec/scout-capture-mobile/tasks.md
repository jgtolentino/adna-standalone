# Task Breakdown — Scout Capture Mobile (Execution-Ready)

## A) Supabase Schema + RLS
1. Create enums:
   - `scout.event_type`
   - `scout.gender_enum`
   - `scout.age_bracket_enum`
   - `scout.request_mode_enum`
   - `scout.request_type_enum`
   - `scout.substitution_reason_enum`
2. Tables:
   - `scout.device`
   - `scout.capture_session`
   - `scout.bronze_device_event`
   - `scout.silver_interaction` (+ `silver_stt`, `silver_demographics`, `silver_substitution`)
   - `scout.gold_interaction_daily`
3. RLS:
   - device token can insert its own events (scoped by `device_id`)
   - dashboard roles read only gold RPC outputs
   - admin can read device + sessions
4. RPCs:
   - `rpc_gold_interaction_summary(filters jsonb)`
   - `rpc_gold_demographics_rollup(filters jsonb)`
   - `rpc_gold_substitution_sankey(filters jsonb)`
5. Retention:
   - scheduled purge function by policy (bronze + optional media)

## B) Edge Functions
1. `device-register`:
   - create/lookup device
   - mint JWT
   - return config + token
2. `device-config`:
   - return current config rules (sampling, retention, feature flags)
3. `events-ingest`:
   - validate schema_version
   - rate limit + replay nonce
   - insert batch into bronze
   - optionally trigger silver normalization (lightweight)

## C) Mobile App (apps/scout-capture)
1. App scaffolding (Expo or native)
2. Secure storage token + device_id
3. Session management:
   - create session locally
   - close session
4. Capture Console:
   - STT start/stop + transcript view
   - request mode/type controls
   - suggestion accepted + handshake score
   - substitution form
   - demographics chips (staff input)
5. Offline queue:
   - local sqlite/kv queue
   - exponential backoff retry
6. Sync:
   - batch ingest
   - health checks + diagnostics screen

## D) Odoo CE + OCA 18 Mapping + Sync
1. Master sync tables in Supabase:
   - `scout.store_master`, `scout.sku_master`, `scout.brand_master`, `scout.category_master`
2. ETL jobs (Odoo → Supabase):
   - stores (pos.config/res.partner)
   - products (product.product/template/category)
   - brands (OCA product_brand)
3. Documentation:
   - field mapping tables
   - expected Odoo modules list

## E) Market Readiness
1. Fleet mgmt:
   - device disable/enable
   - config rollouts
2. Telemetry:
   - heartbeat events
   - crash/error counters
3. QA:
   - seed small dataset
   - RPC tests
   - dashboard renders with zero-empty states

## F) Pulser SDK (required)
1. Add Pulser install instructions to repo docs
2. Add CI step to install Pulser SDK and run:
   - schema validation
   - edge function deploy dry-run
   - smoke tests
