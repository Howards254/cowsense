import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Brain, Sparkles, AlertTriangle, Package, CheckCircle2, ArrowRight, Droplets } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { farmerService } from "@/services/farmerService";
import { recommendationService } from "@/services/recommendationService";
import { dashboardService } from "@/services/dashboardService";

export const Route = createFileRoute("/intelligence")({
  head: () => ({ meta: [{ title: "Farmer Intelligence · CowSense AI" }] }),
  component: IntelligencePage,
});

function IntelligencePage() {
  const { data: farmers = [] } = useQuery({ queryKey: ["farmers"], queryFn: () => farmerService.list() });
  const { data: recommendations = [] } = useQuery({ queryKey: ["recommendations"], queryFn: () => recommendationService.list() });
  const { data: dashboard } = useQuery({ queryKey: ["dashboard", "full"], queryFn: async () => {
    const [stats, inputTrend] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getInputDemandTrend(),
    ]);
    return { stats, inputTrend };
  }});

  const farmer = farmers[0];
  if (!farmer) return <PageContainer title="Farmer Intelligence" description="AI-generated decision support."><p className="text-sm text-muted-foreground">No farmer data available.</p></PageContainer>;

  const recIds = farmer.recommendations ?? [];
  const recs = recommendations.filter(r => recIds.includes(r.id));
  const reqInputs = dashboard?.inputTrend?.flatMap(t => [t.silage, t.dairyMeal, t.vaccines]) ?? [];

  return (
    <PageContainer
      title="Farmer Intelligence"
      description="AI-generated decision support for the farmer most needing attention."
      actions={<Button variant="outline" size="sm"><Sparkles className="size-4 mr-1.5" />Regenerate</Button>}
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Farmer summary */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-1">
          <div className="text-xs text-muted-foreground uppercase">Subject</div>
          <h2 className="mt-1 text-xl font-semibold">{farmer.name}</h2>
          <p className="text-sm text-muted-foreground">{farmer.county} · {farmer.farmSizeAcres} acres</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div><div className="text-xs text-muted-foreground">Herd</div><div className="font-semibold">{farmer.herd.totalCows} cows</div></div>
            <div><div className="text-xs text-muted-foreground">Avg milk</div><div className="font-semibold">{farmer.avgMilkLitres}L</div></div>
            <div><div className="text-xs text-muted-foreground">Priority</div><PriorityBadge priority={farmer.priority} /></div>
            <div><div className="text-xs text-muted-foreground">Score</div><div className="font-semibold">{farmer.priorityScore}/100</div></div>
          </div>
        </div>

        {/* AI Explanation */}
        <div className="rounded-xl p-5 shadow-sm xl:col-span-2 text-primary-foreground" style={{ background: "var(--gradient-primary)" }}>
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Brain className="size-4" /><span className="text-xs uppercase font-medium tracking-wide">AI Reasoning</span>
          </div>
          <p className="text-base leading-relaxed">
            <span className="font-semibold">{farmer.name}</span> shows a <span className="font-semibold">22% milk yield decline</span> over the last 30 days, combined with reported low silage reserves heading into the dry season. The pattern matches the energy-deficit cluster, not disease. We recommend supplementing dairy meal immediately while introducing silage conservation as a structural fix.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Confidence 84%</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Signals: 4 visits · 2 milk reports</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Cluster match: dry-season feed gap</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><AlertTriangle className="size-4 text-accent" /> Conditions detected</h3>
          <ul className="space-y-2">
            {farmer.issues.map((i: typeof farmer.issues[number]) => (
              <li key={i.id} className="flex items-start justify-between border border-border rounded-lg p-3">
                <div><div className="font-medium text-sm">{i.title}</div><div className="text-xs text-muted-foreground">{i.description}</div></div>
                <PriorityBadge priority={i.severity} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Droplets className="size-4 text-primary" /> Key metrics</h3>
          <div className="grid grid-cols-2 gap-3">
            {["Production trend", "Body condition", "Feed reserves", "Vaccination"].map((m, i) => (
              <div key={m} className="rounded-lg bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground">{m}</div>
                <div className="font-semibold text-sm mt-1">{["Declining", "Below target", "&lt; 2 weeks", "Current"][i]}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm mt-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles className="size-4 text-primary" /> Suggested actions</h3>
        <ul className="space-y-3">
          {recs.map(r => (
            <li key={r.id} className="border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-medium">{r.title}</div>
                  <p className="text-sm text-muted-foreground mt-1">{r.reasoning}</p>
                  <p className="text-xs text-primary mt-2 flex items-center gap-1"><CheckCircle2 className="size-3.5" />Expected: {r.expectedOutcome}</p>
                </div>
                <PriorityBadge priority={r.priority} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
