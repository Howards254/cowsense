#!/usr/bin/env bash
set -euo pipefail

# CowSense AI — Seed Neo4j Database
# Usage: ./scripts/seed.sh
#
# Prerequisites: Docker Compose services must be running.
#   docker compose up -d

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SEED_FILE="$PROJECT_DIR/backend/app/cypher/seed.cypher"
CONTAINER="cowsense-neo4j"

echo "==> Seeding Neo4j database..."

if docker exec "$CONTAINER" cypher-shell -u neo4j -p changeme -f /import/seed.cypher; then
  echo "==> Seed complete."
else
  echo "==> Seed failed. Is the container running?" >&2
  exit 1
fi
