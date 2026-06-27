from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    farmers,
    dashboard,
    recommendations,
    visits,
    followups,
    analytics,
    auth,
)
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import DashboardStatsSchema
from app.api.deps import require_agent

app = FastAPI(title="CowSense AI")


@app.on_event("startup")
def patch_demo_users():
    from app.services.neo4j_service import run_query
    from app.services.auth_service import hash_password
    demo_pw = hash_password("cowsense123")
    run_query("""
        MATCH (a:ExtensionAgent)
        WHERE a.passwordHash IS NULL
        SET a.passwordHash = $hash
        RETURN count(a) AS patched
    """, {"hash": demo_pw})


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(farmers.router)
app.include_router(dashboard.router)
app.include_router(recommendations.router)
app.include_router(visits.router)
app.include_router(followups.router)
app.include_router(analytics.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/dashboard")
def dashboard_full(_agent: dict = Depends(require_agent)):
    stats_query = load_query("dashboard.stats")
    priority_query = load_query("dashboard.priorityDistribution")
    farmer_trend_query = load_query("dashboard.farmerTrend")
    input_demand_query = load_query("dashboard.inputDemandTrend")
    county_demand_query = load_query("dashboard.countyDemand")

    stats_data = run_query_flattened(stats_query)
    stats = DashboardStatsSchema(**stats_data[0]).model_dump() if stats_data else {}
    priority = run_query_flattened(priority_query)
    farmer_trend = run_query_flattened(farmer_trend_query)
    input_demand = run_query_flattened(input_demand_query)
    county_demand = run_query_flattened(county_demand_query)

    return {
        "stats": stats,
        "priorityDistribution": priority,
        "farmerTrend": farmer_trend,
        "inputDemandTrend": input_demand,
        "countyDemand": county_demand,
    }


@app.get("/api/agent")
def get_agent(_agent: dict = Depends(require_agent)):
    query = load_query("analytics.extensionAgent")
    results = run_query_flattened(query)
    return results[0] if results else {}


@app.get("/api/intelligence/urgent")
def get_urgent_farmer_intelligence(_agent: dict = Depends(require_agent)):
    query = load_query("intelligence.farmerUrgent")
    results = run_query_flattened(query)
    return results[0] if results else {}


# =====================================================================
# AI Agent endpoints
# =====================================================================

from app.agents.prioritization_agent import get_priority_list, get_prioritization_reasoning
from app.agents.recommendation_agent import generate_recommendations, generate_all_recommendations
from app.agents.followup_agent import generate_followups, generate_all_pending_followups


@app.get("/api/agent/prioritization")
def agent_prioritization_list(_agent: dict = Depends(require_agent)):
    return get_priority_list()


@app.get("/api/agent/prioritization/{farmer_id}")
async def agent_prioritization_reasoning(farmer_id: str, _agent: dict = Depends(require_agent)):
    result = await get_prioritization_reasoning(farmer_id)
    if not result:
        raise HTTPException(404, "Farmer not found")
    return result


@app.get("/api/agent/recommendations/{farmer_id}")
def agent_farmer_recommendations(farmer_id: str, _agent: dict = Depends(require_agent)):
    result = generate_recommendations(farmer_id)
    if not result:
        raise HTTPException(404, "Farmer not found")
    return result


@app.get("/api/agent/recommendations")
def agent_all_recommendations(_agent: dict = Depends(require_agent)):
    return generate_all_recommendations()


@app.get("/api/agent/followups/{farmer_id}")
def agent_farmer_followups(farmer_id: str, _agent: dict = Depends(require_agent)):
    return generate_followups(farmer_id)


@app.get("/api/agent/followups")
def agent_all_followups(_agent: dict = Depends(require_agent)):
    return generate_all_pending_followups()


# =====================================================================
# Input Demand endpoints
# =====================================================================

from app.services.input_demand_service import (
    get_input_demand_by_county,
    get_total_input_demand,
    get_high_demand_inputs,
    get_county_input_summary,
    augment_inputs_with_trend,
)


@app.get("/api/agent/input-demand")
def agent_input_demand(_agent: dict = Depends(require_agent)):
    by_county = get_input_demand_by_county()
    total = augment_inputs_with_trend(get_total_input_demand())
    summary = get_county_input_summary()
    return {
        "byCounty": by_county,
        "totalDemand": total,
        "countySummary": summary,
    }


@app.get("/api/agent/input-demand/high-demand")
def agent_high_demand_inputs(_agent: dict = Depends(require_agent)):
    return augment_inputs_with_trend(get_high_demand_inputs())


@app.get("/api/agent/input-demand/county/{county}")
def agent_input_demand_by_county(county: str, _agent: dict = Depends(require_agent)):
    results = get_input_demand_by_county()
    filtered = [r for r in results if r.get("county", "").lower() == county.lower()]
    county_summary = get_county_input_summary()
    summary = next((s for s in county_summary if s["county"].lower() == county.lower()), None)
    return {"county": county, "inputs": filtered, "summary": summary}


# =====================================================================
# Weather & Climate endpoints
# =====================================================================

from app.services.weather_service import (
    get_current_weather,
    get_weather_for_all_counties,
    get_climate_risk_for_county,
    get_all_climate_risks,
)


@app.get("/api/agent/weather")
async def agent_all_weather(_agent: dict = Depends(require_agent)):
    return await get_weather_for_all_counties()


@app.get("/api/agent/weather/{county}")
async def agent_county_weather(county: str, _agent: dict = Depends(require_agent)):
    return await get_current_weather(county)


@app.get("/api/agent/climate-risks")
def agent_climate_risks(_agent: dict = Depends(require_agent)):
    return get_all_climate_risks()


@app.get("/api/agent/climate-risks/{county}")
def agent_county_climate_risk(county: str, _agent: dict = Depends(require_agent)):
    return get_climate_risk_for_county(county)
