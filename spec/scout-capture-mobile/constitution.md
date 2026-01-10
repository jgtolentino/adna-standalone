# Scout Capture Mobile (STT + Demographics) — Constitution

## 0. Scope
Build a **mobile/tablet-first** capture app (Android/iOS) that records **in-store interaction signals** (STT + coarse demographics + operational events) and streams **privacy-compliant analytics events** into **Supabase** for Scout/Ask Suqi dashboards, with **Odoo CE + OCA 18** mappings as the system-of-record for retail entities (stores/products/brands/transactions).

## 1. Non-Negotiables
- **Mobile/tablet/phone, not Pi**: primary target is Android tablets/phones; iOS supported where feasible.
- **Privacy by default**: store **derived features/events**, not raw biometric/audio, unless explicitly enabled with retention controls.
- **No face IDs**: do **not** persist face embeddings, face templates, or unique biometric identifiers.
- **RLS always on**: all client-access data protected by Supabase RLS and scoped roles.
- **Gold-only API**: dashboards consume **Gold/Platinum** via RPCs; Bronze/Silver are internal.
- **Deterministic releases**: migrations + edge functions versioned in repo; CI validates drift.
- **Offline-first capture**: device continues to capture when offline; sync when online.
- **Odoo is master for entities**: stores, products, brands, categories, POS config come from Odoo CE/OCA or seeded master data, then mirrored to Supabase.

## 2. Architecture Contract (Front → Data → Odoo)
- Device app emits events → **Supabase Edge Functions** ingest → **Bronze** store raw event JSON → **Silver** enrich/normalize → **Gold** aggregates → **Scout dashboard** reads via RPCs.
- Odoo CE feeds masters (store/product/brand/category) and optionally POS transactions → ETL → Supabase.

## 3. Security Model
- Devices authenticate using **device-bound credentials**:
  - `device_id` + per-device JWT minted by `device/register` edge function.
  - JWT stored in OS secure storage; rotated on schedule.
- Event ingestion uses **service-side validation** (schema + rate limits + replay protection).
- Storage buckets use signed URLs; raw media optional and controlled.

## 4. Data Minimization Rules
- Audio:
  - Default: **on-device STT** → upload **text + timestamps + confidence only**.
  - Optional: upload short audio snippets with explicit enablement + retention window.
- Demographics:
  - Default: store **age_bracket**, **gender** ∈ {male,female,unknown}, **confidence**, **method**.
  - Never store face images unless explicitly enabled and retention-limited.
- Location:
  - Store/storefront geo is store master; no precise customer geolocation.

## 5. Performance SLOs
- Ingest p95 < 600ms per event batch (server-side).
- Offline queue flush resumes within 10s of connectivity.
- Dashboard gold RPC p95 < 700ms on typical filters.

## 6. Required Deliverables
- Supabase:
  - `scout.*` tables for device + events + derived metrics
  - Edge functions for register/config/ingest
  - RLS policies + enums + RPCs (gold-only)
- Mobile app:
  - Capture UI + consent controls + offline queue + health screen
  - On-device STT & optional lightweight demographics inference (or staff-input fallback)
- Docs:
  - Runbooks, threat model (pragmatic), retention/consent policy text templates
- CI:
  - Migration checks, function lint, schema contract validation, seed smoke tests

## 7. Pulser SDK Requirement
All builds and automation MUST include Pulser SDK installation and registration steps in the repo docs and CI.
