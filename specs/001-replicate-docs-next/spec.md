# Spec — TBWA Docs Next (Docs + Reference Platform v2)

## Summary
TBWA Docs Next is a rebuilt documentation platform that combines:
- Generated, versioned **API Reference** (OpenAPI-driven)
- Runnable, framework-specific **Guides**
- A typed, interactive **Playground** for MCP services and Supabase
- "Docs that compile": CI-validated snippets + example repos

It targets the biggest failure modes in platform integration: auth mistakes, wrong endpoint choice, mismatched input schema, async orchestration bugs, and webhook reliability.

## Context (what exists today)
The TBWA Agency Databank already has:
- 28 markdown documentation files in `/docs`
- MCP services architecture with reader/writer separation (ports 8888-8898)
- 9 platform schemas (scout_dash, creative_ops, hr_admin, etc.)
- Supabase integration with row-level security
- Medallion lakehouse architecture (Bronze → Silver → Gold)

Docs Next improves completeness, versioning, testing, and workflow tooling around these fundamentals.

## Goals
1. Reduce time-to-first-successful-integration and time-to-production-hardening.
2. Cut integration support load by preventing common implementation errors.
3. Make upgrades predictable with diffs, changelogs, and "what changed for me" views.
4. Provide a single canonical contract (OpenAPI + MCP schemas) that generates reference + SDK typing.
5. Offer best-in-class examples for modern stacks (Vite/React, Next.js, Python).

## Non-goals
- Replacing existing platform apps; we enhance their doc experience and integration guidance.
- Building a full observability product; we only expose doc-level instrumentation patterns.

## Primary users
- App developers integrating with TBWA platform services.
- Platform engineers shipping reliable async jobs and webhook-driven pipelines.
- Data engineers working with the medallion architecture.

## Key problems to solve
1. **Service confusion**: which MCP service to call (reader vs writer, which port).
2. **Schema mismatch**: "what fields does this endpoint accept?" + types across languages.
3. **Auth orchestration mistakes**: Supabase RLS, service role keys, anon keys.
4. **Version drift**: docs and examples falling behind API and schema versions.
5. **Webhook correctness**: verifying signatures, replay, idempotent handlers.

---

## Product requirements

### R1 — Versioned documentation + diffs
- Docs are published per **API version** and per **docs release**.
- Every reference page shows:
  - "Introduced in", "Changed in", "Deprecated in"
  - A diff view between versions (endpoint + fields)
- Provide "Upgrade assistant" pages:
  - From vN → vN+1 with concrete code deltas.

### R2 — Generated API Reference (OpenAPI → pages)
- Ingest MCP service OpenAPI schemas.
- Generate:
  - Endpoint pages (auth, headers, body, responses, errors)
  - Example requests in curl + 2 SDK languages (TypeScript, Python)
  - Typed models for copy/paste (TS types + Python pydantic examples)

### R3 — MCP Service Explorer
- For each MCP service:
  - Show port, schema, available operations
  - Show request/response types with constraints
  - Provide "Try it" form that produces a working request payload
- Export snippets tailored to:
  - Vite/React (with Tanstack Query)
  - Next.js (server + edge)
  - Python (sync/async)

### R4 — Interactive Playground
- A browser playground that supports:
  - Token entry (local only) and environment-based auth
  - Choose service type (reader vs specific writer)
  - Configure Supabase connection with RLS context
- Generates:
  - "Minimal" request
  - "Production" request (timeouts, retries, error handling)

### R5 — Webhook reliability kit
- Standard webhook guide includes:
  - Signature verification and replay protection
  - Dead-letter handling, retries, idempotent processing
  - Local test harness (CLI) and hosted test endpoint
- Provides template handlers for:
  - Vercel Functions
  - Supabase Edge Functions

### R6 — "Docs that compile" CI
- Every snippet and guide example is validated in CI:
  - Lint + typecheck
  - Smoke tests against a mocked API
  - Optional nightly live tests to catch drift
- Snippet blocks in markdown must be uniquely addressable and testable.

### R7 — Search, nav, and deep linking
- Global search supports:
  - Service names (e.g., `mcp-reader`, `scout-writer`)
  - Endpoint paths and operation IDs
  - Errors and troubleshooting topics
- Every heading is linkable; copying a section link is 1 click.

### R8 — AI assistant that cites docs (optional but supported)
- Assistant can answer "how do I…" questions, but must:
  - Cite exact doc sections it used
  - Offer copy/paste code that matches the currently selected API/doc version

---

## UX / Information architecture

### Top-level navigation
1. **Get Started**
2. **Guides**
3. **API Reference**
4. **MCP Services**
5. **Supabase**
6. **Webhooks**
7. **Errors & Troubleshooting**
8. **Changelog / Upgrades**
9. **Examples**

### Page templates
- Guide page:
  - Goal → prerequisites → steps → pitfalls → "production hardening" box → references
- Endpoint reference:
  - Summary → auth → headers → request schema → responses → errors → examples → notes
- MCP service page:
  - Port → schema → operations → examples → error codes

---

## Technical design

### Source of truth
- OpenAPI as canonical for endpoints + response types.
- MCP service registry for per-service operations.
- Supabase schema for database types.

### Build pipeline
- `docs/` markdown + frontmatter
- `gen/` generated reference pages (OpenAPI + schemas)
- `examples/` runnable repos (Vite, Next, Python)
- CI validates both markdown integrity + example execution.

### Design system
- Design tokens defined in `tokens/` directory
- Color palette: TBWA brand colors + semantic tokens
- Typography: Inter (body), JetBrains Mono (code)
- Spacing: 4px base unit
- Components: shadcn/ui primitives + custom doc components

### Observability (docs platform)
- Track:
  - Search queries → page conversions
  - Playground success rate (request → successful output)
  - "Copy snippet" events

---

## Success metrics
- ↓ Support tickets for "auth", "wrong service", "schema mismatch".
- ↑ Playground completion rate (first successful request).
- ↑ Search success (first click leads to relevant page).
- ↓ Time-to-production for integrations.

---

## Risks & mitigations
- **Schema drift** between services and docs → mitigate with nightly live validation.
- **Playground security** (token handling) → keep token local-only; never store.
- **Docs bloat** → strict IA; keep guides opinionated, reference generated.

---

## Rollout
- Phase launch:
  1) Reference + versioning foundation
  2) Playground + MCP explorer
  3) Webhook kit + CI snippet validation
  4) AI assistant (citing) + upgrade assistant

## Open questions
- Availability of OpenAPI specs for all MCP services.
- Whether playground needs live service connections or mock-only.
