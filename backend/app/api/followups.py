from fastapi import APIRouter, Depends, HTTPException
from app.services.neo4j_service import load_query, run_query_flattened, run_query
from app.schemas import FollowUpSchema
from app.api.deps import require_agent
from pydantic import BaseModel

router = APIRouter(prefix="/api/followups", tags=["followups"], dependencies=[Depends(require_agent)])


class CreateFollowUpRequest(BaseModel):
    farmerId: str
    recommendationId: str | None = None
    purpose: str
    dueDate: str
    status: str = "scheduled"


@router.get("")
def list_followups():
    query = load_query("followups.list")
    results = run_query_flattened(query)
    return [FollowUpSchema(**r).model_dump() for r in results]


@router.patch("/{followup_id}")
def complete_followup(followup_id: str):
    query = """
        MATCH (fu:FollowUp {followUpId: $id})
        SET fu.status = 'completed'
        RETURN fu
    """
    results = run_query(query, {"id": followup_id})
    if not results:
        raise HTTPException(404, "Follow-up not found")
    return {"status": "completed", "followUpId": followup_id}


@router.post("")
def create_followup(body: CreateFollowUpRequest):
    import uuid
    fu_id = "FU-" + uuid.uuid4().hex[:8].upper()
    query = """
        MATCH (f:Farmer {farmerId: $farmerId})
        CREATE (fu:FollowUp {
            followUpId: $id,
            purpose: $purpose,
            dueDate: date($dueDate),
            status: $status
        })
        CREATE (f)-[:HAS_FOLLOWUP]->(fu)
        WITH fu, $recId AS recId
        OPTIONAL MATCH (r:Recommendation {recommendationId: recId})
        FOREACH (_ IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
            CREATE (r)-[:TRACKED_BY]->(fu)
        )
        RETURN fu
    """
    run_query(query, {
        "farmerId": body.farmerId,
        "id": fu_id,
        "purpose": body.purpose,
        "dueDate": body.dueDate,
        "status": body.status,
        "recId": body.recommendationId,
    })
    return {"followUpId": fu_id, "status": body.status}
