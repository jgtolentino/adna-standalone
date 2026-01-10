# Plan — TBWA Docs Next

## Phase 0 — Repo + pipeline skeleton
- Create docs platform structure: `docs-next/`, with `src/`, `content/`, `gen/`, `examples/`, `tools/`.
- Define design tokens and theming system.
- Add CI workflows:
  - Markdown lint + link checker
  - Snippet extraction + unit validation
  - Example builds (Vite/Next/Python)

## Phase 1 — OpenAPI-driven reference
- Ingest MCP service OpenAPI schemas and generate:
  - Services index
  - Endpoint pages (request/response/errors)
  - Language tabs (curl + SDKs)
- Add version selector + "changed in" metadata.
- Build reference page templates with design tokens.

## Phase 2 — MCP Service Explorer
- Define service registry format:
  - `service`, `port`, `schema`, `operations`, constraints
- Build UI:
  - Service tables
  - Request builder
  - Snippet exporter
- Integrate with design system components.

## Phase 3 — Playground
- Implement request runner:
  - Choose service type (reader/writer).
  - Configure Supabase auth context.
- Add request builder:
  - Generate minimal requests
  - Generate production-ready requests with error handling

## Phase 4 — Webhook reliability kit
- Ship:
  - Verification reference
  - Replay/idempotency patterns
  - Templates for Vercel/Supabase Edge Functions
- Add "test webhook" simulator page and CLI tool.

## Phase 5 — Upgrade assistant + diffs
- Build a diff engine:
  - OpenAPI diff across versions
  - Render "what changed"
- Produce migration recipes with code deltas.

## Phase 6 — AI assistant (citing)
- Add assistant layer that:
  - Uses doc index
  - Always cites sections
  - Outputs version-matched code
- Guardrail: assistant never overrides reference.

## Validation gates (must pass before "production docs")
- 0 broken internal links
- All snippets compile/typecheck
- Examples build cleanly
- Playground basic flows succeed against mock API
- Design tokens render correctly in all themes
