# Scout Retail Teleserye + EDA: PH FMCG/Tobacco Market Realism

**Purpose**: Transform Scout seed data into a living, breathing Philippine FMCG + tobacco retail market through data-driven storytelling.

**Author**: Creative Data Storyteller for Scout Retail
**Date**: 2025-12-08
**Target**: Supabase project `ublqmilcjtpnflofprkr` | Schema: `scout.*`

---

## STEP 1 – EDA ON CURRENT SEED DATA (MARKET REALISM LENS)

### 1.1 Schema + Tables Overview

**Key Tables (FMCG/Tobacco Retail Model)**:

| Table | Role in FMCG Model | Critical Columns |
|-------|-------------------|------------------|
| `scout.regions` | **Geographic hierarchy** - PH admin regions for distribution planning | `code`, `name` |
| `scout.stores` | **Distribution points** - Sari-sari + convenience stores (channel strategy) | `store_code`, `region_code`, `city`, `barangay`, `store_type` |
| `scout.transactions` | **Fact table** - Brand share, pricing, consumer behavior, promo response | `brand_name`, `product_category`, `net_amount`, `quantity`, `timestamp`, `customer_id`, `promo fields` |
| `scout.v_product_mix` | **Category/brand share view** - Leaders vs challengers vs value brands | `product_category`, `brand_name`, `revenue_share_pct` |
| `scout.v_geo_regions` | **Distribution coverage** - Regional strongholds and white spaces | `region_code`, `stores_count`, `revenue` |
| `scout.v_consumer_behavior` | **Shopper insights** - Funnel, request types, substitution patterns | `funnel_stage`, `substitution_occurred` |

### 1.2 Data Profiling & Coverage

**Current Seed Stats** (from seed SQL analysis):

**Regions Table**:
- ✅ **Rows**: 17 (all PH regions)
- ✅ **Coverage**: 100% complete (NCR, CAR, REGION_I through REGION_XIII, BARMM)
- ℹ️ **Assessment**: Geographic foundation is solid

**Stores Table**:
- ✅ **Rows**: ~20 stores
- ✅ **Distribution**: NCR (5), REGION_III (3), REGION_IV_A (4), REGION_VI (2), REGION_VII (3), REGION_XI (3)
- ⚠️ **Missing Regions**: 11 out of 17 regions have ZERO stores (64% regional gap)
- ⚠️ **Store Type Mix**: Mostly `sari-sari` and `convenience` - missing `supermarket`, `hypermarket`, `wholesaler`

**Transactions Table** (from seed generation logic):
- ✅ **Estimated Rows**: ~60,000 transactions (20 stores × 30 days × 20-100 tx/day)
- ✅ **Time Coverage**: Last 30 days (rolling)
- ✅ **Product Catalog**: 33 SKUs across 6 categories
- ⚠️ **Data Gaps Identified**:

| Column | Issue | Impact on FMCG Realism |
|--------|-------|------------------------|
| `discount_amount` | Always 0 | No promo activity = unrealistic (PH market is promo-heavy) |
| `funnel_stage` | Random assignment | No realistic consumer journey (visit → browse → purchase) |
| `repeated_customer` | 35% flat rate | No suki loyalty dynamics or brand switching patterns |
| `substitution_occurred` | 15% flat rate | Doesn't reflect out-of-stock + price sensitivity reality |
| `timestamp` | Uniform distribution | No sweldo spikes, fiesta peaks, or daypart patterns |
| `customer_id` | 70% coverage | Missing 30% walk-ins (should be higher for sari-sari) |
| `basket_size` | Random 1-8 | No trip mission segmentation (tingi vs stock-up) |

**Product Catalog Gaps**:

| Category | Current SKUs | Missing Elements | Real Market Need |
|----------|-------------|------------------|------------------|
| **Tobacco** | 5 SKUs (premium: Marlboro ₱165, PM ₱145; value: Fortune ₱85, Mighty ₱75, Hope ₱55) | ❌ No sticks (₱8-10/stick) <br> ❌ No regional value brands <br> ❌ No menthol variants | Sticks are 60% of tobacco volume in sari-sari |
| **Beverages** | 9 SKUs | ❌ No sachet powdered juice <br> ❌ No energy drinks (Cobra, Sting) <br> ❌ No beer (San Miguel, Red Horse) | Beer + energy drinks are top revenue drivers |
| **Snacks** | 6 SKUs | ❌ No candy (₱1-5 price points) <br> ❌ No biscuits (Cream-O, Skyflakes singles) | Candy is impulse buy anchor for kids |
| **Personal Care** | 5 SKUs | ❌ No sachets (shampoo ₱2-8, conditioner) <br> ❌ No fem care | Sachets are 70% of personal care volume |
| **Cooking** | 5 SKUs | ❌ No rice (bigas per kilo/tali) <br> ❌ No eggs, canned goods | Core stock-up items missing |
| **Dairy** | 0 SKUs | ❌ No milk (Alaska, Bear Brand) <br> ❌ No coffee creamer (Nestle, Liberty) | Coffee + creamer is daily ritual combo |

### 1.3 Retail-Shaped EDA

#### Time Patterns

**Expected PH Market Patterns** (currently MISSING):

| Pattern | Real Market | Current Seed | Gap |
|---------|-------------|--------------|-----|
| **Sweldo Spikes** | 15th + 30th of month = 2.5x normal volume | Flat distribution | ❌ No payroll dynamics |
| **Fiesta Seasons** | May (Flores de Mayo), Dec-Jan (Christmas), town fiestas | Flat distribution | ❌ No seasonal spikes |
| **Back-to-School** | June spike in snacks, drinks, noodles | Flat distribution | ❌ No school calendar impact |
| **Daypart Mix** | Morning (6-11 AM): 35% / Afternoon (12-5 PM): 40% / Evening (6-9 PM): 20% / Night: 5% | Random assignment | ⚠️ Unrealistic daypart distribution |

**Basket Patterns** (currently MISSING realistic combos):

| Trip Mission | Expected Basket | Current Seed | Gap |
|--------------|----------------|--------------|-----|
| **Morning Ritual** | Instant coffee (₱8 3-in-1) + pandesal + cigarettes (1 stick ₱8) | Random single items | ❌ No cross-category affinity |
| **Tingi Buy** | 1-2 items, sachet sizes, <₱50 total | Random 1-8 items | ❌ No price-point clustering |
| **Stock-Up** | 5-10 items, bigger packs, ₱500-1000 total | Random basket sizes | ❌ No trip type segmentation |
| **Beer Run** | San Miguel (6-pack) + chips + cigarettes (pack) | No beer in catalog | ❌ Missing key combo |

#### Geography Patterns

**Current Store Distribution**:
- ✅ **Urban bias**: NCR, Central Luzon, Central Visayas well-represented
- ❌ **Rural gaps**: Mindanao (except Davao), MIMAROPA, Bicol, Eastern Visayas = 0 stores
- ❌ **No barangay-level variation**: All stores treated equally (no tricycle-accessible vs highway stores)

**Expected Regional Dynamics** (currently FLAT):

| Region | Real Market | Current Seed | Gap |
|--------|-------------|--------------|-----|
| **NCR** | Premium brands dominate, 50% cashless payment | Flat pricing, random payment | ❌ No urban premium preference |
| **Visayas** | RC Cola stronghold (40% share vs 20% national) | Flat brand distribution | ❌ No regional brand bias |
| **Mindanao** | Value brands + larger pack sizes (bulk buying) | Flat pricing | ❌ No price tier regional variation |

#### Consumer & Brand Health

**Penetration** (unique customers per brand):
- ⚠️ **Current**: 70% of transactions have `customer_id` → can calculate penetration
- ❌ **Missing**: No repeat purchase frequency data (suki vs switchers)
- ❌ **Missing**: No brand switching matrix (Marlboro → Fortune when price increases)

**Loyalty & Switching** (currently IMPOSSIBLE to analyze):
- ❌ **No time-series customer data**: Can't track "CUST-00123 bought Marlboro 15 times, then switched to Fortune 10 times"
- ❌ **No promo-driven behavior**: Can't see "Coca-Cola on promo → 3x uplift in volume"
- ❌ **No out-of-stock impact**: Can't see "Marlboro OOS → customer substitutes Fortune or leaves store"

### 1.4 EDA Summary (Insight Lens)

**What kind of FMCG/tobacco world does this dataset describe?**

> A **generic, flat retail simulation** with no Philippine market DNA:
> - Transactions happen uniformly across days/hours (no sweldo, no fiestas, no morning coffee ritual)
> - All stores behave identically regardless of region/barangay (no NCR premium vs provincial value split)
> - No promo activity, no out-of-stocks, no brand switching (every purchase is deterministic, not driven by price/availability)
> - Missing core PH categories: sachets, sticks, rice, beer, candy
> - Tobacco exists but with pack-only pricing (no sticks = missing 60% of tobacco reality)

**Where does it feel unrealistic vs a real PH market?**

| Dimension | Real PH Market | Current Seed | Realism Score |
|-----------|----------------|--------------|---------------|
| **Price Architecture** | Sachet economy: ₱1-10 single-serve dominates | ₱12-165 SKUs only | ⭐⭐ (40%) |
| **Seasonality** | Sweldo + fiestas drive 40% of monthly volume | Flat daily volume | ⭐ (20%) |
| **Brand Dynamics** | Leaders (40% share), challengers (30%), value (30%) | Flat distribution | ⭐⭐ (40%) |
| **Promo Intensity** | 25-30% of volume is promo-driven | 0% promo activity | ⭐ (0%) |
| **Tobacco Reality** | Sticks (60%) + packs (40%), daily purchase habit | Packs only, random purchase | ⭐⭐ (35%) |
| **Regional Bias** | Clear strongholds (RC in Visayas, Fortune in Mindanao) | No regional variation | ⭐ (20%) |
| **Suki Loyalty** | 50% of customers are repeat buyers (3+ visits/month) | 35% flat repeat rate | ⭐⭐ (45%) |

### 1.5 DATA GAPS TO PATCH (REALISM-CENTERED)

**TOP 10 CRITICAL GAPS** (prioritized by dashboard impact):

1. **ZERO Promo Activity** → `scout.transactions.discount_amount` always 0
   - **Impact**: Can't analyze promo ROI, price elasticity, or activation effectiveness
   - **Fix**: Episodes 2, 3, 6 introduce promo periods with 10-30% discounts

2. **Missing Sachet/Sticks Economy** → No ₱1-10 price points
   - **Impact**: Can't analyze tingi buying behavior (80% of sari-sari transactions)
   - **Fix**: Add 25 new SKUs (cigarette sticks, shampoo sachets, ₱1 candy, ₱5 coffee sachets)

3. **Flat Temporal Distribution** → No sweldo/fiesta spikes
   - **Impact**: Can't identify peak demand periods for media planning
   - **Fix**: Episodes 1, 2, 4 create realistic spikes (15th/30th sweldo, June fiesta, Dec Christmas)

4. **No Regional Brand Bias** → All regions buy same brands
   - **Impact**: Can't identify distribution white spaces or regional strongholds
   - **Fix**: Episodes apply regional weights (RC Cola 40% in Visayas, Fortune 35% in Mindanao)

5. **Missing Key Categories** → No beer, dairy, rice
   - **Impact**: Dashboard shows incomplete category portfolio
   - **Fix**: Add 15 SKUs (San Miguel beer, Alaska milk, Bear Brand, NFA rice, eggs)

6. **Unrealistic Tobacco Behavior** → Packs only, no daily habit pattern
   - **Impact**: Can't analyze nicotine consumer segments (stick buyers vs pack buyers)
   - **Fix**: Episode 5 creates 60/40 stick/pack split with daily purchase frequency

7. **No Out-of-Stock → Substitution** → 15% substitution rate is random
   - **Impact**: Can't identify stockout pain points or measure brand loyalty
   - **Fix**: Episodes 2, 4 create realistic OOS scenarios (Marlboro OOS → 70% buy Fortune, 30% leave)

8. **Missing 11 Regions** → 64% of PH has zero store coverage
   - **Impact**: Dashboard shows incomplete national picture
   - **Fix**: Add 30 stores across MIMAROPA, Bicol, Eastern Visayas, BARMM, Caraga

9. **No Trip Mission Segmentation** → All baskets are random 1-8 items
   - **Impact**: Can't analyze tingi vs stock-up behavior for merchandising strategy
   - **Fix**: Episodes create distinct trip types (morning tingi: 1-2 items <₱50, stock-up: 5-10 items ₱500+)

10. **Zero Brand Switching Visibility** → Can't track customer loyalty
    - **Impact**: Can't measure brand health or switching drivers (price vs availability)
    - **Fix**: Episode 3 creates price hike → switching behavior (Marlboro +10% → 25% switch to Fortune)

---

## STEP 2 – MINI RETAIL "TELESERYE" DESIGN (REAL FMCG DYNAMICS)

### 2.1 Cast & Setting (Mapped to Real Market Roles)

**Main Characters** (5 recurring personas):

#### 1. **Aling Nena** (Sari-Sari Owner, 45, NCR)
- **Store**: `ST0001` ("Aling Nena Sari-Sari", Quezon City, Bagumbayan)
- **Lifestage**: Middle-aged, married, 2 kids in college
- **Income Band**: Middle class (₱30K-50K/month household)
- **Store Type**: Traditional sari-sari (tindahan), street-facing, walk-in traffic
- **Inventory Strategy**: Stock fast-movers (cigarettes, coffee, noodles, soap sachets)
- **Pain Points**:
  - Cash flow tight on weeks 2-3 of month (before sweldo)
  - Frequent stock-outs on Marlboro (supplier issues)
  - Losing customers to new 7-Eleven 2 blocks away
- **Data Mapping**:
  - `store_id`: `ST0001`
  - Transactions: 50-150/day (peaks on 15th/30th sweldo)
  - Top categories: Tobacco (35% revenue), Beverages (25%), Snacks (20%)
  - Promo-sensitive: Runs "buy 2 get 1" on slow-moving biscuits

#### 2. **Mang Tony** (Loyal Suki, 52, Tricycle Driver, NCR)
- **Customer ID**: `CUST-00042`
- **Lifestage**: Married, 3 kids, daily wage earner (₱800-1200/day)
- **Income Band**: Low (C/D class)
- **Shopping Mission**: **Daily tingi buyer** - cigarette sticks, instant coffee, pandesal
- **Basket Profile**:
  - Morning ritual (6-8 AM): 2 cigarette sticks (₱16) + Nescafe 3in1 (₱8) + pandesal = ₱30-40
  - Frequency: 6-7 days/week at Aling Nena's store (suki)
  - Payment: 100% cash
- **Brand Loyalty**:
  - Cigarettes: Fortune sticks (₱8/stick, value brand) - switches to Hope (₱5.50/stick) when cash is tight
  - Coffee: Nescafe 3in1 sachet (₱8) - will NOT switch (brand loyal)
- **Pain Points**:
  - Sensitive to ₱2-3 price changes (10-15% of daily budget)
  - Will walk 5 min extra if Fortune is out-of-stock at Aling Nena's
- **Data Mapping**:
  - `customer_id`: `CUST-00042`
  - `repeated_customer`: TRUE (visits 6-7x/week)
  - `income`: `low`
  - `basket_size`: 2-3 items
  - `net_amount`: ₱30-50
  - `funnel_stage`: `purchase` (no browsing, direct request)

#### 3. **Mae** (Young Mom, 28, Office Worker, NCR)
- **Customer ID**: `CUST-00158`
- **Lifestage**: Married, 1 toddler, BPO employee (₱25K/month)
- **Income Band**: Middle class (B/C1)
- **Shopping Mission**: **Stock-up buyer** - weekly grocery run (Saturday mornings)
- **Basket Profile**:
  - Weekly stock-up (Sat 9-11 AM): 8-12 items, ₱800-1200
  - Categories: Instant noodles (5-10 packs), laundry detergent, shampoo sachets (10-pack), cooking oil, canned goods
  - Payment: 60% GCash, 40% cash
- **Brand Preferences**:
  - Laundry: Ariel (premium, TBWA client) - will switch to Surf if >20% price gap
  - Noodles: Lucky Me Pancit Canton (habitual, buys 10 packs/week)
  - Promo-responsive: Buys 2x volume when "buy 5 get 1 free" on noodles
- **Pain Points**:
  - Limited time (Saturday only window)
  - Will switch stores if Aling Nena frequently out-of-stock on key items
- **Data Mapping**:
  - `customer_id`: `CUST-00158`
  - `repeated_customer`: TRUE (weekly visit)
  - `income`: `middle`
  - `basket_size`: 8-12 items
  - `net_amount`: ₱800-1200
  - `funnel_stage`: `browse` → `purchase`
  - `payment_method`: `gcash` (60%), `cash` (40%)

#### 4. **Kuya Rodel** (Area Sales Rep, 35, PMI Tobacco)
- **Role**: Distributor/merchandiser for Philip Morris International brands (Marlboro, PM, Fortune)
- **Territory**: NCR (covers 50 sari-sari stores including Aling Nena's)
- **Responsibilities**:
  - Weekly store visits (restock, merchandising, promo setup)
  - Push premium brands (Marlboro, PM) vs value (Fortune)
  - Execute promos (buy 2 packs get 1 free lighter, trade programs)
- **KPIs**:
  - Distribution numeric: 90% of stores must stock Marlboro + Fortune
  - Share of shelf: Marlboro must be eye-level, Fortune at counter
  - Promo compliance: 80% of stores must display promo materials
- **Pain Points**:
  - Competing with cheaper smuggled cigarettes (₱10-15 discount)
  - Store owners prioritize fast turnover (Fortune) over premium (Marlboro)
  - Regulatory restrictions: No POS advertising, limited activation
- **Data Impact**:
  - Drives `discount_amount` on tobacco during promo periods
  - Affects `tbwa_client_brand` flag for Marlboro/PM
  - Influences store inventory mix (Marlboro vs Fortune stock levels)

#### 5. **Lola Siony** (Fiesta Organizer, 68, Barangay Elder, Visayas)
- **Customer ID**: `CUST-00723`
- **Lifestage**: Retired, widowed, active in barangay events
- **Income Band**: Middle (pension + family support)
- **Shopping Mission**: **Bulk buyer for fiestas/events** (3-4x/year)
- **Basket Profile**:
  - Fiesta stock-up (1 week before town fiesta): 20-30 items, ₱3000-5000
  - Categories: Beverages (10 cases Coca-Cola, 5 cases RC Cola), snacks (chips, biscuits), rice (25kg sack), cooking supplies
  - Payment: Cash (family pooled funds)
- **Pain Points**:
  - Bulk orders require 1-2 days advance notice to store
  - Out-of-stocks during fiesta season (everyone buying at once)
  - Prefers sari-sari over supermarket (relationship with store owner)
- **Data Mapping**:
  - `customer_id`: `CUST-00723`
  - `repeated_customer`: FALSE (infrequent, but high-value transactions)
  - `basket_size`: 20-30 items
  - `net_amount`: ₱3000-5000
  - `timestamp`: Clusters around fiesta dates (town patron saint day)

### 2.2 Episodes as Data Scenarios (Anchored in REAL Pain Points)

#### **Episode 1: "Sweldo Rush" (Payroll Spike)**
**Time Window**: Days 14-16 and 29-31 of each month
**Affected Regions**: All regions (national pattern)
**Market Dynamics**:
- 15th and 30th = payroll days for most employees → 2.5-3x normal sari-sari volume
- Stock-up buying behavior: Mae-type customers buy 1-2 weeks' worth of supplies
- Premium brand shift: More Marlboro, less Fortune during sweldo days
- Payment mix: 50% GCash (salary direct deposit) vs 80% cash on non-sweldo days

**Data Patch**:
- **Fixes Gap #3** (Flat temporal distribution)
- **Mechanics**:
  - Multiply transaction volume by 2.5x on days 14-16, 29-31
  - Increase `basket_size` by 50% (from avg 3 → 4-5 items)
  - Shift brand mix: Premium brands +20%, value brands -10%
  - Increase `net_amount` per transaction by 40%
  - Shift `payment_method`: GCash from 20% → 50%

**Example Transactions**:
```sql
-- Mae's sweldo stock-up (June 15, 2025, 10:30 AM)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-06-15 10:30:00', 'morning', ...,
   'Lucky Me Pancit Canton', 'SKU-LKME-60G', 'Cooking', 'Instant Noodles',
   false, false, 10, 14.00, 140.00, 0.00, 'gcash', ...), -- 10-pack noodles
  (uuid_generate_v4(), 'ST0001', '2025-06-15 10:31:00', 'morning', ...,
   'Ariel Powder', 'SKU-ARIE-66G', 'Household', 'Laundry',
   false, true, 5, 14.00, 70.00, 0.00, 'gcash', ...), -- 5-pack laundry
  -- ... (10 total items, ₱1050 basket)
```

#### **Episode 2: "Fiesta sa Barangay" (Town Fiesta Surge)**
**Time Window**: June 24-30, 2025 (San Juan Fiesta in Manila) + distributed town fiestas across regions
**Affected Regions**: Concentrated in Visayas (REGION_VI, REGION_VII) and Mindanao (REGION_XI)
**Affected Barangays**: Specific barangays hosting town fiestas (patron saint celebrations)

**Market Dynamics**:
- 5-7 day surge before/during fiesta (food, drinks, snacks for visitors)
- Beverage category spikes: Coca-Cola, RC Cola, beer (3-5x normal volume)
- Bulk buying: Lola Siony-type customers (₱3000-5000 baskets, 20-30 items)
- Out-of-stocks: Leading brands run out (Coca-Cola, Marlboro) → substitution to RC Cola, Fortune
- Promo activity: Distributors push multi-pack promos ("buy 2 cases get 1 case free")

**Data Patch**:
- **Fixes Gap #1** (Zero promo activity), **Gap #3** (Flat temporal), **Gap #7** (No OOS substitution)
- **Mechanics**:
  - Target stores in Visayas/Mindanao regions
  - Multiply beverage + snacks volume by 4x during fiesta week
  - Introduce `discount_amount`: 15-25% on multi-pack purchases (₱10-50 discounts)
  - Create OOS scenarios: When Coca-Cola volume hits 3x normal, trigger 30% OOS rate
  - Substitution logic: Coca-Cola OOS → 70% buy RC Cola, 30% leave store (`substitution_occurred = TRUE`)
  - Increase `basket_size` to 15-25 items for bulk buyers

**Example Transactions**:
```sql
-- Lola Siony fiesta bulk buy (June 24, 2025, Cebu City)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0013', '2025-06-24 09:00:00', 'morning', ...,
   'Coca-Cola', 'SKU-COKE-330', 'Beverages', 'Soft Drinks',
   true, true, 24, 25.00, 600.00, 90.00, 'cash', ...), -- 2 cases (12x2), 15% promo discount
  (uuid_generate_v4(), 'ST0013', '2025-06-24 09:05:00', 'morning', ...,
   'Piattos', 'SKU-PIAT-85G', 'Snacks', 'Chips',
   false, false, 20, 28.00, 560.00, 84.00, 'cash', ...), -- 20-pack chips, buy 4 get 1 promo
  -- ... (25 total items, ₱4,200 basket with ₱630 total discounts)

-- Substitution scenario: Coca-Cola out-of-stock
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0013', '2025-06-26 15:30:00', 'afternoon', ...,
   'RC Cola', 'SKU-RCCO-330', 'Beverages', 'Soft Drinks',
   false, false, 12, 18.00, 216.00, 0.00, 'cash',
   'CUST-00891', 35, 'F', 'middle', 'urban',
   'purchase', 1, false, 'branded', false, TRUE, ...), -- substitution_occurred = TRUE
```

#### **Episode 3: "Presyo na Naman?!" (Price Increase + Brand Switching)**
**Time Window**: July 1-15, 2025 (tobacco excise tax increase)
**Affected Regions**: All regions (national price increase)
**Affected Categories**: Tobacco (primary), Beverages (secondary due to sugar tax)

**Market Dynamics**:
- Marlboro price increase: ₱165 → ₱180 (+9%)
- Consumer response:
  - **Downtrading**: 25% of Marlboro buyers switch to Fortune (₱85 → ₱90, +6% but still 50% cheaper)
  - **Stick buying**: 40% of pack buyers switch to buying sticks (₱9/stick Marlboro vs ₱4.50/stick Fortune)
  - **Quit attempts**: 5% stop buying (temporarily)
- Brand loyalty test: Mang Tony (Fortune loyal) stays loyal even with ₱5 increase

**Data Patch**:
- **Fixes Gap #6** (Unrealistic tobacco behavior), **Gap #10** (No brand switching)
- **Mechanics**:
  - Update `unit_price` for tobacco SKUs (+9-10%)
  - Pre-increase period (June 20-30): Normal brand distribution (Marlboro 40%, Fortune 35%, others 25%)
  - Post-increase period (July 1-15):
    - Marlboro share drops to 30% (-10pp)
    - Fortune share increases to 45% (+10pp)
    - Introduce cigarette sticks (new SKUs): 40% of tobacco volume shifts to sticks
  - Track customer switching: `CUST-00042` (Mang Tony) continues buying Fortune sticks (brand loyal)
  - Some customers (`CUST-00158` Mae's husband) switch from Marlboro packs → Fortune sticks

**Example Transactions**:
```sql
-- Pre-increase: Marlboro pack purchase (June 28, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-06-28 18:00:00', 'evening', ...,
   'Marlboro Red', 'SKU-MARL-20S', 'Tobacco', 'Cigarettes',
   false, true, 1, 165.00, 165.00, 0.00, 'cash',
   'CUST-00205', 32, 'M', 'middle', 'urban', ...), -- Pre-increase price

-- Post-increase: Same customer switches to Fortune sticks (July 3, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-07-03 18:00:00', 'evening', ...,
   'Fortune Stick', 'SKU-FORT-1S', 'Tobacco', 'Cigarettes',
   false, false, 5, 4.50, 22.50, 0.00, 'cash',
   'CUST-00205', 32, 'M', 'middle', 'urban', ...), -- Switched to sticks (5 sticks = ₱22.50 vs 1 pack = ₱180)
```

#### **Episode 4: "Loyal Suki, Bagong Store" (Store Switching + Distribution Gaps)**
**Time Window**: August 1-31, 2025
**Affected Regions**: NCR (Quezon City) - new 7-Eleven opens 2 blocks from Aling Nena's store
**Market Dynamics**:
- New competitor opens with:
  - Longer hours (24/7 vs Aling Nena's 6 AM - 10 PM)
  - Wider SKU assortment (150 SKUs vs Aling Nena's 80)
  - Air-conditioned, modern layout
- Customer defection:
  - Mae (stock-up buyer) switches 80% of her trips to 7-Eleven (convenience, variety)
  - Mang Tony (suki) stays loyal to Aling Nena (relationship, credit terms)
- Aling Nena response:
  - Increases tobacco stock (Marlboro, Fortune) to compete on fast-movers
  - Offers informal credit to loyal customers ("utang" system)
  - Loses ₱15K/month revenue (-30%)

**Data Patch**:
- **Fixes Gap #8** (Missing 11 regions), **Gap #9** (No trip mission segmentation)
- **Mechanics**:
  - Add new store: `ST0021` ("7-Eleven QC Bagumbayan", same barangay as `ST0001`)
  - Redistribute transactions:
    - `ST0001` (Aling Nena): Volume drops 30%, retains low-income customers (Mang Tony types)
    - `ST0021` (7-Eleven): Captures middle-income stock-up buyers (Mae types)
  - Create customer switching pattern:
    - `CUST-00158` (Mae): 80% of transactions move from `ST0001` → `ST0021`
    - `CUST-00042` (Mang Tony): 100% stays at `ST0001` (suki loyalty)

**Example Transactions**:
```sql
-- Mae's last stock-up at Aling Nena (July 30, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-07-30 10:00:00', 'morning', ...,
   'Lucky Me Pancit Canton', ..., 10, 14.00, 140.00, 0.00, 'gcash',
   'CUST-00158', 28, 'F', 'middle', 'urban', ...), -- Last visit to ST0001

-- Mae's first visit to 7-Eleven (August 3, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0021', '2025-08-03 19:30:00', 'evening', ...,
   'Lucky Me Pancit Canton', ..., 10, 14.00, 140.00, 0.00, 'gcash',
   'CUST-00158', 28, 'F', 'middle', 'urban', ...), -- Switched to ST0021 (convenience store)

-- Mang Tony stays loyal to Aling Nena (August 5, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-08-05 07:00:00', 'morning', ...,
   'Fortune Stick', ..., 2, 4.50, 9.00, 0.00, 'cash',
   'CUST-00042', 52, 'M', 'low', 'urban', ...), -- Suki loyalty (relationship > convenience)
```

#### **Episode 5: "Tobacco Under Pressure" (Regulatory Impact + Sticks Economy)**
**Time Window**: September 1-30, 2025
**Affected Regions**: All regions (national regulatory environment)
**Market Dynamics**:
- Limited activation: No POS advertising, no brand-sponsored events
- Stable daily demand: Tobacco is habitual purchase (nicotine addiction), not impulse
- Price sensitivity: Stick buyers (₱4-9/stick) are highly price-sensitive vs pack buyers (₱75-180/pack)
- Regional variation:
  - **NCR**: Premium sticks (Marlboro ₱9/stick, PM ₱8/stick) = 35% of stick volume
  - **Visayas/Mindanao**: Value sticks (Fortune ₱4.50/stick, Hope ₱3.50/stick) = 65% of stick volume
- Purchase frequency:
  - Stick buyers: 1-3 sticks per visit, 5-7 visits/week (daily habit)
  - Pack buyers: 1 pack per visit, 2-3 visits/week (stock-up)

**Data Patch**:
- **Fixes Gap #2** (Missing sachet/sticks economy), **Gap #6** (Unrealistic tobacco behavior)
- **Mechanics**:
  - Add 8 new SKUs: Cigarette sticks for all existing brands (Marlboro, PM, Fortune, Mighty, Hope)
    - Marlboro stick: ₱9.00 (₱180/20 = ₱9/stick)
    - PM stick: ₱8.00 (₱160/20 = ₱8/stick)
    - Fortune stick: ₱4.50 (₱90/20 = ₱4.50/stick)
    - Mighty stick: ₱4.00 (₱80/20 = ₱4/stick)
    - Hope stick: ₱3.50 (₱70/20 = ₱3.50/stick)
  - Redistribute tobacco volume: 60% sticks, 40% packs
  - Regional stick preference:
    - NCR: 50% premium sticks (Marlboro, PM), 50% value sticks (Fortune, Mighty, Hope)
    - Visayas/Mindanao: 30% premium, 70% value
  - Frequency pattern:
    - Stick buyers: `repeated_customer = TRUE`, 5-7 transactions/week per customer
    - Pack buyers: `repeated_customer = TRUE`, 2-3 transactions/week per customer

**Example Transactions**:
```sql
-- Mang Tony daily stick purchase (September 5, 2025, morning ritual)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-09-05 07:15:00', 'morning', ...,
   'Fortune Stick', 'SKU-FORT-1S', 'Tobacco', 'Cigarettes',
   false, false, 2, 4.50, 9.00, 0.00, 'cash',
   'CUST-00042', 52, 'M', 'low', 'urban',
   'purchase', 2, TRUE, 'branded', true, false), -- Daily habit (repeated_customer = TRUE)

-- Same customer, next day (September 6, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-09-06 07:10:00', 'morning', ...,
   'Fortune Stick', 'SKU-FORT-1S', 'Tobacco', 'Cigarettes',
   false, false, 2, 4.50, 9.00, 0.00, 'cash',
   'CUST-00042', 52, 'M', 'low', 'urban',
   'purchase', 2, TRUE, 'branded', true, false), -- Repeat purchase (loyalty)

-- Middle-income customer (NCR, premium stick preference)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-09-05 18:30:00', 'evening', ...,
   'Marlboro Stick', 'SKU-MARL-1S', 'Tobacco', 'Cigarettes',
   false, true, 3, 9.00, 27.00, 0.00, 'cash',
   'CUST-00205', 32, 'M', 'middle', 'urban',
   'purchase', 3, TRUE, 'branded', true, false), -- Premium brand loyal (TBWA client)
```

#### **Episode 6: "Back-to-School Gulo" (School Calendar Spike)**
**Time Window**: June 1-15, 2025 (school year opening)
**Affected Regions**: All regions (national pattern)
**Affected Categories**: Snacks (biscuits, candy), Beverages (powdered juice, water), Cooking (instant noodles)

**Market Dynamics**:
- Parents stock up for baon (kids' lunchboxes): Small-pack biscuits, candy, juice sachets
- Spike in sachet products: Skyflakes singles (₱3), Tang juice powder (₱5), instant noodles (₱14)
- Volume increase: Snacks +80%, Beverages +50%, Cooking +40%
- Promo activity: Distributors push "back-to-school" promos (buy 10 get 2 free)

**Data Patch**:
- **Fixes Gap #1** (Zero promo), **Gap #2** (Missing sachets), **Gap #5** (Missing key categories)
- **Mechanics**:
  - Add 15 new SKUs: Candy (₱1-5), biscuit singles (₱3-8), juice sachets (₱5-10)
  - Multiply snacks/beverages volume by 1.5-2x during June 1-15
  - Introduce `discount_amount`: 10-20% on multi-pack purchases
  - Increase `basket_size` for parents: 5-8 items (stocking up for 1-2 weeks)

**Example Transactions**:
```sql
-- Mae stocks up for kid's baon (June 3, 2025)
INSERT INTO scout.transactions (...) VALUES
  (uuid_generate_v4(), 'ST0001', '2025-06-03 10:00:00', 'morning', ...,
   'SkyFlakes Single', 'SKU-SKYF-30G', 'Snacks', 'Crackers',
   false, false, 20, 3.00, 60.00, 9.00, 'gcash',
   'CUST-00158', 28, 'F', 'middle', 'urban', ...), -- Buy 20 get 3 free promo (15% discount)
  (uuid_generate_v4(), 'ST0001', '2025-06-03 10:02:00', 'morning', ...,
   'Tang Orange Juice', 'SKU-TANG-25G', 'Beverages', 'Powdered Juice',
   false, false, 15, 5.00, 75.00, 0.00, 'gcash',
   'CUST-00158', 28, 'F', 'middle', 'urban', ...), -- 15 sachets for 2-week supply
```

### 2.3 Patch Design for Missing Data (REALISM-FIRST)

**Episode → Gap Mapping Table**:

| Gap # | Gap Description | Fixed By Episodes | Implementation Notes |
|-------|----------------|-------------------|----------------------|
| 1 | Zero promo activity | Ep 2, 3, 6 | Add `discount_amount` 10-30% during promo periods; target multi-pack purchases |
| 2 | Missing sachets/sticks | Ep 5, 6 | Add 33 new SKUs (cigarette sticks, shampoo sachets, candy, coffee sachets) |
| 3 | Flat temporal distribution | Ep 1, 2, 6 | Multiply volume by 2.5x on sweldo days (15th/30th), 4x during fiestas, 1.8x back-to-school |
| 4 | No regional brand bias | Ep 2, 5 | Apply regional weights (RC Cola 40% Visayas, Fortune 45% Mindanao, Marlboro 35% NCR) |
| 5 | Missing key categories | Ep 2, 6 | Add 20 SKUs (beer, dairy/coffee creamer, rice, eggs, canned goods, candy) |
| 6 | Unrealistic tobacco | Ep 3, 5 | 60/40 stick/pack split, daily purchase frequency (5-7x/week), price-driven switching |
| 7 | No OOS substitution | Ep 2, 4 | Create OOS triggers (volume >3x → 30% OOS rate), substitution logic (70% buy alternative, 30% leave) |
| 8 | Missing 11 regions | Ep 4 | Add 30 stores across MIMAROPA, Bicol, Eastern Visayas, BARMM, Caraga (3-5 stores per region) |
| 9 | No trip segmentation | Ep 1, 4, 6 | Define trip types: tingi (1-2 items, <₱50), daily (2-3 items, ₱30-80), stock-up (8-12 items, ₱800-1200) |
| 10 | No brand switching | Ep 3, 4 | Track customer switching (Marlboro → Fortune after price increase, Mae → 7-Eleven after competitor opens) |

**Generation Rules (SQL Logic)**:

```sql
-- Rule 1: Sweldo spike multiplier (Episode 1)
CASE
  WHEN EXTRACT(DAY FROM timestamp) BETWEEN 14 AND 16 THEN 2.5
  WHEN EXTRACT(DAY FROM timestamp) BETWEEN 29 AND 31 THEN 2.5
  ELSE 1.0
END AS sweldo_multiplier

-- Rule 2: Fiesta spike (Episode 2)
CASE
  WHEN region_code IN ('REGION_VI', 'REGION_VII', 'REGION_XI')
   AND timestamp BETWEEN '2025-06-24' AND '2025-06-30'
  THEN 4.0
  ELSE 1.0
END AS fiesta_multiplier

-- Rule 3: Tobacco price increase + switching (Episode 3)
CASE
  WHEN timestamp >= '2025-07-01'
   AND brand_name = 'Marlboro Red'
  THEN 180.00 -- Price increase from ₱165 to ₱180
  ELSE unit_price
END AS adjusted_price

-- Rule 4: Regional brand bias (Episode 4)
CASE
  WHEN region_code = 'REGION_VII' AND brand_name = 'RC Cola'
  THEN 0.40 -- 40% share in Visayas
  WHEN region_code = 'NCR' AND brand_name = 'Marlboro Red'
  THEN 0.35 -- 35% share in NCR
  ELSE 0.20 -- 20% baseline share
END AS regional_weight

-- Rule 5: Stick vs pack distribution (Episode 5)
CASE
  WHEN product_category = 'Tobacco'
   AND random() < 0.60 -- 60% sticks, 40% packs
  THEN brand_name || ' Stick' -- Generate stick SKU
  ELSE brand_name -- Keep pack SKU
END AS tobacco_sku_type

-- Rule 6: Promo discount logic (Episodes 2, 6)
CASE
  WHEN quantity >= 10 AND timestamp BETWEEN '2025-06-24' AND '2025-06-30' -- Fiesta promo
  THEN gross_amount * 0.20 -- 20% discount on bulk purchases
  WHEN quantity >= 5 AND timestamp BETWEEN '2025-06-01' AND '2025-06-15' -- Back-to-school promo
  THEN gross_amount * 0.15 -- 15% discount on multi-pack
  ELSE 0.00
END AS discount_amount
```

---

## STEP 3 – SYNTHETIC DATA SPEC (ENGINEER/AGENT-READY)

### 3.1 Column-Level Patch Spec

#### **Table: `scout.transactions` (CORE FACT TABLE)**

| Column | Current State | Target State | Generation Rule | Episode Impact |
|--------|--------------|--------------|-----------------|----------------|
| `discount_amount` | Always 0 | 0-30% of `gross_amount` | `CASE WHEN quantity >= 5 AND [promo_period] THEN gross_amount * [0.10, 0.15, 0.20, 0.30] ELSE 0 END` | Ep 2, 3, 6 |
| `timestamp` | Uniform distribution | Swe ldo/fiesta spikes | Multiply tx count by `[sweldo_multiplier] * [fiesta_multiplier]` on specific dates | Ep 1, 2, 6 |
| `brand_name` | Flat distribution | Regional bias | Sample with regional weights: `{"NCR": {"Marlboro": 0.35}, "REGION_VII": {"RC Cola": 0.40}}` | Ep 2, 4, 5 |
| `sku` | Pack-only tobacco | 60% sticks, 40% packs | `CASE WHEN category='Tobacco' AND random()<0.6 THEN brand||' Stick' ELSE brand END` | Ep 5 |
| `unit_price` | Static | Price tiers + increases | Sticks: ₱3.50-9.00, Packs: ₱55-180; +9% on 2025-07-01 for tobacco | Ep 3, 5 |
| `quantity` | Random 1-3 | Trip-type segmentation | Tingi: 1-2, Daily: 2-3, Stock-up: 8-12 | Ep 1, 4, 6 |
| `payment_method` | Random | Sweldo = GCash spike | `CASE WHEN sweldo_day THEN sample(['gcash': 0.5, 'cash': 0.4, 'maya': 0.1]) ELSE ['cash': 0.75, 'gcash': 0.2, 'card': 0.05] END` | Ep 1 |
| `customer_id` | 70% coverage | 85% coverage | Increase assigned customer IDs; track repeat customers for suki behavior | Ep 4, 5 |
| `repeated_customer` | 35% flat | 60% (varies by category) | Tobacco: 80%, Beverages: 55%, Snacks: 45%, Household: 65% | Ep 5 |
| `substitution_occurred` | 15% random | OOS-driven (30-70%) | `CASE WHEN [brand_volume > threshold] THEN TRUE for 70% of subsequent tx ELSE FALSE END` | Ep 2, 4 |
| `basket_size` | Random 1-8 | Trip-type driven | Tingi: 1-2, Daily: 2-4, Stock-up: 8-15, Fiesta: 20-30 | Ep 1, 2, 4, 6 |

#### **New SKUs to Add (Product Catalog Expansion)**

**Total New SKUs**: 33

| Category | New SKUs | Price Range | Episode | Market Share Target |
|----------|---------|-------------|---------|---------------------|
| **Tobacco (Sticks)** | 5 SKUs: Marlboro (₱9), PM (₱8), Fortune (₱4.50), Mighty (₱4), Hope (₱3.50) | ₱3.50-9.00 | Ep 5 | 60% of tobacco volume |
| **Beverages (Sachets)** | 4 SKUs: Tang Orange (₱5), Nestea Lemon (₱6), Zesto Orange (₱8), Eight O'Clock Coffee (₱7) | ₱5-8 | Ep 6 | 15% of beverage volume |
| **Beverages (Beer)** | 3 SKUs: San Miguel Pale Pilsen (₱55), Red Horse (₱65), Colt 45 (₱50) | ₱50-65 | Ep 2 | 10% of beverage volume |
| **Dairy** | 4 SKUs: Alaska Evap (₱65), Bear Brand Powdered (₱180), Nestle Coffee Creamer (₱150), Liberty Creamer (₱120) | ₱65-180 | Ep 1 | New category (8% of total revenue) |
| **Snacks (Candy)** | 6 SKUs: Choc-Nut (₱1), Flat Tops (₱2), Haw Flakes (₱3), Mentos (₱5), Tootsie Roll (₱3), White Rabbit (₱2) | ₱1-5 | Ep 6 | 12% of snacks volume |
| **Personal Care (Sachets)** | 5 SKUs: Creamsilk Conditioner 12ml (₱8), Dove Shampoo 12ml (₱10), Close-Up Toothpaste 15g (₱10), Nivea Lotion 25ml (₱15), Rexona Deo 25ml (₱12) | ₱8-15 | Ep 6 | 25% of personal care volume |
| **Cooking (Staples)** | 6 SKUs: NFA Rice per kilo (₱45), Egg (medium, ₱8/pc), Argentina Corned Beef (₱38), Century Tuna (₱32), Del Monte Spaghetti Sauce (₱45), Datu Puti Vinegar 385ml (₱22) | ₱8-45 | Ep 1, 6 | New/expanded items (12% of cooking) |

#### **New Stores to Add (Regional Expansion)**

**Total New Stores**: 30 (Target: 50 total stores across all 17 regions)

| Region | Current Stores | New Stores | Store Types | Cities |
|--------|---------------|------------|-------------|--------|
| MIMAROPA (REGION_IV_B) | 0 | 3 | 2 sari-sari, 1 convenience | Puerto Princesa (Palawan), Calapan (Mindoro), Romblon |
| Bicol (REGION_V) | 0 | 4 | 3 sari-sari, 1 convenience | Legazpi (Albay), Naga (Camarines Sur), Sorsogon, Masbate |
| Eastern Visayas (REGION_VIII) | 0 | 3 | 2 sari-sari, 1 convenience | Tacloban (Leyte), Ormoc (Leyte), Catbalogan (Samar) |
| Zamboanga Peninsula (REGION_IX) | 0 | 3 | 2 sari-sari, 1 convenience | Zamboanga City, Dipolog, Pagadian |
| Northern Mindanao (REGION_X) | 0 | 4 | 3 sari-sari, 1 convenience | Cagayan de Oro, Iligan, Valencia, Gingoog |
| SOCCSKSARGEN (REGION_XII) | 0 | 3 | 2 sari-sari, 1 convenience | General Santos, Koronadal, Kidapawan |
| Caraga (REGION_XIII) | 0 | 3 | 2 sari-sari, 1 convenience | Butuan, Surigao, Bayugan |
| BARMM | 0 | 3 | 3 sari-sari | Cotabato City, Marawi, Jolo |
| CAR | 0 | 2 | 2 sari-sari | Baguio, Tabuk |
| REGION_I (Ilocos) | 0 | 2 | 1 sari-sari, 1 convenience | Laoag, Vigan |

### 3.2 Example Synthetic Rows (Realistic PH FMCG Flavor)

#### **Example 1: Mang Tony Morning Tingi (Daily Habit)**
```sql
-- Transaction ID: uuid, Store: ST0001 (Aling Nena), Date: 2025-09-05 07:15 AM
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "store_id": "ST0001",
  "timestamp": "2025-09-05T07:15:00+08:00",
  "time_of_day": "morning",
  "region_code": "NCR",
  "province": "Metro Manila",
  "city": "Quezon City",
  "barangay": "Bagumbayan",
  "brand_name": "Fortune Stick",
  "sku": "SKU-FORT-1S",
  "product_category": "Tobacco",
  "product_subcategory": "Cigarettes",
  "our_brand": false,
  "tbwa_client_brand": false,
  "quantity": 2,
  "unit_price": 4.50,
  "gross_amount": 9.00,
  "discount_amount": 0.00,
  "net_amount": 9.00,
  "payment_method": "cash",
  "customer_id": "CUST-00042",
  "age": 52,
  "gender": "M",
  "income": "low",
  "urban_rural": "urban",
  "funnel_stage": "purchase",
  "basket_size": 2,
  "repeated_customer": true,
  "request_type": "branded",
  "suggestion_accepted": true,
  "substitution_occurred": false
}
-- Second item: Nescafe 3in1 sachet (same basket)
{
  "brand_name": "Nescafe 3in1",
  "sku": "SKU-NESC-25G",
  "product_category": "Beverages",
  "product_subcategory": "Coffee",
  "quantity": 1,
  "unit_price": 8.00,
  "gross_amount": 8.00,
  "net_amount": 8.00,
  -- ... (same customer/store/timestamp)
}
-- Basket Total: ₱17.00 (2 items, morning tingi)
```

#### **Example 2: Mae Sweldo Stock-Up (Episode 1)**
```sql
-- Transaction ID: uuid, Store: ST0001, Date: 2025-06-15 10:30 AM (Sweldo Day)
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "store_id": "ST0001",
  "timestamp": "2025-06-15T10:30:00+08:00",
  "time_of_day": "morning",
  "brand_name": "Lucky Me Pancit Canton",
  "sku": "SKU-LKME-60G",
  "product_category": "Cooking",
  "product_subcategory": "Instant Noodles",
  "quantity": 10,
  "unit_price": 14.00,
  "gross_amount": 140.00,
  "discount_amount": 0.00,
  "net_amount": 140.00,
  "payment_method": "gcash",
  "customer_id": "CUST-00158",
  "age": 28,
  "gender": "F",
  "income": "middle",
  "basket_size": 10,
  "repeated_customer": true,
  -- ... (9 more items: Ariel, shampoo sachets, cooking oil, etc.)
}
-- Basket Total: ₱1,050 (10 items, sweldo stock-up)
```

#### **Example 3: Lola Siony Fiesta Bulk Buy (Episode 2)**
```sql
-- Transaction ID: uuid, Store: ST0013 (Cebu), Date: 2025-06-24 09:00 AM (Fiesta Week)
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "store_id": "ST0013",
  "timestamp": "2025-06-24T09:00:00+08:00",
  "brand_name": "Coca-Cola",
  "sku": "SKU-COKE-330",
  "product_category": "Beverages",
  "product_subcategory": "Soft Drinks",
  "quantity": 24, -- 2 cases (12 bottles each)
  "unit_price": 25.00,
  "gross_amount": 600.00,
  "discount_amount": 90.00, -- 15% promo discount (buy 2 cases get 15% off)
  "net_amount": 510.00,
  "payment_method": "cash",
  "customer_id": "CUST-00723",
  "age": 68,
  "gender": "F",
  "income": "middle",
  "basket_size": 25,
  "repeated_customer": false, -- Infrequent but high-value
  -- ... (24 more items: RC Cola, chips, rice, etc.)
}
-- Basket Total: ₱4,200 (25 items, fiesta bulk buy, ₱630 total discounts)
```

#### **Example 4: Price Increase Switching (Episode 3)**
```sql
-- Transaction ID: uuid, Store: ST0001, Date: 2025-07-03 18:00 (Post-Price Increase)
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "store_id": "ST0001",
  "timestamp": "2025-07-03T18:00:00+08:00",
  "brand_name": "Fortune Stick",
  "sku": "SKU-FORT-1S",
  "product_category": "Tobacco",
  "quantity": 5, -- Switched from Marlboro pack (₱180) to Fortune sticks (5 × ₱4.50 = ₱22.50)
  "unit_price": 4.50,
  "gross_amount": 22.50,
  "net_amount": 22.50,
  "customer_id": "CUST-00205",
  "repeated_customer": true,
  "substitution_occurred": false, -- Voluntary switch (price-driven, not OOS)
  -- Note: Same customer previously bought "Marlboro Red" pack (pre-price increase)
}
```

#### **Example 5: OOS Substitution (Episode 2)**
```sql
-- Transaction ID: uuid, Store: ST0013 (Cebu), Date: 2025-06-26 15:30 (Fiesta Week, Coca-Cola OOS)
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "store_id": "ST0013",
  "timestamp": "2025-06-26T15:30:00+08:00",
  "brand_name": "RC Cola", -- Substitution: Coca-Cola was out-of-stock
  "sku": "SKU-RCCO-330",
  "product_category": "Beverages",
  "quantity": 12,
  "unit_price": 18.00,
  "gross_amount": 216.00,
  "net_amount": 216.00,
  "customer_id": "CUST-00891",
  "substitution_occurred": true, -- Customer originally requested Coca-Cola, bought RC Cola instead
  "suggestion_accepted": true -- Store owner suggested RC Cola as alternative
}
```

### 3.3 Validation & Realism Checklist

**Post-Seeding Validation Queries**:

```sql
-- 1. Sweldo/Fiesta Spikes (Episode 1, 2)
SELECT
  EXTRACT(DAY FROM timestamp) AS day_of_month,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue
FROM scout.transactions
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
ORDER BY 1;
-- Expected: Days 14-16, 29-31 should have 2-3x volume vs other days
-- Expected: June 24-30 (Cebu fiesta) should have 4x volume in REGION_VII stores

-- 2. Category/Brand Shares (Episode 4, 5)
SELECT
  product_category,
  brand_name,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  ROUND(100.0 * SUM(net_amount) / SUM(SUM(net_amount)) OVER (PARTITION BY product_category), 2) AS category_share_pct
FROM scout.transactions
GROUP BY 1, 2
ORDER BY 1, 4 DESC;
-- Expected: Tobacco - Marlboro 30-35%, Fortune 35-45%, Others 20-30%
-- Expected: Beverages (Visayas) - RC Cola 35-40%, Coca-Cola 30-35%

-- 3. Tobacco Stick vs Pack Split (Episode 5)
SELECT
  CASE WHEN sku LIKE '%-1S' THEN 'Stick' ELSE 'Pack' END AS tobacco_type,
  COUNT(*) AS tx_count,
  SUM(net_amount) AS revenue,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) AS volume_share_pct
FROM scout.transactions
WHERE product_category = 'Tobacco'
GROUP BY 1;
-- Expected: Sticks 55-65%, Packs 35-45%

-- 4. Regional Store Coverage (Episode 4 - store expansion)
SELECT
  r.name AS region_name,
  COUNT(DISTINCT s.id) AS stores_count,
  COUNT(t.id) AS tx_count,
  SUM(t.net_amount) AS revenue
FROM scout.regions r
LEFT JOIN scout.stores s ON r.code = s.region_code
LEFT JOIN scout.transactions t ON s.id = t.store_id
GROUP BY 1
ORDER BY 3 DESC;
-- Expected: All 17 regions should have >= 2 stores
-- Expected: NCR > Central Luzon > CALABARZON > Visayas > Mindanao (descending volume)

-- 5. Promo Activity (Episode 1, 2, 6)
SELECT
  DATE_TRUNC('week', timestamp) AS week,
  SUM(CASE WHEN discount_amount > 0 THEN 1 ELSE 0 END) AS promo_tx_count,
  SUM(discount_amount) AS total_discounts,
  ROUND(100.0 * SUM(CASE WHEN discount_amount > 0 THEN 1 ELSE 0 END) / COUNT(*), 2) AS promo_tx_pct
FROM scout.transactions
GROUP BY 1
ORDER BY 1;
-- Expected: 20-30% of transactions during Episode 2 (fiesta), 10-15% during Episode 6 (back-to-school)

-- 6. Repeat Customer Loyalty (Episode 5 - tobacco daily habit)
SELECT
  customer_id,
  COUNT(*) AS visit_count,
  COUNT(DISTINCT DATE_TRUNC('day', timestamp)) AS unique_days,
  SUM(net_amount) AS total_spend,
  AVG(basket_size) AS avg_basket_size
FROM scout.transactions
WHERE customer_id IS NOT NULL
  AND timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY 1
HAVING COUNT(*) >= 10
ORDER BY 2 DESC
LIMIT 20;
-- Expected: Top 20 customers should have 10-30 visits/month (suki behavior)
-- Expected: Tobacco buyers (Mang Tony types) should have 20-28 visits/month (daily habit)

-- 7. Substitution Rate During OOS (Episode 2)
SELECT
  brand_name,
  COUNT(CASE WHEN substitution_occurred = TRUE THEN 1 END) AS substitution_count,
  COUNT(*) AS total_tx,
  ROUND(100.0 * COUNT(CASE WHEN substitution_occurred = TRUE THEN 1 END) / COUNT(*), 2) AS substitution_rate
FROM scout.transactions
WHERE timestamp BETWEEN '2025-06-24' AND '2025-06-30'
  AND product_category IN ('Beverages', 'Tobacco')
GROUP BY 1
ORDER BY 3 DESC;
-- Expected: Coca-Cola/Marlboro should have 20-30% substitution rate during fiesta week (OOS scenarios)

-- 8. Missing Values Check
SELECT
  'transactions' AS table_name,
  COUNT(*) AS total_rows,
  COUNT(*) FILTER (WHERE discount_amount IS NULL) AS discount_null,
  COUNT(*) FILTER (WHERE customer_id IS NULL) AS customer_null,
  COUNT(*) FILTER (WHERE basket_size IS NULL) AS basket_null,
  ROUND(100.0 * COUNT(*) FILTER (WHERE customer_id IS NULL) / COUNT(*), 2) AS customer_null_pct
FROM scout.transactions;
-- Expected: discount_amount null: 0%, customer_id null: <20%, basket_size null: 0%
```

**Realism Checklist** (Pass/Fail Gates):

- ✅ **Sweldo Spikes**: Days 14-16, 29-31 = 2.3-2.7x baseline volume
- ✅ **Fiesta Spikes**: June 24-30 (Visayas) = 3.5-4.5x baseline volume
- ✅ **Category Shares**: Tobacco 18-22%, Beverages 20-25%, Snacks 12-18%, Personal Care 10-15%, Cooking 15-20%, Household 8-12%
- ✅ **Brand Hierarchy**: Each category has clear leaders (35-45%), challengers (25-35%), value brands (20-30%)
- ✅ **Tobacco Reality**: Sticks 55-65% volume, daily purchase frequency 5-7x/week for stick buyers
- ✅ **Regional Gaps**: <10% of regions have zero stores (vs 64% currently)
- ✅ **Promo Activity**: 20-30% of transactions have discounts >0 during promo periods
- ✅ **Price Architecture**: Sachets/sticks (₱1-10) = 35-45% of transaction count
- ✅ **Suki Loyalty**: Top 20 customers account for 15-25% of total revenue
- ✅ **OOS Substitution**: 25-35% substitution rate during high-demand periods (fiestas)

---

## IMPLEMENTATION PRIORITY (Next Steps)

**Phase 1 - Quick Wins** (Immediate dashboard impact):
1. Add 33 new SKUs (cigarette sticks, sachets, beer, candy) → Fixes gaps #2, #5
2. Apply sweldo/fiesta temporal multipliers → Fixes gap #3
3. Add `discount_amount` logic (10-30% during promos) → Fixes gap #1

**Phase 2 - Regional Expansion** (Distribution coverage):
4. Add 30 new stores across 11 missing regions → Fixes gap #8
5. Apply regional brand weights (RC Cola Visayas, Fortune Mindanao) → Fixes gap #4

**Phase 3 - Behavioral Realism** (Consumer insights):
6. Implement tobacco daily habit (5-7x/week stick purchases) → Fixes gap #6
7. Create OOS → substitution logic (Coca-Cola OOS → 70% buy RC Cola) → Fixes gap #7
8. Segment trip types (tingi, daily, stock-up) → Fixes gap #9
9. Track customer brand switching (Marlboro → Fortune after price hike) → Fixes gap #10

**Total Estimated Impact**: 150K+ realistic transactions, 50 stores, 66 SKUs, 17 regions, 6 episode arcs, 10 data gaps closed.

---

**END OF TELESERYE EDA SPEC**
