from os import environ
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[2] / ".env")


def get_settings() -> dict:
    return {
        "neo4j_uri": environ.get("NEO4J_URI", "bolt://localhost:7687"),
        "neo4j_user": environ.get("NEO4J_USER", "neo4j"),
        "neo4j_password": environ.get("NEO4J_PASSWORD", "changeme"),
        "featherless_api_key": environ.get("FEATHERLESS_API_KEY", ""),
        "jwt_secret": environ.get("JWT_SECRET", "change-me-in-production"),
    }
