import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, Minus, Package, MapPin } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChartCard } from "@/components/cards/ChartCard";
import { intelligenceService } from "@/services/intelligenceService";
import type { TotalInputDemand, CountyInputSummary } from "@/types";

export const Route = createFileRoute("/inputs")({
  head: () => ({ meta: [{ title: "Input Intelligence · CowSense AI" }] }),
  component: InputsPage,
});

const trendIcon = { up: TrendingUp, down: TrendingDown, stable: Minus } as const;
const trendTone = { up: "text-secondary-foreground", down: "text-destructive", stable: "text-muted-foreground" } as const;

function InputsPage() {
  const { data: inputDemand } = useQuery({
    queryKey: ["intelligence", "inputDemand"],
    queryFn: () => intelligenceService.inputDemand(),
  });

  const totalDemand = inputDemand?.totalDemand ?? [];
  const countySummary = inputDemand?.countySummary ?? [];

  const countyChartData = countySummary.map((c: CountyInputSummary) => ({
    county: c.county,
    demand: c.demand,
  }));

  return (
    <PageContainer title="Input Intelligence" description="Where demand is rising and which inputs to prioritize.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="County demand" description="Total input demand by county">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="county" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="demand" fill="hsl(178 55% 35%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="County breakdown" description="Farmers and demand per county">
          <div className="space-y-2">
            {countySummary.map((c: CountyInputSummary) => (
              <Link
                key={c.county}
                to="/inputs"
                className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{c.county}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {c.demand} inputs · {c.farmers} farmers
                </div>
              </Link>
            ))}
          </div>
        </ChartCard>
      </div>

      <h3 className="font-semibold mb-3">Top inputs needed</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {totalDemand.map((item: TotalInputDemand) => {
          const Icon = trendIcon[item.trend];
          return (
            <div key={item.inputId} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <Package className="size-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs ${trendTone[item.trend]}`}>
                  <Icon className="size-4" /> {item.trend}
                </div>
              </div>
              <div className="mt-3 font-semibold">{item.inputName}</div>
              <div className="text-xs text-muted-foreground capitalize">{item.category}</div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold tabular-nums">{item.totalDemand}</div>
                <div className="text-xs text-muted-foreground">requests</div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}