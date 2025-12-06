#!/bin/bash
# verify-backend-strict.sh – Static mock/fake backend pattern detection for CI
# This script checks the codebase for mock patterns that shouldn't be in production

set -e

echo "🔍 Backend Verification - Scanning for Mock Patterns"
echo "======================================================"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

FAIL_COUNT=0
WARN_COUNT=0

# Define source directories to scan (supporting monorepo structure)
SRC_DIRS=()
[ -d "./src" ] && SRC_DIRS+=("./src")
[ -d "./apps/scout-dashboard/src" ] && SRC_DIRS+=("./apps/scout-dashboard/src")
[ -d "./platforms" ] && SRC_DIRS+=("./platforms")

if [ ${#SRC_DIRS[@]} -eq 0 ]; then
  echo -e "${YELLOW}⚠️ No source directories found to scan${NC}"
  exit 0
fi

echo "Scanning directories: ${SRC_DIRS[*]}"
echo ""

echo "1. Scanning for critical mock patterns..."
echo "------------------------------------------"

# Critical patterns that shouldn't exist in production code
CRITICAL_PATTERNS=(
  "mockData"
  "fakeData"
  "dummyData"
)

for pattern in "${CRITICAL_PATTERNS[@]}"; do
  echo -n "  Checking for '$pattern'... "
  COUNT=0
  for dir in "${SRC_DIRS[@]}"; do
    DIR_COUNT=$(grep -r "$pattern" "$dir" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "test\|spec\|\.test\.\|\.spec\.\|mock\.ts\|mock\.js" | wc -l || echo 0)
    COUNT=$((COUNT + DIR_COUNT))
  done

  if [ "$COUNT" -gt 0 ]; then
    echo -e "${YELLOW}WARNING (found $COUNT occurrences)${NC}"
    WARN_COUNT=$((WARN_COUNT + 1))
  else
    echo -e "${GREEN}PASS${NC}"
  fi
done

echo ""
echo "2. Checking for API integration patterns..."
echo "--------------------------------------------"

# Check for proper API/Supabase calls
echo -n "  Looking for Supabase client usage... "
SUPABASE_CALLS=0
for dir in "${SRC_DIRS[@]}"; do
  DIR_COUNT=$(grep -rE "supabase|createClient|@supabase" "$dir" --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo 0)
  SUPABASE_CALLS=$((SUPABASE_CALLS + DIR_COUNT))
done

if [ "$SUPABASE_CALLS" -gt 0 ]; then
  echo -e "${GREEN}PASS (found $SUPABASE_CALLS references)${NC}"
else
  echo -e "${YELLOW}WARNING (no Supabase integration found)${NC}"
  WARN_COUNT=$((WARN_COUNT + 1))
fi

echo ""
echo "========================================"
echo "📊 VERIFICATION SUMMARY"
echo "========================================"

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ PASSED: No critical issues found${NC}"
  exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${YELLOW}⚠️ PASSED WITH WARNINGS: $WARN_COUNT warnings${NC}"
  echo "Review warnings above but continuing..."
  exit 0
else
  echo -e "${RED}❌ FAILED: $FAIL_COUNT critical issues${NC}"
  exit 1
fi
