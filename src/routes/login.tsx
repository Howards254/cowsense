import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthSplit } from "@/components/AuthSplit";
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
    <AuthSplit>
      <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
        <div
          className="size-8 rounded-lg grid place-items-center text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Sprout className="size-4" />
        </div>
        <span className="text-lg font-bold">CowSense AI</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">
        Sign in to your extension agent account
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full h-11 text-base" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-muted/50 border border-border p-3">
        <p className="text-xs font-medium text-muted-foreground mb-1">Demo credentials</p>
        <p className="text-xs text-muted-foreground font-mono break-all">
          brian.otieno@digicow.co.ke
        </p>
        <p className="text-xs text-muted-foreground font-mono">cowsense123</p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </AuthSplit>
  );
}
