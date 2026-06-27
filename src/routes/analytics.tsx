import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { PageContainer } from "@/components/layout/PageContainer";
import { ChartCard } from "@/components/cards/ChartCard";
import { analyticsService } from "@/services/analyticsService";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics · CowSense AI" }] }),
  component: AnalyticsPage,
});

const COLORS = ["hsl(0 70% 55%)", "hsl(35 85% 55%)", "hsl(178 55% 35%)", "hsl(220 10% 65%)"];

function AnalyticsPage() {
  const { data: farmerTrend } = useQuery({ queryKey: ["analytics", "farmerTrend"], queryFn: () => analyticsService.farmerTrend() });
  const { data: adoptionTrend } = useQuery({ queryKey: ["analytics", "adoptionTrend"], queryFn: () => analyticsService.adoptionTrend() });
  const { data: inputDemandTrend } = useQuery({ queryKey: ["analytics", "inputDemandTrend"], queryFn: () => analyticsService.inputDemandTrend() });
  const { data: countyDemand } = useQuery({ queryKey: ["analytics", "countyDemand"], queryFn: () => analyticsService.countyDemand() });
  const { data: priorityDist } = useQuery({ queryKey: ["analytics", "priorityDist"], queryFn: () => analyticsService.priorityDistribution() });

  return (
    <PageContainer title="Analytics" description="Outcomes across counties, cohorts, and recommendations.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Farmer growth" description="Active vs flagged">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={farmerTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Line type="monotone" dataKey="active" stroke="hsl(178 55% 35%)" strokeWidth={2} />
              <Line type="monotone" dataKey="flagged" stroke="hsl(35 85% 55%)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Recommendation adoption" description="Issued vs adopted">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={adoptionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Bar dataKey="issued" fill="hsl(178 55% 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="adopted" fill="hsl(85 70% 45%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Input demand trends" description="6-month">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inputDemandTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Area type="monotone" dataKey="silage" stroke="hsl(178 55% 35%)" fill="hsl(178 55% 35% / 0.3)" />
              <Area type="monotone" dataKey="dairyMeal" stroke="hsl(85 70% 45%)" fill="hsl(85 70% 45% / 0.3)" />
              <Area type="monotone" dataKey="vaccines" stroke="hsl(35 85% 55%)" fill="hsl(35 85% 55% / 0.3)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="County comparison" description="Demand & farmers per county">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countyDemand}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
              <XAxis dataKey="county" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip /><Legend />
              <Bar dataKey="demand" fill="hsl(178 55% 35%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="farmers" fill="hsl(35 85% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Priority trends" description="Distribution across all farmers">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={priorityDist} dataKey="value" nameKey="name" outerRadius={90}>
                {priorityDist?.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip /><Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </PageContainer>
  );
}
