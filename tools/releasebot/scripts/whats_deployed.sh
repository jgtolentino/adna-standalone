#!/usr/bin/env bash
#
# Thin wrapper for whats_deployed.py
#
# Usage:
#   ./whats_deployed.sh --repo-path ../odoo-ce --tag prod-20260109 --prev-tag prod-20260108
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Validate Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: python3 is required but not found" >&2
    exit 1
fi

# Run the Python script
exec python3 "${SCRIPT_DIR}/whats_deployed.py" "$@"
