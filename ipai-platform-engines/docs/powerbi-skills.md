# Power BI / Fabric BI Skills Ladder (Agent-Certified)

This document defines the **skills, benchmarks, and certification levels** for the
**Power BI / Fabric BI Architect Agent**. It mirrors the Microsoft certification map
(Fundamentals → Role-based → Specialty → Business → Expert) and is enforced via automated tests.

---

## 1. Human Certification Analogs

This agent is designed to operate at, or above, the following human certifications:

- **Fundamentals**
  - PL-900: Power Platform Fundamentals
  - DP-900: Azure Data Fundamentals

- **Role-based**
  - PL-300: Power BI Data Analyst Associate
  - DP-500: Azure Enterprise Data Analyst Associate

- **Specialty**
  - Fabric Analytics Engineer Associate

- **Business**
  - AB-710: AI Business Professional

- **Expert (composite)**
  - Power Platform Solution Architect Expert
  - Enterprise BI / Fabric Solution Architect (internal equivalent)

---

## 2. Tools Required by the Agent

The agent must have reliable access to the following tools:

### pbix_reader
Loads `.pbix` files and exposes:
- Tables
- Relationships
- Measures
- Visuals
- Report pages

### dax_analyzer
Parses DAX measures and checks:
- Syntax correctness
- Performance patterns (e.g., heavy row context)
- Best practices (CALCULATE usage, filter context, etc.)

### sql_query_runner
Executes SQL against:
- Source warehouse / lakehouse
- Semantic model backing the BI layer

### report_layout_exporter
Exports layout metadata:
- Pages, visuals, interactions
- Filter panes
- Visual types and bindings

### kpi_contract_validator
Validates that:
- KPI formulas match the BI contract / PRD
- Dimensions / filters are respected
- Aggregation levels are correct

---

## 3. Skill Levels and Benchmarks

### 3.1 Fundamentals – `powerbi_fundamentals`

**Human Analog:** PL-900 / DP-900
**Goal:** Understand core concepts of models, reports, dashboards, and semantic layers.

**Capabilities**
- Open and inspect `.pbix` files
- Identify:
  - Tables and relationships
  - Report pages and their purpose
  - Basic measures, dimensions, and filters

**Benchmark: `fundamentals.store_sales_walkthrough`**
- **Input:** `Store Sales.pbix` from `microsoft/powerbi-desktop-samples`
- **Agent must:**
  - List all model tables and ≥90% of relationships
  - Describe each report page in one sentence
  - Explain at least 5 key measures and their business meaning

**Pass Criteria**
- ≥90% structural accuracy
- Clear, non-ambiguous descriptions of measures and pages

---

### 3.2 Role-Based – `powerbi_data_analyst_associate`

**Human Analog:** PL-300: Power BI Data Analyst Associate

**Capabilities**
- Clean and transform data for BI models
- Build semantic models with:
  - Star-schema awareness
  - Correct relationships and cardinality
- Rebuild existing reports with new data sources
- Implement explicit DAX measures (no auto-generated measures)

**Benchmark: `role_based.store_sales_rebuild`**
- **Input:**
  - `Store Sales.pbix` (reference layout)
  - Target SQL schema (warehouse / lakehouse)
- **Agent must:**
  - Recreate all report pages with ≥90% visual parity
  - Ensure all KPI values match reference within 1% tolerance
  - Use explicit DAX measures for all reported metrics

**Pass Criteria**
- KPI parity within 1% on sample dataset
- No implicit measures in visuals
- No broken visuals or filters

---

### 3.3 Role-Based / Specialty – `fabric_analytics_engineer`

**Human Analog:** Fabric Analytics Engineer Associate

**Capabilities**
- Design models for:
  - Import, DirectQuery, and Direct Lake
- Implement:
  - Aggregation tables
  - Incremental refresh patterns
- Diagnose performance bottlenecks in:
  - DAX
  - Model design
  - Data source configuration

**Benchmark: `fabric.performance_tuning`**
- **Input:** Slow-performing sample report and model
- **Agent must:**
  - Produce a **model diagram** with bottlenecks identified
  - Propose optimizations (aggregations, refactor measures, partitioning)
  - Estimate impact (target ≥50% query time reduction)
  - Explain tradeoffs for Import vs DirectQuery vs Direct Lake

**Pass Criteria**
- Plausible and coherent optimization plan
- At least one concrete, implementable change per major bottleneck
- Demonstrated understanding of performance tradeoffs

---

### 3.4 Business / AI – `ai_bi_business_professional`

**Human Analog:** AB-710: AI Business Professional

**Capabilities**
- Translate business questions into:
  - KPIs
  - Dimensions and filters
  - Visuals and narratives
- Design BI specs that integrate:
  - Natural language Q&A
  - Explanatory narratives
  - Scenario and "what if" analysis

**Benchmark: `business.requirements_to_dashboard`**
- **Input:** Business PRD (plain language requirements)
- **Agent must:**
  - Map each requirement to:
    - At least one KPI
    - At least one visual
  - Produce a BI spec:
    - Pages
    - Visual layouts
    - Drill paths
  - Propose AI enhancements:
    - NL Q&A prompts
    - Narrative summaries

**Pass Criteria**
- All business questions covered by metrics & visuals
- Clear differentiation of source data vs derived metrics
- Coherent AI feature plan (no hallucinated data sources)

---

### 3.5 Expert – `powerbi_solution_architect_expert`

**Human Analog:** Power Platform Solution Architect Expert / DP-500

**Capabilities**
- Design end-to-end BI architecture:
  - Data sources, pipelines, and models
  - Workspaces and deployment pipelines
  - RLS and security
  - CI/CD for Power BI / Fabric
- Govern AI features and access patterns

**Benchmark: `expert.full_stack_powerbi_solution`**
- **Input:**
  - Sample dataset
  - Three reference `.pbix` files:
    - `Store Sales.pbix`
    - `Competitive Marketing Analysis.pbix`
    - One additional sample report
- **Agent must:**
  - Design:
    - Workspace layout
    - Dataset ownership model
    - RLS strategy (roles, rules, and tests)
  - Define CI/CD strategy:
    - PBIP / Git integration
    - Validation steps before deploy
  - Document AI feature plan:
    - Q&A
    - Anomaly detection
    - Smart narratives
    - Guardrails and limitations

**Pass Criteria**
- Architecture diagram covers:
  - Data → Model → Report → Distribution path
- Clear RLS plan with examples
- CI/CD steps are automatable and testable
- AI features described with concrete data constraints

---

## 4. Certification Policy

An **agent** is considered:

- **Fundamentals Certified** if:
  - `powerbi_fundamentals` benchmarks are green

- **Associate Certified** if:
  - `powerbi_data_analyst_associate` benchmarks are green
  - All fundamentals tests pass

- **Expert Certified** if:
  - `fabric_analytics_engineer`, `ai_bi_business_professional`,
    and `powerbi_solution_architect_expert` benchmarks are green
  - No failing governance or security checks in latest CI run

Upon meeting criteria, the **CertificationAuthority** issues an RS256-signed JWT:

- `certification.title` = `Certified Power BI / Fabric BI Architect Agent`
- `certification.level` ∈ `{ fundamentals, associate, expert }`
- `certification.stack_verified` = list of skill IDs
- `certification.human_cert_analog` = composite description (PL-300, DP-500, Architect, etc.)

This JWT is stored in the **agent registry** and must be presented before the agent is allowed
to execute production-impacting BI tasks (model changes, deployment, RLS edits).

---

## 5. Benchmark Sources

| Source ID | Repository | Usage |
|-----------|------------|-------|
| `powerbi_desktop_samples` | `microsoft/powerbi-desktop-samples` | Store Sales.pbix, Competitive Marketing Analysis.pbix |

---

## 6. Related Documentation

- [Engine Spec: Retail Intel](../engines/retail-intel/engine.yaml)
- [Skills: Scout Retail Analytics](./scout-skills.md)
- [Agent Certifier Skill](../../.claude/skills/agent-certifier/SKILL.md)
