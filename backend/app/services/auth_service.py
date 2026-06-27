from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.config import get_settings
from app.services.neo4j_service import run_query

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7


def _secret() -> str:
    return get_settings()["jwt_secret"]


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(agent_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    payload = {"sub": agent_id, "exp": expire}
    return jwt.encode(payload, _secret(), algorithm=ALGORITHM)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, _secret(), algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


def get_agent_by_email(email: str) -> dict | None:
    query = "MATCH (a:ExtensionAgent {email: $email}) RETURN {agentId: a.agentId, fullName: a.fullName, email: a.email, phone: a.phone, organization: a.organization, county: a.county, passwordHash: a.passwordHash} AS result"
    result = run_query(query, {"email": email})
    return result[0]["result"] if result else None


def get_agent_by_id(agent_id: str) -> dict | None:
    query = "MATCH (a:ExtensionAgent {agentId: $agentId}) RETURN {agentId: a.agentId, fullName: a.fullName, email: a.email, phone: a.phone, organization: a.organization, county: a.county} AS result"
    result = run_query(query, {"agentId": agent_id})
    return result[0]["result"] if result else None


def create_agent(agent_id: str, full_name: str, email: str, phone: str, organization: str, county: str, password: str) -> dict:
    hashed = hash_password(password)
    query = """
    CREATE (a:ExtensionAgent {
      agentId: $agentId,
      fullName: $fullName,
      email: $email,
      phone: $phone,
      organization: $organization,
      county: $county,
      passwordHash: $passwordHash
    })
    RETURN {agentId: a.agentId, fullName: a.fullName, email: a.email, organization: a.organization, county: a.county} AS result
    """
    result = run_query(query, {
        "agentId": agent_id,
        "fullName": full_name,
        "email": email,
        "phone": phone,
        "organization": organization,
        "county": county,
        "passwordHash": hashed,
    })
    return result[0]["result"] if result else None


def set_password(agent_id: str, password: str) -> bool:
    hashed = hash_password(password)
    query = "MATCH (a:ExtensionAgent {agentId: $agentId}) SET a.passwordHash = $passwordHash RETURN count(a) AS updated"
    result = run_query(query, {"agentId": agent_id, "passwordHash": hashed})
    return result and result[0].get("updated", 0) > 0
