#!/bin/bash
#
# CES Integration Test Script
# Tests the Creative Excellence System (CES) Gateway and Palette Forge services
#
# Prerequisites:
#   - CES_API_URL environment variable set (or defaults to localhost:8001)
#   - PALETTE_SERVICE_URL environment variable set (or defaults to localhost:8000)
#   - CES_API_TOKEN environment variable set for authentication
#
# Usage:
#   ./test-ces-integration.sh
#   ./test-ces-integration.sh --verbose
#   CES_API_URL=https://prod.example.com ./test-ces-integration.sh
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

CES_API_URL="${CES_API_URL:-http://localhost:8001}"
PALETTE_SERVICE_URL="${PALETTE_SERVICE_URL:-http://localhost:8000}"
CES_API_TOKEN="${CES_API_TOKEN:-}"
VERBOSE="${1:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# =============================================================================
# Helper Functions
# =============================================================================

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_verbose() {
    if [[ "$VERBOSE" == "--verbose" ]]; then
        echo -e "[DEBUG] $1"
    fi
}

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((TESTS_PASSED++))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    ((TESTS_FAILED++))
}

# =============================================================================
# Tests
# =============================================================================

test_ces_gateway_health() {
    log_info "Testing CES Gateway health endpoint..."

    response=$(curl -s -w "\n%{http_code}" "${CES_API_URL}/health" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    log_verbose "Response: $body"
    log_verbose "HTTP Code: $http_code"

    if [[ "$http_code" == "200" ]]; then
        # Parse JSON to check status
        status=$(echo "$body" | python3 -c "import sys, json; print(json.load(sys.stdin).get('status', 'unknown'))" 2>/dev/null || echo "unknown")

        if [[ "$status" == "healthy" ]] || [[ "$status" == "degraded" ]]; then
            test_pass "CES Gateway health check passed (status: $status)"
            return 0
        else
            test_fail "CES Gateway health check returned unexpected status: $status"
            return 1
        fi
    else
        test_fail "CES Gateway health check failed (HTTP $http_code)"
        return 1
    fi
}

test_palette_service_health() {
    log_info "Testing Palette Service health endpoint..."

    response=$(curl -s -w "\n%{http_code}" "${PALETTE_SERVICE_URL}/health" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    log_verbose "Response: $body"
    log_verbose "HTTP Code: $http_code"

    if [[ "$http_code" == "200" ]]; then
        test_pass "Palette Service health check passed"
        return 0
    else
        test_fail "Palette Service health check failed (HTTP $http_code)"
        return 1
    fi
}

test_ces_auth_required() {
    log_info "Testing CES Gateway authentication requirement..."

    # Try to access protected endpoint without auth
    response=$(curl -s -w "\n%{http_code}" "${CES_API_URL}/ask" \
        -X POST \
        -H "Content-Type: application/json" \
        -d '{"prompt": "test"}' 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)

    log_verbose "HTTP Code (no auth): $http_code"

    if [[ "$http_code" == "401" ]] || [[ "$http_code" == "422" ]]; then
        test_pass "CES Gateway correctly rejects unauthenticated requests"
        return 0
    elif [[ "$http_code" == "000" ]]; then
        test_fail "CES Gateway not reachable"
        return 1
    else
        test_fail "CES Gateway should return 401 without auth, got $http_code"
        return 1
    fi
}

test_ces_auth_with_token() {
    log_info "Testing CES Gateway authentication with token..."

    if [[ -z "$CES_API_TOKEN" ]]; then
        log_warn "CES_API_TOKEN not set, skipping authenticated test"
        return 0
    fi

    response=$(curl -s -w "\n%{http_code}" "${CES_API_URL}/ask" \
        -X POST \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${CES_API_TOKEN}" \
        -d '{"prompt": "test palette query", "limit": 1}' 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    log_verbose "Response: $body"
    log_verbose "HTTP Code: $http_code"

    if [[ "$http_code" == "200" ]]; then
        test_pass "CES Gateway accepts authenticated requests"
        return 0
    elif [[ "$http_code" == "401" ]]; then
        test_fail "CES Gateway rejected valid token (check CES_API_TOKEN)"
        return 1
    else
        test_fail "CES Gateway returned unexpected code: $http_code"
        return 1
    fi
}

test_cors_configuration() {
    log_info "Testing CORS configuration..."

    # Test preflight request
    response=$(curl -s -w "\n%{http_code}" "${CES_API_URL}/health" \
        -X OPTIONS \
        -H "Origin: http://localhost:3000" \
        -H "Access-Control-Request-Method: POST" 2>/dev/null || echo "000")
    http_code=$(echo "$response" | tail -n1)

    log_verbose "HTTP Code: $http_code"

    if [[ "$http_code" == "200" ]] || [[ "$http_code" == "204" ]]; then
        test_pass "CORS preflight request accepted"
        return 0
    else
        test_fail "CORS preflight request failed (HTTP $http_code)"
        return 1
    fi
}

test_response_time() {
    log_info "Testing response time (< 500ms for health check)..."

    start_time=$(date +%s%N)
    curl -s "${CES_API_URL}/health" > /dev/null 2>&1 || true
    end_time=$(date +%s%N)

    duration_ms=$(( (end_time - start_time) / 1000000 ))

    log_verbose "Response time: ${duration_ms}ms"

    if [[ $duration_ms -lt 500 ]]; then
        test_pass "Response time acceptable: ${duration_ms}ms"
        return 0
    else
        test_fail "Response time too slow: ${duration_ms}ms (target < 500ms)"
        return 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo "=============================================="
    echo "  CES Integration Test Suite"
    echo "=============================================="
    echo ""
    echo "Configuration:"
    echo "  CES Gateway URL: $CES_API_URL"
    echo "  Palette Service URL: $PALETTE_SERVICE_URL"
    echo "  API Token: ${CES_API_TOKEN:+[SET]}${CES_API_TOKEN:-[NOT SET]}"
    echo ""
    echo "----------------------------------------------"
    echo ""

    # Run tests
    test_ces_gateway_health || true
    test_palette_service_health || true
    test_ces_auth_required || true
    test_ces_auth_with_token || true
    test_cors_configuration || true
    test_response_time || true

    # Summary
    echo ""
    echo "=============================================="
    echo "  Test Summary"
    echo "=============================================="
    echo ""
    echo -e "  Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "  Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""

    if [[ $TESTS_FAILED -eq 0 ]]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        exit 1
    fi
}

main "$@"
