import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Users, CheckCircle2, Calendar, X } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PriorityBadge } from "@/components/PriorityBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { recommendationService } from "@/services/recommendationService";
import { farmerService } from "@/services/farmerService";
import { followupService } from "@/services/followupService";

export const Route = createFileRoute("/recommendations")({
  head: () => ({ meta: [{ title: "Recommendations · CowSense AI" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const queryClient = useQueryClient();
  const { data: recommendations = [] } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationService.list(),
  });
  const { data: farmers = [] } = useQuery({
    queryKey: ["farmers"],
    queryFn: () => farmerService.list(),
  });

  const createFuMutation = useMutation({
    mutationFn: (data: {
      farmerId: string;
      recommendationId: string;
      purpose: string;
      dueDate: string;
    }) => followupService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followups"] });
      setDialogOpen(false);
      setNewFollowUp({ farmerId: "", dueDate: "", purpose: "" });
      toast.success("Follow-up scheduled");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [newFollowUp, setNewFollowUp] = useState({ farmerId: "", dueDate: "", purpose: "" });
  const [detailRecId, setDetailRecId] = useState<string | null>(null);

  const { data: detailRec } = useQuery({
    queryKey: ["recommendation", detailRecId],
    queryFn: () => recommendationService.getById(detailRecId!),
    enabled: !!detailRecId,
  });

  return (
    <PageContainer
      title="Recommendations"
      description="AI-generated actions cleared for issue to your farmers."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendations.map((r) => {
          return (
            <article
              key={r.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{r.title}</h3>
                <PriorityBadge priority={r.priority} />
              </div>
              <p className="text-sm text-muted-foreground mt-2 flex-1">{r.reasoning}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="size-4" />
                  {r.farmerCount} farmers
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="size-4" />
                  {r.expectedOutcome}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setDetailRecId(r.id)}>
                  View details
                </Button>
                <Dialog
                  open={dialogOpen && selectedRecId === r.id}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedRecId(r.id);
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost">
                      <Calendar className="size-4 mr-1.5" />
                      Schedule follow-up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule follow-up</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newFollowUp.farmerId && newFollowUp.dueDate && newFollowUp.purpose) {
                          createFuMutation.mutate({ ...newFollowUp, recommendationId: r.id });
                        }
                      }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label>Farmer</Label>
                        <Select
                          value={newFollowUp.farmerId}
                          onValueChange={(v) => setNewFollowUp({ ...newFollowUp, farmerId: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select farmer" />
                          </SelectTrigger>
                          <SelectContent>
                            {farmers.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.name} · {f.county}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Due date</Label>
                        <Input
                          type="date"
                          value={newFollowUp.dueDate}
                          onChange={(e) =>
                            setNewFollowUp({ ...newFollowUp, dueDate: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Purpose</Label>
                        <Input
                          value={newFollowUp.purpose}
                          onChange={(e) =>
                            setNewFollowUp({ ...newFollowUp, purpose: e.target.value })
                          }
                          placeholder="e.g. Check feed adoption"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={createFuMutation.isPending}
                      >
                        {createFuMutation.isPending ? "Saving..." : "Save follow-up"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </article>
          );
        })}
      </div>

      <Dialog
        open={!!detailRecId}
        onOpenChange={(open) => {
          if (!open) setDetailRecId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailRec?.title ?? "Loading..."}</DialogTitle>
          </DialogHeader>
          {detailRec ? (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{detailRec.reasoning}</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground">Priority</span>
                  <PriorityBadge priority={detailRec.priority} />
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <p className="font-medium capitalize">{detailRec.status}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Farmers</span>
                  <p className="font-medium">{detailRec.farmerCount}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected</span>
                  <p className="font-medium">{detailRec.expectedOutcome}</p>
                </div>
              </div>
              {detailRec.farmerIds?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Assigned to farmers</p>
                  <ul className="space-y-1">
                    {detailRec.farmerIds.map((fid: string) => (
                      <li key={fid} className="flex items-center gap-2 text-sm">
                        <Users className="size-3.5 text-muted-foreground" />
                        {farmers.find((f) => f.id === fid)?.name ?? fid}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {detailRec.followUps?.length > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">Follow-ups</p>
                  <ul className="space-y-1">
                    {detailRec.followUps.map(
                      (fu: { id: string; status: string; dueDate: string }) => (
                        <li key={fu.id} className="flex items-center gap-2 text-sm">
                          <Calendar className="size-3.5 text-muted-foreground" />
                          {fu.dueDate} · <span className="capitalize">{fu.status}</span>
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading...</p>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
