from fastapi import APIRouter, Depends, HTTPException
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import RecommendationSchema
from app.api.deps import require_agent

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"], dependencies=[Depends(require_agent)])


@router.get("")
def list_recommendations():
    query = load_query("recommendations.list")
    results = run_query_flattened(query)
    return [RecommendationSchema(**r).model_dump() for r in results]


@router.get("/{rec_id}")
def get_recommendation(rec_id: str):
    query = load_query("recommendations.getById")
    results = run_query_flattened(query, {"recId": rec_id})
    if not results:
        raise HTTPException(404, "Recommendation not found")
    return results[0]
