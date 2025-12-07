#!/usr/bin/env python3
"""
Scout Dashboard Demo Data Generator
Generates 3,500+ realistic transactions for Philippine retail network
"""

import os
import psycopg2
import uuid
from datetime import datetime, timedelta
import random
from decimal import Decimal

# Database connection
POSTGRES_URL = "postgresql://postgres.ublqmilcjtpnflofprkr:1G8TRd5wE7b9szBH@aws-1-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Store master data (15 stores across 3 regions)
STORES = [
    # NCR Stores (6)
    {"id": 101, "name": "BGC Financial District", "region": "NCR", "city": "Taguig", "barangay": "Fort Bonifacio", "lat": 14.5547, "lon": 121.0244, "type": "urban_premium"},
    {"id": 102, "name": "Makati CBD", "region": "NCR", "city": "Makati", "barangay": "Salcedo Village", "lat": 14.5547, "lon": 121.0244, "type": "urban_premium"},
    {"id": 103, "name": "Quezon City U-Belt", "region": "NCR", "city": "Quezon City", "barangay": "Sampaloc", "lat": 14.6091, "lon": 121.0223, "type": "urban_premium"},
    {"id": 104, "name": "Pasig Ortigas", "region": "NCR", "city": "Pasig", "barangay": "San Antonio", "lat": 14.5832, "lon": 121.0644, "type": "urban_premium"},
    {"id": 105, "name": "Manila Tourist Belt", "region": "NCR", "city": "Manila", "barangay": "Ermita", "lat": 14.5833, "lon": 120.9789, "type": "urban_premium"},
    {"id": 106, "name": "Mandaluyong Business District", "region": "NCR", "city": "Mandaluyong", "barangay": "Highway Hills", "lat": 14.5794, "lon": 121.0359, "type": "urban_premium"},

    # North Luzon Stores (5)
    {"id": 107, "name": "Baguio Session Road", "region": "North Luzon", "city": "Baguio", "barangay": "Session Road", "lat": 16.4023, "lon": 120.5960, "type": "provincial_traditional"},
    {"id": 108, "name": "Angeles Pampanga", "region": "North Luzon", "city": "Angeles", "barangay": "Balibago", "lat": 15.1450, "lon": 120.5887, "type": "provincial_traditional"},
    {"id": 109, "name": "Dagupan Pangasinan", "region": "North Luzon", "city": "Dagupan", "barangay": "Perez Boulevard", "lat": 16.0433, "lon": 120.3397, "type": "provincial_traditional"},
    {"id": 110, "name": "San Fernando La Union", "region": "North Luzon", "city": "San Fernando", "barangay": "Pagdalagan", "lat": 16.6159, "lon": 120.3167, "type": "provincial_traditional"},
    {"id": 111, "name": "Tarlac City", "region": "North Luzon", "city": "Tarlac", "barangay": "San Nicolas", "lat": 15.4735, "lon": 120.5963, "type": "provincial_traditional"},

    # Visayas Stores (4)
    {"id": 112, "name": "Cebu IT Park", "region": "Visayas", "city": "Cebu", "barangay": "Lahug", "lat": 10.3157, "lon": 123.8854, "type": "island_balanced"},
    {"id": 113, "name": "Iloilo Business District", "region": "Visayas", "city": "Iloilo", "barangay": "Mandurriao", "lat": 10.7202, "lon": 122.5621, "type": "island_balanced"},
    {"id": 114, "name": "Bacolod City Center", "region": "Visayas", "city": "Bacolod", "barangay": "Singcang-Airport", "lat": 10.6394, "lon": 122.9505, "type": "island_balanced"},
    {"id": 115, "name": "Tacloban Waterfront", "region": "Visayas", "city": "Tacloban", "barangay": "Downtown", "lat": 11.2433, "lon": 125.0039, "type": "island_balanced"},
]

# Product catalog
PRODUCTS = [
    # Beverages
    {"brand": "Coca-Cola", "name": "Coca-Cola 355ml Can", "category": "Beverages", "price": 45.00},
    {"brand": "Gatorade", "name": "Gatorade Blue Bolt", "category": "Beverages", "price": 45.00},
    {"brand": "C2", "name": "C2 Green Tea Apple", "category": "Beverages", "price": 27.30},
    {"brand": "Red Bull", "name": "Red Bull Energy Drink", "category": "Beverages", "price": 65.00},
    {"brand": "Monster", "name": "Monster Energy", "category": "Beverages", "price": 75.00},
    {"brand": "Nestlé", "name": "Nescafé 3-in-1", "category": "Beverages", "price": 25.00},
    {"brand": "Starbucks", "name": "Starbucks Frappuccino", "category": "Beverages", "price": 185.00},
    {"brand": "San Miguel", "name": "San Mig Light Beer", "category": "Beverages", "price": 65.00},

    # Snacks
    {"brand": "Piattos", "name": "Piattos Cheese", "category": "Snacks", "price": 35.95},
    {"brand": "Jack 'n Jill", "name": "V-Cut Potato Chips BBQ", "category": "Snacks", "price": 22.00},
    {"brand": "Oishi", "name": "Oishi Prawn Crackers", "category": "Snacks", "price": 28.00},
    {"brand": "Oishi", "name": "Oishi Choco Chug", "category": "Snacks", "price": 27.30},
    {"brand": "Lays", "name": "Lays Classic", "category": "Snacks", "price": 42.00},

    # Personal Care
    {"brand": "Safeguard", "name": "Safeguard Classic Soap", "category": "Personal Care", "price": 40.08},
    {"brand": "Pantene", "name": "Pantene Shampoo", "category": "Personal Care", "price": 135.00},
    {"brand": "Colgate", "name": "Colgate Total Toothpaste", "category": "Personal Care", "price": 125.00},

    # Home Care
    {"brand": "Surf", "name": "Surf Powder Detergent", "category": "Home Care", "price": 65.00},
    {"brand": "Tide", "name": "Tide Powder Detergent", "category": "Home Care", "price": 202.50},
    {"brand": "Downy", "name": "Downy Fabric Conditioner", "category": "Home Care", "price": 145.00},

    # Tobacco
    {"brand": "Marlboro", "name": "Marlboro Red", "category": "Tobacco", "price": 150.00},
    {"brand": "Fortune", "name": "Fortune Menthol", "category": "Tobacco", "price": 85.00},
]

def get_payment_method(region):
    """Generate payment method based on region"""
    rand = random.random()
    if region == "NCR":
        if rand < 0.45: return "cash"
        elif rand < 0.77: return "gcash"
        elif rand < 0.90: return "maya"
        else: return "card"
    elif region == "North Luzon":
        if rand < 0.65: return "cash"
        elif rand < 0.85: return "gcash"
        elif rand < 0.95: return "maya"
        else: return "card"
    else:  # Visayas
        if rand < 0.52: return "cash"
        elif rand < 0.74: return "gcash"
        elif rand < 0.92: return "maya"
        else: return "card"

def generate_transactions():
    """Generate all transactions"""
    transactions = []
    start_date = datetime(2025, 11, 7)

    for day_offset in range(30):  # 30 days
        current_date = start_date + timedelta(days=day_offset)
        is_weekend = current_date.weekday() >= 5

        for store in STORES:
            # Transactions per day based on store type
            if store["type"] == "urban_premium":
                txn_count = random.randint(10, 15)
            elif store["type"] == "provincial_traditional":
                txn_count = random.randint(6, 10)
            else:  # island_balanced
                txn_count = random.randint(7, 11)

            # Weekend +20%
            if is_weekend:
                txn_count = int(txn_count * 1.2)

            for _ in range(txn_count):
                # Generate daypart
                daypart_rand = random.random()
                if daypart_rand < 0.35:
                    daypart = "Morning"
                    hour = random.randint(6, 11)
                elif daypart_rand < 0.65:
                    daypart = "Afternoon"
                    hour = random.randint(12, 16)
                elif daypart_rand < 0.90:
                    daypart = "Evening"
                    hour = random.randint(17, 20)
                else:
                    daypart = "Night"
                    hour = random.randint(21, 23)

                minute = random.randint(0, 59)
                txn_timestamp = current_date.replace(hour=hour, minute=minute)

                # Generate basket
                basket_size = random.choices([1, 2, 3, 4, 5], weights=[60, 25, 10, 3, 2])[0]
                selected_products = random.sample(PRODUCTS, min(basket_size, len(PRODUCTS)))

                total_amount = sum(p["price"] * (1 + random.uniform(-0.1, 0.1)) for p in selected_products)

                # Pick representative product for transaction record
                main_product = selected_products[0]

                transaction = {
                    "id": str(uuid.uuid4()),
                    "transaction_id": str(uuid.uuid4()),
                    "store_id": str(store["id"]),
                    "region": store["region"],
                    "timestamp": txn_timestamp,
                    "peso_value": round(Decimal(total_amount), 2),
                    "units": basket_size,
                    "duration_seconds": random.randint(120, 420),
                    "category": main_product["category"],
                    "brand": main_product["brand"],
                    "sku": f"{main_product['category'][:3].upper()}-{random.randint(1, 999):03d}",
                    "request_method": get_payment_method(store["region"]),
                }

                transactions.append(transaction)

    return transactions

def insert_transactions(conn, transactions):
    """Insert transactions into database"""
    cursor = conn.cursor()

    insert_query = """
    INSERT INTO transactions (
        id, transaction_id, store_id, region, timestamp,
        peso_value, units, duration_seconds, category, brand, sku,
        request_method, created_at
    ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s, %s,
        %s, NOW()
    )
    """

    for txn in transactions:
        cursor.execute(insert_query, (
            txn["id"], txn["transaction_id"], txn["store_id"], txn["region"], txn["timestamp"],
            txn["peso_value"], txn["units"], txn["duration_seconds"], txn["category"], txn["brand"], txn["sku"],
            txn["request_method"]
        ))

    conn.commit()
    print(f"✅ Inserted {len(transactions)} transactions")

def main():
    print("🚀 Scout Dashboard Demo Data Generator")
    print("=" * 60)

    # Generate transactions
    print("\n📊 Generating transactions...")
    transactions = generate_transactions()
    print(f"   Generated {len(transactions)} transactions")

    # Connect to database
    print("\n🔗 Connecting to Supabase...")
    conn = psycopg2.connect(POSTGRES_URL)

    # Clear existing data
    print("\n🗑️  Clearing existing demo data...")
    cursor = conn.cursor()
    cursor.execute("DELETE FROM transactions WHERE store_id::INTEGER BETWEEN 101 AND 115")
    cursor.execute("DELETE FROM daily_metrics WHERE store_id::TEXT IN (SELECT store_id::TEXT FROM transactions WHERE store_id::INTEGER BETWEEN 101 AND 115)")
    conn.commit()

    # Insert new data
    print("\n💾 Inserting new transactions...")
    insert_transactions(conn, transactions)

    # Verify
    print("\n✅ Verifying data...")
    cursor.execute("SELECT region, COUNT(*), SUM(peso_value) FROM transactions GROUP BY region ORDER BY region")
    for row in cursor.fetchall():
        print(f"   {row[0]}: {row[1]} txns, ₱{row[2]:,.2f}")

    cursor.close()
    conn.close()

    print("\n🎉 Demo data seeding complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
