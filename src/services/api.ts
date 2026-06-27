export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? (
  import.meta.env.DEV ? "http://localhost:8000/api" : "/api"
);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApiError(response.status, `API ${response.status} ${response.statusText}: ${body.slice(0, 200)}`);
  }

  return response.json() as Promise<T>;
}
