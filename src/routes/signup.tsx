import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up · CowSense AI" }] }),
  component: SignupPage,
});

const COUNTIES = ["Kiambu", "Nakuru", "Uasin Gishu", "Meru", "Kericho", "Nandi", "Kajiado", "Nyandarua", "Laikipia", "Machakos", "Mombasa", "Nairobi", "Bomet", "Trans Nzoia"];

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", organization: "DigiCow", county: "Kiambu", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signup(form);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">CowSense AI</h1>
          <p className="text-sm text-muted-foreground mt-1">Create an extension agent account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Full name</label>
            <Input value={form.fullName} onChange={update("fullName")} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <Input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <Input value={form.phone} onChange={update("phone")} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Organization</label>
            <Input value={form.organization} onChange={update("organization")} required />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">County</label>
            <select
              value={form.county}
              onChange={update("county")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Password</label>
            <Input type="password" value={form.password} onChange={update("password")} required minLength={6} />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="text-center text-xs text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
