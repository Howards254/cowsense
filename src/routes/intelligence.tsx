import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Brain, Sparkles, AlertTriangle, CheckCircle2, Droplets, ChevronDown } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import { intelligenceService } from "@/services/intelligenceService";
import { farmerService } from "@/services/farmerService";
import { recommendationService } from "@/services/recommendationService";
import type { Farmer } from "@/types";

export const Route = createFileRoute("/intelligence")({
  head: () => ({ meta: [{ title: "Farmer Intelligence · CowSense AI" }] }),
  component: IntelligencePage,
});

function IntelligencePage() {
  const queryClient = useQueryClient();
  const [selectedFarmerId, setSelectedFarmerId] = useState<string | null>(null);

  const { data: farmers = [] } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => farmerService.list(),
  });

  const { data: reasoning, isFetching: reasoningLoading } = useQuery({
    queryKey: ["intelligence", "reasoning", selectedFarmerId],
    queryFn: () => intelligenceService.prioritization(selectedFarmerId!),
    enabled: !!selectedFarmerId,
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationService.list(),
  });

  const sortedFarmers = [...farmers].sort(
    (a, b) => (b.priorityScore ?? 0) - (a.priorityScore ?? 0),
  );

  const selectedFarmer = farmers.find((f) => f.id === selectedFarmerId) ?? null;

  const { data: fullFarmer } = useQuery({
    queryKey: ["farmer", selectedFarmerId],
    queryFn: () => farmerService.getById(selectedFarmerId!),
    enabled: !!selectedFarmerId,
  });

  const issues = fullFarmer?.issues ?? selectedFarmer?.issues ?? [];
  const diseases = fullFarmer?.diseases ?? [];
  const herd = fullFarmer?.herd ?? selectedFarmer?.herd ?? { totalCows: 0 };
  const adoptionScore = fullFarmer?.adoptionScore ?? selectedFarmer?.adoptionScore ?? 0;

  const recIds = selectedFarmer?.recommendations ?? [];
  const farmerRecs = recommendations.filter((r) => recIds.includes(r.id));

  return (
    <PageContainer
      title="Farmer Intelligence"
      description="AI-generated decision support for your farmers."
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (selectedFarmerId) {
              queryClient.invalidateQueries({
                queryKey: ["intelligence", "reasoning", selectedFarmerId],
              });
            }
          }}
        >
          <Sparkles className="size-4 mr-1.5" />
          Regenerate
        </Button>
      }
    >
      <div className="relative mb-4">
        <select
          value={selectedFarmerId ?? ""}
          onChange={(e) => setSelectedFarmerId(e.target.value || null)}
          className="w-full md:w-80 appearance-none rounded-xl border border-border bg-card px-4 py-3 pr-10 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a farmer...</option>
          {sortedFarmers.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} · {f.county} · Score {f.priorityScore}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      </div>

      {!selectedFarmer && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
          <Brain className="size-12 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a farmer above to view AI-generated intelligence.
          </p>
        </div>
      )}

      {selectedFarmer && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm xl:col-span-1">
              <div className="text-xs text-muted-foreground uppercase">Subject</div>
              <h2 className="mt-1 text-xl font-semibold">{selectedFarmer.name}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedFarmer.county} · {selectedFarmer.farmSizeAcres} acres
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">Priority</div>
                  <PriorityBadge
                    priority={
                      reasoning?.priority ??
                      (selectedFarmer.priorityScore > 75
                        ? "critical"
                        : selectedFarmer.priorityScore > 50
                          ? "high"
                          : "medium")
                    }
                  />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Score</div>
                  <div className="font-semibold">{selectedFarmer.priorityScore}/100</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Avg milk</div>
                  <div className="font-semibold">{selectedFarmer.avgMilkLitres}L</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Experience</div>
                  <div className="font-semibold">{selectedFarmer.dairyExperienceYears}yrs</div>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-5 shadow-sm xl:col-span-2 text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Brain className="size-4" />
                <span className="text-xs uppercase font-medium tracking-wide">AI Reasoning</span>
              </div>
              {reasoningLoading ? (
                <p className="text-base leading-relaxed opacity-80">Analyzing farmer data...</p>
              ) : reasoning ? (
                <>
                  <p className="text-base leading-relaxed">{reasoning.reasoning}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                      Confidence {reasoning.priorityScore}%
                    </span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                      Factors: {reasoning.factors.length}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-base leading-relaxed">
                  {selectedFarmer.name} has a priority score of {selectedFarmer.priorityScore}
                  /100. {issues.length} active issues detected.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="size-4 text-accent" /> Conditions detected
              </h3>
              <ul className="space-y-2">
                {issues.length > 0 ? (
                  issues.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-start justify-between border border-border rounded-lg p-3"
                    >
                      <div>
                        <div className="font-medium text-sm">{i.title}</div>
                        <div className="text-xs text-muted-foreground">{i.description}</div>
                      </div>
                      <PriorityBadge priority={i.severity} />
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No active issues.</p>
                )}
              </ul>
            </section>

            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Droplets className="size-4 text-primary" /> Key metrics
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Adoption score</div>
                  <div className="font-semibold text-sm mt-1">{adoptionScore}/100</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Disease risks</div>
                  <div className="font-semibold text-sm mt-1">{diseases.length} flagged</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Active issues</div>
                  <div className="font-semibold text-sm mt-1">{issues.length}</div>
                </div>
                <div className="rounded-lg bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Herd size</div>
                  <div className="font-semibold text-sm mt-1">{herd.totalCows} cows</div>
                </div>
              </div>
            </section>
          </div>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm mt-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> Suggested actions
            </h3>
            {farmerRecs.length > 0 ? (
              <ul className="space-y-3">
                {farmerRecs.map((r) => (
                  <li key={r.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        {r.expectedOutcome && (
                          <p className="text-xs text-primary mt-2 flex items-center gap-1">
                            <CheckCircle2 className="size-3.5" />
                            Expected: {r.expectedOutcome}
                          </p>
                        )}
                      </div>
                      <PriorityBadge priority={r.priority} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recommendations available.</p>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
