import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sprout } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { AuthSplit } from "@/components/AuthSplit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up · CowSense AI" }] }),
  component: SignupPage,
});

const COUNTIES = [
  "Kiambu",
  "Nakuru",
  "Uasin Gishu",
  "Meru",
  "Kericho",
  "Nandi",
  "Kajiado",
  "Nyandarua",
  "Laikipia",
  "Machakos",
  "Mombasa",
  "Nairobi",
  "Bomet",
  "Trans Nzoia",
];

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "DigiCow",
    county: "Kiambu",
    password: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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

      <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
      <p className="text-sm text-muted-foreground mt-1 mb-6">Register as a new extension agent</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Full name</label>
          <Input value={form.fullName} onChange={update("fullName")} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Email</label>
          <Input type="email" value={form.email} onChange={update("email")} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Phone</label>
          <Input value={form.phone} onChange={update("phone")} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Organization</label>
          <Input value={form.organization} onChange={update("organization")} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">County</label>
          <select
            value={form.county}
            onChange={update("county")}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {COUNTIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Password</label>
          <Input
            type="password"
            value={form.password}
            onChange={update("password")}
            required
            minLength={6}
          />
        </div>
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}
        <Button type="submit" className="w-full h-11 text-base mt-1" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplit>
  );
}
