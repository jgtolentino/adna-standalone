# Scout Dashboard Metrics & KPI Calculation Logic

## Overview

All KPI calculations are designed for **timezone-aware, org-scoped** analysis. Baseline comparison uses **24-hour rolling** or **week-over-week** window depending on granularity requested.

## Core KPIs

### 1. Daily Volume (Transaction Count)

**Formula:**
```sql
daily_volume = COUNT(DISTINCT transactions.id)
  WHERE org_id = current_org_id
    AND transaction_date BETWEEN date_from AND date_to
    AND (brand_ids IS NULL OR brand_id IN brand_ids)
    AND (category_ids IS NULL OR category_id IN category_ids)
    AND (region_ids IS NULL OR region_id IN region_ids)
    AND (store_ids IS NULL OR store_id IN store_ids)
```

**Data Source:**
- Table: `transactions`
- Key Column: `id`
- Filter: org_id, date range, brand, category, store

**% Change Calculation:**
```sql
baseline_volume = COUNT(*) WHERE transaction_date BETWEEN (date_from - N days) AND (date_to - N days)
percent_change = ((daily_volume - baseline_volume) / baseline_volume) * 100
trend = percent_change >= 0 ? "up" : "down"
```

**Baseline Window:**
- If date range ≤ 3 days: **Previous day** (N = 1)
- If date range 4-7 days: **Previous week** (N = 7)
- If date range 8-30 days: **Previous month** (N = 30)
- If date range 31-90 days: **Previous quarter** (N = 90)
- If date range 91+ days: **Previous year** (N = 365, if available)

**Rounding:** Integer (no decimals for count)

**Example:**
```
Date range: Aug 21-Sep 15 (26 days) → Month-over-month baseline
Baseline: Jul 21-Aug 15 (same 26-day window)
Current: 649 transactions
Baseline: 578 transactions
% Change: ((649 - 578) / 578) * 100 = +12.3%
```

---

### 2. Daily Revenue (Total Transaction Amount)

**Formula:**
```sql
daily_revenue = SUM(transactions.total_amount)
  WHERE [same filters as daily_volume]
```

**Data Source:**
- Table: `transactions`
- Key Column: `total_amount`
- Currency: PHP (Philippine Peso)

**% Change:** Same logic as Daily Volume (baseline window applies)

**Rounding:** 2 decimal places (peso cents)

**Note:**
- Assumes `total_amount` is already in PHP
- Handles multi-currency tenants via `transactions.currency_code` if extended
- Excludes refunds/returns (marked with negative total_amount or separate status)

**Example:**
```
Current period sum: ₱135,785.00
Baseline period sum: ₱156,303.45
% Change: ((135,785 - 156,303) / 156,303) * 100 = -13.1%
```

---

### 3. Average Basket Size (Items per Transaction)

**Formula (Option A - By Line Item Count):**
```sql
avg_basket_size = SUM(transactions.line_item_count) / COUNT(transactions.id)
```

**Formula (Option B - By Quantity):**
```sql
avg_basket_size = SUM(transactions.total_quantity) / COUNT(transactions.id)
```

**Recommended:** Option A (line items) for inventory accuracy; Option B if quantity unavailable

**Data Source:**
- Table: `transactions`
- Key Columns: `line_item_count` OR `total_quantity`

**% Change:** Same baseline window logic

**Rounding:** 1 decimal place (e.g., 2.4 items)

**Example:**
```
Period transactions: 649
Total line items: 1,555
Avg basket size: 1,555 / 649 = 2.396... ≈ 2.4 items
Baseline avg: 2.27 items
% Change: ((2.4 - 2.27) / 2.27) * 100 = +5.7%
```

---

### 4. Average Duration (Transaction Processing Time)

**Formula:**
```sql
avg_duration_seconds = AVG(transactions.duration_seconds)
  WHERE [same filters as daily_volume]
  AND duration_seconds IS NOT NULL
```

**Data Source:**
- Table: `transactions`
- Key Column: `duration_seconds`
- Computed as: `EXTRACT(EPOCH FROM (completed_at - started_at))`

**% Change:** Same baseline logic

**Rounding:** Integer seconds (no fractional seconds in display)

**Example:**
```
Period avg: 42 seconds
Baseline avg: 45.7 seconds
% Change: ((42 - 45.7) / 45.7) * 100 = -8.2%
Trend: down (faster processing)
```

**Note:** Negative % change = faster processing (positive outcome, but shown as "down")

---

## Chart Data: Transaction Trends

### Time Series Bucketing Rules

#### Daily Bucketing (default)
```sql
SELECT
  DATE_TRUNC('day', transactions.started_at)::DATE as date,
  SUM(transactions.total_amount) as value
FROM transactions
WHERE org_id = current_org_id
  AND started_at >= date_from AND started_at < date_to + INTERVAL '1 day'
GROUP BY DATE_TRUNC('day', transactions.started_at)
ORDER BY date ASC
```

**Missing Days:** Include NULL values (fill with 0 in chart, or interpolate)

#### Hourly Bucketing
```sql
SELECT
  DATE_TRUNC('hour', transactions.started_at)::TIMESTAMP as time,
  SUM(transactions.total_amount) as value
FROM transactions
WHERE org_id = current_org_id
  AND started_at >= date_from AND started_at < date_to + INTERVAL '1 day'
GROUP BY DATE_TRUNC('hour', transactions.started_at)
ORDER BY time ASC
```

#### Weekly/Monthly/Quarterly
Similar pattern using `'week'`, `'month'`, or `'quarter'` in DATE_TRUNC.

### Metric Switching (Volume vs Revenue vs Basket Size vs Duration)

| Metric | SQL Aggregation | Y-Axis Unit | Chart Type |
|--------|-----------------|-------------|------------|
| **Volume** | COUNT(*) | Transaction count (e.g., 0-800) | Area chart (yellow fill) |
| **Revenue** | SUM(total_amount) | PHP (₱) (e.g., 0-200,000) | Area chart (blue fill) |
| **Basket Size** | AVG(line_item_count) | Items (e.g., 2.0-3.5) | Line chart |
| **Duration** | AVG(duration_seconds) | Seconds (e.g., 30-60) | Line chart |

---

## Insights Generation (Rules-Based)

### Insight 1: Peak Hours Detection

**Rule:**
```
1. Extract hour_of_day from all transactions in period
2. Calculate SUM(transaction_count) and SUM(revenue) by hour
3. Identify top 2 non-consecutive hour ranges with peak activity
4. If peak hours account for ≥50% of daily volume → Generate insight
```

**Example Output:**
```
"Peak hours: 7-9 AM and 5-7 PM drive 60% of daily volume"
```

**Confidence Score:**
- If ≥60% → Confidence = 0.95
- If 50-60% → Confidence = 0.80
- If <50% → No insight generated

---

### Insight 2: Weekend vs Weekday Comparison

**Rule:**
```
1. Calculate AVG(transaction_amount) for day_of_week = 5,6 (Sat-Sun)
2. Calculate AVG(transaction_amount) for day_of_week = 0,1,2,3,4 (Mon-Fri)
3. If weekend_avg > weekday_avg by ≥10% → Generate insight
```

**Example Output:**
```
"Weekend transactions average 15% higher value"
```

---

### Insight 3: Location Velocity

**Rule:**
```
1. Calculate transactions_per_hour per store/region
2. Identify top location by velocity
3. If top_location_velocity > overall_avg_velocity * 1.5 → Generate insight
```

**Example Output:**
```
"Metro Manila locations show 2x transaction velocity"
```

---

### Insight 4: Average Duration Metric

**Rule:**
```
Always show average transaction duration if > 0
```

**Example Output:**
```
"Average transaction duration: 45 seconds"
```

**No threshold required; always included.**

---

## Comparison Baseline Detailed Rules

| Date Range | Baseline Window | Lookback Period |
|------------|-----------------|-----------------|
| 1-3 days | Previous day | 1 day |
| 4-7 days | Previous week (same days) | 7 days |
| 8-30 days | Previous month (same date range) | 30 days |
| 31-90 days | Previous quarter | 90 days |
| 91+ days | Previous year | 365 days |

**Edge Case:** If baseline data unavailable (org < 90 days old), use NULL and suppress % change display.

---

## Performance Considerations

### Query Optimization
1. **Materialized Views:** Refresh `transaction_daily_summary`, `transaction_hourly_summary` hourly via cron job
2. **Indexes:** On (org_id, store_id, transaction_date) for fast filtering
3. **Partitioning:** Partition transactions by month on `transaction_date`

### Caching Strategy
- KPI tiles (summary): Cache 1 hour (refresh on demand button)
- Trend charts: Cache 1 hour per metric/period combination
- Filter options: Cache 24 hours (refresh on data import)
- Insights: Cache 6 hours (regenerate on filter change)

### Acceptable Query Times
- Dashboard summary: < 500ms
- Trend chart (full period): < 1500ms
- Insights generation: < 2000ms
- Export (100k rows): < 5000ms
