#!/bin/bash
#
# Go-Live Checklist Runner
# Validates all deployment readiness criteria before production launch
#
# Usage:
#   ./go-live-checklist.sh
#   ./go-live-checklist.sh --skip-frontend
#   DASHBOARD_URL=https://prod.example.com ./go-live-checklist.sh
#

set -euo pipefail

# =============================================================================
# Configuration
# =============================================================================

DASHBOARD_URL="${DASHBOARD_URL:-http://localhost:3000}"
CES_API_URL="${CES_API_URL:-http://localhost:8001}"
DATABASE_URL="${DATABASE_URL:-}"
SKIP_FRONTEND="${1:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# =============================================================================
# Helper Functions
# =============================================================================

header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

check_pass() {
    echo -e "  ${GREEN}✓${NC} $1"
    ((PASSED++))
}

check_fail() {
    echo -e "  ${RED}✗${NC} $1"
    ((FAILED++))
}

check_skip() {
    echo -e "  ${YELLOW}○${NC} $1 (skipped)"
    ((SKIPPED++))
}

check_warn() {
    echo -e "  ${YELLOW}⚠${NC} $1"
}

# =============================================================================
# PHASE 1: Pre-Flight Checks
# =============================================================================

phase1_preflight() {
    header "PHASE 1: Pre-Flight Checks"

    # Check 1.1: Environment variables
    echo "  Checking environment variables..."
    if [[ -n "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL is set"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL is NOT set"
    fi

    if [[ -n "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set"
    fi

    if [[ -n "${CES_API_TOKEN:-}" ]]; then
        check_pass "CES_API_TOKEN is set"
    else
        check_fail "CES_API_TOKEN is NOT set"
    fi

    # Check 1.2: No mock data flags in production
    if [[ "${NEXT_PUBLIC_USE_MOCK:-0}" == "0" ]]; then
        check_pass "NEXT_PUBLIC_USE_MOCK is disabled"
    else
        check_fail "NEXT_PUBLIC_USE_MOCK should be '0' for production"
    fi

    # Check 1.3: Git status (should be clean)
    if git diff --quiet HEAD 2>/dev/null; then
        check_pass "Git working directory is clean"
    else
        check_warn "Git has uncommitted changes"
    fi

    # Check 1.4: No sensitive files committed
    if git ls-files --error-unmatch .env 2>/dev/null; then
        check_fail ".env file is tracked in git (SECURITY RISK!)"
    else
        check_pass "No .env file in git"
    fi
}

# =============================================================================
# PHASE 2: Technical Checks
# =============================================================================

phase2_technical() {
    header "PHASE 2: Technical Checks"

    # Check 2.1: Frontend build
    if [[ "$SKIP_FRONTEND" != "--skip-frontend" ]]; then
        echo "  Testing frontend build..."
        if npm run build --prefix apps/scout-dashboard 2>/dev/null; then
            check_pass "Frontend build succeeds"
        else
            check_fail "Frontend build failed"
        fi
    else
        check_skip "Frontend build check"
    fi

    # Check 2.2: TypeScript compilation
    echo "  Checking TypeScript..."
    if npx tsc --noEmit --project apps/scout-dashboard/tsconfig.json 2>/dev/null; then
        check_pass "TypeScript has no errors"
    else
        check_fail "TypeScript compilation failed"
    fi

    # Check 2.3: Python service health
    echo "  Checking Python services..."
    if curl -s "${CES_API_URL}/health" 2>/dev/null | grep -q "healthy"; then
        check_pass "CES Gateway is healthy"
    else
        check_fail "CES Gateway health check failed"
    fi

    # Check 2.4: Database connectivity
    if [[ -n "$DATABASE_URL" ]]; then
        echo "  Testing database connectivity..."
        if psql "$DATABASE_URL" -c "SELECT 1;" 2>/dev/null >/dev/null; then
            check_pass "Database is reachable"
        else
            check_fail "Database connection failed"
        fi
    else
        check_skip "Database connectivity (DATABASE_URL not set)"
    fi

    # Check 2.5: Security audit
    echo "  Running security audit..."
    if npm audit --audit-level=high --prefix apps/scout-dashboard 2>/dev/null; then
        check_pass "No high/critical npm vulnerabilities"
    else
        check_warn "npm audit found issues (review before deploy)"
    fi
}

# =============================================================================
# PHASE 3: Data Validation
# =============================================================================

phase3_data() {
    header "PHASE 3: Data Validation"

    # Check 3.1: No CSV fallbacks
    echo "  Checking for CSV fallbacks..."
    if ! grep -r "\.csv" apps/scout-dashboard/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "\.d\.ts" | grep -q "import"; then
        check_pass "No hardcoded CSV imports in source"
    else
        check_warn "Found CSV references in source files"
    fi

    # Check 3.2: Mock data disabled
    if [[ -f "apps/scout-dashboard/src/lib/env.ts" ]]; then
        check_pass "Environment validation module exists"
    else
        check_fail "Environment validation module missing"
    fi
}

# =============================================================================
# PHASE 4: Security Checks
# =============================================================================

phase4_security() {
    header "PHASE 4: Security Checks"

    # Check 4.1: RLS Migration exists
    if [[ -f "infrastructure/database/supabase/migrations/036_creative_ops_rls.sql" ]]; then
        check_pass "RLS migration file exists"
    else
        check_fail "RLS migration file missing"
    fi

    # Check 4.2: No hardcoded secrets in code
    echo "  Scanning for hardcoded secrets..."
    if ! grep -r "sk-\|service_role\|secret_" apps/scout-dashboard/src --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "\.d\.ts" | grep -qv "process\.env"; then
        check_pass "No hardcoded secrets detected"
    else
        check_fail "Potential hardcoded secrets found!"
    fi

    # Check 4.3: CORS configuration
    if grep -q "CORS_ALLOWED_ORIGINS" infrastructure/mcp-services/ces-gateway/app.py 2>/dev/null; then
        check_pass "CORS is configurable via environment"
    else
        check_fail "CORS not properly configurable"
    fi

    # Check 4.4: API Token required
    if grep -q "CES_API_TOKEN: str" infrastructure/mcp-services/ces-gateway/app.py 2>/dev/null; then
        check_pass "API Token is required (not optional)"
    else
        check_fail "API Token should be required"
    fi
}

# =============================================================================
# Summary
# =============================================================================

print_summary() {
    header "GO-LIVE CHECKLIST SUMMARY"

    echo ""
    echo -e "  ${GREEN}Passed:${NC}  $PASSED"
    echo -e "  ${RED}Failed:${NC}  $FAILED"
    echo -e "  ${YELLOW}Skipped:${NC} $SKIPPED"
    echo ""

    if [[ $FAILED -eq 0 ]]; then
        echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "  ${GREEN}  ✓ ALL CHECKS PASSED - READY FOR PRODUCTION  ${NC}"
        echo -e "  ${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        exit 0
    else
        echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "  ${RED}  ✗ FAILED CHECKS - DO NOT DEPLOY TO PRODUCTION${NC}"
        echo -e "  ${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "  Fix the failed checks before proceeding."
        exit 1
    fi
}

# =============================================================================
# Main
# =============================================================================

main() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║       TBWA Agency Databank - Go-Live Checklist           ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "  Dashboard URL: $DASHBOARD_URL"
    echo "  CES API URL:   $CES_API_URL"
    echo "  Timestamp:     $(date -Iseconds)"

    phase1_preflight
    phase2_technical
    phase3_data
    phase4_security
    print_summary
}

main "$@"
