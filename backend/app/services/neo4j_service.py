import re
from pathlib import Path
from neo4j import GraphDatabase, Driver
from app.config import get_settings

_driver: Driver | None = None
_query_cache: dict[str, str] = {}
_queries_file: Path | None = None


def _get_queries_path() -> Path:
    global _queries_file
    if _queries_file is None:
        _queries_file = Path(__file__).resolve().parents[1] / "cypher" / "queries.cypher"
    return _queries_file


def load_query(name: str) -> str:
    if name in _query_cache:
        return _query_cache[name]

    content = _get_queries_path().read_text()
    pattern = rf"// --- {re.escape(name)} ---\n(.+?)(?=\n// --- |\Z)"
    match = re.search(pattern, content, re.DOTALL)
    if not match:
        raise ValueError(f"Query '{name}' not found in queries.cypher")
    query = match.group(1).strip()
    _query_cache[name] = query
    return query


def get_driver() -> Driver:
    global _driver
    if _driver is None:
        settings = get_settings()
        _driver = GraphDatabase.driver(
            settings["neo4j_uri"],
            auth=(settings["neo4j_user"], settings["neo4j_password"]),
        )
    return _driver


def close_driver() -> None:
    global _driver
    if _driver is not None:
        _driver.close()
        _driver = None


def run_query(query: str, params: dict | None = None) -> list[dict]:
    driver = get_driver()
    with driver.session() as session:
        result = session.run(query, params or {})
        records = [record.data() for record in result]
    return records


def run_query_flattened(query: str, params: dict | None = None) -> list[dict]:
    records = run_query(query, params)
    if records and len(records[0]) == 1:
        key = list(records[0].keys())[0]
        return [r[key] for r in records]
    return records


def health_check() -> bool:
    try:
        run_query("RETURN 1")
        return True
    except Exception:
        return False
