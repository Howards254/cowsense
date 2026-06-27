from fastapi import APIRouter
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import VisitSchema

router = APIRouter(prefix="/api/visits", tags=["visits"])


@router.get("")
def list_visits():
    query = load_query("visits.list")
    results = run_query_flattened(query)
    return [VisitSchema(**r).model_dump() for r in results]
