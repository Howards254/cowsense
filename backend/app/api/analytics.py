from fastapi import APIRouter
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import (
    PriorityBucket,
    CountyDemandSchema,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/farmer-trend")
def get_farmer_trend():
    query = load_query("analytics.farmerTrend")
    return run_query_flattened(query)


@router.get("/input-demand-trend")
def get_input_demand_trend():
    query = load_query("analytics.inputDemandTrend")
    return run_query_flattened(query)


@router.get("/adoption-trend")
def get_adoption_trend():
    query = load_query("analytics.adoptionTrend")
    return run_query_flattened(query)


@router.get("/county-demand")
def get_county_demand():
    query = load_query("dashboard.countyDemand")
    results = run_query_flattened(query)
    return [CountyDemandSchema(**r).model_dump() for r in results]


@router.get("/priority-distribution")
def get_priority_distribution():
    query = load_query("dashboard.priorityDistribution")
    results = run_query_flattened(query)
    return [PriorityBucket(**r).model_dump() for r in results]
