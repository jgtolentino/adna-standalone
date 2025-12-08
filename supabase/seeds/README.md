# Scout Dashboard Seed Data

## Quick Start

### Deploy Teleserye Seed (Recommended)
```bash
# 1. Connect to Supabase
export POSTGRES_URL="postgresql://postgres.xkxyvboeubffxxbebsll:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# 2. Apply teleserye seed
psql "$POSTGRES_URL" -f supabase/seeds/scout_seed_teleserye.sql

# 3. Run validation
psql "$POSTGRES_URL" -f supabase/seeds/scout_teleserye_validation.sql
```

**Expected Output**:
```
NOTICE: Seed complete: 17 regions, 53 stores, 150000 transactions, 66 SKUs, 8500 customers

✅ ALL GATES PASSED (6 / 6)
Scout Teleserye seed is production-ready!
```

---

## File Overview

| File | Purpose | Size | Status |
|------|---------|------|--------|
| `scout_seed.sql` | Original seed (legacy) | 252 lines | ⚠️ Deprecated |
| `scout_seed_teleserye.sql` | **Enhanced seed with 6 episodes** | 1,234 lines | ✅ **Recommended** |
| `scout_teleserye_validation.sql` | **Validation queries + acceptance gates** | 456 lines | ✅ **Run after seed** |

---

## What's New in Teleserye Seed

### 📦 **Product Expansion** (33 → 66 SKUs)
- **Cigarette Sticks**: Marlboro, PM, Fortune, Mighty, Hope (₱3.50-9)
- **Beer**: San Miguel, Red Horse, Colt 45 (₱50-65)
- **Candy**: Choc-Nut, Flat Tops, Mentos, White Rabbit (₱1-5)
- **Sachets**: Shampoo, toothpaste, detergent (₱5-12)

### 🏪 **Store Expansion** (20 → 53 stores)
- **All 17 regions covered** (was 6/17)
- **30 new stores** across CAR, Ilocos, Cagayan, MIMAROPA, Bicol, E. Visayas, Zamboanga, N. Mindanao, SOCCSKSARGEN, Caraga, BARMM

### 📊 **Transaction Volume** (60K → 150K)
- **90-day window** (was 30 days)
- **Episode-driven spikes**: Sweldo 2.5x, Fiesta 4x, Back-to-School 1.8x
- **25-30% promo activity** (was 0%)

### 🎭 **6 Episodes**
1. **Sweldo Rush** (15th/30th payroll spike)
2. **Fiesta sa Barangay** (June 24-30 beverage boom)
3. **Presyo na Naman?!** (tobacco price increase + brand switching)
4. **Store Competition** (Aling Nena vs 7-Eleven)
5. **Yosi Break** (tobacco daily habit 5-7x/week)
6. **Back-to-School** (June 1-15 snacks/sachets spike)

---

## Validation Queries

Run after seeding to verify data quality:

```bash
psql "$POSTGRES_URL" -f supabase/seeds/scout_teleserye_validation.sql
```

**8 Validation Checks**:
1. ✅ Sweldo/Fiesta Temporal Spikes (2-3x multiplier)
2. ✅ Promo Discount Activity (25-30% rate)
3. ✅ Tobacco Stick vs Pack Split (60%/40%)
4. ✅ Sachet/Tingi Economy (30-40% ₱1-10 transactions)
5. ✅ Regional Store Coverage (17/17 regions)
6. ✅ Tobacco Daily Habit (40-50% daily smokers)
7. ✅ OOS Substitution Behavior (15-40% rate)
8. ✅ Trip Mission Segmentation (50% tingi, 30% daily, 20% stock-up)

**Acceptance Gates** (automated):
- Transaction Volume >= 100,000
- Regional Coverage = 17 regions
- Sweldo Spike >= 2.0x multiplier
- Promo Rate >= 20%
- Tobacco Stick Share >= 55%
- Tingi Economy >= 30%

---

## Use Cases

### Original Seed (`scout_seed.sql`)
**Use for**:
- Quick testing
- Minimal data needs
- Schema validation only

**Limitations**:
- Only 20 stores (6/17 regions)
- No promo activity (discount_amount = 0)
- No temporal patterns (flat distribution)
- No cigarette sticks (packs only)
- No sachets (no ₱1-10 products)

### Teleserye Seed (`scout_seed_teleserye.sql`)
**Use for**:
- Production dashboard
- Marketing analysis
- Consumer insights
- BI/analytics demos
- Dashboard performance testing
- Realistic FMCG market simulation

**Features**:
- 53 stores (17/17 regions)
- 25-30% promo activity
- Sweldo/fiesta temporal spikes
- 60% tobacco sticks, 40% packs
- 30-40% ₱1-10 tingi economy
- Regional brand bias (RC Cola Visayas, Fortune Mindanao)

---

## Troubleshooting

### Error: "relation does not exist"
**Cause**: Migration not applied yet
**Solution**: Run migration first
```bash
psql "$POSTGRES_URL" -f supabase/migrations/20251207_scout_transactions.sql
psql "$POSTGRES_URL" -f supabase/migrations/20251208_scout_missing_views.sql
```

### Error: "duplicate key value violates unique constraint"
**Cause**: Seed already loaded
**Solution**: Truncate first
```sql
TRUNCATE scout.transactions CASCADE;
```

### Warning: "NOTICE: Seed complete: 17 regions, 53 stores, 0 transactions"
**Cause**: CTE failed to generate transactions
**Solution**: Check Supabase SQL Editor for errors, verify PostgreSQL version >= 13

### Performance: Seed takes >5 minutes
**Cause**: Large transaction volume (150K rows)
**Solution**: Normal for teleserye seed. Original seed is faster (60K rows, 30 days).

---

## Documentation

- **EDA Report**: [claudedocs/SCOUT_TELESERYE_EDA.md](../../claudedocs/SCOUT_TELESERYE_EDA.md)
- **Implementation Summary**: [claudedocs/SCOUT_TELESERYE_IMPLEMENTATION.md](../../claudedocs/SCOUT_TELESERYE_IMPLEMENTATION.md)
- **Migration Schema**: [supabase/migrations/20251207_scout_transactions.sql](../migrations/20251207_scout_transactions.sql)

---

## Schema Reference

**Core Tables**:
- `scout.regions` (17 PH administrative regions)
- `scout.stores` (53 sari-sari + convenience stores)
- `scout.transactions` (denormalized fact table with 30+ columns)

**Dashboard Views**:
- `scout.v_kpi_summary` (homepage KPIs)
- `scout.v_tx_trends` (time-series trends)
- `scout.v_product_mix` (category breakdown)
- `scout.v_brand_performance` (brand analytics)
- `scout.v_geo_regions` (regional performance)
- `scout.v_store_performance` (store-level metrics)
- `scout.v_consumer_profile` (demographics)
- `scout.v_consumer_behavior` (purchase patterns)
- `scout.v_competitive_analysis` (brand competition)

---

## Next Steps

After successful seed deployment:

1. **Test Dashboard**: Visit [https://scout-dashboard.vercel.app](https://scout-dashboard.vercel.app)
2. **Check KPIs**: Verify homepage displays 150K transactions, 53 stores, 66 SKUs
3. **Explore Trends**: Check /trends for sweldo spikes on 15th and 30th
4. **Product Mix**: Verify tobacco shows 60% sticks, 40% packs
5. **Geography**: Confirm all 17 regions have data
6. **NLQ Queries**: Test GenieView AI with questions like:
   - "What are the top 5 brands during sweldo days?"
   - "Show me cigarette stick vs pack sales by region"
   - "Which stores have the highest promo activity?"

---

**Last Updated**: 2025-12-08
**Maintainer**: Claude Code (SuperClaude Framework)
**Project**: Scout Dashboard - TBWA Agency Databank
