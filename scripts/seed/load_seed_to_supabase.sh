#!/bin/bash
# Scout Dashboard Seed Data Loader
# Loads generated CSVs into Supabase scout.* tables
#
# Prerequisites:
#   - psql installed
#   - DATABASE_URL environment variable set
#   - Seed CSVs generated in out/seed/
#
# Usage:
#   export DATABASE_URL="postgresql://postgres:<PASS>@db.<ref>.supabase.co:5432/postgres?sslmode=require"
#   ./load_seed_to_supabase.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default paths
SEED_DIR="${SEED_DIR:-out/seed}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"

    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Error: psql is not installed${NC}"
        exit 1
    fi

    if [ -z "${DATABASE_URL:-}" ]; then
        echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
        echo "Set it with: export DATABASE_URL=\"postgresql://postgres:<PASS>@db.<ref>.supabase.co:5432/postgres?sslmode=require\""
        exit 1
    fi

    # Check if seed files exist
    local seed_path="$REPO_ROOT/$SEED_DIR"
    if [ ! -d "$seed_path" ]; then
        echo -e "${RED}Error: Seed directory not found: $seed_path${NC}"
        echo "Run the seed generator first: python scripts/seed/seed_ph_fmcg_market.py"
        exit 1
    fi

    local required_files=("brands.csv" "products.csv" "stores.csv" "customers.csv" "transactions.csv" "transaction_items.csv")
    for file in "${required_files[@]}"; do
        if [ ! -f "$seed_path/$file" ]; then
            echo -e "${RED}Error: Missing seed file: $seed_path/$file${NC}"
            exit 1
        fi
    done

    echo -e "${GREEN}All prerequisites met${NC}"
}

# Create schema and tables
create_schema() {
    echo -e "${YELLOW}Creating scout schema and tables...${NC}"

    psql "$DATABASE_URL" <<'SQL'
-- Create schema
CREATE SCHEMA IF NOT EXISTS scout;

-- Bronze tables
CREATE TABLE IF NOT EXISTS scout.bronze_brands (
    brand_id TEXT PRIMARY KEY,
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    brand_role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scout.bronze_products (
    product_id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL REFERENCES scout.bronze_brands(brand_id),
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    pack_size TEXT NOT NULL,
    base_price_php NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scout.bronze_stores (
    store_id TEXT PRIMARY KEY,
    store_name TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    barangay TEXT NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scout.bronze_customers (
    customer_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    sex TEXT,
    age INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scout.bronze_transactions (
    transaction_id TEXT PRIMARY KEY,
    transaction_date DATE NOT NULL,
    store_id TEXT NOT NULL REFERENCES scout.bronze_stores(store_id),
    customer_id TEXT NOT NULL REFERENCES scout.bronze_customers(customer_id),
    payment_method TEXT,
    receipt_no TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scout.bronze_transaction_items (
    transaction_id TEXT NOT NULL REFERENCES scout.bronze_transactions(transaction_id),
    line_no INT NOT NULL,
    product_id TEXT NOT NULL REFERENCES scout.bronze_products(product_id),
    brand_name TEXT NOT NULL,
    category TEXT NOT NULL,
    product_name TEXT NOT NULL,
    pack_size TEXT NOT NULL,
    qty INT NOT NULL,
    unit_price_php NUMERIC(10,2) NOT NULL,
    line_total_php NUMERIC(10,2) NOT NULL,
    is_promo INT NOT NULL DEFAULT 0,
    is_noisy INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (transaction_id, line_no)
);
SQL

    echo -e "${GREEN}Schema and tables created${NC}"
}

# Truncate existing data (optional, for clean reload)
truncate_data() {
    echo -e "${YELLOW}Truncating existing data...${NC}"

    psql "$DATABASE_URL" <<'SQL'
TRUNCATE scout.bronze_transaction_items CASCADE;
TRUNCATE scout.bronze_transactions CASCADE;
TRUNCATE scout.bronze_customers CASCADE;
TRUNCATE scout.bronze_stores CASCADE;
TRUNCATE scout.bronze_products CASCADE;
TRUNCATE scout.bronze_brands CASCADE;
SQL

    echo -e "${GREEN}Data truncated${NC}"
}

# Load CSV files
load_data() {
    local seed_path="$REPO_ROOT/$SEED_DIR"
    echo -e "${YELLOW}Loading seed data from $seed_path...${NC}"

    echo "Loading brands..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_brands(brand_id, brand_name, category, brand_role) FROM '$seed_path/brands.csv' CSV HEADER"

    echo "Loading products..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_products(product_id, brand_id, brand_name, category, product_name, pack_size, base_price_php) FROM '$seed_path/products.csv' CSV HEADER"

    echo "Loading stores..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_stores(store_id, store_name, region, city, barangay, lat, lng) FROM '$seed_path/stores.csv' CSV HEADER"

    echo "Loading customers..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_customers(customer_id, full_name, sex, age) FROM '$seed_path/customers.csv' CSV HEADER"

    echo "Loading transactions..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_transactions(transaction_id, transaction_date, store_id, customer_id, payment_method, receipt_no) FROM '$seed_path/transactions.csv' CSV HEADER"

    echo "Loading transaction items..."
    psql "$DATABASE_URL" -c "\copy scout.bronze_transaction_items(transaction_id, line_no, product_id, brand_name, category, product_name, pack_size, qty, unit_price_php, line_total_php, is_promo, is_noisy) FROM '$seed_path/transaction_items.csv' CSV HEADER"

    echo -e "${GREEN}Data loaded successfully${NC}"
}

# Verify counts
verify_data() {
    echo -e "${YELLOW}Verifying data counts...${NC}"

    psql "$DATABASE_URL" -c "
SELECT
    'brands' AS table_name, COUNT(*) AS row_count FROM scout.bronze_brands
UNION ALL
SELECT
    'products', COUNT(*) FROM scout.bronze_products
UNION ALL
SELECT
    'stores', COUNT(*) FROM scout.bronze_stores
UNION ALL
SELECT
    'customers', COUNT(*) FROM scout.bronze_customers
UNION ALL
SELECT
    'transactions', COUNT(*) FROM scout.bronze_transactions
UNION ALL
SELECT
    'transaction_items', COUNT(*) FROM scout.bronze_transaction_items
ORDER BY table_name;
"

    echo -e "${GREEN}Verification complete${NC}"
}

# Main
main() {
    echo "================================================"
    echo "Scout Dashboard Seed Data Loader"
    echo "================================================"

    check_prerequisites

    # Ask for confirmation
    echo ""
    read -p "This will truncate existing data and reload. Continue? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi

    create_schema
    truncate_data
    load_data
    verify_data

    echo ""
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}Seed data loaded successfully!${NC}"
    echo -e "${GREEN}================================================${NC}"
}

main "$@"
