# Tasks — TBWA Docs Next

## Foundation
- [x] Create spec structure (`.specify/`, `specs/001-replicate-docs-next/`)
- [x] Define constitution and product principles
- [ ] Create docs platform structure (`docs-next/src/`, `content/`, `gen/`, `examples/`, `tools/`)
- [ ] Define design tokens (colors, typography, spacing)
- [ ] Set up theming system (light/dark mode)
- [ ] Add markdown lint + link check CI
- [ ] Add snippet extraction tool + snippet test harness
- [ ] Add example app build CI for:
  - [ ] Vite/React
  - [ ] Next.js
  - [ ] Python

## Design System
- [ ] Create design tokens file (`tokens/colors.ts`, `tokens/typography.ts`, `tokens/spacing.ts`)
- [ ] Build base components:
  - [ ] CodeBlock with language tabs
  - [ ] Callout (info, warning, error)
  - [ ] APIEndpoint display
  - [ ] SchemaTable
  - [ ] CopyButton
- [ ] Implement theme provider with CSS variables
- [ ] Create responsive navigation component
- [ ] Build search interface

## OpenAPI Reference
- [ ] Fetch/ingest MCP service OpenAPI schemas
- [ ] Generate endpoint pages with:
  - [ ] Auth section
  - [ ] Headers
  - [ ] Request/response schema
  - [ ] Errors
- [ ] Add version selector + "introduced/changed/deprecated"

## MCP Service Explorer
- [ ] Define service registry JSON format
- [ ] Build service page UI:
  - [ ] Port and schema info
  - [ ] Operations table
  - [ ] Request builder form
- [ ] Add snippet exporter (curl/TypeScript/Python)

## Playground
- [ ] Implement token entry (local-only)
- [ ] Implement service type selector (reader/writer)
- [ ] Implement Supabase auth context configuration
- [ ] Generate request templates (minimal/production)

## Webhook Reliability Kit
- [ ] Write canonical webhook guide:
  - [ ] Signature verification
  - [ ] Replay protection
  - [ ] Idempotency
  - [ ] Retries + dead-letter
- [ ] Provide templates for Vercel/Supabase Edge Functions
- [ ] Add webhook simulator CLI + hosted test endpoint

## Upgrade Assistant
- [ ] OpenAPI diff engine across versions
- [ ] Render migration pages with code deltas
- [ ] Add "what changed for me" view (filtered by services used)

## AI Assistant (citing)
- [ ] Build doc indexer
- [ ] Require citations in answers
- [ ] Add version-awareness + snippet alignment

## Content Migration
- [ ] Audit existing 28 docs in `/docs`
- [ ] Map to new IA structure
- [ ] Migrate high-priority guides first:
  - [ ] Getting started
  - [ ] MCP integration
  - [ ] Supabase setup

## Release
- [ ] Beta: reference + search + basic playground
- [ ] GA: webhook kit + CI validated snippets + upgrade diffs
