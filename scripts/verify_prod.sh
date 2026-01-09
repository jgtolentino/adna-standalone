#!/bin/bash

# Scout Dashboard Production Verification Script
# Usage: ./scripts/verify_prod.sh [BASE_URL]
# Default: https://scout-dashboard-xi.vercel.app

set -e

BASE_URL="${1:-https://scout-dashboard-xi.vercel.app}"

echo "============================================"
echo "Scout Dashboard Production Verification"
echo "Base URL: $BASE_URL"
echo "Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "============================================"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

check_endpoint() {
    local path=$1
    local expected_status=${2:-200}
    local description=$3

    printf "Checking %-30s " "$path..."

    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}" --max-time 10 2>/dev/null || echo "000")

    if [ "$HTTP_STATUS" = "$expected_status" ]; then
        echo "✅ PASS (HTTP $HTTP_STATUS)"
        ((PASSED++))
    elif [ "$HTTP_STATUS" = "000" ]; then
        echo "❌ FAIL (Connection timeout)"
        ((FAILED++))
    else
        echo "❌ FAIL (Expected $expected_status, got $HTTP_STATUS)"
        ((FAILED++))
    fi
}

check_content() {
    local path=$1
    local search_text=$2
    local description=$3

    printf "Content check %-25s " "$path..."

    CONTENT=$(curl -s "${BASE_URL}${path}" --max-time 10 2>/dev/null || echo "")

    if echo "$CONTENT" | grep -q "$search_text"; then
        echo "✅ PASS (contains '$search_text')"
        ((PASSED++))
    else
        echo "⚠️  WARN (missing '$search_text')"
        ((WARNINGS++))
    fi
}

echo "=== Page Health Checks ==="
check_endpoint "/" 200 "Home page"
check_endpoint "/trends" 200 "Trends page"
check_endpoint "/product-mix" 200 "Product Mix page"
check_endpoint "/geography" 200 "Geography page"
check_endpoint "/nlq" 200 "NLQ page"
check_endpoint "/data-health" 200 "Data Health page"
echo ""

echo "=== API Health Checks ==="
check_endpoint "/api/health" 200 "Health API"
check_endpoint "/api/kpis" 200 "KPIs API"
check_endpoint "/api/dq/summary" 200 "DQ Summary API"
check_endpoint "/api/metrics" 200 "Metrics API"
echo ""

echo "=== API Response Checks ==="
printf "Checking health API response..."
HEALTH_RESPONSE=$(curl -s "${BASE_URL}/api/health" --max-time 10 2>/dev/null || echo "{}")
if echo "$HEALTH_RESPONSE" | grep -q "status"; then
    echo " ✅ PASS (valid JSON)"
    ((PASSED++))
else
    echo " ⚠️  WARN (unexpected format)"
    ((WARNINGS++))
fi

printf "Checking KPIs API response..."
KPI_RESPONSE=$(curl -s "${BASE_URL}/api/kpis" --max-time 10 2>/dev/null || echo "{}")
if echo "$KPI_RESPONSE" | grep -q "data\|transactions\|revenue"; then
    echo " ✅ PASS (valid data)"
    ((PASSED++))
else
    echo " ⚠️  WARN (no data returned)"
    ((WARNINGS++))
fi
echo ""

echo "=== Content Checks ==="
check_content "/" "Scout" "Brand presence"
check_content "/trends" "Trend" "Page title"
check_content "/geography" "map\|geo" "Map component"
echo ""

echo "============================================"
echo "VERIFICATION SUMMARY"
echo "============================================"
echo "Passed:   $PASSED"
echo "Failed:   $FAILED"
echo "Warnings: $WARNINGS"
echo ""

if [ $FAILED -eq 0 ]; then
    echo "✅ PRODUCTION VERIFICATION PASSED"
    exit 0
else
    echo "❌ PRODUCTION VERIFICATION FAILED"
    echo "Please investigate failed checks before proceeding."
    exit 1
fi
