# Odoo → Supabase ETL Sync

This directory contains the ETL integration layer for syncing data from **Odoo CE** (jgtolentino/odoo-ce) to **Supabase** (scout.* schema).

## Architecture

```
┌───────────────────────┐     ┌────────────────────┐     ┌─────────────────────┐
│   Odoo CE Backend     │     │   ETL Edge Func    │     │   Supabase          │
│   (jgtolentino/odoo-ce)│────▶│   (Scheduled)      │────▶│   scout.bronze_*    │
│                       │     │                    │     │   scout.silver_*    │
│   • pos.order         │     │   • JSON-RPC call  │     │   scout.gold_*      │
│   • pos.order.line    │     │   • Transform      │     │                     │
│   • product.product   │     │   • Upsert         │     │   Gold Views:       │
│   • res.partner       │     │   • Checkpoint     │     │   • v_tx_trends     │
│                       │     │                    │     │   • v_product_mix   │
└───────────────────────┘     └────────────────────┘     └─────────────────────┘
```

## Data Flow

### Phase 1: Extract (Odoo → Edge Function)

```
Odoo Models → JSON-RPC API → Edge Function
```

| Odoo Model | Scout Target | Fields Extracted |
|------------|--------------|------------------|
| `pos.order` | `scout.bronze_transactions` | id, name, date_order, partner_id, amount_total, state |
| `pos.order.line` | `scout.bronze_transactions` | product_id, qty, price_unit, discount, price_subtotal |
| `product.product` | `scout.products` | id, name, categ_id, list_price, default_code |
| `product.category` | `scout.categories` | id, name, parent_id |
| `res.partner` | `scout.customers`, `scout.stores` | id, name, type, city, street, x_region_code |

### Phase 2: Transform (Edge Function)

```typescript
// Transform Odoo POS order to Scout transaction
function transformPosOrder(order: OdooPosOrder): ScoutTransaction {
  return {
    id: `TX-${order.id}`,
    store_id: order.config_id[0],
    timestamp: order.date_order,
    brand_name: order.lines[0]?.product_id?.brand_id?.name || 'Unknown',
    product_category: order.lines[0]?.product_id?.categ_id?.name || 'Unknown',
    quantity: order.lines.reduce((sum, l) => sum + l.qty, 0),
    gross_amount: order.amount_total,
    payment_method: mapPaymentMethod(order.payment_ids),
    // ... other fields
  };
}
```

### Phase 3: Load (Edge Function → Supabase)

```
Bronze (raw) → Silver (cleaned) → Gold (aggregated)
```

| Layer | Table | Update Frequency | Purpose |
|-------|-------|------------------|---------|
| Bronze | `scout_bronze_transactions` | Real-time (on sync) | Raw ingested data |
| Silver | `scout_silver_transactions` | Triggered after Bronze | Deduplicated, validated |
| Gold | `scout_gold_*` | Materialized (hourly) | Dashboard-ready aggregates |

## Environment Variables

```bash
# Odoo Connection (required)
ODOO_BASE_URL=https://your-odoo-instance.com
ODOO_DB=your-database
ODOO_USERNAME=api-user
ODOO_PASSWORD=***

# Supabase Connection (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=***

# Sync Configuration (optional)
SYNC_BATCH_SIZE=500
SYNC_CHECKPOINT_KEY=odoo_sync_checkpoint
SYNC_SCHEDULE=*/15 * * * *  # Every 15 minutes
```

## Deployment

### Option A: Supabase Edge Function

```bash
# Deploy the sync function
supabase functions deploy odoo-sync --project-ref spdtwktxdalcfigzeqrz

# Set secrets
supabase secrets set ODOO_BASE_URL=https://...
supabase secrets set ODOO_DB=...
supabase secrets set ODOO_USERNAME=...
supabase secrets set ODOO_PASSWORD=...
```

### Option B: GitHub Actions (Scheduled)

```yaml
# .github/workflows/odoo-sync.yml
name: Odoo → Supabase Sync
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -r infrastructure/etl/odoo-sync/requirements.txt
      - run: python infrastructure/etl/odoo-sync/sync.py
        env:
          ODOO_BASE_URL: ${{ secrets.ODOO_BASE_URL }}
          ODOO_DB: ${{ secrets.ODOO_DB }}
          ODOO_USERNAME: ${{ secrets.ODOO_USERNAME }}
          ODOO_PASSWORD: ${{ secrets.ODOO_PASSWORD }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Files

```
infrastructure/etl/odoo-sync/
├── README.md                    # This file
├── requirements.txt             # Python dependencies
├── sync.py                      # Main sync script
├── odoo_client.py               # Odoo JSON-RPC client
├── transformers.py              # Data transformation functions
├── supabase_loader.py           # Supabase upsert logic
├── checkpoints.py               # Incremental sync tracking
└── tests/
    └── test_transformers.py     # Unit tests
```

## Incremental Sync

The ETL uses checkpoints to enable incremental syncing:

```sql
-- Checkpoint table in Supabase
CREATE TABLE IF NOT EXISTS scout.sync_checkpoints (
  id TEXT PRIMARY KEY,
  last_sync_at TIMESTAMPTZ NOT NULL,
  last_record_id BIGINT,
  records_synced BIGINT DEFAULT 0,
  status TEXT DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Each sync run:
1. Reads last checkpoint
2. Queries Odoo for records where `write_date > checkpoint`
3. Transforms and upserts to Supabase
4. Updates checkpoint with new timestamp

## Monitoring

Sync health is tracked in `scout.sync_logs`:

```sql
SELECT
  checkpoint_id,
  started_at,
  completed_at,
  records_processed,
  status,
  error_count
FROM scout.sync_logs
ORDER BY started_at DESC
LIMIT 10;
```

## Manual Sync

```bash
# Full sync (reprocess all data)
python infrastructure/etl/odoo-sync/sync.py --full

# Incremental sync (from last checkpoint)
python infrastructure/etl/odoo-sync/sync.py

# Dry run (no writes)
python infrastructure/etl/odoo-sync/sync.py --dry-run
```

## Odoo Model Mapping

### pos.order → scout.transactions

| Odoo Field | Scout Field | Transform |
|------------|-------------|-----------|
| `id` | `source_id` | Direct |
| `name` | `transaction_code` | Direct |
| `date_order` | `timestamp` | Parse ISO |
| `config_id` | `store_id` | Lookup |
| `partner_id` | `customer_id` | Lookup |
| `amount_total` | `gross_amount` | Direct |
| `amount_paid` | `net_amount` | Direct |
| `state` | `status` | Map enum |

### pos.order.line → scout.transaction_items

| Odoo Field | Scout Field | Transform |
|------------|-------------|-----------|
| `product_id` | `product_id` | Lookup |
| `product_id.categ_id` | `product_category` | Nested lookup |
| `product_id.brand_id` | `brand_name` | Nested lookup (OCA module) |
| `qty` | `quantity` | Direct |
| `price_unit` | `unit_price` | Direct |
| `discount` | `discount_percent` | Direct |
| `price_subtotal` | `line_total` | Direct |

## Future Enhancements

1. **Real-time sync**: Use Odoo webhooks + Supabase Realtime
2. **Bidirectional sync**: Write campaign data back to Odoo
3. **Data quality rules**: Validate before loading to Silver
4. **Alerting**: Slack/email on sync failures
