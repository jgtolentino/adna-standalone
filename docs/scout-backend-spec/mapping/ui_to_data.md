# Scout Dashboard: UI Component → Data Query Mapping

## Overview
Maps each visible UI component to its corresponding backend data source and query logic.

---

## KPI Tiles (Top Section)

### Daily Volume Tile
```
Component: <KpiTile metric="volume" />

Display:
- Value: 649 (integer count)
- % Change: +12.3% (green ↗)
- Label: "Daily Volume"

Data Source: get_dashboard_summary RPC
Request:
{
  "analysis_mode": "single",
  "brand_ids": null,
  "category_ids": null,
  "region_ids": null,
  "store_ids": null,
  "date_from": "2025-08-21",
  "date_to": "2025-09-15",
  "time_period": "daily"
}

Query (SQL):
SELECT
  COUNT(DISTINCT t.id) as value,
  (SELECT COUNT(*) FROM transactions
   WHERE org_id = t.org_id
   AND transaction_date BETWEEN '2025-07-21' AND '2025-08-15') as baseline
FROM transactions t
WHERE t.org_id = current_org_id
  AND t.transaction_date BETWEEN '2025-08-21' AND '2025-09-15'

Response:
{ "value": 649, "percent_change": 12.3, "trend": "up" }
```

---

### Daily Revenue Tile
```
Component: <KpiTile metric="revenue" />

Display:
- Value: ₱135,785 (formatted currency)
- % Change: -13.1% (red ↘)
- Label: "Daily Revenue"

Data Source: get_dashboard_summary RPC

Query (SQL):
SELECT
  SUM(t.total_amount) as value,
  (SELECT SUM(total_amount) FROM transactions
   WHERE org_id = t.org_id
   AND transaction_date BETWEEN '2025-07-21' AND '2025-08-15') as baseline
FROM transactions t
WHERE t.org_id = current_org_id
  AND t.transaction_date BETWEEN '2025-08-21' AND '2025-09-15'

Response:
{ "value": 135785.00, "currency": "PHP", "percent_change": -13.1, "trend": "down" }
```

---

### Avg Basket Size Tile
```
Component: <KpiTile metric="basket_size" />

Display:
- Value: 2.4 (1 decimal)
- % Change: +5.7% (green ↗)
- Label: "Avg Basket Size"

Data Source: get_dashboard_summary RPC

Query (SQL):
SELECT
  SUM(t.line_item_count) / COUNT(t.id)::FLOAT as value,
  (SELECT SUM(line_item_count) / COUNT(id) FROM transactions
   WHERE org_id = t.org_id
   AND transaction_date BETWEEN '2025-07-21' AND '2025-08-15') as baseline
FROM transactions t
WHERE t.org_id = current_org_id
  AND t.transaction_date BETWEEN '2025-08-21' AND '2025-09-15'

Response:
{ "value": 2.4, "percent_change": 5.7, "trend": "up" }
```

---

### Avg Duration Tile
```
Component: <KpiTile metric="duration" />

Display:
- Value: 42s (integer seconds)
- % Change: -8.2% (red ↘)
- Label: "Avg Duration"

Data Source: get_dashboard_summary RPC

Query (SQL):
SELECT
  AVG(t.duration_seconds)::INT as value,
  (SELECT AVG(duration_seconds) FROM transactions
   WHERE org_id = t.org_id
   AND transaction_date BETWEEN '2025-07-21' AND '2025-08-15') as baseline
FROM transactions t
WHERE t.org_id = current_org_id
  AND t.transaction_date BETWEEN '2025-08-21' AND '2025-09-15'
  AND t.duration_seconds IS NOT NULL

Response:
{ "value": 42, "percent_change": -8.2, "trend": "down" }
```

---

## Metric Tabs (Volume / Revenue / Basket Size / Duration)

### Tab Selection Behavior
```
UI: <TabBar activeTab={selectedMetric} onChange={setSelectedMetric} />
    Options: Volume | Revenue | Basket Size | Duration

Action: User clicks "Revenue" tab

Effect:
1. Change selectedMetric state to "revenue"
2. Trigger getTransactionTrends({ metric: 'revenue', ... })
3. Update chart data
4. Redraw chart with new series
```

---

### Transaction Volume Trends Chart
```
Component: <AreaChart data={trendData} />

Data Source: get_transaction_trends RPC
Request:
{
  "metric": "volume",
  "time_period": "daily",
  "analysis_mode": "single",
  "brand_ids": null,
  "category_ids": null,
  "region_ids": null,
  "store_ids": null,
  "date_from": "2025-08-21",
  "date_to": "2025-09-15"
}

Query (SQL):
SELECT
  DATE(t.started_at) as date,
  COUNT(t.id) as value,
  'All Brands' as entity_name
FROM transactions t
WHERE t.org_id = current_org_id
  AND DATE(t.started_at) BETWEEN '2025-08-21' AND '2025-09-15'
GROUP BY DATE(t.started_at)
ORDER BY date ASC

Response Array (26 points):
[
  { "date": "2025-08-21", "value": 450, "entity_name": "All Brands" },
  { "date": "2025-08-22", "value": 520, "entity_name": "All Brands" },
  ...
  { "date": "2025-09-15", "value": 540, "entity_name": "All Brands" }
]

Chart Rendering:
- X-axis: Date labels (Aug 21, Aug 25, Aug 29, Sep 3, Sep 7, Sep 11, Sep 15)
- Y-axis: Numeric value (0-800)
- Series: Yellow area fill
- Tooltip: Show exact date + value on hover
```

---

## Insights Panel

### Key Insights Section
```
Component: <InsightsPanel insights={keyInsights} />

Data Source: get_insights RPC
Request:
{
  "analysis_mode": "single",
  "brand_ids": null,
  "category_ids": null,
  "region_ids": null,
  "store_ids": null,
  "date_from": "2025-08-21",
  "date_to": "2025-09-15"
}

Response:
{
  "key_insights": [
    {
      "key": "peak_hours",
      "text": "Peak hours: 7-9 AM and 5-7 PM drive 60% of daily volume",
      "confidence": 0.9
    },
    {
      "key": "weekend_value",
      "text": "Weekend transactions average 15% higher value",
      "confidence": 0.85
    },
    {
      "key": "location_velocity",
      "text": "Metro Manila locations show 2x transaction velocity",
      "confidence": 0.92
    },
    {
      "key": "duration",
      "text": "Average transaction duration: 45 seconds",
      "confidence": 1.0
    }
  ]
}
```

---

### AI Recommendations Section
```
Component: <RecommendationsPanel recommendations={recommendations} />

Data Source: Derived from insights OR LLM call

Response:
{
  "recommendations": [
    {
      "text": "Staff high-traffic locations during peak hours",
      "category": "staffing",
      "priority": 5,
      "source": "rules"
    },
    {
      "text": "Promote premium products during weekend rushes",
      "category": "marketing",
      "priority": 4,
      "source": "rules"
    },
    {
      "text": "Optimize checkout process to reduce wait times",
      "category": "operations",
      "priority": 4,
      "source": "rules"
    }
  ]
}
```

---

## Advanced Filters Panel

### Brand Selection
```
Component: <FilterSection title="Brands" items={brands} />

Data Source: get_filter_options RPC
Request:
{
  "filter_type": "brands"
}

Query (SQL):
SELECT id, name FROM brands
WHERE org_id = current_org_id
ORDER BY name ASC

Response:
{
  "items": [
    { "id": "uuid-1", "name": "Coca-Cola" },
    { "id": "uuid-2", "name": "Pepsi" },
    ...
  ]
}
```

### Categories Selection
```
Component: <FilterSection title="Categories" items={categories} />

Data Source: get_filter_options RPC
Request:
{
  "filter_type": "categories"
}
```

### Regions & Stores Selection
```
Component: <LocationFilter regions={regions} stores={stores} />

Data Sources:
1. get_filter_options (filter_type: "regions")
2. get_filter_options (filter_type: "stores")
```

---

## Export Button
```
Component: <ExportButton format="csv|xlsx|pdf" />

Event: User clicks "Export"

Action:
POST /rest/v1/rpc/export_dashboard_data
Request:
{
  "format": "csv",
  "metric": "all",
  "analysis_mode": "single",
  ...filters
}

Response:
{
  "export_id": "uuid",
  "status": "ready",
  "signed_url": "https://...",
  "row_count": 26
}
```

---

## Complete UI-to-Query Mapping Matrix

| UI Component | Data Source | Query Type | Tables | Filters Applied |
|--------------|-------------|------------|--------|-----------------|
| Daily Volume Tile | get_dashboard_summary | COUNT(*) | transactions | org_id, date_range, brands, categories, regions, stores |
| Daily Revenue Tile | get_dashboard_summary | SUM(amount) | transactions | org_id, date_range, brands, categories, regions, stores |
| Avg Basket Size Tile | get_dashboard_summary | SUM(line_items)/COUNT(*) | transactions | org_id, date_range, brands, categories, regions, stores |
| Avg Duration Tile | get_dashboard_summary | AVG(duration) | transactions | org_id, date_range, brands, categories, regions, stores |
| Volume Trend Chart | get_transaction_trends | COUNT(*) by date | transaction_daily_summary | org_id, metric=volume, date_range, filters |
| Revenue Trend Chart | get_transaction_trends | SUM(amount) by date | transaction_daily_summary | org_id, metric=revenue, date_range, filters |
| Basket Size Trend Chart | get_transaction_trends | AVG(line_items) by date | transaction_daily_summary | org_id, metric=basket_size, date_range, filters |
| Duration Trend Chart | get_transaction_trends | AVG(duration) by date | transaction_daily_summary | org_id, metric=duration, date_range, filters |
| Key Insights | get_insights | Rules-based generation | transaction_daily_summary, transaction_hourly_summary | org_id, date_range, filters |
| Recommendations | get_insights | Rules-based derivation | insights output | org_id, insights_confidence |
| Brand List | get_filter_options | SELECT id, name | brands | org_id |
| Category List | get_filter_options | SELECT id, name | categories | org_id |
| Region List | get_filter_options | SELECT id, name | regions | org_id |
| Store List | get_filter_options | SELECT id, name, region_id | stores | org_id |
| Export Data | export_dashboard_data | SELECT * from aggregate | transaction_daily_summary | org_id, date_range, filters, format |
