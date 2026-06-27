# CowSense AI — Backend

FastAPI + Neo4j AI-powered extension intelligence layer for smallholder dairy advisory.

## Tech Stack

- **Framework:** FastAPI
- **Database:** Neo4j 5 (graph database)
- **AI:** Neo4j graph traversal + rule-based agents (Featherless AI ready)

## Quick Start (Docker)

```bash
# Start everything and seed the database:
./scripts/setup.sh

# Or step by step:
docker compose up -d
./scripts/seed.sh
```

## Services

| Service  | URL                          |
|----------|------------------------------|
| Neo4j    | http://localhost:7474         |
| Backend  | http://localhost:8000         |
| Health   | http://localhost:8000/health  |

## Seeding

To re-seed (wipe existing data first):

```bash
# Connect to Neo4j and clear:
docker exec -it cowsense-neo4j cypher-shell -u neo4j -p changeme
# Then run: MATCH (n) DETACH DELETE n;
# Exit and re-seed:
./scripts/seed.sh
```

## Environment

Copy `.env.example` to `.env` and configure:

```
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=changeme
FEATHERLESS_API_KEY=
```

## Project Structure

```
backend/
├── app/
│   ├── main.py           # FastAPI entrypoint
│   ├── api/              # REST endpoints
│   ├── agents/           # AI agents (recommendation, prioritization, follow-up)
│   ├── services/         # Business logic + Neo4j queries
│   ├── models/           # Pydantic models
│   ├── schemas/          # API request/response schemas
│   ├── graph/            # Graph helpers
│   ├── config/           # Configuration
│   └── cypher/
│       ├── seed.cypher   # Database seed
│       └── queries.cypher # Query templates
├── Dockerfile
├── requirements.txt
└── README.md
```

## Graph Model

```
ExtensionAgent -[:MANAGES]-> Farmer
Farmer -[:LOCATED_IN]-> County
Farmer -[:OWNS]-> Herd -[:CONTAINS]-> Cow -[:PRODUCES]-> ProductionMetric
Farmer -[:EXPERIENCING {severity, status, detectedAt}]-> Issue -[:SUGGESTS]-> Recommendation -[:REQUIRES]-> Input
Farmer -[:AT_RISK_OF {level, score}]-> Disease
Farmer -[:HAS_RECOMMENDATION]-> Recommendation
Farmer -[:HAS_FOLLOWUP]-> FollowUp
Farmer -[:HAS_VISIT]-> Visit
Visit -[:OBSERVED]-> Issue
Visit -[:ISSUED]-> Recommendation
Recommendation -[:TRACKED_BY]-> FollowUp
County -[:AFFECTED_BY]-> ClimateEvent
Farmer -[:ADOPTED]-> AdoptionRecord -[:OF]-> Recommendation
```

## API Endpoints (planned)

| Method | Path                           | Description              |
|--------|--------------------------------|--------------------------|
| GET    | /health                        | Health check             |
| GET    | /api/farmers                   | List farmers             |
| GET    | /api/farmers/:id               | Farmer detail            |
| GET    | /api/dashboard/stats           | Dashboard stats          |
| GET    | /api/recommendations           | List recommendations     |
| GET    | /api/visits                    | List visits              |
| GET    | /api/followups                 | List follow-ups          |
| GET    | /api/analytics/*               | Analytics data           |
