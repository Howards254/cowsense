from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, EmailStr
from app.services.auth_service import (
    verify_password,
    create_access_token,
    decode_token,
    get_agent_by_email,
    get_agent_by_id,
    create_agent,
    set_password,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    fullName: str
    email: str
    phone: str
    organization: str
    county: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    agentId: str
    fullName: str
    email: str
    phone: str
    organization: str
    county: str


class MeResponse(BaseModel):
    agentId: str
    fullName: str
    email: str
    phone: str
    organization: str
    county: str


@router.post("/signup")
def signup(body: SignupRequest):
    existing = get_agent_by_email(body.email)
    if existing:
        raise HTTPException(409, "An agent with this email already exists")

    import uuid
    agent_id = "EA-" + uuid.uuid4().hex[:8].upper()

    agent = create_agent(
        agent_id=agent_id,
        full_name=body.fullName,
        email=body.email,
        phone=body.phone,
        organization=body.organization,
        county=body.county,
        password=body.password,
    )
    if not agent:
        raise HTTPException(500, "Failed to create agent")

    token = create_access_token(agent_id)
    return AuthResponse(
        token=token,
        agentId=agent_id,
        fullName=agent["fullName"],
        email=agent["email"],
        phone=agent["phone"],
        organization=agent["organization"],
        county=agent["county"],
    )


@router.post("/login")
def login(body: LoginRequest):
    agent = get_agent_by_email(body.email)
    if not agent:
        raise HTTPException(401, "Invalid email or password")

    stored = agent.get("passwordHash")
    if not stored or not verify_password(body.password, stored):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token(agent["agentId"])
    return AuthResponse(
        token=token,
        agentId=agent["agentId"],
        fullName=agent["fullName"],
        email=agent["email"],
        phone=agent.get("phone", ""),
        organization=agent["organization"],
        county=agent.get("county", ""),
    )


@router.get("/me")
def get_me(authorization: str = Header("")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or invalid token")
    token = authorization[7:]
    agent_id = decode_token(token)
    if not agent_id:
        raise HTTPException(401, "Invalid or expired token")

    agent = get_agent_by_id(agent_id)
    if not agent:
        raise HTTPException(404, "Agent not found")
    return MeResponse(
        agentId=agent["agentId"],
        fullName=agent["fullName"],
        email=agent["email"],
        phone=agent.get("phone", ""),
        organization=agent["organization"],
        county=agent.get("county", ""),
    )
