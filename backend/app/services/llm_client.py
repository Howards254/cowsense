from app.config import get_settings


FEATHERLESS_URL = "https://api.featherless.ai/v1/chat/completions"
DEFAULT_MODEL = "moonshotai/Kimi-K2-Instruct"


def _api_key() -> str:
    return get_settings().get("featherless_api_key", "")


def is_available() -> bool:
    return bool(_api_key())


async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.3,
    max_tokens: int = 1024,
) -> str | None:
    key = _api_key()
    if not key:
        return None

    import httpx
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                FEATHERLESS_URL,
                headers={
                    "Authorization": f"Bearer {key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            resp.raise_for_status()
            data = resp.json()
            return data["choices"][0]["message"]["content"]
    except httpx.HTTPStatusError as e:
        error_body = e.response.text[:200] if e.response else str(e)
        print(f"Featherless API error {e.response.status_code}: {error_body}")
        return None
    except httpx.TimeoutException:
        print("Featherless API timeout")
        return None
    except Exception as e:
        print(f"Featherless API error: {e}")
        return None


async def enhance_reasoning(farmer_context: dict, prompt_template: str) -> str | None:
    if not is_available():
        return None
    system = "You are CowSense AI, a dairy extension intelligence assistant for Kenya. Analyze farmer data and provide clear, actionable reasoning based on the evidence provided."
    user = prompt_template.format(**farmer_context)
    return await chat_completion(system, user)
