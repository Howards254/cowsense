from datetime import date

COUNTY_COORDS: dict[str, dict[str, float]] = {
    "Kiambu": {"lat": -1.171, "lon": 36.835},
    "Nakuru": {"lat": -0.303, "lon": 36.080},
    "Uasin Gishu": {"lat": 0.520, "lon": 35.270},
    "Meru": {"lat": 0.050, "lon": 37.650},
    "Kericho": {"lat": -0.368, "lon": 35.286},
    "Nandi": {"lat": 0.170, "lon": 35.130},
    "Bomet": {"lat": -0.783, "lon": 35.350},
    "Nyandarua": {"lat": -0.220, "lon": 36.430},
    "Laikipia": {"lat": 0.080, "lon": 36.700},
    "Kajiado": {"lat": -1.850, "lon": 36.780},
    "Machakos": {"lat": -1.517, "lon": 37.267},
    "Nairobi": {"lat": -1.292, "lon": 36.822},
}

DEFAULT_COORDS = {"lat": -0.5, "lon": 36.0}

WMO_CODES: dict[int, str] = {
    0: "clear", 1: "mostly_clear", 2: "partly_cloudy", 3: "overcast",
    45: "foggy", 48: "foggy",
    51: "light_drizzle", 53: "drizzle", 55: "heavy_drizzle",
    61: "light_rain", 63: "rain", 65: "heavy_rain",
    71: "light_snow", 73: "snow", 75: "heavy_snow",
    80: "light_showers", 81: "showers", 82: "heavy_showers",
    95: "thunderstorm", 96: "thunderstorm_hail", 99: "thunderstorm_hail",
}

CONDITION_RISK: dict[str, str] = {
    "clear": "none", "mostly_clear": "none", "partly_cloudy": "none",
    "overcast": "low", "foggy": "low",
    "light_drizzle": "low", "drizzle": "low", "heavy_drizzle": "medium",
    "light_rain": "low", "rain": "medium", "heavy_rain": "high",
    "light_snow": "medium", "snow": "high", "heavy_snow": "high",
    "light_showers": "low", "showers": "medium", "heavy_showers": "high",
    "thunderstorm": "high", "thunderstorm_hail": "high",
}


def _get_coords(county: str) -> dict[str, float]:
    return COUNTY_COORDS.get(county, DEFAULT_COORDS)


def _wmo_to_condition(code: int) -> str:
    return WMO_CODES.get(code, "unknown")


def _assess_risk(condition: str, precip: float, temp: float) -> str:
    if precip > 20 or condition in ("thunderstorm", "thunderstorm_hail", "heavy_rain"):
        return "high"
    if precip > 10 or condition in ("rain", "showers", "heavy_showers"):
        return "medium"
    if temp > 35:
        return "high"
    if temp > 30:
        return "medium"
    if condition in ("foggy", "heavy_drizzle"):
        return "medium"
    return "low"


def _mock_weather(county: str) -> dict:
    import random
    import zlib
    random.seed(zlib.adler32(county.encode()))
    temp = round(random.uniform(15, 32), 1)
    humidity = round(random.uniform(40, 90))
    precip = round(random.uniform(0, 15), 1)
    codes = [0, 1, 2, 3, 61, 63, 80, 95]
    code = random.choice(codes)
    condition = _wmo_to_condition(code)
    wind = round(random.uniform(5, 30))
    risk = _assess_risk(condition, precip, temp)

    daily = []
    for i in range(7):
        d = date.today()
        from datetime import timedelta
        day = d + timedelta(days=i)
        dtemp = round(temp + random.uniform(-3, 3), 1)
        dprecip = max(0, round(precip + random.uniform(-5, 5), 1))
        dcodes = random.choice(codes)
        dcond = _wmo_to_condition(dcodes)
        daily.append({
            "date": day.isoformat(),
            "tempMax": round(dtemp + random.uniform(2, 5), 1),
            "tempMin": round(dtemp - random.uniform(2, 5), 1),
            "precipitationMm": dprecip,
            "condition": dcond,
        })

    return {
        "county": county,
        "latitude": _get_coords(county)["lat"],
        "longitude": _get_coords(county)["lon"],
        "temperature": temp,
        "humidity": humidity,
        "precipitationMm": precip,
        "condition": condition,
        "windSpeedKmph": wind,
        "climateRisk": risk,
        "forecast": daily,
        "source": "mock",
    }


async def _fetch_open_meteo(county: str) -> dict | None:
    import httpx
    coords = _get_coords(county)
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "current": "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code",
        "timezone": "auto",
        "forecast_days": "7",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return None

    current = data.get("current", {})
    condition = _wmo_to_condition(current.get("weather_code", 0))
    precip = current.get("precipitation", 0)
    temp = current.get("temperature_2m", 20)
    risk = _assess_risk(condition, precip, temp)

    daily_raw = data.get("daily", {})
    dates = daily_raw.get("time", [])
    tmax = daily_raw.get("temperature_2m_max", [])
    tmin = daily_raw.get("temperature_2m_min", [])
    precip_sum = daily_raw.get("precipitation_sum", [])
    wcodes = daily_raw.get("weather_code", [])

    daily = []
    for i in range(len(dates)):
        daily.append({
            "date": dates[i],
            "tempMax": tmax[i] if i < len(tmax) else None,
            "tempMin": tmin[i] if i < len(tmin) else None,
            "precipitationMm": precip_sum[i] if i < len(precip_sum) else 0,
            "condition": _wmo_to_condition(wcodes[i] if i < len(wcodes) else 0),
        })

    return {
        "county": county,
        "latitude": coords["lat"],
        "longitude": coords["lon"],
        "temperature": current.get("temperature_2m"),
        "humidity": current.get("relative_humidity_2m"),
        "precipitationMm": precip,
        "condition": condition,
        "windSpeedKmph": current.get("wind_speed_10m"),
        "climateRisk": risk,
        "forecast": daily,
        "source": "open-meteo",
    }


async def get_current_weather(county: str) -> dict:
    result = await _fetch_open_meteo(county)
    if result:
        return result
    return _mock_weather(county)


async def get_weather_for_all_counties() -> list[dict]:
    import asyncio
    counties = list(COUNTY_COORDS.keys())
    tasks = [get_current_weather(c) for c in counties]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    out = []
    for r in results:
        if isinstance(r, Exception):
            continue
        out.append(r)
    return out


def get_climate_risk_for_county(county: str) -> dict:
    risks = {
        "Kiambu": {"drought": False, "flood": True, "heatwave": False},
        "Nakuru": {"drought": False, "flood": False, "heatwave": True},
        "Uasin Gishu": {"drought": False, "flood": True, "heatwave": False},
        "Meru": {"drought": True, "flood": False, "heatwave": False},
        "Kericho": {"drought": False, "flood": True, "heatwave": False},
        "Nandi": {"drought": False, "flood": True, "heatwave": False},
        "Kajiado": {"drought": True, "flood": False, "heatwave": True},
    }
    active = risks.get(county, {"drought": False, "flood": False, "heatwave": False})
    active_types = [k for k, v in active.items() if v]
    return {
        "county": county,
        "climateEvent": active_types[0] if active_types else None,
        "activeRisks": active_types or ["none"],
        "severity": "high" if len(active_types) >= 2 else "medium" if active_types else "low",
    }


def get_all_climate_risks() -> list[dict]:
    risks = []
    for county in COUNTY_COORDS:
        risks.append(get_climate_risk_for_county(county))
    return risks
