import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Package } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChartCard } from "@/components/cards/ChartCard";
import { dashboardService } from "@/services/dashboardService";

export const Route = createFileRoute("/inputs")({
  head: () => ({ meta: [{ title: "Input Intelligence · CowSense AI" }] }),
  component: InputsPage,
});

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus } as const;
const trendTone = { up: "text-secondary-foreground", down: "text-destructive", stable: "text-muted-foreground" } as const;

function InputsPage() {
  const { data: countyDemand = [] } = useQuery({ queryKey: ["dashboard", "countyDemand"], queryFn: () => dashboardService.getCountyDemand() });
  const { data: inputDemandTrend } = useQuery({ queryKey: ["dashboard", "inputTrend"], queryFn: () => dashboardService.getInputDemandTrend() });

  return (
    <PageContainer title="Input Intelligence" description="Where demand is rising and which inputs to prioritize.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="County demand heatmap" description="Total input requests by county">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countyDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="county" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="demand" fill="hsl(178 55% 35%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Demand forecast" description="6-month rolling forecast">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inputDemandTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="silage" stroke="hsl(178 55% 35%)" fill="hsl(178 55% 35% / 0.3)" />
              <Area type="monotone" dataKey="dairyMeal" stroke="hsl(85 70% 45%)" fill="hsl(85 70% 45% / 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <h3 className="font-semibold mb-3">Top inputs needed</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {countyDemand.map((item, idx) => {
          const trend = idx % 3 === 0 ? "up" as const : idx % 3 === 1 ? "down" as const : "stable" as const;
          const Icon = trendIcon[trend];
          return (
            <div key={item.county} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Package className="size-5" /></div>
                <div className={`flex items-center gap-1 text-xs ${trendTone[trend]}`}>
                  <Icon className="size-4" /> {trend}
                </div>
              </div>
              <div className="mt-3 font-semibold capitalize">{item.county}</div>
              <div className="text-xs text-muted-foreground">County demand</div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold tabular-nums">{item.demand}</div>
                <div className="text-xs text-muted-foreground">requests</div>
              </div>
              <div className="mt-2 text-sm tabular-nums">{item.farmers} farmers</div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
