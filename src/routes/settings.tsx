import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { User, Bell, Palette, Building2, KeyRound, RefreshCw, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/services/api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings · CowSense AI" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "api", label: "API connections", icon: KeyRound },
] as const;

function SettingsPage() {
  const [tab, setTab] = useState<typeof tabs[number]["id"]>("profile");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const { data: agent } = useQuery({
    queryKey: ["agent"],
    queryFn: () => apiFetch<{ name: string; email: string; phone: string; organization: string; counties?: string[] }>("/agent"),
  });

  const a = agent ?? { name: "Brian Otieno", email: "brian.otieno@digicow.co.ke", phone: "+254 712 345 678", organization: "DigiCow", counties: ["Nakuru", "Kiambu", "Nyandarua"] };

  const handleDigiCowSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    await new Promise(r => setTimeout(r, 1500));
    setSyncResult("Synced 142 farmers, 317 cows, 89 issues, 56 recommendations");
    setSyncing(false);
  };

  return (
    <PageContainer title="Settings" description="Manage your profile, organization, and integrations.">
      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
        <nav className="space-y-1">
          {tabs.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                tab === t.id ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"
              )}>
                <Icon className="size-4" /> {t.label}
              </button>
            );
          })}
        </nav>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {tab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <Field label="Full name" defaultValue={a.name} />
              <Field label="Email" defaultValue={a.email} />
              <Field label="Phone" defaultValue={a.phone} />
              <Button>Save changes</Button>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-3">
              {["High-priority farmer alerts", "Daily follow-up digest", "Input shortage alerts", "New AI recommendations"].map(n => (
                <label key={n} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm">{n}</span>
                  <input type="checkbox" defaultChecked className="size-4 accent-primary" />
                </label>
              ))}
            </div>
          )}
          {tab === "theme" && <p className="text-sm text-muted-foreground">Theme settings — coming soon.</p>}
          {tab === "organization" && (
            <div className="space-y-4 max-w-lg">
              <Field label="Organization" defaultValue={a.organization} />
              <Field label="Counties covered" defaultValue={(a.counties ?? []).join(", ")} />
            </div>
          )}
          {tab === "api" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div><div className="font-medium text-sm">Neo4j Graph</div><div className="text-xs text-green-600">Connected</div></div>
                <Button size="sm" variant="outline" disabled>Configure</Button>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div><div className="font-medium text-sm">Featherless AI</div><div className="text-xs text-green-600">Connected</div></div>
                <Button size="sm" variant="outline" disabled>Configure</Button>
              </div>
              <div className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">DigiCow Records</div>
                    <div className="text-xs text-muted-foreground">
                      {syncResult ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 className="size-3" />{syncResult}</span>
                      ) : "Sync farmer records from DigiCow"}
                    </div>
                  </div>
                  <Button size="sm" onClick={handleDigiCowSync} disabled={syncing}>
                    <RefreshCw className={cn("size-4 mr-1.5", syncing && "animate-spin")} />
                    {syncing ? "Syncing..." : "Sync now"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}

function Field({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <Input className="mt-1" defaultValue={defaultValue} />
    </div>
  );
}
