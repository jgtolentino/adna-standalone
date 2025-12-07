# Superset Dashboard Specifications - Quick Reference

## Dashboard 1: Finance Control Room

**Purpose**: Real-time month-end closing task management
**Primary Users**: Finance Supervisors, Finance Managers, Finance Director
**Refresh**: Every 5 minutes

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Open Tasks: 23] [Blocked: 5] [Done: 142]             │
├─────────────────────────────────────────────────────────┤
│  Task Distribution by Cluster        │ Tasks Over Time  │
│  (Bar Chart)                         │ (Area Chart)     │
├──────────────────────────────────────┴──────────────────┤
│  Task Details Table (Upcoming & Overdue)                │
└─────────────────────────────────────────────────────────┘
```

### Chart Specs

#### 1. Open Tasks (KPI)
```json
{
  "viz_type": "big_number_total",
  "datasource": "Finance – Closing Snapshots",
  "metric": "SUM(open_tasks)",
  "time_grain_sqla": "P1D",
  "color_scheme": "orange",
  "y_axis_format": ",.0f"
}
```

#### 2. Task Distribution (Bar)
```json
{
  "viz_type": "dist_bar",
  "datasource": "Finance – Closing Tasks Summary",
  "groupby": ["cluster"],
  "metrics": ["SUM(task_count)"],
  "columns": ["status"],
  "color_scheme": "supersetColors",
  "x_axis_label": "Task Count",
  "y_axis_label": "Cluster"
}
```

#### 3. Tasks Over Time (Area)
```json
{
  "viz_type": "area",
  "datasource": "Finance – Closing Snapshots",
  "granularity_sqla": "captured_at",
  "time_grain_sqla": "P1D",
  "metrics": [
    "SUM(open_tasks)",
    "SUM(done_tasks)",
    "SUM(blocked_tasks)"
  ],
  "line_interpolation": "linear",
  "show_legend": true
}
```

### Filters
- **Period Month** (Date Range): Default last 3 months
- **Cluster** (Multi-select): A, B, C, D
- **Status** (Multi-select): Open, Done, Blocked
- **Owner Email** (Search): Autocomplete

---

## Dashboard 2: BIR Compliance Tracker

**Purpose**: Statutory filing deadline monitoring & compliance
**Primary Users**: Finance Supervisors, Senior Finance Manager
**Refresh**: Every 30 minutes

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Active Filings: 8] [Overdue: 0] [Due <7d: 3]         │
├─────────────────────────────────────────────────────────┤
│  Deadline Status       │ Upcoming Deadlines Timeline    │
│  Heatmap               │ (Gantt-style)                  │
├────────────────────────┴────────────────────────────────┤
│  Filing Details Table (Next 90 days)                    │
└─────────────────────────────────────────────────────────┘
```

### Chart Specs

#### 1. Active Filings KPI
```json
{
  "viz_type": "big_number",
  "datasource": "Finance – BIR Filing Status",
  "metric": "COUNT(*)",
  "adhoc_filters": [
    {
      "clause": "WHERE",
      "subject": "filing_status",
      "operator": "!=",
      "comparator": "Done"
    }
  ],
  "header_font_size": 0.4,
  "subheader_font_size": 0.15
}
```

#### 2. Deadline Status Heatmap
```json
{
  "viz_type": "heatmap",
  "datasource": "Finance – BIR Filing Status",
  "all_columns_x": "form_code",
  "all_columns_y": "filing_status",
  "metric": "COUNT(*)",
  "linear_color_scheme": "red_yellow_green",
  "normalize_across": "heatmap"
}
```

#### 3. Filing Details Table
```json
{
  "viz_type": "table",
  "datasource": "Finance – BIR Filing Status",
  "query_mode": "aggregate",
  "groupby": [
    "form_code",
    "form_description",
    "period_covered",
    "bir_deadline",
    "filing_status",
    "days_to_bir_deadline",
    "finance_supervisor_email"
  ],
  "all_columns": [],
  "metrics": [],
  "order_desc": false,
  "row_limit": 100,
  "conditional_formatting": [
    {
      "column": "days_to_bir_deadline",
      "operator": "<",
      "targetValue": 7,
      "colorScheme": "#E63946"
    }
  ]
}
```

### Filters
- **Form Code** (Multi-select): 1601-C, 0619-E, 2550Q, etc.
- **Filing Status** (Multi-select): Not Started, In Progress, Done
- **Date Range** (bir_deadline): Default next 90 days
- **Responsible Person** (Multi-select): Supervisor, Manager, Director emails

---

## Dashboard 3: AI / RAG Activity Monitor

**Purpose**: OPEX assistant usage tracking & error monitoring
**Primary Users**: DevOps, Finance Director, AI Team
**Refresh**: Every 1 minute (real-time monitoring)

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  [Queries (7d): 1,234] [Error Rate: 2.3%] [Avg Time]   │
├─────────────────────────────────────────────────────────┤
│  Query Volume Trend    │ Activity by Assistant          │
│  (Line Chart)          │ (Horizontal Bar)               │
├────────────────────────┼────────────────────────────────┤
│  Event Type Dist.      │ Top Error Days Table           │
│  (Stacked Bar)         │                                │
└─────────────────────────────────────────────────────────┘
```

### Chart Specs

#### 1. Query Volume Trend
```json
{
  "viz_type": "line",
  "datasource": "Finance – RAG Usage Daily",
  "granularity_sqla": "query_date",
  "time_grain_sqla": "P1D",
  "metrics": [
    {
      "label": "Total Queries",
      "expressionType": "SIMPLE",
      "column": {
        "column_name": "query_count"
      },
      "aggregate": "SUM"
    },
    {
      "label": "Errors",
      "expressionType": "SIMPLE",
      "column": {
        "column_name": "error_count"
      },
      "aggregate": "SUM"
    }
  ],
  "groupby": ["assistant"],
  "rolling_type": "mean",
  "rolling_periods": 7
}
```

#### 2. Error Rate KPI
```json
{
  "viz_type": "big_number",
  "datasource": "Finance – RAG Usage Daily",
  "metric": {
    "expressionType": "SQL",
    "sqlExpression": "SUM(error_count) / NULLIF(SUM(query_count), 0) * 100",
    "label": "Error Rate %"
  },
  "time_range": "Last 7 days",
  "y_axis_format": ".2f",
  "color_picker": {
    "r": 230,
    "g": 57,
    "b": 70,
    "a": 1
  }
}
```

#### 3. Event Type Distribution
```json
{
  "viz_type": "dist_bar",
  "datasource": "Finance – RAG Logs by Event",
  "granularity_sqla": "event_date",
  "time_grain_sqla": "P1D",
  "groupby": [],
  "columns": ["event_type"],
  "metrics": ["SUM(event_count)"],
  "show_bar_value": true,
  "bar_stacked": true
}
```

### Filters
- **Date Range** (query_date): Default last 30 days
- **Assistant** (Multi-select): opex_assistant, finance_bot, etc.
- **Event Type** (Multi-select): query, response, error, timeout

---

## Color Schemes

### TBWA Brand Colors
```json
{
  "primary": "#FFDC00",      // TBWA Yellow
  "secondary": "#000000",    // TBWA Black
  "success": "#06D6A0",      // Green
  "warning": "#FF6B35",      // Orange
  "danger": "#E63946",       // Red
  "info": "#457B9D",         // Blue
  "text": "#1D3557"          // Dark Blue
}
```

### Status Color Mapping
- **Done/Filed/Success**: `#06D6A0` (Green)
- **In Progress/Active**: `#FF6B35` (Orange)
- **Blocked/Overdue/Error**: `#E63946` (Red)
- **Not Started/Pending**: `#457B9D` (Blue)

---

## Conditional Formatting Rules

### Task Table
```javascript
// Days to Due - Red Alert
if (days_to_due < 0) {
  backgroundColor = '#E63946';
  color = '#FFFFFF';
}
// Days to Due - Warning
else if (days_to_due < 3) {
  backgroundColor = '#FF6B35';
  color = '#FFFFFF';
}

// Status - Color Coded
if (status === 'Done') {
  color = '#06D6A0';
}
else if (status === 'Blocked') {
  color = '#E63946';
}
```

### BIR Filings
```javascript
// Days to Deadline - Urgent
if (days_to_bir_deadline < 7) {
  backgroundColor = '#E63946';
  fontWeight = 'bold';
}
// Days to Deadline - Soon
else if (days_to_bir_deadline < 14) {
  backgroundColor = '#FF6B35';
}
```

---

## Performance Optimization

### Caching Strategy
```python
# superset_config.py
DATA_CACHE_CONFIG = {
    'CACHE_TYPE': 'redis',
    'CACHE_DEFAULT_TIMEOUT': 300,  # 5 minutes
    'CACHE_KEY_PREFIX': 'superset_finance_',
}

# Per-dataset cache timeouts
CUSTOM_CACHE_TIMEOUTS = {
    'Finance – RAG Usage Daily': 60,        # 1 min (real-time)
    'Finance – BIR Filing Status': 1800,    # 30 min
    'Finance – Closing Tasks': 300,         # 5 min
}
```

### Query Optimization
```sql
-- Add indexes to frequently filtered columns
CREATE INDEX idx_closing_task_cluster_status
  ON public.closing_task(cluster, status);

CREATE INDEX idx_bir_filing_deadline_status
  ON public.bir_filing(bir_deadline, filing_status);

CREATE INDEX idx_rag_queries_created_assistant
  ON public.rag_queries(created_at, assistant);

-- Analyze tables for query planner
ANALYZE public.closing_task;
ANALYZE public.bir_filing;
ANALYZE public.rag_queries;
```

---

## User Roles & Permissions

### Role Matrix
| Role               | SQL Lab | Create Charts | Edit Dashboards | View Dashboards |
| ------------------ | ------- | ------------- | --------------- | --------------- |
| Finance Viewer     | ❌      | ❌            | ❌              | ✅              |
| Finance Analyst    | ✅      | ✅            | ❌              | ✅              |
| Finance Manager    | ✅      | ✅            | ✅              | ✅              |
| Finance Admin      | ✅      | ✅            | ✅              | ✅              |

### Dataset Access
```sql
-- Grant SELECT to analytics_finance schema
GRANT USAGE ON SCHEMA analytics_finance TO finance_service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics_finance TO finance_service_role;

-- Future tables auto-grant
ALTER DEFAULT PRIVILEGES IN SCHEMA analytics_finance
  GRANT SELECT ON TABLES TO finance_service_role;
```

---

## Embedding Dashboards

### Iframe Embed (for n8n / Internal Apps)
```html
<!-- Finance Control Room -->
<iframe
  src="https://superset.insightpulseai.net/superset/dashboard/finance-control-room/?standalone=true"
  width="100%"
  height="800"
  frameborder="0"
></iframe>
```

### Guest Token Embed (for External Apps)
```python
# Generate guest token (Superset API)
import requests

guest_token = requests.post(
    'https://superset.insightpulseai.net/api/v1/security/guest_token/',
    json={
        'user': {'username': 'guest', 'first_name': 'Guest', 'last_name': 'User'},
        'resources': [{'type': 'dashboard', 'id': 'finance-control-room'}],
        'rls': [{'clause': "cluster = 'A'"}]  # Row-level security
    },
    headers={'Authorization': 'Bearer YOUR_API_TOKEN'}
).json()['token']

# Use in iframe
embed_url = f"https://superset.insightpulseai.net/superset/dashboard/finance-control-room/?guest_token={guest_token}"
```

---

## Alerting Setup

### Critical Deadline Alert
```yaml
Dashboard: BIR Compliance Tracker
Chart: Active Filings KPI
Condition: COUNT(*) WHERE days_to_bir_deadline < 7 AND filing_status != 'Done' > 0
Recipients: finance_supervisor@tbwa.com, finance_manager@tbwa.com
Schedule: Daily at 9 AM
Notification: Email + Slack #finance-alerts
```

### Task Overdue Alert
```yaml
Dashboard: Finance Control Room
Chart: Task Details Table
Condition: COUNT(*) WHERE days_to_due < 0 > 0
Recipients: finance_director@tbwa.com
Schedule: Every hour
Notification: Email (high priority)
```

### Error Spike Alert
```yaml
Dashboard: RAG Activity Monitor
Chart: Error Rate KPI
Condition: Error Rate % > 5.0
Recipients: devops@tbwa.com, ai_team@tbwa.com
Schedule: Real-time (every 5 min)
Notification: Slack #devops-alerts
```

---

**Last Updated**: 2025-12-06
**Version**: 1.0
**Maintained by**: Finance SSC / DevOps Team
