import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarPlus, MapPin, ClipboardCheck } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { visitService } from "@/services/visitService";
import { farmerService } from "@/services/farmerService";
import { formatDate, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/visits")({
  head: () => ({ meta: [{ title: "Visits · CowSense AI" }] }),
  component: VisitsPage,
});

function VisitsPage() {
  const { data: visits = [] } = useQuery({ queryKey: ["visits"], queryFn: () => visitService.list() });
  const { data: farmers = [] } = useQuery({ queryKey: ["farmers"], queryFn: () => farmerService.list() });

  const scheduled = visits.filter(v => v.status === "scheduled");
  const recent = visits.filter(v => v.status === "completed");

  return (
    <PageContainer
      title="Visits"
      description="Plan and log field visits."
      actions={<Button size="sm"><CalendarPlus className="size-4 mr-1.5" />Log visit</Button>}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Scheduled" items={scheduled} farmers={farmers} />
        <Section title="Recent visits" items={recent} farmers={farmers} />
      </div>
    </PageContainer>
  );
}

function Section({ title, items, farmers }: { title: string; items: typeof import("@/types").Visit[]; farmers: { id: string; name: string; county: string }[] }) {
  return (
    <section>
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {items.map(v => {
          const farmer = farmers.find(f => f.id === v.farmerId);
          return (
            <div key={v.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link to="/farmers/$id" params={{ id: v.farmerId }} className="font-medium hover:text-primary">{farmer?.name}</Link>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3" /> {farmer?.county}
                  </div>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded capitalize", v.status === "completed" ? "bg-secondary/30 text-secondary-foreground" : "bg-primary/10 text-primary")}>{v.status}</span>
              </div>
              {v.notes && <p className="text-sm text-muted-foreground mt-2 flex gap-2"><ClipboardCheck className="size-4 shrink-0 text-primary" />{v.notes}</p>}
              <div className="mt-3 text-xs text-muted-foreground">{formatDate(v.scheduledFor)} · {relativeDay(v.scheduledFor)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
