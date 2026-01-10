# InsightPulseAI Enterprise

This enterprise contains the source-of-truth repositories and operating standards for InsightPulseAI's production systems, agent infrastructure, and client deployments.

## What lives here

### 1) Core Platforms
- **ERP (Odoo 18 CE + OCA + IPAI modules)**: finance ops, month-end close, PH compliance, internal automation.
- **Analytics (Superset + data services)**: dashboards, curated datasets, reporting bundles.
- **Agent Systems (Pulser / MCP / executor tooling)**: orchestration, skills registry, deployment automation.

### 2) Deployment Environments
- **Production**: stable, tagged releases; only gated merges.
- **Staging/Preview**: PR previews and smoke checks.
- **Sandbox**: isolated experiments and prototyping.

## How we work (operating rules)

### Branching
- `main` = deployable
- Feature branches = `feat/*`, `fix/*`, `chore/*`
- Releases are tagged `prod-YYYYMMDD-HHMM` (or equivalent), with a "what shipped" summary.

### CI/CD expectations
- PRs must pass: lint + tests + guardrails + schema drift checks (where applicable).
- Any infra/auth changes must include: verification script + evidence artifact (logs/report).

### Documentation standard
- Every system has:
  - **Architecture + runtime identifiers**
  - **Deployment runbook**
  - **Verification commands**
  - **Canonical schema artifacts** (DBML/ERD/OpenAPI where relevant)

## Where to start

### Key repos (typical entry points)
- **odoo-ce**: Odoo 18 CE stack + OCA + IPAI modules, deployment + deterministic docs.
- **pulser-mcp / pulser-agent-framework**: agent orchestration + tool routing + skills registry.
- **tbwa-fin-ops / roadmap / automation repos**: project delivery + ops playbooks.

## Support / Ownership
- For issues, use GitHub Issues in the relevant repo.
- For rollout coordination, use Projects + Releases notes as the source of truth.
