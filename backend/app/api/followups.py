from fastapi import APIRouter
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import FollowUpSchema

router = APIRouter(prefix="/api/followups", tags=["followups"])


@router.get("")
def list_followups():
    query = load_query("followups.list")
    results = run_query_flattened(query)
    return [FollowUpSchema(**r).model_dump() for r in results]
