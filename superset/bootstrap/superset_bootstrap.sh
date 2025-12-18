#!/usr/bin/env bash
set -euo pipefail

CMD="${1:-start}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

case "$CMD" in
  start)
    docker compose -f "$ROOT_DIR/superset/docker-compose.superset.yml" up -d
    ;;
  stop)
    docker compose -f "$ROOT_DIR/superset/docker-compose.superset.yml" down
    ;;
  logs)
    docker compose -f "$ROOT_DIR/superset/docker-compose.superset.yml" logs -f superset
    ;;
  *)
    echo "Usage: superset_bootstrap.sh [start|stop|logs]"
    exit 1
    ;;
esac
