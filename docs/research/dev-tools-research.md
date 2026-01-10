# Developer Tools Research: Chrome DevTools, Vercel Extensions, VS Code IaC, Odoo Development & AI SDKs

**Research Date:** January 2025
**Purpose:** Production-grade development tooling for TBWA Agency Databank

---

## Table of Contents

1. [Chrome DevTools Documentation & MCP Integration](#1-chrome-devtools-documentation--mcp-integration)
2. [Vercel Tool Extensions](#2-vercel-tool-extensions)
3. [VS Code IaC Templates & Extensions](#3-vs-code-iac-templates--extensions)
4. [Odoo Custom Developer Production-Grade Tools](#4-odoo-custom-developer-production-grade-tools)
5. [Anthropic Claude SDK & Cookbook](#5-anthropic-claude-sdk--cookbook)
6. [OpenAI SDK & Cookbook](#6-openai-sdk--cookbook)
7. [Jinja2 Templating Best Practices](#7-jinja2-templating-best-practices)
8. [Recommendations for TBWA Integration](#8-recommendations-for-tbwa-integration)

---

## 1. Chrome DevTools Documentation & MCP Integration

### Official Documentation Resources

| Resource | URL | Description |
|----------|-----|-------------|
| Chrome DevTools Main | https://developer.chrome.com/docs/devtools/ | Official documentation hub |
| AI Assistance Guide | https://developer.chrome.com/docs/devtools/ai-assistance | Gemini-powered debugging |
| Network Panel Reference | https://developer.chrome.com/docs/devtools/network/reference | Network debugging features |
| Performance Panel Reference | https://developer.chrome.com/docs/devtools/performance/reference | Performance analysis tools |

### Gemini AI Assistance (Chrome 132+)

Chrome DevTools integrates Gemini AI for intelligent debugging across multiple panels. AI assistance is **disabled by default** - enable via Settings > AI assistance section.

#### Console Insights

AI-powered error analysis launched at Google I/O 2024:

- **Error Analysis** - Deciphers console errors by analyzing stack traces and source context
- **Fix Suggestions** - Provides actionable fixes you can apply immediately
- **Context Awareness** - Sends network data, source code, and stack traces to Gemini

#### AI-Assisted Panels

| Panel | AI Capability |
|-------|---------------|
| **Elements** | Debug styling errors, CSS issues |
| **Performance** | Analyze flame graphs, identify bottlenecks |
| **Network** | Identify request issues, optimize loading |
| **Sources** | Locate files, understand code flow |

#### Performance AI Assistant

The reimagined Performance panel includes:

- **Insights Tab** - Guided analysis in left sidebar
- **Core Web Vitals** - Local and real-user data (LCP, CLS, INP)
- **Flame Graph Analysis** - AI pinpoints issues from recorded profiles
- **Actionable Suggestions** - Specific fixes for performance problems

#### ReAct Strategy Implementation

Google implemented the **ReAct (Reasoning + Acting)** prompting strategy:
1. **Thought** - LLM reasons about the problem
2. **Action** - Determines next debugging step
3. **Observation** - Analyzes results
4. Cycles until suitable response found

### Chrome DevTools MCP (Model Context Protocol)

**Released:** September 2025 (Public Preview by Google)

The Chrome DevTools MCP server bridges AI coding assistants with live Chrome browser instances, enabling:

- **Performance Insights**: Record traces and extract actionable performance data
- **Browser Debugging**: Analyze network requests, take screenshots, check console
- **Reliable Automation**: Uses Puppeteer for Chrome automation

#### GitHub Repositories

| Repository | Purpose |
|------------|---------|
| [ChromeDevTools/chrome-devtools-mcp](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Official Google MCP server |
| [benjaminr/chrome-devtools-mcp](https://github.com/benjaminr/chrome-devtools-mcp) | Community MCP server for Claude Desktop/Code |
| [haasonsaas/claude-code-browser-mcp-setup](https://github.com/haasonsaas/claude-code-browser-mcp-setup) | Setup documentation for Claude Code |

#### Claude Code Integration

```bash
# Add Chrome DevTools MCP to Claude Code
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

#### Supported AI Coding Assistants

- Claude Code
- Cursor
- Gemini CLI
- Cline
- GitHub Copilot

### How to Enable AI Assistance

1. Open Chrome DevTools (F12)
2. Go to **Settings** (gear icon)
3. Navigate to **AI assistance** section
4. Accept Google Terms of Service
5. Enable desired AI features

---

## 2. Vercel Tool Extensions

### VS Code Extension

**Extension:** [VSCode Vercel](https://marketplace.visualstudio.com/items?itemName=frenco.vscode-vercel)

| Feature | Description |
|---------|-------------|
| Real-time Monitoring | Track deployments from your team |
| Project Linking | Link projects and pull environment variables |
| Build Logs | Access deployment logs as regular files |
| CLI Integration | Seamless Vercel CLI support |
| Config Completions | IntelliSense for vercel.json |

#### GitHub Repository
- [frencojobs/vscode-vercel](https://github.com/frencojobs/vscode-vercel)

### Vercel CLI for Custom Workflows

```bash
# Build locally without giving Vercel source access
vercel build

# Deploy with custom CI/CD
vercel deploy --prebuilt
```

**Use Cases:**
- Azure DevOps integration
- Trunk-based development workflows
- Custom CI/CD pipelines
- Local builds with artifact upload only

### Infrastructure as Code Integration

#### Terraform Provider

**Repository:** [vercel/terraform-provider-vercel](https://github.com/vercel/terraform-provider-vercel)

```hcl
# Example: Vercel Project with Terraform
resource "vercel_project" "example" {
  name      = "my-project"
  framework = "nextjs"

  git_repository {
    type = "github"
    repo = "username/repo"
  }
}
```

#### Pulumi Provider

**Registry:** [pulumi.com/registry/packages/vercel](https://www.pulumi.com/registry/packages/vercel/)

```typescript
// Example: Vercel Project with Pulumi (TypeScript)
import * as vercel from "@pulumi/vercel";

const project = new vercel.Project("my-project", {
  name: "my-app",
  framework: "nextjs",
});
```

**Preview Environment Tutorials:**
- [HashiCorp: Preview Environments with Terraform + Vercel](https://developer.hashicorp.com/terraform/tutorials/applications/preview-environments-vercel)
- [Bruno Scheufler: Preview Environments with Pulumi + Vercel](https://brunoscheufler.com/blog/2021-10-03-preview-environments-for-every-pull-request)

---

## 3. VS Code IaC Templates & Extensions

### Terraform Extensions

#### HashiCorp Terraform Extension

**Marketplace:** [HashiCorp.terraform](https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform)
**GitHub:** [hashicorp/vscode-terraform](https://github.com/hashicorp/vscode-terraform)

| Feature | Description |
|---------|-------------|
| IntelliSense | Auto-completion for providers, resources, attributes |
| Syntax Validation | Inline error checking via `terraform validate` |
| Code Navigation | Go to Definition, Symbol support |
| Code Formatting | Automatic `terraform fmt` |
| Module Explorer | View referenced modules and providers |
| **MCP Server** | AI assistance through Model Context Protocol |

**Performance (2025):**
- Up to 99.75% reduction in memory usage
- 5,296 LOC workspace: 450ms → 1.4ms open time
- 523 MB → 1.6 MB memory consumption

#### Additional Terraform Snippets

**GitHub:** [rixrix/vscode-terraform-snippets](https://github.com/rixrix/vscode-terraform-snippets)
- 550+ code snippets for Terraform

### Pulumi Extensions

#### Pulumi VS Code Tools

**GitHub:** [pulumi/pulumi-vscode-tools](https://github.com/pulumi/pulumi-vscode-tools)

| Feature | Description |
|---------|-------------|
| ESC Environment Management | Manage secrets/config from VS Code |
| Go to Definition | Navigate across symbols and interpolations |
| Find References | Cross-reference support |
| Environment Editor | In-editor environment definition editing |

#### Related Pulumi Resources

| Repository | Purpose |
|------------|---------|
| [pulumi/esc](https://github.com/pulumi/esc) | Centralized secrets/config management |
| [pulumi/esc-sdk](https://github.com/pulumi/esc-sdk) | SDK for ESC integration |
| [pulumi/esc-examples](https://github.com/pulumi/esc-examples) | ESC use-case examples |
| [pulumi/devcontainer](https://github.com/pulumi/devcontainer) | Pulumi Devcontainer + GitOps boilerplate |

### IaC Comparison (2025)

| Criteria | Terraform | Pulumi |
|----------|-----------|--------|
| Language | HCL (declarative) | TypeScript/Python/Go/C# |
| Testing | Terratest (external) | Native unit testing |
| VS Code Support | Good (some gaps) | Full IDE features |
| Learning Curve | Moderate | Lower (if you know the language) |
| Best For | Template-oriented teams | Programming-oriented teams |

---

## 4. Odoo Custom Developer Production-Grade Tools

### VS Code Extensions for Odoo

#### 1. Odoo IDE Extension

**Marketplace:** [trinhanhngoc.vscode-odoo](https://marketplace.visualstudio.com/items?itemName=trinhanhngoc.vscode-odoo)
**GitHub:** [odoo-ide/vscode-odoo](https://github.com/odoo-ide/vscode-odoo)

| Feature | Description |
|---------|-------------|
| Import Resolution | Resolves `odoo.addons.*` imports |
| Model Inheritance | Full understanding of inheritance mechanisms |
| Code Completion | Model names, field names, XML IDs |
| Pyright Integration | Inherits all Pyright features |

#### 2. Odoo Scaffold Extension

**Marketplace:** [mstuttgart.odoo-scaffold](https://marketplace.visualstudio.com/items?itemName=mstuttgart.odoo-scaffold)
**GitHub:** [mstuttgart/vscode-odoo-scaffold](https://github.com/mstuttgart/vscode-odoo-scaffold)

- Uses Odoo's `scaffold` command for module generation
- Integrates with Python extension settings

#### 3. Odoo Snippets

**GitHub:** [lisandrogallo/vscode-odoo-snippets](https://github.com/lisandrogallo/vscode-odoo-snippets)

- Predefined code snippets for Odoo 10.0+
- Follows latest Odoo Guidelines

### Scaffold Template Repositories

| Repository | Description |
|------------|-------------|
| [humiu/odoo-dev-env](https://github.com/humiu/odoo-dev-env) | Awesome Odoo Development Environment template |
| [Vauxoo/odoo-scaffold](https://github.com/Vauxoo/odoo-scaffold) | Enhanced scaffold with GitHub integration |
| [acsone/odoo-scaffold-templates](https://github.com/acsone/odoo-scaffold-templates) | Legacy templates (use bobtemplates.odoo instead) |

### AI/LLM Integration for Odoo Development

#### Odoo LLM Module

**Apps Store:** [LLM Integration Base](https://apps.odoo.com/apps/modules/16.0/llm)
**GitHub:** [apexive/odoo-llm](https://github.com/apexive/odoo-llm)

| Feature | Description |
|---------|-------------|
| Multi-Provider | OpenAI, Anthropic Claude, Ollama, Replicate |
| AI Assistants | Specialized assistants with custom prompts |
| Tool Framework | LLMs interact with Odoo data |
| Content Generation | Images, text, and more |

#### AI-Powered Development Architecture

```
┌─────────────────────────────────────────────────────┐
│                    n8n Workflows                     │
├─────────────────────────────────────────────────────┤
│                      OpenRouter                      │
│            (Claude, GPT, Gemini, etc.)              │
├─────────────────────────────────────────────────────┤
│                        Odoo                          │
│   Conversations │ Knowledge │ Prompts │ Tools       │
└─────────────────────────────────────────────────────┘
```

### Production-Grade Best Practices

#### Module Structure

```
my_module/
├── __init__.py
├── __manifest__.py
├── models/              # Business logic (Python)
├── views/               # UI definitions (XML)
├── security/            # Access rights (CSV)
├── data/                # Initial/demo data
├── controllers/         # HTTP routes
├── static/              # Frontend assets (JS/CSS)
├── wizards/             # Transient models
└── tests/               # Unit tests
```

#### Coding Standards

1. **Use ORM** - Avoid raw SQL; use `search`, `create`, `write`
2. **Decorators** - `@api.model`, `@api.depends`, `@api.onchange`
3. **Clean Code** - Meaningful names, consistent formatting
4. **Modular Design** - Small, focused modules with clear dependencies
5. **Testing** - Unit, integration, and performance tests (TDD)

#### Naming Conventions for Customizations

| Scenario | Module Name |
|----------|-------------|
| CRM enhancements | `crm_enhance` |
| Sales enhancements | `sale_enhance` |
| CRM + Sales | `sale_crm_enhance` |
| Team-specific | `sales_team_enhance` |

#### CI/CD Requirements

- Dedicated repository per project
- Feature branches with peer review
- Tagged stable releases for rollback
- Comprehensive documentation

### AI Development Prompts Repository

**GitHub:** [ahmadsheikhi89/devops-ai-prompts](https://github.com/ahmadsheikhi89/devops-ai-prompts)
- 12 production-tested prompts for DevOps automation
- Works with ChatGPT, Claude, and open-source LLMs

---

## 5. Anthropic Claude SDK & Cookbook

### Official SDKs

| SDK | Repository | Installation |
|-----|------------|--------------|
| Python | [anthropics/anthropic-sdk-python](https://github.com/anthropics/anthropic-sdk-python) | `pip install anthropic` |
| TypeScript | [anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript) | `npm install @anthropic-ai/sdk` |
| Java | anthropic-java | Maven/Gradle |
| Go | anthropic-go | `go get` |
| Ruby | anthropic-ruby | `gem install anthropic` |

### Claude Agent SDK (2025)

The Claude Agent SDK evolved from Claude Code's agent framework, providing production-ready capabilities.

```bash
# Python installation
pip install claude-agent-sdk

# TypeScript/Node installation
npm install @anthropic-ai/claude-agent-sdk
```

**Key Features:**
- Context management with automatic compaction
- Permission model for secure tool use
- Session & error management
- Multi-language support (TypeScript, Python)
- Built-in tools (file operations, Bash, web search)
- MCP integration for custom external tools

### Claude Cookbooks

**Main Repository:** [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks)

| Topic | Description |
|-------|-------------|
| **Prompt Caching** | Reduce latency by >2x and costs up to 90% |
| **Tool Use** | Integrate Claude with external tools and functions |
| **RAG** | Retrieval Augmented Generation with vector databases |
| **Skills** | Document generation, data analysis, business automation |

### Prompt Engineering Resources

| Repository | Description |
|------------|-------------|
| [anthropics/prompt-eng-interactive-tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial) | Official interactive prompt engineering tutorial |
| [aws-samples/prompt-engineering-with-anthropic-claude-v-3](https://github.com/aws-samples/prompt-engineering-with-anthropic-claude-v-3) | AWS-hosted tutorial with Example Playgrounds |
| [ThamJiaHe/claude-prompt-engineering-guide](https://github.com/ThamJiaHe/claude-prompt-engineering-guide) | 10-component framework and best practices |

### Official Prompt Library

**URL:** [platform.claude.com/docs/en/resources/prompt-library](https://platform.claude.com/docs/en/resources/prompt-library/library)

Example prompts available:
- **Python bug buster** - Debug Python code
- **SQL sorcerer** - Generate SQL queries
- **Excel formula expert** - Create spreadsheet formulas
- **Code consultant** - General programming advice
- **Website wizard** - Web development assistance

### Claude Code System Prompts

**GitHub:** [Piebald-AI/claude-code-system-prompts](https://github.com/Piebald-AI/claude-code-system-prompts)

Contains:
- All 20 built-in tool descriptions
- Sub-agent prompts (Plan/Explore/Task)
- Utility prompts (CLAUDE.md, compact, statusline)
- Updated for each Claude Code version
- CHANGELOG across 60+ versions

### Tool Use Best Practices

1. **Detailed Descriptions** - Include what the tool returns and how it should be used
2. **Avoid Similar Names** - Distinct tool names prevent confusion
3. **Single-Purpose Tools** - Ideally one level of nested parameters
4. **Parallel Tool Calling** - Enable with `token-efficient-tools-2025-02-19` beta header (Sonnet 3.7)

### Context Engineering Principles

> "Context Engineering is the discipline of optimizing token usage under the inherent constraints of LLMs."

- Leverage prompt caching for repeated context
- Use automatic compaction for long-running tasks
- Structure prompts for maximum information density

---

## 6. OpenAI SDK & Cookbook

### Official SDKs

| SDK | Repository | Installation |
|-----|------------|--------------|
| Python | [openai/openai-python](https://github.com/openai/openai-python) | `pip install openai` |
| Node.js | [openai/openai-node](https://github.com/openai/openai-node) | `npm install openai` |

### OpenAI Agents SDK (2025)

**Repository:** [openai/openai-agents-python](https://github.com/openai/openai-agents-python)

```bash
pip install openai-agents
```

**Key Features:**
- **Agents** - LLMs equipped with instructions and tools
- **Handoffs** - Delegate to other agents for specific tasks
- **Guardrails** - Validate agent inputs and outputs
- **Sessions** - Automatic conversation history
- **Tracing** - Track and debug agent runs

**Supported Integrations:**
- Logfire, AgentOps, Braintrust, Scorecard, Keywords AI

### Responses API (Recommended for New Projects)

The Responses API replaces Chat Completions for new projects.

| Feature | Benefit |
|---------|---------|
| Agentic Loop | Multiple tool calls in one request |
| Built-in Tools | web_search, image_generation, file_search, code_interpreter |
| MCP Support | Remote MCP server integration |
| Cost Reduction | 40-80% improved cache utilization |
| Intelligence | 3% SWE-bench improvement over Chat Completions |

**Note:** Assistants API deprecated August 26, 2025 (sunset: August 26, 2026)

### OpenAI Cookbook

**Main Site:** [cookbook.openai.com](https://cookbook.openai.com/)
**GitHub:** [openai/openai-cookbook](https://github.com/openai/openai-cookbook)

#### Model-Specific Prompting Guides

| Guide | Key Insight |
|-------|-------------|
| [GPT-5 Prompting](https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide) | Best foundation for agentic applications |
| [GPT-5.2 Prompting](https://cookbook.openai.com/examples/gpt-5/gpt-5-2_prompting_guide) | Lower verbosity, stronger instruction adherence |
| [GPT-5-Codex Prompting](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide) | "Less is more" - minimal prompts work best |
| [GPT-4.1 Prompting](https://cookbook.openai.com/examples/gpt4-1_prompting_guide) | Improved tool utilization |
| [Realtime Prompting](https://cookbook.openai.com/examples/realtime_prompting_guide) | Real-time API guidance |

### Reference Implementation

**Codex CLI:** [github.com/openai/codex](https://github.com/openai/codex)
- Fully open-source agent implementation
- Best practices for GPT-5-Codex

### Prompt Engineering Best Practices

#### Reasoning vs GPT Models

| Model Type | Approach |
|------------|----------|
| **Reasoning Models (GPT-5)** | High-level guidance; trust model to work out details |
| **GPT Models** | Explicit instructions for specific outputs |

> "A reasoning model is like a senior co-worker. A GPT model is like a junior coworker."

#### Temperature Settings

| Use Case | Temperature |
|----------|-------------|
| Factual extraction | 0 |
| Data Q&A | 0 |
| Creative writing | 0.7-1.0 |
| Brainstorming | 0.8+ |

### Structured Outputs

**Documentation:** [platform.openai.com/docs/guides/structured-outputs](https://platform.openai.com/docs/guides/structured-outputs)

| Feature | Recommendation |
|---------|----------------|
| JSON Output | Use Structured Outputs (not JSON mode) |
| Tool Integration | Use `response_format` for user-facing outputs |
| Function Calling | Use for connecting to tools/functions/data |

### Best Practices Summary

1. **Be Specific, Keep It Simple** - Focus on what matters
2. **Guide Tone and Format** - Specify desired output structure
3. **Iterate on Prompts** - Review, refine, repeat
4. **Pin Model Versions** - Use specific snapshots (e.g., `gpt-4.1-2025-04-14`)
5. **Use Tools Field** - Don't inject tool descriptions into prompts manually
6. **Clear Tool Names** - Indicate purpose in name and description

---

## 7. Jinja2 Templating Best Practices

Jinja2 is a template engine for Python that generates text output (HTML, XML, SQL, YAML, config files, code) using placeholders and simple logic. It's essential for scaffolding, IaC, and configuration management in the TBWA stack.

### Core Syntax

| Syntax | Purpose | Example |
|--------|---------|---------|
| `{{ ... }}` | Print a value | `{{ user.name }}` |
| `{% ... %}` | Control logic | `{% if user.is_admin %}` |
| `{# ... #}` | Comments | `{# This is ignored #}` |

### TBWA Use Cases

#### 1. Odoo Module Scaffolding (OdooForge)

**Template Structure:**
```
scaffolds/
├── base/
│   ├── __manifest__.py.j2
│   ├── __init__.py.j2
│   └── models/
│       └── model.py.j2
├── controller.py.j2
└── wizard.py.j2
```

**Example `__manifest__.py.j2`:**
```jinja2
{
    'name': '{{ module.name | title }}',
    'version': '{{ odoo_version }}.1.0.0',
    'category': '{{ module.category | default("Uncategorized") }}',
    'summary': '{{ module.summary }}',
    'depends': [
        {% for dep in module.depends -%}
        '{{ dep }}',
        {% endfor %}
    ],
    'data': [
        'security/ir.model.access.csv',
        {% for view in module.views -%}
        'views/{{ view }}_views.xml',
        {% endfor %}
    ],
    'installable': True,
    'application': {{ module.is_application | default(false) | lower }},
}
```

**Example `model.py.j2`:**
```jinja2
from odoo import models, fields, api

class {{ model.name | pascal_case }}(models.Model):
    _name = '{{ model.name | snake_case }}'
    _description = '{{ model.description }}'

    name = fields.Char(string='Name', required=True)
    {% for field in model.fields %}
    {{ field.name }} = fields.{{ field.type }}(
        string='{{ field.label }}',
        {% if field.required %}required=True,{% endif %}
        {% if field.help %}help='{{ field.help }}',{% endif %}
    )
    {% endfor %}
```

#### 2. Ansible Configuration Templates

**`odoo.conf.j2`:**
```jinja2
[options]
admin_passwd = {{ odoo_admin_password | mandatory }}
db_host = {{ db_host | default('localhost') }}
db_port = {{ db_port | default(5432) }}
db_user = {{ db_user }}
db_password = {{ db_password }}
db_name = {{ db_name | default(false) }}
addons_path = {{ odoo_addons_path | join(',') }}
data_dir = {{ odoo_data_dir | default('/var/lib/odoo') }}

{% if odoo_workers is defined and odoo_workers > 0 %}
; Worker configuration
workers = {{ odoo_workers }}
max_cron_threads = {{ odoo_max_cron_threads | default(2) }}
limit_memory_hard = {{ odoo_limit_memory_hard | default(2684354560) }}
limit_memory_soft = {{ odoo_limit_memory_soft | default(2147483648) }}
limit_time_cpu = {{ odoo_limit_time_cpu | default(60) }}
limit_time_real = {{ odoo_limit_time_real | default(120) }}
{% endif %}

{% if odoo_proxy_mode | default(false) %}
proxy_mode = True
{% endif %}
```

**`nginx-odoo.conf.j2`:**
```jinja2
upstream odoo {
    server {{ odoo_host | default('127.0.0.1') }}:{{ odoo_port | default(8069) }};
}

server {
    listen 80;
    server_name {{ domain_name }};

    {% if ssl_enabled | default(false) %}
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name {{ domain_name }};

    ssl_certificate {{ ssl_cert_path }};
    ssl_certificate_key {{ ssl_key_path }};
    {% endif %}

    location / {
        proxy_pass http://odoo;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 3. IaC Config Generation (Terraform/Pulumi)

**`vercel-env.tf.j2`:**
```jinja2
{# Generate Vercel environment variables from config #}
{% for env in environments %}
resource "vercel_project_environment_variable" "{{ env.key | lower | replace('-', '_') }}" {
  project_id = vercel_project.{{ project_name }}.id
  key        = "{{ env.key }}"
  value      = {{ env.value | tojson }}
  target     = {{ env.targets | default(['production', 'preview']) | tojson }}
  {% if env.sensitive | default(false) %}
  sensitive  = true
  {% endif %}
}

{% endfor %}
```

**`supabase-migrations.sql.j2`:**
```jinja2
-- Migration: {{ migration.name }}
-- Generated: {{ now().isoformat() }}

{% if migration.create_schema %}
CREATE SCHEMA IF NOT EXISTS {{ schema_name }};
{% endif %}

{% for table in migration.tables %}
CREATE TABLE IF NOT EXISTS {{ schema_name }}.{{ table.name }} (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    {% for column in table.columns %}
    {{ column.name }} {{ column.type }}{% if column.not_null %} NOT NULL{% endif %}{% if column.default is defined %} DEFAULT {{ column.default }}{% endif %}{% if not loop.last %},{% endif %}

    {% endfor %}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

{% endfor %}
```

### Best Practices Structure

#### Directory Layout

```
infrastructure/templates/
├── _base.j2              # Base template with common macros
├── _filters.py           # Custom filters
├── partials/
│   ├── _header.j2        # Common headers/comments
│   ├── _security.j2      # Security boilerplate
│   └── _imports.j2       # Common imports
├── odoo/
│   ├── manifest.py.j2
│   ├── model.py.j2
│   └── view.xml.j2
├── ansible/
│   ├── odoo.conf.j2
│   └── nginx.conf.j2
└── terraform/
    ├── vercel.tf.j2
    └── supabase.tf.j2
```

#### Custom Filters

```python
# infrastructure/templates/_filters.py
import re

def snake_case(value):
    """Convert CamelCase to snake_case"""
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', value)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def pascal_case(value):
    """Convert snake_case to PascalCase"""
    return ''.join(word.capitalize() for word in value.split('_'))

def odoo_xmlid(module, name):
    """Generate Odoo-compliant XML ID"""
    return f"{module}.{name.replace('.', '_').replace(' ', '_').lower()}"

def sql_safe(value):
    """Escape value for SQL identifiers"""
    return re.sub(r'[^a-zA-Z0-9_]', '', value)

# Register in Jinja environment
def register_filters(env):
    env.filters['snake_case'] = snake_case
    env.filters['pascal_case'] = pascal_case
    env.filters['odoo_xmlid'] = odoo_xmlid
    env.filters['sql_safe'] = sql_safe
```

#### Using Partials/Includes

```jinja2
{# In model.py.j2 #}
{% include 'partials/_header.j2' %}
{% from '_base.j2' import render_field, render_method %}

from odoo import models, fields, api
{% include 'partials/_imports.j2' %}

class {{ model.name | pascal_case }}(models.Model):
    {{ render_field('_name', model.name | snake_case) }}
    {{ render_field('_description', model.description) }}
```

#### Auto-Escaping Configuration

| Context | Setting | Reason |
|---------|---------|--------|
| HTML templates | `autoescape=True` | Prevent XSS |
| SQL templates | Use `| e` filter | Prevent injection |
| XML (Odoo views) | `autoescape=True` | Safe content |
| Config files | `autoescape=False` | No HTML escaping needed |
| Python code | `autoescape=False` | Code generation |

```python
from jinja2 import Environment, FileSystemLoader

# For config/code generation (no HTML escaping)
env = Environment(
    loader=FileSystemLoader('templates'),
    autoescape=False,
    trim_blocks=True,      # Remove first newline after block
    lstrip_blocks=True,    # Strip leading whitespace from blocks
    keep_trailing_newline=True,
)
```

### Linting & Validation

#### j2lint

```bash
# Install
pip install j2lint

# Run linter
j2lint infrastructure/templates/

# Configuration (.j2lint.yaml)
```

```yaml
# .j2lint.yaml
rules:
  jinja-variable-format:
    check_multi_line: true
  jinja-statement-delimiter:
    enabled: true
  single-statement-per-line:
    enabled: true
  operator-enclosed-by-spaces:
    enabled: true
ignore:
  - "partials/_*.j2"  # Ignore partial templates
```

#### VS Code Extension

**Extension:** [samuelcolvin.jinjahtml](https://marketplace.visualstudio.com/items?itemName=samuelcolvin.jinjahtml)

- Syntax highlighting for Jinja templates
- Supports `.j2`, `.jinja`, `.jinja2` extensions
- Works with HTML, XML, YAML, SQL contexts

### GitHub Resources

| Repository | Description |
|------------|-------------|
| [pallets/jinja](https://github.com/pallets/jinja) | Official Jinja2 repository |
| [cookiecutter/cookiecutter](https://github.com/cookiecutter/cookiecutter) | Project templates using Jinja2 |
| [ansible/ansible](https://github.com/ansible/ansible) | Ansible uses Jinja2 extensively |

---

## 8. Recommendations for TBWA Integration

### Immediate Actions

#### 1. Chrome DevTools MCP Setup

```bash
# For Claude Code users
claude mcp add chrome-devtools npx chrome-devtools-mcp@latest
```

Benefits for Scout Dashboard:
- Real-time performance debugging
- Network request analysis
- Core Web Vitals monitoring (LCP, CLS, INP)

#### 2. VS Code Extensions to Install

```json
// .vscode/extensions.json
{
  "recommendations": [
    "frenco.vscode-vercel",
    "HashiCorp.terraform",
    "pulumi.pulumi",
    "trinhanhngoc.vscode-odoo",
    "mstuttgart.odoo-scaffold"
  ]
}
```

#### 3. IaC for TBWA Infrastructure

For Vercel + Supabase + Odoo architecture:

```hcl
# infrastructure/terraform/main.tf

provider "vercel" {
  api_token = var.vercel_token
}

resource "vercel_project" "scout_dashboard" {
  name      = "scout-dashboard"
  framework = "nextjs"

  git_repository {
    type = "github"
    repo = "jgtolentino/tbwa-agency-databank"
  }

  environment {
    key    = "NEXT_PUBLIC_SUPABASE_URL"
    value  = var.supabase_url
    target = ["production", "preview"]
  }
}
```

#### 4. Odoo Integration Setup

For the `jgtolentino/odoo-ce` backend:

1. Install VS Code Odoo IDE extension
2. Configure `odoo-scaffold` for module generation
3. Set up LLM Integration Base for AI-powered development

### Recommended GitHub Templates

| Use Case | Repository |
|----------|------------|
| Pulumi DevContainer | [pulumi/devcontainer](https://github.com/pulumi/devcontainer) |
| Odoo Dev Environment | [humiu/odoo-dev-env](https://github.com/humiu/odoo-dev-env) |
| AI Prompts for DevOps | [ahmadsheikhi89/devops-ai-prompts](https://github.com/ahmadsheikhi89/devops-ai-prompts) |
| System Prompts Collection | [x1xhlol/system-prompts-and-models-of-ai-tools](https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools) |

---

## Sources

### Chrome DevTools
- [Chrome DevTools Documentation](https://developer.chrome.com/docs/devtools/)
- [AI Assistance Guide](https://developer.chrome.com/docs/devtools/ai-assistance) - Gemini-powered debugging
- [How We Introduced Gemini to DevTools](https://developer.chrome.com/blog/how-we-introduced-gemini-to-devtools) - Implementation details
- [What's New in DevTools Chrome 131](https://developer.chrome.com/blog/new-in-devtools-131) - AI assistance updates
- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [Google I/O 2025 Web Updates](https://developer.chrome.com/blog/web-at-io25) - CSS carousels, AI DevTools, Prompt API

### Vercel
- [VSCode Vercel Extension](https://marketplace.visualstudio.com/items?itemName=frenco.vscode-vercel)
- [Vercel Terraform Provider](https://github.com/vercel/terraform-provider-vercel)
- [Pulumi Vercel Provider](https://www.pulumi.com/registry/packages/vercel/)
- [HashiCorp Preview Environments Tutorial](https://developer.hashicorp.com/terraform/tutorials/applications/preview-environments-vercel)

### VS Code IaC
- [HashiCorp Terraform Extension](https://marketplace.visualstudio.com/items?itemName=HashiCorp.terraform)
- [Pulumi VS Code Tools](https://github.com/pulumi/pulumi-vscode-tools)
- [IaC Tools Comparison 2025](https://atmosly.com/blog/iac-tools-comparison-terraform-vs-pulumi-2025-guide)

### Odoo
- [Odoo IDE Extension](https://github.com/odoo-ide/vscode-odoo)
- [Odoo Scaffold Extension](https://github.com/mstuttgart/vscode-odoo-scaffold)
- [Odoo LLM Integration](https://github.com/apexive/odoo-llm)
- [Developing Odoo Modules with AI](https://oduist.com/blog/odoo-experience-2025-ai-summaries-2/357-developing-odoo-modules-using-ai-a-practical-guide-358)
- [Odoo 19 Best Practices](https://bytelegions.com/custom-modules-in-odoo-19-best-practices-for-devs/)

### Anthropic Claude
- [Claude Cookbooks](https://github.com/anthropics/claude-cookbooks)
- [Anthropic SDK TypeScript](https://github.com/anthropics/anthropic-sdk-typescript)
- [Prompt Engineering Tutorial](https://github.com/anthropics/prompt-eng-interactive-tutorial)
- [AWS Claude Prompt Engineering](https://github.com/aws-samples/prompt-engineering-with-anthropic-claude-v-3)
- [Claude Prompt Library](https://platform.claude.com/docs/en/resources/prompt-library/library)
- [Claude Code System Prompts](https://github.com/Piebald-AI/claude-code-system-prompts)
- [Claude API Development Guide](https://www.anthropic.com/learn/build-with-claude)
- [Tool Use Implementation](https://platform.claude.com/docs/en/agents-and-tools/tool-use/implement-tool-use)

### OpenAI
- [OpenAI Cookbook](https://cookbook.openai.com/)
- [OpenAI Cookbook GitHub](https://github.com/openai/openai-cookbook)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering)
- [Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [GPT-5 Prompting Guide](https://cookbook.openai.com/examples/gpt-5/gpt-5_prompting_guide)
- [GPT-5-Codex Prompting Guide](https://cookbook.openai.com/examples/gpt-5-codex_prompting_guide)
- [Responses API Migration](https://platform.openai.com/docs/guides/migrate-to-responses)
- [Codex CLI](https://github.com/openai/codex)

### Jinja2 Templating
- [Jinja2 Official Documentation](https://jinja.palletsprojects.com/)
- [Jinja2 GitHub](https://github.com/pallets/jinja)
- [Cookiecutter](https://github.com/cookiecutter/cookiecutter) - Project templates using Jinja2
- [j2lint](https://pypi.org/project/j2lint/) - Jinja2 linter
- [VS Code Jinja Extension](https://marketplace.visualstudio.com/items?itemName=samuelcolvin.jinjahtml)
- [Ansible Templating Guide](https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_templating.html)
