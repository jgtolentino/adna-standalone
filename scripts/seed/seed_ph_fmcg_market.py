#!/usr/bin/env python3
"""
PH FMCG + Tobacco market seed generator with realistic noise + regional idiosyncrasies.

Outputs:
  out/seed/
    brands.csv
    products.csv
    stores.csv
    customers.csv
    transactions.csv
    transaction_items.csv

Optionally loads into Postgres if DATABASE_URL is set.
"""

from __future__ import annotations

import os
import re
import math
import json
import random
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional

import numpy as np
import pandas as pd
from faker import Faker
from tqdm import tqdm

fake = Faker("en_PH")

SEED = int(os.getenv("SEED", "1337"))
random.seed(SEED)
np.random.seed(SEED)

OUT_DIR = Path(os.getenv("OUT_DIR", "out/seed"))
OUT_DIR.mkdir(parents=True, exist_ok=True)

DAYS = int(os.getenv("DAYS", "365"))
N_TX = int(os.getenv("N_TX", "18000"))
# target line items, actual will vary by basket size; keep as guidance
TARGET_ITEMS = int(os.getenv("TARGET_ITEMS", "60000"))

START_DATE = os.getenv("START_DATE")  # optional YYYY-MM-DD
if START_DATE:
    start_dt = datetime.strptime(START_DATE, "%Y-%m-%d").date()
else:
    start_dt = (date.today() - timedelta(days=DAYS))

# -------------------------
# Region model (PH reality-ish)
# -------------------------
REGIONS = [
    ("NCR", 0.18, ["Quezon City", "Manila", "Makati", "Taguig", "Pasig"]),
    ("Region III", 0.10, ["San Fernando", "Angeles", "Malolos", "Olongapo", "Cabanatuan"]),
    ("Region IV-A", 0.12, ["Calamba", "Santa Rosa", "Lucena", "Antipolo", "Batangas City"]),
    ("Region VII", 0.07, ["Cebu City", "Lapu-Lapu", "Mandaue", "Tagbilaran", "Dumaguete"]),
    ("Region VI", 0.06, ["Iloilo City", "Bacolod", "Roxas City", "San Jose", "Kalibo"]),
    ("Region XI", 0.05, ["Davao City", "Panabo", "Tagum", "Digos", "Mati"]),
    ("Region X", 0.05, ["Cagayan de Oro", "Iligan", "Valencia", "Malaybalay", "Ozamiz"]),
    ("Region I", 0.04, ["San Fernando (LU)", "Dagupan", "Laoag", "Vigan", "Alaminos"]),
    ("Region II", 0.03, ["Tuguegarao", "Ilagan", "Cauayan", "Santiago", "Bayombong"]),
    ("CAR", 0.02, ["Baguio", "La Trinidad", "Tabuk", "Bontoc", "Lagawe"]),
    ("Region V", 0.04, ["Legazpi", "Naga", "Sorsogon City", "Masbate City", "Iriga"]),
    ("Region VIII", 0.03, ["Tacloban", "Ormoc", "Catbalogan", "Calbayog", "Borongan"]),
    ("Region IX", 0.02, ["Zamboanga City", "Pagadian", "Dipolog", "Dapitan", "Isabela City"]),
    ("Region XII", 0.02, ["General Santos", "Koronadal", "Tacurong", "Kidapawan", "Cotabato City"]),
    ("Region XIII", 0.01, ["Butuan", "Surigao City", "Tandag", "Bislig", "Bayugan"]),
    ("MIMAROPA", 0.01, ["Puerto Princesa", "Calapan", "Odiongan", "Boac", "Romblon"]),
    ("BARMM", 0.01, ["Cotabato City", "Marawi", "Lamitan", "Jolo", "Bongao"]),
]

def weighted_choice(items: List[Tuple], rng=random.random):
    r = rng()
    cum = 0.0
    for item in items:
        w = item[1]
        cum += w
        if r <= cum:
            return item
    return items[-1]

# Barangay flavor (lightweight but realistic)
BRGY_TOKENS = [
    "Poblacion", "San Isidro", "San Roque", "Sto. Nino", "Bagong Silang", "Mabini",
    "Maligaya", "San Jose", "Pag-asa", "Del Pilar", "Nueva", "Sto. Rosario",
    "Santo Cristo", "San Miguel", "Santa Cruz", "Rizal", "Masagana", "Maharlika"
]

STORE_PREFIX = [
    "Tindahan ni", "Sari-Sari ni", "Aling", "Mang", "Mga Kaibigan ni", "Kanto ni",
    "Paresan ni", "Mini Mart ni", "Bahay Kape ni"
]
STORE_SUFFIX = ["Store", "Sari-Sari", "Mini Mart", "Mart", "Corner", "Kiosk", "Tindahan"]

# -------------------------
# Brand / product catalog
# -------------------------
CATEGORIES = [
    ("Dairy", 0.08),
    ("Snacks", 0.22),
    ("Beverage", 0.22),
    ("Tobacco", 0.18),
    ("Cleaning", 0.10),
    ("Personal Care", 0.20),
]

# Minimal but extensible "market landscape"
# Add/replace with your full 47-brand list anytime.
BRANDS = {
    "Dairy": [
        ("Alaska", "client"), ("Bear Brand", "competitor"), ("Nestle Fresh Milk", "competitor"),
        ("Anchor", "competitor"), ("Selecta", "competitor"),
    ],
    "Snacks": [
        ("Oishi", "client"), ("Jack 'n Jill", "competitor"), ("Leslie's", "competitor"),
        ("Piattos", "competitor"), ("Nova", "competitor"), ("Clover", "competitor"),
    ],
    "Beverage": [
        ("Del Monte", "client"), ("C2", "competitor"), ("Coca-Cola", "competitor"),
        ("Pepsi", "competitor"), ("Zest-O", "competitor"), ("Minute Maid", "competitor"),
    ],
    "Tobacco": [
        ("JTI", "client"), ("Marlboro", "competitor"), ("Fortune", "competitor"),
        ("Winston", "competitor"), ("Camel", "competitor"),
    ],
    "Cleaning": [
        ("Champion", "competitor"), ("Joy", "competitor"), ("Surf", "competitor"),
        ("Ariel", "competitor"), ("Zonrox", "competitor"),
    ],
    "Personal Care": [
        ("Safeguard", "competitor"), ("Palmolive", "competitor"), ("Colgate", "competitor"),
        ("Closeup", "competitor"), ("Head & Shoulders", "competitor"), ("Cream Silk", "competitor"),
    ],
}

# Pack sizes + baseline prices (PHP) by category for sari-sari realism
PACKS = {
    "Dairy": [("250ml", 28), ("1L", 95), ("Powder 33g", 12), ("Powder 150g", 58)],
    "Snacks": [("16g", 10), ("30g", 18), ("55g", 35), ("100g", 75)],
    "Beverage": [("250ml", 15), ("350ml", 22), ("500ml", 30), ("1L", 55)],
    "Tobacco": [("Stick", 8), ("Pack", 75)],
    "Cleaning": [("Sachet", 12), ("250ml", 35), ("500ml", 62), ("1L", 110)],
    "Personal Care": [("Sachet", 9), ("50ml", 35), ("100ml", 65), ("Bar", 28)],
}

# Substitution / switching propensity by category (higher = more likely)
SWITCHINESS = {
    "Dairy": 0.20,
    "Snacks": 0.45,
    "Beverage": 0.40,
    "Tobacco": 0.25,
    "Cleaning": 0.18,
    "Personal Care": 0.22,
}

# -------------------------
# Noise models
# -------------------------
def maybe_typo(s: str, p: float) -> str:
    if random.random() > p or len(s) < 5:
        return s
    i = random.randint(1, len(s)-2)
    return s[:i] + random.choice("abcdefghijklmnopqrstuvwxyz") + s[i+1:]

def promo_price(base: float, category: str) -> float:
    # promos more common in snacks/bev, less in tobacco
    promo_p = {"Snacks": 0.22, "Beverage": 0.20, "Dairy": 0.10, "Tobacco": 0.05, "Cleaning": 0.08, "Personal Care": 0.12}
    if random.random() < promo_p.get(category, 0.10):
        disc = random.choice([0.05, 0.10, 0.15, 0.20])
        return base * (1.0 - disc)
    return base

def region_price_multiplier(region: str) -> float:
    # mild logistics/price differences
    if region == "NCR":
        return 1.05
    if region in ("Region III", "Region IV-A"):
        return 1.02
    if region in ("CAR", "MIMAROPA", "BARMM", "Region XIII"):
        return 1.08
    return 1.00

def stockout_chance(category: str) -> float:
    # stockouts higher in remote regions and for snacks/bev
    base = {"Snacks": 0.08, "Beverage": 0.07, "Dairy": 0.05, "Tobacco": 0.04, "Cleaning": 0.03, "Personal Care": 0.04}
    return base.get(category, 0.05)

# -------------------------
# Entities
# -------------------------
@dataclass
class Brand:
    brand_id: str
    name: str
    category: str
    role: str  # client/competitor

@dataclass
class Product:
    product_id: str
    brand_id: str
    brand: str
    category: str
    name: str
    pack: str
    base_price: float

def make_id(prefix: str, n: int) -> str:
    return f"{prefix}{n:06d}"

def build_catalog() -> Tuple[pd.DataFrame, pd.DataFrame]:
    brand_rows: List[Dict] = []
    prod_rows: List[Dict] = []
    b = 1
    p = 1

    for cat, _ in CATEGORIES:
        for (brand_name, role) in BRANDS.get(cat, []):
            brand_id = make_id("B", b); b += 1
            brand_rows.append({
                "brand_id": brand_id,
                "brand_name": brand_name,
                "category": cat,
                "brand_role": role,
            })

            # 6-12 SKUs per brand with realistic pack variants
            n_skus = random.randint(6, 12)
            packs = PACKS[cat]
            for _ in range(n_skus):
                pack, price = random.choice(packs)
                # small brand-level variance
                base_price = max(5.0, price * random.uniform(0.9, 1.15))
                prod_name = f"{brand_name} {cat} {pack}"
                prod_rows.append({
                    "product_id": make_id("P", p),
                    "brand_id": brand_id,
                    "brand_name": brand_name,
                    "category": cat,
                    "product_name": prod_name,
                    "pack_size": pack,
                    "base_price_php": round(base_price, 2),
                })
                p += 1

    return pd.DataFrame(brand_rows), pd.DataFrame(prod_rows)

def build_customers(n: int = 1000) -> pd.DataFrame:
    rows = []
    for i in range(1, n + 1):
        # bias adult ages, but can still include noise (bad data)
        age = int(np.clip(np.random.normal(32, 11), 18, 70))
        rows.append({
            "customer_id": make_id("C", i),
            "full_name": fake.name(),
            "sex": random.choice(["M", "F"]),
            "age": age,
        })
    return pd.DataFrame(rows)

def build_stores(n: int = 450) -> pd.DataFrame:
    rows = []
    for i in range(1, n + 1):
        region, _, cities = weighted_choice(REGIONS)
        city = random.choice(cities)
        brgy = random.choice(BRGY_TOKENS)
        owner = fake.first_name()
        store_name = f"{random.choice(STORE_PREFIX)} {owner} {random.choice(STORE_SUFFIX)}"
        # add slight local flavor
        store_name = store_name.replace("  ", " ").strip()

        rows.append({
            "store_id": make_id("S", i),
            "store_name": store_name,
            "region": region,
            "city": city,
            "barangay": brgy,
            "lat": float(fake.latitude()),
            "lng": float(fake.longitude()),
        })
    return pd.DataFrame(rows)

def pick_category() -> str:
    cats = [(c, w) for c, w in CATEGORIES]
    r = random.random()
    cum = 0.0
    for c, w in cats:
        cum += w
        if r <= cum:
            return c
    return cats[-1][0]

def simulate_transactions(
    stores: pd.DataFrame,
    customers: pd.DataFrame,
    products: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame]:
    tx_rows = []
    item_rows = []

    # pre-index products by category and by brand for substitution
    prod_by_cat = {cat: df for cat, df in products.groupby("category")}
    brand_by_cat = {}
    for cat in prod_by_cat.keys():
        brand_by_cat[cat] = prod_by_cat[cat]["brand_name"].unique().tolist()

    # basket sizes: sari-sari often 1-5 items, sometimes bigger
    def basket_size():
        r = random.random()
        if r < 0.55: return random.randint(1, 3)
        if r < 0.85: return random.randint(3, 6)
        if r < 0.97: return random.randint(6, 10)
        return random.randint(10, 16)

    # daily demand curve with payday spikes (15/30) + weekends
    def demand_weight(d: date) -> float:
        w = 1.0
        if d.day in (14, 15, 29, 30, 31): w *= 1.20
        if d.weekday() >= 5: w *= 1.10
        # slight seasonal bump in Dec
        if d.month == 12: w *= 1.15
        return w

    # date sampling distribution
    dates = [start_dt + timedelta(days=i) for i in range(DAYS)]
    weights = np.array([demand_weight(d) for d in dates], dtype=float)
    weights = weights / weights.sum()

    for tx_i in tqdm(range(1, N_TX + 1), desc="transactions"):
        tx_id = make_id("T", tx_i)
        tx_date = np.random.choice(dates, p=weights).astype("datetime64[D]").astype(date)

        store = stores.sample(1, random_state=random.randint(0, 10_000)).iloc[0]
        cust = customers.sample(1, random_state=random.randint(0, 10_000)).iloc[0]

        # payment mix sari-sari: mostly cash
        payment = random.choices(["cash", "gcash", "maya", "card"], weights=[0.72, 0.16, 0.08, 0.04])[0]

        # region multiplier influences price
        rpm = region_price_multiplier(store["region"])

        n_items = basket_size()
        tx_rows.append({
            "transaction_id": tx_id,
            "transaction_date": tx_date.isoformat(),
            "store_id": store["store_id"],
            "customer_id": cust["customer_id"],
            "payment_method": payment,
            # optional noisy field: receipt_no with occasional weirdness
            "receipt_no": maybe_typo(fake.bothify(text="RCPT-####-#####"), p=0.03),
        })

        # build line items
        for li in range(1, n_items + 1):
            cat = pick_category()
            dfc = prod_by_cat[cat]

            # pick a product
            prod = dfc.sample(1, random_state=random.randint(0, 10_000)).iloc[0]

            # simulate stockout -> substitute with another brand/category
            if random.random() < stockout_chance(cat):
                if random.random() < SWITCHINESS.get(cat, 0.25):
                    # switch brand within same category
                    alt_brand = random.choice(brand_by_cat[cat])
                    alt = dfc[dfc["brand_name"] == alt_brand].sample(1, random_state=random.randint(0, 10_000)).iloc[0]
                    prod = alt

            # qty logic: tobacco often 1 pack or a few sticks
            if cat == "Tobacco":
                qty = random.choices([1, 2, 3, 5], weights=[0.65, 0.20, 0.10, 0.05])[0]
            else:
                qty = random.choices([1, 2, 3, 4], weights=[0.70, 0.18, 0.08, 0.04])[0]

            base_price = float(prod["base_price_php"]) * rpm
            unit_price = promo_price(base_price, cat)

            # add small rounding/noise
            if random.random() < 0.08:
                unit_price *= random.uniform(0.98, 1.02)
            unit_price = round(unit_price, 2)

            line_total = round(unit_price * qty, 2)

            # OCR-ish noise columns (optional)
            noisy_product_name = prod["product_name"]
            if random.random() < 0.05:
                noisy_product_name = maybe_typo(noisy_product_name, p=0.8)

            item_rows.append({
                "transaction_id": tx_id,
                "line_no": li,
                "product_id": prod["product_id"],
                "brand_name": prod["brand_name"],
                "category": cat,
                "product_name": noisy_product_name,
                "pack_size": prod["pack_size"],
                "qty": qty,
                "unit_price_php": unit_price,
                "line_total_php": line_total,
                # flags
                "is_promo": int(unit_price < base_price),
                "is_noisy": int(noisy_product_name != prod["product_name"]),
            })

    tx_df = pd.DataFrame(tx_rows)
    items_df = pd.DataFrame(item_rows)

    # Add some missingness (data quality reality)
    if len(tx_df) > 0:
        miss_idx = tx_df.sample(frac=0.01, random_state=SEED).index
        tx_df.loc[miss_idx, "receipt_no"] = None

    return tx_df, items_df

def save_csv(df: pd.DataFrame, name: str):
    path = OUT_DIR / name
    df.to_csv(path, index=False)
    print(f"Wrote {path} ({len(df):,} rows)")

def main():
    brands_df, products_df = build_catalog()
    customers_df = build_customers(1000)
    stores_df = build_stores(500)

    tx_df, items_df = simulate_transactions(stores_df, customers_df, products_df)

    # Basic sanity: ensure we hit the ballpark for items
    print(f"Transactions: {len(tx_df):,}")
    print(f"Line items:   {len(items_df):,} (target ~{TARGET_ITEMS:,})")

    save_csv(brands_df, "brands.csv")
    save_csv(products_df, "products.csv")
    save_csv(stores_df, "stores.csv")
    save_csv(customers_df, "customers.csv")
    save_csv(tx_df, "transactions.csv")
    save_csv(items_df, "transaction_items.csv")

if __name__ == "__main__":
    main()
