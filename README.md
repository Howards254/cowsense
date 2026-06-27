# CowSense AI

**AI-powered extension intelligence for Kenyan dairy farmers.**

CowSense AI helps extension agents manage smallholder dairy farmers through AI-driven prioritization, recommendation generation, input demand tracking, and field visit planning — all powered by a Neo4j graph database and LLM-enhanced reasoning.

---

## Features

- **Farmer Management** — Browse, search, and filter farmers by county, priority, or status. View detailed profiles with herd composition, issues, disease risks, production history, and linked recommendations.
- **AI Prioritization** — Each farmer is scored 0–100 using real signals: issue severity, production decline, disease risk, follow-up status, and visit recency. LLM-enhanced reasoning explains *why* a farmer needs attention.
- **Intelligence Dashboard** — 8 parallel data queries feed stat cards, priority distribution, farmer activity trends, county demand breakdowns, input demand trends, weather by county, and urgent alerts.
- **Recommendation Engine** — Matches farmer issues to recommendations via graph relationships (EXPERIENCING → SUGGESTS → REQUIRES). Schedule follow-ups directly from the recommendation cards.
- **Input Demand Intelligence** — Aggregates input demand across counties by traversing HAS_RECOMMENDATION → REQUIRES relationships. Tracks trends (up/down/stable) and highlights high-demand inputs.
- **Field Visit Planning** — Log and complete field visits. Track scheduled vs. completed visits with farmer-linked notes.
- **Follow-Up Tracking** — List or timeline view. Mark follow-ups as completed. Stats cards show upcoming, overdue, and completed counts.
- **Weather & Climate** — Real-time weather from Open-Meteo API for 12 Kenyan counties. Climate risk flags (drought, flood, heatwave) with severity classification.
- **Analytics** — 5 charts covering farmer trends, input demand, adoption rates, county distribution, and priority breakdown.
- **Mobile-Ready** — Responsive sidebar with scrollable mobile nav, all 9 pages accessible on small screens.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TanStack Start, TanStack Query, TanStack Router |
| **Styling** | Tailwind CSS v4, shadcn/ui (46 components), Recharts, Lucide |
| **Backend** | Python 3.12, FastAPI, Uvicorn |
| **Database** | Neo4j 5 (AuraDB or local) with APOC plugin |
| **LLM** | Featherless.ai API (`moonshotai/Kimi-K2-Instruct`) |
| **Auth** | JWT (HS256, python-jose), bcrypt (passlib) |
| **Weather** | Open-Meteo API (free, no key needed) |
| **Infrastructure** | Docker, Docker Compose |

---

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.12+
- Neo4j 5 (local Docker or [AuraDB](https://console.neo4j.io) — a remote instance is pre-configured)

### 1. Clone & install

```bash
git clone <repo-url> cowsense
cd cowsense

# Frontend
npm install

# Backend
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your Neo4j credentials:

```env
NEO4J_URI=bolt://localhost:7687        # or neo4j+s://<instance>.databases.neo4j.io:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password
JWT_SECRET=your-secret-key
FEATHERLESS_API_KEY=your-key            # optional — falls back to template reasoning
```

A working AuraDB instance is already configured in `.env`. For local development, run Neo4j via Docker:

```bash
docker compose up -d neo4j
```

### 3. Seed the database

```bash
cd backend
source .venv/bin/activate
python -c "
from app.services.neo4j_service import run_query
with open('app/cypher/seed.cypher') as f:
    for stmt in f.read().split(';'):
        stmt = stmt.strip()
        if stmt:
            run_query(stmt)
"
```

This creates:
- 4 extension agents (including the demo agent)
- 6 farmers across 6 counties
- 4 recommendations linked to farmer issues
- 6 follow-ups, 4 visits, 6 inputs, 10 issues, 17 cows
- Climate events, production metrics, and adoption records

### 4. Start the backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs at `http://localhost:8000/docs`

### 5. Start the frontend

```bash
# In a separate terminal
npm run dev
```

Open `http://localhost:5173`

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `brian.otieno@digicow.co.ke` |
| Password | `cowsense123` |

---

## Project Structure

```
cowsense/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry, route mounting
│   │   ├── api/                 # REST routers (auth, farmers, dashboard, etc.)
│   │   ├── agents/              # AI agent logic (prioritization, recommendations, follow-ups)
│   │   ├── services/            # Business logic (Neo4j, auth, LLM, weather, scoring)
│   │   ├── schemas/             # Pydantic models
│   │   ├── config/              # Environment loader
│   │   └── cypher/              # Cypher queries + seed data
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── src/
│   ├── routes/                  # 12 file-based TanStack routes
│   ├── services/                # API client services
│   ├── components/              # Shared UI (layout, cards, shadcn/ui)
│   ├── types/                   # TypeScript interfaces
│   └── lib/                     # Auth context, utilities
├── docker-compose.yml
└── package.json
```

---

## API Overview

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/signup` | Register |

### Authenticated (JWT required)

| Method | Path | Description |
|---|---|---|
| GET | `/api/farmers` | List farmers |
| GET | `/api/farmers/{id}` | Farmer detail |
| GET | `/api/dashboard` | Full dashboard (5 sub-queries) |
| GET | `/api/recommendations` | All recommendations |
| GET | `/api/recommendations/{id}` | Recommendation detail |
| GET | `/api/followups` | All follow-ups |
| POST | `/api/followups` | Create follow-up |
| PATCH | `/api/followups/{id}` | Complete follow-up |
| GET | `/api/visits` | All visits |
| POST | `/api/visits` | Create visit |
| PATCH | `/api/visits/{id}` | Complete visit |
| GET | `/api/agent/prioritization` | AI prioritization (all farmers) |
| GET | `/api/agent/recommendations/{id}` | AI recommendations (per farmer) |
| GET | `/api/agent/input-demand` | Input demand intelligence |
| GET | `/api/agent/weather` | Weather for all counties |
| GET | `/api/agent/climate-risks` | Climate risk flags |

Full endpoint inventory is in `ARCHITECTURE.md`.

---

## Key Design Decisions

- **Graph database** — Farmer data is inherently relational (issues → recommendations → inputs → follow-ups). Neo4j makes traversing these connections a single query rather than multiple JOINs.
- **AI as enhancement, not core** — The prioritization algorithm produces scores deterministically. The LLM (Featherless.ai) is only called for natural-language reasoning and is optional — falls back gracefully.
- **Seed data** — The Cypher seed file creates a realistic demo dataset. All production/lactation data is real (not random). Weather mock uses `zlib.adler32` for stable values across restarts.
- **Auth on all data routes** — Every data endpoint requires a valid JWT. The frontend stores the token in `localStorage` and injects it via `Authorization` header.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEO4J_URI` | Yes | `bolt://localhost:7687` | Neo4j connection string |
| `NEO4J_USER` | Yes | `neo4j` | Neo4j username |
| `NEO4J_PASSWORD` | Yes | `changeme` | Neo4j password |
| `JWT_SECRET` | Yes | — | Secret for signing JWTs |
| `FEATHERLESS_API_KEY` | No | — | LLM API key (falls back to templates) |

---

## Development

```bash
# Lint
npm run lint

# Backend (with auto-reload)
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000
```

---

## License

MIT — see LICENSE for details.
