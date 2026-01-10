# PRD — Scout Capture Mobile (STT + Demographics) for TBWA\SMP

## 1) Goal
Replace Raspberry Pi capture with a **market-ready** mobile/tablet capture system that reliably produces Scout enrichment fields:
- `request_mode`, `request_type`
- `suggestion_accepted`
- `handshake_score`
- `substitution_event`
- `gender`, `age_bracket`
- `time_of_day` (derived)
- optional `campaign_influenced`, `economic_class` (via store master)

## 2) Users
- Store staff / enumerators
- Ops analysts (dashboard)
- Admin (device fleet + config)

## 3) Product Surfaces
### A. Mobile/Tablet Capture App (Android primary, iOS secondary)
Core screens:
1. **Session Start**
   - select store (or QR scan store code)
   - session metadata (shift, cashier/staff id optional)
2. **Capture Console**
   - STT live transcript (editable)
   - buttons: *verbal / pointing / indirect* (request_mode)
   - toggles: *branded / unbranded / point / indirect* (request_type)
   - suggestion accepted: yes/no
   - substitution capture (from/to + reason)
   - handshake score slider or auto-derived proxy
3. **Demographics Capture**
   - default: staff-input quick chips (age bracket + gender + confidence)
   - optional: on-device inference (coarse only) with explicit enable flag
4. **Offline Queue + Sync**
   - pending events, retry, diagnostics
5. **Consent & Controls**
   - enable/disable audio snippet upload
   - retention window setting (admin-controlled)

### B. Supabase Edge API
- `/device/register` (POST)
- `/device/config` (GET)
- `/events/ingest` (POST batch)
- `/health` (GET)

### C. Scout Dashboard (existing)
Consumes gold RPCs only; shows enriched metrics + demographics rollups.

## 4) Privacy / Compliance (deployable defaults)
- Default storage: **text transcript + event features only**.
- No biometric identifiers; no face templates.
- Optional media:
  - audio snippets and/or face images (if used at all) require:
    - explicit flag in config
    - retention window (e.g., 7/14/30 days)
    - restricted bucket + access logs
- Demographics are **coarse categories** + confidence + method (`staff_input|on_device_model|import`).

## 5) Data Model (Supabase, scout schema)

### 5.1 Core device + sessions
- `scout.device`
  - `device_id (pk)`, `device_type`, `platform`, `model`, `app_version`
  - `org_id`, `assigned_store_id`, `status`, `last_seen_at`
- `scout.capture_session`
  - `session_id (pk)`, `device_id (fk)`, `store_id (fk)`
  - `started_at`, `ended_at`, `operator_id (nullable)`, `shift_label`

### 5.2 Event ingestion (Bronze)
- `scout.bronze_device_event`
  - `event_id (pk)`, `session_id`, `device_id`, `store_id`
  - `event_type` enum: `stt_utterance|request|outcome|demographics|substitution|heartbeat`
  - `event_ts`, `payload jsonb`, `schema_version`, `ingested_at`

### 5.3 Normalized (Silver)
- `scout.silver_interaction`
  - `interaction_id (pk)`, `session_id`, `store_id`, `interaction_ts`
  - `request_mode`, `request_type`
  - `suggestion_offered boolean`, `suggestion_accepted boolean`
  - `handshake_score numeric(3,2)`
- `scout.silver_demographics`
  - `interaction_id (fk)`, `gender`, `age_bracket`, `confidence`, `method`
- `scout.silver_stt`
  - `interaction_id (fk)`, `transcript`, `confidence`, `language`, `duration_ms`
- `scout.silver_substitution`
  - `interaction_id (fk)`, `occurred`, `from_sku|from_brand`, `to_sku|to_brand`, `reason`

### 5.4 Analytics (Gold)
- `scout.gold_interaction_daily`
  - date, store_id, region/city/barangay
  - counts + rates (acceptance_rate, substitution_rate)
  - demographics rollups (by age/gender buckets)
- RPCs:
  - `scout.rpc_gold_interaction_summary(filters jsonb)`
  - `scout.rpc_gold_demographics_rollup(filters jsonb)`
  - `scout.rpc_gold_substitution_sankey(filters jsonb)`

## 6) Odoo CE + OCA 18 Mapping (system-of-record)
### Entities
- Store master
  - Odoo: `pos.config` (store config) + `res.partner` (store address) + `base_address_extended` for PH hierarchy
  - Supabase: `scout.store_master` (mirrored)
- Products/SKUs
  - Odoo: `product.product`, `product.template`, `product.category`
  - OCA: `product_brand` (brand master)
  - Supabase: `scout.sku_master`, `scout.brand_master`, `scout.category_master`

### Transactions (optional sync)
- Odoo: `pos.order`, `pos.order.line`
- Supabase: `scout.transaction`, `scout.transaction_line_item`

### Enrichment-only fields (Scout)
These are **not native** to Odoo and remain in Supabase analytics layer:
- request_mode, request_type, suggestion_accepted, handshake_score, substitution_event, demographics

## 7) API Contracts

### 7.1 Register device
`POST /functions/v1/device-register`
```json
{ "install_id":"...", "platform":"android", "device_model":"...", "app_version":"1.0.0" }
```

Returns:
```json
{ "device_id":"dev_...", "token":"jwt...", "config":{"upload_audio":false,"retention_days":14,"sampling":{...}} }
```

### 7.2 Ingest events (batch)
`POST /functions/v1/events-ingest`
```json
{
  "device_id":"dev_...",
  "session_id":"ses_...",
  "events":[
    {"event_type":"stt_utterance","event_ts":"...","payload":{ "transcript":"...", "confidence":0.86 }},
    {"event_type":"demographics","event_ts":"...","payload":{ "gender":"female","age_bracket":"25-34","confidence":0.62,"method":"staff_input" }},
    {"event_type":"request","event_ts":"...","payload":{ "request_mode":"verbal","request_type":"branded" }},
    {"event_type":"outcome","event_ts":"...","payload":{ "suggestion_accepted":true,"handshake_score":0.74 }}
  ],
  "schema_version":"1.0"
}
```

### 7.3 Config
`GET /functions/v1/device-config?device_id=dev_...`

## 8) Mobile Tech Choices (market-ready)
- Android-first: Kotlin (native) **or** Expo/React Native with native modules
- On-device STT:
  - Android: platform speech API or Whisper.cpp (optional)
  - iOS: Speech framework or whisper.cpp (optional)
- Demographics:
  - Default: staff input (fast chips)
  - Optional: on-device lightweight classifier → output coarse categories only

## 9) Observability
- `scout.device_heartbeat` (or event type heartbeat) every 60s when active
- error events stored in bronze + shipped to log drain (optional)
- admin dashboard: device last_seen, crash rate, sync backlog

## 10) Rollout Plan
- Phase 1: staff-input demographics + STT transcript + request/outcome signals
- Phase 2: substitution capture + handshake scoring heuristics
- Phase 3: optional on-device inference + limited media retention

## 11) Pulser SDK Installation (required)
Repo must include Pulser SDK setup steps in docs and CI so agents can run migrations/functions/tests deterministically.
