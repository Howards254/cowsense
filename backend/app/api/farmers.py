from fastapi import APIRouter, Depends, HTTPException
from app.services.neo4j_service import load_query, run_query_flattened
from app.schemas import FarmerListItem, FarmerDetail
from app.api.deps import require_agent

router = APIRouter(prefix="/api/farmers", tags=["farmers"], dependencies=[Depends(require_agent)])


@router.get("")
def list_farmers():
    query = load_query("farmers.list")
    results = run_query_flattened(query)
    return [FarmerListItem(**r).model_dump() for r in results]


@router.get("/{farmer_id}")
def get_farmer(farmer_id: str):
    query = load_query("farmers.getById")
    results = run_query_flattened(query, {"farmerId": farmer_id})
    if not results:
        raise HTTPException(404, "Farmer not found")
    return FarmerDetail(**results[0]).model_dump()
