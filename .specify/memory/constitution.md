# Constitution — TBWA Docs Next

## Purpose
Ship the best-in-class developer docs + reference experience for the TBWA Agency Databank platform: faster onboarding, fewer integration errors, and predictable upgrades across all platform services.

## Non-negotiables
1. **Docs are executable**: every code sample is runnable and CI-validated (mock + optional live).
2. **Single source of truth**: OpenAPI + MCP schemas generate reference pages, SDK types, and examples.
3. **Versioned reality**: every breaking change has a visible diff, migration notes, and version pin guidance.
4. **Latency-first UX**: everything loads fast; reference is searchable, linkable, and copy/paste safe.
5. **Framework-native**: first-class paths for Vite/React, Next.js, Python, and "plain HTTP".
6. **Security by default**: tokens, webhooks, and secrets patterns are explicit and consistent across guides.
7. **AI assist is additive**: AI helpers never replace canonical reference; assistant responses cite docs sections.

## Product principles
- Prefer **task-first** docs (what you're trying to do) over concept-first.
- Keep a strict separation between:
  - **Guides** (opinionated, end-to-end)
  - **Reference** (complete, generated, versioned)
  - **Examples** (runnable repos + snippets)
- Make the "happy path" effortless, but keep escape hatches obvious (raw curl, raw HTTP).

## Quality bars
- Search finds the right page in < 2 queries.
- Every endpoint page includes: auth, idempotency, rate limits, errors, retries, pagination (if applicable).
- Every webhook page includes: signing/verification, replay handling, and a test harness.
- Every MCP service page includes: port, schema, available operations, and example payloads.

## What we will not do
- No "AI-generated docs" that can drift from product reality.
- No framework lock-in: examples may prefer some stacks but reference stays universal.
- No orphan documentation: every doc links to related context and next steps.

## Platform-specific principles
- **Scout Dashboard**: Data visualization patterns, campaign analytics, and medallion architecture docs.
- **CES JamPacked**: Creative effectiveness scoring, emotion analysis, and award intelligence.
- **MCP Services**: Microservices Command Pattern with clear reader/writer separation.
- **Supabase Integration**: Row-level security, edge functions, and real-time subscriptions.

## Design system alignment
- Follow existing Tailwind + shadcn/ui patterns from the platform apps.
- Use consistent code block styling with language tabs.
- Maintain dark/light mode support throughout docs.
- Keep typography clean: Inter for body, JetBrains Mono for code.
