import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Droplets, AlertTriangle, ClipboardList, Activity } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StatsCard } from "@/components/cards/StatsCard";
import { Button } from "@/components/ui/button";
import { farmerService } from "@/services/farmerService";
import { followupService } from "@/services/followupService";
import { visitService } from "@/services/visitService";
import { recommendationService } from "@/services/recommendationService";
import { formatDate, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/farmers/$id")({
  head: ({ params }) => ({ meta: [{ title: `Farmer · CowSense AI` }] }),
  loader: async ({ params }) => {
    try {
      return await farmerService.getById(params.id);
    } catch {
      throw notFound();
    }
  },
  component: FarmerProfile,
});

const tabs = ["Overview", "Herd", "Issues", "Recommendations", "Follow Ups", "History"] as const;

function FarmerProfile() {
  const farmer = Route.useLoaderData();
  const [tab, setTab] = useState<typeof tabs[number]>("Overview");
  const { data: recommendations = [] } = useQuery({ queryKey: ["recommendations"], queryFn: () => recommendationService.list() });
  const { data: followUps = [] } = useQuery({ queryKey: ["followups"], queryFn: () => followupService.list() });
  const { data: visits = [] } = useQuery({ queryKey: ["visits"], queryFn: () => visitService.list() });

  const recs = recommendations.filter(r => farmer.recommendations.includes(r.id));
  const fus = followUps.filter(f => f.farmerId === farmer.id);
  const vs = visits.filter(v => v.farmerId === farmer.id);

  return (
    <PageContainer
      title={farmer.name}
      description={`${farmer.county} · ${farmer.subCounty}`}
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/farmers"><ArrowLeft className="size-4 mr-1.5" />All farmers</Link>
        </Button>
      }
    >
      {/* Hero */}
      <div className="rounded-xl border border-border p-6 mb-6 text-primary-foreground" style={{ background: "var(--gradient-hero)" }}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Stat label="County" value={farmer.county} />
          <Stat label="Farm size" value={`${farmer.farmSizeAcres} acres`} />
          <Stat label="Experience" value={`${farmer.dairyExperienceYears} yrs`} />
          <Stat label="Herd" value={farmer.herd.totalCows} />
          <div>
            <div className="text-xs opacity-80 uppercase">Priority score</div>
            <div className="mt-1 flex items-center gap-2">
              <div className="text-2xl font-bold tabular-nums">{farmer.priorityScore}</div>
              <PriorityBadge priority={farmer.priority} className="bg-white/15 text-white border-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(
              "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "Overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Avg milk" value={`${farmer.avgMilkLitres}L`} icon={Droplets} tone="primary" />
            <StatsCard label="Risk level" value={farmer.priority} icon={AlertTriangle} tone="warning" />
            <StatsCard label="Open issues" value={farmer.issues.filter((i: { status: string }) => i.status === "open").length} icon={ClipboardList} tone="danger" />
            <StatsCard label="Adoption score" value={`${farmer.adoptionScore}%`} icon={Activity} tone="success" />
          </div>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Milk production · last 14 days</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={farmer.production}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="litres" stroke="hsl(178 55% 35%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <Timeline farmer={farmer} visits={vs} followUps={fus} />
        </div>
      )}

      {tab === "Herd" && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatsCard label="Total cows" value={farmer.herd.totalCows} icon={Droplets} tone="primary" />
          <StatsCard label="Lactating" value={farmer.herd.lactating} icon={Activity} tone="success" />
          <StatsCard label="Dry" value={farmer.herd.dry} icon={ClipboardList} />
          <StatsCard label="Calves" value={farmer.herd.calves} icon={AlertTriangle} tone="warning" />
        </div>
      )}

      {tab === "Issues" && (
        <ul className="space-y-3">
          {farmer.issues.map((i: typeof farmer.issues[number]) => (
            <li key={i.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-sm text-muted-foreground">{i.description}</div>
                </div>
                <PriorityBadge priority={i.severity} />
              </div>
              <div className="text-xs text-muted-foreground mt-2">Detected {formatDate(i.detectedAt)} · {i.status}</div>
            </li>
          ))}
          {farmer.issues.length === 0 && <p className="text-sm text-muted-foreground">No open issues.</p>}
        </ul>
      )}

      {tab === "Recommendations" && (
        <ul className="space-y-3">
          {recs.map(r => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium">{r.title}</div>
                <PriorityBadge priority={r.priority} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">{r.reasoning}</p>
              <p className="text-xs text-primary mt-2">Expected: {r.expectedOutcome}</p>
            </li>
          ))}
          {recs.length === 0 && <p className="text-sm text-muted-foreground">No recommendations yet.</p>}
        </ul>
      )}

      {tab === "Follow Ups" && (
        <ul className="space-y-3">
          {fus.map(f => (
            <li key={f.id} className="rounded-xl border border-border bg-card p-4 shadow-sm flex justify-between gap-3">
              <div><div className="font-medium">{f.purpose}</div><div className="text-xs text-muted-foreground">{formatDate(f.dueDate)}</div></div>
              <span className={cn("text-xs", f.status === "overdue" && "text-destructive")}>{relativeDay(f.dueDate)}</span>
            </li>
          ))}
          {fus.length === 0 && <p className="text-sm text-muted-foreground">No follow-ups scheduled.</p>}
        </ul>
      )}

      {tab === "History" && <Timeline farmer={farmer} visits={vs} followUps={fus} />}
    </PageContainer>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs opacity-80 uppercase">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function Timeline({ farmer, visits, followUps }: { farmer: { id: string; issues: { id: string; detectedAt: string; title: string }[] }; visits: { farmerId: string; scheduledFor: string; notes?: string }[]; followUps: { farmerId: string; dueDate: string; purpose: string }[] }) {
  const events = [
    ...visits.filter(v => v.farmerId === farmer.id).map(v => ({ date: v.scheduledFor, type: "Visit", label: v.notes ?? "Scheduled visit" })),
    ...followUps.filter(f => f.farmerId === farmer.id).map(f => ({ date: f.dueDate, type: "Follow-up", label: f.purpose })),
    ...farmer.issues.map(i => ({ date: i.detectedAt, type: "Issue", label: i.title })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="font-semibold mb-4">Timeline</h3>
      <ol className="relative border-l-2 border-border ml-2 space-y-4">
        {events.map((e, i) => (
          <li key={i} className="pl-4 relative">
            <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary" />
            <div className="text-xs text-muted-foreground">{formatDate(e.date)} · {e.type}</div>
            <div className="text-sm">{e.label}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
