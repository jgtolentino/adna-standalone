#!/bin/bash
# prune-workflows.sh
# Removes obsolete CI workflows that have been consolidated into ci-main.yml
# Run this after merging the CI consolidation PR

set -e

echo "Pruning obsolete GitHub Actions workflows..."
echo "These workflows are now consolidated into ci-main.yml"
echo ""

OBSOLETE_WORKFLOWS=(
  ".github/workflows/backend-verification.yml"
  ".github/workflows/prod-guard.yml"
  ".github/workflows/dashboard-compatibility-ci.yml"
  ".github/workflows/pulser-ci.yml"
  ".github/workflows/palette-forge-ci.yml"
  ".github/workflows/validate-docs.yml"
  ".github/workflows/env-sync-update.yml"
)

for workflow in "${OBSOLETE_WORKFLOWS[@]}"; do
  if [ -f "$workflow" ]; then
    echo "Removing: $workflow"
    git rm "$workflow" 2>/dev/null || rm "$workflow"
  else
    echo "Already removed: $workflow"
  fi
done

echo ""
echo "Done! The following workflow remains active:"
echo "  - .github/workflows/ci-main.yml (Unified CI)"
echo "  - .github/workflows/deploy-agents.yml (CD - if needed)"
echo ""
echo "Run 'git status' to review changes before committing."
