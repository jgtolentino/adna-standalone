# Scout Dashboard Filter Semantics & Application Logic

## Filter Dimensions

### 1. Analysis Mode

Controls how query groups and displays data.

#### Single Entity (Default)
- **UI State:** "Single - One entity" button highlighted
- **Selection:** Optional; if 0 entities selected, defaults to ALL
- **Query Effect:** No GROUP BY; aggregate across all brands/categories/locations
- **Display:** Single metric line/area
- **Filter Indicator:** "Mode: single"

#### Between Two Entities
- **UI State:** "Between - Two entities" button highlighted
- **Selection Requirement:** Exactly 2 entities from ONE dimension (2 brands OR 2 stores, not mixed)
- **Query Effect:** GROUP BY entity_id, returns 2 series
- **Display:** Dual-line overlay or side-by-side bars for direct comparison
- **Validation:** If != 2 entities, disable Apply Filters button with tooltip "Select exactly 2 entities"
- **Filter Indicator:** "Mode: between"

#### Among Multiple Entities
- **UI State:** "Among - Multiple entities" button highlighted
- **Selection Requirement:** 2+ entities from ONE dimension
- **Query Effect:** GROUP BY entity_id, returns N series
- **Display:** Multi-line overlay or stacked area chart
- **Filter Indicator:** "Mode: among"

---

### 2. Brands (0..N multi-select)

**UI Component:** Checkbox list in "Brands" section

**Options Observed:**
- Coca-Cola
- Pepsi
- Sprite
- Fanta
- Mountain Dew
- Dr Pepper
- Red Bull
- Monster

**Filter Logic:**
```sql
IF brand_ids.length == 0:
  query: WHERE org_id = current_org_id (no brand filter)
ELSE:
  query: WHERE org_id = current_org_id AND brand_id IN (brand_ids)
```

**Interaction with Categories:**
- Brands and Categories are **independent multi-selects**
- If both specified: AND logic (products matching brand AND category)
- Empty brands + non-empty categories = All brands in selected categories

**Display:** "Brands: 0" or "Brands: 2" (count of selected)

---

### 3. Categories (0..N multi-select)

**UI Component:** Expandable section with checkbox list

**Options Observed:**
- Beverages
- Snacks
- Dairy
- Bakery

**Filter Logic:**
```sql
IF category_ids.length == 0:
  query: (no category filter)
ELSE:
  query: WHERE category_id IN (category_ids)
```

**Hierarchical Support:**
- Parent-child relationships possible (e.g., "Non-Alcoholic Beverages" → parent: "Beverages")
- If parent selected: Include all children (recommended)
- Implement: Expand category_ids via recursive CTE

**Display:** "Categories: 0" or "Categories: 1"

---

### 4. Locations (Hierarchical)

**UI Component:** Two-level expandable panels

#### Regions (0..N multi-select)
- Metro Manila
- Cebu
- Davao
- Baguio
- Iloilo
- Cagayan de Oro
- Bacolod
- General Santos

**Filter Logic:**
```sql
IF region_ids.length == 0:
  query: (no region filter)
ELSE:
  query: WHERE region_id IN (region_ids)
```

#### Stores (0..N multi-select)
- Store 001 - BGC
- Store 002 - Makati
- Store 003 - Ortigas
- Store 004 - QC
- (more stores under each region)

**Filter Logic:**
```sql
IF store_ids.length == 0:
  query: (no store filter)
ELSE:
  query: WHERE store_id IN (store_ids)
```

**Hierarchical Interaction:**
- **Both Regions and Stores selected:** OR logic between levels
  ```sql
  WHERE (region_id IN (selected_regions)) OR (store_id IN (selected_stores))
  ```

- **Only Regions selected:** Filter by region_id

- **Only Stores selected:** Filter by store_id

- **Neither selected:** No location filter (all stores)

**Display:** "Locations: 0" or "Locations: 2" (count of all selected regions + stores)

---

### 5. Time & Temporal Analysis

#### Time Period (Mutually exclusive)
- **Real-time:** Last 1 hour (refreshed every 5 min)
- **Hourly:** Last 24 hours, grouped by hour
- **Daily:** Last 26-30 days, grouped by day (DEFAULT)
- **Weekly:** Last 13 weeks, grouped by week
- **Monthly:** Last 12 months, grouped by month
- **Quarterly:** Last 8 quarters, grouped by quarter

**UI:** Yellow highlight on selected period

**Query Effect:**
```sql
Hourly: SELECT DATE_TRUNC('hour', started_at) as bucket, ...
Daily: SELECT DATE_TRUNC('day', started_at) as bucket, ...
Weekly: SELECT DATE_TRUNC('week', started_at) as bucket, ...
Monthly: SELECT DATE_TRUNC('month', started_at) as bucket, ...
Quarterly: SELECT DATE_TRUNC('quarter', started_at) as bucket, ...
```

**Date Range Calculation (Backend):**
```python
def get_date_range_for_period(period):
  now = datetime.now(tz=org.timezone)
  if period == 'realtime':
    return (now - timedelta(hours=1), now)
  elif period == 'hourly':
    return (now - timedelta(days=1), now)
  elif period == 'daily':
    return (now - timedelta(days=26), now)  # ~1 month
  elif period == 'weekly':
    return (now - timedelta(weeks=13), now)  # ~3 months
  elif period == 'monthly':
    return (now - timedelta(days=365), now)  # ~1 year
  elif period == 'quarterly':
    return (now - timedelta(days=730), now)  # ~2 years
```

**Display:** "Period: daily" in status bar

---

## Apply Filters Button Behavior

### Pre-Click Validation
```javascript
function validateFilters() {
  if (analysis_mode === 'between' && selected_entities.length !== 2) {
    return { valid: false, error: "Select exactly 2 entities" };
  }
  if (date_from > date_to) {
    return { valid: false, error: "Start date must be before end date" };
  }
  if (date_to - date_from > 365 * 2) {
    return { valid: false, error: "Date range cannot exceed 2 years" };
  }
  return { valid: true };
}
```

### On Click
1. **Validate** filters (above)
2. **Update state** (redux/context)
3. **Trigger API calls** (dashboard summary + trends + insights)
4. **Log to audit_logs** (action: 'apply_filter', filter_params JSON)
5. **Refresh UI** (KPI tiles + chart + insights)

### Status Display
Bottom of panel shows:
```
Mode: single | Brands: 0 | Categories: 0 | Locations: 0 | Period: daily
```

---

## Refresh Button Behavior

### On Click
1. **Retain current filters** (don't reset)
2. **Re-query** all data endpoints (dashboard summary, trends, insights)
3. **Show loading spinner** during fetch
4. **Update timestamp** (e.g., "Last updated: 2:45 PM")
5. **Log to audit_logs** (action: 'refresh')

### Auto-Refresh (Optional)
- If enabled: Refresh every 5 minutes (real-time mode) or 1 hour (historical mode)
- Feature flag: `FEATURE_AUTO_REFRESH`

---

## Filter Persistence

### Store in Session Storage
```javascript
sessionStorage.setItem('dashboardFilters', JSON.stringify({
  analysis_mode: 'single',
  brand_ids: [],
  category_ids: [],
  region_ids: [],
  store_ids: [],
  period: 'daily',
  date_from: null,
  date_to: null,
  timestamp: Date.now()
}));
```

### Retrieve on Page Load
```javascript
const savedFilters = sessionStorage.getItem('dashboardFilters');
if (savedFilters && Date.now() - savedFilters.timestamp < 3600000) { // 1 hour
  restoreFilters(JSON.parse(savedFilters));
} else {
  applyDefaultFilters();
}
```

---

## Example Filter Scenarios

### Scenario 1: Compare Two Brands
```
Analysis Mode: Between
Brand 1: Coca-Cola (selected)
Brand 2: Pepsi (selected)
Categories: (empty - all)
Locations: (empty - all)
Period: Daily

Query: SELECT date, brand_name, SUM(revenue) FROM transaction_daily_summary
  WHERE org_id = ... AND brand_id IN (coke_id, pepsi_id)
  GROUP BY date, brand_id, brand_name
  ORDER BY date
```

### Scenario 2: All Beverages in Manila
```
Analysis Mode: Single
Brands: (empty - all)
Categories: Beverages (selected)
Locations: Metro Manila region (selected)
Period: Weekly

Query: SELECT week_start, SUM(revenue) FROM transaction_weekly_summary
  WHERE org_id = ... AND category_id = beverages_id AND region_id = manila_id
  GROUP BY DATE_TRUNC('week', transaction_date)
```

### Scenario 3: Among Multiple Stores
```
Analysis Mode: Among
Stores: Store 001, Store 002, Store 003 (all selected)
Brands: Coca-Cola, Pepsi (selected)
Period: Monthly

Query: SELECT month_start, store_name, SUM(revenue) FROM transaction_monthly_summary
  WHERE org_id = ... AND store_id IN (...) AND brand_id IN (...)
  GROUP BY DATE_TRUNC('month', transaction_date), store_id, store_name
```
