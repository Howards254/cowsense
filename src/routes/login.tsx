import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login · CowSense AI" }] }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("brian.otieno@digicow.co.ke");
  const [password, setPassword] = useState("cowsense123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch {
      setError("Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">CowSense AI</h1>
          <p className="text-sm text-muted-foreground mt-1">Extension agent sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Demo: <code>brian.otieno@digicow.co.ke</code> / <code>cowsense123</code>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          No account? <Link to="/signup" className="text-primary underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
