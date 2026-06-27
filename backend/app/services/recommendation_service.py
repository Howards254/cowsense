from app.services.neo4j_service import load_query, run_query_flattened


def get_recommendations_for_farmer(farmer_id: str, farmer_name: str | None = None) -> list[dict]:
    query = load_query("recommendations.forFarmer")
    results = run_query_flattened(query, {"farmerId": farmer_id})
    return [_personalize(r, farmer_name or farmer_id) for r in results]


def _personalize(match: dict, farmer_name: str) -> dict:
    rec = match.get("recommendation", {})
    issues = match.get("matchedIssues", [])
    inputs = match.get("requiredInputs", [])

    issue_names = [i["name"] for i in issues if i.get("name")]
    input_names = [i["name"] for i in inputs if i.get("name")]

    if issue_names:
        personalized = f"Farmer {farmer_name} is experiencing: {', '.join(issue_names)}. "
    else:
        personalized = ""

    personalized += rec.get("reasoning", "")

    return {
        "id": rec.get("id"),
        "title": rec.get("title"),
        "priority": rec.get("priority"),
        "status": rec.get("status"),
        "reasoning": personalized,
        "expectedOutcome": rec.get("expectedOutcome"),
        "matchedIssues": issue_names,
        "requiredInputs": input_names,
    }
