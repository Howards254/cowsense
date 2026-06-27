from fastapi import Header, HTTPException
from app.services.auth_service import decode_token, get_agent_by_id


def require_agent(authorization: str = Header("")) -> dict:
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid token")
    token = authorization[7:]
    agent_id = decode_token(token)
    if not agent_id:
        raise HTTPException(401, "Invalid or expired token")
    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return agent
