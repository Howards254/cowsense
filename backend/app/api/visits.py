from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from app.services.neo4j_service import load_query, run_query_flattened, run_query
from app.schemas import VisitSchema
from app.api.deps import require_agent
from pydantic import BaseModel

router = APIRouter(prefix="/api/visits", tags=["visits"], dependencies=[Depends(require_agent)])


class CreateVisitRequest(BaseModel):
    farmerId: str
    scheduledFor: str
    notes: str = ""
    issuesObserved: list[str] = []
    recommendationsIssued: list[str] = []


@router.patch("/{visit_id}")
def complete_visit(visit_id: str):
    query = """
        MATCH (v:Visit {visitId: $id})
        SET v.status = 'completed'
        RETURN v
    """
    results = run_query(query, {"id": visit_id})
    if not results:
        raise HTTPException(404, "Visit not found")
    return {"status": "completed", "visitId": visit_id}


@router.get("")
def list_visits():
    query = load_query("visits.list")
    results = run_query_flattened(query)
    return [VisitSchema(**r).model_dump() for r in results]


@router.post("")
def create_visit(body: CreateVisitRequest):
    import uuid
    visit_id = "V-" + uuid.uuid4().hex[:8].upper()
    query = """
        MATCH (f:Farmer {farmerId: $farmerId})
        CREATE (v:Visit {
            visitId: $id,
            scheduledFor: date($scheduledFor),
            status: 'scheduled',
            notes: $notes
        })
        CREATE (f)-[:HAS_VISIT]->(v)
        WITH v
        UNWIND $issueIds AS issueId
        OPTIONAL MATCH (i:Issue {issueId: issueId})
        FOREACH (_ IN CASE WHEN i IS NOT NULL THEN [1] ELSE [] END |
            CREATE (v)-[:OBSERVED]->(i)
        )
        WITH v
        UNWIND $recIds AS recId
        OPTIONAL MATCH (r:Recommendation {recommendationId: recId})
        FOREACH (_ IN CASE WHEN r IS NOT NULL THEN [1] ELSE [] END |
            CREATE (v)-[:ISSUED]->(r)
        )
        RETURN v
    """
    run_query(query, {
        "farmerId": body.farmerId,
        "id": visit_id,
        "scheduledFor": body.scheduledFor,
        "notes": body.notes,
        "issueIds": body.issuesObserved,
        "recIds": body.recommendationsIssued,
    })
    return {"visitId": visit_id, "status": "scheduled"}
