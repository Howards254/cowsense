import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Filter, Brain, Eye } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { farmerService } from "@/services/farmerService";
import { relativeDay } from "@/lib/format";
import type { Priority } from "@/types";

export const Route = createFileRoute("/farmers/")({
  head: () => ({ meta: [{ title: "Farmers · CowSense AI" }] }),
  component: FarmersPage,
});

const counties = ["All", "Nakuru", "Kiambu", "Nyandarua", "Trans Nzoia", "Mombasa"];
const priorities: ("All" | Priority)[] = ["All", "critical", "high", "medium", "low"];

function FarmersPage() {
  const { data: farmers = [] } = useQuery({ queryKey: ["farmers"], queryFn: () => farmerService.list() });
  const [q, setQ] = useState("");
  const [county, setCounty] = useState("All");
  const [priority, setPriority] = useState<typeof priorities[number]>("All");

  const filtered = useMemo(() => farmers.filter(f =>
    (county === "All" || f.county === county) &&
    (priority === "All" || f.priority === priority) &&
    (q === "" || f.name.toLowerCase().includes(q.toLowerCase()))
  ), [q, county, priority, farmers]);

  return (
    <PageContainer
      title="Farmers"
      description={`${farmers.length} farmers across ${counties.length - 1} counties`}
      actions={<Button variant="outline" size="sm"><Filter className="size-4 mr-1.5" />Filters</Button>}
    >
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Input placeholder="Search farmers…" value={q} onChange={e => setQ(e.target.value)} className="md:max-w-sm" />
        <div className="flex gap-2 flex-wrap">
          <select value={county} onChange={e => setCounty(e.target.value)} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            {counties.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)} className="h-9 rounded-md border border-input bg-background px-3 text-sm capitalize">
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No farmers match these filters" description="Try clearing a filter or searching by name." />
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Farmer</th>
                  <th className="text-left font-medium px-4 py-3">County</th>
                  <th className="text-left font-medium px-4 py-3">Priority</th>
                  <th className="text-left font-medium px-4 py-3">Issues</th>
                  <th className="text-left font-medium px-4 py-3">Avg milk</th>
                  <th className="text-left font-medium px-4 py-3">Next follow-up</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(f => (
                  <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{f.name}</div>
                      <div className="text-xs text-muted-foreground">{f.subCounty} · {f.farmSizeAcres} ac</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{f.county}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={f.priority} /></td>
                    <td className="px-4 py-3 tabular-nums">{f.issues.length}</td>
                    <td className="px-4 py-3 tabular-nums">{f.avgMilkLitres}L</td>
                    <td className="px-4 py-3 text-muted-foreground">{relativeDay(f.nextFollowUp)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link to="/farmers/$id" params={{ id: f.id }}><Eye className="size-4" /></Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon">
                          <Link to="/intelligence"><Brain className="size-4" /></Link>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
