from app.services.recommendation_service import get_recommendations_for_farmer
from app.services.neo4j_service import load_query, run_query_flattened
from app.services.llm_client import is_available, chat_completion


async def _llm_enhance_recs(farmer_id: str, farmer_name: str, current_recs: list[dict]) -> str | None:
    if not is_available():
        return None
    rec_text = "; ".join(f"{r.get('title','')}: {r.get('reasoning','')}" for r in current_recs)
    prompt = (
        f"Farmer {farmer_name} (ID: {farmer_id}). "
        f"Current recommendations: {rec_text}. "
        "Provide a concise, farmer-friendly summary of these recommendations in 2-3 sentences."
    )
    system = "You are CowSense AI, a dairy extension assistant. Summarize recommendations in plain, actionable language for a smallholder dairy farmer."
    return await chat_completion(system, prompt)


def generate_recommendations(farmer_id: str) -> dict | None:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    farmer = next((f for f in farmers if f["farmerId"] == farmer_id), None)
    if not farmer:
        return None

    name = farmer.get("fullName", farmer_id)
    recs = get_recommendations_for_farmer(farmer_id, name)

    return {
        "farmerId": farmer_id,
        "farmerName": name,
        "county": farmer.get("county", ""),
        "farmSizeAcres": farmer.get("farmSizeAcres"),
        "dairyExperienceYears": farmer.get("dairyExperienceYears"),
        "avgMilkLitres": farmer.get("avgMilkLitres"),
        "recommendations": recs,
    }


def generate_all_recommendations() -> list[dict]:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    results = []
    for farmer in farmers:
        name = farmer.get("fullName", farmer["farmerId"])
        recs = get_recommendations_for_farmer(farmer["farmerId"], name)
        if recs:
            results.append({
                "farmerId": farmer["farmerId"],
                "farmerName": name,
                "recommendations": recs,
            })
    return results
