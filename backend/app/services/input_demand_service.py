from app.services.neo4j_service import load_query, run_query_flattened


def get_input_demand_by_county() -> list[dict]:
    query = load_query("intelligence.inputDemandByCounty")
    return run_query_flattened(query)


def get_total_input_demand() -> list[dict]:
    by_county = get_input_demand_by_county()
    aggregated: dict[str, dict] = {}
    for row in by_county:
        iid = row.get("inputId")
        name = row.get("inputName")
        count = row.get("demandCount", 0)
        if iid not in aggregated:
            aggregated[iid] = {"inputId": iid, "name": name, "totalDemand": 0, "counties": set()}
        aggregated[iid]["totalDemand"] += count
        aggregated[iid]["counties"].add(row.get("county"))
    result = []
    for v in aggregated.values():
        v["counties"] = sorted(v["counties"])
        result.append(v)
    return sorted(result, key=lambda x: x["totalDemand"], reverse=True)


def get_high_demand_inputs(threshold: int = 3) -> list[dict]:
    return [i for i in get_total_input_demand() if i["totalDemand"] >= threshold]


def get_county_input_summary() -> list[dict]:
    by_county = get_input_demand_by_county()
    summary: dict[str, dict] = {}
    for row in by_county:
        county = row.get("county")
        count = row.get("demandCount", 0)
        if county not in summary:
            summary[county] = {"county": county, "totalDemand": 0, "inputs": []}
        summary[county]["totalDemand"] += count
        summary[county]["inputs"].append({
            "inputId": row.get("inputId"),
            "name": row.get("inputName"),
            "demandCount": count,
        })
    for v in summary.values():
        v["inputs"].sort(key=lambda x: x["demandCount"], reverse=True)
    return sorted(summary.values(), key=lambda x: x["totalDemand"], reverse=True)


def get_input_demand_trend() -> list[dict]:
    query = load_query("dashboard.inputDemandTrend")
    return run_query_flattened(query)


def augment_inputs_with_trend(inputs: list[dict]) -> list[dict]:
    for inp in inputs:
        demand = inp.get("totalDemand", inp.get("demandCount", 0))
        if demand >= 4:
            inp["trend"] = "up"
        elif demand <= 1:
            inp["trend"] = "down"
        else:
            inp["trend"] = "stable"
    return inputs
