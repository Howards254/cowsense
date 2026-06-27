from app.services.prioritization_service import score_all_farmers, compute_priority
from app.services.neo4j_service import load_query, run_query_flattened
from app.services.llm_client import is_available, chat_completion


def get_priority_list() -> list[dict]:
    return score_all_farmers()


def get_farmer_priority(farmer_id: str) -> dict | None:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    for f in farmers:
        if f["farmerId"] == farmer_id:
            return compute_priority(f)
    return None


async def _llm_enhanced_reasoning(farmer: dict) -> str | None:
    if not is_available():
        return None
    issues = farmer.get("issues", [])
    production = farmer.get("production", [])
    diseases = farmer.get("diseases", [])
    followups = farmer.get("followups", [])
    context = {
        "name": farmer.get("fullName", "Unknown"),
        "county": farmer.get("county", "Unknown"),
        "issues": "; ".join(f"{i.get('title','')} ({i.get('severity','')})" for i in issues),
        "production": "; ".join(f"{p.get('date','')}: {p.get('litres',0)}L" for p in production[-6:]),
        "diseases": "; ".join(f"{d.get('name','')} risk:{d.get('riskScore','?')}" for d in diseases),
        "followups": "; ".join(f"{f.get('purpose','')} ({f.get('status','')})" for f in followups),
        "climate": farmer.get("climateEvent", "none"),
        "lastVisit": farmer.get("lastVisit", "never"),
    }
    prompt = (
        "Farmer {name} in {county}. Issues: {issues}. "
        "Recent production (last 6): {production}. "
        "Disease risks: {diseases}. "
        "Follow-ups: {followups}. "
        "Climate event: {climate}. "
        "Last visit: {lastVisit}. "
        "Score this farmer's priority (critical/high/medium/low) and explain in 2-3 sentences."
    ).format(**context)
    system = "You are CowSense AI, a dairy extension intelligence assistant. Assess farmer priority based on the data and explain your reasoning clearly."
    return await chat_completion(system, prompt)


def _get_farmer_by_id(farmer_id: str) -> dict | None:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    for f in farmers:
        if f["farmerId"] == farmer_id:
            return f
    return None


async def get_prioritization_reasoning(farmer_id: str) -> dict | None:
    result = get_farmer_priority(farmer_id)
    if not result:
        return None

    farmer = _get_farmer_by_id(farmer_id)
    llm_reasoning = None
    if farmer and is_available():
        llm_reasoning = await _llm_enhanced_reasoning(farmer)

    return {
        "farmerId": result["farmerId"],
        "farmerName": result["farmerName"],
        "priority": result["priority"],
        "priorityScore": result["priorityScore"],
        "reasoning": llm_reasoning or ("Priority is " + result["priority"].upper() + ". " + ". ".join(result["reasons"]) + "."),
        "factors": result["reasons"],
    }
