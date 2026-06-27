from datetime import date, timedelta
from app.services.neo4j_service import load_query, run_query_flattened
from app.services.llm_client import is_available, chat_completion

FOLLOWUP_WINDOWS = {
    "Introduce Silage Conservation": 14,
    "Supplement Dairy Feed with Concentrate": 10,
    "FMD Vaccination Drive": 21,
    "Improve Water Access Points": 28,
    "Establish Napier Grass": 21,
    "Improve Record Keeping": 14,
    "Schedule Veterinary Visit": 7,
}

DEFAULT_WINDOW = 14


def _suggest_due_date(rec_title: str) -> str:
    days = FOLLOWUP_WINDOWS.get(rec_title, DEFAULT_WINDOW)
    return (date.today() + timedelta(days=days)).isoformat()


def generate_followups(farmer_id: str) -> list[dict]:
    query = load_query("recommendations.forFarmer")
    matches = run_query_flattened(query, {"farmerId": farmer_id})

    followups = []
    for match in matches:
        rec = match.get("recommendation", {})
        rec_title = rec.get("title", "")
        rec_id = rec.get("id", "")

        purpose = _build_purpose(rec_title)
        due = _suggest_due_date(rec_title)

        followups.append({
            "farmerId": farmer_id,
            "recommendationId": rec_id,
            "recommendationTitle": rec_title,
            "purpose": purpose,
            "dueDate": due,
            "status": "scheduled",
        })

    return followups


def _build_purpose(rec_title: str) -> str:
    purposes = {
        "Introduce Silage Conservation": "Review feed reserves and silage preparation progress",
        "Supplement Dairy Feed with Concentrate": "Verify dairy meal supplementation and production response",
        "FMD Vaccination Drive": "Confirm vaccination administration and check for side effects",
        "Improve Water Access Points": "Inspect water access improvements and measure walking distance reduction",
        "Establish Napier Grass": "Check Napier grass establishment and growth progress",
        "Improve Record Keeping": "Review farm records and data tracking compliance",
        "Schedule Veterinary Visit": "Follow up on veterinary visit outcomes",
    }
    return purposes.get(rec_title, f"Follow up on {rec_title.lower()}")


async def _llm_enhance_followups(farmer_id: str, farmer_name: str, followups: list[dict]) -> str | None:
    if not is_available():
        return None
    fu_text = "; ".join(f"{f.get('recommendationTitle','')} due {f.get('dueDate','')} ({f.get('purpose','')})" for f in followups)
    prompt = (
        f"Farmer {farmer_name} (ID: {farmer_id}). "
        f"Scheduled follow-ups: {fu_text}. "
        "Suggest priority ordering and any adjustments to timing based on the purposes."
    )
    system = "You are CowSense AI, a dairy extension scheduler. Optimize follow-up scheduling for maximum impact."
    return await chat_completion(system, prompt)


def generate_all_pending_followups() -> list[dict]:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    all_fus = []
    for farmer in farmers:
        farmer_fus = generate_followups(farmer["farmerId"])
        for fu in farmer_fus:
            fu["farmerName"] = farmer.get("fullName", farmer["farmerId"])
            fu["county"] = farmer.get("county", "")
        all_fus.extend(farmer_fus)
    return all_fus
