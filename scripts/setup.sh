#!/usr/bin/env bash
set -euo pipefail

# CowSense AI — Full Setup
# Usage: ./scripts/setup.sh
#
# 1. Starts Neo4j and backend containers
# 2. Waits for Neo4j healthcheck
# 3. Seeds the database
# 4. Shows status

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo "==> Step 1: Starting Docker services..."
docker compose up -d

echo "==> Step 2: Waiting for Neo4j to be healthy..."
until docker exec cowsense-neo4j cypher-shell -u neo4j -p changeme "RETURN 1" &>/dev/null; do
  echo "    Waiting for Neo4j..."
  sleep 5
done
echo "    Neo4j is ready."

echo "==> Step 3: Seeding database..."
if docker exec cowsense-neo4j cypher-shell -u neo4j -p changeme -f /import/seed.cypher; then
  echo "    Seed complete."
else
  echo "    WARNING: Seed may have partially failed. Check container logs." >&2
fi

echo ""
echo "==> Setup complete!"
echo "    Neo4j Browser: http://localhost:7474"
echo "    Backend API:   http://localhost:8000"
echo "    Health check:  http://localhost:8000/health"
echo ""
echo "    Run 'docker compose logs -f' to follow logs."
