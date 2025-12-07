# Superset Finance Analytics Setup Guide

## Overview

This guide sets up **Apache Superset** dashboards for TBWA Finance / OPEX control room using Supabase as the data source.

**Target Superset instance**: `superset.insightpulseai.net`
**Supabase project**: `ublqmilcjtpnflofprkr` (opex)

---

## 1. Apply Analytics Views Migration

### Prerequisites
- PostgreSQL client (`psql`) installed
- Supabase connection credentials (password)
- Access to `superset.insightpulseai.net`

### Apply Migration

**Option A: Using migration script**
```bash
bash /tmp/apply_superset_migration.sh
# Enter password when prompted
```

**Option B: Direct psql command**
```bash
# Replace YOUR_PASSWORD with actual Supabase postgres password
psql 'postgresql://postgres.ublqmilcjtpnflofprkr:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres' \
  -f infrastructure/database/supabase/migrations/050_superset_finance_analytics_views.sql
```

### Verify Views Created
```bash
psql 'postgresql://postgres.ublqmilcjtpnflofprkr:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres' \
  -c "SELECT schemaname, viewname FROM pg_views WHERE schemaname = 'analytics_finance' ORDER BY viewname;"
```

**Expected output: 8 views**
- `vw_bir_filing_calendar`
- `vw_bir_filing_status`
- `vw_closing_tasks`
- `vw_closing_tasks_summary`
- `vw_finance_closing_snapshots`
- `vw_finance_monthly_capacity`
- `vw_rag_logs_by_event`
- `vw_rag_usage_daily`

---

## 2. Configure Superset Database Connection

### 2.1 Access Superset
Navigate to: `https://superset.insightpulseai.net`

### 2.2 Add/Verify PostgreSQL Database
1. **Settings** → **Database Connections** → **+ DATABASE**
2. Select **PostgreSQL**
3. Configure connection:

**Display Name**: `TBWA Finance OPEX`

**SQLAlchemy URI**:
```text
postgresql://postgres.ublqmilcjtpnflofprkr:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Advanced → SQL Lab**:
- ✅ Expose database in SQL Lab
- ✅ Allow CREATE TABLE AS
- ✅ Allow CREATE VIEW AS
- ✅ Allow DML

4. **TEST CONNECTION** → Should return ✅ success
5. Click **CONNECT**

---

## 3. Register Datasets

Navigate to **Datasets** → **+ DATASET** for each view:

| Superset Dataset Name           | Schema                | View Name                                |
| ------------------------------- | --------------------- | ---------------------------------------- |
| Finance – BIR Filing Status     | `analytics_finance`   | `vw_bir_filing_status`                   |
| Finance – BIR Filing Calendar   | `analytics_finance`   | `vw_bir_filing_calendar`                 |
| Finance – Closing Tasks         | `analytics_finance`   | `vw_closing_tasks`                       |
| Finance – Closing Tasks Summary | `analytics_finance`   | `vw_closing_tasks_summary`               |
| Finance – Closing Snapshots     | `analytics_finance`   | `vw_finance_closing_snapshots`           |
| Finance – Monthly Capacity      | `analytics_finance`   | `vw_finance_monthly_capacity`            |
| Finance – RAG Usage Daily       | `analytics_finance`   | `vw_rag_usage_daily`                     |
| Finance – RAG Logs by Event     | `analytics_finance`   | `vw_rag_logs_by_event`                   |

**For each dataset:**
1. Database: `TBWA Finance OPEX`
2. Schema: `analytics_finance`
3. Table: Select view name
4. Click **CREATE DATASET AND CREATE CHART** (or just **ADD**)

---

## 4. Build Dashboards

### 4.1 Dashboard 1: "Finance Control Room"

**Purpose**: Month-end closing task tracking

**Datasets Used**:
- `Finance – Closing Tasks`
- `Finance – Closing Tasks Summary`
- `Finance – Closing Snapshots`
- `Finance – Monthly Capacity`

**Charts to Create**:

#### A. KPI Cards (Big Number)
1. **Open Tasks**
   - Dataset: `Finance – Closing Snapshots`
   - Metric: `SUM(open_tasks)`
   - Time grain: Latest snapshot
   - Color: Orange (#FF6B35)

2. **Blocked Tasks**
   - Dataset: `Finance – Closing Snapshots`
   - Metric: `SUM(blocked_tasks)`
   - Color: Red (#E63946)

3. **Done Tasks**
   - Dataset: `Finance – Closing Snapshots`
   - Metric: `SUM(done_tasks)`
   - Color: Green (#06D6A0)

#### B. Task Distribution by Cluster (Bar Chart)
- Chart Type: **Bar Chart**
- Dataset: `Finance – Closing Tasks Summary`
- X-axis: `cluster`
- Y-axis: `SUM(task_count)`
- Group by: `status`
- Color scheme: Status-based (Done=green, Open=orange, Blocked=red)

#### C. Tasks Over Time (Line/Area Chart)
- Chart Type: **Area Chart**
- Dataset: `Finance – Closing Snapshots`
- X-axis: `captured_at` (time grain: Day)
- Metrics:
  - `SUM(open_tasks)` (orange)
  - `SUM(done_tasks)` (green)
  - `SUM(blocked_tasks)` (red)

#### D. Task Details Table
- Chart Type: **Table**
- Dataset: `Finance – Closing Tasks`
- Columns:
  - `task_name`
  - `cluster`
  - `owner_email`
  - `status`
  - `due_date`
  - `days_to_due` (conditional formatting: red if <0, orange if <3)
- Sort: `days_to_due` ascending
- Limit: 50

**Dashboard Filters**:
- Period month (`period_month`)
- Cluster (A, B, C, D)
- Status (Open, Done, Blocked)
- Owner email

---

### 4.2 Dashboard 2: "BIR Compliance Tracker"

**Purpose**: Statutory filing deadline monitoring

**Datasets Used**:
- `Finance – BIR Filing Status`
- `Finance – BIR Filing Calendar`

**Charts to Create**:

#### A. Active Filings KPI
- Chart Type: **Big Number with Trendline**
- Dataset: `Finance – BIR Filing Status`
- Metric: `COUNT(*)` where `filing_status != 'Done'`
- Filter: `bir_deadline >= today`
- Color: Red if >5, Orange if >2, Green otherwise

#### B. Deadline Status Heatmap
- Chart Type: **Heatmap**
- Dataset: `Finance – BIR Filing Status`
- Rows: `form_code`
- Columns: `filing_status`
- Metric: `COUNT(*)`
- Color scale: Red (many) to Green (few)

#### C. Upcoming Deadlines Timeline
- Chart Type: **Gantt / Event Flow**
- Dataset: `Finance – BIR Filing Calendar`
- X-axis: `filing_deadline` (next 90 days)
- Y-axis: `form_code`
- Color: `days_to_deadline` (red <7, orange <14, green ≥14)

#### D. Filings by Status (Pie Chart)
- Chart Type: **Pie Chart**
- Dataset: `Finance – BIR Filing Status`
- Dimension: `filing_status`
- Metric: `COUNT(*)`

#### E. Filing Details Table
- Chart Type: **Table**
- Dataset: `Finance – BIR Filing Status`
- Columns:
  - `form_code`
  - `form_description`
  - `period_covered`
  - `bir_deadline`
  - `filing_status`
  - `days_to_bir_deadline` (conditional: red if <7)
  - `finance_supervisor_email`
- Sort: `days_to_bir_deadline` ascending
- Filter: `filing_status != 'Done'`

**Dashboard Filters**:
- Form code (1601-C, 2550Q, etc.)
- Filing status
- Date range (based on `bir_deadline`)
- Responsible person (supervisor/manager/director email)

---

### 4.3 Dashboard 3: "AI / RAG Activity Monitor"

**Purpose**: OPEX assistant usage and error tracking

**Datasets Used**:
- `Finance – RAG Usage Daily`
- `Finance – RAG Logs by Event`

**Charts to Create**:

#### A. Query Volume Trend (Line Chart)
- Chart Type: **Line Chart**
- Dataset: `Finance – RAG Usage Daily`
- X-axis: `query_date` (time grain: Day)
- Metrics:
  - `SUM(query_count)` (primary y-axis)
  - `SUM(error_count)` (secondary y-axis, red)
- Group by: `assistant`
- Rolling average: 7-day MA

#### B. Error Rate KPI
- Chart Type: **Big Number**
- Dataset: `Finance – RAG Usage Daily`
- Metric: `SUM(error_count) / SUM(query_count) * 100` (%)
- Time range: Last 7 days
- Conditional: Red if >5%, Orange if >2%, Green otherwise

#### C. Activity by Assistant (Bar Chart)
- Chart Type: **Bar Chart (Horizontal)**
- Dataset: `Finance – RAG Usage Daily`
- X-axis: `SUM(query_count)`
- Y-axis: `assistant`
- Color: Assistant-specific

#### D. Event Type Distribution (Stacked Bar)
- Chart Type: **Stacked Bar Chart**
- Dataset: `Finance – RAG Logs by Event`
- X-axis: `event_date` (time grain: Day)
- Y-axis: `SUM(event_count)`
- Group by: `event_type`
- Stacking: Normal

#### E. Top Error Days Table
- Chart Type: **Table**
- Dataset: `Finance – RAG Usage Daily`
- Columns:
  - `query_date`
  - `assistant`
  - `query_count`
  - `error_count`
  - Computed: `error_count / query_count` (as %)
- Sort: Error rate descending
- Filter: `error_count > 0`
- Limit: 20

**Dashboard Filters**:
- Date range
- Assistant
- Event type (for logs)

---

## 5. Dashboard Assembly

### Create Dashboard Shell
1. **Dashboards** → **+ DASHBOARD**
2. Name: `Finance Control Room` (or `BIR Compliance` / `RAG Monitor`)
3. Add charts via **+ ADD CHART** or drag existing charts
4. Arrange in grid layout:
   - Top row: KPI cards (3-4 cards)
   - Middle rows: Main visualizations (2-3 charts per row)
   - Bottom: Detailed tables

### Apply Filters
1. **EDIT DASHBOARD** → **FILTERS**
2. Add filter scopes for each filter type
3. Link filters to relevant charts
4. **SAVE**

### Set Refresh Schedule (Optional)
1. **⋮** (dashboard menu) → **Set auto-refresh interval**
2. Options: 1 min, 5 min, 30 min, 1 hour
3. For production dashboards: 5-30 min recommended

---

## 6. Access Control & Security

### Row-Level Security (Future Enhancement)
To filter data by cluster/office:

```sql
-- Example RLS policy on closing_task
ALTER TABLE public.closing_task ENABLE ROW LEVEL SECURITY;

CREATE POLICY cluster_access ON public.closing_task
  FOR SELECT
  USING (
    cluster = current_setting('app.user_cluster', TRUE)
    OR current_setting('app.user_role', TRUE) IN ('Finance Director', 'Admin')
  );
```

**In Superset**:
1. Settings → Database → Advanced → SQL Lab
2. Add to **SQL Lab Session Configuration**:
   ```json
   {
     "app.user_cluster": "{{ user_attributes.cluster }}",
     "app.user_role": "{{ user_attributes.role }}"
   }
   ```

### Superset Roles
Create role-based access:
1. **Settings** → **List Roles**
2. Create custom roles:
   - `Finance Viewer` - Read-only dashboards
   - `Finance Analyst` - SQL Lab + chart creation
   - `Finance Admin` - Full access

---

## 7. Theming (TBWA Brand)

Edit `superset_config.py` (on Superset server):

```python
# TBWA brand colors
THEME_OVERRIDES = {
    "colors": {
        "primary": {
            "base": "#FFDC00",  # TBWA Yellow
            "dark1": "#000000", # TBWA Black
        },
        "secondary": {
            "base": "#000000",
        },
        "success": {
            "base": "#06D6A0",
        },
        "warning": {
            "base": "#FF6B35",
        },
        "danger": {
            "base": "#E63946",
        },
    },
    "typography": {
        "families": {
            "sansSerif": "'Helvetica Neue', Arial, sans-serif",
        },
    },
}
```

Restart Superset:
```bash
superset run -h 0.0.0.0 -p 8088 --reload
```

---

## 8. Validation & Testing

### Data Quality Checks
```sql
-- Check view row counts
SELECT
  'vw_bir_filing_status' AS view_name,
  COUNT(*) AS row_count
FROM analytics_finance.vw_bir_filing_status
UNION ALL
SELECT 'vw_closing_tasks', COUNT(*) FROM analytics_finance.vw_closing_tasks
UNION ALL
SELECT 'vw_rag_usage_daily', COUNT(*) FROM analytics_finance.vw_rag_usage_daily;
```

### Dashboard Performance
- Target: <3s load time for all dashboards
- Monitor via **Chart → ⋮ → View query** → Check execution time
- Optimize slow queries:
  - Add indexes on frequently filtered columns
  - Materialize complex views as tables (if needed)
  - Use Superset caching (Settings → Database → Cache timeout)

### Acceptance Gates
✅ All 8 views created in `analytics_finance` schema
✅ Superset database connection test passes
✅ All 8 datasets registered and synced
✅ 3 dashboards created with all specified charts
✅ Dashboard filters functional
✅ No SQL errors in chart execution
✅ Load time <3s per dashboard

---

## 9. Next Steps

### Short-term
- [ ] Add more granular task tracking (per-employee breakdowns)
- [ ] Set up email/Slack alerts for critical deadlines (Superset Alerts)
- [ ] Create embedded dashboard views for n8n workflows

### Medium-term
- [ ] Implement RLS for multi-agency access control
- [ ] Add predictive analytics (ML models for task completion estimates)
- [ ] Build mobile-responsive dashboard variants

### Long-term
- [ ] Integrate with Clarity PPM data (project financials sync)
- [ ] Add natural language querying (Superset SQL Lab + LLM)
- [ ] Create executive summary dashboard with AI-generated insights

---

## Troubleshooting

### Common Issues

**Issue**: "Table not found" error when creating dataset
**Solution**: Verify views exist: `\dv analytics_finance.*` in psql

**Issue**: Dashboard charts load slowly (>5s)
**Solution**:
- Check view query performance with `EXPLAIN ANALYZE`
- Add indexes: `CREATE INDEX ON public.closing_task(cluster, status, due_date);`
- Enable Superset caching: Database settings → Cache timeout (3600s)

**Issue**: Filters not affecting charts
**Solution**:
- Edit dashboard → FILTERS → Verify filter scope includes target charts
- Check dataset column types match (text vs varchar, timestamp vs date)

**Issue**: Authentication errors when connecting to Supabase
**Solution**:
- Verify password in SQLAlchemy URI
- Check Supabase project is not paused (free tier auto-pauses after 7 days inactivity)
- Use connection pooler port 6543 (not direct port 5432) for better stability

---

## Resources

- **Superset Documentation**: https://superset.apache.org/docs/intro
- **Supabase Pooler**: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- **TBWA Brand Guidelines**: [Internal SharePoint link]

---

**Last Updated**: 2025-12-06
**Maintained by**: Finance SSC / DevOps Team
