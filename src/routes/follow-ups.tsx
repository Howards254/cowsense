import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Calendar, List, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/cards/StatsCard";
import { Button } from "@/components/ui/button";
import { followupService } from "@/services/followupService";
import { formatDate, relativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/follow-ups")({
  head: () => ({ meta: [{ title: "Follow Ups · CowSense AI" }] }),
  component: FollowUpsPage,
});

function FollowUpsPage() {
  const queryClient = useQueryClient();
  const { data: followUps = [] } = useQuery({ queryKey: ["followups"], queryFn: () => followupService.list() });
  const [view, setView] = useState<"list" | "timeline">("list");
  const completeMutation = useMutation({
    mutationFn: (id: string) => followupService.complete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["followups"] }),
  });
  const upcoming = followUps.filter(f => f.status === "scheduled").length;
  const overdue = followUps.filter(f => f.status === "overdue").length;
  const completed = followUps.filter(f => f.status === "completed").length;

  return (
    <PageContainer
      title="Follow Ups"
      description="Stay on top of every commitment to your farmers."
      actions={
        <div className="inline-flex border border-border rounded-md p-0.5">
          <button onClick={() => setView("list")} className={cn("px-3 py-1.5 rounded text-xs flex items-center gap-1", view === "list" && "bg-primary text-primary-foreground")}><List className="size-3.5" />List</button>
          <button onClick={() => setView("timeline")} className={cn("px-3 py-1.5 rounded text-xs flex items-center gap-1", view === "timeline" && "bg-primary text-primary-foreground")}><Calendar className="size-3.5" />Timeline</button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard label="Upcoming" value={upcoming} icon={Clock} tone="primary" />
        <StatsCard label="Overdue" value={overdue} icon={AlertCircle} tone="danger" />
        <StatsCard label="Completed" value={completed} icon={CheckCircle2} tone="success" />
      </div>

      {view === "list" ? (
        <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border overflow-hidden">
          {followUps.map(f => (
            <div key={f.id} className="p-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link to="/farmers/$id" params={{ id: f.farmerId }} className="font-medium hover:text-primary">{f.farmerName}</Link>
                  <span className="text-xs text-muted-foreground">· {f.county}</span>
                </div>
                <div className="text-sm text-muted-foreground mt-0.5 truncate">{f.purpose}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={cn("text-xs px-2 py-0.5 rounded", f.status === "overdue" && "bg-destructive/10 text-destructive", f.status === "completed" && "bg-secondary/30 text-secondary-foreground", f.status === "scheduled" && "bg-primary/10 text-primary")}>{relativeDay(f.dueDate)}</span>
                <Button size="sm" variant="ghost" onClick={() => completeMutation.mutate(f.id)} disabled={completeMutation.isPending}>{completeMutation.isPending ? "..." : "Complete"}</Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ol className="relative border-l-2 border-border ml-3 space-y-4">
          {followUps.map(f => (
            <li key={f.id} className="pl-5 relative">
              <span className={cn("absolute -left-[9px] top-2 size-4 rounded-full border-2 border-background", f.status === "overdue" ? "bg-destructive" : f.status === "completed" ? "bg-secondary" : "bg-primary")} />
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-xs text-muted-foreground">{formatDate(f.dueDate)}</div>
                <div className="font-medium text-sm">{f.farmerName} — {f.purpose}</div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </PageContainer>
  );
}
