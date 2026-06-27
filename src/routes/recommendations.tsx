import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, CheckCircle2, Calendar } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { recommendationService } from "@/services/recommendationService";
import { dashboardService } from "@/services/dashboardService";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations · CowSense AI" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { data: recommendations = [] } = useQuery({ queryKey: ["recommendations"], queryFn: () => recommendationService.list() });
  const { data: inputs = [] } = useQuery({ queryKey: ["inputs"], queryFn: () => dashboardService.getCountyDemand().then(() => [] as { id: string; name: string }[]) });

  return (
    <PageContainer title="Recommendations" description="AI-generated actions cleared for issue to your farmers.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map(r => {
          return (
            <article key={r.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{r.title}</h3>
                <PriorityBadge priority={r.priority} />
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex-1">{r.reasoning}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground"><Users className="size-4" />{r.farmerCount} farmers</div>
                <div className="flex items-center gap-2 text-primary"><CheckCircle2 className="size-4" />{r.expectedOutcome}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline">View details</Button>
                <Button size="sm" variant="ghost"><Calendar className="size-4 mr-1.5" />Schedule follow-up</Button>
              </div>
            </article>
          );
        })}
      </div>
    </PageContainer>
  );
}
