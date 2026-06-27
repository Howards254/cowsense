# CowSense AI — Architecture & End-to-End Flow

## Overview

CowSense AI is an **Extension Intelligence Layer** for Kenyan dairy extension agents. It transforms fragmented farmer data into actionable intelligence using a Neo4j graph database, AI-based prioritization, and LLM-enhanced recommendations.

```
┌──────────────┐     ┌──────────────┐     ┌───────────────┐
│  Extension    │────▶│  CowSense AI │────▶│   Neo4j Graph  │
│  Agent (Web)  │◀────│   (FastAPI)  │◀────│   Database     │
└──────────────┘     └──────────────┘     └───────────────┘
                           │
                    ┌──────┴──────┐
                    │  Featherless │
                    │  LLM API     │
                    └─────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TanStack Start (SSR), TanStack Query (server state), TanStack Router (file-based routing) |
| **Styling** | Tailwind CSS v4, shadcn/ui (46 Radix-based components), Recharts (charts), Lucide React (icons) |
| **Backend** | Python 3.12, FastAPI (ASGI), Uvicorn (server) |
| **Database** | Neo4j 5 (graph database, APOC plugin) |
| **LLM** | Featherless.ai API (`moonshotai/Kimi-K2-Instruct`) for natural-language enhancement |
| **Auth** | JWT (HS256 via python-jose), bcrypt (passlib) |
| **Weather** | Open-Meteo API (free, no API key needed) with deterministic mock fallback |
| **Infrastructure** | Docker, Docker Compose |

## Project Structure

```
cowsense/
├── backend/                         # Python FastAPI backend
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry, route mounting, inline agent & intelligence endpoints
│   │   ├── api/                     # REST routers
│   │   │   ├── auth.py              # POST /login, POST /signup, GET /me
│   │   │   ├── farmers.py           # GET /farmers, GET /farmers/{id}
│   │   │   ├── dashboard.py         # GET /dashboard/stats, /priority-distribution, etc.
│   │   │   ├── recommendations.py   # GET /recommendations, GET /recommendations/{id}
│   │   │   ├── followups.py         # GET /followups, PATCH /followups/{id}, POST /followups
│   │   │   ├── visits.py            # GET /visits, POST /visits
│   │   │   ├── analytics.py         # GET /analytics/* (5 endpoints)
│   │   │   └── deps.py              # require_agent dependency (auth guard)
│   │   ├── agents/                  # AI agent logic
│   │   │   ├── prioritization_agent.py   # Farmer scoring & LLM reasoning
│   │   │   ├── recommendation_agent.py   # Issue→recommendation matching with LLM
│   │   │   └── followup_agent.py         # Follow-up scheduling with LLM
│   │   ├── services/                # Business logic
│   │   │   ├── neo4j_service.py     # Query runner, caching, singleton driver
│   │   │   ├── auth_service.py      # Password hashing, JWT creation/verification
│   │   │   ├── prioritization_service.py  # Scoring algorithm (0-100)
│   │   │   ├── recommendation_service.py  # Issue-to-recommendation matching
│   │   │   ├── input_demand_service.py    # Input aggregation & trend analysis
│   │   │   ├── weather_service.py         # Open-Meteo + mock fallback
│   │   │   └── llm_client.py             # Featherless.ai API client
│   │   ├── schemas/                 # Pydantic request/response models
│   │   ├── config/                  # Environment variable loader
│   │   └── cypher/                  # Neo4j queries
│   │       ├── queries.cypher       # 16 named Cypher queries
│   │       └── seed.cypher          # Full demo database seed script
│   ├── .env.example                 # Environment variable template
│   ├── Dockerfile
│   └── requirements.txt
├── src/                             # React/TanStack Start frontend
│   ├── routes/                      # 12 file-based routes
│   │   ├── __root.tsx               # App shell, auth guard, sidebar, header
│   │   ├── index.tsx                # Dashboard (/, 6 stat cards, 4 charts, 3 lists, weather)
│   │   ├── login.tsx                # Login page
│   │   ├── signup.tsx               # Registration page
│   │   ├── farmers.index.tsx        # Farmers list with search & filters
│   │   ├── farmers.$id.tsx          # Farmer detail (6 tabs)
│   │   ├── intelligence.tsx         # Browseable AI intelligence per farmer
│   │   ├── recommendations.tsx      # Recommendations card grid + schedule follow-up
│   │   ├── inputs.tsx               # Input demand by county, top inputs with trends
│   │   ├── follow-ups.tsx           # Follow-up list/timeline + complete action
│   │   ├── visits.tsx               # Visits list + create visit dialog
│   │   ├── analytics.tsx            # 5 analytics charts
│   │   └── settings.tsx             # Profile/org/API settings
│   ├── services/                    # API clients
│   │   ├── api.ts                   # Generic fetcher with auth token injection
│   │   ├── authService.ts           # Login, signup, getMe
│   │   ├── dashboardService.ts      # Dashboard stats & charts
│   │   ├── farmerService.ts         # Farmers list & detail
│   │   ├── followupService.ts       # List, complete, create follow-ups
│   │   ├── recommendationService.ts # List, getById
│   │   ├── visitService.ts          # List, create visits
│   │   ├── intelligenceService.ts   # Urgent, prioritization, input demand, weather, climate
│   │   └── analyticsService.ts      # Analytics charts
│   ├── types/index.ts               # All TypeScript interfaces
│   ├── lib/auth.tsx                 # Auth context/provider with localStorage persistence
│   └── components/                  # Shared UI components
│       ├── cards/                   # StatsCard, ChartCard
│       ├── layout/                  # Sidebar, Header, PageContainer, MobileNav
│       ├── ui/                      # 46 shadcn/ui components
│       ├── EmptyState.tsx
│       └── PriorityBadge.tsx
├── scripts/                         # setup.sh, seed.sh
└── docker-compose.yml               # Neo4j + Backend
```

## Database Schema (Neo4j Graph)

### Nodes (15 labels)

| Node | Key Properties | Purpose |
|---|---|---|
| `Farmer` | `farmerId`, `fullName`, `phone`, `county`, `avgMilkLitres`, `priorityScore` | Core entity — smallholder dairy farmer |
| `ExtensionAgent` | `agentId`, `fullName`, `email`, `passwordHash` | User — extension agent |
| `County` | `countyId`, `name` | Geographic region (Nakuru, Kiambu, etc.) |
| `Herd` | `herdId`, `totalCows`, `lactating`, `dry`, `calves` | Cattle herd |
| `Cow` | `cowId`, `tag`, `breed`, `lactating`, `dailyMilkLitres` | Individual animal |
| `Issue` | `issueId`, `name`, `description`, `category` | Farm condition (e.g., "Low Feed Reserves") |
| `Disease` | `diseaseId`, `name` | Disease risk (e.g., "FMD", "East Coast Fever") |
| `Recommendation` | `recommendationId`, `title`, `reasoning`, `priority` | Advisory action |
| `Input` | `inputId`, `name`, `category`, `unit`, `estimatedCostKes` | Agricultural input (e.g., "Silage Bags") |
| `FollowUp` | `followUpId`, `purpose`, `dueDate`, `status` | Scheduled follow-up action |
| `Visit` | `visitId`, `scheduledFor`, `status`, `notes` | Field visit record |
| `ProductionMetric` | `metricId`, `milkLitresPerDay`, `dateRecorded` | Daily milk production |
| `ClimateEvent` | `climateId`, `type`, `severity`, `startDate` | Climate event affecting a county |
| `AdoptionRecord` | `adoptionId`, `adoptedAt`, `outcome`, `notes` | Records recommendation adoption |

### Relationships (19 types)

```
ExtensionAgent -[:MANAGES]-> Farmer
Farmer          -[:LOCATED_IN]-> County
Farmer          -[:OWNS]-> Herd
Herd            -[:CONTAINS]-> Cow
Farmer          -[:EXPERIENCING {severity, status}]-> Issue
Farmer          -[:AT_RISK_OF {level, score}]-> Disease
Farmer          -[:HAS_RECOMMENDATION]-> Recommendation
Issue           -[:SUGGESTS]-> Recommendation
Recommendation  -[:REQUIRES]-> Input
Farmer          -[:HAS_FOLLOWUP]-> FollowUp
Recommendation  -[:TRACKED_BY]-> FollowUp
Farmer          -[:HAS_VISIT]-> Visit
Visit           -[:OBSERVED]-> Issue
Visit           -[:ISSUED]-> Recommendation
Farmer          -[:HAS_PRODUCTION]-> ProductionMetric
County          -[:AFFECTED_BY]-> ClimateEvent
Farmer          -[:ADOPTED]-> AdoptionRecord
AdoptionRecord  -[:OF]-> Recommendation
```

## End-to-End Data Flows

### 1. Authentication Flow

```
Agent opens app → unauthenticated → redirect to /login
  → POST /api/auth/login {email, password}
  → Backend: query ExtensionAgent by email, verify bcrypt hash
  → Generate JWT (HS256, 7-day expiry) with agentId as `sub`
  → Return: {token, agentId, fullName, email, phone, organization, county}
  → Frontend: store token in localStorage as `cowsense_token`
  → AuthProvider sets user state → redirect to /
  → On app reload: read token from localStorage → call GET /api/auth/me → validate & restore session
  → All API calls via apiFetch() attach `Authorization: Bearer <token>`
  → Backend validates via Depends(require_agent) on all data routes
```

### 2. Dashboard Flow

```
Agent lands on /dashboard (/)
  → TanStack Query fires 8 parallel requests:
    GET /api/dashboard/stats
    GET /api/dashboard/priority-distribution
    GET /api/dashboard/farmer-trend
    GET /api/dashboard/input-demand-trend
    GET /api/dashboard/county-demand
    GET /api/followups
    GET /api/recommendations
    GET /api/farmers
  → Renders:
    1. 6 StatsCards (high-priority farmers, pending follow-ups, recs issued, input alerts, farmers reached, avg milk)
    2. Priority distribution PieChart
    3. Farmer activity trend AreaChart (real production metric data, not random)
    4. County distribution BarChart (real input demand, not farmers*5)
    5. Input demand trends AreaChart (silage, dairy meal, vaccines from REQUIRES relationships)
    6. Today's follow-ups list (first 4 non-completed)
    7. Recent recommendations list (first 3)
    8. Urgent farmer alerts list (critical/high priority)
    9. Weather by county cards (6 counties, temperature, condition, climate risk)
```

### 3. Farmer Prioritization Flow (AI Engine)

```
Trigger: GET /api/agent/prioritization (all farmers) or /api/agent/prioritization/{id} (single)

Step 1 — Data collection via Cypher query `prioritization.allFarmers`:
  → For each farmer, return: issues (with severity/status), follow-ups (with due dates),
    diseases (with risk scores), production metrics (for trend), climate events, last visit date

Step 2 — Scoring algorithm (prioritization_service.py):
  Issue severity:   critical=30,  high=20,  medium=10,  low=5
  Multi-issue bonus:  2+ active issues → +10
  Production decline:  >20% drop → +20,  >10% drop → +10
  Disease risk:        score ≥80 → +20,  score ≥60 → +10
  Overdue follow-up:   +15
  Scheduled follow-up: +5
  Active climate event: +10
  Days since last visit: >21 → +10,  >14 → +5
  Score capped at 100

Step 3 — Classification:
  ≥80 → "critical"
  ≥60 → "high"
  ≥30 → "medium"
  <30  → "low"

Step 4 — LLM Enhancement (async, optional):
  Build context dict: farmer profile, issues, production trend, disease risks,
    follow-up status, climate events, visit recency
  → POST Featherless.ai API chat completion
  → Prompt: "You are a dairy extension AI. Assess this farmer's priority..."
  → Returns: natural-language reasoning, confidence score, factor list
  → Falls back to template-based reasoning if LLM unavailable or timeout

Step 5 — Response:
  {farmerId, farmerName, priority, priorityScore, reasoning, factors[]}
```

### 4. Recommendation Generation Flow

```
Trigger: GET /api/agent/recommendations/{farmerId}

Step 1 — Cypher query `recommendations.forFarmer`:
  MATCH farmer → EXPERIENCING → Issue → SUGGESTS → Recommendation → REQUIRES → Input
  Returns: {recommendation, matchedIssues[], requiredInputs[]}

Step 2 — Personalization:
  Prepend context to reasoning: "Farmer X is experiencing: [issue1], [issue2]"

Step 3 — LLM Enhancement (optional):
  Send current recommendations to LLM for farmer-friendly summary
  Prompt: "Rewrite these into an actionable SMS for the farmer..."

Step 4 — Response:
  [{recommendation: {id, title, reasoning, priority, ...},
    matchedIssues: [{id, name, severity, category}],
    requiredInputs: [{id, name, category, cost}]}]
```

### 5. Follow-Up Scheduling Flow

```
Trigger: GET /api/agent/followups/{farmerId}

Step 1 — For each recommendation:
  Look up follow-up window from predefined dictionary:
    "FMD Vaccination Drive" → 21 days
    "Schedule Veterinary Visit" → 7 days
    "Introduce Silage Conservation" → 14 days
    Default → 14 days

Step 2 — Generate FollowUp node:
  purpose ← from title-to-purpose mapping (or recommendation title)
  dueDate ← today + window days
  status ← "scheduled"

Step 3 — LLM Enhancement (optional):
  Suggests priority reordering and timing adjustments

Step 4 — Response: [{followUpId, farmerId, purpose, dueDate, status}]
```

### 6. Input Demand Intelligence Flow

```
Trigger: GET /api/agent/input-demand

Step 1 — Cypher query `intelligence.inputDemandByCounty`:
  MATCH Farmer→HAS_RECOMMENDATION→Recommendation→REQUIRES→Input
  GROUP BY county, inputId
  Returns: [{county, inputId, inputName, demandCount}]

Step 2 — Aggregation:
  byCounty: per-county per-input demand
  totalDemand: aggregate across all counties with trend
    (≥4 → "up", ≤1 → "down", else "stable")
  countySummary: [{county, demand, farmers}] rollup

Step 3 — High-demand filter (GET /agent/input-demand/high-demand):
  Returns inputs where totalDemand ≥ threshold (default 3)

Step 4 — Response:
  {byCounty: [{county, inputId, inputName, demandCount}],
   totalDemand: [{inputId, inputName, category, totalDemand, trend}],
   countySummary: [{county, demand, farmers}]}
```

### 7. Weather & Climate Risk Flow

```
Trigger: GET /api/agent/weather or /api/agent/weather/{county}

Step 1 — Primary: Open-Meteo API (free, no API key)
  GET https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}
    &current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m
    &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code
    &forecast_days=7
  → Hardcoded coordinates for 12 Kenyan counties

Step 2 — Fallback: deterministic mock
  Seeded by county name (zlib.adler32 for stability across restarts)
  Generates: temperature (15-32°C), humidity (40-90%), precipitation, wind, 7-day forecast

Step 3 — Climate Risk:
  Predefined risk flags for 7 counties (e.g., Nakuru → heatwave, Kiambu → flood)
  Others → all false ("none")
  Severity: ≥2 active risks → "high", 1 → "medium", 0 → "low"

Step 4 — Response:
  {county, latitude, longitude, temperature, humidity, precipitationMm,
   condition, windSpeedKmph, climateRisk, forecast: [{date, tempMax, tempMin, ...}], source}
```

### 8. Frontend Route Map

| Route | Page | What It Shows |
|---|---|---|
| `/` | Dashboard | Stats, charts, weather, urgent items, recent activity |
| `/login` | Login | Email/password form with demo credentials pre-filled |
| `/signup` | Signup | Registration form (name, email, phone, org, county, password) |
| `/farmers/` | Farmers List | Searchable table with county & priority filters |
| `/farmers/$id` | Farmer Profile | 6 tabs: Overview, Herd, Issues, Recommendations, Follow Ups, History |
| `/intelligence` | Farmer Intelligence | Farmer selector dropdown + AI reasoning card + conditions + metrics + actions |
| `/recommendations` | Recommendations | Card grid + schedule follow-up dialog |
| `/inputs` | Input Intelligence | Top inputs by demand (with trends), county bar chart, county breakdown list |
| `/follow-ups` | Follow Ups | List/timeline toggle, stats (upcoming/overdue/completed), complete button |
| `/visits` | Visits | Scheduled/recent sections, create visit dialog |
| `/analytics` | Analytics | 5 charts (farmer trend, input demand, adoption, county, priority) |
| `/settings` | Settings | Profile, organization, API key configuration |

### 9. API Endpoint Inventory

**Public (no auth required):**
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Health check |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/signup` | Register new agent |

**Authenticated (JWT Bearer token):**
| Method | Path | Description |
|---|---|---|
| GET | `/api/auth/me` | Current user profile |
| GET | `/api/farmers` | List all farmers with summary |
| GET | `/api/farmers/{id}` | Full farmer detail |
| GET | `/api/dashboard` | Full dashboard (aggregates 5 sub-queries) |
| GET | `/api/dashboard/stats` | Aggregated stats (6 metrics) |
| GET | `/api/dashboard/priority-distribution` | Farmers per priority bucket |
| GET | `/api/dashboard/farmer-trend` | Weekly activity trend (real data) |
| GET | `/api/dashboard/input-demand-trend` | Input demand by category |
| GET | `/api/dashboard/county-demand` | Farmer count & demand per county |
| GET | `/api/recommendations` | All recommendations |
| GET | `/api/recommendations/{id}` | Single recommendation + follow-ups |
| GET | `/api/followups` | All follow-ups |
| PATCH | `/api/followups/{id}` | Mark follow-up as completed |
| POST | `/api/followups` | Create new follow-up |
| GET | `/api/visits` | All visits |
| POST | `/api/visits` | Create new visit |
| GET | `/api/analytics/*` | 5 analytics endpoints |
| GET | `/api/intelligence/urgent` | Most urgent farmer intelligence |
| GET | `/api/agent` | Current extension agent info |
| GET | `/api/agent/prioritization` | All farmers with priority scores |
| GET | `/api/agent/prioritization/{id}` | Single farmer + LLM reasoning |
| GET | `/api/agent/recommendations` | All farmers' recommendations |
| GET | `/api/agent/recommendations/{id}` | Recommendations for one farmer |
| GET | `/api/agent/followups` | All pending follow-ups |
| GET | `/api/agent/followups/{id}` | Generated follow-ups for one farmer |
| GET | `/api/agent/input-demand` | Full input demand (by county, total, summary) |
| GET | `/api/agent/input-demand/high-demand` | High-demand inputs (≥3) |
| GET | `/api/agent/input-demand/county/{county}` | Input demand filtered by county |
| GET | `/api/agent/weather` | Weather for all counties |
| GET | `/api/agent/weather/{county}` | Weather for specific county |
| GET | `/api/agent/climate-risks` | Climate risks for all counties |
| GET | `/api/agent/climate-risks/{county}` | Climate risk for specific county |

## Security Model

- **Authentication**: JWT (HS256) with 7-day expiry
- **Password storage**: bcrypt via passlib (hash + salt)
- **Authorization**: `Depends(require_agent)` on every data route — extracts Bearer token, decodes JWT, looks up agent in Neo4j, returns 401 if invalid
- **Token storage**: localStorage on frontend, injected via `Authorization` header
- **CORS**: Wide open (`allow_origins=["*"]`) — restrict to specific origins in production
- **Secrets**: `.env` file is gitignored; `.env.example` committed with placeholders only

## State Management

- **Server state**: TanStack Query — auto-caching, background refetch, stale-while-revalidate
  - Query key pattern: `["domain", "subresource"]` (e.g., `["dashboard", "stats"]`)
  - Mutations invalidate related queries on success
- **Auth state**: React Context (`AuthProvider`) — user, token, loading, login, signup, logout
  - Persisted to `localStorage` as `cowsense_token`
  - On startup: validates token via GET /api/auth/me

## Scoring Algorithm Detail

The prioritization engine scores each farmer from 0-100 using weighted signals:

| Signal | Condition | Points |
|---|---|---|
| Issue severity | Per active issue: critical=30, high=20, medium=10, low=5 |
| Multiple issues | ≥2 active issues | +10 |
| Production decline | >20% drop over measurement period | +20 |
| Production decline | >10% drop | +10 |
| Disease risk score | ≥80 | +20 |
| Disease risk score | ≥60 | +10 |
| Overdue follow-up | Any | +15 |
| Scheduled follow-up | Any | +5 |
| Active climate event | County has active drought/flood/heatwave | +10 |
| Days since last visit | >21 days | +10 |
| Days since last visit | >14 days | +5 |

## Running the Project

```bash
# Docker (recommended)
./scripts/setup.sh

# Manual development
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend (separate terminal)
npm run dev
```

Frontend: `http://localhost:5173`
Backend API: `http://localhost:8000`
API docs: `http://localhost:8000/docs`
Neo4j Browser: `http://localhost:7474`

## Deferred Features (not implemented)

- Full veterinary diagnosis engine
- Credit scoring engine
- Route optimization for extension agents
- Full market intelligence engine
- Production DigiCow integrations (API is ready, integration not built)
- Graph visualization (Neo4j Browser is available but no UI component)
