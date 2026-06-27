import { apiFetch, apiBaseUrl } from "./api";

export interface AuthUser {
  token: string;
  agentId: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  county: string;
}

export const authService = {
  login: (email: string, password: string): Promise<AuthUser> =>
    apiFetch<AuthUser>("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    county: string;
    password: string;
  }): Promise<AuthUser> =>
    apiFetch<AuthUser>("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  getMe: (): Promise<Omit<AuthUser, "token">> =>
    apiFetch<Omit<AuthUser, "token">>("/auth/me"),
};
