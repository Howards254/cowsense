import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle, CalendarClock, Lightbulb, Package, Users, Droplets,
  TrendingUp, ArrowRight, Brain,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/cards/StatsCard";
import { ChartCard } from "@/components/cards/ChartCard";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { dashboardService } from "@/services/dashboardService";
import { followupService } from "@/services/followupService";
import { recommendationService } from "@/services/recommendationService";
import { farmerService } from "@/services/farmerService";
import { relativeDay } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · CowSense AI" },
      { name: "description", content: "Turning farmer data into action — AI-powered farmer intelligence for extension agents." },
    ],
  }),
  component: DashboardPage,
});

const PRIORITY_COLORS = ["hsl(0 70% 55%)", "hsl(35 85% 55%)", "hsl(178 55% 35%)", "hsl(220 10% 65%)"];

function DashboardPage() {
  const { data: stats } = useQuery({ queryKey: ["dashboard", "stats"], queryFn: () => dashboardService.getStats() });
  const { data: priorityDist } = useQuery({ queryKey: ["dashboard", "priority"], queryFn: () => dashboardService.getPriorityDistribution() });
  const { data: farmerTrend } = useQuery({ queryKey: ["dashboard", "farmerTrend"], queryFn: () => dashboardService.getFarmerTrend() });
  const { data: inputTrend } = useQuery({ queryKey: ["dashboard", "inputTrend"], queryFn: () => dashboardService.getInputDemandTrend() });
  const { data: countyDemand } = useQuery({ queryKey: ["dashboard", "countyDemand"], queryFn: () => dashboardService.getCountyDemand() });
  const { data: followUps = [] } = useQuery({ queryKey: ["followups"], queryFn: () => followupService.list() });
  const { data: recommendations = [] } = useQuery({ queryKey: ["recommendations"], queryFn: () => recommendationService.list() });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmers"], queryFn: () => farmerService.list() });

  const s = stats ?? { highPriorityFarmers: 0, pendingFollowUps: 0, recommendationsIssued: 0, inputAlerts: 0, farmersReached: 0, avgMilkProduction: 0 };
  const todays = followUps.filter(f => f.status !== "completed").slice(0, 4);
  const recentRecs = recommendations.slice(0, 3);
  const urgent = farmers.filter(f => f.priority === "critical" || f.priority === "high").slice(0, 4);

  return (
    <PageContainer
      title="Good morning, Brian"
      description="Here's where your attention is needed today."
      actions={
        <Button asChild>
          <Link to="/intelligence">
            <Brain className="size-4 mr-1.5" /> Open intelligence
          </Link>
        </Button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        <StatsCard label="High priority" value={s.highPriorityFarmers} icon={AlertTriangle} tone="danger" hint="needs visit" />
        <StatsCard label="Pending follow-ups" value={s.pendingFollowUps} icon={CalendarClock} tone="warning" />
        <StatsCard label="Recommendations" value={s.recommendationsIssued} icon={Lightbulb} tone="primary" hint="issued" />
        <StatsCard label="Input alerts" value={s.inputAlerts} icon={Package} tone="warning" />
        <StatsCard label="Farmers reached" value={s.farmersReached} icon={Users} tone="success" />
        <StatsCard label="Avg milk / cow" value={`${s.avgMilkProduction}L`} icon={Droplets} tone="primary" hint="last 14 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <ChartCard title="Priority distribution" description="Across all active farmers">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priorityDist} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                {priorityDist?.map((_, i) => <Cell key={i} fill={PRIORITY_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Farmer activity trend" description="Active vs flagged, last 8 weeks">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={farmerTrend}>
              <defs>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(178 55% 35%)" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="hsl(178 55% 35%)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="active" stroke="hsl(178 55% 35%)" fill="url(#gActive)" />
              <Area type="monotone" dataKey="flagged" stroke="hsl(35 85% 55%)" fill="hsl(35 85% 55% / 0.2)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="County distribution" description="Farmers per county">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countyDemand} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="county" type="category" width={80} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="farmers" fill="hsl(178 55% 35%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Input demand trends" description="Demand signals across the cluster">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={inputTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="silage" stroke="hsl(178 55% 35%)" fill="hsl(178 55% 35% / 0.25)" />
            <Area type="monotone" dataKey="dairyMeal" stroke="hsl(85 70% 45%)" fill="hsl(85 70% 45% / 0.25)" />
            <Area type="monotone" dataKey="vaccines" stroke="hsl(35 85% 55%)" fill="hsl(35 85% 55% / 0.25)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Today's follow-ups</h3>
            <Link to="/follow-ups" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {todays.map(f => (
              <li key={f.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{f.farmerName}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.purpose}</div>
                </div>
                <span className={`text-xs shrink-0 ${f.status === "overdue" ? "text-destructive" : "text-muted-foreground"}`}>
                  {relativeDay(f.dueDate)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Recent recommendations</h3>
            <Link to="/recommendations" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {recentRecs.map(r => (
              <li key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-sm">{r.title}</div>
                  <PriorityBadge priority={r.priority} />
                </div>
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{r.reasoning}</div>
                <div className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <TrendingUp className="size-3" /> {r.farmerCount} farmers
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Urgent farmer alerts</h3>
            <Link to="/farmers" className="text-xs text-primary inline-flex items-center gap-1">
              View all <ArrowRight className="size-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {urgent.map(f => (
              <li key={f.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <Link to="/farmers/$id" params={{ id: f.id }} className="font-medium text-sm hover:text-primary">
                    {f.name}
                  </Link>
                  <PriorityBadge priority={f.priority} />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{f.county} · {f.issues.length} open issues</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}
