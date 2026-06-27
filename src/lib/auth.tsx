import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { authService, type AuthUser } from "@/services/authService";

interface AuthContextValue {
  user: Omit<AuthUser, "token"> | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    county: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<AuthUser, "token"> | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("cowsense_token");
    if (stored) {
      setToken(stored);
      authService.getMe()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("cowsense_token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    localStorage.setItem("cowsense_token", result.token);
    setToken(result.token);
    setUser({ agentId: result.agentId, fullName: result.fullName, email: result.email, phone: result.phone, organization: result.organization, county: result.county });
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    phone: string;
    organization: string;
    county: string;
    password: string;
  }) => {
    const result = await authService.signup(data);
    localStorage.setItem("cowsense_token", result.token);
    setToken(result.token);
    setUser({ agentId: result.agentId, fullName: result.fullName, email: result.email, phone: result.phone, organization: result.organization, county: result.county });
  };

  const logout = () => {
    localStorage.removeItem("cowsense_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
