export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (
    import.meta.env.DEV ? "http://localhost:8000/api" : "/api"
);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem("cowsense_token");
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };
  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    if (response.status === 401) {
      localStorage.removeItem("cowsense_token");
    }
    throw new ApiError(response.status, `API ${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
  }

  return response.json() as Promise<T>;
}
