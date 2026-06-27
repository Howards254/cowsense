from datetime import date, datetime
from app.services.neo4j_service import load_query, run_query_flattened

SEVERITY_WEIGHTS = {"critical": 30, "high": 20, "medium": 10, "low": 5}


def _classify(score: int) -> str:
    if score >= 80:
        return "critical"
    if score >= 60:
        return "high"
    if score >= 30:
        return "medium"
    return "low"


def _production_decline(production: list[dict]) -> tuple[float, float]:
    if len(production) < 4:
        return 0.0, 0.0
    mid = len(production) // 2
    first = sum(p.get("litres", 0) for p in production[:mid]) / mid
    second = sum(p.get("litres", 0) for p in production[mid:]) / (len(production) - mid)
    if first <= 0:
        return 0.0, 0.0
    decline_pct = (first - second) / first * 100
    return decline_pct, round(first - second, 1)


def _days_since_last_visit(last_visit_str: str | None) -> int:
    if not last_visit_str or last_visit_str == "null":
        return 999
    try:
        last = datetime.strptime(last_visit_str[:10], "%Y-%m-%d").date()
        return (date.today() - last).days
    except (ValueError, TypeError):
        return 999


def compute_priority(farmer: dict) -> dict:
    score = 0
    reasons = []

    open_issues = [i for i in farmer.get("issues", []) if i.get("status") != "resolved"]
    for issue in open_issues:
        sev = issue.get("severity", "low")
        weight = SEVERITY_WEIGHTS.get(sev, 5)
        score += weight
        reasons.append(f"{issue['title']} ({sev})")

    if len(open_issues) >= 2:
        score += 10
        reasons.append(f"{len(open_issues)} active issues")

    decline_pct, decline_litres = _production_decline(farmer.get("production", []))
    if decline_pct > 20:
        score += 20
        reasons.append(f"Production declined {decline_pct:.0f}% ({decline_litres:.1f}L)")
    elif decline_pct > 10:
        score += 10
        reasons.append(f"Production declined {decline_pct:.0f}%")

    for disease in farmer.get("diseases", []):
        rscore = disease.get("riskScore", 0)
        if rscore >= 80:
            score += 20
            reasons.append(f"High {disease['name']} risk ({rscore})")
        elif rscore >= 60:
            score += 10
            reasons.append(f"{disease['name']} risk ({rscore})")

    for fu in farmer.get("followups", []):
        if fu.get("status") == "overdue":
            score += 15
            reasons.append(f"Overdue: {fu['purpose']}")
        elif fu.get("status") == "scheduled":
            score += 5

    if farmer.get("climateEvent"):
        score += 10
        reasons.append(f"County affected by {farmer['climateEvent']}")

    days_ago = _days_since_last_visit(farmer.get("lastVisit"))
    if days_ago > 21:
        score += 10
        reasons.append(f"No visit in {days_ago} days")
    elif days_ago > 14:
        score += 5
        reasons.append(f"Last visit {days_ago} days ago")

    score = min(score, 100)
    return {
        "farmerId": farmer["farmerId"],
        "farmerName": farmer.get("fullName", ""),
        "priorityScore": score,
        "priority": _classify(score),
        "reasons": reasons,
    }


def score_all_farmers() -> list[dict]:
    query = load_query("prioritization.allFarmers")
    farmers = run_query_flattened(query)
    scored = [compute_priority(f) for f in farmers]
    scored.sort(key=lambda x: x["priorityScore"], reverse=True)
    return scored
